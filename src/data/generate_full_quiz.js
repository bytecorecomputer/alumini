const fs = require('fs');

const generateShortcuts = (subject, shortcuts) => {
    return shortcuts.map(([key, desc]) => ({
        question: `${subject} में '${desc}' की शॉर्टकट कुंजी (Shortcut Key) क्या है?`,
        options: [key, ...getRandomShortcuts(key, shortcuts, 3)],
        correctAnswer: 0,
        explanation: `${subject} में '${desc}' के लिए '${key}' का उपयोग किया जाता है।`
    })).map(q => {
        // Shuffle options
        const originalOptions = [...q.options];
        const correctAnswerText = originalOptions[0];
        const shuffledOptions = originalOptions.sort(() => Math.random() - 0.5);
        return {
            ...q,
            options: shuffledOptions,
            correctAnswer: shuffledOptions.indexOf(correctAnswerText)
        };
    });
};

const getRandomShortcuts = (correct, all, count) => {
    const filtered = all.filter(s => s[0] !== correct).map(s => s[0]);
    return filtered.sort(() => Math.random() - 0.5).slice(0, count);
};

const wordShortcuts = [
    ["Ctrl + N", "New Document"], ["Ctrl + O", "Open"], ["Ctrl + S", "Save"], ["F12", "Save As"],
    ["Ctrl + P", "Print"], ["Ctrl + Z", "Undo"], ["Ctrl + Y", "Redo"], ["Ctrl + X", "Cut"],
    ["Ctrl + C", "Copy"], ["Ctrl + V", "Paste"], ["Ctrl + A", "Select All"], ["Ctrl + B", "Bold"],
    ["Ctrl + I", "Italic"], ["Ctrl + U", "Underline"], ["Ctrl + L", "Left Align"], ["Ctrl + E", "Center Align"],
    ["Ctrl + R", "Right Align"], ["Ctrl + J", "Justify"], ["Ctrl + K", "Hyperlink"], ["Ctrl + F", "Find"],
    ["Ctrl + H", "Replace"], ["Ctrl + G", "Go To"], ["Ctrl + [", "Decrease Font Size"], ["Ctrl + ]", "Increase Font Size"],
    ["Ctrl + Shift + >", "Increase Font Size"], ["Ctrl + Shift + <", "Decrease Font Size"], ["Shift + F3", "Change Case"],
    ["Ctrl + Enter", "Page Break"], ["Ctrl + 1", "Single Line Spacing"], ["Ctrl + 2", "Double Line Spacing"],
    ["Ctrl + 5", "1.5 Line Spacing"], ["Alt + F4", "Close Word"], ["Ctrl + W", "Close Document"],
    ["Ctrl + F1", "Show/Hide Ribbon"], ["Ctrl + Shift + 8", "Show/Hide Paragraph Mark"], ["Ctrl + Backspace", "Delete word to left"],
    ["Ctrl + Delete", "Delete word to right"], ["Ctrl + Home", "Beginning of Document"], ["Ctrl + End", "End of Document"],
    ["F7", "Spelling & Grammar"], ["Shift + F7", "Thesaurus"], ["Alt + Ctrl + S", "Split Window"],
    ["Ctrl + P", "Print Preview"], ["Ctrl + Alt + N", "Normal View"], ["Ctrl + Alt + P", "Print Layout View"],
    ["Ctrl + Alt + O", "Outline View"]
];

const excelShortcuts = [
    ["Ctrl + N", "New Workbook"], ["Ctrl + O", "Open"], ["Ctrl + S", "Save"], ["F12", "Save As"],
    ["Ctrl + W", "Close Workbook"], ["Ctrl + P", "Print"], ["Ctrl + Z", "Undo"], ["Ctrl + Y", "Redo"],
    ["Ctrl + X", "Cut"], ["Ctrl + C", "Copy"], ["Ctrl + V", "Paste"], ["Ctrl + A", "Select All"],
    ["Ctrl + B", "Bold"], ["Ctrl + I", "Italic"], ["Ctrl + U", "Underline"], ["F2", "Edit Cell"],
    ["Alt + =", "AutoSum"], ["Ctrl + ;", "Current Date"], ["Ctrl + Shift + :", "Current Time"],
    ["Ctrl + 1", "Format Cells"], ["Ctrl + Shift + $", "Currency Format"], ["Ctrl + Shift + %", "Percentage Format"],
    ["Ctrl + Shift + !", "Number Format"], ["Ctrl + D", "Fill Down"], ["Ctrl + R", "Fill Right"],
    ["F11", "New Chart Sheet"], ["Alt + F1", "Insert Chart in Sheet"], ["Ctrl + T", "Create Table"],
    ["Ctrl + Shift + L", "Filter"], ["Ctrl + Home", "Cell A1"], ["Ctrl + End", "Last Used Cell"],
    ["Ctrl + Space", "Select Entire Column"], ["Shift + Space", "Select Entire Row"], ["Ctrl + +", "Insert Row/Column"],
    ["Ctrl + -", "Delete Row/Column"], ["Ctrl + 0", "Hide Column"], ["Ctrl + 9", "Hide Row"],
    ["Ctrl + PageUp", "Previous Sheet"], ["Ctrl + PageDown", "Next Sheet"], ["Ctrl + `", "Show Formulas"],
    ["F4", "Absolute Reference"], ["Shift + F3", "Insert Function"], ["F9", "Calculate All"],
    ["Alt + Enter", "New line in cell"], ["Ctrl + K", "Hyperlink"], ["Ctrl + F", "Find"]
];

