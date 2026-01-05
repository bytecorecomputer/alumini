import { db } from "../firebase/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { syncAggregateStats } from "./migrateStudents";

/**
 * Specialized Migration Utility for "bytecore thiriya.csv" format.
 */

export const runThiriyaMigration = async (csvText) => {
    console.log("Starting Thiriya Data Migration...");
    const rawLines = csvText.split(/\r?\n/);

    // The CSV has a complex header structure. Data starts from line 4 (index 3).
    // Row 2 (index 1) contains main headers.
    // Row 3 (index 2) contains sub-headers for installments.

    const students = [];

    for (let i = 3; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        const row = line.split(',');
        if (row.length < 8) continue; // Basic check for data row

        const registration = row[3]?.trim(); // Roll No.
        const fullName = row[1]?.trim();    // S - Name
        const fatherName = row[2]?.trim();  // F - Name

        if (!registration || !fullName) continue;

        const course = row[4]?.trim() || "N/A";
        const totalFees = parseInt(row[5]) || 0;
        const admissionDate = row[6]?.trim() || "N/A";
        const address = row[7]?.trim() || "N/A";

        const installments = [];
        let paidFeesSum = 0;

        // Installments start from index 8 (Sep/25 column group)
        // Each month has 3 columns: Reg No (skip), Date, Amount
        for (let j = 8; j < row.length; j += 3) {
            const date = row[j + 1]?.trim();
            const amountCell = row[j + 2]?.trim();

            if (!amountCell || amountCell === '-' || amountCell.toLowerCase() === 'unpaid') continue;

            // Handle multiple amounts in one cell (e.g., "500+500")
            const amounts = amountCell.split('+');
            const dates = date ? date.split('+') : [date || ""];

            amounts.forEach((amt, idx) => {
                const parsedAmt = parseInt(amt);
                if (!isNaN(parsedAmt)) {
                    installments.push({
                        amount: parsedAmt,
                        date: dates[idx] || dates[0] || "N/A",
                        installmentNo: 0, // Will be sorted and numbered later
                        note: "Migrated from Thiriya CSV"
                    });
                    paidFeesSum += parsedAmt;
                }
            });
        }

        students.push({
            registration,
            fullName,
            fatherName,
            course,
            totalFees,
            admissionDate,
            address,
            mobile: "N/A", // Not in CSV
            status: paidFeesSum >= totalFees && totalFees > 0 ? "pass" : "active",
            paidFees: paidFeesSum,
            oldPaidFees: 0, // We treat all CSV data as new installments
            installments,
            center: "Thiriya",
            updatedAt: Date.now()
        });
    }

    let count = 0;
    for (const student of students) {
        try {
            const studentRef = doc(db, "students", student.registration);
            const docSnap = await getDoc(studentRef);

            if (docSnap.exists()) {
                const dbData = docSnap.data();

                // Merge installments
                const existingInst = dbData.installments || [];
                const mergedMap = new Map();

                // Key by date and amount to avoid exact duplicates
                existingInst.forEach(inst => mergedMap.set(`${inst.date}_${inst.amount}`, inst));
                student.installments.forEach(inst => {
                    const key = `${inst.date}_${inst.amount}`;
                    if (!mergedMap.has(key)) mergedMap.set(key, inst);
                });

                const finalInstallments = Array.from(mergedMap.values())
                    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Simple sort attempt

                finalInstallments.forEach((inst, idx) => inst.installmentNo = idx + 1);

                student.installments = finalInstallments;
                student.paidFees = finalInstallments.reduce((acc, inst) => acc + inst.amount, 0);

                // Preserve existing fields not in CSV
                if (dbData.mobile && dbData.mobile !== "N/A") student.mobile = dbData.mobile;
                if (dbData.photoUrl) student.photoUrl = dbData.photoUrl;
            } else {
                student.installments.forEach((inst, idx) => inst.installmentNo = idx + 1);
            }

            await setDoc(studentRef, student, { merge: true });
            count++;
        } catch (err) {
            console.error(`Failed to migrate student ${student.registration}:`, err);
        }
    }

    // Auto-update global stats after migration
    await syncAggregateStats();

    console.log(`Thiriya Migration Complete! ${count} students processed.`);
    return count;
};
