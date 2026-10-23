// Fast admin fee overview. Data comes from /api/fees-admin (straight from the Google Sheets), verified with the
// admin's existing Firebase login. Cached copy paints instantly; a tiny hash poll pulls only real changes;
// the list is virtualised so only ~30 rows exist in the DOM.
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { auth } from '../firebase/auth';
import '../styles/fees.css';

const C = 'bc_fees_cache', RH = 44;
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const COLS = [['roll', 'Roll'], ['name', 'Name'], ['course', 'Course'], ['centre', 'Centre'], ['total', 'Total', 1], ['paid', 'Paid', 1], ['due', 'Due', 1], ['last', 'Last paid'], ['mobile', 'Mobile']];
const prep = s => ({ ...s, hay: `${s.name} ${s.roll} ${s.mobile} ${s.course}`.toLowerCase() });

async function call(path, method = 'GET') {
  await auth.authStateReady?.();
  if (!auth.currentUser) throw Object.assign(new Error('Please log in as admin.'), { status: 401 });
  const r = await fetch(path, { method, headers: { Authorization: 'Bearer ' + await auth.currentUser.getIdToken() } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong.'), { status: r.status });
  return j;
}
function merge(prev, next) { // keep the SAME object for unchanged students -> memo rows skip re-render
  const old = new Map(prev.map(s => [s.id, s])); let changed = 0;
  return { list: next.map(s => { const o = old.get(s.id); if (o && o.h === s.h) return o; changed++; return prep(s); }), changed };
}

const Row = memo(function Row({ s, top }) {
  return <div className="vr" style={{ transform: `translateY(${top}px)` }}><span>{s.roll}</span><span>{s.name}{s.status === 'cancel' && <em className="chip">Cancelled</em>}</span><span>{s.course}</span><span>{s.centre}</span>
    <span className="n">{inr(s.total)}</span><span className="n paid">{inr(s.paid)}</span><span className={'n ' + (s.due ? 'due' : '')}>{inr(s.due)}</span>
    <span>{s.last || '—'}</span><span>{s.mobile ? <a href={'tel:' + s.mobile}>{s.mobile}</a> : '—'}</span></div>;
});

export default function FeesAdmin() {
  const cached = (() => { try { return JSON.parse(localStorage.getItem(C)); } catch { return null; } })();
  const [D, setD] = useState(() => cached?.students.map(prep) || null), [note, setNote] = useState(''), [err, setErr] = useState('');
  const Dref = useRef(D), hash = useRef(cached?.hash || '');
  const [q, setQ] = useState(''), [centre, setCentre] = useState(''), [flt, setFlt] = useState(''), [sort, setSort] = useState('due'), [dir, setDir] = useState(-1), [top, setTop] = useState(0);
  const dq = useDeferredValue(q.toLowerCase().trim()), box = useRef(), raf = useRef(0);

  const sync = useCallback(async () => {
    try {
      const j = await call('/api/fees-admin?h=' + hash.current); setErr('');
      if (j.same) return;
      const had = !!Dref.current, m = merge(Dref.current || [], j.students);
      hash.current = j.hash; Dref.current = m.list; setD(m.list);
      if (had && m.changed) { setNote(`${m.changed} updated`); setTimeout(() => setNote(''), 4000); }
      try { localStorage.setItem(C, JSON.stringify({ hash: j.hash, students: m.list.map(({ hay, ...r }) => r) })); } catch { /* storage full */ }
    } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => {
    sync();
    const id = setInterval(() => !document.hidden && sync(), 8000), vis = () => !document.hidden && sync();
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }, [sync]);

  const centres = useMemo(() => [...new Set((D || []).map(s => s.centre))], [D]);
  const rows = useMemo(() => {
    const L = (D || []).filter(s => (!centre || s.centre === centre) && (!dq || s.hay.includes(dq)) &&
      (!flt || (flt === 'due' && s.due) || (flt === 'over' && s.total && s.paid > s.total) || (flt === 'nt' && !s.total) || (flt === 'nm' && !s.mobile) || (flt === 'cancel' && s.status === 'cancel')));
    return L.sort((a, b) => (typeof a[sort] === 'number' ? a[sort] - b[sort] : String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true })) * dir);
  }, [D, centre, dq, flt, sort, dir]);
  useEffect(() => { if (box.current) box.current.scrollTop = 0; }, [centre, dq, flt, sort, dir]);

  const sum = k => rows.reduce((a, s) => a + s[k], 0), total = sum('total');
  const a = Math.max(0, Math.floor(top / RH) - 6), b = Math.min(rows.length, a + 30);
  const pushNow = async () => { try { const j = await call('/api/fees-admin', 'POST'); setNote(`${j.written} student(s) synced to app`); setTimeout(() => setNote(''), 4000); } catch (e) { setErr(e.message); } };

  return <div className="bcf"><main className="wide">
    <h1>Fee overview <span className="muted sm"><i className="live" />Live{note && ` · ${note}`}</span></h1>
    {err && <p className="err" role="alert">{err}</p>}
    {!D && !err && <p className="muted">Loading…</p>}
    {D && <><div className="grid">{[['Students', rows.length], ['Total fees', inr(total)], ['Collected', inr(sum('paid'))], ['Pending', inr(sum('due'))], ['Collected %', (total ? Math.round(sum('paid') / total * 100) : 0) + '%']]
      .map(([x, y]) => <div className="card" key={x}><span className="muted sm">{x}</span><br /><b>{y}</b></div>)}</div>
      <div className="card"><div className="tools">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, roll, mobile, course" />
        <select value={centre} onChange={e => setCentre(e.target.value)}><option value="">All centres</option>{centres.map(c => <option key={c}>{c}</option>)}</select>
        <select value={flt} onChange={e => setFlt(e.target.value)}><option value="">All students</option><option value="due">Has dues</option><option value="over">Paid more than total</option><option value="nt">Total fee missing</option><option value="nm">Mobile missing</option><option value="cancel">Cancelled</option></select>
        <button className="ghost" onClick={pushNow}>Sync to app now</button></div>
        <div className="wrap"><div className="vt"><div className="vh">{COLS.map(([k, t, n]) => <span key={k} className={n ? 'n' : ''} onClick={() => { setDir(sort === k ? -dir : -1); setSort(k); }}>{t}{sort === k ? (dir > 0 ? ' ↑' : ' ↓') : ''}</span>)}</div>
          <div className="vs" ref={box} onScroll={e => { const y = e.currentTarget.scrollTop; cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => setTop(y)); }}>
            <div style={{ height: rows.length * RH, position: 'relative' }}>{rows.slice(a, b).map((s, i) => <Row key={s.id} s={s} top={(a + i) * RH} />)}</div></div></div></div>
        <p className="muted sm">{rows.length} students</p></div></>}
  </main></div>;
}