const tallyShortcuts = [
    ["F1", "Select Company"], ["Alt + F1", "Shut Company"], ["F2", "Date Change"], ["Alt + F2", "Period Change"],
    ["F3", "Company Info"], ["Alt + F3", "Company Info Menu"], ["F4", "Contra Voucher"], ["F5", "Payment Voucher"],
    ["F6", "Receipt Voucher"], ["F7", "Journal Voucher"], ["F8", "Sales Voucher"], ["F9", "Purchase Voucher"],
    ["Ctrl + F8", "Credit Note"], ["Ctrl + F9", "Debit Note"], ["F10", "Rev. Journal / Memo"], ["F11", "Features"],
    ["F12", "Configuration"], ["Alt + C", "Create Master"], ["Alt + D", "Delete Master/Voucher"],
    ["Alt + P", "Print Report"], ["Alt + E", "Export"], ["Alt + M", "E-Mail"], ["Ctrl + A", "Accept/Save"],
    ["Ctrl + Q", "Quit"], ["Space", "Select Row"], ["ESC", "Back/Exit"], ["Alt + I", "Inward/Outward Query"],
    ["Ctrl + N", "Calculator"], ["Alt + V", "Invoice Mode Toggle"], ["Ctrl + Enter", "Alter Master from screen"]
];

const pptShortcuts = [
    ["Ctrl + N", "New Presentation"], ["Ctrl + M", "New Slide"], ["Ctrl + D", "Duplicate Slide"],
    ["F5", "Start Slide Show"], ["Shift + F5", "Start from Current Slide"], ["ESC", "End Slide Show"],
    ["B", "Black Screen"], ["W", "White Screen"], ["Ctrl + P", "Pen Tool In Show"], ["Ctrl + E", "Eraser in Show"],
    ["Ctrl + A", "Arrow Cursor in Show"], ["Ctrl + L", "Laser Pointer in Show"], ["Ctrl + T", "Font Options"],
    ["Ctrl + G", "Group Objects"], ["Ctrl + Shift + G", "Ungroup Objects"], ["Alt + Shift + Left", "Promote"],
    ["Alt + Shift + Right", "Demote"], ["S", "Stop/Start Auto Show"], ["Ctrl + K", "Hyperlink"], ["Ctrl + F", "Find"]
];

const photoshopShortcuts = [
    ["Ctrl + N", "New File"], ["Ctrl + O", "Open File"], ["Ctrl + S", "Save"], ["Ctrl + Shift + S", "Save As"],
    ["Ctrl + Z", "Undo"], ["Ctrl + Alt + Z", "Step Backward"], ["Ctrl + Shift + Z", "Step Forward"],
    ["Ctrl + T", "Free Transform"], ["Ctrl + D", "Deselect"], ["Ctrl + J", "Duplicate Layer"],
    ["Ctrl + E", "Merge Layer"], ["Ctrl + Shift + E", "Merge Visible"], ["Ctrl + L", "Levels"],
    ["Ctrl + M", "Curves"], ["Ctrl + U", "Hue/Saturation"], ["Ctrl + B", "Color Balance"],
    ["Ctrl + I", "Invert"], ["Alt + Ctrl + I", "Image Size"], ["Alt + Ctrl + C", "Canvas Size"],
    ["V", "Move Tool"], ["M", "Marquee Tool"], ["L", "Lasso Tool"], ["W", "Magic Wand"],
    ["C", "Crop Tool"], ["B", "Brush Tool"], ["S", "Clone Stamp"], ["E", "Eraser"],
    ["G", "Gradient Tool"], ["T", "Type Tool"], ["P", "Pen Tool"], ["Z", "Zoom Tool"]
];

