import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { sendTelegramNotification } from "../../lib/telegram";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      // Send Telegram Notification
      sendTelegramNotification('login', {
        displayName: userData.displayName,
        email: userData.email,
        role: role
      });

      if (role === "admin" || role === "super_admin") navigate("/admin/dashboard");
      else navigate("/directory");

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Identity verification failed. check your credentials.");
      } else {
        setError("Secure link established, but authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-slate-50 relative overflow-hidden">
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
        <div className="premium-card bg-white p-10 md:p-12">
          <div className="text-center mb-10">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="mx-auto h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl"
            >
              <GraduationCap size={32} />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Login</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Access your account</p>
          </div>

          <form className="space-y-6" onSubmit={login}>
            <div className="space-y-5">
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                <div className="relative group-focus-within:scale-[1.01] transition-transform">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold"
                    placeholder="name@alumni.edu"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
                <div className="relative group-focus-within:scale-[1.01] transition-transform">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-600 text-[11px] font-black uppercase tracking-wider text-center bg-red-50 p-3 rounded-xl border border-red-100 mb-4"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "btn-premium w-full flex items-center justify-center py-4 group disabled:opacity-50 shadow-xl shadow-purple-100",
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
    </div>
  );
}
