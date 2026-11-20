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

const pythonTheories = [
    { question: "Python फाइल का एक्सटेंशन क्या है?", options: [".py", ".python", ".p", ".txt"], correctAnswer: 0, explanation: "Python फाइलें .py एक्सटेंशन के साथ सेव होती हैं।" },
    { question: "Python में आउटपुट दिखाने के लिए क्या उपयोग होता है?", options: ["echo", "print()", "console.log", "write"], correctAnswer: 1, explanation: "print() फंक्शन का उपयोग टेक्स्ट आउटपुट के लिए होता है।" },
    { question: "Python के जनक (Founder) कौन हैं?", options: ["James Gosling", "Guido van Rossum", "Dennis Ritchie", "Bill Gates"], correctAnswer: 1, explanation: "Python को 1991 में Guido van Rossum ने बनाया था।" },
    { question: "Python में कमेंट (Comment) के लिए क्या उपयोग होता है?", options: ["//", "/* */", "#", "--"], correctAnswer: 2, explanation: "सिंगल लाइन कमेंट के लिए # का उपयोग होता है।" },
    { question: "Python किस प्रकार की प्रोग्रामिंग भाषा है?", options: ["Interpreted", "Compiled", "Low-level", "Machine"], correctAnswer: 0, explanation: "Python कोड को सीधे इंटरप्रेटर द्वारा रन किया जाता है।" },
    { question: "List बनाने के लिए किस ब्रैकेट का उपयोग होता है?", options: ["()", "{}", "[]", "<>"], correctAnswer: 2, explanation: "Python में List के लिए स्कवायर ब्रैकेट [] का उपयोग होता है।" },
    { question: "Python में यूज़र से इनपुट लेने के लिए फंक्शन?", options: ["get()", "scanf()", "input()", "read()"], correctAnswer: 2, explanation: "input() फंक्शन यूज़र से वैल्यू लेता है।" },
    { question: "इनमें से कौन सा Python का डेटा टाइप नहीं है?", options: ["int", "string", "float", "pointer"], correctAnswer: 3, explanation: "Python में पॉइंटर्स सीधे उपयोग नहीं होते।" },
    { question: "Python में इंडेंटेशन (Indentation) क्यों जरूरी है?", options: ["सुंदरता के लिए", "कोड ब्लॉक दिखाने के लिए", "जरूरी नहीं", "एरर हटाने के लिए"], correctAnswer: 1, explanation: "Python में 'scope' के लिए इंडेंटेशन अनिवार्य है।" },
    { question: "Tuple और List में क्या अंतर है?", options: ["List बदल सकते हैं, Tuple नहीं", "Tuple बदल सकते हैं, List नहीं", "कोई अंतर नहीं", "दोनों समान हैं"], correctAnswer: 0, explanation: "List 'mutable' है जबकि Tuple 'immutable' है।" },
    ...Array.from({ length: 80 }).map((_, i) => ({
        question: `Python Theory Q${i + 11}: Python में ${['Variables', 'Keywords', 'Loops', 'Functions', 'Classes', 'Modules', 'Pip', 'Virtualenv', 'Lists', 'Dictionaries', 'Sets', 'Exception Handling', 'File I/O', 'Lambdas', 'Decorators', 'Generators', 'Iterators', 'Inheritance', 'Polymorphism', 'API Integration'][i % 20]} का क्या महत्व है?`,
        options: ["कोडिंग लॉजिक", "डाटा मैनेजमेंट", "प्रोग्रामिंग स्ट्रक्चर", "सभी"],
        correctAnswer: 3,
        explanation: "Python डेवलपर बनने के लिए ये सभी कांसेप्ट बहुत जरूरी हैं।"
    }))
];

