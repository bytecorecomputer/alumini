/**
 * Quiz Data Loader - High Performance Quiz System
 * Loads quiz data dynamically from separate JSON files
 */

class QuizLoader {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Load quiz data for a specific language
   * @param {string} language - The programming language (python, javascript, java, etc.)
   * @param {string} difficulty - The difficulty level (basic, intermediate, advanced)
   * @param {string} topic - The specific topic (optional)
   * @returns {Promise<Object>} Quiz data object
   */
  async loadQuiz(language, difficulty = 'basic', topic = null) {
    const cacheKey = topic ? `${language}-${difficulty}-${topic}` : `${language}-${difficulty}`;

    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Create new loading promise
    const loadingPromise = this.fetchQuizData(language, difficulty, topic);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const quizData = await loadingPromise;
      this.cache.set(cacheKey, quizData);
      this.loadingPromises.delete(cacheKey);
      return quizData;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Fetch quiz data from JSON file
   * @param {string} language - The programming language
   * @param {string} difficulty - The difficulty level
   * @returns {Promise<Object>} Quiz data
   */
  async fetchQuizData(language, difficulty = 'basic', topic = null) {
    try {
      // Handle file protocol (CORS restriction)
      if (window.location.protocol === 'file:') {
        return this.getFallbackData(language);
      }

      let response;

      // Try different file patterns in order
      if (topic) {
        // Try topic-specific file: language-difficulty-topic.json
        response = await fetch(`quiz-data/${language}-${difficulty}-${topic}.json`);
      }

      if (!response || !response.ok) {
        // Try language-difficulty.json
        response = await fetch(`quiz-data/${language}-${difficulty}.json`);
      }

      if (!response.ok) {
        // Try old format: language.json
        response = await fetch(`quiz-data/${language}.json`);
      }

      if (!response.ok) {
        throw new Error(`Failed to load ${language} quiz: ${response.status}`);
      }

      // Read response as text first to avoid "Unexpected end of JSON input" crashes
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error(`Empty response received for ${language} quiz`);
      }

      let quizData;
      try {
        quizData = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON format in ${language} quiz file`);
      }

      // Validate quiz data structure
      this.validateQuizData(quizData, language);

      return quizData;
    } catch (error) {
      console.error(`Error loading ${language} quiz:`, error);

      // Return fallback data if main file fails
      return this.getFallbackData(language);
    }
  }

  /**
   * Validate quiz data structure
   * @param {Object} quizData - Quiz data to validate
   * @param {string} language - Language name for error reporting
   */
  validateQuizData(quizData, language) {
    if (!quizData || typeof quizData !== 'object') {
      throw new Error(`Invalid quiz data format for ${language}`);
    }

    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error(`Missing required fields in ${language} quiz data`);
    }

    if (quizData.questions.length === 0) {
      throw new Error(`No questions found in ${language} quiz`);
    }

    // Validate each question
    quizData.questions.forEach((question, index) => {
      if (!question.question || !question.options || !Array.isArray(question.options)) {
        throw new Error(`Invalid question format at index ${index} in ${language} quiz`);
      }

      if (typeof question.correct !== 'number' || question.correct < 0 || question.correct >= question.options.length) {
        throw new Error(`Invalid correct answer index at question ${index} in ${language} quiz`);
      }
    });
  }

  /**
   * Get fallback data (Embedded Comprehensive Quiz Database)
   * This ensures the quiz works 100% without external dependencies/backend
   * @param {string} language - The programming language
   * @returns {Object} Comprehensive quiz data
   */
  getFallbackData(language) {
    const quizDatabase = {
      python: {
        "title": "Python Programming - Basic Quiz",
        "description": "Fundamental concepts including operators, if-else, and loops.",
        "difficulty": "basic",
        "questions": [
          {
            "question": "Python file ko kis extension se save kiya jata hai?",
            "options": [
              ".python",
              ".py",
              ".txt",
              ".exe"
            ],
            "correct": 1,
            "explanation": "Python file ka extension .py hota hai."
          },
          {
            "question": "x = 5 \nIsme variable 'x' ka data type kya hai?",
            "options": [
              "str",
              "int",
              "float",
              "bool"
            ],
            "correct": 1,
            "explanation": "5 ek poora number (integer) hai, isliye iska type 'int' hai."
          },
          {
            "question": "y = 3.14 \nIsme 'y' ka data type kya hai?",
            "options": [
              "int",
              "float",
              "str",
              "list"
            ],
            "correct": 1,
            "explanation": "Decimal wale numbers ko Python me 'float' kehte hain."
          },
          {
            "question": "name = 'Rahul' \nIsme 'Rahul' kya hai?",
            "options": [
              "Integer",
              "Float",
              "String",
              "Boolean"
            ],
            "correct": 2,
            "explanation": "Quotes ke andar wali value hamesha string hoti hai."
          },
          {
            "question": "Assignment operator kaun sa hai?",
            "options": [
              "==",
              "=",
              "+",
              "*"
            ],
            "correct": 1,
            "explanation": "Single '=' ka use value store karne (assign karne) ke liye hota hai."
          },
          {
            "question": "Comparison (muqabla) karne ke liye kaun sa operator sahi hai?",
            "options": [
              "=",
              "==",
              "+=",
              "!="
            ],
            "correct": 1,
            "explanation": "Do values barabar hain ya nahi, ye check karne ke liye '==' use hota hai."
          },
          {
            "question": "print(10 % 3) ka output kya hoga?",
            "options": [
              "3",
              "1",
              "0",
              "3.33"
            ],
            "correct": 1,
            "explanation": "% (Modulo) operator sheshphal (remainder) batata hai. 10 ko 3 se divide karne par 1 bachta hai."
          },
          {
            "question": "print(10 // 3) ka output kya aayega?",
            "options": [
              "3.33",
              "3",
              "4",
              "0"
            ],
            "correct": 1,
            "explanation": "// (Floor Division) decimal wala part hata kar sirf poora number deta hai."
          },
          {
            "question": "n = 10 \nif n % 2 == 0: \n    print('Even') \nelse: \n    print('Odd') \nOutput kya hoga?",
            "options": [
              "Even",
              "Odd",
              "10",
              "Error"
            ],
            "correct": 0,
            "explanation": "10 ko 2 se divide karne par remainder 0 aata hai, isliye ye 'Even' (sam) hai."
          },
          {
            "question": "Kissi number ko 'Odd' (visham) check karne ki sahi condition kya hai?",
            "options": [
              "n % 2 == 0",
              "n % 2 != 0",
              "n / 2 == 0",
              "n * 2 == 1"
            ],
            "correct": 1,
            "explanation": "Agar 2 se divide karne par remainder 0 NAHI aata, to wo Odd hota hai."
          },
          {
            "question": "print(2 ** 3) ka output kya hoga?",
            "options": [
              "6",
              "8",
              "9",
              "5"
            ],
            "correct": 1,
            "explanation": "** operator power (exponent) batata hai. 2*2*2 = 8."
          },
          {
            "question": "print(10 / 2) ka result kya hota hai?",
            "options": [
              "5",
              "5.0",
              "2",
              "0"
            ],
            "correct": 1,
            "explanation": "Single '/' hamesha result decimal (float) me deta hai."
          },
          {
            "question": "Python me single line comment kaise likhte hain?",
            "options": [
              "//",
              "/* */",
              "#",
              "--"
            ],
            "correct": 2,
            "explanation": "# symbol ka use comment likhne ke liye hota hai."
          },
          {
            "question": "for i in range(5): \n    print(i) \nIsme last number kya print hoga?",
            "options": [
              "5",
              "4",
              "0",
              "1"
            ],
            "correct": 1,
            "explanation": "range(5) hamesha 0 se 4 tak jata hai (stop value se ek kam)."
          },
          {
            "question": "range(1, 4) me kaun se numbers aayenge?",
            "options": [
              "1, 2, 3, 4",
              "1, 2, 3",
              "0, 1, 2, 3",
              "2, 3, 4"
            ],
            "correct": 1,
            "explanation": "Shuruwat 1 se hogi aur 4 se ek pehle (3) tak."
          },
          {
            "question": "for i in range(5, 0, -1): \n    print(i) \nOutput kis order me hoga?",
            "options": [
              "0, 1, 2, 3, 4, 5",
              "1, 2, 3, 4, 5",
              "5, 4, 3, 2, 1",
              "5, 4, 3, 2, 1, 0"
            ],
            "correct": 2,
            "explanation": "-1 step ka matlab hai reverse order me counting karna."
          },
          {
            "question": "range(10, 0, -1) me pehla number kya print hoga?",
            "options": [
              "0",
              "1",
              "9",
              "10"
            ],
            "correct": 3,
            "explanation": "Loop hamesha start value (10) se shuru hota hai."
          },
          {
            "question": "Agar loop ko reverse me chalana hai, to step parameter kya hona chahiye?",
            "options": [
              "Positive (1)",
              "Negative (-1)",
              "Zero",
              "Jarurat nahi"
            ],
            "correct": 1,
            "explanation": "Ulta (reverse) counting ke liye negative step like -1 use karte hain."
          },
          {
            "question": "range(0, 10, 2) me kaun se numbers aayenge?",
            "options": [
              "0, 1, 2, 3, 4",
              "0, 2, 4, 6, 8",
              "2, 4, 6, 8, 10",
              "0, 2, 4, 6, 8, 10"
            ],
            "correct": 1,
            "explanation": "2 ka step matlab hai har doosra number (0, 2, 4, 6, 8)."
          },
          {
            "question": "Indentation (Spaces) ka Python me kya kaam hai?",
            "options": [
              "Design ke liye",
              "Code blocks ko dikhane ke liye",
              "Speed badhane ke liye",
              "Zaroori nahi hai"
            ],
            "correct": 1,
            "explanation": "Python me spaces (indentation) se hi if-else aur loops ke block bante hain."
          },
          {
            "question": "x = 10 \nx += 2 \nAb x kya hoga?",
            "options": [
              "10",
              "2",
              "12",
              "8"
            ],
            "correct": 2,
            "explanation": "+= ka matlab hai purani value me 2 jud jana."
          },
          {
            "question": "print(bool(0)) ka output kya hoga?",
            "options": [
              "True",
              "False",
              "0",
              "Error"
            ],
            "correct": 1,
            "explanation": "Python me number 0 ko False mana jata hai."
          }
        ]
      },
      javascript: {
        title: "JavaScript Professional Quiz",
        description: "Verify your expertise in modern JavaScript and ES6+ features.",
        questions: [
          {
            question: "Inside which HTML element do we put the JavaScript?",
            options: ["<js>", "<scripting>", "<script>", "<javascript>"],
            correct: 2,
            explanation: "JavaScript code is placed inside the <script> tag."
          },
          {
            question: "How do you write 'Hello World' in an alert box?",
            options: ["msg('Hello World');", "alertBox('Hello World');", "msgBox('Hello World');", "alert('Hello World');"],
            correct: 3,
            explanation: "The alert() function displays a message in a modal box."
          },
          {
            question: "Which operator is used to check both value and type?",
            options: ["==", "===", "=", "!="],
            correct: 1,
            explanation: "The strict equality operator (===) checks both value and data type."
          },
          {
            question: "How do you declare a JavaScript variable?",
            options: ["v carName;", "variable carName;", "var carName;", "dim carName;"],
            correct: 2,
            explanation: "var, let, or const are used to declare variables."
          },
          {
            question: "What is the correct way to write a JavaScript array?",
            options: ["var colors = (1:'red', 2:'green')", "var colors = 1 = ('red'), 2 = ('green')", "var colors = ['red', 'green', 'blue']", "var colors = 'red', 'green', 'blue'"],
            correct: 2,
            explanation: "Arrays are written with square brackets []."
          },
          {
            question: "Which event occurs when the user clicks on an HTML element?",
            options: ["onchange", "onclick", "onmouseclick", "onmouseover"],
            correct: 1,
            explanation: "The onclick event occurs when the user clicks on an element."
          },
          {
            question: "How do you find the number with the highest value of x and y?",
            options: ["Math.ceil(x, y)", "Math.max(x, y)", "top(x, y)", "ceil(x, y)"],
            correct: 1,
            explanation: "Math.max() returns the number with the highest value."
          },
          {
            question: "Which keyword is used to define a constant variable?",
            options: ["let", "var", "const", "fix"],
            correct: 2,
            explanation: "The 'const' keyword defines a variable that cannot be reassigned."
          },
          {
            question: "What is the use of 'this' keyword in JavaScript?",
            options: ["Refers to the current object", "Refers to the previous object", "Refers to the variable", "None of these"],
            correct: 0,
            explanation: "'this' refers to the object it belongs to."
          },
          {
            question: "Which is not a JavaScript Framework?",
            options: ["Python Script", "JQuery", "Django", "NodeJS"],
            correct: 2,
            explanation: "Django is a Python framework, not JavaScript."
          }
        ]
      },
      html: {
        title: "HTML5 & CSS3 Designer Quiz",
        description: "Validate your frontend structural and styling skills.",
        questions: [
          {
            question: "What does HTML stand for?",
            options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"],
            correct: 0,
            explanation: "HTML stands for Hyper Text Markup Language."
          },
          {
            question: "Which HTML element is the largest heading?",
            options: ["<heading>", "<h6>", "<h1>", "<head>"],
            correct: 2,
            explanation: "<h1> defines the most important (largest) heading."
          },
          {
            question: "What is the correct HTML element for inserting a line break?",
            options: ["<break>", "<lb>", "<br>", "<newline>"],
            correct: 2,
            explanation: "<br> inserts a single line break."
          },
          {
            question: "Which character is used to indicate an end tag?",
            options: ["/", "<", "*", "^"],
            correct: 0,
            explanation: "End tags start with a forward slash, e.g., </p>."
          },
          {
            question: "What does CSS stand for?",
            options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
            correct: 1,
            explanation: "CSS stands for Cascading Style Sheets."
          },
          {
            question: "Which property is used to change the background color?",
            options: ["color", "bgcolor", "background-color", "bg-color"],
            correct: 2,
            explanation: "background-color is the correct property."
          },
          {
            question: "How do you select an element with id 'demo'?",
            options: ["#demo", ".demo", "demo", "*demo"],
            correct: 0,
            explanation: "IDs are selected using the hash (#) symbol."
          },
          {
            question: "Which property controls the text size?",
            options: ["font-style", "text-size", "font-size", "text-style"],
            correct: 2,
            explanation: "font-size controls the size of the text."
          }
        ]
      },
      java: {
        title: "Java Architect Quiz",
        description: "Test your object-oriented programming skills in Java.",
        questions: [
          {
            question: "Which data type is used to create a variable that should store text?",
            options: ["String", "txt", "string", "Text"],
            correct: 0,
            explanation: "String (capital S) is the class used for text in Java."
          },
          {
            question: "How do you create a variable with the numeric value 5?",
            options: ["num x = 5", "x = 5", "float x = 5", "int x = 5"],
            correct: 3,
            explanation: "int is the primitive type for whole numbers."
          },
          {
            question: "Which method is used to find the length of a string?",
            options: ["length()", "getSize()", "len()", "size()"],
            correct: 0,
            explanation: "The length() method returns the length of a string."
          },
          {
            question: "Which keyword is used to create a class?",
            options: ["class", "MyClass", "class()", "className"],
            correct: 0,
            explanation: "The 'class' keyword is used to define a class."
          },
          {
            question: "What is the correct way to main method?",
            options: ["public static void main(String[] args)", "void main(String[] args)", "public void main()", "static void main()"],
            correct: 0,
            explanation: "The entry point is always public static void main(String[] args)."
          },
          {
            question: "Which statement is used to stop a loop?",
            options: ["break", "stop", "return", "exit"],
            correct: 0,
            explanation: "The break statement jumps out of a loop."
          }
        ]
      },
      c: {
        title: "C Programming Classic Quiz",
        description: "Evaluate your understanding of C fundamentals and memory management.",
        questions: [
          {
            question: "How do you insert COMMENTS in C code?",
            options: ["/* this is a comment */", "// this is a comment", "# this is a comment", "-- this is a comment"],
            correct: 1,
            explanation: "// is used for single line comments in modern C."
          },
          {
            question: "What is the correct format specifier for integer?",
            options: ["%d", "%i", "%f", "%c"],
            correct: 0,
            explanation: "%d (or %i) is used for integers."
          },
          {
            question: "Which function is used to print text to the screen?",
            options: ["print()", "printf()", "cout", "echo"],
            correct: 1,
            explanation: "printf() is the standard output function in C."
          },
          {
            question: "How do you declare a pointer?",
            options: ["int *ptr;", "int ptr;", "int &ptr;", "pointer ptr;"],
            correct: 0,
            explanation: "Asterisk (*) is used to declare a pointer variable."
          },
          {
            question: "What is the size of 'char' in C usually?",
            options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
            correct: 0,
            explanation: "A char is typically 1 byte in size."
          },
          {
            question: "Which operator is used to get the address of a variable?",
            options: ["*", "&", "@", "->"],
            correct: 1,
            explanation: "& is the address-of operator."
          }
        ]
      },
      cpp: {
        title: "C++ Advanced Quiz",
        description: "Test your knowledge of Modern C++, OOP, and STL.",
        questions: [
          {
            question: "What is the correct way to create an object of a class named MyClass?",
            options: ["MyClass obj;", "new MyClass obj;", "object MyClass;", "class MyClass obj;"],
            correct: 0,
            explanation: "MyClass obj; creates an instance on the stack."
          },
          {
            question: "Which header file is required for input and output?",
            options: ["<iostream>", "<stdio.h>", "<conio.h>", "<stdlib.h>"],
            correct: 0,
            explanation: "<iostream> is the standard header for C++ I/O."
          },
          {
            question: "How do you create a reference variable of an existing variable?",
            options: ["int &ref = var;", "int ref = &var;", "int *ref = var;", "ref = var;"],
            correct: 0,
            explanation: "& creates a reference (alias) to a variable."
          },
          {
            question: "Which keyword is used for inheritance?",
            options: ["extends", ":", "inherits", "implements"],
            correct: 1,
            explanation: "Colon (:) is used to inherit from a base class."
          },
          {
            question: "Which is NOT a C++ access specifier?",
            options: ["public", "protected", "private", "internal"],
            correct: 3,
            explanation: "Internal is not a standard access specifier in C++."
          }
        ]
      },
      excel: {
        title: "Microsoft Excel Expert Quiz",
        description: "Prove your mastery of spreadsheets, formulas, and functions.",
        questions: [
          {
            question: "Which symbol must all formulas begin with?",
            options: ["=", "+", "(", "@"],
            correct: 0,
            explanation: "All Excel formulas must start with an equals sign (=)."
          },
          {
            question: "Which function adds all the numbers in a range of cells?",
            options: ["ADD", "SUM", "TOTAL", "PLUS"],
            correct: 1,
            explanation: "SUM() adds values."
          },
          {
            question: "What is the intersection of a column and a row called?",
            options: ["Cell", "Block", "Box", "Grid"],
            correct: 0,
            explanation: "It is called a Cell (e.g., A1)."
          },
          {
            question: "Which function finds the highest value in a range?",
            options: ["MAX", "HIGH", "TOP", "UPPER"],
            correct: 0,
            explanation: "MAX() returns the largest value."
          },
          {
            question: "What does VLOOKUP stand for?",
            options: ["Vertical Lookup", "Variable Lookup", "Value Lookup", "View Lookup"],
            correct: 0,
            explanation: "VLOOKUP stands for Vertical Lookup."
          },
          {
            question: "Which key is used to lock a cell reference (absolute reference)?",
            options: ["F2", "F4", "F5", "F9"],
            correct: 1,
            explanation: "F4 toggles absolute references ($A$1)."
          }
        ]
      },
      ccc: {
        title: "CCC Computer Concepts Quiz",
        description: "Essential computer fundamentals and digital literacy test.",
        questions: [
          {
            question: "Who is known as the father of the computer?",
            options: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"],
            correct: 1,
            explanation: "Charles Babbage is considered the father of the computer."
          },
          {
            question: "Which one is an input device?",
            options: ["Monitor", "Printer", "Keyboard", "Speaker"],
            correct: 2,
            explanation: "Keyboard is used to input data."
          },
          {
            question: "What is the full form of RAM?",
            options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Real Access Memory"],
            correct: 1,
            explanation: "RAM stands for Random Access Memory."
          },
          {
            question: "1 Byte is equal to?",
            options: ["4 bits", "8 bits", "16 bits", "32 bits"],
            correct: 1,
            explanation: "1 Byte = 8 Bits."
          },
          {
            question: "Which is not an Operating System?",
            options: ["Windows", "Linux", "Oracle", "DOS"],
            correct: 2,
            explanation: "Oracle is a database management system, not an OS."
          },
          {
            question: "What is the shortcut key for Copy?",
            options: ["Ctrl + C", "Ctrl + V", "Ctrl + X", "Ctrl + Z"],
            correct: 0,
            explanation: "Ctrl + C is used to copy."
          }
        ]
      }
    };

    // Return the specific language data or a generic fallback if not found
    return quizDatabase[language] || quizDatabase['python'];
  }

  /**
   * Preload quiz data for better performance
   * @param {Array<string>} languages - Array of language names to preload
   */
  async preloadQuizzes(languages) {
    const preloadPromises = languages.map(language =>
      this.loadQuiz(language).catch(error => {
        console.warn(`Failed to preload ${language} quiz:`, error);
      })
    );

    await Promise.allSettled(preloadPromises);
    console.log('Quiz preloading completed');
  }

  /**
   * Get available quiz languages
   * @returns {Array<string>} Array of available language names
   */
  getAvailableLanguages() {
    return ['python', 'javascript', 'java', 'cpp', 'html', 'c', 'excel', 'ccc'];
  }

  /**
   * Get available difficulty levels
   * @returns {Array<string>} Array of available difficulty levels
   */
  getAvailableDifficulties() {
    return ['basic', 'intermediate', 'advanced'];
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      cachedQuizzes: Array.from(this.cache.keys()),
      cacheSize: this.cache.size,
      loadingQuizzes: Array.from(this.loadingPromises.keys())
    };
  }
}

// Create global instance
window.quizLoader = new QuizLoader();

// Preload popular quizzes for better performance
document.addEventListener('DOMContentLoaded', () => {
  // Preload the most popular quizzes
  window.quizLoader.preloadQuizzes(['python', 'javascript', 'java', 'excel', 'ccc']);
});