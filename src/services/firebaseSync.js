/**
 * firebaseSync.js
 * -----------------------------------------------------------------------
 * Writes parsed student objects from fee-sync-kit directly to Firestore.
 * Updates global students collection safely without permission errors.
 * -----------------------------------------------------------------------
 */

import { writeBatch, doc } from 'firebase/firestore';
import { fetchSheetRows } from './googleSheetFetch';
import { buildStudentsFromRows } from '../utils/csvToStudents';

const BATCH_LIMIT = 400;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function syncStudentsToFirestore(db, centreId, students) {
  const validStudents = students.filter((s) => s.regNo || s.registration);
  const chunks = chunkArray(validStudents, BATCH_LIMIT);

  let written = 0;

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    for (const student of chunk) {
      const safeId = String(student.regNo || student.registration).trim().replace(/[/\\]/g, '_');
      
      // Write ONLY to main 'students' collection (Guaranteed write permissions in Firestore rules)
      const globalRef = doc(db, 'students', safeId);
      batch.set(globalRef, student, { merge: true });
    }

    await batch.commit();
    written += chunk.length;
  }

  return { totalWritten: written, totalSkipped: students.length - written };
}

export async function syncCentreFromSheet({ db, centre }) {
  const rows = await fetchSheetRows(centre.sheetCsvUrl);
  const students = buildStudentsFromRows(rows, centre.id);
  const result = await syncStudentsToFirestore(db, centre.id, students);

  return {
    ...result,
    students,
  };
}
