
export const COURSE_CURRICULUM = {
    "MDCA": ["ms_office", "tally", "photoshop", "coreldraw", "python"],
    "ADCA": ["ms_office", "tally", "photoshop"],
    "ADCA+": ["ms_office", "tally", "photoshop", "coreldraw", "python", "web_design"],
    "Accounting": ["tally", "busy", "marg", "advanced_excel"],
    "CCC": ["libreoffice", "iot_fundamentals", "internet_basics"],
    "DCST": ["ms_office"],
    "DCA": ["ms_office", "typing_theory"],
    "C": ["c_programming"],
    "Special": ["ms_office", "tally", "photoshop", "coreldraw", "python", "libreoffice", "iot_fundamentals", "busy", "marg"]
};

// Maps high-level modules to specific actionable quiz topics
export const MODULE_EXPANSION = {
    "ms_office": ["ms_word", "ms_excel", "ms_powerpoint"],
    "libreoffice": ["libre_writer", "libre_calc", "libre_impress"]
};

export const QUIZ_BANK = {
    // --- MS OFFICE ---
    "ms_word": {
        title: "MS Word",
        description: "Document Processing Mastery",
        icon: "FileText",
        color: "blue",
        questions: [
            { q: "Shortcut for 'Center Align' text?", options: ["Ctrl + C", "Ctrl + E", "Ctrl + R", "Ctrl + J"], correct: 1, explanation: "Ctrl + E aligns text to the center." },
            { q: "Which feature corrects spelling as you type?", options: ["AutoCorrect", "AutoFill", "AutoFormat", "SmartTags"], correct: 0, explanation: "AutoCorrect fixes common spelling errors automatically." },
            { q: "Which view shows how the document will look when printed?", options: ["Web Layout", "Draft", "Print Layout", "Outline"], correct: 2, explanation: "Print Layout view simulates the printed page." },
            { q: "Which key is used to indent a paragraph?", options: ["Shift", "Ctrl", "Alt", "Tab"], correct: 3, explanation: "The Tab key creates standard indentation." },
            { q: "Ctrl + Z is used for?", options: ["Undo", "Redo", "Cut", "Copy"], correct: 0, explanation: "Ctrl + Z undoes the last action." }
        ]
    },
    "ms_excel": {
        title: "MS Excel",
        description: "Spreadsheet & Data Analysis",
        icon: "Table",
        color: "emerald",
        questions: [
            { q: "Which symbol must start every formula?", options: ["+", "#", "=", "@"], correct: 2, explanation: "All formulas in Excel must begin with an equals sign (=)." },
            { q: "What is the intersection of a row and column called?", options: ["Grid", "Box", "Cell", "Block"], correct: 2, explanation: "A Cell is where a row and column intersect." },
            { q: "Which function adds cells together?", options: ["ADD", "SUM", "TOTAL", "PLUS"], correct: 1, explanation: "The SUM function adds all numbers in a range of cells." },
            { q: "To select an entire column, click the?", options: ["Row Number", "Column Letter", "Cell", "Formula Bar"], correct: 1, explanation: "Clicking the Column Letter selects the vertical column." },
            { q: "Ctrl + ; key shortcut inserts?", options: ["Current Time", "Current Date", "Currency Format", "Percentage"], correct: 1, explanation: "Ctrl + ; inserts the current date static value." }
        ]
    },
    "ms_powerpoint": {
        title: "PowerPoint",
        description: "Presentation Skills",
        icon: "Presentation",
        color: "orange",
        questions: [
            { q: "Shortcut to start a slideshow?", options: ["F2", "F5", "F7", "F9"], correct: 1, explanation: "F5 starts the presentation from the beginning." },
            { q: "Which view is best for reordering slides?", options: ["Normal", "Slide Sorter", "Notes Page", "Reading View"], correct: 1, explanation: "Slide Sorter view displays thumbnails for easy reordering." },
            { q: "Motion effects applied to text/objects are called?", options: ["Transitions", "Animations", "Morphs", "Designs"], correct: 1, explanation: "Animations are applied to elements within a slide." },
            { q: "To end a slideshow, press?", options: ["Esc", "End", "Ctrl + E", "Alt + F4"], correct: 0, explanation: "Esc key exits the slideshow mode." },
            { q: "Which file format is a PowerPoint Show?", options: [".pptx", ".ppt", ".ppsx", ".pdf"], correct: 2, explanation: ".ppsx opens directly in slideshow mode." }
        ]
    },

    // --- ACCOUNTING ---
    "tally": {
        title: "Tally Prime",
        description: "Digital Accounting",
        icon: "Calculator",
        color: "teal",
        questions: [
            { q: "Key to create a user in Tally?", options: ["Alt + F3", "F11", "Alt + K", "Ctrl + U"], correct: 2, explanation: "Alt + K is used for Company/User management in Tally Prime." },
            { q: "Which voucher type records payments?", options: ["F4", "F5", "F6", "F7"], correct: 1, explanation: "F5 is the standard key for Payment Vouchers." },
            { q: "Contra voucher key is?", options: ["F2", "F4", "F8", "F9"], correct: 1, explanation: "F4 is used for Contra entries (Cash/Bank transfers)." },
            { q: "Which ledger is created by default?", options: ["Capital", "Sales", "Cash", "Bank"], correct: 2, explanation: "Cash and Profit & Loss ledgers are pre-created." },
            { q: "GST stands for?", options: ["Global Sales Tax", "Goods and Service Tax", "Govt Service Tax", "General Supply Tax"], correct: 1, explanation: "Goods and Services Tax." }
        ]
    },
    "busy": {
        title: "Busy",
        description: "Accounting Software",
        icon: "Activity",
        color: "red",
        questions: [
            { q: "Extension of Busy backup file?", options: [".bkp", ".zip", ".rar", ".bus"], correct: 2, explanation: "Busy typically creates backups in .rar format for compression." },
            { q: "Which key is used to save in Busy?", options: ["F2", "Ctrl + S", "F10", "Alt + S"], correct: 0, explanation: "F2 is the standard save key in Busy." },
            { q: "Key to modify a voucher?", options: ["Alt + M", "Ctrl + M", "Alt + Enter", "F3"], correct: 0, explanation: "Alt + M allows modification of lists/vouchers." }
        ]
    },
    "marg": {
        title: "Marg ERP",
        description: "Pharma & Retail",
        icon: "ShoppingBag",
        color: "indigo",
        questions: [
            { q: "Key to zoom in Marg?", options: ["F12", "F10", "Z", "Ctrl + Z"], correct: 0, explanation: "F12 is often used for accessing advanced options/features." },
            { q: "Marg is famous for which industry?", options: ["Automobile", "Pharma", "Textile", "Education"], correct: 1, explanation: "Marg ERP is a market leader in Pharmaceutical accounting." }
        ]
    },
    "advanced_excel": {
        title: "Adv. Excel",
        description: "Data Science & Macros",
        icon: "BarChart2",
        color: "emerald",
        questions: [
            { q: "Which feature allows drop-down lists?", options: ["Data Validation", "Consolidate", "PivotTable", "Filter"], correct: 0, explanation: "Data Validation is used to create restricted drop-down inputs." },
            { q: "VLOOKUP searches for data in?", options: ["Rows by index", "First column", "Last column", "Diagonal"], correct: 1, explanation: "VLOOKUP scans the first column of the table array." },
            { q: "Tool to summarize complex data?", options: ["Goal Seek", "Macro", "PivotTable", "Scenario"], correct: 2, explanation: "PivotTables allow dynamic summarization of large datasets." }
        ]
    },

    // --- DESIGN ---
    "photoshop": {
        title: "Photoshop",
        description: "Digital Imaging",
        icon: "Image",
        color: "blue",
        questions: [
            { q: "Default extension of Photoshop file?", options: [".jpg", ".png", ".psd", ".tiff"], correct: 2, explanation: ".psd (Photoshop Document) preserves layers." },
            { q: "Shortcut for Transform tool?", options: ["Ctrl + T", "Ctrl + Shift + T", "Alt + T", "Ctrl + D"], correct: 0, explanation: "Ctrl + T activates Free Transform." },
            { q: "Which tool selects similar colors?", options: ["Lasso", "Marquee", "Magic Wand", "Crop"], correct: 2, explanation: "Magic Wand selects pixels of similar color values." }
        ]
    },
    "coreldraw": {
        title: "CorelDraw",
        description: "Vector Graphics",
        icon: "PenTool",
        color: "green",
        questions: [
            { q: "CorelDraw is a ___ based software?", options: ["Pixel", "Vector", "Raster", "Bitmap"], correct: 1, explanation: "It uses mathematical vectors for infinite scalability." },
            { q: "Key to group objects?", options: ["Ctrl + G", "Ctrl + U", "Ctrl + K", "Ctrl + L"], correct: 0, explanation: "Ctrl + G groups selected objects." }
        ]
    },

    // --- CCC / IOT ---
    "libre_writer": {
        title: "Libre Writer",
        description: "Open Source Docs",
        icon: "File",
        color: "slate",
        questions: [
            { q: "Default file extension in Writer?", options: [".odt", ".doc", ".txt", ".rtf"], correct: 0, explanation: "Open Document Text (.odt) is the default." },
            { q: "PDF export is available in?", options: ["File Menu", "Edit Menu", "View Menu", "Tools"], correct: 0, explanation: "Export as PDF is a direct option in the File menu." }
        ]
    },
    "iot_fundamentals": {
        title: "IoT Basics",
        description: "Internet of Things",
        icon: "Wifi",
        color: "cyan",
        questions: [
            { q: "Full form of IoT?", options: ["Input of Things", "Internet of Things", "Intranet of Tools", "Interchange of Text"], correct: 1, explanation: "Internet of Things." },
            { q: "Which board is popular for IoT?", options: ["Arduino", "Motherboard", "Chipboard", "Switchboard"], correct: 0, explanation: "Arduino and Raspberry Pi are standard IoT prototyping boards." },
            { q: "IoT devices communicate via?", options: ["Sensors", "Magic", "Manual", "Paper"], correct: 0, explanation: "Sensors collect data which is transmitted over the network." }
        ]
    },

    // --- PROGRAMMING ---
    "python": {
        title: "Python",
        description: "Coding Logic",
        icon: "Code",
        color: "yellow",
        questions: [
            { q: "Extension for Python?", options: [".py", ".pt", ".p", ".pyt"], correct: 0, explanation: ".py is the standard." },
            { q: "Function keyword in Python?", options: ["func", "def", "lambda", "mak"], correct: 1, explanation: "'def' defines a function." },
            { q: "Output of print(2 ** 3)?", options: ["6", "5", "8", "9"], correct: 2, explanation: "** is the exponent operator. 2 to the power 3 is 8." }
        ]
    },

    // --- MISC ---
    "typing_theory": {
        title: "Typing",
        description: "Keyboard Mastery",
        icon: "Keyboard",
        color: "slate",
        questions: [
            { q: "Home row keys for left hand?", options: ["ASDF", "JKL;", "QWER", "ZXCV"], correct: 0, explanation: "ASDF are the home keys for the left hand." },
            { q: "Standard WPM stands for?", options: ["Word Per Minute", "Work Per Man", "Write Past Me", "Word Pre Mode"], correct: 0, explanation: "Words Per Minute." }
        ]
    }
};
