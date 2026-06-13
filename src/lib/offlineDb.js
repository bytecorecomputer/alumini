import Dexie from 'dexie';

export const db = new Dexie('ByteCoreOfflineDB');

db.version(1).stores({
    quizzes: 'id, courseId, data, lastUpdated',
    progress: 'studentId, data, lastSynced'
});

export const cacheQuizData = async (courseId, data) => {
    try {
        await db.quizzes.put({
            id: courseId,
            courseId,
            data,
            lastUpdated: Date.now()
        });
    } catch (error) {
        console.error('Failed to cache quiz data', error);
    }
};

export const getCachedQuizData = async (courseId) => {
    try {
        const record = await db.quizzes.get(courseId);
        return record ? record.data : null;
    } catch (error) {
        console.error('Failed to get cached quiz data', error);
        return null;
    }
};

export const saveOfflineProgress = async (studentId, progressData) => {
    try {
        await db.progress.put({
            studentId,
            data: progressData,
            lastSynced: null // null means it needs to be synced with Firebase
        });
    } catch (error) {
        console.error('Failed to save offline progress', error);
    }
};
