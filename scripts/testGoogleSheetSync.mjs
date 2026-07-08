// testGoogleSheetSync.mjs
import fs from 'fs';
import Papa from 'papaparse';

function parseInstallment(str) {
    if (!str || str.trim() === '') return [];
    const dateRegex = /\(([^)]+)\)/;
    const dateMatch = str.match(dateRegex);
    if (!dateMatch) return [];
    const dateStr = dateMatch[1];
    const amountStr = str.replace(dateRegex, '').trim();

    if (amountStr.toLowerCase() === 'free') {
        return [{ amount: 0, date: dateStr, status: 'paid', note: 'Free' }];
    }

    const numbers = amountStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        const totalAmount = numbers.reduce((acc, curr) => acc + parseInt(curr, 10), 0);
        return [{ amount: totalAmount, date: dateStr, status: 'paid' }];
    }
    return [];
}

async function testFetchAndParse() {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSR3LLRHq4DsbOplvZ0JPfEOXjrR-wGfOUqpSUnunRD6PGiCCAX9VVcC-80-d8GEoTqQF--fX4bDjbh/pub?gid=0&single=true&output=csv";

    let text = "";
    try {
        const res = await fetch(url);
        text = await res.text();
    } catch (e) {
        console.log("Fetch failed, retrying...");
        const res = await fetch(url);
        text = await res.text();
    }

    const parsed = Papa.parse(text, { skipEmptyLines: true });

    if (parsed.errors.length) {
        console.error("PapaParse Errors:", parsed.errors);
    }

    const rows = parsed.data;
    if (rows.length < 2) {
        console.log("Not enough rows.");
        return;
    }

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

    console.log(`Found ${dataObjects.length} rows.`);

    const targetRow = dataObjects.find(r => r["Registration"] === "247" || r["Student Name"]?.includes("Saif Raza"));

    if (targetRow) {
        console.log("Target Row (247):", targetRow);

        let installments = [];
        const feeDateCells = Array.isArray(targetRow['Fee / Date']) ? targetRow['Fee / Date'] : [targetRow['Fee / Date']];
        for (const cellValue of feeDateCells) {
            if (cellValue && cellValue.trim() !== '') {
                const parsedInstalls = parseInstallment(cellValue.trim());
                installments = [...installments, ...parsedInstalls];
            }
        }
        console.log("Parsed Installments:", installments);

        let totalPaid = 0;
        installments.forEach(inst => totalPaid += inst.amount);
        console.log("Calculated Total Paid:", totalPaid);
    } else {
        console.log("Row 247 not found.");
        console.log("Last 5 rows:");
        for (let k = Math.max(0, dataObjects.length - 5); k < dataObjects.length; k++) {
            console.log(dataObjects[k]["Registration"], dataObjects[k]["Student Name"]);
        }
    }
}

testFetchAndParse().catch(console.error);
