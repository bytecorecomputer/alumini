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
/**
 * Strict regex-based installment parser.
 * Requires explicit date pattern e.g. "1000 (13-09-2025)" or "300(17-07-2026)" or "1000 (14-04)".
 * Rejects bare numbers without dates and amounts > 50,000 to prevent S.No, Roll No, or Mobile numbers (6397712145) from ever becoming fee installments!
 */
export function parseInstallmentText(str, fallbackDate = '') {
    if (!str || typeof str !== 'string' || !str.trim()) return [];

    const clean = str.trim();
    if (clean.toLowerCase() === 'unpaid' || clean.toLowerCase() === '-' || clean === '') return [];

    const results = [];

    // Regex 1: Full Date e.g. 1000 (13-09-2025) or 300(17-07-2026)
    const fullDateRegex = /(\d[\d,]*)\s*\(?\s*([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/g;
    let match;

    while ((match = fullDateRegex.exec(clean)) !== null) {
        const amtStr = match[1].replace(/,/g, '');
        const amt = parseInt(amtStr, 10);
        const rawDate = match[2];

        if (!isNaN(amt) && amt >= 10 && amt <= 50000) {
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

        if (!isNaN(amt) && amt >= 10 && amt <= 50000) {
            const currentYear = new Date().getFullYear();
            const dateWithYear = `${rawDate}-${currentYear}`;
            results.push({
                amount: amt,
                date: normalizeDateToYYYYMMDD(dateWithYear),
                status: 'paid'
            });
        }
    }

    return results;
}

const RESERVED_HEADERS = [
    's.no', 'sr', 'sr.no', 'roll', 'roll no', 'registration', 'registration no.',
    'student name', 'name', 'status', 'course', 'father', 'fathers name', 'father name',
    'mobile', 'mob', 'mob. no.', 'address', 'center', 'admission date', 'date',
    'registration fee', 'regi. fee', 'admission fee', 'reg fee', 'total fee', 'total fees', 'fee total'
];

/**
 * 3-Mode Adaptive Schema Parser for raw TSV/CSV text (pasted directly from Google Sheets or Excel)
 * Isolates core identity metadata (Roll No, Name, Mobile, Admission Fee, Total Fee) from Month Installments (Cols 11+)
 * Handles all row format variations without ever mixing mobile numbers (6397712145) or roll numbers into fee installments!
 */
export function parseRawSheetText(text, defaultCenter = 'Thiriya') {
    if (!text || typeof text !== 'string') return [];

    const rawLines = text.split(/\r?\n/);
    const parsedStudents = [];

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        // Split by tab (Google Sheet paste) or comma
        let cols = line.includes('\t') ? line.split('\t') : line.split(',');
        cols = cols.map(c => c ? c.trim() : '');

        // Skip header / title lines
        const firstCol = (cols[0] || '').toLowerCase();
        const secondCol = (cols[1] || '').toLowerCase();
        const thirdCol = (cols[2] || '').toLowerCase();
        if (firstCol.includes('s.no') || firstCol.includes('sr') || secondCol.includes('roll') || secondCol.includes('registration') || thirdCol.includes('student name') || firstCol.includes('bytecore')) {
            continue;
        }

        let regId = '';
        let fullName = '';
        let statusStr = '';
        let courseStr = '';
        let fatherNameStr = '';
        let mobileStr = '';
        let addressStr = '';
        let admissionDateRaw = '';
        let admissionFeeRaw = '';
        let totalFeesRaw = '';
        let instStartIdx = 11;

        // Mode 1: S.No (Col 0), Roll No (Col 1), Name (Col 2)
        if (cols.length > 2 && /^\d+$/.test(cols[0]) && cols[1] !== '' && !/^[a-zA-Z\s]{3,}$/.test(cols[1])) {
            regId = cols[1] || '';
            fullName = cols[2] || '';
            statusStr = cols[3] || '';
            courseStr = cols[4] || '';
            fatherNameStr = cols[5] || '';
            mobileStr = cols[6] || '';
            addressStr = cols[7] || '';
            admissionDateRaw = cols[8] || '';
            admissionFeeRaw = cols[9] || '';
            totalFeesRaw = cols[10] || '';
            instStartIdx = 11;
        }
        // Mode 2: Roll No (Col 0), Name (Col 1)
        else if (cols.length > 1 && !/^[a-zA-Z\s]{3,}$/.test(cols[0]) && cols[0] !== '') {
            regId = cols[0] || '';
            fullName = cols[1] || '';
            statusStr = cols[2] || '';
            courseStr = cols[3] || '';
            fatherNameStr = cols[4] || '';
            mobileStr = cols[5] || '';
            addressStr = cols[6] || '';
            admissionDateRaw = cols[7] || '';
            admissionFeeRaw = cols[8] || '';
            totalFeesRaw = cols[9] || '';
            instStartIdx = 10;
        }
        // Mode 3: Name (Col 0)
        else {
            fullName = cols[0] || '';
            statusStr = cols[1] || '';
            courseStr = cols[2] || '';
            fatherNameStr = cols[3] || '';
            mobileStr = cols[4] || '';
            addressStr = cols[5] || '';
            admissionDateRaw = cols[6] || '';
            admissionFeeRaw = cols[7] || '';
            totalFeesRaw = cols[8] || '';
            instStartIdx = 9;
        }

        if (!fullName && !regId) continue;

        // Auto-generate ID if missing
        if (!regId) {
            const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '');
            regId = `REG_${cleanName || (Date.now() + i)}`;
        }

        // Center Detection
        let detectedCenter = defaultCenter;
        const addrLower = (addressStr || '').toLowerCase();
        if (addrLower.includes('thiriya')) detectedCenter = 'Thiriya';
        else if (addrLower.includes('manpuriya') || addrLower.includes('munpuriya')) detectedCenter = 'Manpuriya';
        else if (addrLower.includes('naryawal') || addrLower.includes('nariyawal')) detectedCenter = 'Nariyawal';
        else if (addrLower.includes('mohanpur')) detectedCenter = 'Mohanpur';
        else if (addrLower.includes('harharpur')) detectedCenter = 'Harharpur';
        else if (addrLower.includes('parsona')) detectedCenter = 'Parsona';
        else if (addressStr && addressStr !== '-') detectedCenter = addressStr;

        const parsedTotalFee = (totalFeesRaw && String(totalFeesRaw).toLowerCase().includes('free')) ? 0 : parseCurrency(totalFeesRaw);
        const parsedAdmissionFee = parseCurrency(admissionFeeRaw);

        // Strict Installment Extraction from instStartIdx onwards
        let installments = [];
        for (let j = instStartIdx; j < cols.length; j++) {
            const cellVal = cols[j];
            if (cellVal && cellVal.trim() !== '' && cellVal !== '-' && cellVal.toLowerCase() !== 'unpaid') {
                const parsedInsts = parseInstallmentText(cellVal, admissionDateRaw);
                if (parsedInsts.length > 0) {
                    const cleanInsts = parsedInsts.filter(inst => inst.amount !== parsedTotalFee && inst.amount >= 10 && inst.amount <= 50000);
                    installments = [...installments, ...cleanInsts];
                }
            }
        }

        let totalPaid = 0;
        installments.forEach((inst, idx) => {
            inst.installmentNo = idx + 1;
            totalPaid += inst.amount;
        });

        const student = {
            registration: String(regId).trim(),
            fullName: fullName || 'Unknown Student',
            status: normalizeStatus(statusStr),
            course: courseStr || 'N/A',
            fatherName: fatherNameStr || '',
            mobile: mobileStr || '',
            address: addressStr || '',
            center: detectedCenter,
            admissionDate: normalizeDateToYYYYMMDD(admissionDateRaw),
            admissionFee: parsedAdmissionFee,
            registrationFee: parsedAdmissionFee,
            totalFees: parsedTotalFee,
            installments: installments,
            paidFees: totalPaid,
            updatedAt: Date.now()
        };

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

        let studentsList = parseRawSheetText(csvText, centerName);

        if (studentsList.length === 0) {
            // Fallback to PapaParse mapping with strict header filtering
            const data = parseCSV(csvText);
            for (const row of data) {
                const regId = row['Registration'] || row['Registration NO.'] || row['Roll No'] || row['Roll No.'] || row['S.No'];
                if (!regId || regId === '') continue;

                const address = row['Address '] || row['Address'] || '';
                let center = centerName;
                if (address.toLowerCase().includes('thiriya')) center = 'Thiriya';
                else if (address.toLowerCase().includes('nariyawal') || address.toLowerCase().includes('naryawal')) center = 'Nariyawal';

                const totalFees = parseCurrency(row['Total Fee']);
                const admissionFee = parseCurrency(row['Registration Fee'] || row['Regi. Fee'] || row['Admission Fee']);

                const student = {
                    registration: String(regId).trim(),
                    fullName: row['Student Name ']?.trim() || row['Student Name']?.trim() || 'Unknown',
                    status: normalizeStatus(row['Status '] || row['Status'] || 'unpaid'),
                    course: row['Course ']?.trim() || row['Course']?.trim() || '',
                    fatherName: row['Fathers Name ']?.trim() || row['Fathers Name']?.trim() || '',
                    mobile: row['Mob. No.']?.trim() || row['Mobile']?.trim() || '',
                    address: address.trim(),
                    admissionDate: normalizeDateToYYYYMMDD(row['Admission Date'] || ''),
                    admissionFee: admissionFee,
                    registrationFee: admissionFee,
                    totalFees: totalFees,
                    center: center,
                    updatedAt: Date.now()
                };

                // Installments extraction: Strictly exclude reserved headers!
                let installments = [];
                Object.keys(row).forEach(key => {
                    const keyLower = key.toLowerCase().trim();
                    const isReserved = RESERVED_HEADERS.some(rh => keyLower === rh || keyLower.includes('total fee') || keyLower.includes('regi. fee') || keyLower.includes('registration fee') || keyLower.includes('admission fee'));
                    if (!isReserved) {
                        const val = row[key];
                        if (val && typeof val === 'string' && val.trim() !== '' && val !== '-' && val.toLowerCase() !== 'unpaid') {
                            const parsed = parseInstallmentText(val, student.admissionDate);
                            const cleanInsts = parsed.filter(inst => inst.amount !== totalFees && inst.amount >= 10);
                            installments = [...installments, ...cleanInsts];
                        }
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

        for (const student of studentsList) {
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
            message: `Successfully synchronized ${processedCount} students cleanly.`
        };

    } catch (error) {
        console.error("Google Sheets Sync Error:", error);
        return { success: false, message: error.message };
    }
}
