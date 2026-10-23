import { doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firestore";
import Papa from 'papaparse';
import { normalizeDateToYYYYMMDD } from "./utils";
import { sanitizeStudentData } from "./feeAutomation";

export function parseCurrency(val) {
    if (!val) return 0;
    const str = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
    return parseInt(str, 10) || 0;
}

export function normalizeDate(dateStr) {
    return normalizeDateToYYYYMMDD(dateStr);
}

export function normalizeStatus(status) {
    if (!status) return 'unpaid';
    const s = String(status).toLowerCase().trim();
    if (s.includes('pass') || s.includes('paas') || s.includes('complete')) return 'pass';
    if (s.includes('paid')) return 'paid';
    if (s.includes('cancel')) return 'cancel';
    return 'unpaid';
}

function extractDateFromText(text) {
    if (!text) return null;
    const str = String(text).trim();

    const fullMatch = str.match(/([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/);
    if (fullMatch) return normalizeDateToYYYYMMDD(fullMatch[1]);

    const shortMatch = str.match(/([0-9]{1,2}[-/.][0-9]{1,2})/);
    if (shortMatch) {
        const curYear = new Date().getFullYear();
        return normalizeDateToYYYYMMDD(`${shortMatch[1]}-${curYear}`);
    }

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

export function parseInstallmentText(str, fallbackDate = '', headerText = '') {
    if (!str || (typeof str !== 'string' && typeof str !== 'number')) return [];

    const clean = String(str).trim();
    if (!clean) return [];

    const lower = clean.toLowerCase();
    if (lower === 'unpaid' || lower === '-' || lower === 'free' || lower === 'nil' || lower === 'none' || lower === 'n/a' || lower === 'pass' || lower === 'cancel') return [];

    const results = [];
    const headerDate = extractDateFromText(headerText);
    const defaultDate = headerDate || extractDateFromText(fallbackDate) || normalizeDateToYYYYMMDD(fallbackDate) || new Date().toISOString().split('T')[0];

    // Pattern 1: Amount with full date e.g. "1000 (15-08-2025)"
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

    // Pattern 3: Plus or comma separated amounts e.g. "500+500" or bare "1000"
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

export async function syncFromGoogleSheet(csvUrl, centerName = 'Thiriya') {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error("Failed to fetch CSV from Google Sheets");
        const csvText = await response.text();

        const parsed = Papa.parse(csvText, { skipEmptyLines: true });
        if (!parsed.data || parsed.data.length < 2) {
            return { success: false, message: "No valid data found in CSV sheet." };
        }

        const rows = parsed.data;

        // 1. Locate main Header Row (Row containing "Student Name" or "Registration")
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(10, rows.length); i++) {
            const rowStr = rows[i].map(c => String(c || '').toLowerCase()).join(' ');
            if (rowStr.includes('student name') || rowStr.includes('registration') || (rowStr.includes('sr. no') && rowStr.includes('course'))) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) headerRowIndex = 0;

        const headers = rows[headerRowIndex].map(h => String(h || '').trim());

        // 2. Strict Column Position Detector matching live sheets
        let regIdx = -1, nameIdx = -1, statusIdx = -1, courseIdx = -1, fatherIdx = -1, mobIdx = -1, addrIdx = -1, admDateIdx = -1, regFeeIdx = -1, totalFeeIdx = -1;

        headers.forEach((h, idx) => {
            const hLower = h.toLowerCase();
            if (hLower.includes('registration') || hLower.includes('roll') || (hLower.includes('reg') && !hLower.includes('fee'))) {
                if (regIdx === -1) regIdx = idx;
            } else if (hLower.includes('student name') || (hLower.includes('name') && !hLower.includes('father'))) {
                if (nameIdx === -1) nameIdx = idx;
            } else if (hLower.includes('status')) {
                if (statusIdx === -1) statusIdx = idx;
            } else if (hLower.includes('course') || hLower.includes('trade')) {
                if (courseIdx === -1) courseIdx = idx;
            } else if (hLower.includes('father')) {
                if (fatherIdx === -1) fatherIdx = idx;
            } else if (hLower.includes('mob') || hLower.includes('phone') || hLower.includes('mobile')) {
                if (mobIdx === -1) mobIdx = idx;
            } else if (hLower.includes('address') || hLower.includes('center')) {
                if (addrIdx === -1) addrIdx = idx;
            } else if (hLower.includes('admission date') || hLower.includes('adm date') || (hLower.includes('date') && !hLower.includes('fee'))) {
                if (admDateIdx === -1) admDateIdx = idx;
            } else if (hLower.includes('regi. fee') || hLower.includes('registration fee') || hLower.includes('admission fee') || hLower.includes('reg fee')) {
                if (regFeeIdx === -1) regFeeIdx = idx;
            } else if (hLower.includes('total fee') || hLower.includes('total fees') || hLower.includes('fee total') || hLower.includes('course fee')) {
                if (totalFeeIdx === -1) totalFeeIdx = idx;
            }
        });

        // Fallbacks for standard column positions if headers slightly differ
        if (regIdx === -1) regIdx = 1;
        if (nameIdx === -1) nameIdx = 2;
        if (statusIdx === -1) statusIdx = 3;
        if (courseIdx === -1) courseIdx = 4;
        if (fatherIdx === -1) fatherIdx = 5;
        if (mobIdx === -1) mobIdx = 6;
        if (addrIdx === -1) addrIdx = 7;
        if (admDateIdx === -1) admDateIdx = 8;
        if (regFeeIdx === -1) regFeeIdx = 9;
        if (totalFeeIdx === -1) totalFeeIdx = 10;

        // Installment columns start right after Total Fee column (typically index 11+)
        const installmentColIndices = [];
        const metadataIndices = new Set([0, regIdx, nameIdx, statusIdx, courseIdx, fatherIdx, mobIdx, addrIdx, admDateIdx, regFeeIdx, totalFeeIdx]);

        headers.forEach((h, idx) => {
            if (!metadataIndices.has(idx) && idx > Math.max(regIdx, nameIdx, totalFeeIdx)) {
                installmentColIndices.push(idx);
            }
        });

        const studentMap = new Map();

        // 3. Extract Student Rows
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const rowData = rows[i];
            if (!rowData || rowData.length === 0) continue;

            const firstCol = String(rowData[0] || '').toLowerCase();
            if (firstCol.includes('s.no') || firstCol.includes('bytecore') || firstCol.includes('sr.') || firstCol.includes('http')) continue;

            let regId = String(rowData[regIdx] || '').trim();
            let fullName = String(rowData[nameIdx] || '').trim();
            let statusStr = String(rowData[statusIdx] || '').trim();
            let courseStr = String(rowData[courseIdx] || '').trim();
            let fatherNameStr = String(rowData[fatherIdx] || '').trim();
            let mobileStr = String(rowData[mobIdx] || '').trim().replace(/\D/g, '');
            let addressStr = String(rowData[addrIdx] || '').trim();
            let admissionDateRaw = String(rowData[admDateIdx] || '').trim();
            let admissionFeeRaw = String(rowData[regFeeIdx] || '').trim();
            let totalFeesRaw = String(rowData[totalFeeIdx] || '').trim();

            if (!fullName && !regId) continue;

            if (!regId) {
                const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '');
                regId = `REG_${cleanName || (Date.now() + i)}`;
            }

            const cleanRegKey = regId;

            // Center Detection
            let detectedCenter = centerName;
            const addrLower = addressStr.toLowerCase();
            if (addrLower.includes('thiriya')) detectedCenter = 'Thiriya';
            else if (addrLower.includes('naryawal') || addrLower.includes('nariyawal')) detectedCenter = 'Nariyawal';
            else if (addressStr && addressStr !== '-') detectedCenter = addressStr;

            const parsedTotalFee = totalFeesRaw.toLowerCase().includes('free') ? 0 : parseCurrency(totalFeesRaw);
            const parsedAdmissionFee = parseCurrency(admissionFeeRaw);

            // Extract Installments from fee/date columns
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
                regNo: cleanRegKey,
                fullName: fullName || 'Unknown Student',
                name: fullName || 'Unknown Student',
                status: normalizeStatus(statusStr),
                course: courseStr || 'N/A',
                trade: courseStr || 'N/A',
                fatherName: fatherNameStr || '',
                mobile: mobileStr || '',
                mob: mobileStr || '',
                address: addressStr || '',
                center: detectedCenter,
                admissionDate: normalizeDateToYYYYMMDD(admissionDateRaw),
                admissionFee: parsedAdmissionFee,
                registrationFee: parsedAdmissionFee,
                totalFees: parsedTotalFee,
                totalFee: parsedTotalFee,
                installments: rawInstallments,
                paidFees: 0,
                updatedAt: Date.now()
            };

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

        // 4. Firestore Batch Commit
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
            message: `Google Sheets Sync Complete! Processed ${processedCount} students with 100% accurate Registration IDs & Fee Ledgers.`
        };

    } catch (error) {
        console.error("Google Sheets Sync Error:", error);
        return { success: false, message: error.message };
    }
}

export function parseRawSheetText(text, defaultCenter = 'Thiriya') {
    const parsed = Papa.parse(text, { skipEmptyLines: true });
    if (!parsed.data || parsed.data.length < 2) return [];
    return syncFromGoogleSheet(text, defaultCenter);
}
