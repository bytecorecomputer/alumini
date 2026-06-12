import fs from 'fs';
import { HINDI_QUIZ_DATA } from './src/data/hindiQuizData.js';

const flatModules = {};

// Key mapping from old display titles to new module IDs
const keyMap = {
    "MS Word": "ms_word",
    "MS Excel": "ms_excel",
    "MS PowerPoint": "ms_powerpoint",
    "Tally ERP 9": "tally", // Assuming Tally
    "Internet & E-mail": "internet_basics",
    "CorelDRAW": "coreldraw",
    "Python": "python",
    "Advance Excel": "advance_excel",
    "Marg ERP": "marg",
    "Busy Accounting": "busy",
    "Hindi/English Typing": "typing",
    "Photoshop": "photoshop",
    "HTML & CSS": "html", // Simplified, might need splitting or keep as html
    "JavaScript": "js",
    "LibreOffice Writer": "libre_writer",
    "LibreOffice Calc": "libre_calc",
    "LibreOffice Impress": "libre_impress"
};

for (const courseKey in HINDI_QUIZ_DATA) {
    const course = HINDI_QUIZ_DATA[courseKey];
    for (const topicKey in course) {
        let mappedKey = keyMap[topicKey];
        if (!mappedKey) {
            // auto generate key if not in map
            mappedKey = topicKey.toLowerCase().replace(/[^a-z0-9]/g, '_');
            keyMap[topicKey] = mappedKey;
        }
        
        // Save to flat modules if not already exists
        if (!flatModules[mappedKey]) {
            flatModules[mappedKey] = {
                title: topicKey,
                ...course[topicKey]
            };
        }
    }
}

// Write the new flat modules out
const fileContent = `export const HINDI_QUIZ_DATA = ${JSON.stringify(flatModules, null, 4)};\n`;
fs.writeFileSync('./src/data/hindiQuizData.js', fileContent, 'utf-8');
console.log("Migration complete!");
