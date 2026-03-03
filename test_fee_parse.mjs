import Papa from 'papaparse';

const csvText = `ByteCore Computer Centre Thiriya,,,,,,,,,,,,,,,,,,,,,,,,,,
Sr. No.,Registration NO.,Student Name ,Status ,Course ,Fathers Name ,Mob. No.,Address ,Admission Date,Regi. Fee,Total Fee,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date ,Fee - Date ,Fee - Date ,Fee - Date
72,2040,Sahista Noor,Paid,ADCA+,Maqsood Ali,9548942239,Thiriya,2/27/2026,,7000,(02-12-2025),,,,,,,,,,,,,,,,
`;

function parseAmount(str) {
    if (!str || str.trim() === '') return [];

    const dateRegex = /\(([^)]+)\)/;
    const dateMatch = str.match(dateRegex);

    if (!dateMatch) return [];

    const dateStr = dateMatch[1];
    const amountStr = str.replace(dateRegex, '').trim();

    if (amountStr.toLowerCase() === 'free') {
        return [{ amount: 0, date: dateStr, status: 'paid', note: 'Free' }];
    }

    // IF amountStr IS EMPTY, THAT MEANS THERE'S ONLY A DATE e.g. "(02-12-2025)"
    // This could indicate they just logged the date and assumed the full amount or standard installment?
    // User wants it to match Nariyawal. Let's look at Nariyawal standard input. Usually it's "1000 (02-12-2025)"
    // The user screenshot shows Sahista Noor Paid ADCA+ with NO fee columns filled in the picture?? Wait, row 72 has nothing in Fee - Date. 
    // Ah, wait. The screenshot shows Fee - Date columns are literally empty in the sheet!
    // Let me log the exact output.

    const numbers = amountStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        const totalAmount = numbers.reduce((acc, curr) => acc + parseInt(curr, 10), 0);
        return [{ amount: totalAmount, date: dateStr, status: 'paid' }];
    } else if (amountStr === '') {
        // What do we do if it's just a date? 0 amount? or ignore?
        return [{ amount: 0, date: dateStr, status: 'paid' }];
    }

    return [];
}

console.log(parseAmount("1000 (12-12-2025)"));
console.log(parseAmount("(12-12-2025)"));
console.log(parseAmount(""));
