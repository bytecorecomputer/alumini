import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Phone, ArrowRight, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../app/common/AuthContext';
import { sendTelegramNotification } from '../lib/telegram';

// One box: Roll / Registration No. OR Mobile Number (the server tells them apart).
export default function StudentLogin() {
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [choices, setChoices] = useState([]);
    const [errCode, setErrCode] = useState('');
    const navigate = useNavigate();
    const { student, loginStudent } = useAuth();

    useEffect(() => { if (student) navigate('/student-portal', { replace: true }); }, [student, navigate]);

    const looksMobile = q.replace(/\D/g, '').length >= 10 && /^[\d\s+\-()]+$/.test(q.trim());

    const submit = async (e, pickId) => {
        if (e && e.preventDefault) e.preventDefault();
        const value = q.trim();
        if (!value) { setError('Enter your Roll No. or Mobile Number.'); return; }
        setLoading(true); setError(''); setErrCode(''); setChoices([]);
        try {
            const res = await fetch('/api/student-login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: value, id: pickId }),
            });
            const data = (res.headers.get('content-type') || '').includes('application/json') ? await res.json() : null;
            if (data?.choices) { setChoices(data.choices); return; }
            if (!res.ok || !data?.token) {
                setError(data?.error || `Server problem (HTTP ${res.status}). Please try again in a minute or tell your centre.`);
                setErrCode(data?.code || `HTTP_${res.status}`);
                return;
            }
            const [{ signInWithCustomToken }, { auth }] = await Promise.all([import('firebase/auth'), import('../firebase/auth')]);
            await signInWithCustomToken(auth, data.token);
            loginStudent(data.studentData);
            Promise.resolve(sendTelegramNotification('login', {
                displayName: data.studentData.fullName || value, email: data.studentData.email || 'N/A',
                role: `Student (${data.studentData.course || 'N/A'})`,
            })).catch(() => {}); // never make the student wait for a notification
            navigate('/student-portal');
        } catch {
            setError('Network problem. Check your internet and try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950 font-inter">
            <div aria-hidden className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-blue-600/25 blur-[120px]" />
            <div aria-hidden className="absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[120px]" />

            <main className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/15 shadow-xl mb-5">
                        <Zap className="text-blue-400" size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Student Login</h1>
                    <p className="text-blue-200/60 text-sm font-semibold mt-2">See your fees, installments and course progress</p>
                </div>

                <form onSubmit={submit} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-5">
                    <div>
                        <label htmlFor="q" className="block text-[11px] font-black text-blue-200 uppercase tracking-widest mb-2">Roll No. or Mobile Number</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-blue-300/60 pointer-events-none">
                                {looksMobile ? <Phone size={20} /> : <Hash size={20} />}
                            </span>
                            <input
                                id="q" type="text" value={q} onChange={(e) => setQ(e.target.value)} autoFocus autoComplete="off" autoCapitalize="characters"
                                placeholder="e.g. 1003  or  9876543210"
                                className="w-full bg-slate-900/60 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 text-lg font-bold placeholder:text-slate-600 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50"
                            />
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-2 ml-1">
                            {looksMobile ? 'Mobile number detected.' : 'Use your Roll / Registration No. (like 1003, 2005, BS101) or your registered mobile.'}
                        </p>
                    </div>

                    {choices.length > 0 && (
                        <div className="space-y-2" role="group" aria-label="Select your name">
                            <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest">More than one student found. Select yours:</p>
                            {choices.map((c) => (
                                <button type="button" key={c.id} onClick={() => submit(null, c.id)} disabled={loading}
                                    className="w-full text-left bg-slate-900/60 border border-white/10 text-white rounded-2xl py-3 px-4 font-bold hover:border-blue-500/60 transition-colors disabled:opacity-50">
                                    {c.name} <span className="text-slate-400 text-xs font-semibold">· {c.course} · {c.centre}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {error && <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-sm font-bold text-center">{error}{errCode && !['NOT_FOUND', 'EMPTY'].includes(errCode) && <div className="mt-1 text-[10px] font-mono opacity-60">code: {errCode}</div>}</div>}

                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all uppercase tracking-widest text-sm disabled:opacity-60">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>Continue</span><ArrowRight size={20} /></>}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} /> Can't log in? Ask your centre to check your Roll No. / Mobile in the fee register.
                </p>
            </main>
        </div>
    );
}
