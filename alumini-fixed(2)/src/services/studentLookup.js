/**
 * studentLookup.js
 * -----------------------------------------------------------------------
 * Student login & multi-centre sync helper from fee-sync-kit.
 * -----------------------------------------------------------------------
 */

import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { CENTRES } from '../config/centres';
import { syncCentreFromSheet } from './firebaseSync';

async function findInCentre(db, centreId, regNo, mobile) {
  const safeId = String(regNo).trim().replace(/[/\\]/g, '_');
  
  // 1. Try centre specific path
  const centreRef = doc(db, `centres/${centreId}/students`, safeId);
  let snap = await getDoc(centreRef);

  // 2. Fallback to main students collection
  if (!snap.exists()) {
    const globalRef = doc(db, 'students', safeId);
    snap = await getDoc(globalRef);
  }

  if (!snap.exists()) return null;

  const student = snap.data();
  const cleanMobileInput = String(mobile).replace(/\D/g, '');
  const last10 = (num) => String(num || '').replace(/\D/g, '').slice(-10);

  if (last10(student.mobile) !== last10(cleanMobileInput)) {
    return null;
  }

  return student;
}

export async function loginStudent(db, regNo, mobile, centreId) {
  if (!regNo || !mobile) {
    throw new Error('Registration number and mobile number are required.');
  }

  const centreIds = centreId ? [centreId] : Object.keys(CENTRES);

  for (const id of centreIds) {
    const student = await findInCentre(db, id, regNo, mobile);
    if (student) return student;
  }

  return null;
}

export async function syncAllCentres(db, onProgress) {
  const results = {};
  for (const centre of Object.values(CENTRES)) {
    onProgress?.(`Syncing ${centre.name}...`);
    results[centre.id] = await syncCentreFromSheet({ db, centre });
  }
  return results;
}
