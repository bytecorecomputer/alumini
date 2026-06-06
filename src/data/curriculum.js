// Single source of truth for course curriculums across the entire application.
// This matches the IDs in QUIZ_BANK inside quizData.js

export const COURSE_MODULES_MAP = {
    "ADCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "typing", "photoshop"],
    "MDCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "typing", "photoshop", "coreldraw", "python"],
    "ACCOUNTING": ["advance_excel", "marg", "busy", "tally"],
    "DCST": ["ms_word", "ms_excel", "ms_powerpoint"],
    "DCA": ["ms_word", "ms_excel", "ms_powerpoint", "typing"],
    "GRAPHIC DESIGN": ["coreldraw", "photoshop", "adobe_illustrator", "canva"],
    "O LEVEL": ["python", "html", "css", "js", "iot_fundamentals"],
    "CCC": ["libre_writer", "libre_calc", "libre_impress", "iot_fundamentals"],
    // Fuzzy matching fallback
    "default": ["ms_word", "internet_basics"]
};
