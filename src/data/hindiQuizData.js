// src/data/hindiQuizData.js
// Course -> Topic -> Sub-Module -> Questions

export const HINDI_QUIZ_DATA = {
    // Course Keys: ADCA, DCA, CCC, etc (matches student.course)
    "ADCA": {
        "MS Word": {
            description: "Microsoft Word Complete Mastery",
            icon: "file-word",
            color: "blue",
            modules: {
                "Home Tab": [
                    {
                        question: "MS Word में 'Font Size' बढ़ाने की शॉर्टकट की (Shortcut Key) क्या है?",
                        options: ["Ctrl + ]", "Ctrl + Shift + >", "Alt + +", "A और B दोनों"],
                        correctAnswer: 3,
                        explanation: "MS Word में फॉन्ट साइज बढ़ाने के लिए 'Ctrl + ]' या 'Ctrl + Shift + >' दोनों का इस्तेमाल किया जा सकता है।"
                    },
                    {
                        question: "Home Tab में 'Format Painter' का उपयोग किसलिए किया जाता है?",
                        options: ["टेक्स्ट को डिलीट करने के लिए", "एक टेक्स्ट की फॉर्मेटिंग (रंग, साइज) दूसरे टेक्स्ट पर कॉपी करने के लिए", "बैकग्राउंड बदलने के लिए", "टेक्स्ट को पेंट करने के लिए"],
                        correctAnswer: 1,
                        explanation: "Format Painter किसी टेक्स्ट की फॉर्मेटिंग जैसे रंग, फॉन्ट स्टाइल या साइज को कॉपी करके दूसरी जगह पेस्ट करने के काम आता है।"
                    },
                    {
                        question: "टेक्स्ट को 'Bold' (गाढ़ा) करने के लिए कौन सी कुंजी दबाते हैं?",
                        options: ["Ctrl + B", "Shift + B", "Alt + B", "Tab + B"],
                        correctAnswer: 0,
                        explanation: "टेक्स्ट को Bold करने के लिए Ctrl + B शॉर्टकट का यूज़ होता है।"
                    },
                    {
                        question: "MS Word में किसी भी पैराग्राफ को 'Center Align' (बीच में) करने का शॉर्टकट क्या है?",
                        options: ["Ctrl + C", "Ctrl + E", "Ctrl + L", "Ctrl + R"],
                        correctAnswer: 1,
                        explanation: "Ctrl + E से टेक्स्ट या पैराग्राफ सेंटर (बीच में) आ जाता है। Ctrl + C कॉपी के लिए होता है।"
                    },
                    {
                        question: "'Subscript' (H₂O की तरह बेस में लिखना) का शॉर्टकट क्या है?",
                        options: ["Ctrl + =", "Ctrl + Shift + +", "Alt + =", "Shift + _"],
                        correctAnswer: 0,
                        explanation: "सबस्क्रिप्ट (Subscript) इफ़ेक्ट लगाने के लिए Ctrl + = का उपयोग किया जाता है।"
                    }
                ],
                "Insert Tab": [
                    {
                        question: "Document में 'Table' (टेबल) जोड़ने का विकल्प किस Tab में मिलता है?",
                        options: ["Home", "Insert", "Design", "Layout"],
                        correctAnswer: 1,
                        explanation: "टेबल, पिक्चर, शेप्स, और चार्ट आदि जोड़ने के विकल्प Insert Tab में होते हैं।"
                    },
                    {
                        question: "Page के टॉप (ऊपर) और बॉटम (नीचे) में हर पेज पर दिखने वाला टेक्स्ट लगाने के लिए किसका उपयोग करते हैं?",
                        options: ["Header & Footer", "Watermark", "Page Color", "Title"],
                        correctAnswer: 0,
                        explanation: "Header पेज के ऊपर और Footer पेज के नीचे हर पेज पर फिक्स जानकारी (जैसे पेज नंबर, टाइटल) लगाने के काम आता है।"
                    },
                    {
                        question: "Cover Page लगाने का ऑप्शन MS Word में कहाँ होता है?",
                        options: ["Home", "View", "Insert", "Page Layout"],
                        correctAnswer: 2,
                        explanation: "Insert Tab के 'Pages' ग्रुप में Cover Page का ऑप्शन होता है।"
                    },
                    {
                        question: "किसी शब्द के बारे में एक्स्ट्रा जानकारी पेज के नीचे लिखने (Footnote) के लिए किस Tab का इस्तेमाल होता है?",
                        options: ["Insert", "References", "Review", "Home"],
                        correctAnswer: 1,
                        explanation: "Footnotes और Endnotes लगाने के विकल्प References Tab में दिए गए होते हैं।"
                    },
                    {
                        question: "MS Word में 'Hyperlink' (लिंक) बनाने की शॉर्टकट Key क्या है?",
                        options: ["Ctrl + H", "Ctrl + K", "Ctrl + L", "Alt + K"],
                        correctAnswer: 1,
                        explanation: "वेबसाइट या किसी फाइल का लिंक (Hyperlink) लगाने के लिए Ctrl + K इस्तेमाल होता है।"
                    }
                ],
                "Page Layout": [
                    {
                        question: "MS Word में पेज का पीछे का बैकग्राउंड धुंधला (कस्टम टेक्स्ट या इमेज) लगाने के लिए किसका उपयोग किया जाता है?",
                        options: ["Page Color", "Page Borders", "Watermark", "Themes"],
                        correctAnswer: 2,
                        explanation: "वॉटरमार्क (Watermark) का उपयोग डॉक्युमेंट के बैकग्राउंड में धुंधला टेक्स्ट या लोगो लगाने के लिए किया जाता है।"
                    },
                    {
                        question: "पेज का ओरिएंटेशन (Orientation) 'Portrait' (सीधा) और 'Landscape' (आड़ा) बदलने का ऑप्शन कहाँ होता है?",
                        options: ["Insert Tab", "View Tab", "Page Layout / Layout Tab", "Review Tab"],
                        correctAnswer: 2,
                        explanation: "पेज ओरिएंटेशन बदलने का ऑप्शन Layout या Page Layout Tab में होता है।"
                    },
                    {
                        question: "डिफ़ॉल्ट रूप से, MS Word में पेज का मार्जिन(Margin) क्या सेट होता है?",
                        options: ["Narrow", "Moderate", "Normal", "Wide"],
                        correctAnswer: 2,
                        explanation: "MS Word में पेज मार्जिन पहले से 'Normal' पर सेट होता है, जिसमें चारों तरफ 1 इंच की जगह छूटती है।"
                    }
                ]
            }
        },
        "MS Excel": {
            description: "Microsoft Excel Data Mastery",
            icon: "table",
            color: "green",
            modules: {
                "Basic Formulas": [
                    {
                        question: "Excel में कोई भी फॉर्मूला (Formula) शुरू करने से पहले कौन सा चिन्ह (Symbol) लगाना ज़रूरी है?",
                        options: ["+", "@", "=", "#"],
                        correctAnswer: 2,
                        explanation: "फॉर्मूला हमेशा '=' (Equal to) चिन्ह से शुरू होता है।"
                    },
                    {
                        question: "कुछ सेल (Cell) का जोड़ (Total) निकालने के लिए किस फ़ंक्शन का उपयोग करते हैं?",
                        options: ["=ADD()", "=SUM()", "=TOTAL()", "=COUNT()"],
                        correctAnswer: 1,
                        explanation: "जोड़ करने के लिए Excel में =SUM() फ़ंक्शन का उपयोग किया जाता है।"
                    }
                ]
            }
        }
    },
    // We can duplicate ADCA for DCA users initially to ensure content exists for them
    "DCA": {
        "Computer Fundamentals": {
            description: "Basic Computer Hardware & Software",
            icon: "monitor",
            color: "purple",
            modules: {
                "Hardware Basics": [
                    {
                        question: "कंप्यूटर का दिमाग (Brain of Computer) किसे कहा जाता है?",
                        options: ["RAM", "Monitor", "CPU", "Hard Disk"],
                        correctAnswer: 2,
                        explanation: "CPU (Central Processing Unit) को कंप्यूटर का दिमाग कहा जाता है।"
                    },
                    {
                        question: "इनमें से कौन सा इनपुट डिवाइस (Input Device) नहीं है?",
                        options: ["Keyboard", "Mouse", "Printer", "Scanner"],
                        correctAnswer: 2,
                        explanation: "प्रिंटर (Printer) आउटपुट डिवाइस है, जो कंप्यूटर से रिजल्ट बाहर निकालता है।"
                    }
                ]
            }
        }
    }
};

// Aliases for overlapping courses
HINDI_QUIZ_DATA["ADCA+"] = HINDI_QUIZ_DATA["ADCA"];
HINDI_QUIZ_DATA["PGDCA"] = HINDI_QUIZ_DATA["ADCA"];
