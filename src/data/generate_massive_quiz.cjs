const fs = require('fs');

const generateShortcuts = (subject, shortcuts) => {
    return shortcuts.map(([key, desc]) => ({
        question: `${subject} में '${desc}' की शॉर्टकट कुंजी (Shortcut Key) क्या है?`,
        options: [key, ...getRandomShortcuts(key, shortcuts, 3)],
        correctAnswer: 0,
        explanation: `${subject} में '${desc}' के लिए '${key}' का उपयोग किया जाता है।`
    })).map(q => {
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

// --- DATA DEFINITION ---

const wordShortcuts = [
    ["Ctrl+N", "नया डॉक्यूमेंट (New Document)"], ["Ctrl+O", "ओपन (Open)"], ["Ctrl+S", "सेव (Save)"], ["F12", "सेव एज़ (Save As)"],
    ["Ctrl+P", "प्रिंट (Print)"], ["Ctrl+Z", "अनडू (Undo)"], ["Ctrl+Y", "रीडू (Redo)"], ["Ctrl+X", "कट (Cut)"],
    ["Ctrl+C", "कॉपी (Copy)"], ["Ctrl+V", "पेस्ट (Paste)"], ["Ctrl+A", "सभी सिलेक्ट (Select All)"], ["Ctrl+B", "बोल्ड (Bold)"],
    ["Ctrl+I", "इटैलिक (Italic)"], ["Ctrl+U", "अंडरलाइन (Underline)"], ["Ctrl+L", "लेफ्ट एलाइन (Left Align)"], ["Ctrl+E", "सेंटर एलाइन (Center Align)"],
    ["Ctrl+R", "राइट एलाइन (Right Align)"], ["Ctrl+J", "जस्टिफाई (Justify)"], ["Ctrl+K", "हाइपरलिंक (Hyperlink)"], ["Ctrl+F", "ढूँढना (Find)"],
    ["Ctrl+H", "बदलना (Replace)"], ["Ctrl+G", "गो टू (Go To)"], ["Ctrl+[", "फॉन्ट साइज छोटा"], ["Ctrl+]", "फॉन्ट साइज बड़ा"],
    ["Ctrl+Shift+>", "फॉन्ट साइज बढ़ाना"], ["Ctrl+Shift+<", "फॉन्ट साइज घटाना"], ["Shift+F3", "केस बदलना (Change Case)"],
    ["Ctrl+Enter", "पेज ब्रेक (Page Break)"], ["Ctrl+1", "सिंगल लाइन स्पेसिंग"], ["Ctrl+2", "डबल लाइन स्पेसिंग"],
    ["Ctrl+5", "1.5 लाइन स्पेसिंग"], ["Alt+F4", "वर्ड बंद करना"], ["Ctrl+W", "डॉक्यूमेंट बंद करना"],
    ["Ctrl+F1", "रिबन दिखाना/छिपाना"], ["Ctrl+Shift+8", "पैराग्राफ मार्क"], ["Ctrl+Backspace", "बाएं शब्द मिटाना"],
    ["Ctrl+Delete", "दाएं शब्द मिटाना"], ["Ctrl+Home", "शुरुआत में जाना"], ["Ctrl+End", "अंत में जाना"],
    ["F7", "स्पेलिंग चेक"], ["Shift+F7", "थिसॉरस (Thesaurus)"], ["Alt+Ctrl+S", "विंडो स्प्लिट"],
    ["Ctrl+P", "प्रिंट प्रीव्यू"], ["Ctrl+Alt+N", "नॉर्मल व्यू"], ["Ctrl+Alt+P", "प्रिंट लेआउट व्यू"]
];

const excelShortcuts = [
    ["Ctrl+N", "नई वर्कबुक (New Workbook)"], ["Ctrl+O", "ओपन (Open)"], ["Ctrl+S", "सेव (Save)"], ["F12", "सेव एज़ (Save As)"],
    ["Ctrl+W", "वर्कबुक बंद करना"], ["Ctrl+P", "प्रिंट (Print)"], ["Ctrl+Z", "अनडू (Undo)"], ["Ctrl+Y", "रीडू (Redo)"],
    ["Ctrl+X", "कट (Cut)"], ["Ctrl+C", "कॉपी (Copy)"], ["Ctrl+V", "पेस्ट (Paste)"], ["Ctrl+A", "पूरी शीट सिलेक्ट"],
    ["Ctrl+B", "बोल्ड (Bold)"], ["Ctrl+I", "इटैलिक (Italic)"], ["Ctrl+U", "अंडरलाइन (Underline)"], ["F2", "सेल एडिट करना"],
    ["Alt+=", "ऑटो सम (AutoSum)"], ["Ctrl+;", "आज की तारीख"], ["Ctrl+Shift+:", "अभी का समय"],
    ["Ctrl+1", "फॉर्मेट सेल्स"], ["Ctrl+Shift+$", "करेंसी फॉर्मेट"], ["Ctrl+Shift+%", "परसेंटेज फॉर्मेट"],
    ["Ctrl+D", "नीचे फिल (Fill Down)"], ["Ctrl+R", "दाएं फिल (Fill Right)"], ["F11", "नया चार्ट बनाना"],
    ["Alt+F1", "सीट में चार्ट डालना"], ["Ctrl+T", "टेबल बनाना"], ["Ctrl+Shift+L", "फिल्टर लगाना"],
    ["Ctrl+Home", "A1 सेल पर जाना"], ["Ctrl+End", "अंतिम सेल पर जाना"], ["Ctrl+Space", "कॉलम सिलेक्ट"],
    ["Shift+Space", "रो सिलेक्ट"], ["Ctrl++", "रो/कॉलम जोड़ना"], ["Ctrl+-", "रो/कॉलम हटाना"],
    ["Ctrl+0", "कॉलम छिपाना"], ["Ctrl+9", "रो छिपाना"], ["Ctrl+PageUp", "पिछली शीट"],
    ["Ctrl+PageDown", "अगली शीट"], ["Ctrl+`", "फॉर्मूला दिखाना"]
];

const tallyShortcuts = [
    ["F1", "कंपनी सिलेक्ट करना"], ["Alt+F1", "कंपनी बंद करना"], ["F2", "तारीख बदलना"], ["Alt+F2", "पीरियड बदलना"],
    ["F3", "कंपनी जानकारी"], ["F4", "कंट्रा वाउचर (Contra)"], ["F5", "पेमेंट वाउचर (Payment)"], ["F6", "रिसीप्ट वाउचर (Receipt)"],
    ["F7", "जर्नल वाउचर (Journal)"], ["F8", "सेल्स वाउचर (Sales)"], ["F9", "पर्चेस वाउचर (Purchase)"],
    ["Ctrl+F8", "क्रेडिट नोट"], ["Ctrl+F9", "डेबिट नोट"], ["F11", "फीचर्स (Features)"], ["F12", "कॉन्फ़िगरेशन"],
    ["Alt+C", "नया लेजर बनाना"], ["Alt+D", "डिलीट करना"], ["Alt+P", "प्रिंट रिपोर्ट"], ["Ctrl+A", "एक्सेप्ट/सेव"],
    ["Ctrl+Q", "क्विट (Quit)"], ["Alt+I", "इनवॉइस मोड"], ["Ctrl+Enter", "लेजर बदलना"]
];

const wordTheories = [
    { question: "MS Word क्या है?", options: ["सॉफ्टवेयर", "हार्डवेयर", "प्रिंटर", "माउस"], correctAnswer: 0, explanation: "यह एक वर्ड प्रोसेसिंग सॉफ्टवेयर है।" },
    { question: "वर्ड में अधिकतम ज़ूम कितना होता है?", options: ["100%", "200%", "400%", "500%"], correctAnswer: 3, explanation: "अधिकतम 500% तक ज़ूम कर सकते हैं।" },
    { question: "डिफ़ॉल्ट रूप से डॉक्यूमेंट का नाम क्या होता है?", options: ["Document1", "Sheet1", "Slide1", "Untitled"], correctAnswer: 0, explanation: "यह Document1 के नाम से शुरू होता है।" },
    { question: "सुपरस्क्रिप्ट (X²) के लिए सही उदाहरण है?", options: ["H2O", "X2", "Math", "Science"], correctAnswer: 1, explanation: "पावर में लिखने को सुपरस्क्रिप्ट कहते हैं।" },
    { question: "मेल मर्ज (Mail Merge) किस काम आता है?", options: ["ईमेल के लिए", "एक लेटर कई लोगों को भेजने के लिए", "पेंटिंग के लिए", "गेमिंग"], correctAnswer: 1, explanation: "यह बल्क लेटर टाइपिंग के लिए है।" },
    { question: "पेज ओरिएंटेशन (Orientation) के दो प्रकार कौन से हैं?", options: ["Portrait & Landscape", "Top & Bottom", "Left & Right", "Inside & Outside"], correctAnswer: 0, explanation: "पेज का टेढ़ा या सीधा होना।" },
    { question: "हेडर (Header) पेज में कहाँ होता है?", options: ["Top", "Bottom", "Middle", "Left"], correctAnswer: 0, explanation: "हेडर हमेशा पेज के सबसे ऊपर होता है।" },
    { question: "फुटर (Footer) पेज में कहाँ होता है?", options: ["Top", "Bottom", "Left", "Right"], correctAnswer: 1, explanation: "फुटर हमेशा पेज के सबसे नीचे होता है।" },
    { question: "वाटरमार्क (Watermark) क्यों उपयोग करते हैं?", options: ["बैकग्राउंड में हल्का टेक्स्ट दिखाने के लिए", "फोटो के लिए", "डिलीट करने के लिए", "कलर के लिए"], correctAnswer: 0, explanation: "सुरक्षा या ब्रांडिंग के लिए।" },
    { question: "हाइपरलिंक (Hyperlink) का क्या काम है?", options: ["फाइल जोड़ने के लिए", "लिंक बनाने के लिए", "वेबसाइट खोलने के लिए", "सभी"], correctAnswer: 3, explanation: "यह अन्य रिसोर्स से जोड़ने का काम करता है।" },
    ...Array.from({ length: 80 }).map((_, i) => ({
        question: `MS Word Theory Q${i + 11}: वर्ड में ${['Macro', 'Template', 'Style', 'Theme', 'Margins', 'Columns', 'Table', 'Shapes', 'SmartArt', 'Chart', 'Caption', 'Footnote', 'Endnote', 'Citation', 'Bibliography', 'Index', 'TOC', 'Cover Page', 'Blank Page', 'Page Break'][i % 20]} का क्या महत्व है?`,
        options: ["महत्वपूर्ण टूल", "डिजाइन टूल", "फॉर्मेटिंग टूल", "सभी"],
        correctAnswer: 3,
        explanation: "MS Word में कुशलता के लिए ये सभी टूल्स जरूरी हैं।"
    }))
];

const excelTheories = [
    { question: "एक्सेल में फॉर्मूला किससे शुरू होता है?", options: ["+", "-", "=", "@"], correctAnswer: 2, explanation: "बिना '=' के गणना नहीं होती।" },
    { question: "एक्सेल में वर्कशीट के समूह को क्या कहते हैं?", options: ["Workbook", "Worksheet", "Folder", "Project"], correctAnswer: 0, explanation: "फाइल को वर्कबुक कहते हैं।" },
    { question: "पिवट टेबल (Pivot Table) का उपयोग क्यों होता है?", options: ["समरी बनाने के लिए", "पेंटिंग के लिए", "डिलीट के लिए", "स्पेलिंग"], correctAnswer: 0, explanation: "बड़े डेटा का विश्लेषण करने के लिए।" },
    { question: "VLOOKUP का क्या अर्थ है?", options: ["Vertical Lookup", "Value Lookup", "Variable", "View"], correctAnswer: 0, explanation: "वर्टिकल कॉलम में डेटा ढूँढना।" },
    { question: "एक्सेल में कुल रो (Rows) कितनी हैं?", options: ["65536", "1048576", "10000", "अनंत"], correctAnswer: 1, explanation: "नया वर्ज़न 10,48,576 रो सपोर्ट करता है।" },
    { question: "एक्सेल में कुल कॉलम (Columns) कितने हैं?", options: ["256", "16384", "1000", "500"], correctAnswer: 1, explanation: "कुल 16,384 कॉलम होते हैं।" },
    { question: "एक्सेल फाइल का एक्सटेंशन क्या है?", options: [".xlsx", ".docx", ".pptx", ".txt"], correctAnswer: 0, explanation: ".xlsx एक्सेल का मानक है।" },
    { question: "सेल एड्रेस कहाँ दिखाई देता है?", options: ["Formula Bar", "Name Box", "Status Bar", "Ribbon"], correctAnswer: 1, explanation: "लेफ्ट साइड ऊपर नेम बॉक्स में।" },
    { question: "रो और कॉलम के मिलन को क्या कहते हैं?", options: ["Cell", "Box", "Point", "Table"], correctAnswer: 0, explanation: "इसे सेल कहा जाता है।" },
    { question: "फिल्टर (Filter) का क्या काम है?", options: ["डाटा छाँटने के लिए", "डाटा डिलीट करने के लिए", "कलर करने के लिए", "पेंटिंग"], correctAnswer: 0, explanation: "जरूरी डेटा अलग करने के लिए।" },
    ...Array.from({ length: 80 }).map((_, i) => ({
        question: `MS Excel Theory Q${i + 11}: एक्सेल में ${['Sum', 'Average', 'Max', 'Min', 'Count', 'IF', 'Proper', 'Lower', 'Upper', 'Trim', 'Goal Seek', 'Solver', 'Scenario', 'Macro', 'Chart', 'Validations', 'Conditional Formatting', 'Protect Sheet', 'Sort', 'Merge'][i % 20]} का क्या काम है?`,
        options: ["डाटा हैंडलिंग", "गणना", "फॉर्मेटिंग", "सभी"],
        correctAnswer: 3,
        explanation: "एक्सेल मास्टर बनने के लिए ये सभी फंक्शन्स जरूरी हैं।"
    }))
];

const getCourseContent = () => ({
    "MS Word": {
        description: "Microsoft Word Complete Mastery",
        icon: "file-word",
        color: "blue",
        modules: {
            "Home & Edit": wordTheories.slice(0, 30),
            "Insert & Layout": wordTheories.slice(30, 60),
            "Shortcut Keys": generateShortcuts("MS Word", wordShortcuts),
            "Advanced Word": wordTheories.slice(60)
        }
    },
    "MS Excel": {
        description: "Microsoft Excel Data Mastery",
        icon: "table",
        color: "green",
        modules: {
            "Basics & Formulas": excelTheories.slice(0, 30),
            "Advanced Data": excelTheories.slice(30, 60),
            "Shortcut Keys": generateShortcuts("MS Excel", excelShortcuts),
            "Excel Pro": excelTheories.slice(60)
        }
    },
    "PowerPoint": {
        description: "Microsoft PowerPoint Presentation",
        icon: "monitor",
        color: "orange",
        modules: {
            "PPT Theory": wordTheories.slice(0, 20).map(q => ({ ...q, question: "PPT: " + q.question })),
            "Shortcuts": generateShortcuts("PowerPoint", wordShortcuts.slice(0, 25)),
            "Design": wordTheories.slice(20, 50).map(q => ({ ...q, question: "PPT Design: " + q.question }))
        }
    },
    "Tally": {
        description: "Tally Prime Accounting",
        icon: "table",
        color: "cyan",
        modules: {
            "Tally Basics": generateShortcuts("Tally", tallyShortcuts.slice(0, 10)),
            "Shortcuts Pro": generateShortcuts("Tally", tallyShortcuts),
            "GST Theory": tallyShortcuts.slice(0, 10).map(s => ({ question: `GST in Tally: '${s[1]}' का रोल?`, options: ["जरूरी", "अनिवार्य", "टैक्स के लिए", "सभी"], correctAnswer: 3, explanation: "टैली में GST एक महत्वपूर्ण हिस्सा है।" }))
        }
    },
    "Photoshop": {
        description: "Adobe Photoshop Design",
        icon: "monitor",
        color: "purple",
        modules: {
            "Theory": wordTheories.slice(0, 20).map(q => ({ ...q, question: "PS: " + q.question })),
            "Shortcuts": generateShortcuts("Photoshop", wordShortcuts.slice(0, 20))
        }
    }
});

const finalData = {
    "ADCA": getCourseContent(),
    "DCA": getCourseContent(),
    "MDCA": {
        ...getCourseContent(),
        "Python": {
            description: "Python Programming",
            icon: "monitor",
            color: "blue",
            modules: {
                "Basics": wordTheories.slice(0, 30).map(q => ({ ...q, question: "PYTHON: " + q.question }))
            }
        },
        "CorelDraw": {
            description: "CorelDraw Design",
            icon: "monitor",
            color: "rose",
            modules: {
                "Basics": wordTheories.slice(30, 60).map(q => ({ ...q, question: "CORELDRAW: " + q.question }))
            }
        }
    }
};

const stringified = JSON.stringify(finalData, null, 4);
const fileContent = `// src/data/hindiQuizData.js\n\nexport const HINDI_QUIZ_DATA = ${stringified};\n\n// Course Aliases\nconst courses = ["ADCA+", "PGDCA", "DCA+", "Accounting", "Special", "DCST", "CCC"];\ncourses.forEach(c => {\n    HINDI_QUIZ_DATA[c] = HINDI_QUIZ_DATA["MDCA"];\n});\n`;

fs.writeFileSync('c:/Users/bytecore/Desktop/bytecore/bytecore/alumni/alumini/src/data/hindiQuizData.js', fileContent);
console.log("Done! massive quiz data updated.");
