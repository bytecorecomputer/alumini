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

            // Parse compound courses (e.g., "O Level + Accounting" or "ADCA, O Level")
            // Handle hyphens and normalize multiple spaces to a single space
            const normalizedCourseTitle = courseTitle.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ');
            const courseSegments = normalizedCourseTitle.split(/\+|,|&|\band\b/).map(s => s.trim());
            
            const matchedModuleSet = new Set();
            
            courseSegments.forEach(segment => {
                if (!segment) return;
                // Normalize segment spaces again just in case
                const cleanSegment = segment.replace(/\s+/g, ' ');
                // Find matching course key in the map
                const fuzzyMatchKey = Object.keys(COURSE_MODULES_MAP).find(key => {
                    const cleanKey = key.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ');
                    return cleanSegment.includes(cleanKey);
                });
                
                const modulesForSegment = fuzzyMatchKey ? COURSE_MODULES_MAP[fuzzyMatchKey] : null;
                
                if (modulesForSegment) {
                    modulesForSegment.forEach(mod => matchedModuleSet.add(mod));
                }
            });

            // Fallback if absolutely no matches found
            if (matchedModuleSet.size === 0) {
                COURSE_MODULES_MAP['default'].forEach(mod => matchedModuleSet.add(mod));
            }

            const matchedModules = Array.from(matchedModuleSet);

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
