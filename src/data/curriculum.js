// Single source of truth for course curriculums across the entire application.
// This matches the IDs in QUIZ_BANK inside quizData.js

export const COURSE_MODULES_MAP = {
    "ADCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "typing", "internet_basics"],
    "MDCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "typing", "internet_basics", "coreldraw", "python"],
    "ACCOUNTING": ["advance_excel", "marg", "busy", "tally"],
    "DCST": ["ms_word", "ms_excel", "ms_powerpoint"],
    "DCA": ["ms_word", "ms_excel", "ms_powerpoint", "typing"],
    "GRAPHIC DESIGN": ["coreldraw", "photoshop", "adobe_illustrator", "canva"],
    "O LEVEL": ["libre_writer", "libre_calc", "libre_impress", "python", "html", "css", "js"],
    "CCC": ["libre_writer", "libre_calc", "libre_impress", "internet_basics", "ccc_mock_test"],
    // Fuzzy matching fallback
    "default": ["ms_word", "internet_basics"]
};
