
export const COURSE_CURRICULUM = {
    "MDCA": ["ms_office", "tally", "photoshop", "coreldraw", "python", "internet_basics", "hardware"],
    "ADCA": ["ms_office", "tally", "photoshop", "internet_basics", "hardware"],
    "ADCA+": ["ms_office", "tally", "photoshop", "coreldraw", "python", "web_design", "internet_basics", "hardware"],
    "Accounting": ["tally", "busy", "marg", "advanced_excel", "taxation"],
    "CCC": ["libreoffice", "iot_fundamentals", "internet_basics", "digital_financial"],
    "DCST": ["ms_office", "internet_basics"],
    "DCA": ["ms_office", "typing_theory", "internet_basics"],
    "C": ["c_programming"],
    "Special": ["ms_office", "tally", "photoshop", "coreldraw", "python", "libreoffice", "iot_fundamentals", "busy", "marg", "hardware"]
};

export const MODULE_EXPANSION = {
    "ms_office": ["ms_word", "ms_excel", "ms_powerpoint"],
    "libreoffice": ["libre_writer", "libre_calc", "libre_impress"],
    "internet_basics": ["internet_basics"]
};

export const QUIZ_BANK = {
    // --- MS OFFICE (Word, Excel, PPT) ---
    "ms_word": {
        title: "MS Word", description: "Document Processing", icon: "FileText", color: "blue", questions: [
            { q: "Shortcut for 'Center Align'?", options: ["Ctrl+E", "Ctrl+C", "Ctrl+R", "Ctrl+L"], correct: 0, explanation: "Ctrl+E aligns text to center." },
            { q: "Default file extension?", options: [".docx", ".doc", ".txt", ".xml"], correct: 0, explanation: ".docx is the standard." },
            { q: "Ctrl+B does what?", options: ["Bold", "Break", "Big", "Blue"], correct: 0, explanation: "Makes text Bold." },
            { q: "To select all text?", options: ["Ctrl+A", "Ctrl+S", "Alt+A", "Shift+A"], correct: 0, explanation: "Select All." },
            { q: "Which tab has Watermark?", options: ["Design", "Insert", "Home", "View"], correct: 0, explanation: "Found in Design or Page Layout." },
            { q: "Shortcut for Paste?", options: ["Ctrl+V", "Ctrl+P", "Ctrl+X", "Ctrl+C"], correct: 0, explanation: "Ctrl+V pastes content." },
            { q: "Undo shortcut?", options: ["Ctrl+Z", "Ctrl+Y", "Ctrl+U", "Ctrl+D"], correct: 0, explanation: "Ctrl+Z undoes action." },
            { q: "Header is at the?", options: ["Top", "Bottom", "Left", "Right"], correct: 0, explanation: "Top of the page." },
            { q: "Landscape is a ?", options: ["Orientation", "Size", "Font", "Color"], correct: 0, explanation: "Page Orientation." },
            { q: "Ctrl+K inserts?", options: ["Hyperlink", "Knife", "Kite", "Key"], correct: 0, explanation: "Inserts a link." },
            { q: "Minimum Zoom?", options: ["10%", "5%", "1%", "20%"], correct: 0, explanation: "10%." },
            { q: "Maximum Zoom?", options: ["500%", "400%", "100%", "200%"], correct: 0, explanation: "500%." },
            { q: "Thesaurus key?", options: ["Shift+F7", "F7", "Alt+F7", "Ctrl+F7"], correct: 0, explanation: "Shift+F7." },
            { q: "Subscript example?", options: ["H₂O", "X²", "ABC", "Bold"], correct: 0, explanation: "Lowers text." },
            { q: "Ctrl+H means?", options: ["Replace", "History", "Header", "Hyperlink"], correct: 0, explanation: "Find and Replace." },
            { q: "To print document?", options: ["Ctrl+P", "Ctrl+O", "Ctrl+S", "Alt+P"], correct: 0, explanation: "Opens Print dialog." },
            { q: "Gutter Margin is used for?", options: ["Binding", "Printing", "Decoration", "Spacing"], correct: 0, explanation: "Space for binding." },
            { q: "Drop Cap default lines?", options: ["3", "2", "5", "10"], correct: 0, explanation: "Drops 3 lines by default." },
            { q: "Which bar shows page no?", options: ["Status Bar", "Title Bar", "Menu Bar", "Scroll Bar"], correct: 0, explanation: "Status Bar." },
            { q: "F12 key does what?", options: ["Save As", "Save", "Open", "Print"], correct: 0, explanation: "Save As dialog." }
        ]
    },
    "ms_excel": {
        title: "MS Excel", description: "Spreadsheets", icon: "Table", color: "emerald", questions: [
            { q: "Formulas start with?", options: ["=", "+", "-", "#"], correct: 0, explanation: "Equals sign." },
            { q: "Intersection of Row/Col?", options: ["Cell", "Box", "Grid", "Unit"], correct: 0, explanation: "Cell." },
            { q: "Function to add values?", options: ["SUM", "ADD", "TOTAL", "PLUS"], correct: 0, explanation: "=SUM()." },
            { q: "Last column in Excel 2019?", options: ["XFD", "ZZZ", "XFE", "LMN"], correct: 0, explanation: "XFD." },
            { q: "Ctrl + ; inserts?", options: ["Current Date", "Time", "Number", "Text"], correct: 0, explanation: "Date." },
            { q: "By default numbers align?", options: ["Right", "Left", "Center", "Justify"], correct: 0, explanation: "Numbers align right." },
            { q: "By default text aligns?", options: ["Left", "Right", "Center", "Justify"], correct: 0, explanation: "Text aligns left." },
            { q: "Filter is in which tab?", options: ["Data", "Home", "Insert", "View"], correct: 0, explanation: "Data tab." },
            { q: "Chart for percentages?", options: ["Pie", "Bar", "Line", "Scatter"], correct: 0, explanation: "Pie Chart." },
            { q: "Absolute Filter symbol?", options: ["$", "#", "&", "@"], correct: 0, explanation: "$ sign (e.g. $A$1)." },
            { q: "Ctrl+9 hides?", options: ["Rows", "Columns", "Sheet", "Cell"], correct: 0, explanation: "Hides Rows." },
            { q: "Extension for template?", options: [".xltx", ".xlsx", ".xls", ".xml"], correct: 0, explanation: ".xltx." },
            { q: "Max rows in Excel?", options: ["1048576", "65536", "100000", "Unlimited"], correct: 0, explanation: "1,048,576." },
            { q: "Function for average?", options: ["AVERAGE", "AVG", "MEAN", "MED"], correct: 0, explanation: "=AVERAGE()." },
            { q: "Merge & Center does what?", options: ["Combines cells", "Splits cells", "Deletes cells", "Nothing"], correct: 0, explanation: "Combines and centers." },
            { q: "To edit a cell?", options: ["F2", "F4", "F1", "F5"], correct: 0, explanation: "F2." },
            { q: "Freeze Panes is in?", options: ["View", "Data", "Home", "Review"], correct: 0, explanation: "View Tab." },
            { q: "Wrap Text means?", options: ["Multi-line", "Bold", "Hide", "Delete"], correct: 0, explanation: "Text on multiple lines." },
            { q: "Ctrl+Space selects?", options: ["Column", "Row", "Sheet", "All"], correct: 0, explanation: "Entire Column." },
            { q: "Shift+Space selects?", options: ["Row", "Column", "Sheet", "All"], correct: 0, explanation: "Entire Row." }
        ]
    },
    "ms_powerpoint": {
        title: "PowerPoint", description: "Presentations", icon: "Presentation", color: "orange", questions: [
            { q: "Start SlideShow?", options: ["F5", "F1", "F10", "Esc"], correct: 0, explanation: "F5." },
            { q: "New Slide Shortcut?", options: ["Ctrl+M", "Ctrl+N", "Ctrl+S", "Ctrl+D"], correct: 0, explanation: "Ctrl+M." },
            { q: "Duplicate Slide?", options: ["Ctrl+D", "Ctrl+C", "Ctrl+X", "Ctrl+V"], correct: 0, explanation: "Ctrl+D." },
            { q: "End SlideShow?", options: ["Esc", "End", "Home", "Del"], correct: 0, explanation: "Escape key." },
            { q: "Default Orientation?", options: ["Landscape", "Portrait", "Square", "Vertical"], correct: 0, explanation: "Landscape." },
            { q: "Effect between slides?", options: ["Transition", "Animation", "Design", "Morph"], correct: 0, explanation: "Transition." },
            { q: "Effect on objects?", options: ["Animation", "Transition", "Flow", "Video"], correct: 0, explanation: "Animation." },
            { q: "Format for Show?", options: [".ppsx", ".pptx", ".ppt", ".pdf"], correct: 0, explanation: ".ppsx autosplays." },
            { q: "View for reordering?", options: ["Slide Sorter", "Normal", "Reading", "Notes"], correct: 0, explanation: "Slide Sorter." },
            { q: "Insert Chart tab?", options: ["Insert", "Home", "Design", "View"], correct: 0, explanation: "Insert." },
            { q: "Max Zoom?", options: ["400%", "500%", "100%", "200%"], correct: 0, explanation: "400%." },
            { q: "Key for black screen?", options: ["B", "W", "S", "K"], correct: 0, explanation: "B." },
            { q: "Key for white screen?", options: ["W", "B", "S", "L"], correct: 0, explanation: "W." },
            { q: "To grouping objects?", options: ["Ctrl+G", "Ctrl+U", "Ctrl+B", "Ctrl+K"], correct: 0, explanation: "Ctrl+G." },
            { q: "Ungroup shortcut?", options: ["Ctrl+Shift+G", "Ctrl+U", "Ctrl+G", "Alt+G"], correct: 0, explanation: "Ctrl+Shift+G." },
            { q: "Minimum Font Size?", options: ["1", "8", "10", "12"], correct: 0, explanation: "1." },
            { q: "PowerPoint is a?", options: ["Presentation Software", "Database", "OS", "Game"], correct: 0, explanation: "Presentation." },
            { q: "Extension for 2007+?", options: [".pptx", ".ppt", ".p", ".pts"], correct: 0, explanation: ".pptx." },
            { q: "First slide is?", options: ["Title Slide", "Content", "Blank", "End"], correct: 0, explanation: "Title Slide." },
            { q: "Notes for speaker?", options: ["Notes Pane", "Handout", "Footer", "Header"], correct: 0, explanation: "Notes Pane." }
        ]
    },

    // --- DESIGN & MEDIA ---
    "photoshop": {
        title: "Photoshop", description: "Image Editing", icon: "Image", color: "blue", questions: [
            { q: "Native file format?", options: [".psd", ".jpg", ".png", ".gif"], correct: 0, explanation: ".psd (Photoshop Document)." },
            { q: "Free Transform?", options: ["Ctrl+T", "Ctrl+F", "Ctrl+R", "Ctrl+M"], correct: 0, explanation: "Ctrl+T." },
            { q: "Invert Selection?", options: ["Ctrl+Shift+I", "Ctrl+I", "Alt+I", "Shift+I"], correct: 0, explanation: "Ctrl+Shift+I." },
            { q: "Deselect shortcut?", options: ["Ctrl+D", "Ctrl+A", "Ctrl+S", "Esc"], correct: 0, explanation: "Ctrl+D." },
            { q: "Resolution for Web?", options: ["72 ppi", "300 ppi", "150 ppi", "600 ppi"], correct: 0, explanation: "72 ppi." },
            { q: "Resolution for Print?", options: ["300 ppi", "72 ppi", "100 ppi", "50 ppi"], correct: 0, explanation: "300 ppi." },
            { q: "CMYK is for?", options: ["Printing", "Web", "Screen", "Mobile"], correct: 0, explanation: "Printing." },
            { q: "RGB is for?", options: ["Screen", "Print", "Paper", "Fax"], correct: 0, explanation: "Digital Screens." },
            { q: "Tool to move?", options: ["Move Tool(V)", "Hand", "Pen", "Brush"], correct: 0, explanation: "Move Tool." },
            { q: "Clone Stamp does?", options: ["Copies pixels", "Erases", "Draws", "Selects"], correct: 0, explanation: "Copies pixels from source." },
            { q: "Magic Wand selects?", options: ["Similar Colors", "Shapes", "Lines", "All"], correct: 0, explanation: "Similar Colors." },
            { q: "Layer panel key?", options: ["F7", "F5", "F6", "F8"], correct: 0, explanation: "F7." },
            { q: "Duplicate Layer?", options: ["Ctrl+J", "Ctrl+L", "Ctrl+D", "Ctrl+C"], correct: 0, explanation: "Ctrl+J." },
            { q: "Default Background?", options: ["Locked", "Unlocked", "Transparent", "Red"], correct: 0, explanation: "Locked." },
            { q: "To zoom fit?", options: ["Ctrl+0", "Ctrl+1", "Ctrl++", "Ctrl+-"], correct: 0, explanation: "Ctrl+0." },
            { q: "Hand Tool key?", options: ["Spacebar", "H", "M", "P"], correct: 0, explanation: "Spacebar (Temporary)." },
            { q: "Lasso Tool is for?", options: ["Freehand Selection", "Typing", "Painting", "Erasing"], correct: 0, explanation: "Freehand Selection." },
            { q: "Bucket Fill key?", options: ["G", "B", "F", "K"], correct: 0, explanation: "G." },
            { q: "Eye icon means?", options: ["Visibility", "Lock", "Link", "Delete"], correct: 0, explanation: "Visibility." },
            { q: "Opacity means?", options: ["Transparency", "Size", "Color", "Blur"], correct: 0, explanation: "Transparency level." }
        ]
    },
    "coreldraw": {
        title: "CorelDraw", description: "Vector Graphics", icon: "PenTool", color: "green", questions: [
            { q: "CorelDraw is _ based?", options: ["Vector", "Raster", "Pixel", "Bitmap"], correct: 0, explanation: "Vector based." },
            { q: "Extension for Corel?", options: [".cdr", ".crl", ".cor", ".draw"], correct: 0, explanation: ".cdr." },
            { q: "Key to group?", options: ["Ctrl+G", "Ctrl+U", "Ctrl+B", "Ctrl+K"], correct: 0, explanation: "Ctrl+G." },
            { q: "Key to ungroup?", options: ["Ctrl+U", "Ctrl+G", "Ctrl+K", "Ctrl+L"], correct: 0, explanation: "Ctrl+U." },
            { q: "Convert to Curves?", options: ["Ctrl+Q", "Ctrl+C", "Ctrl+K", "Ctrl+Shift+Q"], correct: 0, explanation: "Ctrl+Q." },
            { q: "F9 key does?", options: ["Full Screen", "Save", "Print", "Zoom"], correct: 0, explanation: "Full Screen Preview." },
            { q: "Import shortcut?", options: ["Ctrl+I", "Ctrl+E", "Ctrl+P", "Ctrl+O"], correct: 0, explanation: "Ctrl+I." },
            { q: "Export shortcut?", options: ["Ctrl+E", "Ctrl+I", "Ctrl+X", "Ctrl+S"], correct: 0, explanation: "Ctrl+E." },
            { q: "Tool to draw shapes?", options: ["Rectangle", "Pick", "Shape", "Text"], correct: 0, explanation: "Rectangle/Ellipse tools." },
            { q: "Pick Tool is for?", options: ["Selecting/Moving", "Drawing", "Cutting", "Painting"], correct: 0, explanation: "Selecting and Moving objects." },
            { q: "Shape Tool key?", options: ["F10", "F5", "F2", "F8"], correct: 0, explanation: "F10." },
            { q: "Zoom Tool key?", options: ["Z", "F2", "H", "S"], correct: 0, explanation: "Z." },
            { q: "Fill color?", options: ["Left Click", "Right Click", "Double Click", "Scroll"], correct: 0, explanation: "Left Click on palette." },
            { q: "Outline color?", options: ["Right Click", "Left Click", "Shift Click", "Alt Click"], correct: 0, explanation: "Right Click on palette." },
            { q: "Combine objects?", options: ["Ctrl+L", "Ctrl+K", "Ctrl+G", "Ctrl+C"], correct: 0, explanation: "Ctrl+L." },
            { q: "Break Apart?", options: ["Ctrl+K", "Ctrl+L", "Ctrl+B", "Ctrl+U"], correct: 0, explanation: "Ctrl+K." },
            { q: "Weld does what?", options: ["Merges shapes", "Cuts shapes", "Groups", "Aligns"], correct: 0, explanation: "Combines shapes into one." },
            { q: "Trim does what?", options: ["Cuts overlap", "Joins", "Rotates", "Colors"], correct: 0, explanation: "Cuts one shape from another." },
            { q: "PowerClip is used to?", options: ["Place inside container", "Cut image", "Paste", "Copy"], correct: 0, explanation: "Frames content inside a shape." },
            { q: "Default paper size?", options: ["Letter/A4", "A3", "Legal", "B5"], correct: 0, explanation: "Usually Letter or A4." }
        ]
    },

    // --- CODING & TECH ---
    "python": {
        title: "Python", description: "Programming", icon: "Code", color: "yellow", questions: [
            { q: "Python file extension?", options: [".py", ".python", ".p", ".pt"], correct: 0, explanation: ".py." },
            { q: "Correct print syntax?", options: ["print('Hello')", "echo 'Hello'", "printf('Hello')", "System.out.print"], correct: 0, explanation: "print()." },
            { q: "Comment symbol?", options: ["#", "//", "/*", "--"], correct: 0, explanation: "#." },
            { q: "List is mutable?", options: ["Yes", "No", "Maybe", "Only integers"], correct: 0, explanation: "Yes." },
            { q: "Tuple is mutable?", options: ["No", "Yes", "Sometimes", "Always"], correct: 0, explanation: "No (Immutable)." },
            { q: "Dictionary syntax?", options: ["{key:value}", "[key:value]", "(key:value)", "<key:value>"], correct: 0, explanation: "{}." },
            { q: "Power operator?", options: ["**", "^", "pool()", "exp()"], correct: 0, explanation: "**." },
            { q: "Keyword for function?", options: ["def", "func", "function", "define"], correct: 0, explanation: "def." },
            { q: "Loop types?", options: ["for, while", "for, foreach", "do-while", "repeat"], correct: 0, explanation: "for and while." },
            { q: "Boolean values?", options: ["True, False", "true, false", "1, 0", "T, F"], correct: 0, explanation: "Capitalized True, False." },
            { q: "Input function?", options: ["input()", "get()", "scanf()", "read()"], correct: 0, explanation: "input()." },
            { q: "Convert to string?", options: ["str()", "string()", "text()", "char()"], correct: 0, explanation: "str()." },
            { q: "Length function?", options: ["len()", "length()", "size()", "count()"], correct: 0, explanation: "len()." },
            { q: "Index starts at?", options: ["0", "1", "-1", "10"], correct: 0, explanation: "0." },
            { q: "Append to list?", options: [".append()", ".add()", ".insert()", ".push()"], correct: 0, explanation: ".append()." },
            { q: "Library import?", options: ["import", "include", "using", "require"], correct: 0, explanation: "import." },
            { q: "Not Equal operator?", options: ["!=", "<>", "!==", "not="], correct: 0, explanation: "!=" },
            { q: "Integer division?", options: ["//", "/", "%", "div"], correct: 0, explanation: "//." },
            { q: "Modulus (Remainder)?", options: ["%", "/", "//", "rem"], correct: 0, explanation: "%." },
            { q: "Variable naming?", options: ["No spaces", "Start with number", "Any symbol", "Reserved words"], correct: 0, explanation: "Cannot start with number or be reserved." }
        ]
    },
    "c_programming": {
        title: "C Language", description: "Structured Programming", icon: "Code", color: "slate", questions: [
            { q: "Who developed C?", options: ["Dennis Ritchie", "Bjarne Stroustrup", "James Gosling", "Guido van Rossum"], correct: 0, explanation: "Dennis Ritchie." },
            { q: "C is which level?", options: ["Middle Level", "Low Level", "High Level", "Machine Level"], correct: 0, explanation: "Middle Level Language." },
            { q: "Extension for C?", options: [".c", ".cpp", ".cs", ".java"], correct: 0, explanation: ".c." },
            { q: "Print function?", options: ["printf()", "cout", "print", "echo"], correct: 0, explanation: "printf()." },
            { q: "Scan function?", options: ["scanf()", "cin", "input", "read"], correct: 0, explanation: "scanf()." },
            { q: "Main function return type?", options: ["int", "void", "float", "char"], correct: 0, explanation: "int main()." },
            { q: "Line terminator?", options: [";", ":", ".", ","], correct: 0, explanation: "Semicolon ;." },
            { q: "Comment syntax?", options: ["// or /* */", "#", "--", "<!--"], correct: 0, explanation: "// Single, /* Multi */." },
            { q: "Address of operator?", options: ["&", "*", "@", "#"], correct: 0, explanation: "&." },
            { q: "Pointer operator?", options: ["*", "&", "^", "->"], correct: 0, explanation: "*." },
            { q: "Format specifier for int?", options: ["%d", "%f", "%c", "%s"], correct: 0, explanation: "%d." },
            { q: "Format specifier for float?", options: ["%f", "%d", "%c", "%lf"], correct: 0, explanation: "%f." },
            { q: "Loop structures?", options: ["for, while, do-while", "for, foreach", "repeat", "loop"], correct: 0, explanation: "All three." },
            { q: "Switch case uses?", options: ["break", "stop", "exit", "continue"], correct: 0, explanation: "break to exit case." },
            { q: "Array index starts?", options: ["0", "1", "-1", "2"], correct: 0, explanation: "0." },
            { q: "Structure keyword?", options: ["struct", "class", "object", "type"], correct: 0, explanation: "struct." },
            { q: "Header file for printf?", options: ["stdio.h", "conio.h", "math.h", "string.h"], correct: 0, explanation: "Standard Input Output." },
            { q: "Logical AND?", options: ["&&", "&", "AND", "||"], correct: 0, explanation: "&&." },
            { q: "Increment operator?", options: ["++", "+1", "inc", "add"], correct: 0, explanation: "++." },
            { q: "Size of int (usually)?", options: ["4 bytes", "2 bytes", "8 bytes", "1 byte"], correct: 0, explanation: "4 bytes (32/64 bit)." }
        ]
    },
    "web_design": {
        title: "Web Design", description: "HTML & CSS", icon: "Code", color: "indigo", questions: [
            { q: "HTML stands for?", options: ["Hyper Text Markup Language", "Hyper Tool Link", "Home Text Mark", "None"], correct: 0, explanation: "Hyper Text Markup Language." },
            { q: "CSS stands for?", options: ["Cascading Style Sheets", "Creative Style Sheet", "Computer Style System", "Color Style Sheet"], correct: 0, explanation: "Cascading Style Sheets." },
            { q: "Tag for largest heading?", options: ["h1", "h6", "head", "header"], correct: 0, explanation: "<h1>." },
            { q: "Tag for paragraph?", options: ["p", "para", "pg", "text"], correct: 0, explanation: "<p>." },
            { q: "Tag for image?", options: ["img", "image", "pic", "src"], correct: 0, explanation: "<img>." },
            { q: "Attribute for link URL?", options: ["href", "src", "link", "url"], correct: 0, explanation: "href (Hypertext Reference)." },
            { q: "List with bullets?", options: ["ul", "ol", "li", "bl"], correct: 0, explanation: "Unordered List <ul>." },
            { q: "List with numbers?", options: ["ol", "ul", "dl", "nl"], correct: 0, explanation: "Ordered List <ol>." },
            { q: "Correct CSS syntax?", options: ["color: red;", "color = red", "font-color: red", "text: red"], correct: 0, explanation: "property: value;" },
            { q: "Select element by ID?", options: ["#id", ".id", "id", "*id"], correct: 0, explanation: "#." },
            { q: "Select element by Class?", options: [".class", "#class", "class", "$class"], correct: 0, explanation: "Dot notation." },
            { q: "HTML5 doctype?", options: ["<!DOCTYPE html>", "<html5>", "<doctype xml>", "<doc>"], correct: 0, explanation: "<!DOCTYPE html>." },
            { q: "Tag for line break?", options: ["br", "lb", "break", "ln"], correct: 0, explanation: "<br>." },
            { q: "Tag for bold text?", options: ["b or strong", "bold", "dark", "big"], correct: 0, explanation: "<b> or <strong>." },
            { q: "Which is block element?", options: ["div", "span", "a", "img"], correct: 0, explanation: "<div> is block." },
            { q: "External CSS link?", options: ["<link>", "<style>", "<css>", "<script>"], correct: 0, explanation: "<link rel='stylesheet'>." },
            { q: "Background color property?", options: ["background-color", "bgcolor", "color-bg", "back-color"], correct: 0, explanation: "background-color." },
            { q: "Table row tag?", options: ["tr", "td", "th", "tab"], correct: 0, explanation: "<tr>." },
            { q: "Input type for text?", options: ["type='text'", "type='input'", "type='string'", "type='write'"], correct: 0, explanation: "type='text'." }
        ]
    },

    // --- FUNDAMENTALS ---
    "internet_basics": {
        title: "Internet & Basics", description: "Fundamentals", icon: "Wifi", color: "cyan", questions: [
            { q: "Brain of Computer?", options: ["CPU", "RAM", "HDD", "Mouse"], correct: 0, explanation: "Central Processing Unit." },
            { q: "RAM stands for?", options: ["Random Access Memory", "Read Access Memory", "Run All Memory", "None"], correct: 0, explanation: "Random Access Memory." },
            { q: "ROM stands for?", options: ["Read Only Memory", "Random Only Memory", "Run Only Memory", "None"], correct: 0, explanation: "Read Only Memory." },
            { q: "1 Byte = ?", options: ["8 bits", "4 bits", "16 bits", "10 bits"], correct: 0, explanation: "8 bits." },
            { q: "Input device?", options: ["Keyboard", "Monitor", "Printer", "Speaker"], correct: 0, explanation: "Keyboard sends data in." },
            { q: "Output device?", options: ["Monitor", "Mouse", "Scanner", "Joystick"], correct: 0, explanation: "Monitor displays data." },
            { q: "WWW stands for?", options: ["World Wide Web", "World Web Wide", "Web World Wide", "None"], correct: 0, explanation: "World Wide Web." },
            { q: "HTTP means?", options: ["Hyper Text Transfer Protocol", "Hyper Transfer Text Protocol", "None", "High Text Transfer"], correct: 0, explanation: "Hyper Text Transfer Protocol." },
            { q: "ISP means?", options: ["Internet Service Provider", "Internal Service Provider", "None", "Internet System Provider"], correct: 0, explanation: "Internet Service Provider." },
            { q: "URL means?", options: ["Uniform Resource Locator", "Universal Resource Link", "None", "Uniform Registered Link"], correct: 0, explanation: "Uniform Resource Locator." },
            { q: "Short cut for Copy?", options: ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+A"], correct: 0, explanation: "Ctrl+C." },
            { q: "Short cut for Cut?", options: ["Ctrl+X", "Ctrl+C", "Ctrl+V", "Ctrl+Z"], correct: 0, explanation: "Ctrl+X." },
            { q: "Software type of Windows?", options: ["Operating System", "Application", "Utility", "Hardware"], correct: 0, explanation: "System Software (OS)." },
            { q: "GUI stands for?", options: ["Graphical User Interface", "Global User Interface", "General Used Interface", "None"], correct: 0, explanation: "Graphical User Interface." },
            { q: "Virus is a?", options: ["Program", "Hardware", "Person", "File"], correct: 0, explanation: "Malicious Program." },
            { q: "Google Chrome is?", options: ["Browser", "Search Engine", "OS", "Antivirus"], correct: 0, explanation: "Web Browser." },
            { q: "Google is?", options: ["Search Engine", "Browser", "Hardware", "Virus"], correct: 0, explanation: "Search Engine." },
            { q: "Email stands for?", options: ["Electronic Mail", "Electric Mail", "Engine Mail", "Easy Mail"], correct: 0, explanation: "Electronic Mail." },
            { q: "BCC stands for?", options: ["Blind Carbon Copy", "Black Carbon Copy", "Back Copy", "None"], correct: 0, explanation: "Blind Carbon Copy." },
            { q: "WiFi means?", options: ["Wireless Fidelity", "Wire Fire", "Wireless Find", "None"], correct: 0, explanation: "Wireless Fidelity." }
        ]
    },
    "hardware": {
        title: "Hardware", description: "PC Components", icon: "Activity", color: "slate", questions: [
            { q: "Main circuit board?", options: ["Motherboard", "Fatherboard", "Breadboard", "Chipboard"], correct: 0, explanation: "Motherboard." },
            { q: "Permanent Storage?", options: ["HDD/SSD", "RAM", "Cache", "Register"], correct: 0, explanation: "Hard Drive or SSD." },
            { q: "Volatile Memory?", options: ["RAM", "ROM", "HDD", "DVD"], correct: 0, explanation: "RAM loses data on power off." },
            { q: "CPU Speed unit?", options: ["Hertz (GHz)", "Bytes", "Pixels", "Ohms"], correct: 0, explanation: "Gigahertz." },
            { q: "GPU stands for?", options: ["Graphics Processing Unit", "General Process Unit", "Global Power Unit", "None"], correct: 0, explanation: "Graphics Processing Unit." },
            { q: "VGA port is for?", options: ["Video/Monitor", "Audio", "Internet", "Printer"], correct: 0, explanation: "Visual Graphics Array." },
            { q: "USB stands for?", options: ["Universal Serial Bus", "United Serial Bus", "Universal System Bus", "None"], correct: 0, explanation: "Universal Serial Bus." },
            { q: "SMPS stands for?", options: ["Switched Mode Power Supply", "Simple Mode Power Supply", "System Main Power Supply", "None"], correct: 0, explanation: "Switched Mode Power Supply." },
            { q: "BIOS is stored in?", options: ["ROM", "RAM", "HDD", "CPU"], correct: 0, explanation: "ROM chip." },
            { q: "Which is pointing device?", options: ["Mouse", "Keyboard", "Scanner", "Printer"], correct: 0, explanation: "Mouse." },
            { q: "Printer output is?", options: ["Hard Copy", "Soft Copy", "Digital Copy", "None"], correct: 0, explanation: "Hard Copy." },
            { q: "Monitor output is?", options: ["Soft Copy", "Hard Copy", "Paper Copy", "None"], correct: 0, explanation: "Soft Copy." },
            { q: "1 GB = ?", options: ["1024 MB", "1000 MB", "1024 KB", "100 MB"], correct: 0, explanation: "1024 Megabytes." },
            { q: "SATA cable is for?", options: ["Hard Drive", "Monitor", "Audio", "Internet"], correct: 0, explanation: "Connects storage drives." },
            { q: "HDMI transfers?", options: ["Video & Audio", "Video Only", "Audio Only", "Power"], correct: 0, explanation: "High-Def Video and Audio." }
        ]
    },
    "iot_fundamentals": {
        title: "IoT Basics", description: "Internet of Things", icon: "Wifi", color: "indigo", questions: [
            { q: "IoT stands for?", options: ["Internet of Things", "Input of Things", "Intranet of Tools", "None"], correct: 0, explanation: "Internet of Things." },
            { q: "Common IoT Board?", options: ["Arduino", "Pentium", "Ryzen", "Snapdragon"], correct: 0, explanation: "Arduino/Raspberry Pi." },
            { q: "IoT sensor does what?", options: ["Detects changes", "Processes data", "Stores data", "Prints"], correct: 0, explanation: "Senses environment." },
            { q: "IoT communication?", options: ["Wireless/Wired", "Magic", "Telepathy", "Manual"], correct: 0, explanation: "Network modules." },
            { q: "Smart Home example?", options: ["Auto Lights", "Normal Bulb", "Chair", "Table"], correct: 0, explanation: "Automated lighting." },
            { q: "IoT Security risk?", options: ["Hacking", "Rust", "Dust", "Noise"], correct: 0, explanation: "Cyber vulnerabilities." },
            { q: "Cloud in IoT?", options: ["Data Storage/Processing", "Rain", "Sky", "Fog"], correct: 0, explanation: "Remote servers." },
            { q: "M2M means?", options: ["Machine to Machine", "Man to Man", "Mobile to Mobile", "None"], correct: 0, explanation: "Machine to Machine." },
            { q: "Arduino uses which language?", options: ["C++ simplified", "Java", "Python", "HTML"], correct: 0, explanation: "C/C++." },
            { q: "Raspberry Pi is a?", options: ["Mini Computer", "Sensor", "Cable", "Motor"], correct: 0, explanation: "Single-board computer." }
        ]
    },

    // --- ACCOUNTING ---
    "tally": {
        title: "Tally Prime", description: "Accounting", icon: "Calculator", color: "teal", questions: [
            { q: "Payment Voucher?", options: ["F5", "F6", "F4", "F8"], correct: 0, explanation: "F5." },
            { q: "Receipt Voucher?", options: ["F6", "F5", "F9", "F8"], correct: 0, explanation: "F6." },
            { q: "Contra Voucher?", options: ["F4", "F2", "F3", "F5"], correct: 0, explanation: "F4 (Bank/Cash)." },
            { q: "Sales Voucher?", options: ["F8", "F9", "F7", "F5"], correct: 0, explanation: "F8." },
            { q: "Purchase Voucher?", options: ["F9", "F8", "F6", "F7"], correct: 0, explanation: "F9." },
            { q: "Journal Voucher?", options: ["F7", "F4", "F2", "F1"], correct: 0, explanation: "F7." },
            { q: "Create Ledger?", options: ["Create > Ledger", "F1", "Ctrl+L", "Alt+C"], correct: 0, explanation: "Create menu or Alt+C." },
            { q: "Change Date?", options: ["F2", "F1", "F12", "F11"], correct: 0, explanation: "F2." },
            { q: "Change Period?", options: ["Alt+F2", "F2", "Ctrl+F2", "Shift+F2"], correct: 0, explanation: "Alt+F2." },
            { q: "Select Company?", options: ["Alt+F3/F3", "F1", "F12", "F11"], correct: 0, explanation: "F3 (Company)." },
            { q: "Assets = ?", options: ["Liabilities + Capital", "Profit", "Loss", "Expense"], correct: 0, explanation: "Accounting Equation." },
            { q: "GST stands for?", options: ["Goods and Services Tax", "Good Sales Tax", "General Tax", "None"], correct: 0, explanation: "Goods and Services Tax." },
            { q: "Dr stands for?", options: ["Debit", "Doctor", "Direct", "Deduct"], correct: 0, explanation: "Debit." },
            { q: "Cr stands for?", options: ["Credit", "Create", "Crash", "Core"], correct: 0, explanation: "Credit." },
            { q: "Cash A/c is?", options: ["Real", "Nominal", "Personal", "Fake"], correct: 0, explanation: "Real Account." },
            { q: "Salary A/c is?", options: ["Nominal", "Real", "Personal", "Asset"], correct: 0, explanation: "Nominal Account." },
            { q: "Balance Sheet shows?", options: ["Financial Position", "Profit", "Loss", "Sales"], correct: 0, explanation: "Assets & Liabilities." },
            { q: "P&L A/c shows?", options: ["Profit/Loss", "Cash", "Capital", "None"], correct: 0, explanation: "Net Profit or Loss." },
            { q: "Short cut to Delete?", options: ["Alt+D", "Ctrl+D", "Del", "Shift+D"], correct: 0, explanation: "Alt+D." },
            { q: "Print in Tally?", options: ["Ctrl+P", "Alt+P", "Ctrl+O", "F12"], correct: 0, explanation: "Ctrl+P." }
        ]
    },
    "busy": {
        title: "Busy", description: "Accounting SW", icon: "Activity", color: "red", questions: [
            { q: "Save shortcut?", options: ["F2", "Ctrl+S", "F10", "Alt+S"], correct: 0, explanation: "F2." },
            { q: "Modify Master?", options: ["Alt+M", "Ctrl+M", "F3", "F4"], correct: 0, explanation: "Alt+M." },
            { q: "Add Master?", options: ["F3", "Ctrl+A", "Alt+A", "Ins"], correct: 0, explanation: "F3." },
            { q: " Busy backup ext?", options: [".zip (Auto)", ".bus", ".bkp", ".txt"], correct: 0, explanation: "Usually Auto Backup in zip/folder." },
            { q: "Payment key?", options: ["F5", "F6", "F7", "F8"], correct: 0, explanation: "F5." },
            { q: "Receipt key?", options: ["F6", "F5", "F9", "F8"], correct: 0, explanation: "F6." },
            { q: "Calculator?", options: ["F10", "F12", "Ctrl+C", "Alt+C"], correct: 0, explanation: "F10." },
            { q: "Exit?", options: ["Esc", "Alt+F4", "Ctrl+Q", "End"], correct: 0, explanation: "Esc." },
            { q: "Busy developed by?", options: ["Busy Infotech", "Tally", "Microsoft", "Adobe"], correct: 0, explanation: "Busy Infotech." },
            { q: "GST Reports?", options: ["Display > GST", "F1", "F2", "None"], correct: 0, explanation: "Display menu." }
        ]
    },
    "marg": {
        title: "Marg ERP", description: "Pharma/Retail", icon: "ShoppingBag", color: "indigo", questions: [
            { q: "Zoom in Marg?", options: ["F12", "Z", "Ctrl+Z", "alt+Z"], correct: 0, explanation: "F12." },
            { q: "Sale Bill?", options: ["Alt+N", "Ctrl+N", "Alt+S", "F8"], correct: 0, explanation: "Alt+N usually new bill." },
            { q: "Exit key?", options: ["Esc", "End", "X", "Q"], correct: 0, explanation: "Esc." },
            { q: "Search Menu?", options: ["Ctrl+F", "F7", "F3", "Space"], correct: 0, explanation: "Differs, but Search is core." },
            { q: "Marg popular for?", options: ["Pharma", "Civil", "Games", "Music"], correct: 0, explanation: "Pharma." }
        ]
    }
};
