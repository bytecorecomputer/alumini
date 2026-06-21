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
