import { db } from "../firebase/firestore";
import { collection, doc, setDoc, writeBatch, getDoc, getDocs } from "firebase/firestore";

/**
 * Migration Utility for Student Data
 * This is meant to be run once to populate Firestore from the provided CSV data.
 */

// Centralized Fee Configuration
const FEE_MAPPING = {
    'MDCA': 9600,
    'C': 6000,
    'ADCA': 6000,
    'ADCA+': 12000
};

const parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];

    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = line.split(',');
        if (row.length < 12) continue;

        const registration = row[1]?.trim();
        const fullName = row[2]?.trim();
        if (!registration || registration === '-' || !fullName) continue;

        const csvRegistrationFee = row[10]?.trim();
        const oldPaidFees = parseInt(csvRegistrationFee) || 0;

        const installments = [];
        let csvPaidFeesSum = 0;

        // Installments start from index 12
        for (let j = 12; j < row.length; j++) {
            let cell = row[j]?.trim();
            if (!cell || cell === '-') continue;

            const match = cell.match(/(\d+)\s*\((.*?)\)/);
            if (match) {
                const amount = parseInt(match[1]);
                const date = match[2];
                if (!isNaN(amount)) {
                    installments.push({
                        amount,
                        date,
                        installmentNo: 0,
                        note: "Migrated from CSV"
                    });
                    csvPaidFeesSum += amount;
                }
            }
        }

        const course = row[4]?.trim() || 'N/A';
        const defaultFee = FEE_MAPPING[course] || parseInt(row[11]) || 0;

        results.push({
            registration,
            fullName,
            status: row[3]?.trim().toLowerCase() || 'unpaid',
            course,
            fatherName: row[5]?.trim() || 'N/A',
            mobile: row[6]?.trim() || 'N/A',
            address: row[8]?.trim() || 'N/A',
            admissionDate: row[9]?.trim() || 'N/A',
            totalFees: defaultFee,
            oldPaidFees,
            paidFees: csvPaidFeesSum,
            installments,
            updatedAt: Date.now()
        });
    }
    return results;
};

export const runMigration = async (csvText) => {
    console.log("Starting Advanced Migration...");
    const csvStudents = parseCSV(csvText);
    let count = 0;

    for (const student of csvStudents) {
        try {
            const studentRef = doc(db, "students", student.registration);
            const docSnap = await getDoc(studentRef);

            if (docSnap.exists()) {
                const dbData = docSnap.data();

                // Maintain existing course fees if already set manually in app
                delete student.totalFees;

                const existingInst = dbData.installments || [];
                const mergedMap = new Map();
                existingInst.forEach(inst => mergedMap.set(`${inst.date}_${inst.amount}`, inst));
                student.installments.forEach(inst => {
                    const key = `${inst.date}_${inst.amount}`;
                    if (!mergedMap.has(key)) mergedMap.set(key, inst);
                });

                const finalInstallments = Array.from(mergedMap.values());
                finalInstallments.forEach((inst, idx) => inst.installmentNo = idx + 1);
                student.installments = finalInstallments;
                student.paidFees = finalInstallments.reduce((acc, inst) => acc + inst.amount, 0);
            } else {
                student.installments.forEach((inst, idx) => inst.installmentNo = idx + 1);
            }

            await setDoc(studentRef, student, { merge: true });
            count++;
        } catch (err) {
            console.error(`Failed to migrate student ${student.registration}:`, err);
        }
    }
    console.log(`Migration Complete! ${count} students processed.`);
    return count;
};

/**
 * Global Admin Utility: Corrects all fees for existing students and updates course config.
 */
export const applyStandardFees = async () => {
    console.log("Enforcing Global Fee Standardization...");

    // 1. Update Course Configs
    for (const [name, fee] of Object.entries(FEE_MAPPING)) {
        try {
            await setDoc(doc(db, "courses", name), { name, fee, updatedAt: Date.now() }, { merge: true });
        } catch (e) { console.error(`Course config update failed for ${name}:`, e); }
    }

    // 2. Update All Students
    const snapshot = await getDocs(collection(db, "students"));
    const batch = writeBatch(db);
    let updatedCount = 0;

    snapshot.forEach((studentDoc) => {
        const data = studentDoc.data();
        const standardizedFee = FEE_MAPPING[data.course];
        if (standardizedFee && data.totalFees !== standardizedFee) {
            batch.update(studentDoc.ref, { totalFees: standardizedFee, updatedAt: Date.now() });
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        await batch.commit();
        console.log(`Successfully standardized fees for ${updatedCount} students.`);
    }
    return updatedCount;
};
