/**
 * diffStudents.js
 * -----------------------------------------------------------------------
 * PURE LOGIC FILE - compares existing Firestore students with newly fetched
 * Google Sheet students to produce a diff of:
 *   - added
 *   - updated
 *   - unchanged
 *   - removed
 *   - toWrite (added + updated)
 * -----------------------------------------------------------------------
 */

const IGNORED_FIELDS = ['lastSyncedAt', 'updatedAt'];

export function fingerprint(student) {
  if (!student) return '';
  const clean = {};
  Object.keys(student)
    .filter((key) => !IGNORED_FIELDS.includes(key))
    .sort()
    .forEach((key) => {
      clean[key] = student[key];
    });
  return JSON.stringify(clean);
}

export function toRegNoMap(students) {
  const map = new Map();
  for (const s of students || []) {
    const key = String(s.regNo || s.registration || '').trim();
    if (key) map.set(key, s);
  }
  return map;
}

export function diffStudents(existingStudents, newStudents) {
  const existingMap = toRegNoMap(existingStudents);
  const newMap = toRegNoMap(newStudents);

  const added = [];
  const updated = [];
  const unchanged = [];

  for (const [regNo, newStudent] of newMap.entries()) {
    const oldStudent = existingMap.get(regNo);

    if (!oldStudent) {
      added.push(newStudent);
      continue;
    }

    if (fingerprint(oldStudent) === fingerprint(newStudent)) {
      unchanged.push(newStudent);
    } else {
      updated.push(newStudent);
    }
  }

  const removed = [];
  for (const [regNo, oldStudent] of existingMap.entries()) {
    if (!newMap.has(regNo)) removed.push(oldStudent);
  }

  return {
    added,
    updated,
    unchanged,
    removed,
    toWrite: [...added, ...updated],
  };
}
