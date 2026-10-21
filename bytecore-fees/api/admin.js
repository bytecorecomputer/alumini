import { loadStudents } from '../lib/sheet.js';
import { issue, verify, same, ipOf, limiter, configured } from '../lib/auth.js';
const limited = limiter(8);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured() || !process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'Set SESSION_SECRET and ADMIN_PASSWORD.' });
  if (req.method === 'POST') {
    if (limited(ipOf(req))) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    return same(req.body?.password || '', process.env.ADMIN_PASSWORD) ? res.status(200).json({ token: issue('admin', 1) }) : res.status(401).json({ error: 'Wrong password.' });
  }
  if (verify(req) !== 'admin') return res.status(401).json({ error: 'Please log in.' });
  try {
    const list = await loadStudents();
    return res.status(200).json({ students: list.map(s => ({
      id: s.id, centre: s.centre, roll: s.rolls.join(' + '), name: s.name, course: s.course, father: s.father, mobile: s.mobile,
      total: s.total, paid: s.paid, due: s.due, regFee: s.regFee, last: s.payments.map(p => p.date).sort().pop() || '' })) });
  } catch (e) { console.error(e); return res.status(502).json({ error: 'Fee sheet is unavailable right now.' }); }
}
