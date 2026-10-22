import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { post, authed, inr, fmtDate } from './api.js';
const K = 'bc_token';

const C = 'bc_cache';
const read = () => { try { return JSON.parse(localStorage.getItem(C)); } catch { return null; } };

export default function Student() {
  const hasT = !!localStorage.getItem(K), cached = hasT ? read() : null;
  const [view, setView] = useState(hasT ? (cached ? 'ledger' : 'boot') : 'login'), [data, setData] = useState(cached), [msg, setMsg] = useState('');
  const h = useRef(cached?.h || '');
  const out = m => { localStorage.removeItem(K); localStorage.removeItem(C); h.current = ''; setMsg(m || ''); setView('login'); };
  const show = st => { h.current = st.h; setData(st); setView('ledger'); try { localStorage.setItem(C, JSON.stringify(st)); } catch {} };
  const load = useCallback(async () => { // cached ledger paints instantly; this only fetches if something changed
    const t = localStorage.getItem(K); if (!t) return setView('login');
    try { const j = await authed('/api/portal?h=' + h.current, t); if (!j.same) show(j.student); } catch (e) { if (e.status === 401) out(''); else if (!h.current) out(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { // live: re-check every 20s while the tab is visible, and the moment it is reopened
    if (view !== 'ledger') return;
    const id = setInterval(() => !document.hidden && load(), 20000), vis = () => !document.hidden && load();
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }, [view, load]);
  const submit = async (q, id) => {
    try {
      const j = await post('/api/portal', { q, id });
      if (j.choices) { setData({ q, choices: j.choices }); return setView('choose'); }
      localStorage.setItem(K, j.token); show(j.student);
    } catch (e) { setMsg(e.message); setView('login'); }
  };
  if (view === 'boot') return <main><p className="muted">Loading…</p></main>;
  if (view === 'login') return <Login msg={msg} onSubmit={submit} />;
  if (view === 'choose') return <main><h1>Who are you?</h1><p className="muted">More than one student uses this number.</p>
    {data.choices.map(c => <button key={c.id} className="pick" onClick={() => submit(data.q, c.id)}>{c.name}<br /><span className="muted sm">{c.course} · {c.centre}</span></button>)}
    <div className="row"><button className="ghost" onClick={() => setView('login')}>Back</button></div></main>;
  return <Ledger s={data} onRefresh={load} onLogout={() => out()} />;
}

function Login({ msg, onSubmit }) {
  const [q, setQ] = useState(''), [busy, setBusy] = useState(false);
  return <main><h1>Check your fees</h1><p className="muted">Enter your roll number or your registered mobile number.</p>
    <form className="card" onSubmit={async e => { e.preventDefault(); if (!q.trim()) return; setBusy(true); await onSubmit(q.trim()); setBusy(false); }}>
      <label htmlFor="q">Roll number or mobile number</label>
      <input id="q" value={q} onChange={e => setQ(e.target.value)} autoComplete="off" autoFocus placeholder="e.g. 1042 or 98XXXXXXXX" />
      <button disabled={busy}>{busy ? 'Checking…' : 'View my fees'}</button>
      {msg && <p className="err" role="alert">{msg}</p>}
    </form></main>;
}

function Ledger({ s, onRefresh, onLogout }) {
  const pct = s.total ? Math.min(100, Math.round(s.paid / s.total * 100)) : 0;
  const rows = useMemo(() => {
    let bal = s.total;
    return [...s.payments].sort((a, b) => (a.date || '~').localeCompare(b.date || '~')).map(p => ({ ...p, bal: (bal = Math.max(0, bal - p.amount)) }));
  }, [s]);
  return <main><h1>{s.name}</h1><p className="muted">{s.course} · {s.centre} · Roll {s.roll}</p>
    <section className="card"><p className="muted sm">{s.due ? 'Balance to pay' : 'Fees status'}</p>
      <p className={'big ' + (s.due ? 'due' : 'paid')}>{s.total ? (s.due ? inr(s.due) : 'All paid') : 'Not set'}</p>
      <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><i style={{ width: pct + '%' }} /></div>
      <div className="stats"><div><span className="muted sm">Total fee</span><b>{inr(s.total)}</b></div>
        <div><span className="muted sm">Paid</span><b className="paid">{inr(s.paid)}</b></div>
        <div><span className="muted sm">Registration</span><b>{inr(s.regFee)}</b></div></div>
      {!s.total && <p className="muted sm" style={{ marginTop: 12 }}>Your total fee is not entered yet. Please ask your centre.</p>}</section>
    <section className="card"><b>Installments paid</b>
      {rows.length ? <table><thead><tr><th>Installment</th><th>Amount</th><th>Balance</th></tr></thead><tbody>
        {rows.map((p, i) => <tr key={i}><td><b>{i + 1}.</b> {fmtDate(p.date)}{p.receipt && <><br /><span className="muted sm">Receipt {p.receipt}</span></>}</td><td className="paid">{inr(p.amount)}</td><td>{inr(p.bal)}</td></tr>)}
      </tbody></table> : <p className="muted" style={{ marginTop: 8 }}>No installments recorded yet.</p>}</section>
    <div className="row"><button className="ghost" onClick={onRefresh}>Refresh</button><button className="ghost" onClick={onLogout}>Log out</button></div>
    <p className="muted sm" style={{ marginTop: 16 }}>Figures come from your centre's fee register. If something looks wrong, show your receipt at the centre.</p></main>;
}
