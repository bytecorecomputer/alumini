import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where,
} from 'firebase/firestore';
import diplomaData from '../Diploma.json';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Normalizes a roll/certificate identifier while preserving original characters when needed.
 */
export function normalizeIdentifier(val) {
    return String(val || '').trim();
}

/**
 * Generates an unguessable 24-character verification token.
 */
export function generateVerificationToken() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(12);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    }
    return (
        Math.random().toString(36).substring(2, 14) +
        Math.random().toString(36).substring(2, 14)
    );
}

/**
 * Returns today's date in YYYY-MM-DD local format.
 */
export function getTodayISODate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Formats any supported date input (Firestore Timestamp, Date, epoch ms, YYYY-MM-DD, DD/MM/YYYY)
 * into a crisp display string like "25 Nov 2026". Returns empty string if unparseable.
 */
export function formatVerificationDate(value) {
    if (!value) return '';

    // Firestore Timestamp
    if (typeof value?.toDate === 'function') {
        const d = value.toDate();
        if (!isNaN(d.getTime())) {
            return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        }
    }

    // Serialized Firestore Timestamp { seconds, nanoseconds }
    if (typeof value === 'object' && typeof value.seconds === 'number') {
        const d = new Date(value.seconds * 1000);
        if (!isNaN(d.getTime())) {
            return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        }
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
        return `${String(value.getDate()).padStart(2, '0')} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
    }

    if (typeof value === 'number') {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        }
    }

    const str = String(value).trim();
    if (!str || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'undefined') return '';

    // Year-only like "2025" or "2024-25"
    if (/^\d{4}(-\d{2,4})?$/.test(str)) return str;

    // ISO YYYY-MM-DD
    const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) {
        const monthIdx = Number(iso[2]) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
            return `${iso[3].padStart(2, '0')} ${MONTHS[monthIdx]} ${iso[1]}`;
        }
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmy) {
        const day = Number(dmy[1]);
        const month = Number(dmy[2]);
        if (month >= 1 && month <= 12) {
            return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${dmy[3]}`;
        }
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return `${String(parsed.getDate()).padStart(2, '0')} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
    }

    return str;
}

export function getTodayDisplayDate() {
    return formatVerificationDate(new Date());
}

/**
 * Builds the public verification URL encoded into QR codes.
 */
export function buildVerifyUrl(
    identifier,
    verificationToken,
    origin = typeof window !== 'undefined' ? window.location.origin : 'https://bytecores.in'
) {
    const cleanId = normalizeIdentifier(identifier);
    const base = `${origin}/verify/${encodeURIComponent(cleanId)}`;
    return verificationToken ? `${base}?t=${encodeURIComponent(verificationToken)}` : base;
}

/**
 * Looks up a legacy certificate in Diploma.json by roll number (case-insensitive).
 */
export function findInDiplomaArchive(identifier) {
    const clean = normalizeIdentifier(identifier);
    if (!clean) return null;
    const upper = clean.toUpperCase();
    return (
        (diplomaData?.certificates || []).find(
            (c) => String(c.roll || '').trim().toUpperCase() === upper
        ) || null
    );
}

/**
 * Searches Firestore `certificates` collection by roll, rollNormalized, marksheetNumber,
 * certificateNumber, or document ID using parallel queries for low latency.
 * When multiple records exist for the same roll (e.g. legacy duplicates), prefers
 * the record matching `preferredToken` (if provided) and richest metadata/file URL.
 */
export async function findCertificateDoc(db, identifier, preferredToken = '') {
    const raw = normalizeIdentifier(identifier);
    if (!raw) return null;

    const upper = raw.toUpperCase();
    const candidates = [...new Set([raw, upper, raw.toLowerCase()])];
    const certsCol = collection(db, 'certificates');

    const queries = [];
    for (const val of candidates) {
        queries.push(getDocs(query(certsCol, where('roll', '==', val), limit(10))));
        queries.push(getDocs(query(certsCol, where('marksheetNumber', '==', val), limit(10))));
        queries.push(getDocs(query(certsCol, where('certificateNumber', '==', val), limit(10))));
    }
    queries.push(getDocs(query(certsCol, where('rollNormalized', '==', upper), limit(10))));

    if (!raw.includes('/')) {
        queries.push(
            getDoc(doc(db, 'certificates', raw)).then((snap) => ({ docs: snap.exists() ? [snap] : [] }))
        );
        if (upper !== raw) {
            queries.push(
                getDoc(doc(db, 'certificates', upper)).then((snap) => ({ docs: snap.exists() ? [snap] : [] }))
            );
        }
    }

    const results = await Promise.all(queries.map((p) => p.catch(() => ({ docs: [] }))));

    const byId = new Map();
    for (const res of results) {
        if (!res?.docs) continue;
        for (const snap of res.docs) {
            if (!byId.has(snap.id)) {
                byId.set(snap.id, { id: snap.id, ref: snap.ref, data: snap.data() });
            }
        }
    }

    const matches = Array.from(byId.values());
    if (matches.length === 0) return null;

    const scoreDoc = (entry) => {
        const d = entry.data || {};
        let score = 0;
        if (preferredToken && d.verificationToken === preferredToken) score += 100;
        if (d.link || d.pdfUrl) score += 20;
        if (d.verificationToken) score += 10;
        if (d.studentName) score += 5;
        if (d.courseName) score += 3;
        return score;
    };

    matches.sort((a, b) => scoreDoc(b) - scoreDoc(a));
    return matches[0];
}

/**
 * Searches Firestore `students` collection (requires admin or student auth).
 */
export async function findStudentDoc(db, identifier) {
    const raw = normalizeIdentifier(identifier);
    if (!raw) return null;

    const upper = raw.toUpperCase();
    const candidates = [...new Set([raw, upper, raw.toLowerCase()])];
    const studentsCol = collection(db, 'students');

    const queries = [];
    for (const val of candidates) {
        if (!val.includes('/')) {
            queries.push(
                getDoc(doc(db, 'students', val)).then((snap) => ({ docs: snap.exists() ? [snap] : [] }))
            );
        }
        queries.push(getDocs(query(studentsCol, where('registration', '==', val), limit(1))));
        queries.push(getDocs(query(studentsCol, where('regNo', '==', val), limit(1))));
    }

    const results = await Promise.all(queries.map((p) => p.catch(() => ({ docs: [] }))));

    for (const res of results) {
        if (res?.docs && res.docs.length > 0) {
            const snap = res.docs[0];
            return { id: snap.id, ref: snap.ref, data: snap.data() };
        }
    }
    return null;
}

/**
 * Normalizes certificate/student/archive payloads into a unified display shape
 * without ever rendering "undefined" or blank broken labels.
 */
export function normalizeCertificateRecord(raw = {}, fallbackId = '') {
    const roll = normalizeIdentifier(
        raw.roll || raw.marksheetNumber || raw.registration || raw.regNo || fallbackId
    );
    const certificateNumber = normalizeIdentifier(raw.certificateNumber || '');
    const marksheetNumber = normalizeIdentifier(raw.marksheetNumber || '');
    const studentName = normalizeIdentifier(raw.studentName || raw.fullName || raw.name || '');
    const fatherName = normalizeIdentifier(raw.fatherName || raw.father || '');
    const motherName = normalizeIdentifier(raw.motherName || '');
    const courseName = normalizeIdentifier(raw.courseName || raw.course || raw.trade || '');
    const studentPhotoUrl = raw.studentPhotoUrl || raw.studentPhoto || raw.photoUrl || null;
    const fileUrl = raw.link || raw.pdfUrl || raw.certificate?.url || '';
    const grade = normalizeIdentifier(raw.grade || '');
    const division = normalizeIdentifier(raw.division || '');

    const rawIssueDate =
        raw.issueDate ||
        raw.uploadedDate ||
        raw.issueDateISO ||
        raw.uploadedAt ||
        raw.updatedAt ||
        raw.createdAt ||
        raw.admissionDate ||
        '';
    const issueDate = formatVerificationDate(rawIssueDate);
    const uploadedDate = formatVerificationDate(
        raw.uploadedDate || raw.uploadedAt || raw.updatedAt || raw.createdAt || raw.issueDate || ''
    );

    const isPdf = Boolean(fileUrl && /\.pdf(\?|$)/i.test(fileUrl));

    return {
        ...raw,
        roll,
        certificateNumber: certificateNumber || roll,
        marksheetNumber: marksheetNumber || roll,
        studentName,
        fatherName,
        motherName,
        courseName,
        studentPhotoUrl,
        fileUrl,
        isPdf,
        grade: grade && grade !== 'N/A' ? grade : '',
        division: division && division !== 'N/A' ? division : '',
        issueDate,
        uploadedDate,
        percentage: typeof raw.percentage === 'number' ? raw.percentage : null,
        isStudentOnly: Boolean(raw.isStudentOnly),
        isPendingUpload: raw.status === 'registered' && !fileUrl,
    };
}
