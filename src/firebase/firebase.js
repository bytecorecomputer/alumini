import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFnFqw6iD1YhQ5xwhSnd2rIKUJeR17wkU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "practice-be58e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "practice-be58e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "practice-be58e.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "849847321136",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:849847321136:web:27525bc43f41aca1b3e3f5"
};

export const app = initializeApp(firebaseConfig);

let messagingInstance = null;

/**
 * Safely resolves Firebase Cloud Messaging only when supported by the browser.
 * Prevents crashes on iOS Safari, private windows, or QR scanner WebViews.
 */
export async function getMessagingSafe() {
  if (messagingInstance) return messagingInstance;
  try {
    if (typeof window === "undefined") return null;
    const supported = await isSupported();
    if (!supported) return null;
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

export const messaging = null;
