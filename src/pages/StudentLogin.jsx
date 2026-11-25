import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash, Phone, ArrowRight, Loader2, Zap, ShieldCheck,
  CheckCircle2, AlertCircle, Building2, UserCheck, HelpCircle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../app/common/AuthContext';
import { sendTelegramNotification } from '../lib/telegram';
import { clientLoginLookup } from '../services/clientSheetLogin';
import toast from 'react-hot-toast';

export default function StudentLogin() {
  const [roll, setRoll] = useState('');
  const [mobile, setMobile] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [errCode, setErrCode] = useState('');
  const [choices, setChoices] = useState([]);
  const navigate = useNavigate();
  const { student, loginStudent } = useAuth();

  // If already logged in, redirect to portal
  useEffect(() => {
    if (student) {
      navigate('/student-portal', { replace: true });
    }
  }, [student, navigate]);

  // Load saved credentials from localStorage
  useEffect(() => {
    try {
      const savedRoll = localStorage.getItem('bytecore_saved_roll');
      const savedMob = localStorage.getItem('bytecore_saved_mobile');
      if (savedRoll) setRoll(savedRoll);
      if (savedMob) setMobile(savedMob);
    } catch { /* ignore storage error */ }
  }, []);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
  };

  const handleRollChange = (e) => {
    setRoll(e.target.value.trimStart());
  };

  const executeSignIn = async (studentData, token) => {
    try {
      if (token) {
        const { signInWithCustomToken } = await import('firebase/auth');
        const { auth } = await import('../firebase/auth');
        await signInWithCustomToken(auth, token);
      } else {
        // Fallback: anonymous auth to establish Firebase Auth session
        const { signInAnonymously } = await import('firebase/auth');
        const { auth } = await import('../firebase/auth');
        await signInAnonymously(auth).catch(() => {});
      }
    } catch (authErr) {
      console.warn('[StudentLogin] Firebase session notice:', authErr?.message);
    }

    loginStudent(studentData);

    // Save remember me
    try {
      if (rememberMe) {
        localStorage.setItem('bytecore_saved_roll', roll.trim());
        localStorage.setItem('bytecore_saved_mobile', mobile.trim());
      } else {
        localStorage.removeItem('bytecore_saved_roll');
        localStorage.removeItem('bytecore_saved_mobile');
      }
    } catch { /* ignore storage error */ }

    toast.success(`Welcome back, ${studentData.fullName || studentData.name || 'Student'}! 🎉`);

    Promise.resolve(sendTelegramNotification('login', {
      displayName: studentData.fullName || studentData.name || roll,
      email: `Roll: ${studentData.registration || roll}`,
      role: `Student (${studentData.course || 'Coaching'})`
    })).catch(() => {});

    navigate('/student-portal');
  };

  const submit = async (e, pickId) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanRoll = roll.trim();
    const cleanMob = mobile.trim();

    if (!cleanRoll && !cleanMob) {
      setError('Please enter your Roll Number and Mobile Number.');
      return;
    }

    setLoading(true);
    setStatusMessage('Verifying institute records...');
    setError('');
    setErrCode('');
    setChoices([]);

    try {
      // 1. Primary Attempt: Server-side API (/api/student-login)
      let apiSucceeded = false;
      try {
        const res = await fetch('/api/student-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registration: cleanRoll,
            roll: cleanRoll,
            mobile: cleanMob,
            id: pickId
          })
        });

        const contentType = res.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await res.json() : null;

        if (data?.choices && data.choices.length > 0) {
          setChoices(data.choices);
          setLoading(false);
          setStatusMessage('');
          return;
        }

        if (res.ok && data?.studentData) {
          apiSucceeded = true;
          await executeSignIn(data.studentData, data.token);
          return;
        }

        // If 401: explicit mismatch or not found from backend
        if (res.status === 401) {
          setError(data?.error || 'Invalid Roll Number or Mobile Number. Please check your details.');
          setErrCode(data?.code || 'AUTH_401');
          if (data?.choices) setChoices(data.choices);
          setLoading(false);
          setStatusMessage('');
          return;
        }
      } catch (networkErr) {
        console.warn('[StudentLogin] Server API hit failed, attempting direct Google Sheet fallback:', networkErr.message);
      }

      // 2. Resilient Fallback: Direct Sheet Parser
      if (!apiSucceeded) {
        setStatusMessage('Syncing live from Google Sheet register...');
        const result = await clientLoginLookup(cleanRoll, cleanMob);
        if (result?.choices) {
          setChoices(result.choices);
          setLoading(false);
          setStatusMessage('');
          return;
        }
        if (result?.student) {
          await executeSignIn(result.student, null);
          return;
        }
      }

    } catch (err) {
      console.error('[StudentLogin] Login error:', err);
      setError(err?.message || 'Unable to log in. Please check your internet and Roll / Mobile Number.');
      setErrCode('LOGIN_FAILED');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12 overflow-hidden bg-slate-950 font-inter text-slate-100">
      {/* Ambient background glows */}
      <div aria-hidden className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[130px] pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-lg">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-2xl shadow-blue-500/25 mb-5"
          >
            <div className="h-full w-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <GraduationCap className="text-blue-400" size={38} />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 size={13} />
              <span>Nariyawal & Thiriya Campuses</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Student Portal Login
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-2 max-w-md mx-auto">
              Check your course progress, fee installments, attendance & certificates live from institute records.
            </p>
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-7 md:p-9 rounded-[2.5rem] shadow-2xl space-y-6"
        >
          <form onSubmit={submit} className="space-y-5">
            {/* Field 1: Roll Number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="student-roll" className="block text-xs font-black text-blue-300 uppercase tracking-wider">
                  Roll / Registration No. <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">e.g. 1003, 2005</span>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                  <Hash size={20} />
                </span>
                <input
                  id="student-roll"
                  type="text"
                  value={roll}
                  onChange={handleRollChange}
                  autoComplete="off"
                  autoCapitalize="characters"
                  placeholder="Enter your Roll No."
                  className="w-full bg-slate-950/70 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 text-base font-bold placeholder:text-slate-600 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 transition-all hover:border-white/20"
                />
              </div>
            </div>

            {/* Field 2: Mobile Number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="student-mobile" className="block text-xs font-black text-blue-300 uppercase tracking-wider">
                  Registered Mobile No. <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">10-Digit Phone</span>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                  <Phone size={20} />
                </span>
                <span className="absolute inset-y-0 left-11 flex items-center text-slate-400 font-bold text-sm pointer-events-none">
                  +91
                </span>
                <input
                  id="student-mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={handleMobileChange}
                  autoComplete="tel"
                  placeholder="9876543210"
                  className="w-full bg-slate-950/70 border border-white/10 text-white rounded-2xl py-4 pl-20 pr-4 text-base font-bold placeholder:text-slate-600 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 transition-all hover:border-white/20 tracking-wider"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-950 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-300 font-semibold">Remember me on this device</span>
              </label>

              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-400" /> Auto-secured
              </span>
            </div>

            {/* Multiple matches / choices list */}
            {choices.length > 0 && (
              <div className="space-y-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl" role="group">
                <p className="text-xs font-black text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={16} /> Multiple accounts found. Please select yours:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {choices.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => submit(null, c.id)}
                      disabled={loading}
                      className="w-full text-left bg-slate-950/90 border border-white/15 text-white rounded-xl py-3 px-4 font-bold hover:border-blue-400 transition-all flex items-center justify-between group disabled:opacity-50"
                    >
                      <div>
                        <div className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                          Roll: <span className="text-slate-200 font-bold">{c.roll}</span> • {c.course} • {c.centre}
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  className="bg-red-500/15 border border-red-500/30 text-red-200 p-4 rounded-2xl text-xs font-bold text-center space-y-1"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                  {errCode && !['NOT_FOUND', 'EMPTY'].includes(errCode) && (
                    <div className="text-[10px] font-mono opacity-60">Status Code: {errCode}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Note */}
            {statusMessage && (
              <div className="flex items-center justify-center gap-2 text-xs text-blue-300 font-semibold py-1 animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shimmer" />
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Enter Student Portal</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help & Centre Contact */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Are you a faculty or admin?</span>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
                Staff Login →
              </Link>
            </div>

            <p className="text-center text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1.5">
              <HelpCircle size={13} />
              <span>Need help logging in? Contact Nariyawal or Thiriya center desk.</span>
            </p>
          </div>
        </motion.div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-slate-600 font-bold uppercase tracking-widest">
          ByteCore Computer Centre • Live Google Sheet Integrated
        </p>
      </main>
    </div>
  );
}
