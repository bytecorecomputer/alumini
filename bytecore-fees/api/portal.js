import { loadStudents, findStudents, publicView } from '../lib/sheet.js';
import { issue, verify, ipOf, limiter, configured } from '../lib/auth.js';
const limited = limiter(20);
const mask = n => String(n).split(/\s+/).map(w => w.slice(0, 2) + '•••').join(' '); // roll clash across centres must not reveal other students' names

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(500).json({ error: 'Server not configured: set SESSION_SECRET.' });
  try {
    const list = await loadStudents();
    if (req.method === 'GET') {
      const id = verify(req), s = id && list.byId.get(id);
      if (s && req.query?.h === s.h) return res.status(200).json({ same: true }); // nothing changed: ~15 bytes
      return s ? res.status(200).json({ student: publicView(s) }) : res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (limited(ipOf(req))) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
    const { q, id } = req.body || {};
    let m = findStudents(list, q);
    if (id) m = m.filter(s => s.id === id);
    if (!m.length) return res.status(404).json({ error: 'No student found. Check the roll number or mobile number.' });
    if (m.length > 1) return res.status(200).json({ choices: m.map(s => ({ id: s.id, name: mask(s.name), course: s.course, centre: s.centre })) });
    return res.status(200).json({ token: issue(m[0].id), student: publicView(m[0]) });
  } catch (e) { console.error(e); return res.status(502).json({ error: 'Fee sheet is unavailable right now. Please try again shortly.' }); }
}
