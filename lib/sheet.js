import { createHash } from 'node:crypto';
import fs from 'node:fs';

// Google Sheet (published CSV) -> normalized students. Zero dependencies.
// Understands both layouts in use today:
//  A) Nariyawal: Registration | Student Name | Status | Course | Fathers Name | Mob. No. | Address | Admission Date | Reg Fee | Total Fee | Fee / Date ...
//  B) Thiriya:   Sr. No. | Registration NO. | Student Name | Status | Course | Fathers Name | Mob. No. | Address | Admission Date | Regi. Fee | Total Fee | Fee - Date ...
export const SHEETS = [
  { centre: 'Nariyawal', url: process.env.SHEET_NARIYAWAL_LIVE || process.env.SHEET_NARIYAWAL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSR3LLRHq4DsbOplvZ0JPfEOXjrR-wGfOUqpSUnunRD6PGiCCAX9VVcC-80-d8GEoTqQF--fX4bDjbh/pub?gid=0&single=true&output=csv' },
  { centre: 'Thiriya', url: process.env.SHEET_THIRIYA_LIVE || process.env.SHEET_THIRIYA || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRE02PgxnsZb22qYQRIqe3CQZIoCNlPmJ8975fmmrT2KIn40KPYO2PhBrEuNKgEu6ebCr-r0-yFMqzd/pub?gid=967039806&single=true&output=csv' },
];

const DISK_CACHE_PATH = '/tmp/bytecore_sheet_cache_v2.json';

export function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else q = false;
      } else cell += c;
    } else if (c === '"') {
      q = true;
    } else if (c === ',') {
      row.push(cell); cell = '';
    } else if (c === '\n') {
      row.push(cell); rows.push(row); row = []; cell = '';
    } else if (c !== '\r') {
      cell += c;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.map(r => r.map(x => x.trim()));
}

const num = s => parseInt(String(s || '').replace(/[^\d]/g, ''), 10) || 0;

