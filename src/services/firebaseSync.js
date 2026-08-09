/**
 * firebaseSync.js
 * -----------------------------------------------------------------------
 * Writes parsed student objects from fee-sync-kit directly to Firestore.
 * Uses diffStudents to only write added + updated records for maximum speed
 * and minimal Firestore writes.
 * -----------------------------------------------------------------------
 */

import { writeBatch, doc, collection, getDocs } from 'firebase/firestore';
import { fetchSheetRows } from './googleSheetFetch';
import { buildStudentsFromRows } from '../utils/csvToStudents';
import { diffStudents } from '../utils/diffStudents';

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

  // Fetch existing students for smart O(1) diffing
  let existingStudents = [];
  try {
    const snap = await getDocs(collection(db, 'students'));
    existingStudents = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("Could not fetch existing students for diffing, writing directly:", e);
  }

  const diffResult = existingStudents.length > 0
    ? diffStudents(existingStudents, validStudents)
    : { toWrite: validStudents, unchanged: [], added: validStudents, updated: [] };

  const studentsToWrite = diffResult.toWrite;
  const chunks = chunkArray(studentsToWrite, BATCH_LIMIT);

  let written = 0;

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    for (const student of chunk) {
      const safeId = String(student.regNo || student.registration).trim().replace(/[/\\]/g, '_');
      const globalRef = doc(db, 'students', safeId);
      batch.set(globalRef, student, { merge: true });
    }

    await batch.commit();
    written += chunk.length;
  }

  return {
    totalWritten: written,
    totalSkipped: validStudents.length - written,
    diff: diffResult
  };
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
