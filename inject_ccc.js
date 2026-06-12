import fs from 'fs';
import { HINDI_QUIZ_DATA } from './src/data/hindiQuizData.js';

HINDI_QUIZ_DATA['ccc_mock_test'] = {
    title: "CCC Mock Test (NIELIT)",
    description: "LibreOffice & Internet Based Real Questions",
    icon: "monitor",
    color: "indigo",
    modules: {
        "Full Test 1": [
            {
                question: "LibreOffice Writer में डिफ़ॉल्ट फाइल एक्सटेंशन क्या होता है?",
                options: [".docx", ".odt", ".ods", ".odp"],
                correctAnswer: 1,
                explanation: ".odt (OpenDocument Text) LibreOffice Writer का डिफ़ॉल्ट फाइल एक्सटेंशन है।"
            },
            {
                question: "LibreOffice Calc में पूरे कॉलम को सेलेक्ट करने की शॉर्टकट की क्या है?",
                options: ["Ctrl + Space", "Shift + Space", "Ctrl + A", "Alt + Space"],
                correctAnswer: 0,
                explanation: "Ctrl + Space पूरे कॉलम को सेलेक्ट करने के लिए और Shift + Space पूरी रो (row) को सेलेक्ट करने के लिए उपयोग होता है।"
            },
            {
                question: "LibreOffice Impress में नई स्लाइड (New Slide) जोड़ने के लिए किस शॉर्टकट कुंजी का उपयोग किया जाता है?",
                options: ["Ctrl + N", "Ctrl + M", "Ctrl + S", "Shift + N"],
                correctAnswer: 1,
                explanation: "Ctrl + M का उपयोग नई स्लाइड इंसर्ट करने के लिए होता है, जबकि Ctrl + N से नया प्रेजेंटेशन खुलता है।"
            },
            {
                question: "LibreOffice में 'Save As' की शॉर्टकट कुंजी (Shortcut Key) क्या है?",
                options: ["F12", "Ctrl + Shift + S", "Ctrl + Alt + S", "Shift + F12"],
                correctAnswer: 1,
                explanation: "MS Office में F12 होता है, लेकिन LibreOffice में Save As के लिए Ctrl + Shift + S का उपयोग होता है।"
            },
            {
                question: "URL का पूर्ण रूप (Full Form) क्या है?",
                options: [
                    "Uniform Resource Locator",
                    "Universal Resource Locator",
                    "Uniform Resource Link",
                    "Unified Resource Locator"
                ],
                correctAnswer: 0,
                explanation: "URL (Uniform Resource Locator) इंटरनेट पर किसी भी वेबसाइट या फाइल का पता होता है।"
            },
            {
                question: "LibreOffice Calc में अधिकतम कितने कॉलम (Columns) होते हैं?",
                options: ["1024", "16384", "1048576", "256"],
                correctAnswer: 0,
                explanation: "Calc में 1024 कॉलम (AMJ तक) और 1,048,576 रो होती हैं।"
            },
            {
                question: "निम्नलिखित में से कौन सा एक वेब ब्राउज़र (Web Browser) नहीं है?",
                options: ["Google Chrome", "Mozilla Firefox", "Yahoo", "Microsoft Edge"],
                correctAnswer: 2,
                explanation: "Yahoo एक सर्च इंजन (Search Engine) और वेब पोर्टल है, न कि वेब ब्राउज़र।"
            },
            {
                question: "LibreOffice Writer में न्यूनतम (Minimum) और अधिकतम (Maximum) ज़ूम प्रतिशत कितना है?",
                options: ["10% - 500%", "20% - 600%", "10% - 400%", "5% - 3000%"],
                correctAnswer: 1,
                explanation: "Writer में आप न्यूनतम 20% और अधिकतम 600% तक ज़ूम कर सकते हैं।"
            },
            {
                question: "MAC Address कितने बिट (bit) का होता है?",
                options: ["32 bit", "48 bit", "64 bit", "128 bit"],
                correctAnswer: 1,
                explanation: "MAC (Media Access Control) एड्रेस 48 बिट (6 बाइट) का फिजिकल एड्रेस होता है।"
            },
            {
                question: "LibreOffice में 'Find and Replace' विकल्प किस मेनू में पाया जाता है?",
                options: ["File", "Edit", "View", "Tools"],
                correctAnswer: 1,
                explanation: "Find and Replace (Ctrl+H) का विकल्प Edit मेनू के अंदर होता है।"
            }
        ]
    }
};

const fileContent = `export const HINDI_QUIZ_DATA = ${JSON.stringify(HINDI_QUIZ_DATA, null, 4)};\n`;
fs.writeFileSync('./src/data/hindiQuizData.js', fileContent, 'utf-8');
console.log("CCC mock test injected!");
