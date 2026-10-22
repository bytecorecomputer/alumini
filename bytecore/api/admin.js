// Admin login = your existing Firebase email/password. Verified over Firebase's REST API:
// no firebase-admin, no service-account key. Role comes from Firestore users/{uid}.role.
import { loadStudents } from '../lib/sheet.js';
import { issue, verify, ipOf, limiter, configured } from '../lib/auth.js';
const limited = limiter(8);
const KEY = () => process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAFnFqw6iD1YhQ5xwhSnd2rIKUJeR17wkU';
const PID = () => process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'practice-be58e';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(500).json({ error: 'Server not configured: set SESSION_SECRET.' });
  if (req.method === 'POST') {
    if (limited(ipOf(req))) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Enter email and password.' });
    try {
      const a = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
      if (!a.ok) return res.status(401).json({ error: 'Wrong email or password.' });
      const { idToken, localId } = await a.json();
      const d = await fetch(`https://firestore.googleapis.com/v1/projects/${PID()}/databases/(default)/documents/users/${localId}`, { headers: { Authorization: `Bearer ${idToken}` } });
      const role = d.ok ? (await d.json()).fields?.role?.stringValue : null;
      if (!['admin', 'super_admin'].includes(role)) return res.status(403).json({ error: 'This account is not an admin.' });
      return res.status(200).json({ token: issue('admin', 1) });
    } catch (e) { console.error(e); return res.status(502).json({ error: 'Could not reach login service. Try again.' }); }
  }
  if (verify(req) !== 'admin') return res.status(401).json({ error: 'Please log in.' });
  try {
    const list = await loadStudents();
    if (req.query?.h === list.hash) return res.status(200).json({ same: true });
    return res.status(200).json({ hash: list.hash, students: list.map(s => ({
      id: s.id, h: s.h, centre: s.centre, roll: s.rolls.join(' + '), name: s.name, course: s.course, mobile: s.mobile,
      total: s.total, paid: s.paid, due: s.due, last: s.payments.map(p => p.date).sort().pop() || '' })) });
  } catch (e) { console.error(e); return res.status(502).json({ error: 'Fee sheet is unavailable right now.' }); }
}
