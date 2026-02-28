import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, GraduationCap, ArrowRight, ShieldCheck, X, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { sendTelegramNotification } from "../../lib/telegram";
import { checkMonthlyFeeReminders } from "../../lib/feeAutomation";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");

  const [loginMode, setLoginMode] = useState("alumni"); // "alumni" or "student"
  const [studentReg, setStudentReg] = useState("");
  const [studentMobile, setStudentMobile] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (loginMode === "alumni") {
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      if (!email || !password) {
        setError("Credentials required for system access");
        setLoading(false);
        return;
      }

      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const snap = await getDoc(doc(db, "users", res.user.uid));

        if (!snap.exists()) {
          navigate("/");
          return;
        }

        const userData = snap.data();
        const { role } = userData;

        sendTelegramNotification('login', {
          displayName: userData.displayName,
          email: userData.email,
          role: role
        });

        if (role === "admin" || role === "super_admin") navigate("/admin/dashboard");
        else navigate("/directory");
      } catch (err) {
        setError(err.code === 'auth/invalid-credential' ? "Identity verification failed." : "Authentication failed.");
      } finally {
        setLoading(false);
      }
    } else {
      // Student Login Mode
      if (!studentReg || !studentMobile) {
        setError("Registration and Mobile number required.");
        setLoading(false);
        return;
      }

      try {
        const studentRef = doc(db, "students", studentReg.trim());
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const studentData = studentSnap.data();

          // Verify mobile number matches for security
          if (studentData.mobile?.trim() === studentMobile.trim()) {
            localStorage.setItem('student_session', JSON.stringify(studentData));

            sendTelegramNotification('login', {
              displayName: studentData.fullName,
              email: `Reg: ${studentData.registration} `,
              role: 'student_portal'
            });

            // Trigger Targeted Fee Audit
            checkMonthlyFeeReminders(studentData.registration);

            navigate('/student-portal');
          } else {
            setError('Invalid Mobile Number for this Registration.');
          }
        } else {
          setError('Registration ID not found.');
        }
      } catch (err) {
        console.error(err);
        setError('System connectivity error.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    if (!resetEmail) {
      setResetError("Email is required for identity recovery.");
      setResetLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("Recovery link dispatched to your inbox!");
      // Close modal after delay
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetSuccess("");
        setResetEmail("");
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setResetError("No account associated with this email.");
      } else {
        setResetError("Recovery protocol failed. Try again later.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-slate-50 relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="premium-card bg-white p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="mx-auto h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl"
            >
              <GraduationCap size={32} />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
              {loginMode === "alumni" ? "Identity Login" : "Student Portal"}
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Bytecore Computer Centre</p>
          </div>

          {/* Login Mode Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 relative">
            <motion.div
              className="absolute inset-y-1 bg-white rounded-xl shadow-sm z-0"
              initial={false}
              animate={{
                x: loginMode === "alumni" ? 0 : "100%",
                width: "50%"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => { setLoginMode("alumni"); setError(""); }}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors",
                loginMode === "alumni" ? "text-slate-900" : "text-slate-400"
              )}
            >
              Network
            </button>
            <button
              onClick={() => { setLoginMode("student"); setError(""); }}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors",
                loginMode === "student" ? "text-slate-900" : "text-slate-400"
              )}
            >
              Student
            </button>
          </div>

          <form className="space-y-6" onSubmit={login}>
            <AnimatePresence mode="wait">
              {loginMode === "alumni" ? (
                <motion.div
                  key="alumni-fields"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                    <div className="relative group-focus-within:scale-[1.01] transition-transform">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold"
                        placeholder="name@alumni.edu"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
                    <div className="relative group-focus-within:scale-[1.01] transition-transform">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      </div>
                      <input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => setIsResetModalOpen(true)}
                        className="text-[9px] font-black text-purple-600 uppercase tracking-widest hover:text-purple-800 transition-colors"
                      >
                        Forgot Identity Password?
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="student-fields"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Registration ID</label>
                    <div className="relative group-focus-within:scale-[1.01] transition-transform">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Zap className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      </div>
                      <input
                        value={studentReg}
                        onChange={(e) => setStudentReg(e.target.value)}
                        type="text"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 font-bold"
                        placeholder="e.g. 1001"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Mobile Number</label>
                    <div className="relative group-focus-within:scale-[1.01] transition-transform">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      </div>
                      <input
                        value={studentMobile}
                        onChange={(e) => setStudentMobile(e.target.value)}
                        type="tel"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 font-bold"
                        placeholder="e.g. 8864880351"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-[10px] font-black uppercase tracking-wider text-center bg-red-50 p-3 rounded-xl border border-red-100 mb-4"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "btn-premium w-full flex items-center justify-center py-4 group disabled:opacity-50 shadow-xl transition-all",
                loginMode === "alumni" ? "shadow-purple-100" : "shadow-blue-100 bg-blue-600 hover:bg-blue-700",
                loading && "animate-pulse"
              )}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Connect Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>

            <div className="pt-8 border-t border-slate-50 flex flex-col gap-4 text-center">
              <p className="text-xs font-bold text-slate-500">
                New user?{" "}
                <Link to="/register" className="text-purple-600 font-black hover:underline underline-offset-4">
                  Register
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                <span className="text-[10px] uppercase font-black tracking-widest leading-none">End-to-End Encryption Enabled</span>
              </div>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Forgot Password Premium Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="flex justify-between items-center p-10 bg-slate-50/50 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Recover Access</h2>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Identity Restoration Protocol</p>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="p-4 bg-white rounded-2xl text-slate-400 hover:text-slate-950 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-100 outline-none text-slate-800 font-bold transition-all"
                      placeholder="recovery@alumni.edu"
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="text-red-600 text-[11px] font-black uppercase tracking-wider text-center bg-red-50 p-3 rounded-xl border border-red-100">
                    {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div className="text-emerald-600 text-[11px] font-black uppercase tracking-wider text-center bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    {resetSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className={cn(
                    "w-full btn-premium py-5 bg-slate-900 text-white shadow-2xl shadow-purple-900/20 uppercase tracking-[0.3em] font-black text-sm active:scale-95 disabled:opacity-50",
                    resetLoading && "animate-pulse"
                  )}
                >
                  {resetLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <Zap size={20} className="mr-2" />
                      Initiate Recovery
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
