import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, GraduationCap, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { sendTelegramNotification } from "../../lib/telegram";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();
    const role = e.target.role.value;

    if (!name || !email || !password) {
      setError("Identity formation requires all parameters");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Security protocol requires 6+ characters");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });

      const finalRole = email === "coderafroj@gmail.com" ? "super_admin" : role;

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName: name,
        email: email,
        role: finalRole,
        photoURL: null,
        headline: role === 'student' ? 'Student' : 'Alumni',
        createdAt: Date.now(),
        course: "",
        batch: "",
        company: "",
        location: "",
        bio: "",
        skills: []
      });

      // Send Telegram Notification
      sendTelegramNotification('register', {
        displayName: name,
        email: email,
        role: finalRole
      });

      navigate("/profile");

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Identifier already registered in network");
      } else {
        setError("Network initialization failure: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-100 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full"
      >
        <div className="premium-card bg-white p-10 md:p-14">
          <div className="text-center mb-12">
            <motion.div
              initial={{ rotate: 10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="mx-auto h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl"
            >
              <Zap size={32} />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Register</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Join the alumni network</p>
          </div>

          <form className="space-y-8" onSubmit={register}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                <div className="relative group-focus-within:scale-[1.01] transition-transform">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold"
                    placeholder="Your Name"
                  />
                </div>
              </div>

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

              <div className="group md:col-span-2">
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
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Role</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer group">
                  <input type="radio" name="role" value="student" className="peer sr-only" defaultChecked />
                  <div className="rounded-2xl border-2 border-slate-50 p-5 text-center font-black uppercase tracking-widest text-xs peer-checked:border-purple-100 peer-checked:bg-purple-50/50 peer-checked:text-purple-700 hover:bg-slate-50 transition-all shadow-sm">
                    Fellow
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="role" value="alumni" className="peer sr-only" />
                  <div className="rounded-2xl border-2 border-slate-50 p-5 text-center font-black uppercase tracking-widest text-xs peer-checked:border-blue-100 peer-checked:bg-blue-50/50 peer-checked:text-blue-700 hover:bg-slate-50 transition-all shadow-sm">
                    Alumni
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-[11px] font-black uppercase tracking-wider text-center bg-red-50 p-4 rounded-2xl border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "btn-premium w-full flex items-center justify-center py-5 group disabled:opacity-50 shadow-2xl shadow-purple-100",
                loading && "animate-pulse"
              )}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-3 group-hover:translate-x-1.5 transition-transform" size={20} />
                </>
              )}
            </button>

            <div className="pt-10 border-t border-slate-50 text-center space-y-4">
              <p className="text-xs font-bold text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-600 font-black hover:underline underline-offset-4">
                  Login
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                <span className="text-[10px] uppercase font-black tracking-widest leading-none">Global Privacy Standards Compliant</span>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
