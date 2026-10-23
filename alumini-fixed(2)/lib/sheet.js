import { createHash } from 'node:crypto';
// Google Sheet (published CSV) -> normalized students. Zero dependencies.
// Understands both layouts in use today:
//  A) Nariyawal: Registration | Student Name | ... | Total Fee | "600 (03-06-2024)" cells
//  B) Thiriya:   Roll No. | S - Name | ... | Total Fees | per-month [Red. No. | Date | Amt.] groups
export const SHEETS = [
  { centre: 'Nariyawal', url: process.env.SHEET_NARIYAWAL_LIVE || process.env.SHEET_NARIYAWAL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSR3LLRHq4DsbOplvZ0JPfEOXjrR-wGfOUqpSUnunRD6PGiCCAX9VVcC-80-d8GEoTqQF--fX4bDjbh/pub?gid=0&single=true&output=csv' },
  { centre: 'Thiriya', url: process.env.SHEET_THIRIYA_LIVE || process.env.SHEET_THIRIYA || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRE02PgxnsZb22qYQRIqe3CQZIoCNlPmJ8975fmmrT2KIn40KPYO2PhBrEuNKgEu6ebCr-r0-yFMqzd/pub?gid=967039806&single=true&output=csv' },
];

export function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.map(r => r.map(x => x.trim()));
}

const num = s => parseInt(String(s || '').replace(/[^\d]/g, ''), 10) || 0;
export function isoDate(s) {
  const m = String(s || '').match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (!m) return '';
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  if (y < 2015 || y > 2035) return ''; // typo like 3025
  return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}
// "600 (03-06-2024)", "100(20-06-2024)", "500+500"; brackets optional because "800 (04-04-2025" is common
function paymentsFromText(cell) {
  const out = []; const re = /(\d[\d,]*)\s*\(?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\)?/g; let m, any = false;
  while ((m = re.exec(cell))) { any = true; out.push({ amount: num(m[1]), date: isoDate(m[2]), receipt: '' }); }
  if (!any) for (const p of cell.split('+')) if (num(p) && num(p) <= 30000) out.push({ amount: num(p), date: '', receipt: '' });
  return out.filter(p => p.amount > 0);
}
// Any Indian mobile in a cell: handles "+91 98765-43210", "09876543210" and two numbers in one cell.
const MOB = /(?:\+?91|0)?([6-9]\d{9})/g;
const mobilesOf = cell => [...String(cell || '').replace(/[\s\-().]/g, '').matchAll(MOB)].map(m => m[1]);
// Sheet status text -> pass | paid | cancel | unpaid  ("unPaid" must NOT count as paid)
const normStatus = v => { const t = String(v || '').toLowerCase(); return /pass|paas|complete/.test(t) ? 'pass' : /cancel/.test(t) ? 'cancel' : /\bpaid\b/.test(t) ? 'paid' : 'unpaid'; };
const find = (h, re) => h.findIndex(x => re.test(x));
const ROLL = /^(registration|roll)(\s*no\.?)?$/;

export function parseSheet(csv, centre) {
  const rows = parseCsv(csv), warnings = [];
  const hi = rows.findIndex(r => r.some(c => ROLL.test(c.toLowerCase())));
  if (hi < 0) return { students: [], warnings: [`${centre}: header row not found`] };
  const h = rows[hi].map(x => x.toLowerCase());
  const sub = (rows[hi + 1] || []).map(x => x.toLowerCase());
  const grouped = sub.some(x => /^amt/.test(x));
  const c = {
    roll: find(h, ROLL), name: find(h, /^(student name|s\s*-\s*name|name)/), father: find(h, /father|^f\s*-\s*name/),
    mobile: find(h, /mob|phone|contact|whats|^mo\b|cell|number/), course: find(h, /^(course|trade)/), total: find(h, /^total/),
    reg: find(h, /^regi.*fee/), adm: find(h, /adm.*date|^adm/), addr: find(h, /^address/), status: find(h, /^status/),
  };
  const amtCols = grouped ? sub.map((x, i) => (/^amt/.test(x) ? i : -1)).filter(i => i >= 0) : [];
  const dataRows = rows.slice(hi + (grouped ? 2 : 1));
  let by = c.mobile >= 0 ? 'header' : null;
  if (c.mobile < 0) { // no recognisable header: find the column whose cells look like mobile numbers
    const limit = grouped ? Math.min(...amtCols) - 2 : c.total; let bestN = 2;
    for (let j = 0; j < limit; j++) {
      let n = 0, tot = 0; for (const r of dataRows) if (r[j]) { tot++; if (mobilesOf(r[j]).length) n++; }
      if (n > bestN && n >= tot * 0.4) { c.mobile = j; bestN = n; by = 'content'; }
    }
  }
  const students = [];
  for (const r of dataRows) {
    const rollRaw = r[c.roll] || '', name = r[c.name] || '';
    if (!rollRaw || !name) continue;
    let payments = [];
    if (grouped) {
      for (const j of amtCols) {
        const amount = String(r[j] || '').split('+').reduce((a, p) => a + num(p), 0);
        if (amount > 0) payments.push({ amount, date: isoDate(r[j - 1]), receipt: r[j - 2] || '' });
      }
    } else {
      for (let j = c.total + 1; j < r.length; j++) {
        if (!r[j]) continue;
        const p = paymentsFromText(r[j]);
        if (!p.length && /\d/.test(r[j])) warnings.push(`${centre} ${rollRaw}: could not read "${r[j]}"`);
        payments.push(...p);
      }
    }
    const rolls = rollRaw.split(/[+,/&]/).map(s => s.trim()).filter(Boolean);
    const total = num(r[c.total]), paid = payments.reduce((a, p) => a + p.amount, 0);
    const mobiles = mobilesOf(r[c.mobile]), status = normStatus(r[c.status]);
    let id = `${centre}:${rolls[0]}`;
    for (let k = 2; students.some(x => x.id === id); k++) { id = `${centre}:${rolls[0]}#${k}`; warnings.push(`${centre}: duplicate roll ${rolls[0]}`); }
    students.push({
      id, centre, rolls, name, course: r[c.course] || '',
      father: r[c.father] || '', address: r[c.addr] || '', mobile: mobiles[0] || '', mobiles,
      admission: isoDate(r[c.adm]), regFee: c.reg >= 0 ? num(r[c.reg]) : 0, status,
      total, paid, due: status === 'cancel' ? 0 : Math.max(0, total - paid), payments, // cancelled admissions owe nothing
    });
  }
  const meta = { students: students.length, withMobile: students.filter(x => x.mobile).length, mobileColumn: c.mobile >= 0 ? (rows[hi][c.mobile] || '(no header)') : null, foundBy: by };
  return { students, warnings, meta };
}

// Speed: one parse per sheet-refresh, shared by every request on the instance.
// Fresh <60s: served from memory. Older: served instantly while refreshing behind the scenes.
// Older than 5 min (or cold start): wait for a refresh. Sheet down: keep serving the last good copy.
// Content hashes, not counters, so every serverless instance agrees on "has anything changed?".
const sha = x => createHash('sha1').update(x).digest('base64url').slice(0, 10);
const TTL = 15_000, MAX_STALE = 300_000;
let cache = { at: 0, data: null, p: null, sheets: {} };
function refresh() {
  return cache.p ||= (async () => { // single-flight: 100 simultaneous requests share ONE fetch
    try {
      const parts = await Promise.all(SHEETS.map(async s => {
        const r = await fetch(s.url, { signal: AbortSignal.timeout(10000) });
        if (!r.ok) throw new Error(`${s.centre} sheet HTTP ${r.status}`);
        const text = await r.text(), h = sha(text), prev = cache.sheets[s.centre];
        if (prev && prev.h === h) return prev.students; // sheet text identical: skip parse + hashing entirely
        const parsed = parseSheet(text, s.centre), students = parsed.students;
        for (const st of students) st.h = sha(JSON.stringify([st.name, st.course, st.mobile, st.total, st.regFee, st.status, st.payments, 'v2'])); // per-row fingerprint
        cache.sheets[s.centre] = { h, students, meta: parsed.meta };
        return students;
      }));
      const list = parts.flat(); list.hash = sha(list.map(x => x.id + x.h).join('|'));
      list.byRoll = new Map(); list.byMobile = new Map(); list.byId = new Map();
      for (const st of list) {
        list.byId.set(st.id, st);
        for (const r of st.rolls) { const k = r.toLowerCase().replace(/\s+/g, ''); (list.byRoll.get(k) || list.byRoll.set(k, []).get(k)).push(st); }
        for (const m of st.mobiles) (list.byMobile.get(m) || list.byMobile.set(m, []).get(m)).push(st);
      }
      const seen = new Set(); // Firestore doc id: plain roll; a clash across centres gets the centre appended
      for (const st of list) {
        const base = String(st.rolls[0]).replace(/\//g, '-'); let d = base;
        if (seen.has(d)) { d = `${base}_${st.centre}`; for (let k = 2; seen.has(d); k++) d = `${base}_${st.centre}_${k}`; }
        seen.add(d); st.docId = d;
      }
      cache.data = list; cache.at = Date.now();
    } finally { cache.p = null; }
  })();
}
export const sheetInfo = () => Object.fromEntries(Object.entries(cache.sheets).map(([k, v]) => [k, v.meta]));
export const forceRefresh = () => { cache.at = 0; return refresh().then(() => cache.data); };
// Fresh <15s: memory. 15s-5min: answer instantly, refresh behind. Older/cold: wait. Sheet down: last good copy.
export async function loadStudents() {
  const age = Date.now() - cache.at;
  if (cache.data && age < MAX_STALE) { if (age > TTL) refresh().catch(() => {}); return cache.data; }
  try { await refresh(); } catch (e) { if (!cache.data) throw e; }
  return cache.data;
}

export function findStudents(list, q) {
  const raw = String(q || '').trim(), digits = raw.replace(/\D/g, '');
  if (digits.length >= 10 && /^[\d\s+\-()]+$/.test(raw)) return list.byMobile.get(digits.slice(-10)) || [];
  return list.byRoll.get(raw.toLowerCase().replace(/\s+/g, '')) || [];
}

// Only what a student needs: no mobile, address or father's name leaves the server.
export const publicView = s => ({
  id: s.id, h: s.h, name: s.name, course: s.course, centre: s.centre, roll: s.rolls.join(' + '),
  admission: s.admission, total: s.total, regFee: s.regFee, paid: s.paid, due: s.due, payments: s.payments,
});

// Shape the existing app already reads from Firestore students/{registration} (same fields the old sheet sync wrote).
export function toDoc(st) {
  const fallback = st.admission || '';
  const installments = st.payments.map(p => ({ amount: p.amount, date: p.date || fallback, dateDisplay: p.date || fallback, receipt: p.receipt || '', status: 'paid' }))
    .sort((a, b) => a.date.localeCompare(b.date)).map((p, i) => ({ ...p, installmentNo: i + 1 }));
  const paid = Math.min(st.paid, st.total);
  return {
    registration: st.docId, regNo: st.docId, fullName: st.name, name: st.name,
    status: st.status || 'unpaid',
    course: st.course || 'N/A', trade: st.course || 'N/A', fatherName: st.father, mobile: st.mobile, mob: st.mobile, mobiles: st.mobiles, address: st.address, center: st.centre,
    admissionDate: st.admission, admissionFee: st.regFee, registrationFee: st.regFee, totalFees: st.total, totalFee: st.total,
    installments, paidFees: paid, totalPaid: paid, balanceDue: st.due, sheetHash: st.h, updatedAt: Date.now(),
  };
}
