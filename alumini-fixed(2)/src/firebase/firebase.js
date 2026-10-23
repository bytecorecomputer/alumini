import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFnFqw6iD1YhQ5xwhSnd2rIKUJeR17wkU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "practice-be58e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "practice-be58e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "practice-be58e.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "849847321136",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:849847321136:web:27525bc43f41aca1b3e3f5"
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
