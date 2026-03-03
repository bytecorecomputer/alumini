import { collection, doc, setDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firestore";

import Papa from 'papaparse';

/**
 * Parses a CSV string into an array of objects.
 * Uses PapaParse to handle complex CSV rules and duplicate columns correctly.
 */
function parseCSV(str) {
    const parsed = Papa.parse(str, { skipEmptyLines: true });

    if (parsed.errors.length) {
        console.warn("PapaParse Warnings/Errors:", parsed.errors);
    }

    const rows = parsed.data;
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim());
    const dataObjects = [];

    for (let i = 1; i < rows.length; i++) {
        const rowData = rows[i];
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            const h = headers[j];
            const val = rowData[j] ? rowData[j].trim() : '';
            if (obj[h] !== undefined) {
                if (Array.isArray(obj[h])) {
                    obj[h].push(val);
                } else {
                    obj[h] = [obj[h], val];
                }
            } else {
                obj[h] = val;
            }
        }
        dataObjects.push(obj);
    }

    return dataObjects;
}

/**
 * Extracts fee and date from a string like "100 (20-05-2024)" or "450 150 (20-11-2025)"
 * Returns an array of installment objects or null if invalid.
 */
function parseInstallment(str) {
    if (!str || str.trim() === '') return [];

    // Match format: 100 (20-05-2024)
    // Or format with text: Free 500 (02-12-2025)

    // First, try standard regex: (amount) (date string)
    // We can just extract the date inside parentheses and take all the preceding numbers/text as comment/amount.
    // However, the cleanest way: look for `(DD-MM-YYYY)`
    const dateRegex = /\(([^)]+)\)/;
    const dateMatch = str.match(dateRegex);

    if (!dateMatch) return [];

    const dateStr = dateMatch[1]; // e.g., "20-05-2024"
    const amountStr = str.replace(dateRegex, '').trim(); // e.g., "100" or "450 150" or "Free"

    // If "Free", treat as 0 amount
    if (amountStr.toLowerCase() === 'free') {
        return [{ amount: 0, date: dateStr, status: 'paid', note: 'Free' }];
    }

    // Try to extract numerical amount
    const numbers = amountStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        // If there are multiple numbers e.g. "450 150", sum them or take the first?
        // Let's sum them as total installment paid on that date
        const totalAmount = numbers.reduce((acc, curr) => acc + parseInt(curr, 10), 0);
        return [{ amount: totalAmount, date: dateStr, status: 'paid' }];
    }

    return [];
}

/**
 * Normalizes dates from DD-MM-YYYY to YYYY-MM-DD
 */
function normalizeDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        if (parts[0].length === 4) return dateStr; // Already YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert DD-MM-YYYY to YYYY-MM-DD
    }
    return dateStr;
}

/**
 * Normalizes student status
 */
function normalizeStatus(status) {
    const s = status.toLowerCase().trim();
    if (s.includes('pass') || s.includes('paas')) return 'pass';
    if (s.includes('paid')) return 'paid';
    return 'unpaid';
}

export async function syncFromGoogleSheet(csvUrl, centerName = 'Nariyawal') {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error("Failed to fetch CSV from Google Sheets");
        const csvText = await response.text();

        const data = parseCSV(csvText);
        if (data.length === 0) return { success: false, message: "No data found in the sheet" };

        let processedCount = 0;
        let batch = writeBatch(db);
        let batchCount = 0;

        for (const row of data) {
            const regId = row['Registration'] || row['Registration NO.'];
            if (!regId || regId === '' || isNaN(regId)) continue; // Skip invalid or missing registration IDs

            const student = {
                registration: regId.toString(),
                fullName: row['Student Name ']?.trim() || row['Student Name']?.trim() || 'Unknown',
                status: normalizeStatus((row['Status '] || row['Status'] || 'unpaid')),
                course: row['Course ']?.trim() || row['Course']?.trim() || '',
                fatherName: row['Fathers Name ']?.trim() || row['Fathers Name']?.trim() || '',
                mobile: row['Mob. No.']?.trim() || '',
                address: row['Address ']?.trim() || row['Address']?.trim() || '',
                admissionDate: normalizeDate((row['Admission Date'] || '').trim()),
                registrationFee: parseInt(row['Registration Fee'] || row['Regi. Fee']) || 0,
                totalFees: parseInt(row['Total Fee']) || 0,
                center: centerName, // Defaulting as per parameter
                updatedAt: Date.now()
            };

            // Extract all dynamic "Fee / Date" or "Fee - Date" columns
            let installments = [];
            let totalPaid = 0;

            let feeDateCells = [];
            if (row['Fee / Date']) {
                feeDateCells = Array.isArray(row['Fee / Date']) ? row['Fee / Date'] : [row['Fee / Date']];
            } else if (row['Fee - Date']) {
                feeDateCells = Array.isArray(row['Fee - Date']) ? row['Fee - Date'] : [row['Fee - Date']];
            } else if (row['Fee - Date ']) { // handle potential trailing spaces
                feeDateCells = Array.isArray(row['Fee - Date ']) ? row['Fee - Date '] : [row['Fee - Date ']];
            }

            for (const cellValue of feeDateCells) {
                if (cellValue && cellValue.trim() !== '') {
                    const parsedInstalls = parseInstallment(cellValue.trim());
                    installments = [...installments, ...parsedInstalls];
                }
            }

            // Calculate paidFees from parsed installments
            installments.forEach(inst => {
                totalPaid += inst.amount;
            });

            student.installments = installments;
            student.paidFees = totalPaid;

            // Note: We don't overwrite 'oldPaidFees' to avoid messing up manual balances

            const docRef = doc(db, "students", student.registration);
            batch.set(docRef, student, { merge: true });

            processedCount++;
            batchCount++;

            // Firestore batches are limited to 500 operations
            if (batchCount >= 400) {
                await batch.commit();
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        // Commit remaining
        if (batchCount > 0) {
            await batch.commit();
        }

        return {
            success: true,
            message: `Successfully synchronized ${processedCount} students from Google Sheets.`
        };

    } catch (error) {
        console.error("Google Sheets Sync Error:", error);
        return { success: false, message: error.message };
    }
}
