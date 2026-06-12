import os

file_path = 'src/data/hindiQuizData.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_modules = """
    "libre_writer": {
        "title": "LibreOffice Writer",
        "description": "Master LibreOffice Writer (Word Processor)",
        "icon": "file-word",
        "color": "indigo",
        "notes": `<h2>LibreOffice Writer: Complete Study Notes</h2>
        <p>LibreOffice Writer एक ओपन-सोर्स वर्ड प्रोसेसर है जो MS Word के समान कार्य करता है। CCC और O Level परीक्षाओं के लिए यह बहुत महत्वपूर्ण है।</p>
        <h3>महत्वपूर्ण शॉर्टकट कुंजियाँ (Shortcut Keys)</h3>
        <ul>
            <li><b>Ctrl + S</b>: Save</li>
            <li><b>Ctrl + Shift + S</b>: Save As</li>
            <li><b>Ctrl + O</b>: Open</li>
            <li><b>Ctrl + N</b>: New Document</li>
            <li><b>Ctrl + P</b>: Print</li>
            <li><b>Ctrl + F</b>: Find</li>
            <li><b>Ctrl + H</b>: Find and Replace</li>
            <li><b>F7</b>: Spell Check</li>
            <li><b>Shift + F7</b>: Automatic Spell Checking</li>
            <li><b>Ctrl + F12</b>: Insert Table</li>
            <li><b>F12</b>: Numbering ON/OFF</li>
            <li><b>Shift + F12</b>: Bullets ON/OFF</li>
            <li><b>Ctrl + E</b>: Center Alignment</li>
            <li><b>Ctrl + J</b>: Justify</li>
            <li><b>Ctrl + ]</b>: Increase Font Size</li>
            <li><b>Ctrl + [</b>: Decrease Font Size</li>
            <li><b>Ctrl + Enter</b>: Page Break</li>
        </ul>
        <h3>विभिन्न Menus</h3>
        <p>Writer में 11 Menus होते हैं: File, Edit, View, Insert, Format, Styles, Table, Form, Tools, Window, Help.</p>
        <p><b>File Menu:</b> New, Open, Save, Export As PDF, Print आदि विकल्प होते हैं।</p>
        <p><b>Tools Menu:</b> Spelling, Word Count, Macros, Extension Manager आदि महत्वपूर्ण टूल्स यहाँ मिलते हैं।</p>`,
        "modules": {
            "Writer Basics & Shortcuts": [
                {
                    "question": "LibreOffice Writer का डिफ़ॉल्ट फ़ाइल एक्सटेंशन क्या होता है?",
                    "options": [".docx", ".odt", ".txt", ".rtf"],
                    "correctAnswer": 1,
                    "explanation": "Writer की फ़ाइल का एक्सटेंशन .odt (Open Document Text) होता है।"
                },
                {
                    "question": "Writer में 'Save As' करने की शॉर्टकट कुंजी क्या है?",
                    "options": ["F12", "Ctrl + Shift + S", "Alt + S", "Ctrl + S"],
                    "correctAnswer": 1,
                    "explanation": "MS Word में F12 होता है, लेकिन LibreOffice में Ctrl + Shift + S का प्रयोग किया जाता है।"
                },
                {
                    "question": "Writer में 'Table' इन्सर्ट करने की शॉर्टकट की क्या है?",
                    "options": ["Ctrl + T", "Ctrl + F12", "F12", "Alt + T"],
                    "correctAnswer": 1,
                    "explanation": "Ctrl + F12 दबाकर सीधे टेबल इन्सर्ट डायलॉग बॉक्स खोला जा सकता है।"
                }
            ]
        }
    },
    "libre_calc": {
        "title": "LibreOffice Calc",
        "description": "Master LibreOffice Calc (Spreadsheet)",
        "icon": "table",
        "color": "emerald",
        "notes": `<h2>LibreOffice Calc: Complete Study Notes</h2>
        <p>LibreOffice Calc एक स्प्रेडशीट प्रोग्राम है (MS Excel की तरह)।</p>
        <h3>महत्वपूर्ण तथ्य</h3>
        <ul>
            <li><b>डिफ़ॉल्ट फ़ाइल एक्सटेंशन:</b> .ods (Open Document Spreadsheet)</li>
            <li><b>कुल रो (Rows):</b> 1,048,576</li>
            <li><b>कुल कॉलम (Columns):</b> 1,024 (AMJ तक)</li>
            <li><b>डिफ़ॉल्ट शीट:</b> 1</li>
            <li><b>ज़ूम (Zoom):</b> Minimum 20%, Maximum 400%</li>
        </ul>
        <h3>महत्वपूर्ण शॉर्टकट कुंजियाँ (Shortcut Keys)</h3>
        <ul>
            <li><b>Ctrl + M</b>: Clear Direct Formatting</li>
            <li><b>Ctrl + 1</b>: Format Cells Dialog</li>
            <li><b>F2</b>: Edit Cell</li>
            <li><b>Ctrl + F2</b>: Function Wizard</li>
            <li><b>Ctrl + ; (Semicolon)</b>: Insert Current Date</li>
            <li><b>Ctrl + Shift + ;</b>: Insert Current Time</li>
            <li><b>Ctrl + Home</b>: Move to Cell A1</li>
            <li><b>Ctrl + End</b>: Move to last cell with data</li>
        </ul>
        <h3>प्रमुख फॉर्मूले (Formulas)</h3>
        <ul>
            <li><b>=SUM(A1:A5)</b> - संख्याओं को जोड़ता है।</li>
            <li><b>=AVERAGE(A1:A5)</b> - औसत निकालता है।</li>
            <li><b>=COUNT(A1:A5)</b> - केवल नंबर वाले सेल्स को गिनता है।</li>
            <li><b>=MAX(A1:A5)</b> - सबसे बड़ी संख्या बताता है।</li>
        </ul>`,
        "modules": {
            "Calc Basics": [
                {
                    "question": "LibreOffice Calc में अंतिम कॉलम का नाम क्या होता है?",
                    "options": ["XFD", "AMJ", "ZZ", "IV"],
                    "correctAnswer": 1,
                    "explanation": "Calc में कुल 1024 कॉलम होते हैं और अंतिम कॉलम का नाम AMJ होता है।"
                },
                {
                    "question": "Calc में 'Format Cells' डायलॉग बॉक्स खोलने की शॉर्टकट कुंजी क्या है?",
                    "options": ["Ctrl + 1", "Ctrl + F", "F4", "Alt + C"],
                    "correctAnswer": 0,
                    "explanation": "Ctrl + 1 दबाने से सेल फॉर्मेटिंग के विकल्प खुल जाते हैं।"
                }
            ]
        }
    },
    "libre_impress": {
        "title": "LibreOffice Impress",
        "description": "Master LibreOffice Impress (Presentation)",
        "icon": "monitor",
        "color": "orange",
        "notes": `<h2>LibreOffice Impress: Complete Study Notes</h2>
        <p>LibreOffice Impress एक प्रेजेंटेशन सॉफ्टवेयर है, जो PowerPoint की तरह है।</p>
        <h3>महत्वपूर्ण तथ्य</h3>
        <ul>
            <li><b>डिफ़ॉल्ट फ़ाइल एक्सटेंशन:</b> .odp (Open Document Presentation)</li>
            <li><b>ज़ूम (Zoom):</b> Minimum 5%, Maximum 3000%</li>
            <li><b>डिफ़ॉल्ट स्लाइड लेआउट:</b> Title Slide</li>
        </ul>
        <h3>महत्वपूर्ण शॉर्टकट कुंजियाँ (Shortcut Keys)</h3>
        <ul>
            <li><b>F5</b>: Start Slide Show from First Slide</li>
            <li><b>Shift + F5</b>: Start Slide Show from Current Slide</li>
            <li><b>Ctrl + M</b>: Insert New Slide</li>
            <li><b>Esc</b>: End Slide Show</li>
        </ul>`,
        "modules": {
            "Impress Basics": [
                {
                    "question": "LibreOffice Impress का डिफ़ॉल्ट एक्सटेंशन क्या है?",
                    "options": [".ppt", ".odp", ".ods", ".odt"],
                    "correctAnswer": 1,
                    "explanation": ".odp (Open Document Presentation) इसका एक्सटेंशन है।"
                },
                {
                    "question": "स्लाइड शो को बीच से (Current Slide से) शुरू करने की शॉर्टकट की क्या है?",
                    "options": ["F5", "Shift + F5", "Ctrl + F5", "Alt + F5"],
                    "correctAnswer": 1,
                    "explanation": "Shift + F5 दबाने पर स्लाइड शो वहीं से शुरू होता है जहाँ आप वर्तमान में हैं।"
                }
            ]
        }
    }
