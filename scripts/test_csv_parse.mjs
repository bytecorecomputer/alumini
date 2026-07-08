import Papa from 'papaparse';

const csvText = `ByteCore Computer Centre Thiriya,,,,,,,,,,,,,,,,,,,,,,,,,,
Sr. No.,Registration NO.,Student Name ,Status ,Course ,Fathers Name ,Mob. No.,Address ,Admission Date,Regi. Fee,Total Fee,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date,Fee - Date ,Fee - Date ,Fee - Date ,Fee - Date ,Fee - Date ,Fee - Date
1,2001,Mohd Tauseef,Unpaid,ADCA,Ahmad Miya,,Thiriya,9/2/2025,,6000,1000 (12-12-2025),,,,,,,,,,,,,,,,
`;

function parseCSV(str) {
    const parsed = Papa.parse(str, { skipEmptyLines: true });
    const rows = parsed.data;
    if (rows.length < 2) return [];

    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
        const rowStr = rows[i].join('').toLowerCase();
        if (rowStr.includes('student name') || rowStr.includes('registration')) {
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

console.log(parseCSV(csvText));
