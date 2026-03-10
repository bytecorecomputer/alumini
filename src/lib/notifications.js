import { messaging } from "../firebase/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firestore";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Requests notification permission and returns the FCM token.
 */
export const requestNotificationPermission = async (userId) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
                console.log("FCM Token cached:", token);
                if (userId) {
                    await saveTokenToFirestore(userId, token);
                }
                return token;
            }
        } else {
            console.warn("Notification permission denied.");
        }
    } catch (error) {
        console.error("Error requesting notification permission:", error);
    }
    return null;
};

/**
 * Saves the FCM token to the user's document in Firestore.
 */
const saveTokenToFirestore = async (userId, token) => {
    try {
        // We add the token to an array of fcmTokens so one user can have multiple devices
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            fcmTokens: arrayUnion(token),
            notificationsEnabled: true,
            updatedAt: Date.now()
        });
    } catch (error) {
        // Fallback for students collection if user is not in 'users'
        try {
            const studentRef = doc(db, "students", userId);
            await updateDoc(studentRef, {
                fcmTokens: arrayUnion(token),
                notificationsEnabled: true,
                updatedAt: Date.now()
            });
        } catch (innerError) {
            console.error("Failed to save FCM token to Firestore:", innerError);
        }
    }
};

/**
 * Sets up the foreground message listener.
 */
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            resolve(payload);
        });
    });

/**
 * Queues a broadcast message to be sent via Cloud Functions (or handles offline queue UI)
 */
export const queueBroadcast = async (title, body, senderId) => {
    try {
        await addDoc(collection(db, "notifications_queue"), {
            title,
            body,
            sentBy: senderId,
            status: 'pending',
            target: 'all',
            createdAt: serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error("Failed to queue broadcast to Firestore:", e);
        throw e;
    }
};
