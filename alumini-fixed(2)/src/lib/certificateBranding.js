/**
 * certificateBranding.js
 * -----------------------------------------------------------------------
 * Lets an admin change the logo, signature image, and signatory name/title
 * that appear on every generated certificate/diploma — without touching
 * code. Stored as a single Firestore document so it updates everywhere
 * (certificate generator, downloads, verification page) at once.
 * -----------------------------------------------------------------------
 */
import { db } from "../firebase/firestore";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import defaultLogo from "../assets/format/logo.png";

const BRANDING_DOC = doc(db, "settings", "certificate_branding");

export const DEFAULT_BRANDING = {
    logoUrl: defaultLogo,
    signatureUrl: "", // empty = fall back to printed signatory name only
    signatoryName: "ByteCore",
    signatoryTitle: "CENTRE HEAD",
};

/** One-off fetch (e.g. right before generating a PDF). */
export async function getCertificateBranding() {
    try {
        const snap = await getDoc(BRANDING_DOC);
        if (snap.exists()) {
            return { ...DEFAULT_BRANDING, ...snap.data() };
        }
    } catch (err) {
        console.warn("Could not load certificate branding, using defaults.", err);
    }
    return DEFAULT_BRANDING;
}

/** Live subscription for the admin settings screen. */
export function subscribeCertificateBranding(callback) {
    return onSnapshot(BRANDING_DOC, (snap) => {
        callback(snap.exists() ? { ...DEFAULT_BRANDING, ...snap.data() } : DEFAULT_BRANDING);
    }, (err) => {
        console.warn("Certificate branding subscription failed.", err);
        callback(DEFAULT_BRANDING);
    });
}

/** Admin-only write. Firestore rules restrict this doc to admins. */
export async function saveCertificateBranding(partial) {
    await setDoc(BRANDING_DOC, { ...partial, updatedAt: Date.now() }, { merge: true });
}
