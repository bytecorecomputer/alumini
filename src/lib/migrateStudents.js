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
    'ADCA+': 12000,
    'DCA': 3600,
    'Typing': 2100,
    'Accounting': 3600,
    'CSC': 3500
};

const parseCSV = (csvText) => {
    const rawLines = csvText.split(/\r?\n/);
    const reconstructedLines = [];
    let currentLine = "";

    // Step 1: Reconstruct rows that span multiple lines
    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        // If line starts with "Number,Number," it's likely a new record (SrNo, Registration)
        // e.g. "249,1159,"
        if (/^\d+,\d+,/.test(line)) {
            if (currentLine) reconstructedLines.push(currentLine);
            currentLine = line;
        } else if (i === 0 && (line.toLowerCase().includes("sr. no.") || line.toLowerCase().includes("registration"))) {
            // Keep header as is
            reconstructedLines.push(line);
        } else if (currentLine) {
            // Continuation of previous row - join with a space to avoid merging words
            currentLine += " " + line;
        } else {
            // First data line if header check fails
            currentLine = line;
        }
    }
    if (currentLine) reconstructedLines.push(currentLine);

    const results = [];
    for (let i = 1; i < reconstructedLines.length; i++) {
        const line = reconstructedLines[i];
        const row = line.split(',');
        if (row.length < 10) continue;

        const registration = row[1]?.trim();
        let fullName = row[2]?.trim();

        // Clean up name (remove " (Change)" or other suffixes)
        fullName = fullName.split('(')[0].trim();

        if (!registration || registration === '-' || !fullName) continue;

        const csvRegistrationFee = row[10]?.trim();
        const oldPaidFees = parseInt(csvRegistrationFee) || 0;

        const installments = [];
        let csvPaidFeesSum = 0;

        // Installments start from index 12
        for (let j = 12; j < row.length; j++) {
            let cell = row[j]?.trim();
            if (!cell || cell === '-' || cell.toLowerCase() === 'unpaid' || cell.toLowerCase() === 'free') continue;

            // Robust regex to capture: "500 (24-05)", "200 (07-07)", "700(28-10)", "350 10-11-2025"
            // Captures amount and anything that looks like a date/note in parentheses or after
            const match = cell.match(/(\d+)\s*[\(\-\s]*([0-9\-/ABC]+.*?)\)?$/i);
            if (match) {
                const amount = parseInt(match[1]);
                let date = match[2].trim();

                // If date is short like "24-05", append current year or keep as is
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

        const course = row[4]?.split('(')[0].trim() || 'N/A';
        const defaultFee = FEE_MAPPING[course] || parseInt(row[11]) || 0;

        const studentData = {
            registration,
            fullName,
            status: row[3]?.split('(')[0].trim().toLowerCase() || 'unpaid',
            course,
            fatherName: row[5]?.trim() || 'N/A',
            mobile: row[6]?.trim() || 'N/A',
            address: row[8]?.trim() || 'N/A',
            admissionDate: row[9]?.trim() || 'N/A',
            totalFees: defaultFee,
            oldPaidFees,
            paidFees: csvPaidFeesSum,
            installments,
            center: "Nariyawal",
            updatedAt: Date.now()
        };

        // Specialized debugging for reported issues
        if (fullName.includes("Ramlakha")) {
            console.log("DEBUG [Ramlakhan Found]:", studentData);
        }

        results.push(studentData);
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

    // Auto-update global stats after migration
    await syncAggregateStats();

    return count;
};

export const syncAggregateStats = async () => {
    console.log("Syncing Aggregate Stats...");
    const snapshot = await getDocs(collection(db, "students"));
    const stats = {
        totalEnrollments: 0,
        thiriyaCount: 0,
        nariyawalCount: 0,
        totalRevenue: 0,
        totalArrears: 0,
        updatedAt: Date.now()
    };

    snapshot.forEach((doc) => {
        const data = doc.data();
        stats.totalEnrollments++;
        if (data.center === 'Thiriya') stats.thiriyaCount++;
        else stats.nariyawalCount++; // Default to Nariyawal

        const paid = (data.paidFees || 0) + (data.oldPaidFees || 0);
        const total = (data.totalFees || 0);
        stats.totalRevenue += paid;
        stats.totalArrears += Math.max(0, total - paid);
    });

    await setDoc(doc(db, "metadata", "coaching_stats"), stats, { merge: true });
    console.log("Stats Synced:", stats);
    return stats;
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
