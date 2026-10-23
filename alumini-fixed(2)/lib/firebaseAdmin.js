import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { toDoc } from './sheet.js';

function init() { // same credential handling the project already used
  if (getApps().length) return true;
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      initializeApp({ credential: cert(sa) });
    } else if (process.env.VITE_FIREBASE_PRIVATE_KEY) {
      initializeApp({ credential: cert({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'practice-be58e', clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL, privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
    }
  } catch (e) { console.error('Firebase Admin initialization error:', e); }
  return getApps().length > 0;
}
let fake = null; export const __useFake = f => { fake = f; }; // tests only
export const ready = () => !!fake || init();
export const getDb = () => fake?.db || getFirestore();
export const getAuthAdmin = () => fake?.auth || getAuth();

// Login: make sure THIS student's document is current (self-healing, one read, write only if the sheet row changed).
export async function pushOne(st) {
  const ref = getDb().collection('students').doc(st.docId), snap = await ref.get(), doc = toDoc(st);
  if (!snap.exists || snap.get('sheetHash') !== st.h) await ref.set(doc, { merge: true });
  return { ...(snap.exists ? snap.data() : {}), ...doc };
}
// Sheet edit: compare fingerprints (read 1 field) and write ONLY the students whose row changed.
export async function pushChanged(list, all = false) {
  const db = getDb(), col = db.collection('students'), refs = list.map(s => col.doc(s.docId));
  const snaps = all ? [] : await db.getAll(...refs, { fieldMask: ['sheetHash'] });
  const todo = list.filter((s, i) => all || !snaps[i].exists || snaps[i].get('sheetHash') !== s.h);
  for (let i = 0; i < todo.length; i += 400) {
    const b = db.batch(); for (const s of todo.slice(i, i + 400)) b.set(col.doc(s.docId), toDoc(s), { merge: true }); await b.commit();
  }
  return todo.length;
}
