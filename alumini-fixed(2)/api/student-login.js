// Student login (production). Firebase/Firestore is the primary store; the Google Sheet keeps it fresh.
//  - Roll/Registration OR Mobile (either works). Both given -> they must agree.
//  - Firestore lookup + sheet lookup run together; if the sheet is slow/down, Firestore alone is enough.
//  - NEVER crashes: every failure is JSON {error, code}. Modules are imported inside try so a missing file is reported, not a blank 500.
const last10 = v => String(v || '').replace(/\D/g, '').slice(-10);
const mask = n => String(n).split(/\s+/).map(w => w.slice(0, 2) + '•••').join(' '); // never reveal other students' names on a clash
const soft = (p, ms) => Promise.race([Promise.resolve(p).catch(() => null), new Promise(r => setTimeout(() => r(null), ms))]);
const fail = (res, status, code, error) => res.status(status).json({ error, code });

async function fsFind(db, roll, mob) {
  const col = db.collection('students'), out = new Map(), jobs = [];
  const add = d => { if (d.exists) out.set(d.id, d.data()); };
  if (roll) {
    const keys = [...new Set([roll, roll.toUpperCase(), roll.replace(/\s+/g, '')])].filter(k => k && !k.includes('/') && k.length < 100);
    jobs.push(Promise.all(keys.map(k => col.doc(k).get())).then(r => r.forEach(add)));
    jobs.push(col.where('registration', '==', roll).limit(5).get().then(s => s.forEach(add)));
  }
  if (mob) for (const [f, op] of [['mobiles', 'array-contains'], ['mobile', '=='], ['mob', '==']]) jobs.push(col.where(f, op, mob).limit(10).get().then(s => s.forEach(add)));
  await Promise.all(jobs.map(j => j.catch(e => console.error('[student-login] firestore query failed:', e.message))));
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return fail(res, 405, 'METHOD', 'Method Not Allowed');
  let step = 'import';
  try {
    const [S, F, A] = await Promise.all([import('../lib/sheet.js'), import('../lib/firebaseAdmin.js'), import('../lib/auth.js')]);
    step = 'rate'; globalThis.__bcLoginLimit ||= A.limiter(20);
    if (globalThis.__bcLoginLimit(A.ipOf(req))) return fail(res, 429, 'RATE_LIMIT', 'Too many attempts. Please try again in a few minutes.');

    step = 'input';
    const { registration, mobile, id, q } = req.body || {};
    const raw = String(registration || q || '').trim().slice(0, 60), rawDigits = raw.replace(/\D/g, '');
    const rawIsMobile = rawDigits.length >= 10 && /^[\d\s+\-()]+$/.test(raw);
    const mob = last10(mobile) || (rawIsMobile ? rawDigits.slice(-10) : ''), roll = rawIsMobile ? '' : raw;
    if (!roll && !mob) return fail(res, 400, 'EMPTY', 'Enter your Roll No. or Mobile Number.');

    step = 'firebase';
    if (!F.ready()) return fail(res, 500, 'NO_FIREBASE_ADMIN', 'Login service is not configured yet. Please contact the centre.');

    step = 'lookup';
    const [fsDocs, list] = await Promise.all([fsFind(F.getDb(), roll, mob), soft(S.loadStudents(), 2500)]);
    const cands = new Map();
    for (const [docId, data] of fsDocs) cands.set(docId, { docId, data });
    if (list) for (const st of (roll ? S.findStudents(list, roll) : S.findStudents(list, mob))) cands.set(st.docId, { ...(cands.get(st.docId) || {}), docId: st.docId, st });
    let arr = [...cands.values()];
    if (roll && mob) arr = arr.filter(c => { // both entered: they must agree (unless the record has no mobile at all)
      const have = c.st ? c.st.mobiles : [last10(c.data?.mobile || c.data?.mob), ...(c.data?.mobiles || [])].filter(Boolean);
      return !have.length || have.includes(mob);
    });
    if (id) arr = arr.filter(c => c.docId === id);
    if (!arr.length) return fail(res, 401, 'NOT_FOUND', 'No student found. Check your Roll No. or Mobile Number.');
    if (arr.length > 1) return res.status(200).json({ choices: arr.map(c => ({ id: c.docId, name: mask(c.st?.name || c.data?.fullName || c.data?.name || 'Student'), course: c.st?.course || c.data?.course || '', centre: c.st?.centre || c.data?.center || '' })) });

    step = 'profile';
    const c = arr[0]; let studentData = c.data || {};
    if (c.st) { // sheet row is the freshest truth: refresh the Firestore doc (writes only if the row changed)
      try { studentData = await F.pushOne(c.st); } catch (e) { console.error('[student-login] doc refresh failed:', e.message); studentData = { ...studentData, ...S.toDoc(c.st) }; }
    }
    step = 'token';
    const token = await F.getAuthAdmin().createCustomToken(c.docId, { role: 'student', course: studentData.course || '' });
    return res.status(200).json({ success: true, token, studentData: { ...studentData, id: c.docId, registration: c.docId } });
  } catch (e) {
    console.error(`[student-login] failed at step "${step}":`, e);
    return fail(res, 500, 'SERVER_' + step.toUpperCase(), 'Login is temporarily unavailable. Please try again in a minute.');
  }
}
