// Fast admin fee table, read straight from the sheets (no Firestore reads). Uses the admin's EXISTING Firebase login.
//  GET  /api/fees-admin?h=<hash>  -> {same:true} if nothing changed, else full list   | POST -> sync changed students to Firestore now
import { loadStudents, forceRefresh, sheetInfo } from '../lib/sheet.js';
import { ready, getDb, getAuthAdmin, pushChanged } from '../lib/firebaseAdmin.js';

const okTokens = new Map();
async function isAdmin(req) {
  const t = String(req.headers.authorization || '').replace('Bearer ', ''); if (!t || !ready()) return false;
  if ((okTokens.get(t) || 0) > Date.now()) return true;
  try {
    const d = await getAuthAdmin().verifyIdToken(t); let ok = d.admin === true;
    if (!ok) { const s = await getDb().doc(`users/${d.uid}`).get(); ok = s.exists && ['admin', 'super_admin'].includes(s.get('role')); }
    if (ok) { if (okTokens.size > 200) okTokens.clear(); okTokens.set(t, Date.now() + 300_000); }
    return ok;
  } catch { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!(await isAdmin(req))) return res.status(401).json({ error: 'Admin login required.' });
  try {
    if (req.method === 'POST') { const list = await forceRefresh(); return res.status(200).json({ ok: true, written: await pushChanged(list, false), sheets: sheetInfo() }); }
    const list = await loadStudents();
    if (req.query?.h === list.hash) return res.status(200).json({ same: true });
    return res.status(200).json({ hash: list.hash, students: list.map(s => ({
      id: s.id, h: s.h, centre: s.centre, roll: s.rolls.join(' + '), name: s.name, course: s.course, mobile: s.mobile, status: s.status,
      total: s.total, paid: s.paid, due: s.due, last: s.payments.map(p => p.date).sort().pop() || '' })) });
  } catch (e) { console.error(e); return res.status(502).json({ error: 'Fee sheet is unavailable right now.' }); }
}
