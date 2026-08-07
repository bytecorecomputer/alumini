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
 * Comprehensive installment parser.
 * Handles formats like:
 * - "1000 (13-09-2025)" or "1000 (13/09/2025)"
 * - "3000  (01-11-2025)"
 * - "500 (17-06-2026"
 * - "1000 - 15/08/2025" or "1000 / 15-08-2025" or "15/08/2025: 1000"
 * - "1000 (14-04)" (short date)
 * - "500+500" (multiple payments in one cell)
 * - "1000" (bare amount in fee/date column, using headerDate or fallbackDate)
 */
export function parseInstallmentText(str, fallbackDate = '', headerText = '') {
    if (!str || (typeof str !== 'string' && typeof str !== 'number')) return [];

    const clean = String(str).trim();
    if (!clean) return [];
    
    const lower = clean.toLowerCase();
    if (lower === 'unpaid' || lower === '-' || lower === 'free' || lower === 'nil' || lower === 'none' || lower === 'n/a') return [];

    const results = [];

    // Helper to extract date from header or string
    const extractDate = (text) => {
        if (!text) return null;
        // Full date DD-MM-YYYY or YYYY-MM-DD or DD/MM/YYYY
        const fullMatch = text.match(/([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/);
        if (fullMatch) return normalizeDateToYYYYMMDD(fullMatch[1]);

        // Short date DD-MM or DD/MM
        const shortMatch = text.match(/([0-9]{1,2}[-/.][0-9]{1,2})/);
        if (shortMatch) {
            const curYear = new Date().getFullYear();
            return normalizeDateToYYYYMMDD(`${shortMatch[1]}-${curYear}`);
        }

        // Month name e.g. "Sep/25", "Sep 2025"
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        for (let m = 0; m < months.length; m++) {
            if (text.toLowerCase().includes(months[m])) {
                const yearMatch = text.match(/20\d{2}|\d{2}/);
                const year = yearMatch ? (yearMatch[0].length === 2 ? `20${yearMatch[0]}` : yearMatch[0]) : new Date().getFullYear();
                const monthNum = String(m + 1).padStart(2, '0');
                return `${year}-${monthNum}-15`;
            }
        }
        return null;
    };

    const headerDate = extractDate(headerText);
    const defaultDate = headerDate || normalizeDateToYYYYMMDD(fallbackDate) || new Date().toISOString().split('T')[0];

    // Split cell if it has comma-separated or plus-separated entries (without dates inside brackets)
    const subParts = clean.includes(',') 
        ? clean.split(',') 
        : (clean.includes('+') && !clean.includes('(') ? clean.split('+') : [clean]);

    for (const part of subParts) {
        const subClean = part.trim();
        if (!subClean || subClean === '-' || subClean.toLowerCase() === 'unpaid') continue;

        // Pattern 1: Full Date inside cell e.g. "1000 (13-09-2025)", "1000 - 13/09/2025", "1000: 13-09-2025"
        const fullDateRegex = /(\d[\d,]*)\s*[(/-:]*\s*([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/g;
        let match;
        let matched = false;

        while ((match = fullDateRegex.exec(subClean)) !== null) {
            matched = true;
            const amt = parseInt(match[1].replace(/,/g, ''), 10);
            const rawDate = match[2];
            if (!isNaN(amt) && amt >= 10 && amt <= 50000) {
                results.push({
                    amount: amt,
                    date: normalizeDateToYYYYMMDD(rawDate),
                    status: 'paid'
                });
            }
        }
        if (matched) continue;

        // Pattern 2: Short Date inside cell e.g. "1000 (14-04)", "1000 - 14/04"
        const shortDateRegex = /(\d[\d,]*)\s*[(/-:]*\s*([0-9]{1,2}[-/.][0-9]{1,2})/g;
        while ((match = shortDateRegex.exec(subClean)) !== null) {
            matched = true;
            const amt = parseInt(match[1].replace(/,/g, ''), 10);
            const rawDate = match[2];
            if (!isNaN(amt) && amt >= 10 && amt <= 50000) {
                const currentYear = new Date().getFullYear();
                results.push({
                    amount: amt,
                    date: normalizeDateToYYYYMMDD(`${rawDate}-${currentYear}`),
                    status: 'paid'
                });
            }
        }
        if (matched) continue;

        // Pattern 3: Bare amount in cell e.g. "1000", "₹1000", "1000 paid"
        const digitsOnly = subClean.replace(/,/g, '').replace(/[^\d]/g, '');
        if (digitsOnly) {
            const amt = parseInt(digitsOnly, 10);
            if (!isNaN(amt) && amt >= 10 && amt <= 50000) {
                results.push({
                    amount: amt,
                    date: defaultDate,
                    status: 'paid'
                });
            }
        }
    }

    return results;
}

const METADATA_KEYWORDS = [
    's.no', 'sr', 'sr.no', 'sr.', 'roll', 'roll no', 'registration', 'registration no.',
    'student name', 'name', 'student', 'status', 'course', 'father', 'fathers name', 'father name',
    'mobile', 'mob', 'mob. no.', 'address', 'center', 'admission date', 'date of admission',
    'registration fee', 'regi. fee', 'admission fee', 'reg fee', 'total fee', 'total fees', 'fee total'
];

/**
 * Smart Schema Parser for Google Sheet CSV / TSV text.
 * Dynamically identifies metadata headers and extracts all installment/fee-date columns.
 */
export function parseRawSheetText(text, defaultCenter = 'Thiriya') {
    if (!text || typeof text !== 'string') return [];

    const rawLines = text.split(/\r?\n/);
    if (rawLines.length === 0) return [];

    let headerRowIdx = -1;
    let colMap = {};
    let headers = [];

    // Find Header Row
    for (let i = 0; i < Math.min(10, rawLines.length); i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        const cols = line.includes('\t') ? line.split('\t') : line.split(',');
        const lowerCols = cols.map(c => c.trim().toLowerCase());

        const hasName = lowerCols.some(c => c.includes('name') || c.includes('student'));
        const hasRoll = lowerCols.some(c => c.includes('roll') || c.includes('registration') || c.includes('s.no') || c.includes('sr'));
        
        if (hasName || hasRoll) {
            headerRowIdx = i;
            headers = cols.map(c => c.trim());
            
            // Map column indices
            lowerCols.forEach((h, idx) => {
                if (h.includes('roll') || h.includes('registration')) colMap.regId = idx;
                else if (h.includes('student name') || (h.includes('name') && !h.includes('father'))) colMap.fullName = idx;
                else if (h.includes('status')) colMap.status = idx;
                else if (h.includes('course')) colMap.course = idx;
                else if (h.includes('father')) colMap.fatherName = idx;
                else if (h.includes('mob') || h.includes('phone') || h.includes('mobile')) colMap.mobile = idx;
                else if (h.includes('address') || h.includes('center')) colMap.address = idx;
                else if (h.includes('admission date') || h.includes('adm date')) colMap.admissionDate = idx;
                else if (h.includes('regi. fee') || h.includes('registration fee') || h.includes('admission fee')) colMap.admissionFee = idx;
                else if (h.includes('total fee') || h.includes('total fees') || h.includes('fee total')) colMap.totalFees = idx;
            });
            break;
        }
    }

    const parsedStudents = [];
    const startLine = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;

    for (let i = startLine; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        let cols = line.includes('\t') ? line.split('\t') : line.split(',');
        cols = cols.map(c => c ? c.trim() : '');

        // Skip header lines if repeated
        const firstCol = (cols[0] || '').toLowerCase();
        if (firstCol.includes('s.no') || firstCol.includes('bytecore') || firstCol.includes('sr.')) continue;

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
        let installmentColIndices = [];

        if (headerRowIdx !== -1) {
            regId = colMap.regId !== undefined ? cols[colMap.regId] : '';
            fullName = colMap.fullName !== undefined ? cols[colMap.fullName] : '';
            statusStr = colMap.status !== undefined ? cols[colMap.status] : '';
            courseStr = colMap.course !== undefined ? cols[colMap.course] : '';
            fatherNameStr = colMap.fatherName !== undefined ? cols[colMap.fatherName] : '';
            mobileStr = colMap.mobile !== undefined ? cols[colMap.mobile] : '';
            addressStr = colMap.address !== undefined ? cols[colMap.address] : '';
            admissionDateRaw = colMap.admissionDate !== undefined ? cols[colMap.admissionDate] : '';
            admissionFeeRaw = colMap.admissionFee !== undefined ? cols[colMap.admissionFee] : '';
            totalFeesRaw = colMap.totalFees !== undefined ? cols[colMap.totalFees] : '';

            // Find all installment columns (any column not matching metadata keywords or occurring after totalFees)
            headers.forEach((h, idx) => {
                const hLower = h.toLowerCase();
                const isMetadata = METADATA_KEYWORDS.some(k => hLower === k || hLower.startsWith(k));
                if (!isMetadata || hLower.includes('fee/date') || hLower.includes('installment') || idx > (colMap.totalFees ?? 10)) {
                    installmentColIndices.push(idx);
                }
            });
        } else {
            // Fallback Mode: Standard column order
            if (cols.length > 2 && /^\d+$/.test(cols[0]) && cols[1] !== '') {
                regId = cols[1];
                fullName = cols[2];
                statusStr = cols[3];
                courseStr = cols[4];
                fatherNameStr = cols[5];
                mobileStr = cols[6];
                addressStr = cols[7];
                admissionDateRaw = cols[8];
                admissionFeeRaw = cols[9];
                totalFeesRaw = cols[10];
                for (let j = 11; j < cols.length; j++) installmentColIndices.push(j);
            } else {
                regId = cols[0];
                fullName = cols[1];
                statusStr = cols[2];
                courseStr = cols[3];
                fatherNameStr = cols[4];
                mobileStr = cols[5];
                addressStr = cols[6];
                admissionDateRaw = cols[7];
                admissionFeeRaw = cols[8];
                totalFeesRaw = cols[9];
                for (let j = 10; j < cols.length; j++) installmentColIndices.push(j);
            }
        }

        if (!fullName && !regId) continue;

        if (!regId) {
            const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '');
            regId = `REG_${cleanName || (Date.now() + i)}`;
        }

        // Center Detection
        let detectedCenter = defaultCenter;
        const addrLower = (addressStr || '').toLowerCase();
        if (addrLower.includes('thiriya')) detectedCenter = 'Thiriya';
        else if (addrLower.includes('naryawal') || addrLower.includes('nariyawal')) detectedCenter = 'Nariyawal';
        else if (addressStr && addressStr !== '-') detectedCenter = addressStr;

        const parsedTotalFee = (totalFeesRaw && String(totalFeesRaw).toLowerCase().includes('free')) ? 0 : parseCurrency(totalFeesRaw);
        const parsedAdmissionFee = parseCurrency(admissionFeeRaw);

        // Extract Installments from fee/date columns
        let rawInstallments = [];
        for (const j of installmentColIndices) {
            const cellVal = cols[j];
            const headerText = headers[j] || '';
            if (cellVal && cellVal.trim() !== '' && cellVal !== '-' && cellVal.toLowerCase() !== 'unpaid') {
                const parsedInsts = parseInstallmentText(cellVal, admissionDateRaw, headerText);
                if (parsedInsts.length > 0) {
                    const cleanInsts = parsedInsts.filter(inst => inst.amount !== parsedTotalFee && inst.amount >= 10 && inst.amount <= 50000);
                    rawInstallments = [...rawInstallments, ...cleanInsts];
                }
            }
        }

        // Sort installments chronologically by date
        rawInstallments.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

        let totalPaid = 0;
        rawInstallments.forEach((inst, idx) => {
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
            installments: rawInstallments,
            paidFees: totalPaid,
            updatedAt: Date.now()
        };

        parsedStudents.push(student);
    }

    return parsedStudents;
}

/**
 * Parses CSV string via PapaParse with smart column mapping.
 */
function parseCSV(str) {
    const parsed = Papa.parse(str, { skipEmptyLines: true });
    if (parsed.errors.length) console.warn("PapaParse Warnings:", parsed.errors);

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
            obj[h] = val;
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
            // Fallback to PapaParse mapping
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

                let rawInstallments = [];
                Object.keys(row).forEach(key => {
                    const keyLower = key.toLowerCase().trim();
                    const isReserved = METADATA_KEYWORDS.some(rh => keyLower === rh || keyLower.includes('total fee') || keyLower.includes('regi. fee') || keyLower.includes('registration fee') || keyLower.includes('admission fee'));
                    if (!isReserved || keyLower.includes('fee/date') || keyLower.includes('installment')) {
                        const val = row[key];
                        if (val && typeof val === 'string' && val.trim() !== '' && val !== '-' && val.toLowerCase() !== 'unpaid') {
                            const parsed = parseInstallmentText(val, student.admissionDate, key);
                            const cleanInsts = parsed.filter(inst => inst.amount !== totalFees && inst.amount >= 10);
                            rawInstallments = [...rawInstallments, ...cleanInsts];
                        }
                    }
                });

                rawInstallments.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

                let totalPaid = 0;
                rawInstallments.forEach((inst, idx) => {
                    inst.installmentNo = idx + 1;
                    totalPaid += inst.amount;
                });

                student.installments = rawInstallments;
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
