import { useMemo } from 'react';
import { CheckCircle2, CreditCard, AlertTriangle, Ban, ReceiptText } from 'lucide-react';

const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmt = d => {
    const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? new Date(+m[1], m[2] - 1, +m[3]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (d || 'Date not recorded');
};

// Fee record: balance, progress and an installment-by-installment passbook. Registration fee is shown separately
// (collected at admission) and is NOT added to the pending balance.
export default function FeeLedger({ student: s }) {
    const total = Number(s.totalFees || 0), reg = Number(s.registrationFee || 0);
    const cancelled = s.status === 'cancel';
    const rows = useMemo(() => {
        let run = 0;
        return (Array.isArray(s.installments) ? [...s.installments] : [])
            .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
            .map((p, i) => { run += Number(p.amount) || 0; return { ...p, no: i + 1, bal: Math.max(0, total - run) }; });
    }, [s.installments, total]);
    const paid = rows.reduce((a, p) => a + (Number(p.amount) || 0), 0) + Number(s.oldPaidFees || 0);
    const due = cancelled ? 0 : Math.max(0, total - paid), extra = Math.max(0, paid - total);
    const pct = total ? Math.min(100, Math.round(paid / total * 100)) : 0;
    const state = cancelled ? 'cancel' : !total ? 'unset' : due === 0 ? 'clear' : 'due';
    const tone = { cancel: 'text-slate-500', unset: 'text-slate-500', clear: 'text-emerald-600', due: 'text-amber-600' }[state];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-blue-600 rounded-b-full" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[11px] mb-3">
                    {state === 'due' ? 'Balance to pay' : state === 'clear' ? 'Fee status' : state === 'cancel' ? 'Admission' : 'Course fee'}
                </p>
                <h3 className={`text-5xl md:text-6xl font-black tracking-tight flex items-center justify-center gap-3 ${tone}`}>
                    {state === 'due' && inr(due)}
                    {state === 'clear' && <><CheckCircle2 size={44} /> All paid</>}
                    {state === 'cancel' && <><Ban size={40} /> Cancelled</>}
                    {state === 'unset' && 'Not set'}
                </h3>
                {state === 'unset' && <p className="text-slate-500 text-sm font-semibold mt-3">Your course fee is not entered yet. Please ask your centre.</p>}
                {total > 0 && (
                    <div className="mt-8 max-w-md mx-auto">
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                            <div className={`h-full rounded-full transition-all duration-700 ${state === 'clear' ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: pct + '%' }} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">{pct}% of course fee paid</p>
                    </div>
                )}
                <div className="grid grid-cols-3 gap-3 mt-8 max-w-lg mx-auto">
                    {[['Course fee', inr(total)], ['Paid so far', inr(paid)], ['Registration', reg ? inr(reg) : '—']].map(([k, v]) => (
                        <div key={k} className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{k}</p>
                            <p className="text-base md:text-lg font-black text-slate-900 mt-1">{v}</p>
                        </div>
                    ))}
                </div>
                {reg > 0 && <p className="text-[11px] text-slate-400 font-semibold mt-3">Registration fee is collected at admission and is not part of the balance.</p>}
            </div>

            {extra > 0 && !cancelled && (
                <div className="flex gap-3 items-start p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm font-semibold">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <span>Your payments are {inr(extra)} more than the course fee. Please check your receipts with the centre.</span>
                </div>
            )}

            <div className="p-6 md:p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"><ReceiptText size={20} className="text-blue-600" /> Installments</h3>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{rows.length} paid</span>
                </div>
                {rows.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="h-14 w-14 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3"><CreditCard size={28} /></div>
                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No installments recorded yet</p>
                    </div>
                ) : (
                    <ol className="relative">
                        {rows.map((p, i) => (
                            <li key={i} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
                                <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${i === rows.length - 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{p.no}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 text-sm">Installment {p.no}</p>
                                    <p className="text-xs text-slate-400 font-semibold">{fmt(p.date)}{p.receipt ? ` · Receipt ${p.receipt}` : ''}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-emerald-600">{inr(p.amount)}</p>
                                    {!cancelled && total > 0 && <p className="text-[11px] text-slate-400 font-semibold">Balance {inr(p.bal)}</p>}
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
            <p className="text-center text-[11px] text-slate-400 font-semibold px-4">Figures come from your centre's fee register and update automatically. If something looks wrong, show your receipt at the centre.</p>
        </div>
    );
}
