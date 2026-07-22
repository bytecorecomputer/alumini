import Dexie from 'dexie';
import { db as firestoreDb } from '../firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

export const offlineDb = new Dexie('ByteCoreOfflineDB');

offlineDb.version(2).stores({
    quizzes: 'id, courseId, data, lastUpdated',
    progress: 'studentId, data, lastSynced',
    students: 'registration, fullName, data',
    notes: 'id, topicId, content'
});

// Cache Quiz Data locally
export const cacheQuizData = async (courseId, data) => {
    try {
        await offlineDb.quizzes.put({
            id: courseId,
            courseId,
            data,
            lastUpdated: Date.now()
        });
    } catch (error) {
        console.error('Failed to cache quiz data in Dexie', error);
    }
};

// Retrieve Cached Quiz Data
export const getCachedQuizData = async (courseId) => {
    try {
        const record = await offlineDb.quizzes.get(courseId);
        return record ? record.data : null;
    } catch (error) {
        console.error('Failed to get cached quiz data', error);
        return null;
    }
};

// Save Offline Progress locally
export const saveOfflineProgress = async (studentId, progressData) => {
    try {
        await offlineDb.progress.put({
            studentId,
            data: progressData,
            lastSynced: null // Needs background sync when online
        });

        // Try syncing immediately if online
        if (navigator.onLine) {
            syncOfflineProgress(studentId, progressData);
        }
    } catch (error) {
        console.error('Failed to save offline progress', error);
    }
};

// Sync Offline Progress with Firestore
export const syncOfflineProgress = async (studentId, progressData) => {
    if (!navigator.onLine || !studentId || !progressData) return;
    try {
        const docRef = doc(firestoreDb, 'quiz_progress', studentId);
        await updateDoc(docRef, {
            ...progressData,
            lastActive: Date.now()
        });
        // Mark as synced in Dexie
        await offlineDb.progress.update(studentId, { lastSynced: Date.now() });
        console.log('Offline progress synced to Cloud Firestore successfully.');
    } catch (err) {
        console.warn('Sync delayed, will retry when network stabilizes.', err);
    }
};

// Listen for network reconnect to auto-sync unsynced progress
if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
        console.log('Network connection restored. Processing offline Dexie queue...');
        try {
            const unsynced = await offlineDb.progress.where('lastSynced').equals(null).toArray();
            for (const item of unsynced) {
                await syncOfflineProgress(item.studentId, item.data);
            }
        } catch (e) {
            console.error('Failed to process offline queue:', e);
        }
    });
}
