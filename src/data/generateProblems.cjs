const fs = require('fs');

const difficulties = ["Easy", "Medium", "Hard"];
const tagsList = ["Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "Depth-First Search", "Database", "Binary Search", "Tree", "Matrix", "Two Pointers", "Bit Manipulation", "Stack", "Design", "Graph", "Linked List", "Recursion", "Trie"];

const generateProblems = () => {
    const problems = [];
    
    // Hand-crafted premium problems (first 20)
    const premium = [
        { title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"] },
        { title: "Add Two Numbers", difficulty: "Medium", tags: ["Linked List", "Math"] },
        { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", tags: ["Hash Table", "String", "Sliding Window"] },
        { title: "Median of Two Sorted Arrays", difficulty: "Hard", tags: ["Array", "Binary Search", "Divide and Conquer"] },
        { title: "Longest Palindromic Substring", difficulty: "Medium", tags: ["String", "Dynamic Programming"] },
        { title: "Zigzag Conversion", difficulty: "Medium", tags: ["String"] },
        { title: "Reverse Integer", difficulty: "Medium", tags: ["Math"] },
        { title: "String to Integer (atoi)", difficulty: "Medium", tags: ["String", "Math"] },
        { title: "Palindrome Number", difficulty: "Easy", tags: ["Math"] },
        { title: "Regular Expression Matching", difficulty: "Hard", tags: ["String", "Dynamic Programming", "Recursion"] },
        { title: "Container With Most Water", difficulty: "Medium", tags: ["Array", "Two Pointers", "Greedy"] },
        { title: "Integer to Roman", difficulty: "Medium", tags: ["Hash Table", "Math", "String"] },
        { title: "Roman to Integer", difficulty: "Easy", tags: ["Hash Table", "Math", "String"] },
        { title: "Longest Common Prefix", difficulty: "Easy", tags: ["String"] },
        { title: "3Sum", difficulty: "Medium", tags: ["Array", "Two Pointers", "Sorting"] },
        { title: "3Sum Closest", difficulty: "Medium", tags: ["Array", "Two Pointers", "Sorting"] },
        { title: "Letter Combinations of a Phone Number", difficulty: "Medium", tags: ["Hash Table", "String", "Backtracking"] },
        { title: "4Sum", difficulty: "Medium", tags: ["Array", "Two Pointers", "Sorting"] },
        { title: "Remove Nth Node From End of List", difficulty: "Medium", tags: ["Linked List", "Two Pointers"] },
        { title: "Valid Parentheses", difficulty: "Easy", tags: ["String", "Stack"] },
    ];

    premium.forEach((p, idx) => {
        problems.push({
            id: (idx + 1).toString(),
            title: p.title,
            difficulty: p.difficulty,
            acceptance: Math.floor(Math.random() * 50 + 30) + "%", // 30-80%
            tags: p.tags,
            description: `<p>Given the constraints, solve the <strong>${p.title}</strong> problem.</p><p>This is a premium hand-crafted challenge carefully designed to test your understanding of <code>${p.tags.join(', ')}</code>.</p><h3>Example 1:</h3><pre>Input: ...\nOutput: ...\nExplanation: ...</pre><h3>Constraints:</h3><ul><li><code>1 <= N <= 10^5</code></li><li>Time Complexity: O(N)</li><li>Space Complexity: O(1)</li></ul>`,
            starterCode: {
                c: `#include <stdio.h>\n\nvoid solve() {\n    // Write your C code here\n}\n\nint main() {\n    solve();\n    return 0;\n}`,
                cpp: `#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your C++ code here\n    }\n};\n\nint main() {\n    Solution sol;\n    sol.solve();\n    return 0;\n}`,
                javascript: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solve(input) {\n    // Write your JS code here\n}\n\nconsole.log(solve());`,
                python: `class Solution:\n    def solve(self, data):\n        # Write your Python code here\n        pass\n\nif __name__ == '__main__':\n    sol = Solution()\n    sol.solve(None)`
            }
        });
    });

    // Generate remaining 980 problems programmatically
    const concepts = ["Array", "String", "Tree", "Graph", "Matrix", "Sequence", "Pattern", "Path", "Network", "Partition"];
    const verbs = ["Find", "Sort", "Calculate", "Optimize", "Reverse", "Rotate", "Merge", "Split", "Traverse", "Validate", "Count", "Sum"];
    const adjectives = ["Maximum", "Minimum", "Longest", "Shortest", "Valid", "Distinct", "Unique", "Overlapping", "Consecutive", "Alternating"];
    
    for (let i = 21; i <= 1000; i++) {
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const concept = concepts[Math.floor(Math.random() * concepts.length)];
        
        // Sometimes use adjective, sometimes just concept
        const title = Math.random() > 0.5 ? `${verb} ${adj} ${concept}` : `${verb} ${concept}`;
        
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const acceptance = Math.floor(Math.random() * 60 + 20) + "%"; // 20-80%
        
        // Randomly pick 1-3 tags
        const numTags = Math.floor(Math.random() * 3) + 1;
        const problemTags = [];
        for (let j = 0; j < numTags; j++) {
            const tag = tagsList[Math.floor(Math.random() * tagsList.length)];
            if (!problemTags.includes(tag)) problemTags.push(tag);
        }

        problems.push({
            id: i.toString(),
            title: title + (Math.random() > 0.8 ? " II" : ""),
            difficulty: difficulty,
            acceptance: acceptance,
            tags: problemTags,
            description: `<p>You are given a data structure representing a ${concept.toLowerCase()}. Your task is to <strong>${verb.toLowerCase()}</strong> the ${adj ? adj.toLowerCase() + ' ' : ''}elements according to the specific rules.</p><p>Return the result after performing the necessary operations.</p><h3>Example 1:</h3><pre>Input: nums = [1, 2, 3]\nOutput: 6\nExplanation: The total sum is 6.</pre><h3>Constraints:</h3><ul><li><code>1 <= N <= 10^4</code></li><li>Values are bounded by standard 32-bit integers.</li></ul>`,
            starterCode: {
                c: `#include <stdio.h>\n\nvoid solve() {\n    // Write your C code here\n}\n\nint main() {\n    solve();\n    return 0;\n}`,
                cpp: `#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your C++ code here\n    }\n};\n\nint main() {\n    Solution sol;\n    sol.solve();\n    return 0;\n}`,
                javascript: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solve(input) {\n    // Write your JS code here\n}\n\nconsole.log(solve());`,
                python: `class Solution:\n    def solve(self, data):\n        # Write your Python code here\n        pass\n\nif __name__ == '__main__':\n    sol = Solution()\n    sol.solve(None)`
            }
        });
    }

    // Save to JS file
    const content = `export const CODER_AFROJ_PROBLEMS = ${JSON.stringify(problems, null, 2)};\n`;
    fs.writeFileSync('coderAfrojProblems.js', content, 'utf-8');
    console.log("Successfully generated 1000 problems in coderAfrojProblems.js!");
};

generateProblems();
