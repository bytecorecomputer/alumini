import { getMessagingSafe } from "../firebase/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Requests notification permission and returns the FCM token.
 */
export const requestNotificationPermission = async (userId) => {
    try {
        if (typeof window === "undefined" || typeof Notification === "undefined") {
            return null;
        }
        const messaging = await getMessagingSafe();
        if (!messaging) return null;

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
                await saveTokenToFirestore(userId, token);
                return token;
            }
        }
    } catch (error) {
        console.warn("Notification permission skipped:", error?.message);
    }
    return null;
};

/**
 * Saves the FCM token to the user's document in Firestore.
 */
const saveTokenToFirestore = async (userId, token) => {
    if (!userId) {
        try {
            const guestRef = doc(db, "guest_subscribers", token);
            await setDoc(guestRef, {
                token: token,
                updatedAt: Date.now()
            }, { merge: true });
            return;
        } catch (error) {
            console.error("Failed to save guest FCM token:", error);
            return;
        }
    }

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            fcmTokens: arrayUnion(token),
            notificationsEnabled: true,
            updatedAt: Date.now()
        });
    } catch {
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
 * Sets up the foreground message listener safely when FCM is supported.
 */
export const onMessageListener = () =>
    new Promise((resolve) => {
        getMessagingSafe().then((messaging) => {
            if (!messaging) return;
            onMessage(messaging, (payload) => {
                resolve(payload);
            });
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
