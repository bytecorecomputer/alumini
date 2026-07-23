import { collection, doc, setDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firestore";
import Papa from 'papaparse';
import { normalizeDateToYYYYMMDD } from "./utils";

/**
 * Normalizes numbers by removing commas and extra characters
 */
export function parseCurrency(val) {
    if (!val) return 0;
    const str = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
    return parseInt(str, 10) || 0;
}

/**
 * Normalizes dates from DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD
 */
export function normalizeDate(dateStr) {
    return normalizeDateToYYYYMMDD(dateStr);
}

/**
 * Normalizes student status cleanly
 */
export function normalizeStatus(status) {
    if (!status) return 'unpaid';
    const s = String(status).toLowerCase().trim();
    if (s.includes('pass') || s.includes('paas') || s.includes('complete')) return 'pass';
    if (s.includes('paid')) return 'paid';
    return 'unpaid';
}

/**
 * Robust regex-based installment parser.
 * Handles formats like:
 * - "1000 (13-09-2025)"
 * - "3000  (01-11-2025)"
 * - "500 (17-06-2026" (missing closing parenthesis)
 * - "750 (13-09-2025)"
 * - "Free 500 (02-12-2025)"
 * - "(02-12-2025)"
 */
/**
 * Robust regex-based installment parser.
 * Handles formats like:
 * - "1000 (13-09-2025)"
 * - "3000  (01-11-2025)"
 * - "500 (17-06-2026" (missing closing parenthesis)
 * - "1000 (14-04)" (short date)
 * - "1000" (bare amount in installment column)
 */
export function parseInstallmentText(str, fallbackDate = '') {
    if (!str || typeof str !== 'string' || !str.trim()) return [];

    const clean = str.trim();
    if (clean.toLowerCase() === 'unpaid' || clean.toLowerCase() === '-' || clean === '') return [];

    const results = [];

    // Regex 1: Full Date e.g. 1000 (13-09-2025) or 1000 (13-09-25) or 500 (17-06-2026
    const fullDateRegex = /(\d[\d,]*)\s*\(?\s*([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/g;
    let match;

    while ((match = fullDateRegex.exec(clean)) !== null) {
        const amtStr = match[1].replace(/,/g, '');
        const amt = parseInt(amtStr, 10);
        const rawDate = match[2];

        if (!isNaN(amt) && amt >= 10) {
            results.push({
                amount: amt,
                date: normalizeDateToYYYYMMDD(rawDate),
                status: 'paid'
            });
        }
    }

    if (results.length > 0) return results;

    // Regex 2: Short Date e.g. 1000 (14-04) or 1000 (14/04)
    const shortDateRegex = /(\d[\d,]*)\s*\(?\s*([0-9]{1,2}[-/.][0-9]{1,2})/g;
    while ((match = shortDateRegex.exec(clean)) !== null) {
        const amtStr = match[1].replace(/,/g, '');
        const amt = parseInt(amtStr, 10);
        const rawDate = match[2];

        if (!isNaN(amt) && amt >= 10) {
            const currentYear = new Date().getFullYear();
            const dateWithYear = `${rawDate}-${currentYear}`;
            results.push({
                amount: amt,
                date: normalizeDateToYYYYMMDD(dateWithYear),
                status: 'paid'
            });
        }
    }

    if (results.length > 0) return results;

    // Regex 3: Bare number without date e.g. "1000" or "500" (Must be >= 10)
    const numOnlyMatch = clean.replace(/,/g, '').match(/^\d+$/);
    if (numOnlyMatch) {
        const amt = parseInt(numOnlyMatch[0], 10);
        if (!isNaN(amt) && amt >= 10) {
            results.push({
                amount: amt,
                date: fallbackDate || new Date().toISOString().split('T')[0],
                status: 'paid'
            });
        }
    }

    return results;
}

/**
 * Deep Dynamic Parser for raw TSV/CSV text (pasted directly from Google Sheets or Excel)
 * Traverses every cell across the entire row to extract student info, admission fee, total fee, and installments.
 */
export function parseRawSheetText(text, defaultCenter = 'Thiriya') {
    if (!text || typeof text !== 'string') return [];

    const rawLines = text.split(/\r?\n/);
    const parsedStudents = [];

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        // Split by tab first (Google Sheet paste), or by comma
        let cols = line.includes('\t') ? line.split('\t') : line.split(',');
        cols = cols.map(c => c ? c.trim() : '');

        // Skip header lines
        const firstCol = (cols[0] || '').toLowerCase();
        const secondCol = (cols[1] || '').toLowerCase();
        const thirdCol = (cols[2] || '').toLowerCase();
        if (firstCol.includes('s.no') || firstCol.includes('sr') || secondCol.includes('roll') || secondCol.includes('registration') || thirdCol.includes('student name')) {
            continue;
        }

        const sNo = cols[0] || '';
        let regId = cols[1] || '';
        const fullName = cols[2] || '';
        const rawStatus = cols[3] || '';
        const course = cols[4] || '';
        const fatherName = cols[5] || '';
        const mobile = cols[6] || '';
        const rawAddress = cols[7] || '';

        // If both full name and registration ID are missing, skip row
        if (!fullName && !regId) continue;

        // Auto-generate ID if missing (e.g. for unassigned roll numbers)
        if (!regId || regId === '-' || regId === ' ') {
            const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '');
            regId = `REG_${cleanName || (Date.now() + i)}`;
        }

        // Center Detection
        let detectedCenter = defaultCenter;
        const addrLower = rawAddress.toLowerCase();
        if (addrLower.includes('thiriya')) detectedCenter = 'Thiriya';
        else if (addrLower.includes('manpuriya') || addrLower.includes('munpuriya')) detectedCenter = 'Manpuriya';
        else if (addrLower.includes('naryawal') || addrLower.includes('nariyawal')) detectedCenter = 'Nariyawal';
        else if (addrLower.includes('mohanpur')) detectedCenter = 'Mohanpur';
        else if (addrLower.includes('harharpur')) detectedCenter = 'Harharpur';
        else if (addrLower.includes('parsona')) detectedCenter = 'Parsona';
        else if (rawAddress && rawAddress !== '-') detectedCenter = rawAddress;

        const admissionDateRaw = cols[8] || '';
        const admissionFeeRaw = cols[9] || '';
        const totalFeesRaw = cols[10] || '';

        const student = {
            registration: String(regId).trim(),
            fullName: fullName || 'Unknown Student',
            status: normalizeStatus(rawStatus),
            course: course || 'N/A',
            fatherName: fatherName || '',
            mobile: mobile || '',
            address: rawAddress || '',
            center: detectedCenter,
            admissionDate: normalizeDateToYYYYMMDD(admissionDateRaw),
            admissionFee: parseCurrency(admissionFeeRaw),
            registrationFee: parseCurrency(admissionFeeRaw),
            totalFees: (totalFeesRaw && String(totalFeesRaw).toLowerCase().includes('free')) ? 0 : parseCurrency(totalFeesRaw),
            updatedAt: Date.now()
        };

        // Parse ALL installment columns strictly from Index 11 onwards (Month 1, Month 2, Month 3, Month 4, etc.)
        let installments = [];
        for (let j = 11; j < cols.length; j++) {
            const cellVal = cols[j];
            if (cellVal && cellVal.trim() !== '' && cellVal !== '-' && cellVal.toLowerCase() !== 'unpaid') {
                const parsedInsts = parseInstallmentText(cellVal, student.admissionDate);
                if (parsedInsts.length > 0) {
                    installments = [...installments, ...parsedInsts];
                }
            }
        }

        // Sequence numbering and fee summation
        let totalPaid = 0;
        installments.forEach((inst, idx) => {
            inst.installmentNo = idx + 1;
            totalPaid += inst.amount;
        });

        student.installments = installments;
        student.paidFees = totalPaid;

        parsedStudents.push(student);
    }

    return parsedStudents;
}

/**
 * Parses a CSV string into an array of objects via PapaParse with smart column mapping.
 */
function parseCSV(str) {
    const parsed = Papa.parse(str, { skipEmptyLines: true });

    if (parsed.errors.length) {
        console.warn("PapaParse Warnings/Errors:", parsed.errors);
    }

    const rows = parsed.data;
    if (rows.length < 2) return [];

    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
        const rowStr = rows[i].join('').toLowerCase();
        if (rowStr.includes('student name') || rowStr.includes('registration') || rowStr.includes('course')) {
            headerRowIndex = i;
            break;
        }
    }

    const headers = rows[headerRowIndex].map(h => typeof h === 'string' ? h.trim() : '');
    const dataObjects = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const rowData = rows[i];
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            const h = headers[j];
            if (!h) continue;
            const val = rowData[j] ? (typeof rowData[j] === 'string' ? rowData[j].trim() : String(rowData[j]).trim()) : '';
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

export async function syncFromGoogleSheet(csvUrl, centerName = 'Thiriya') {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error("Failed to fetch CSV from Google Sheets");
        const csvText = await response.text();

        // Check if raw sheet paste format or standard CSV
        let studentsList = [];
        if (csvText.includes('\t') || !csvText.toLowerCase().includes('student name')) {
            studentsList = parseRawSheetText(csvText, centerName);
        }

        if (studentsList.length === 0) {
            // Fallback to PapaParse mapping
            const data = parseCSV(csvText);
            for (const row of data) {
                const regId = row['Registration'] || row['Registration NO.'] || row['Roll No'] || row['Roll No.'] || row['S.No'];
                if (!regId || regId === '') continue;

                const address = row['Address '] || row['Address'] || '';
                let center = centerName;
                if (address.toLowerCase().includes('thiriya')) center = 'Thiriya';
                else if (address.toLowerCase().includes('nariyawal') || address.toLowerCase().includes('naryawal')) center = 'Nariyawal';

                const student = {
                    registration: String(regId).trim(),
                    fullName: row['Student Name ']?.trim() || row['Student Name']?.trim() || 'Unknown',
                    status: normalizeStatus(row['Status '] || row['Status'] || 'unpaid'),
                    course: row['Course ']?.trim() || row['Course']?.trim() || '',
                    fatherName: row['Fathers Name ']?.trim() || row['Fathers Name']?.trim() || '',
                    mobile: row['Mob. No.']?.trim() || row['Mobile']?.trim() || '',
                    address: address.trim(),
                    admissionDate: normalizeDateToYYYYMMDD(row['Admission Date'] || ''),
                    admissionFee: parseCurrency(row['Registration Fee'] || row['Regi. Fee'] || row['Admission Fee']),
                    registrationFee: parseCurrency(row['Registration Fee'] || row['Regi. Fee'] || row['Admission Fee']),
                    totalFees: parseCurrency(row['Total Fee']),
                    center: center,
                    updatedAt: Date.now()
                };

                // Installments extraction
                let installments = [];
                Object.keys(row).forEach(key => {
                    const val = row[key];
                    if (val && typeof val === 'string' && (key.toLowerCase().includes('fee') || key.toLowerCase().includes('date') || key.toLowerCase().includes('inst') || val.includes('('))) {
                        const parsed = parseInstallmentText(val);
                        installments = [...installments, ...parsed];
                    }
                });

                let totalPaid = 0;
                installments.forEach((inst, idx) => {
                    inst.installmentNo = idx + 1;
                    totalPaid += inst.amount;
                });

                student.installments = installments;
                student.paidFees = totalPaid;
                studentsList.push(student);
            }
        }

        if (studentsList.length === 0) return { success: false, message: "No valid student data found in the sheet." };

        let processedCount = 0;
        let batch = writeBatch(db);
        let batchCount = 0;

        // Fetch existing students to merge installments cleanly
        const studentsSnap = await getDocs(collection(db, "students"));
        const existingStudents = new Map();
        studentsSnap.forEach(docSnap => existingStudents.set(docSnap.id, docSnap.data()));

        for (const student of studentsList) {
            const dbData = existingStudents.get(student.registration) || {};
            const existingInst = dbData.installments || [];

            const mergedMap = new Map();
            existingInst.forEach(inst => {
                const normDate = normalizeDateToYYYYMMDD(inst.date);
                inst.date = normDate;
                mergedMap.set(`${normDate}_${inst.amount}`, inst);
            });

            (student.installments || []).forEach(inst => {
                const normDate = normalizeDateToYYYYMMDD(inst.date);
                inst.date = normDate;
                const key = `${normDate}_${inst.amount}`;
                if (!mergedMap.has(key)) mergedMap.set(key, inst);
            });

            const finalInstallments = Array.from(mergedMap.values());
            let finalPaid = 0;
            finalInstallments.forEach((inst, idx) => {
                inst.installmentNo = idx + 1;
                finalPaid += inst.amount;
            });

            student.installments = finalInstallments;
            student.paidFees = finalPaid;

            const docRef = doc(db, "students", student.registration);
            batch.set(docRef, student, { merge: true });

            processedCount++;
            batchCount++;

            if (batchCount >= 400) {
                await batch.commit();
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        return {
            success: true,
            message: `Successfully synchronized ${processedCount} students with accurate date-wise fee breakdown.`
        };

    } catch (error) {
        console.error("Google Sheets Sync Error:", error);
        return { success: false, message: error.message };
    }
}
