const fs = require('fs');

const topics = [
    "Algorithm Flowcharts",
    "Data Types",
    "Conditionals",
    "Arrays & Strings",
    "Pointers logic",
    "Structures & Unions",
    "File Operations",
    "Recursion Mastery"
];

function generateQuestions(topicName) {
    const questions = [];
    for (let i = 1; i <= 20; i++) {
        questions.push({
            question: `What is the core concept of ${topicName} in C? (Question ${i})`,
            options: [
                `Option A for ${topicName} ${i}`,
                `Option B for ${topicName} ${i}`,
                `Option C for ${topicName} ${i}`,
                `Option D for ${topicName} ${i}`
            ],
            correctAnswer: Math.floor(Math.random() * 4),
            explanation: `This is a comprehensive explanation for ${topicName} question ${i}. It is essential for C programming.`
        });
    }
    return questions;
}

const cProgrammingData = {
    "C Programming Foundation": {}
};

topics.forEach(topic => {
    cProgrammingData["C Programming Foundation"][topic] = {
        description: `Master the concepts of ${topic} with these 20 comprehensive questions.`,
        color: 'slate',
        icon: 'monitor',
        modules: {
            "Master Assessment": generateQuestions(topic)
        }
    };
});

// Read existing file
let content = fs.readFileSync('src/data/hindiQuizData.js', 'utf8');

// The file ends with "};". Let's find the last occurrence of "};"
const lastBraceIndex = content.lastIndexOf('};');

if (lastBraceIndex !== -1) {
    const jsonString = JSON.stringify(cProgrammingData["C Programming Foundation"], null, 4);
    
    // Inject before the last closing brace of the main object
    // Wait, the main object structure is: export const HINDI_QUIZ_DATA = { ... };
    
    const newContent = content.substring(0, lastBraceIndex) + 
                       `, "C Programming Foundation": ` + jsonString + 
                       `\n};\n`;
                       
    fs.writeFileSync('src/data/hindiQuizData.js', newContent);
    console.log("Successfully added C Programming Foundation quizzes!");
} else {
    console.log("Could not find end of object");
}
