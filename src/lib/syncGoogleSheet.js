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

const RESERVED_HEADERS = [
    's.no', 'sr', 'sr.no', 'roll', 'roll no', 'registration', 'registration no.',
    'student name', 'name', 'status', 'course', 'father', 'fathers name', 'father name',
    'mobile', 'mob', 'mob. no.', 'address', 'center', 'admission date', 'date',
    'registration fee', 'regi. fee', 'admission fee', 'reg fee', 'total fee', 'total fees', 'fee total'
];

/**
 * Deep Dynamic Parser for raw TSV/CSV text (pasted directly from Google Sheets or Excel)
 * Traverses every cell across the entire row to extract student info, admission fee, total fee, and installments.
 */
/**
 * Smart Adaptive Parser for raw TSV/CSV text (pasted directly from Google Sheets or Excel)
 * Automatically classifies cells into Name, Roll No, Course, Mobile, Admission Date, Admission Fee, Total Fee, and Month Installments
 * Works whether S.No or Roll No columns are present or absent!
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

        // Skip header lines
        const firstCol = (cols[0] || '').toLowerCase();
        const secondCol = (cols[1] || '').toLowerCase();
        const thirdCol = (cols[2] || '').toLowerCase();
        if (firstCol.includes('s.no') || firstCol.includes('sr') || secondCol.includes('roll') || secondCol.includes('registration') || thirdCol.includes('student name')) {
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
        let admissionFeeRaw = 0;
        let totalFeesRaw = 0;
        let installments = [];

        const candidateNumbers = [];
        let foundFirstInstallment = false;

        for (let j = 0; j < cols.length; j++) {
            const cellVal = cols[j];
            if (!cellVal || cellVal === '-') continue;

            const cleanVal = cellVal.trim();
            const lowerVal = cleanVal.toLowerCase();
            if (lowerVal === 'unpaid' && j < 4) {
                statusStr = 'unpaid';
                continue;
            }

            // 1. Explicit installment pattern e.g. "1000 (14-04-2026)" or "1000 (14-04)"
            const parsedInsts = parseInstallmentText(cleanVal);
            if (parsedInsts.length > 0) {
                foundFirstInstallment = true;
                installments = [...installments, ...parsedInsts];
                continue;
            }

            // 2. Mobile Number (10 digits starting with 6, 7, 8, 9)
            if (/^[6-9]\d{9}$/.test(cleanVal.replace(/[^0-9]/g, '')) && !mobileStr) {
                mobileStr = cleanVal;
                continue;
            }

            // 3. Standalone Date (e.g. "14-04-2026" or "02-09-2025")
            if (/^([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})$/.test(cleanVal) && !admissionDateRaw) {
                admissionDateRaw = cleanVal;
                continue;
            }

            // 4. Status (pass, paid, complete, unpaid)
            if ((lowerVal === 'paid' || lowerVal === 'unpaid' || lowerVal.includes('pass') || lowerVal.includes('complete')) && !statusStr) {
                statusStr = cleanVal;
                continue;
            }

            // 5. Course (ADCA, DCST, DCA, MDCA, Power BI, etc.)
            if (/^(adca|dcst|dca|mdca|tally|ccc|power\s*bi|adca\s*\+\s*power\s*bi)$/i.test(cleanVal) && !courseStr) {
                courseStr = cleanVal;
                continue;
            }

            // 6. Numeric values: Roll No vs Fee Amounts
            const isPureNum = /^\d+$/.test(cleanVal.replace(/,/g, ''));
            if (isPureNum) {
                const num = parseCurrency(cleanVal);
                
                // Roll number candidate e.g. 2001, 2050, 501
                if (!regId && (num > 100 && num < 10000) && j <= 2) {
                    regId = cleanVal;
                    continue;
                }

                // If bare number appears after installments started, it is a month installment!
                if (foundFirstInstallment && num >= 10) {
                    installments.push({
                        amount: num,
                        date: normalizeDateToYYYYMMDD(admissionDateRaw) || new Date().toISOString().split('T')[0],
                        status: 'paid'
                    });
                    continue;
                }

                candidateNumbers.push({ num, colIndex: j, str: cleanVal });
                continue;
            }

            if (lowerVal.includes('free')) {
                totalFeesRaw = 'FREE';
                continue;
            }

            // 7. Text fields (Name, Father Name, Address)
            if (!fullName && j <= 3 && !/^\d+$/.test(cleanVal)) {
                fullName = cleanVal;
            } else if (fullName && !fatherNameStr && j <= 5 && !/^\d+$/.test(cleanVal)) {
                fatherNameStr = cleanVal;
            } else if (!addressStr && (lowerVal.includes('thiriya') || lowerVal.includes('nariyawal') || lowerVal.includes('manpuriya') || lowerVal.includes('mohanpur') || lowerVal.includes('harharpur') || lowerVal.includes('parsona'))) {
                addressStr = cleanVal;
            }
        }

        // Classify candidate pre-installment numbers for Admission Fee vs Total Fee
        candidateNumbers.forEach(item => {
            if (item.num <= 1000 && !admissionFeeRaw) {
                admissionFeeRaw = item.num;
            } else if (item.num > 1000 && !totalFeesRaw) {
                totalFeesRaw = item.num;
            }
        });

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

        const parsedTotalFee = (totalFeesRaw === 'FREE' || (typeof totalFeesRaw === 'string' && totalFeesRaw.toLowerCase().includes('free'))) ? 0 : parseCurrency(totalFeesRaw);
        const parsedAdmissionFee = parseCurrency(admissionFeeRaw);

        // Clean installments array: Filter out totalFees or admissionFee duplicates
        const cleanInstallments = installments.filter(inst => inst.amount !== parsedTotalFee && inst.amount >= 10);

        let totalPaid = 0;
        cleanInstallments.forEach((inst, idx) => {
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
            installments: cleanInstallments,
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