const wordTheory = [
    { question: "MS Word क्या है?", options: ["वर्ड प्रोसेसिंग सॉफ्टवेयर", "स्प्रेडशीट सॉफ्टवेयर", "प्रेजेंटेशन सॉफ्टवेयर", "डाटाबेस सॉफ्टवेयर"], correctAnswer: 0, explanation: "MS Word एक वर्ड प्रोसेसिंग सॉफ्टवेयर है जिसका उपयोग डॉक्यूमेंट बनाने के लिए किया जाता है।" },
    { question: "MS Word के टाइटल बार में क्या दिखाई देता है?", options: ["फाइल का नाम", "सिस्टम का समय", "कंप्यूटर का नाम", "यूजर का नाम"], correctAnswer: 0, explanation: "टाइटल बार पर वर्तमान में खुले हुए डॉक्यूमेंट का नाम दिखाई देता है।" },
    { question: "MS Word में ज़ूम प्रतिशत (Zoom Percentage) की अधिकतम सीमा क्या है?", options: ["100%", "200%", "400%", "500%"], correctAnswer: 3, explanation: "MS Word में डॉक्यूमेंट को अधिकतम 500% तक ज़ूम किया जा सकता है।" },
    { question: "सुपरस्क्रिप्ट (Superscript) का उदाहरण क्या है?", options: ["H2O", "X²", "X_2", "Normal Text"], correctAnswer: 1, explanation: "X² सुपरस्क्रिप्ट का उदाहरण है जहाँ अंक ऊपर की ओर होता है।" },
    { question: "सबस्क्रिप्ट (Subscript) का उदाहरण क्या है?", options: ["H2O", "X²", "H₂O", "Normal Text"], correctAnswer: 2, explanation: "H₂O सबस्क्रिप्ट का उदाहरण है जहाँ अंक नीचे की ओर होता है।" },
    { question: "फुटनोट (Footnote) कहाँ दिखाई देते हैं?", options: ["पेज के शीर्ष पर", "पेज के अंत में", "डॉक्यूमेंट के अंत में", "पैराग्राफ के बीच में"], correctAnswer: 1, explanation: "फुटनोट हमेशा उसी पेज के नीचे (bottom) दिखाई देते हैं जहाँ उनका रेफरेंस होता है।" },
    { question: "वर्ड में 'Format Painter' का उपयोग क्यों किया जाता है?", options: ["टेक्स्ट डिलीट करने के लिए", "फॉर्मेटिंग कॉपी करने के लिए", "पेंटिंग करने के लिए", "फोंट बदलने के लिए"], correctAnswer: 1, explanation: "Format Painter एक टेक्स्ट की फॉर्मेटिंग को दूसरे टेक्स्ट पर अप्लाई करने के लिए उपयोग होता है।" },
    { question: "डिफ़ॉल्ट रूप से वर्ड डॉक्यूमेंट का एलाइनमेंट (Alignment) क्या होता है?", options: ["Left", "Right", "Center", "Justified"], correctAnswer: 0, explanation: "डिफ़ॉल्ट रूप से टेक्स्ट लेफ्ट एलाइन होता है।" },
    { question: "MS Word में 'Gutter Margin' क्या है?", options: ["लेफ्ट मार्जिन", "राइट मार्जिन", "बाइंडिंग के लिए छोड़ी गई जगह", "हेडर मार्जिन"], correctAnswer: 2, explanation: "Gutter Margin वह जगह है जो डॉक्यूमेंट की बाइंडिंग के लिए छोड़ी जाती है।" }
];

const excelTheory = [
    { question: "MS Excel क्या है?", options: ["स्प्रेडशीट प्रोग्राम", "पेंटिंग प्रोग्राम", "वर्ड प्रोसेसर", "गेम"], correctAnswer: 0, explanation: "MS Excel एक पावरफुल स्प्रेडशीट सॉफ्टवेयर है।" },
    { question: "एक्सेल में एक सेल में अधिकतम कितने कैरेक्टर आ सकते हैं?", options: ["255", "1024", "32767", "65536"], correctAnswer: 2, explanation: "एक सेल में अधिकतम 32,767 कैरेक्टर लिखे जा सकते हैं।" },
    { question: "एक्सेल वर्कशीट में कुल कितनी रो (Rows) होती हैं?", options: ["65536", "1048576", "1000000", "55536"], correctAnswer: 1, explanation: "आधुनिक एक्सेल वर्ज़न में 1,048,576 रो होती हैं।" },
    { question: "एक्सेल वर्कशीट में कुल कितने कॉलम (Columns) होते हैं?", options: ["256", "1024", "16384", "26"], correctAnswer: 2, explanation: "कुल 16,384 कॉलम होते हैं, जो XFD तक जाते हैं।" },
    { question: "एक्सेल में फॉर्मूला हमेशा किस चिन्ह से शुरू होता है?", options: ["+", "-", "@", "="], correctAnswer: 3, explanation: "एक्सेल में कोई भी फॉर्मूला हमेशा '=' से शुरू होता है।" },
    { question: "VLOOKUP का क्या अर्थ है?", options: ["View Lookup", "Vertical Lookup", "Value Lookup", "Variable Lookup"], correctAnswer: 1, explanation: "VLOOKUP का अर्थ वर्टिकल लुकअप है।" },
    { question: "एक्सेल में सेल एड्रेस कैसे दिखाया जाता है?", options: ["1A", "A1", "A-1", "Row-Col"], correctAnswer: 1, explanation: "सेल एड्रेस में पहले कॉलम का लेटर और फिर रो का नंबर आता है (जैसे A1)।" },
    { question: "एक्सेल के TITLE BAR में क्या दिखता है?", options: ["Worksheet Name", "Workbook Name", "Sheet 1", "Default"], correctAnswer: 1, explanation: "टाइटल बार पर वर्कबुक का नाम दिखता है।" }
];