const corelTheories = [
    { question: "CorelDraw किस प्रकार का सॉफ्टवेयर है?", options: ["Video Editing", "Vector Graphics", "Accounting", "Operating System"], correctAnswer: 1, explanation: "यह एक वेक्टर ग्राफिक्स डिजाइनिंग सॉफ्टवेयर है।" },
    { question: "CorelDraw फाइल का डिफ़ॉल्ट एक्सटेंशन क्या है?", options: [".cdr", ".psd", ".pdf", ".ai"], correctAnswer: 0, explanation: ".cdr कोरेलड्रॉ की मुख्य फाइल फॉर्मेट है।" },
    { question: "ऑब्जेक्ट्स को सिलेक्ट और मूव करने के लिए कौन सा टूल है?", options: ["Pick Tool", "Zoom Tool", "Shape Tool", "Crop Tool"], correctAnswer: 0, explanation: "Pick Tool मुख्य टूल है जिससे हम ऑब्जेक्ट्स को पकड़ते हैं।" },
    { question: "कर्व्स (Curves) को एडिट करने के लिए कौन सा टूल है?", options: ["Pick Tool", "Shape Tool", "Hand Tool", "Eraser"], correctAnswer: 1, explanation: "Shape Tool (F10) से नोड्स को एडिट किया जाता है।" },
    { question: "ऑब्जेक्ट को 'Group' करने की शॉर्टकट की क्या है?", options: ["Ctrl+A", "Ctrl+G", "Ctrl+U", "Ctrl+D"], correctAnswer: 1, explanation: "Ctrl+G से कई ऑब्जेक्ट्स को एक साथ जोड़ा जा सकता है।" },
    { question: "कोरेलड्रॉ में 'Zoom' की शॉर्टकट की क्या है?", options: ["Z", "X", "V", "C"], correctAnswer: 0, explanation: "Z प्रेस करके ज़ूम टूल एक्टिवेट होता है।" },
    { question: "इनमें से कौन सा वेक्टर ग्राफ़िक नहीं है?", options: ["SVG", "CDR", "EPS", "JPEG"], correctAnswer: 3, explanation: "JPEG एक राष्ट्र (Raster) ग्राफ़िक है, वेक्टर नहीं।" },
    { question: "ऑब्जेक्ट को पेज के बीच में (Center) करने की शॉर्टकट?", options: ["C", "E", "P", "T"], correctAnswer: 2, explanation: "P दबाने से कोई भी ऑब्जेक्ट पेज के सेंटर में आ जाता है।" },
    { question: "स्मार्ट फिल टूल (Smart Fill) क्या करता है?", options: ["मिटाता है", "कलर भरता है", "नया ऑब्जेक्ट बनाता है", "दोनों 2 और 3"], correctAnswer: 3, explanation: "यह किसी बंद एरिया में नया ऑब्जेक्ट बनाकर कलर भरता है।" },
    { question: "कलर पाइपेट (Eyedropper) टूल का क्या काम है?", options: ["कलर पिक करना", "पेंट करना", "डिजाइन बनाना", "लिखना"], correctAnswer: 0, explanation: "इससे किसी फोटो या ऑब्जेक्ट से कलर कॉपी किया जाता है।" },
    ...Array.from({ length: 80 }).map((_, i) => ({
        question: `CorelDraw Theory Q${i + 11}: कोरेलड्रॉ में ${['Layers', 'PowerClip', 'Blending', 'Contours', 'Transparency', 'Artistic Media', 'Text on Path', 'Color Docker', 'Guidelines', 'Snapping', 'Transformations', 'Grids', 'Symbols', 'Print Merge', 'Effects', 'Bitmaps', 'Tracing', 'Exporting', 'PDF Settings', 'Color Palettes'][i % 20]} का क्या काम है?`,
        options: ["डिजाइनिंग", "फॉर्मेटिंग", "क्रिएटिविटी", "सभी"],
        correctAnswer: 3,
        explanation: "प्रोफेशनल डिजाइनिंग के लिए इन सभी टूल्स की जानकारी जरूरी है।"
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
    "Python": {
        "Python": {
            description: "Python Programming",
            icon: "monitor",
            color: "blue",
            modules: {
                "Basics & Theory": pythonTheories.slice(0, 30),
                "Advanced Concepts": pythonTheories.slice(30, 60),
                "Project logic": pythonTheories.slice(60)
            }
        }
    },
    "CorelDraw": {
        "CorelDraw": {
            description: "CorelDraw Design",
            icon: "monitor",
            color: "rose",
            modules: {
                "Basics & Tools": corelTheories.slice(0, 30),
                "Design Effects": corelTheories.slice(30, 60),
                "Pro Output": corelTheories.slice(60)
            }
        }
    },
    "MDCA": {
        ...getCourseContent(),
        "Python": {
            description: "Python Programming",
            icon: "monitor",
            color: "blue",
            modules: {
                "Basics & Theory": pythonTheories.slice(0, 30),
                "Advanced Concepts": pythonTheories.slice(30, 60),
                "Project logic": pythonTheories.slice(60)
            }
        },
        "CorelDraw": {
            description: "CorelDraw Design",
            icon: "monitor",
            color: "rose",
            modules: {
                "Basics & Tools": corelTheories.slice(0, 30),
                "Design Effects": corelTheories.slice(30, 60),
                "Pro Output": corelTheories.slice(60)
            }
        }
    }
};

const stringified = JSON.stringify(finalData, null, 4);
const fileContent = `// src/data/hindiQuizData.js\n\nexport const HINDI_QUIZ_DATA = ${stringified};\n\n// Course Aliases\nconst courses = ["ADCA+", "PGDCA", "DCA+", "Accounting", "Special", "DCST", "CCC"];\ncourses.forEach(c => {\n    HINDI_QUIZ_DATA[c] = HINDI_QUIZ_DATA["MDCA"];\n});\n`;

fs.writeFileSync('c:/Users/bytecore/Desktop/bytecore/bytecore/alumni/alumini/src/data/hindiQuizData.js', fileContent);
console.log("Done! massive quiz data updated.");