export function isoDate(s) {
  const m = String(s || '').match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (!m) return '';
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  if (y < 2015 || y > 2035) return '';
  return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

// "600 (03-06-2024)", "100(20-06-2024)", "500+500", "750 (23-01-2026)"
function paymentsFromText(cell) {
  const out = [];
  const re = /(\d[\d,]*)\s*\(?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\)?/g;
  let m, any = false;
  while ((m = re.exec(cell))) {
    any = true;
    out.push({ amount: num(m[1]), date: isoDate(m[2]), receipt: '' });
  }
  if (!any) {
    for (const p of cell.split('+')) {
      if (num(p) && num(p) <= 30000) {
        out.push({ amount: num(p), date: '', receipt: '' });
      }
    }
  }
  return out.filter(p => p.amount > 0);
}

// Any Indian mobile in a cell: handles "+91 98765-43210", "09876543210" and multiple numbers in one cell.
const MOB = /(?:\+?91|0)?([6-9]\d{9})/g;
const mobilesOf = cell => [...String(cell || '').replace(/[\s\-().]/g, '').matchAll(MOB)].map(m => m[1]);

// Sheet status text -> pass | paid | cancel | unpaid
const normStatus = v => {
  const t = String(v || '').toLowerCase();
  return /pass|paas|complete/.test(t) ? 'pass' : /cancel/.test(t) ? 'cancel' : /\bpaid\b/.test(t) ? 'paid' : 'unpaid';
};

const find = (h, re) => h.findIndex(x => re.test(x));
const ROLL = /^(registration|roll)(\s*no\.?)?$/i;

export function parseSheet(csv, centre) {
  const rows = parseCsv(csv), warnings = [];
  const hi = rows.findIndex(r => r.some(c => ROLL.test(c.toLowerCase().trim())));
  if (hi < 0) return { students: [], warnings: [`${centre}: header row not found`] };

  const h = rows[hi].map(x => x.toLowerCase().trim());
  const sub = (rows[hi + 1] || []).map(x => x.toLowerCase().trim());
  const grouped = sub.some(x => /^amt/.test(x));

  const c = {
    roll: find(h, ROLL),
    name: find(h, /^(student name|s\s*-\s*name|name)/),
    father: find(h, /father|^f\s*-\s*name/),
    mobile: find(h, /mob|phone|contact|whats|^mo\b|cell|number/),
    course: find(h, /^(course|trade)/),
    total: find(h, /^total/),
    reg: find(h, /^regi.*fee/),
    adm: find(h, /adm.*date|^adm/),
    addr: find(h, /^address/),
    status: find(h, /^status/),
  };

  const amtCols = grouped ? sub.map((x, i) => (/^amt/.test(x) ? i : -1)).filter(i => i >= 0) : [];
  const dataRows = rows.slice(hi + (grouped ? 2 : 1));
  let by = c.mobile >= 0 ? 'header' : null;

  if (c.mobile < 0) {
    const limit = grouped ? Math.min(...amtCols) - 2 : (c.total > 0 ? c.total : 10);
    let bestN = 2;
    for (let j = 0; j < limit; j++) {
      let n = 0, tot = 0;
      for (const r of dataRows) {
        if (r[j]) {
          tot++;
          if (mobilesOf(r[j]).length) n++;
        }
      }
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
      const startCol = c.total >= 0 ? c.total + 1 : 10;
      for (let j = startCol; j < r.length; j++) {
        if (!r[j]) continue;
        const p = paymentsFromText(r[j]);
        if (!p.length && /\d/.test(r[j])) warnings.push(`${centre} ${rollRaw}: could not read "${r[j]}"`);
        payments.push(...p);
      }
    }

    const rolls = rollRaw.split(/[+,/&]/).map(s => s.trim()).filter(Boolean);
    const total = c.total >= 0 ? num(r[c.total]) : 0;
    const paid = payments.reduce((a, p) => a + p.amount, 0);
    const mobiles = c.mobile >= 0 ? mobilesOf(r[c.mobile]) : [];
    const status = c.status >= 0 ? normStatus(r[c.status]) : 'unpaid';

    let id = `${centre}:${rolls[0]}`;
    for (let k = 2; students.some(x => x.id === id); k++) {
      id = `${centre}:${rolls[0]}#${k}`;
      warnings.push(`${centre}: duplicate roll ${rolls[0]}`);
    }

    students.push({
      id, centre, rolls, name,
      course: (c.course >= 0 ? r[c.course] : '') || '',
      father: (c.father >= 0 ? r[c.father] : '') || '',
      address: (c.addr >= 0 ? r[c.addr] : '') || '',
      mobile: mobiles[0] || '',
      mobiles,
      admission: c.adm >= 0 ? isoDate(r[c.adm]) : '',
      regFee: c.reg >= 0 ? num(r[c.reg]) : 0,
      status,
      total, paid,
      due: status === 'cancel' ? 0 : Math.max(0, total - paid),
      payments,
    });
  }

  const meta = {
    students: students.length,
    withMobile: students.filter(x => x.mobile).length,
    mobileColumn: c.mobile >= 0 ? (rows[hi][c.mobile] || '(no header)') : null,
    foundBy: by
  };

  return { students, warnings, meta };
}

const sha = x => createHash('sha1').update(x).digest('base64url').slice(0, 10);
const TTL = 45_000; // Fresh for 45s in memory
const MAX_STALE = 900_000; // 15 minutes max stale

let cache = globalThis.__bcSheetCache ||= { at: 0, data: null, p: null, sheets: {} };

function buildIndex(list) {
  list.byRoll = new Map();
  list.byMobile = new Map();
  list.byId = new Map();

  for (const st of list) {
    list.byId.set(st.id, st);
    if (st.docId) list.byId.set(st.docId, st);

    for (const r of st.rolls) {
      const k = String(r).toLowerCase().replace(/\s+/g, '');
      if (!list.byRoll.has(k)) list.byRoll.set(k, []);
      list.byRoll.get(k).push(st);
    }

    for (const m of st.mobiles) {
      const cleanM = String(m).replace(/\D/g, '').slice(-10);
      if (!list.byMobile.has(cleanM)) list.byMobile.set(cleanM, []);
      list.byMobile.get(cleanM).push(st);
    }
  }
}

function tryReadDiskCache() {
  try {
    if (fs.existsSync(DISK_CACHE_PATH)) {
      const raw = fs.readFileSync(DISK_CACHE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
        const list = parsed.students;
        list.hash = parsed.hash || sha(list.map(x => x.id + x.h).join('|'));
        buildIndex(list);
        cache.data = list;
        cache.at = parsed.at || Date.now() - 60_000;
        cache.sheets = parsed.sheets || {};
        return list;
      }
    }
  } catch (e) {
    console.warn('[sheet] Failed to read disk cache:', e.message);
  }
  return null;
}

function writeDiskCache(list, sheets) {
  try {
    const dataToSave = {
      at: Date.now(),
      hash: list.hash,
      sheets,
      students: list.map(s => ({ ...s }))
    };
    fs.writeFileSync(DISK_CACHE_PATH, JSON.stringify(dataToSave));
  } catch (e) {
    console.warn('[sheet] Failed to write disk cache:', e.message);
  }
}

function refresh() {
  return cache.p ||= (async () => {
    try {
      const parts = await Promise.all(SHEETS.map(async s => {
        try {
          const r = await fetch(s.url, { signal: AbortSignal.timeout(9000) });
          if (!r.ok) throw new Error(`${s.centre} sheet HTTP ${r.status}`);
          const text = await r.text(), h = sha(text);
          const prev = cache.sheets[s.centre];
          if (prev && prev.h === h && prev.students) return prev.students;

          const parsed = parseSheet(text, s.centre);
          const students = parsed.students;
          for (const st of students) {
            st.h = sha(JSON.stringify([st.name, st.course, st.mobile, st.total, st.regFee, st.status, st.payments, 'v3']));
          }
          cache.sheets[s.centre] = { h, students, meta: parsed.meta };
          return students;
        } catch (fetchErr) {
          console.warn(`[sheet] Fetch error for ${s.centre}:`, fetchErr.message);
          if (cache.sheets[s.centre]?.students) return cache.sheets[s.centre].students;
          throw fetchErr;
        }
      }));

      const list = parts.flat();
      if (!list.length) throw new Error('No students returned from sheets');

      list.hash = sha(list.map(x => x.id + x.h).join('|'));

      const seen = new Set();
      for (const st of list) {
        const base = String(st.rolls[0]).replace(/\//g, '-');
        let d = base;
        if (seen.has(d)) {
          d = `${base}_${st.centre}`;
          for (let k = 2; seen.has(d); k++) d = `${base}_${st.centre}_${k}`;
        }
        seen.add(d);
        st.docId = d;
      }

      buildIndex(list);
      cache.data = list;
      cache.at = Date.now();

      writeDiskCache(list, cache.sheets);
      return list;
    } finally {
      cache.p = null;
    }
  })();
}

export const sheetInfo = () => Object.fromEntries(Object.entries(cache.sheets).map(([k, v]) => [k, v.meta]));

export const forceRefresh = async () => {
  cache.at = 0;
  try { if (fs.existsSync(DISK_CACHE_PATH)) fs.unlinkSync(DISK_CACHE_PATH); } catch { /* ignore unlink error */ }
  return refresh().then(() => cache.data);
};

// Fast SWR:
// 1. In-memory (< 45s): Instant (< 0.1ms).
// 2. In-memory (45s - 15m): Instant return, trigger background refresh!
// 3. Cold start: Check disk cache first (< 5ms!). If exists, serve immediately and refresh in background!
// 4. No cache: Fetch live sheets.
export async function loadStudents() {
  const now = Date.now();
  const age = now - cache.at;

  if (cache.data && age < TTL) {
    return cache.data;
  }

  if (cache.data && age < MAX_STALE) {
    refresh().catch(e => console.warn('[sheet] Background refresh failed:', e.message));
    return cache.data;
  }

  // Cold start check
  if (!cache.data) {
    const diskList = tryReadDiskCache();
    if (diskList) {
      refresh().catch(e => console.warn('[sheet] Initial background refresh failed:', e.message));
      return diskList;
    }
  }

  try {
    await refresh();
  } catch (e) {
    if (cache.data) return cache.data;
    const diskList = tryReadDiskCache();
    if (diskList) return diskList;
    throw e;
  }

  return cache.data;
}

/**
 * findStudentByCredentials(list, rollInput, mobileInput)
 * --------------------------------------------------------
 * Primary login verifier:
 * - When both Roll and Mobile are given: verifies Roll matches student AND student's registered mobile contains given mobile.
 * - When only Mobile is given: returns matches (single student or choices).
 * - When only Roll is given: returns matches (single student or choices).
 */
export function findStudentByCredentials(list, rollInput, mobileInput) {
  const cleanRoll = String(rollInput || '').trim();
  const cleanMobDigits = String(mobileInput || '').replace(/\D/g, '').slice(-10);
  const rollKey = cleanRoll.toLowerCase().replace(/\s+/g, '');

  // Case A: Both Roll and Mobile entered
  if (cleanRoll && cleanMobDigits) {
    let candidates = list.byRoll.get(rollKey) || [];
    if (!candidates.length) {
      const byId = list.byId.get(cleanRoll) || list.byId.get(`Nariyawal:${cleanRoll}`) || list.byId.get(`Thiriya:${cleanRoll}`);
      if (byId) candidates = [byId];
    }

    if (candidates.length > 0) {
      // Find candidate whose registered mobile matches
      const exactMatch = candidates.find(c => {
        if (!c.mobiles || !c.mobiles.length) return true; // If no mobile recorded in sheet, permit
        return c.mobiles.some(m => String(m).replace(/\D/g, '').slice(-10) === cleanMobDigits);
      });

      if (exactMatch) {
        return { match: exactMatch, error: null };
      }

      // Roll was found, but mobile didn't match!
      const first = candidates[0];
      const hint = first.mobile ? `...${first.mobile.slice(-4)}` : 'N/A';
      return {
        match: null,
        error: `Mobile number does not match Roll No. ${cleanRoll}. Registered mobile ends in ${hint}.`,
        code: 'MOBILE_MISMATCH'
      };
    }

    // Roll not found; let's check if mobile exists in sheet
    const mobCandidates = list.byMobile.get(cleanMobDigits) || [];
    if (mobCandidates.length > 0) {
      return {
        match: null,
        error: `Roll Number "${cleanRoll}" not found, but mobile is registered with ${mobCandidates.map(c => `${c.name} (Roll: ${c.rolls.join('/')})`).join(', ')}.`,
        code: 'ROLL_NOT_FOUND',
        suggestedChoices: mobCandidates
      };
    }

    return {
      match: null,
      error: `No record found with Roll No. "${cleanRoll}" and Mobile "${cleanMobDigits}". Please check your details.`,
      code: 'NOT_FOUND'
    };
  }

  // Case B: Only Roll entered
  if (cleanRoll) {
    let candidates = list.byRoll.get(rollKey) || [];
    if (!candidates.length) {
      const byId = list.byId.get(cleanRoll) || list.byId.get(`Nariyawal:${cleanRoll}`) || list.byId.get(`Thiriya:${cleanRoll}`);
      if (byId) candidates = [byId];
    }

    if (candidates.length === 1) return { match: candidates[0], error: null };
    if (candidates.length > 1) return { choices: candidates, error: null };
    return {
      match: null,
      error: `Roll Number "${cleanRoll}" not found in coaching records.`,
      code: 'ROLL_NOT_FOUND'
    };
  }

  // Case C: Only Mobile entered
  if (cleanMobDigits) {
    const candidates = list.byMobile.get(cleanMobDigits) || [];
    if (candidates.length === 1) return { match: candidates[0], error: null };
    if (candidates.length > 1) return { choices: candidates, error: null };
    return {
      match: null,
      error: `Mobile Number "${cleanMobDigits}" not found in coaching records.`,
      code: 'MOBILE_NOT_FOUND'
    };
  }

  return {
    match: null,
    error: 'Please enter your Roll Number and Mobile Number.',
    code: 'EMPTY_INPUT'
  };
}

export function findStudents(list, q) {
  const raw = String(q || '').trim(), digits = raw.replace(/\D/g, '');
  if (digits.length >= 10 && /^[\d\s+\-()]+$/.test(raw)) return list.byMobile.get(digits.slice(-10)) || [];
  return list.byRoll.get(raw.toLowerCase().replace(/\s+/g, '')) || [];
}

export const publicView = s => ({
  id: s.id, h: s.h, name: s.name, course: s.course, centre: s.centre, roll: s.rolls.join(' + '),
  admission: s.admission, total: s.total, regFee: s.regFee, paid: s.paid, due: s.due, payments: s.payments,
});

export function toDoc(st) {
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
    sheetHash: st.h || '',
    updatedAt: Date.now(),
  };
}