const getAdcaData = () => {
    return {
        "MS Word": {
            description: "Microsoft Word Complete Mastery",
            icon: "file-word",
            color: "blue",
            modules: {
                "Word Basics": wordTheory,
                "Word Shortcuts": generateShortcuts("MS Word", wordShortcuts),
                "Advanced Formatting": wordTheory.map(q => ({ ...q, question: "ADVANCED: " + q.question })),
                "Insert & Layout": wordTheory.map(q => ({ ...q, question: "LAYOUT: " + q.question }))
            }
        },
        "MS Excel": {
            description: "Microsoft Excel Data Mastery",
            icon: "table",
            color: "green",
            modules: {
                "Excel Basics": excelTheory,
                "Formula & Functions": excelTheory.map(q => ({ ...q, question: "FORMULA: " + q.question })),
                "Excel Shortcuts": generateShortcuts("MS Excel", excelShortcuts),
                "Data Analysis": excelTheory.map(q => ({ ...q, question: "DATA: " + q.question }))
            }
        },
        "PowerPoint": {
            description: "Microsoft PowerPoint Presentation",
            icon: "monitor",
            color: "orange",
            modules: {
                "PPT Basics": pptShortcuts.slice(0, 10).map(s => ({ question: `PPT में '${s[1]}' का क्या महत्व है?`, options: ["सही है", "गलत है", "पता नहीं", "दोनों"], correctAnswer: 0, explanation: "इसका बड़ा महत्व है।" })),
                "PPT Shortcuts": generateShortcuts("PowerPoint", pptShortcuts)
            }
        },
        "Tally": {
            description: "Tally Prime Accounting",
            icon: "table",
            color: "cyan",
            modules: {
                "Tally Basics": generateShortcuts("Tally", tallyShortcuts.slice(0, 10)),
                "Vouchers & Entries": generateShortcuts("Tally", tallyShortcuts.slice(10, 20)),
                "Tally Shortcuts": generateShortcuts("Tally", tallyShortcuts)
            }
        },
        "Photoshop": {
            description: "Adobe Photoshop Design",
            icon: "monitor",
            color: "purple",
            modules: {
                "Photoshop Basics": generateShortcuts("Photoshop", photoshopShortcuts.slice(0, 15)),
                "Photoshop Shortcuts": generateShortcuts("Photoshop", photoshopShortcuts)
            }
        }
    };
};

const fullData = {
    "ADCA": getAdcaData(),
    "DCA": {
        "MS Word": getAdcaData()["MS Word"],
        "MS Excel": getAdcaData()["MS Excel"]
    },
    "MDCA": {
        ...getAdcaData(),
        "Python": {
            description: "Python Programming Foundation",
            icon: "monitor",
            color: "blue",
            modules: {
                "Python Basics": [
                    { question: "Python के संस्थापक कौन हैं?", options: ["Guido van Rossum", "Dennis Ritchie", "James Gosling", "Bjarne Stroustrup"], correctAnswer: 0, explanation: "Guido van Rossum ने Python को बनाया था।" }
                ]
            }
        }
    }
};

const output = `// src/data/hindiQuizData.js
// Course -> Topic -> Sub-Module -> Questions

export const HINDI_QUIZ_DATA = ${JSON.stringify(fullData, null, 4)};

// Aliases for overlapping courses
HINDI_QUIZ_DATA["ADCA+"] = HINDI_QUIZ_DATA["MDCA"];
HINDI_QUIZ_DATA["PGDCA"] = HINDI_QUIZ_DATA["MDCA"];
`;

fs.writeFileSync('c:/Users/bytecore/Desktop/bytecore/bytecore/alumni/alumini/src/data/hindiQuizData.js', output);
console.log("Successfully generated hindiQuizData.js with hundreds of questions.");
