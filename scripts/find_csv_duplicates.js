const fs = require('fs');
const path = require('path');
const os = require('os');

const nariyawalCsv = path.join(__dirname, 'src/assets/student data.csv');
const thiriyaCsv = path.join(__dirname, 'src/assets/bytecore thiriya.csv');

const rolls = new Map();
const duplicates = [];

function checkRoll(roll, name, source) {
    if (!roll || roll === '-' || roll.trim() === '') return;
    roll = roll.trim();
    name = name ? name.trim().split('(')[0] : 'Unknown';

    if (rolls.has(roll)) {
        duplicates.push({
            roll,
            name1: name,
            source1: source,
            name2: rolls.get(roll).name,
            source2: rolls.get(roll).source
        });
    } else {
        rolls.set(roll, { name, source });
    }
}

// Parse Nariyawal
if (fs.existsSync(nariyawalCsv)) {
    const text = fs.readFileSync(nariyawalCsv, 'utf-8');
    const lines = text.split(/\r?\n/);
    let currentLine = "";
    const reconstructedLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (/^\d+,\d+,/.test(line)) {
            if (currentLine) reconstructedLines.push(currentLine);
            currentLine = line;
        } else if (i === 0) {
            reconstructedLines.push(line);
        } else if (currentLine) {
            currentLine += " " + line;
        } else {
            currentLine = line;
        }
    }
    if (currentLine) reconstructedLines.push(currentLine);

    for (let i = 1; i < reconstructedLines.length; i++) {
        const row = reconstructedLines[i].split(',');
        if (row.length < 5) continue;
        const registration = row[1];
        const fullName = row[2];
        checkRoll(registration, fullName, 'Nariyawal CSV');
    }
} else {
    console.log("Nariyawal CSV not found at", nariyawalCsv);
}

// Parse Thiriya
if (fs.existsSync(thiriyaCsv)) {
    const text = fs.readFileSync(thiriyaCsv, 'utf-8');
    const lines = text.split(/\r?\n/);
    for (let i = 3; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = line.split(',');
        if (row.length < 5) continue;
        const registration = row[3];
        const fullName = row[1];
        checkRoll(registration, fullName, 'Thiriya CSV');
    }
} else {
    console.log("Thiriya CSV not found at", thiriyaCsv);
}

let output = "Duplicate Registration Numbers Report\n";
output += "========================================\n\n";

if (duplicates.length === 0) {
    output += "No duplicates found.\n";
} else {
    output += `Found ${duplicates.length} duplicate scenarios:\n\n`;
    duplicates.forEach(d => {
        output += `Roll Number: ${d.roll}\n`;
        output += `  1. ${d.name1} (from ${d.source1})\n`;
        output += `  2. ${d.name2} (from ${d.source2})\n`;
        output += `----------------------------------------\n`;
    });
}

const outputPath = path.join(os.homedir(), 'Desktop', 'duplicate_students.txt');
fs.writeFileSync(outputPath, output);
console.log('Saved to ' + outputPath);
