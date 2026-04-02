import { createSlice } from '@reduxjs/toolkit';
import { QUIZ_BANK } from '../../lib/quizData';
import { COURSE_MODULES_MAP } from '../../data/curriculum';

// Initial state
const initialState = {
    activeStudentCourse: null,
    activeModules: [],
};

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setStudentCourse: (state, action) => {
            const courseTitle = action.payload || '';
            state.activeStudentCourse = courseTitle;

            // Simple exact match logic
            let matchedModules = COURSE_MODULES_MAP[courseTitle];
            
            // Fuzzy match (e.g., ADCA+ -> ADCA, O-Level -> O Level)
            if (!matchedModules) {
                const fuzzyMatchKey = Object.keys(COURSE_MODULES_MAP).find(key => 
                    courseTitle.toLowerCase().includes(key.toLowerCase())
                );
                matchedModules = COURSE_MODULES_MAP[fuzzyMatchKey] || COURSE_MODULES_MAP['default'];
            }

            // Hydrate the IDs from the QUIZ_BANK to pass rich data to the UI
            state.activeModules = matchedModules.map(moduleId => ({
                id: moduleId,
                ...QUIZ_BANK[moduleId], // Spread rich UI details and questions
                // Fallbacks if not fully populated in QUIZ_BANK yet
                title: QUIZ_BANK[moduleId]?.title || moduleId.replace('_', ' ').toUpperCase(),
                description: QUIZ_BANK[moduleId]?.description || 'Study Material',
                color: QUIZ_BANK[moduleId]?.color || 'blue'
            }));
        },
        clearCourseData: (state) => {
            state.activeStudentCourse = null;
            state.activeModules = [];
        }
    }
});

export const { setStudentCourse, clearCourseData } = courseSlice.actions;

// Selectors
export const selectActiveCourseModules = (state) => state.course.activeModules;
export const selectActiveStudentCourse = (state) => state.course.activeStudentCourse;

export default courseSlice.reducer;