"""

wordNotes = """
    "notes": `<h2>MS Word: Complete Master Guide & Shortcut Keys</h2>
<p>Microsoft Word विश्व का सबसे लोकप्रिय Word Processor है।</p>
<h3>Home Tab (होम टैब)</h3>
<p>यहाँ फॉन्ट, पैराग्राफ, स्टाइल्स, और क्लिपबोर्ड (Cut, Copy, Paste) के विकल्प मिलते हैं।</p>
<ul>
    <li><b>Format Painter (Ctrl+Shift+C / Ctrl+Shift+V):</b> किसी टेक्स्ट की डिजाइन कॉपी करके दूसरे पर लगाने के लिए।</li>
    <li><b>Change Case (Shift+F3):</b> Sentence case, lowercase, UPPERCASE, Capitalize Each Word, tOGGLE cASE.</li>
</ul>
<h3>Insert Tab (इन्सर्ट टैब)</h3>
<p>यहाँ पेज, टेबल, चित्र, शेप्स, स्मार्टआर्ट, चार्ट, हेडर-फुटर जोड़े जाते हैं।</p>
<ul>
    <li><b>Drop Cap:</b> पैराग्राफ के पहले अक्षर को बड़ा करने के लिए (डिफ़ॉल्ट 3 लाइन, अधिकतम 10 लाइन)।</li>
</ul>
<h3>महत्वपूर्ण शॉर्टकट (A to Z)</h3>
<ul>
    <li><b>Ctrl+A</b>: Select All</li>
    <li><b>Ctrl+B/I/U</b>: Bold / Italic / Underline</li>
    <li><b>Ctrl+C / Ctrl+V / Ctrl+X</b>: Copy / Paste / Cut</li>
    <li><b>Ctrl+E / Ctrl+R / Ctrl+L / Ctrl+J</b>: Center / Right / Left / Justify Alignment</li>
    <li><b>Ctrl+K</b>: Hyperlink</li>
    <li><b>Ctrl+P</b>: Print</li>
    <li><b>Ctrl+Z / Ctrl+Y</b>: Undo / Redo</li>
    <li><b>F7</b>: Spelling & Grammar Check</li>
</ul>`,
"""

excelNotes = """
    "notes": `<h2>MS Excel: 100+ Formulas & Master Guide</h2>
<p>Excel एक स्प्रेडशीट प्रोग्राम है जो डेटा को रो (Row) और कॉलम (Column) में मैनेज करता है।</p>
<h3>Math & Logic Formulas (मैथ और लॉजिक)</h3>
<ul>
    <li><b>=SUM(A1:A10)</b> - सभी नंबर्स का जोड़।</li>
    <li><b>=AVERAGE(A1:A10)</b> - औसत निकालता है।</li>
    <li><b>=COUNT(A1:A10)</b> - केवल नंबर वाले सेल्स को गिनता है।</li>
    <li><b>=COUNTA(A1:A10)</b> - भरे हुए सभी सेल्स (Text+Number) को गिनता है।</li>
    <li><b>=COUNTBLANK(A1:A10)</b> - खाली सेल्स गिनता है।</li>
    <li><b>=MAX(A1:A10) / =MIN(A1:A10)</b> - सबसे बड़ी / सबसे छोटी संख्या।</li>
    <li><b>=IF(A1>50, "Pass", "Fail")</b> - शर्त के आधार पर परिणाम।</li>
</ul>
<h3>Text Formulas (टेक्स्ट फॉर्मूले)</h3>
<ul>
    <li><b>=UPPER(A1)</b> - सभी अक्षरों को कैपिटल (BADA) करता है।</li>
    <li><b>=LOWER(A1)</b> - सभी अक्षरों को स्मॉल (chhota) करता है।</li>
    <li><b>=PROPER(A1)</b> - हर शब्द का पहला अक्षर कैपिटल करता है।</li>
    <li><b>=TRIM(A1)</b> - फालतू स्पेस हटाता है।</li>
    <li><b>=LEN(A1)</b> - अक्षरों की संख्या गिनता है।</li>
    <li><b>=CONCATENATE(A1, " ", B1)</b> - दो या अधिक सेल्स के टेक्स्ट को जोड़ता है।</li>
</ul>
<h3>Lookup Formulas (डेटा खोजना)</h3>
<ul>
    <li><b>=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])</b> - वर्टिकल डेटा खोजने के लिए सबसे शक्तिशाली टूल।</li>
    <li><b>=HLOOKUP(...)</b> - हॉरिजॉन्टल डेटा खोजने के लिए।</li>
</ul>
<h3>Date & Time Formulas</h3>
<ul>
    <li><b>=TODAY()</b> - आज की तारीख।</li>
    <li><b>=NOW()</b> - आज की तारीख और समय दोनों।</li>
</ul>
<p><em>(यहाँ हमने सबसे महत्वपूर्ण फॉर्मूले सूचीबद्ध किये हैं जो परीक्षाओं और ऑफिस जॉब्स में 99% उपयोग होते हैं।)</em></p>`,
"""

import re

# Insert wordNotes
content = re.sub(r'("ms_word":\s*\{\n\s*)("title":)', r'\1' + wordNotes + r'        \2', content)

# Insert excelNotes
content = re.sub(r'("ms_excel":\s*\{\n\s*)("title":)', r'\1' + excelNotes + r'        \2', content)

# Insert new_modules before the final closing brace
content = re.sub(r'\};\s*$', ',\n' + new_modules + '\n};', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected notes successfully!")
