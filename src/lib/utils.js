import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function parseDateToYYYYMM(dateStr) {
    if (!dateStr) return null;
    const cleanStr = dateStr.toString().trim().toLowerCase();
    
    const isoMatch = cleanStr.match(/^(\d{4})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`;

    const months = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    let foundMonth = null;
    for (const [name, num] of Object.entries(months)) {
        if (cleanStr.includes(name)) {
            foundMonth = num;
            break;
        }
    }

    const yearMatch = cleanStr.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    if (foundMonth) return `${year}-${foundMonth}`;

    const slashMatch = cleanStr.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
    if (slashMatch) {
        let y = slashMatch[3];
        if (y.length === 2) y = "20" + y;

        // The "Admission Date" column comes straight from Google Sheets'
        // auto-formatted date cells, which (for a sheet on the default US
        // locale) export as M/D/YYYY, not D/M/YYYY. We previously assumed
        // the SECOND number was the month (D/M/YYYY) and only swapped when
        // that number was > 12. That's backwards for M/D/YYYY data: any date
        // where the day happened to be ≤ 12 got its day value used as the
        // month instead of the real month, e.g. "3/7/2024" (7 Mar 2024) was
        // silently filed under July. This is why one month's numbers looked
        // wildly inflated — it was quietly absorbing entries from every
        // other month whose day-of-month matched the affected month number.
        //
        // Fix: treat the FIRST number as the month (M/D/YYYY) by default,
        // and only swap to D/M/YYYY if the first number is > 12 (which can
        // only happen if it's actually a day, proving the format really is
        // D/M/YYYY for that particular cell).
        let m = slashMatch[1].padStart(2, '0');

        if (parseInt(m, 10) > 12) {
            m = slashMatch[2].padStart(2, '0');
        }

        if (parseInt(m, 10) > 12 || parseInt(m, 10) === 0) return null;
        return `${y}-${m}`;
    }
    return null;
}

export function normalizeDateToYYYYMMDD(dateStr) {
    if (!dateStr || dateStr.trim() === '') return '';
    let str = dateStr.trim();
    
    // Handle DD-MM-YYYY or DD/MM/YYYY
    const parts = str.split(/[-/]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`; // Already YYYY-MM-DD
        if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD-MM-YYYY -> YYYY-MM-DD
        if (parts[2].length === 2) return `20${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD-MM-YY -> YYYY-MM-DD
    }
    return str; // Fallback
}

export function calculateCourseExpiry(student) {
    const admissionDateStr = student.admissionDate;
    const courseName = student.course;
    const totalFees = Number(student.totalFees) || 0;
    
    if (!admissionDateStr || !courseName) return null;
    let durationMonths = 6;
    const course = courseName.toUpperCase();
    
    // Special Rule for Scholarship / Registration-only Free students
    if (totalFees === 500) {
        durationMonths = 12; // Strictly 1 year for these cases
    } else {
        // Standard Course Durations
        if (course.includes('DCST') || course.includes('CCC')) durationMonths = 3;
        else if (course.includes('O LEVEL')) durationMonths = 12;
        else if (course.includes('ADCA') || course.includes('MDCA')) {
            durationMonths = 12; // Default 1 year
            // Smart Expiry: If any installment is >= 1000, consider it a 6-month fast-track
            const hasHighInstallments = student.installments && student.installments.some(inst => Number(inst.amount) >= 1000);
            if (hasHighInstallments || totalFees < 4500) {
                durationMonths = 6;
            }
        }
    }
    
    // Parse admission date carefully
    let admission = new Date(admissionDateStr);
    if (isNaN(admission.getTime())) {
        // Fallback for DD/MM/YYYY or DD-MM-YYYY formats if raw parsing fails
        const parts = admissionDateStr.split(/[-/]/);
        if (parts.length === 3) {
             let d = parts[0], m = parts[1], y = parts[2];
             if (y.length === 2) y = "20" + y;
             if (d.length === 4) { y = d; d = parts[2]; }
             admission = new Date(`${y}-${m}-${d}`);
        }
    }
    
    if (isNaN(admission.getTime())) return null;
    
    const expiryDate = new Date(admission);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    return { duration: durationMonths, isCompleted: new Date() > expiryDate };
}
