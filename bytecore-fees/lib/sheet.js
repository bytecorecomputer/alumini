// Google Sheet (published CSV) -> normalized students. Zero dependencies.
// Understands both layouts in use today:
//  A) Nariyawal: Registration | Student Name | ... | Total Fee | "600 (03-06-2024)" cells
//  B) Thiriya:   Roll No. | S - Name | ... | Total Fees | per-month [Red. No. | Date | Amt.] groups
export const SHEETS = [
  { centre: 'Nariyawal', url: process.env.SHEET_NARIYAWAL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSR3LLRHq4DsbOplvZ0JPfEOXjrR-wGfOUqpSUnunRD6PGiCCAX9VVcC-80-d8GEoTqQF--fX4bDjbh/pub?gid=0&single=true&output=csv' },
  { centre: 'Thiriya', url: process.env.SHEET_THIRIYA || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRE02PgxnsZb22qYQRIqe3CQZIoCNlPmJ8975fmmrT2KIn40KPYO2PhBrEuNKgEu6ebCr-r0-yFMqzd/pub?gid=967039806&single=true&output=csv' },
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
    mobile: find(h, /mob|phone/), course: find(h, /^(course|trade)/), total: find(h, /^total/),
    reg: find(h, /^regi.*fee/), adm: find(h, /adm.*date|^adm/), addr: find(h, /^address/), status: find(h, /^status/),
  };
  const amtCols = grouped ? sub.map((x, i) => (/^amt/.test(x) ? i : -1)).filter(i => i >= 0) : [];
  const students = [];
  for (const r of rows.slice(hi + (grouped ? 2 : 1))) {
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
    let id = `${centre}:${rolls[0]}`;
    for (let k = 2; students.some(x => x.id === id); k++) { id = `${centre}:${rolls[0]}#${k}`; warnings.push(`${centre}: duplicate roll ${rolls[0]}`); }
    students.push({
      id, centre, rolls, name, course: r[c.course] || '',
      father: r[c.father] || '', mobile: (r[c.mobile] || '').replace(/\D/g, '').slice(-10),
      admission: isoDate(r[c.adm]), regFee: c.reg >= 0 ? num(r[c.reg]) : 0, status: r[c.status] || '',
      total, paid, due: Math.max(0, total - paid), payments,
    });
  }
  return { students, warnings };
}

// Speed: one parse per sheet-refresh, shared by every request on the instance.
// Fresh <60s: served from memory. Older: served instantly while refreshing behind the scenes.
// Older than 5 min (or cold start): wait for a refresh. Sheet down: keep serving the last good copy.
let cache = { at: 0, data: null, p: null };
function refresh() {
  return cache.p ||= (async () => {
    try {
      const parts = await Promise.all(SHEETS.map(async s => {
        const r = await fetch(s.url, { signal: AbortSignal.timeout(8000) });
        if (!r.ok) throw new Error(`${s.centre} sheet HTTP ${r.status}`);
        return parseSheet(await r.text(), s.centre).students;
      }));
      const list = parts.flat(); list.byRoll = new Map(); list.byMobile = new Map();
      for (const st of list) {
        for (const r of st.rolls) { const k = r.toLowerCase().replace(/\s+/g, ''); (list.byRoll.get(k) || list.byRoll.set(k, []).get(k)).push(st); }
        if (st.mobile) (list.byMobile.get(st.mobile) || list.byMobile.set(st.mobile, []).get(st.mobile)).push(st);
      }
      cache.data = list; cache.at = Date.now();
    } finally { cache.p = null; }
  })();
}
export async function loadStudents() {
  const age = Date.now() - cache.at;
  if (cache.data && age < 300_000) { if (age > 60_000) refresh().catch(() => {}); return cache.data; }
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
  id: s.id, name: s.name, course: s.course, centre: s.centre, roll: s.rolls.join(' + '),
  admission: s.admission, total: s.total, regFee: s.regFee, paid: s.paid, due: s.due, payments: s.payments,
});
