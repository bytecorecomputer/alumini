import { db } from '../firebase/firestore';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

/**
 * Initializes quiz progress profile for a student if it doesn't exist
 */
export async function studentQuizProfileInit(studentId) {
    if (!studentId) return;
    try {
        const ref = doc(db, 'quiz_progress', studentId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, {
                completedModules: [],
                unlockedBadges: [],
                totalScore: 0
            });
        }
    } catch (error) {
        console.error("Error initializing quiz profile:", error);
    }
}

/**
 * Gets student's quiz progress
 */
export async function getStudentQuizProgress(studentId) {
    const defaultState = { completedModules: [], unlockedBadges: [], totalScore: 0 };
    if (!studentId) return defaultState;
    try {
        const ref = doc(db, 'quiz_progress', studentId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            return snap.data();
        }
    } catch (error) {
        console.error("Error getting quiz progress:", error);
    }
    return defaultState;
}

/**
 * Marks a specific submodule as completed by the student
 * moduleIdentifier e.g., "ADCA|MS Word|Home Tab"
 */
export async function markModuleCompleted(studentId, moduleIdentifier, scoreEarned) {
    if (!studentId || !moduleIdentifier) return;
    try {
        const ref = doc(db, 'quiz_progress', studentId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();
            const modules = data.completedModules || [];
            if (!modules.includes(moduleIdentifier)) {
                await updateDoc(ref, {
                    completedModules: [...modules, moduleIdentifier],
                    totalScore: (data.totalScore || 0) + scoreEarned
                });
            }
        } else {
            await setDoc(ref, {
                completedModules: [moduleIdentifier],
                unlockedBadges: [],
                totalScore: scoreEarned
            });
        }
    } catch (error) {
        console.error("Error marking module completed:", error);
    }
}

/**
 * Unlocks a master badge once a full topic is cleared
 * badgeName e.g., "MS Word Mastery"
 */
export async function awardMasterBadge(studentId, badgeName) {
    if (!studentId || !badgeName) return;
    try {
        const ref = doc(db, 'quiz_progress', studentId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();
            const badges = data.unlockedBadges || [];
            if (!badges.includes(badgeName)) {
                await updateDoc(ref, {
                    unlockedBadges: [...badges, badgeName]
                });
            }
        } else {
            await setDoc(ref, {
                completedModules: [],
                unlockedBadges: [badgeName],
                totalScore: 0
            });
        }
    } catch (error) {
        console.error("Error awarding master badge:", error);
    }
}
