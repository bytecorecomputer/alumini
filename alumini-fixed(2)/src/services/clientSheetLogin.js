/**
 * clientSheetLogin.js
 * -------------------------------------------------------------
 * Resilient client-side fallback login engine for Bytecore.
 * If /api/student-login is unavailable (e.g. 500 error, 404 on Vite dev,
 * network firewall), the browser directly parses the live Google Sheet
 * and authenticates the student instantly without crashing.
 * -------------------------------------------------------------
 */

import Papa from 'papaparse';

const NARIYAWAL_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSR3LLRHq4DsbOplvZ0JPfEOXjrR-wGfOUqpSUnunRD6PGiCCAX9VVcC-80-d8GEoTqQF--fX4bDjbh/pub?gid=0&single=true&output=csv';
const THIRIYA_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRE02PgxnsZb22qYQRIqe3CQZIoCNlPmJ8975fmmrT2KIn40KPYO2PhBrEuNKgEu6ebCr-r0-yFMqzd/pub?gid=967039806&single=true&output=csv';

const num = s => parseInt(String(s || '').replace(/[^\d]/g, ''), 10) || 0;
const last10 = v => String(v || '').replace(/\D/g, '').slice(-10);

function isoDate(s) {
  const m = String(s || '').match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (!m) return '';
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  if (y < 2015 || y > 2035) return '';
  return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function parsePayments(cell) {
  const out = [];
  const re = /(\d[\d,]*)\s*\(?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\)?/g;
  let m, any = false;
  while ((m = re.exec(cell))) {
    any = true;
    out.push({ amount: num(m[1]), date: isoDate(m[2]), receipt: '' });
  }
  if (!any) {
    for (const p of String(cell || '').split('+')) {
      if (num(p) && num(p) <= 30000) out.push({ amount: num(p), date: '', receipt: '' });
    }
  }
  return out.filter(p => p.amount > 0);
}

const MOB = /(?:\+?91|0)?([6-9]\d{9})/g;
const extractMobiles = cell => [...String(cell || '').replace(/[\s\-().]/g, '').matchAll(MOB)].map(m => m[1]);

export async function fetchAndParseSheet(url, centreName) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${centreName} sheet HTTP ${res.status}`);
  const text = await res.text();

  const parsed = Papa.parse(text, { header: false, skipEmptyLines: 'greedy' });
  const rows = (parsed.data || []).map(r => r.map(x => String(x || '').trim()));

  const ROLL = /^(registration|roll)(\s*no\.?)?$/i;
  const hi = rows.findIndex(r => r.some(c => ROLL.test(c.toLowerCase())));
  if (hi < 0) return [];

  const h = rows[hi].map(x => x.toLowerCase());
  const findCol = re => h.findIndex(x => re.test(x));

  const cRoll = findCol(ROLL);
  const cName = findCol(/^(student name|s\s*-\s*name|name)/);
  const cFather = findCol(/father|^f\s*-\s*name/);
  let cMob = findCol(/mob|phone|contact|whats|^mo\b|cell|number/);
  const cCourse = findCol(/^(course|trade)/);
  const cTotal = findCol(/^total/);
  const cReg = findCol(/^regi.*fee/);
  const cAdm = findCol(/adm.*date|^adm/);
  const cAddr = findCol(/^address/);
  const cStatus = findCol(/^status/);

  const dataRows = rows.slice(hi + 1);

  if (cMob < 0) {
    const limit = cTotal > 0 ? cTotal : 10;
    for (let j = 0; j < limit; j++) {
      let count = 0;
      for (const r of dataRows) {
        if (extractMobiles(r[j]).length) count++;
      }
      if (count > 2) { cMob = j; break; }
    }
  }

  const students = [];
  for (const r of dataRows) {
    const rollRaw = r[cRoll] || '', name = r[cName] || '';
    if (!rollRaw || !name) continue;

    const payments = [];
    const startCol = cTotal >= 0 ? cTotal + 1 : 10;
    for (let j = startCol; j < r.length; j++) {
      if (r[j]) payments.push(...parsePayments(r[j]));
    }

    const rolls = rollRaw.split(/[+,/&]/).map(s => s.trim()).filter(Boolean);
    const total = cTotal >= 0 ? num(r[cTotal]) : 0;
    const paid = payments.reduce((a, p) => a + p.amount, 0);
    const mobiles = cMob >= 0 ? extractMobiles(r[cMob]) : [];
    const statusText = cStatus >= 0 ? String(r[cStatus] || '').toLowerCase() : '';
    const status = /pass|complete/.test(statusText) ? 'pass' : /cancel/.test(statusText) ? 'cancel' : /\bpaid\b/.test(statusText) ? 'paid' : 'unpaid';

    students.push({
      id: `${centreName}:${rolls[0]}`,
      docId: rolls[0],
      centre: centreName,
      rolls,
      name,
      course: (cCourse >= 0 ? r[cCourse] : '') || '',
      father: (cFather >= 0 ? r[cFather] : '') || '',
      address: (cAddr >= 0 ? r[cAddr] : '') || '',
      mobile: mobiles[0] || '',
      mobiles,
      admission: cAdm >= 0 ? isoDate(r[cAdm]) : '',
      regFee: cReg >= 0 ? num(r[cReg]) : 0,
      status,
      total,
      paid,
      due: status === 'cancel' ? 0 : Math.max(0, total - paid),
      payments
    });
  }
  return students;
}

let cachedStudents = null;
let lastFetchTime = 0;

export async function getClientStudents() {
  if (cachedStudents && (Date.now() - lastFetchTime < 120_000)) {
    return cachedStudents;
  }
  try {
    const [nar, thi] = await Promise.all([
      fetchAndParseSheet(NARIYAWAL_CSV, 'Nariyawal').catch(() => []),
      fetchAndParseSheet(THIRIYA_CSV, 'Thiriya').catch(() => [])
    ]);
    const all = [...nar, ...thi];
    if (all.length > 0) {
      cachedStudents = all;
      lastFetchTime = Date.now();
    }
    return cachedStudents || [];
  } catch (err) {
    console.warn('[clientSheetLogin] Sheet load error:', err);
    return cachedStudents || [];
  }
}

export async function clientLoginLookup(rollInput, mobileInput) {
  const roll = String(rollInput || '').trim().toLowerCase();
  const mob = last10(mobileInput);

  const students = await getClientStudents();
  if (!students.length) {
    throw new Error('Could not load student sheet records. Please check your connection.');
  }

  // Find candidate
  if (roll && mob) {
    const matchedRoll = students.filter(s => s.rolls.some(r => r.toLowerCase().replace(/\s+/g, '') === roll.replace(/\s+/g, '')));
    if (!matchedRoll.length) {
      throw new Error(`Roll Number "${rollInput}" was not found in institute records.`);
    }
    const exact = matchedRoll.find(s => !s.mobiles.length || s.mobiles.some(m => last10(m) === mob));
    if (exact) {
      return { student: formatToDoc(exact) };
    }
    const hint = matchedRoll[0].mobile ? `...${matchedRoll[0].mobile.slice(-4)}` : 'unrecorded';
    throw new Error(`Mobile number does not match Roll No. ${rollInput}. Registered mobile ends in ${hint}.`);
  }

  if (roll) {
    const matched = students.filter(s => s.rolls.some(r => r.toLowerCase().replace(/\s+/g, '') === roll.replace(/\s+/g, '')));
    if (matched.length === 1) return { student: formatToDoc(matched[0]) };
    if (matched.length > 1) return { choices: matched.map(s => ({ id: s.id, name: s.name, course: s.course, centre: s.centre, roll: s.rolls.join('/') })) };
    throw new Error(`Roll Number "${rollInput}" was not found.`);
  }

  if (mob) {
    const matched = students.filter(s => s.mobiles.some(m => last10(m) === mob));
    if (matched.length === 1) return { student: formatToDoc(matched[0]) };
    if (matched.length > 1) return { choices: matched.map(s => ({ id: s.id, name: s.name, course: s.course, centre: s.centre, roll: s.rolls.join('/') })) };
    throw new Error(`Mobile Number "${mobileInput}" was not found.`);
  }

  throw new Error('Please enter Roll Number and Mobile Number.');
}

function formatToDoc(st) {
  const fallback = st.admission || '';
  const installments = (st.payments || []).map(p => ({
    amount: p.amount,
    date: p.date || fallback,
    dateDisplay: p.date || fallback,
    receipt: p.receipt || '',
    status: 'paid'
  })).sort((a, b) => (a.date || '').localeCompare(b.date || '')).map((p, i) => ({ ...p, installmentNo: i + 1 }));

  const paid = Math.min(st.paid || 0, st.total || 0);

  return {
    registration: st.docId,
    regNo: st.docId,
    fullName: st.name,
    name: st.name,
    status: st.status || 'unpaid',
    course: st.course || 'N/A',
    trade: st.course || 'N/A',
    fatherName: st.father || '',
    mobile: st.mobile || '',
    mob: st.mobile || '',
    mobiles: st.mobiles || [],
    address: st.address || '',
    center: st.centre || '',
    admissionDate: st.admission || '',
    admissionFee: st.regFee || 0,
    registrationFee: st.regFee || 0,
    totalFees: st.total || 0,
    totalFee: st.total || 0,
    installments,
    paidFees: paid,
    totalPaid: paid,
    balanceDue: st.due || 0,
    updatedAt: Date.now()
  };
}
