import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Phone, ArrowRight, Loader2, ShieldCheck, Database, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function StudentLogin() {
    const [registration, setRegistration] = useState('');
    const [mobile, setMobile] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
                // Store student session in localStorage (Custom non-Firebase Auth flow)
                localStorage.setItem('student_session', JSON.stringify(studentData));
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
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-blue-100 mb-6 group hover:scale-110 transition-transform cursor-pointer">
                        <Database className="text-blue-600 group-hover:rotate-12 transition-transform" size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Bytecore <span className="text-blue-600">Portal.</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Student Command Center</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <Zap size={24} className="text-blue-50/50" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration ID</label>
                            <div className="relative group">
                                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={registration}
                                    onChange={(e) => setRegistration(e.target.value)}
                                    placeholder="e.g. 1001"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/10 focus:bg-white focus:border-blue-200 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Registered number"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/10 focus:bg-white focus:border-blue-200 transition-all"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            disabled={isLoading}
                            className="w-full btn-premium bg-slate-900 text-white rounded-2xl py-5 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Enter Portal</span>
                            <ArrowRight size={18} className="ml-auto opacity-50" />
                        </button>
                    </form>
                </div>

                <p className="mt-10 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    Bytecore Computer Centre &copy; 2025
                </p>
            </motion.div>
        </div>
    );
}
