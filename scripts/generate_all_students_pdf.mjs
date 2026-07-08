import fs from "fs";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const text = fs.readFileSync("sheet.csv", "utf-8");
const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
const data = parsed.data;

// Get current date
const now = new Date();
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Filter out students who have been admitted for more than 1 year
const filteredData = data.filter(row => {
    let ad = (row["Admission Date"] || "").trim();
    if (!ad) return true; // If no date, assume they are recent? The user said "jiske ek year ho gyi ho uska data na aye", so if no date, maybe keep them. Or maybe skip? Let's keep them.
    
    // Date format is DD-MM-YYYY
    const parts = ad.split("-");
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        const admissionDate = new Date(year, month, day);
        const timeDiff = now.getTime() - admissionDate.getTime();
        
        // Exclude if greater than or equal to 1 year
        if (timeDiff >= ONE_YEAR_MS) {
            return false;
        }
    }
    return true;
});

console.log(`Total rows: ${data.length}, After filtering > 1 year: ${filteredData.length}`);

const doc = new jsPDF();

doc.setFontSize(18);
doc.setTextColor(40, 40, 40);
doc.text("ByteCore Computer Centre", 14, 22);

doc.setFontSize(14);
doc.setTextColor(100, 100, 100);
doc.text("All Students (Admitted within Last 1 Year)", 14, 30);

const tableData = filteredData.map(row => [
    row["Registration"] || "N/A",
    row["Student Name "] || "N/A",
    row["Course "] || "N/A"
]);

autoTable(doc, {
    startY: 38,
    head: [['Roll Number', 'Student Name', 'Course']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 10, cellPadding: 4 }
});

const outputPath = "All_Students_Under_1_Year.pdf";
fs.writeFileSync(outputPath, doc.output());

console.log(`PDF successfully generated at: ${outputPath}`);
