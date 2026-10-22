// Student login: Roll/Registration OR Mobile (either works). Identity + fees come straight from the Google Sheets,
// the student's Firestore document is refreshed if the sheet row changed, then a Firebase custom token is issued
// (so AuthContext / StudentPortal keep working exactly as before).
import { loadStudents, findStudents } from '../lib/sheet.js';
import { ready, getAuthAdmin, pushOne } from '../lib/firebaseAdmin.js';
import { ipOf, limiter } from '../lib/auth.js';

const limited = limiter(20);
const mask = n => String(n).split(/\s+/).map(w => w.slice(0, 2) + '•••').join(' '); // never reveal other students' names on a roll clash
const last10 = v => String(v || '').replace(/\D/g, '').slice(-10);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    if (limited(ipOf(req))) return res.status(429).json({ error: 'Too many attempts. Please try again in a few minutes.' });
    const { registration, mobile, id, q } = req.body || {};
    const roll = String(registration || q || '').trim(), mob = last10(mobile);
    if (!roll && !mob) return res.status(400).json({ error: 'Enter your Roll No. or Mobile Number.' });
    if (!ready()) return res.status(500).json({ error: 'Firebase Admin not configured on the server.' });

    const list = await loadStudents();
    let m = findStudents(list, roll || mob);
    if (roll && mob) m = m.filter(s => !s.mobiles.length || s.mobiles.includes(mob)); // both given: they must agree
    if (id) m = m.filter(s => s.id === id);
    if (!m.length) return res.status(401).json({ error: 'No student found. Check your Roll No. or Mobile Number.' });
    if (m.length > 1) return res.status(200).json({ choices: m.map(s => ({ id: s.id, name: mask(s.name), course: s.course, centre: s.centre })) });

    const st = m[0], studentData = await pushOne(st);
    const token = await getAuthAdmin().createCustomToken(st.docId, { role: 'student', course: studentData.course });
    return res.status(200).json({ success: true, token, studentData: { ...studentData, id: st.docId, registration: st.docId } });
  } catch (e) {
    console.error('Error during student login:', e);
    return res.status(500).json({ error: 'Login is temporarily unavailable. Please try again.' });
  }
}
