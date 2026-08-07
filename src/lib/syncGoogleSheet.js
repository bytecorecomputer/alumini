import { doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firestore";
import Papa from 'papaparse';
import { normalizeDateToYYYYMMDD } from "./utils";
import { sanitizeStudentData } from "./feeAutomation";

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
 * Extracts date string from header text or cell string.
 */
function extractDateFromText(text) {
    if (!text) return null;
    const str = String(text).trim();
    
    // Full date DD-MM-YYYY or YYYY-MM-DD or DD/MM/YYYY
    const fullMatch = str.match(/([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/);
    if (fullMatch) return normalizeDateToYYYYMMDD(fullMatch[1]);

    // Short date DD-MM or DD/MM
    const shortMatch = str.match(/([0-9]{1,2}[-/.][0-9]{1,2})/);
    if (shortMatch) {
        const curYear = new Date().getFullYear();
        return normalizeDateToYYYYMMDD(`${shortMatch[1]}-${curYear}`);
    }

    // Month name e.g. "Sep/25", "Sep 2025"
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    for (let m = 0; m < months.length; m++) {
        if (str.toLowerCase().includes(months[m])) {
            const yearMatch = str.match(/20\d{2}|\d{2}/);
            const year = yearMatch ? (yearMatch[0].length === 2 ? `20${yearMatch[0]}` : yearMatch[0]) : new Date().getFullYear();
            const monthNum = String(m + 1).padStart(2, '0');
            return `${year}-${monthNum}-15`;
        }
    }
    return null;
}

/**
 * Parses installment cell text cleanly into array of { amount, date, status: 'paid' }.
 */
export function parseInstallmentText(str, fallbackDate = '', headerText = '') {
    if (!str || (typeof str !== 'string' && typeof str !== 'number')) return [];

    const clean = String(str).trim();
    if (!clean) return [];

    const lower = clean.toLowerCase();
    if (lower === 'unpaid' || lower === '-' || lower === 'free' || lower === 'nil' || lower === 'none' || lower === 'n/a' || lower === 'pass') return [];

    const results = [];
    const headerDate = extractDateFromText(headerText);
    const defaultDate = headerDate || extractDateFromText(fallbackDate) || normalizeDateToYYYYMMDD(fallbackDate) || new Date().toISOString().split('T')[0];

    // Pattern 1: Amount with full date e.g. "1000 (15-08-2025)" or "1000 - 15/08/2025" or "1000/15-08-2025"
    const fullDateRegex = /(\d[\d,]*)\s*[(/.:-]*\s*([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})\)?/g;
    let match;
    let foundCount = 0;

    while ((match = fullDateRegex.exec(clean)) !== null) {
        foundCount++;
        const amt = parseInt(match[1].replace(/,/g, ''), 10);
        const rawDate = match[2];
        if (!isNaN(amt) && amt >= 50 && amt <= 30000) {
            results.push({
                amount: amt,
                date: normalizeDateToYYYYMMDD(rawDate),
                status: 'paid'
            });
        }
    }
    if (foundCount > 0) return results;

    // Pattern 2: Amount with short date e.g. "1000 (14-04)"
    const shortDateRegex = /(\d[\d,]*)\s*[(/.:-]*\s*([0-9]{1,2}[-/.][0-9]{1,2})\)?/g;
    while ((match = shortDateRegex.exec(clean)) !== null) {
        foundCount++;
        const amt = parseInt(match[1].replace(/,/g, ''), 10);
        const rawDate = match[2];
        if (!isNaN(amt) && amt >= 50 && amt <= 30000) {
            const currentYear = new Date().getFullYear();
            results.push({
                amount: amt,
                date: normalizeDateToYYYYMMDD(`${rawDate}-${currentYear}`),
                status: 'paid'
            });
        }
    }
    if (foundCount > 0) return results;

    // Pattern 3: Plus or comma separated amounts e.g. "500+500" or "1000, 1000" or bare "1000"
    const parts = clean.split(/[,+]/);
    for (const part of parts) {
        const digitsOnly = part.replace(/,/g, '').replace(/[^\d]/g, '');
        if (digitsOnly) {
            const amt = parseInt(digitsOnly, 10);
            if (!isNaN(amt) && amt >= 50 && amt <= 30000) {
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

/**
 * Pure PapaParse Google Sheet CSV/TSV Synchronizer.
 */
export async function syncFromGoogleSheet(csvUrl, centerName = 'Thiriya') {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error("Failed to fetch CSV from Google Sheets");
        const csvText = await response.text();

        // 1. Parse CSV/TSV using PapaParse
        const parsed = Papa.parse(csvText, { skipEmptyLines: true });
        if (!parsed.data || parsed.data.length < 2) {
            return { success: false, message: "No valid data found in CSV sheet." };
        }

        const rows = parsed.data;

        // 2. Find Header Row dynamically
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(10, rows.length); i++) {
            const rowStr = rows[i].map(c => String(c || '').toLowerCase()).join(' ');
            if (rowStr.includes('student name') || rowStr.includes('name') || rowStr.includes('registration') || rowStr.includes('roll')) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) headerRowIndex = 0;

        const headers = rows[headerRowIndex].map(h => String(h || '').trim());
        const colMap = {};

        headers.forEach((h, idx) => {
            const hLower = h.toLowerCase();
            if (hLower.includes('roll') || hLower.includes('registration') || hLower.includes('reg.')) colMap.regId = idx;
            else if (hLower.includes('student name') || (hLower.includes('name') && !hLower.includes('father'))) colMap.fullName = idx;
            else if (hLower.includes('status')) colMap.status = idx;
            else if (hLower.includes('course') || hLower.includes('trade')) colMap.course = idx;
            else if (hLower.includes('father')) colMap.fatherName = idx;
            else if (hLower.includes('mob') || hLower.includes('phone') || hLower.includes('mobile')) colMap.mobile = idx;
            else if (hLower.includes('address') || hLower.includes('center')) colMap.address = idx;
            else if (hLower.includes('admission date') || hLower.includes('adm date') || (hLower.includes('date') && !hLower.includes('fee'))) colMap.admissionDate = idx;
            else if (hLower.includes('regi. fee') || hLower.includes('registration fee') || hLower.includes('admission fee') || hLower.includes('reg fee')) colMap.admissionFee = idx;
            else if (hLower.includes('total fee') || hLower.includes('total fees') || hLower.includes('fee total') || hLower.includes('course fee')) colMap.totalFees = idx;
        });

        // Identify Installment Column Indices
        const installmentColIndices = [];
        headers.forEach((h, idx) => {
            const hLower = h.toLowerCase();
            const isSNo = hLower === 's.no' || hLower === 'sr' || hLower === 'sr.no' || hLower === 'sr.' || hLower === 'sl.no' || hLower === 's.n';
            const isRoll = hLower.includes('roll') || hLower.includes('registration') || hLower.includes('reg. no') || hLower.includes('reg no');
            const isName = hLower.includes('name') && !hLower.includes('father');
            const isFather = hLower.includes('father');
            const isCourse = hLower === 'course' || hLower.includes('trade');
            const isStatus = hLower.includes('status');
            const isMobile = hLower.includes('mob') || hLower.includes('phone') || hLower.includes('mobile');
            const isAddress = hLower.includes('address') || hLower.includes('center');
            const isAdmDate = hLower.includes('admission date') || hLower.includes('adm date');
            const isAdmFee = hLower.includes('registration fee') || hLower.includes('regi. fee') || hLower.includes('admission fee') || hLower.includes('reg fee');
            const isTotalFee = hLower.includes('total fee') || hLower.includes('total fees') || hLower.includes('fee total') || hLower.includes('course fee');

            const isMetadata = isSNo || isRoll || isName || isFather || isCourse || isStatus || isMobile || isAddress || isAdmDate || isAdmFee || isTotalFee;

            if (!isMetadata) {
                installmentColIndices.push(idx);
            }
        });

        // 3. Process Data Rows
        const studentMap = new Map();

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const rowData = rows[i];
            if (!rowData || rowData.length === 0) continue;

            const firstCol = String(rowData[0] || '').toLowerCase();
            if (firstCol.includes('s.no') || firstCol.includes('bytecore') || firstCol.includes('sr.')) continue;

            let regId = colMap.regId !== undefined ? rowData[colMap.regId] : (rowData[1] || rowData[0] || '');
            let fullName = colMap.fullName !== undefined ? rowData[colMap.fullName] : (rowData[2] || rowData[1] || '');
            let statusStr = colMap.status !== undefined ? rowData[colMap.status] : (rowData[3] || '');
            let courseStr = colMap.course !== undefined ? rowData[colMap.course] : (rowData[4] || '');
            let fatherNameStr = colMap.fatherName !== undefined ? rowData[colMap.fatherName] : (rowData[5] || '');
            let mobileStr = colMap.mobile !== undefined ? rowData[colMap.mobile] : (rowData[6] || '');
            let addressStr = colMap.address !== undefined ? rowData[colMap.address] : (rowData[7] || '');
            let admissionDateRaw = colMap.admissionDate !== undefined ? rowData[colMap.admissionDate] : (rowData[8] || '');
            let admissionFeeRaw = colMap.admissionFee !== undefined ? rowData[colMap.admissionFee] : (rowData[9] || '');
            let totalFeesRaw = colMap.totalFees !== undefined ? rowData[colMap.totalFees] : (rowData[10] || '');

            regId = String(regId || '').trim();
            fullName = String(fullName || '').trim();

            if (!fullName && !regId) continue;

            if (!regId) {
                const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '');
                regId = `REG_${cleanName || (Date.now() + i)}`;
            }

            const cleanRegKey = regId;

            // Center Detection
            let detectedCenter = centerName;
            const addrLower = String(addressStr || '').toLowerCase();
            if (addrLower.includes('thiriya')) detectedCenter = 'Thiriya';
            else if (addrLower.includes('naryawal') || addrLower.includes('nariyawal')) detectedCenter = 'Nariyawal';
            else if (addressStr && addressStr !== '-') detectedCenter = addressStr;

            const parsedTotalFee = (totalFeesRaw && String(totalFeesRaw).toLowerCase().includes('free')) ? 0 : parseCurrency(totalFeesRaw);
            const parsedAdmissionFee = parseCurrency(admissionFeeRaw);

            // Extract Installments from Fee/Date columns
            let rawInstallments = [];
            for (const j of installmentColIndices) {
                const cellVal = rowData[j];
                const headerText = headers[j] || '';
                if (cellVal && String(cellVal).trim() !== '' && cellVal !== '-' && String(cellVal).toLowerCase() !== 'unpaid') {
                    const parsedInsts = parseInstallmentText(cellVal, admissionDateRaw, headerText);
                    if (parsedInsts.length > 0) {
                        rawInstallments = [...rawInstallments, ...parsedInsts];
                    }
                }
            }

            const studentObj = {
                registration: cleanRegKey,
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
                paidFees: 0,
                updatedAt: Date.now()
            };

            // Deduplicate Students if registration is repeated
            if (studentMap.has(cleanRegKey)) {
                const existing = studentMap.get(cleanRegKey);
                const mergedInsts = [...existing.installments, ...rawInstallments];
                const sanitized = sanitizeStudentData({
                    ...existing,
                    installments: mergedInsts,
                    totalFees: parsedTotalFee > 0 ? parsedTotalFee : existing.totalFees
                });
                studentMap.set(cleanRegKey, sanitized);
            } else {
                const sanitized = sanitizeStudentData(studentObj);
                studentMap.set(cleanRegKey, sanitized);
            }
        }

        const studentsList = Array.from(studentMap.values());
        if (studentsList.length === 0) return { success: false, message: "No valid student records found." };

        // 4. Batch Commit to Firestore
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
            message: `PapaParse Google Sheet Sync Complete! Synchronized ${processedCount} students cleanly.`
        };

    } catch (error) {
        console.error("PapaParse Google Sheets Sync Error:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Fallback Raw Sheet Text parser (TSV / CSV text pasted directly)
 */
export function parseRawSheetText(text, defaultCenter = 'Thiriya') {
    const parsed = Papa.parse(text, { skipEmptyLines: true });
    if (!parsed.data || parsed.data.length < 2) return [];

    const rows = parsed.data;
    let headerRowIndex = 0;

    for (let i = 0; i < Math.min(5, rows.length); i++) {
        const rowStr = rows[i].map(c => String(c || '').toLowerCase()).join(' ');
        if (rowStr.includes('student name') || rowStr.includes('name') || rowStr.includes('registration') || rowStr.includes('roll')) {
            headerRowIndex = i;
            break;
        }
    }

    const headers = rows[headerRowIndex].map(h => String(h || '').trim());
    const colMap = {};

    headers.forEach((h, idx) => {
        const hLower = h.toLowerCase();
        if (hLower.includes('roll') || hLower.includes('registration')) colMap.regId = idx;
        else if (hLower.includes('student name') || (hLower.includes('name') && !hLower.includes('father'))) colMap.fullName = idx;
        else if (hLower.includes('status')) colMap.status = idx;
        else if (hLower.includes('course')) colMap.course = idx;
        else if (hLower.includes('father')) colMap.fatherName = idx;
        else if (hLower.includes('mob') || hLower.includes('phone') || hLower.includes('mobile')) colMap.mobile = idx;
        else if (hLower.includes('address') || hLower.includes('center')) colMap.address = idx;
        else if (hLower.includes('admission date') || hLower.includes('adm date')) colMap.admissionDate = idx;
        else if (hLower.includes('regi. fee') || hLower.includes('registration fee') || hLower.includes('admission fee')) colMap.admissionFee = idx;
        else if (hLower.includes('total fee') || hLower.includes('total fees') || hLower.includes('fee total')) colMap.totalFees = idx;
    });

    const installmentColIndices = [];
    headers.forEach((h, idx) => {
        const hLower = h.toLowerCase();
        const isMetadata = hLower.includes('s.no') || hLower.includes('roll') || hLower.includes('name') || hLower.includes('father') || hLower.includes('course') || hLower.includes('status') || hLower.includes('mob') || hLower.includes('address') || hLower.includes('admission date') || hLower.includes('fee');
        if (!isMetadata || hLower.includes('fee/date') || hLower.includes('installment')) {
            installmentColIndices.push(idx);
        }
    });

    const students = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const rowData = rows[i];
        if (!rowData) continue;

        let regId = colMap.regId !== undefined ? rowData[colMap.regId] : rowData[0];
        let fullName = colMap.fullName !== undefined ? rowData[colMap.fullName] : rowData[1];
        if (!fullName && !regId) continue;

        let rawInsts = [];
        for (const j of installmentColIndices) {
            const val = rowData[j];
            if (val) {
                const parsedInsts = parseInstallmentText(val, rowData[colMap.admissionDate] || '', headers[j] || '');
                rawInsts = [...rawInsts, ...parsedInsts];
            }
        }

        const student = sanitizeStudentData({
            registration: String(regId || '').trim() || `REG_${Date.now()}_${i}`,
            fullName: String(fullName || '').trim(),
            course: String(rowData[colMap.course] || 'N/A'),
            totalFees: parseCurrency(rowData[colMap.totalFees]),
            admissionFee: parseCurrency(rowData[colMap.admissionFee]),
            installments: rawInsts,
            center: defaultCenter
        });

        students.push(student);
    }

    return students;
}
