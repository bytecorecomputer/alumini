import fs from "fs";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Read the downloaded CSV file
const text = fs.readFileSync("sheet.csv", "utf-8");
const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
const data = parsed.data;

// Filter for active students (Unpaid) from Nariyawal
const filteredData = data.filter(row => {
    const address = (row["Address "] || "").toLowerCase();
    const status = (row["Status "] || "").toLowerCase();
    
    const isNariyawal = address.includes("nariyawal") || address.includes("nariaywal");
    const isUnpaid = status.includes("unpaid");
    // "active" basically means not passed/cancelled, and they are unpaid.
    
    return isNariyawal && isUnpaid;
});

console.log(`Found ${filteredData.length} unpaid active students from Nariyawal.`);

// Initialize jsPDF
const doc = new jsPDF();

// Add Title and Header
doc.setFontSize(18);
doc.setTextColor(40, 40, 40);
doc.text("ByteCore Computer Centre", 14, 22);

doc.setFontSize(14);
doc.setTextColor(100, 100, 100);
doc.text("Unpaid & Active Students - Nariyawal Branch", 14, 30);

doc.setFontSize(10);
doc.setTextColor(150, 150, 150);
doc.text("Please clear your dues and download the ByteCore App.", 14, 36);

// Prepare data for table
const tableData = filteredData.map(row => [
    row["Registration"] || "N/A",
    row["Student Name "] || "N/A",
    row["Course "] || "N/A",
    row["Status "] ? row["Status "].trim() : "Unpaid"
]);

import autoTable from "jspdf-autotable";

// Add Table
autoTable(doc, {
    startY: 42,
    head: [['Roll Number', 'Student Name', 'Course', 'Fee Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 10, cellPadding: 4 }
});

// Save PDF
const outputPath = "Nariyawal_Active_Unpaid_Students.pdf";
fs.writeFileSync(outputPath, doc.output());

console.log(`PDF successfully generated at: ${outputPath}`);
