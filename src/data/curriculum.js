// Single source of truth for course curriculums across the entire application.
// This matches the IDs in QUIZ_BANK inside quizData.js

export const COURSE_MODULES_MAP = {
    "ADCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "photoshop", "intro_windows"],
    "MDCA": ["ms_word", "ms_excel", "ms_powerpoint", "tally", "photoshop", "coreldraw", "python", "typing"],
    "DCA": ["ms_word", "ms_excel", "ms_powerpoint", "typing"],
    "DCST": ["ms_word", "ms_excel", "ms_powerpoint"],
    "CCC": ["libre_writer", "libre_calc", "libre_impress", "iot_fundamentals"],
    "O Level": ["python", "web_design", "iot_fundamentals"],
    // Fuzzy matching fallback
    "default": ["ms_word", "internet_basics"]
};
