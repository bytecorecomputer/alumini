import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { post, authed, inr } from './api.js';
const K = 'bc_admin', C = 'bc_admin_cache', RH = 44;
const COLS = [['roll', 'Roll'], ['name', 'Name'], ['course', 'Course'], ['centre', 'Centre'], ['total', 'Total', 1], ['paid', 'Paid', 1], ['due', 'Due', 1], ['last', 'Last paid'], ['mobile', 'Mobile']];
const prep = s => ({ ...s, hay: `${s.name} ${s.roll} ${s.mobile} ${s.course}`.toLowerCase() }); // search string built once, not per keystroke

// Reuse the SAME object for every student whose fingerprint (h) is unchanged -> React.memo skips those rows.
function merge(prev, next) {
  const old = new Map(prev.map(s => [s.id, s])); let changed = 0;
  const list = next.map(s => { const o = old.get(s.id); if (o && o.h === s.h) return o; changed++; return prep(s); });
  return { list, changed };
}

export default function Admin() {
  const cached = (() => { try { return localStorage.getItem(K) ? JSON.parse(localStorage.getItem(C)) : null; } catch { return null; } })();
  const [D, setD] = useState(() => cached?.students.map(prep) || null), [msg, setMsg] = useState(''), [note, setNote] = useState('');
  const Dref = useRef(D), hash = useRef(cached?.hash || '');
  const out = m => { localStorage.removeItem(K); localStorage.removeItem(C); hash.current = ''; Dref.current = null; setD(null); setMsg(m || ''); };
  const sync = useCallback(async () => {
    const t = localStorage.getItem(K); if (!t) return;
    try {
      const j = await authed('/api/admin?h=' + hash.current, t);
      if (j.same) return; // tiny response: nothing changed
      const had = !!Dref.current, m = merge(Dref.current || [], j.students);
      hash.current = j.hash; Dref.current = m.list; setD(m.list);
      if (had && m.changed) { setNote(`${m.changed} updated`); setTimeout(() => setNote(''), 4000); }
      try { localStorage.setItem(C, JSON.stringify({ hash: j.hash, students: m.list.map(({ hay, ...r }) => r) })); } catch {}
    } catch (e) { if (e.status === 401) out(''); }
  }, []);
  const on = !!D;
  useEffect(() => { // paint cached data instantly, then poll cheaply; pause when tab is hidden
    if (!on) return; sync();
    const id = setInterval(() => !document.hidden && sync(), 8000), vis = () => !document.hidden && sync();
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }, [on, sync]);
  if (!D) return <Login msg={msg} onDone={async t => { localStorage.setItem(K, t); await sync(); }} />;
  return <Dash D={D} note={note} onLogout={() => out()} />;
}

function Login({ msg, onDone }) {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState(msg), [busy, setBusy] = useState(false);
  return <main><h1>Admin</h1><form className="card" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await onDone((await post('/api/admin', { email, password: pw })).token); } catch (x) { setErr(x.message); setBusy(false); } }}>
    <label htmlFor="e">Email</label><input id="e" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" autoFocus />
    <label htmlFor="p">Password</label><input id="p" type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" />
    <button disabled={busy}>{busy ? 'Checking…' : 'Log in'}</button>{err && <p className="err" role="alert">{err}</p>}</form></main>;
}

const Row = memo(function Row({ s, top }) {
  return <div className="vr" style={{ transform: `translateY(${top}px)` }}><span>{s.roll}</span><span>{s.name}</span><span>{s.course}</span><span>{s.centre}</span>
    <span className="n">{inr(s.total)}</span><span className="n paid">{inr(s.paid)}</span><span className={'n ' + (s.due ? 'due' : '')}>{inr(s.due)}</span>
    <span>{s.last || '—'}</span><span>{s.mobile ? <a href={'tel:' + s.mobile}>{s.mobile}</a> : '—'}</span></div>;
});

function Dash({ D, note, onLogout }) {
  const [q, setQ] = useState(''), [centre, setCentre] = useState(''), [flt, setFlt] = useState(''), [sort, setSort] = useState('due'), [dir, setDir] = useState(-1), [top, setTop] = useState(0);
  const dq = useDeferredValue(q.toLowerCase().trim()), box = useRef(), raf = useRef(0);
  const centres = useMemo(() => [...new Set(D.map(s => s.centre))], [D]);
  const rows = useMemo(() => {
    const L = D.filter(s => (!centre || s.centre === centre) && (!dq || s.hay.includes(dq)) &&
      (!flt || (flt === 'due' && s.due) || (flt === 'over' && s.total && s.paid > s.total) || (flt === 'nt' && !s.total) || (flt === 'nm' && !s.mobile)));
    return L.sort((a, b) => (typeof a[sort] === 'number' ? a[sort] - b[sort] : String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true })) * dir);
  }, [D, centre, dq, flt, sort, dir]);
  useEffect(() => { if (box.current) box.current.scrollTop = 0; }, [centre, dq, flt, sort, dir]);
  const sum = k => rows.reduce((a, s) => a + s[k], 0), total = sum('total');
  const a = Math.max(0, Math.floor(top / RH) - 6), b = Math.min(rows.length, a + 30); // only ~30 DOM rows, however many students
  return <main className="wide"><h1>Fee overview <span className="muted sm"><i className="live" />Live{note && ` · ${note}`}</span></h1>
    <div className="grid">{[['Students', rows.length], ['Total fees', inr(total)], ['Collected', inr(sum('paid'))], ['Pending', inr(sum('due'))], ['Collected %', (total ? Math.round(sum('paid') / total * 100) : 0) + '%']]
      .map(([x, y]) => <div className="card" key={x}><span className="muted sm">{x}</span><br /><b>{y}</b></div>)}</div>
    <div className="card"><div className="tools">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, roll, mobile, course" />
      <select value={centre} onChange={e => setCentre(e.target.value)}><option value="">All centres</option>{centres.map(c => <option key={c}>{c}</option>)}</select>
      <select value={flt} onChange={e => setFlt(e.target.value)}><option value="">All students</option><option value="due">Has dues</option><option value="over">Paid more than total</option><option value="nt">Total fee missing</option><option value="nm">Mobile missing</option></select>
      <button className="ghost" onClick={onLogout}>Log out</button></div>
      <div className="wrap"><div className="vt"><div className="vh">{COLS.map(([k, t, n]) => <span key={k} className={n ? 'n' : ''} onClick={() => { setDir(sort === k ? -dir : -1); setSort(k); }}>{t}{sort === k ? (dir > 0 ? ' ↑' : ' ↓') : ''}</span>)}</div>
        <div className="vs" ref={box} onScroll={e => { const y = e.currentTarget.scrollTop; cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => setTop(y)); }}>
          <div style={{ height: rows.length * RH, position: 'relative' }}>{rows.slice(a, b).map((s, i) => <Row key={s.id} s={s} top={(a + i) * RH} />)}</div></div></div></div>
      <p className="muted sm">{rows.length} students</p></div></main>;
}
