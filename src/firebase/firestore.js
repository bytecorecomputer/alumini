import { initializeFirestore } from "firebase/firestore";
import { app } from "./firebase";

export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
