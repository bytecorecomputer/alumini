// Single source of truth for course curriculums across the entire application.
// This matches the IDs in QUIZ_BANK inside quizData.js

export const COURSE_MODULES_MAP = {
    "ADCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "typing", "internet_basics"],
    "MDCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "typing", "internet_basics", "coreldraw", "python"],
    "ACCOUNTING": ["advance_excel", "marg", "busy", "tally"],
    "DFA": ["tally", "advance_excel", "marg", "busy"],
    "DCST": ["ms_word", "ms_excel", "ms_powerpoint", "c_programming", "html"],
    "DCA": ["ms_word", "ms_excel", "ms_powerpoint", "typing"],
    "GRAPHIC DESIGN": ["coreldraw", "photoshop", "adobe_illustrator", "canva"],
    "UI/UX": ["figma", "adobe_illustrator", "canva", "photoshop"],
    "O LEVEL": ["libre_writer", "libre_calc", "libre_impress", "python", "html", "css", "js"],
    "CCC": ["libre_writer", "libre_calc", "libre_impress", "internet_basics", "ccc_mock_test"],
    "FULL STACK": ["html", "css", "js", "react", "node", "mongodb", "python"],
    "WEB DEVELOPMENT": ["html", "css", "js", "react"],
    "REACT": ["html", "css", "js", "react", "nextjs"],
    "DATA SCIENCE": ["python", "machine_learning", "sql", "data_visualization"],
    "MACHINE LEARNING": ["python", "machine_learning", "deep_learning", "ai_fundamentals"],
    "PYTHON": ["python", "django", "data_analysis", "automation"],
    "JAVA": ["java_core", "java_advance", "spring_boot", "dsa"],
    "C++": ["cpp_core", "cpp_advance", "dsa", "stl"],
    "C PROGRAMMING": ["c_programming", "dsa", "c_projects"],
    "C LANGUAGE": ["c_programming", "dsa", "c_projects"],
    "CYBER SECURITY": ["networking", "linux_basics", "ethical_hacking", "cryptography"],
    "CLOUD COMPUTING": ["aws_basics", "azure_basics", "cloud_security", "devops"],
    "DIGITAL MARKETING": ["seo", "social_media_marketing", "google_ads", "email_marketing"],
    "MS OFFICE": ["ms_word", "ms_excel", "ms_powerpoint", "advance_excel"],
    // Fuzzy matching fallback
    "default": ["ms_word", "internet_basics"]
};

// -----------------------------------------------------------------------
// MODULE_ID_ALIASES
// -----------------------------------------------------------------------
// The module IDs above (e.g. "c_programming", "ms_powerpoint", "html") are
// the canonical IDs used everywhere in the app for UI, progress-tracking,
// and certificates. But the actual quiz QUESTION BANKS live in
// hindiQuizData.js under whatever key they were originally authored with,
// which doesn't always match the canonical ID (e.g. the real question data
// for "c_programming" is stored under "C Programming Foundation").
//
// This alias map lets the quiz-loading code look up the RIGHT key in
// hindiQuizData.js for each canonical module ID, so a student's course sees
// its real quiz instead of a "Coming Soon" placeholder. Add an entry here
// whenever hindiQuizData.js's top-level key doesn't already equal the
// module ID (in lowercase).
export const MODULE_ID_ALIASES = {
    "ms_powerpoint": "powerpoint",
    "internet_basics": "fundamentals",
    "c_programming": "C Programming Foundation",
    // O-Level's web track currently shares one combined quiz bank.
    "html": "web_design",
    "css": "web_design",
    "js": "web_design",
};

// -----------------------------------------------------------------------
// flattenQuizCourseShape
// -----------------------------------------------------------------------
// A few question banks in hindiQuizData.js (e.g. "C Programming
// Foundation") were authored in a "multi-topic" shape —
// { topicName: { modules: { "Master Assessment": [...] } } } — instead of
// the flat single-course shape { modules: { topicName: [...] } } that the
// rest of the app expects (student quiz dashboard, live quiz builder).
// Call this on any raw HINDI_QUIZ_DATA[key] before using it so both shapes
// work everywhere without repeating this logic.
export function flattenQuizCourseShape(raw, fallbackTitle) {
    if (!raw) return raw;
    if (raw.modules) return raw; // already flat-course shaped
    const modules = {};
    Object.entries(raw).forEach(([topicName, topic]) => {
        const qs = topic?.modules?.["Master Assessment"];
        if (Array.isArray(qs)) modules[topicName] = qs;
    });
    return {
        title: fallbackTitle || 'Assessment',
        description: "Comprehensive topic-wise assessment.",
        icon: "brain",
        color: "indigo",
        modules
    };
}
