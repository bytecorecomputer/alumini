import { db } from "../firebase/firestore";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";

/**
 * Migration Utility for Student Data
 * This is meant to be run once to populate Firestore from the provided CSV data.
 */

const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Handle commas inside quotes if any (basic CSV parsing)
        const row = lines[i].split(',');
        if (row.length < 10) continue;

        const registration = row[1]?.trim();
        if (!registration) continue;

        const installments = [];
        let paidFees = 0;

        // Parse trailing columns for installments like "800 (11-11-2025)"
        for (let j = 10; j < row.length; j++) {
            const cell = row[j]?.trim();
            if (cell && cell.includes('(')) {
                const amount = parseInt(cell.split(' ')[0]);
                const date = cell.match(/\((.*?)\)/)?.[1];
                if (!isNaN(amount)) {
                    installments.push({ amount, date: date || 'N/A' });
                    paidFees += amount;
                }
            }
        }

        results.push({
            registration,
            fullName: row[2]?.trim(),
            status: row[3]?.trim().toLowerCase(),
            course: row[4]?.trim(),
            fatherName: row[5]?.trim(),
            mobile: row[6]?.trim() || 'N/A',
            address: row[7]?.trim(),
            admissionDate: row[8]?.trim(),
            totalFees: parseInt(row[9]) || 0,
            paidFees: paidFees,
            installments: installments,
            updatedAt: Date.now()
        });
    }
    return results;
};

export const runMigration = async (csvText) => {
    console.log("Starting Migration...");
    const students = parseCSV(csvText);
    const batch = writeBatch(db);
    const studentsRef = collection(db, "students");

    for (const student of students) {
        const studentDoc = doc(studentsRef, student.registration);
        batch.set(studentDoc, student);
    }

    await batch.commit();
    console.log(`Migration Complete! ${students.length} students migrated.`);
    return students.length;
};
