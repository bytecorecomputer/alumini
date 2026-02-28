import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Phone, ArrowRight, Loader2, ShieldCheck, Database, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../app/common/AuthContext';
import { sendTelegramNotification } from '../lib/telegram';

export default function StudentLogin() {
    const [registration, setRegistration] = useState('');
    const [mobile, setMobile] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loginStudent } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const q = query(
                collection(db, "students"),
                where("registration", "==", registration.trim()),
                where("mobile", "==", mobile.trim())
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const studentData = querySnapshot.docs[0].data();
                // Use unified login function
                loginStudent(studentData);

                // Send Telegram Notification
                await sendTelegramNotification('login', {
                    displayName: studentData.fullName,
                    email: studentData.email || 'N/A',
                    role: `Student (${studentData.course})`
                });

                navigate('/student-portal');
            } else {
                setError('Invalid Registration or Mobile Number. Please contact Bytecore Admin.');
            }
        } catch (err) {
            console.error("Student login error:", err);
            setError('System connectivity error. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900 font-inter">
            {/* Dynamic Animated Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 100, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px]"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "outBack" }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        whileHover={{ rotate: 180, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/20 mb-6"
                    >
                        <Zap className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" size={40} fill="currentColor" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">
                        Bytecore<span className="text-blue-500">.</span>
                    </h1>
                    <p className="text-blue-200/60 font-bold tracking-widest text-xs uppercase">Student Access Portal</p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    {/* Gloss Effect */}
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-4">Registration ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-blue-300/50 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={registration}
                                    onChange={(e) => setRegistration(e.target.value)}
                                    placeholder="Enter Reg ID"
                                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-slate-900/70"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-4">Mobile Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-blue-300/50 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Registered Mobile"
                                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-slate-900/70"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.9 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl text-xs font-bold text-center backdrop-blur-sm"
                                >
                                    <span className="mr-2">⚠️</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Enter Portal</span>
                                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Secure Access • Bytecore System v2.0
                </p>
            </motion.div>
        </div>
    );
}
