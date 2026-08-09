/**
 * firebaseSync.js
 * -----------------------------------------------------------------------
 * Writes parsed student objects from fee-sync-kit directly to Firestore.
 * Updates both centres/{centreId}/students and main students collection
 * for 100% full compatibility across all admin & student features.
 * -----------------------------------------------------------------------
 */

import { writeBatch, doc, collection } from 'firebase/firestore';
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
      
      // Write to centre specific path
      const centreRef = doc(collection(db, `centres/${centreId}/students`), safeId);
      batch.set(centreRef, student, { merge: true });

      // Write to global students path for instant search & student login compatibility
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
