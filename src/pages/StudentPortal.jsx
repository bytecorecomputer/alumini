import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Book, CreditCard, Award, LogOut,
    Calendar, Phone, Hash, CheckCircle,
    Clock, ChevronRight, Play, FileText,
    TrendingUp, ShieldCheck, Zap, Star
} from 'lucide-react';
import { useAuth } from '../app/common/AuthContext';
import QuizModule from '../components/student/QuizModule';
import { COURSE_CURRICULUM, QUIZ_BANK } from '../lib/quizData';
import { cn } from '../lib/utils';

export default function StudentPortal() {
    const { student, logoutStudent } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Resolve course modules
    const courseModules = useMemo(() => {
        if (!student?.course) return [];
        // Support both exact match and fuzzy match (like ADCA+ or ADCA)
        let courseKey = student.course;
        if (!COURSE_CURRICULUM[courseKey]) {
            courseKey = Object.keys(COURSE_CURRICULUM).find(k => student.course.includes(k)) || "DCA";
        }
        const modules = COURSE_CURRICULUM[courseKey] || [];
        return modules.map(id => ({ id, ...QUIZ_BANK[id] })).filter(m => m.title);
    }, [student?.course]);

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Unauthorized Access</h2>
                    <p className="text-slate-500 font-bold mb-8">Please login with your credentials to access the portal.</p>
                    <a href="/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95">Back to Login</a>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'courses', label: 'My Course', icon: Book },
        { id: 'learning', label: 'Learning Hub', icon: Zap },
        { id: 'fees', label: 'Fee Record', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-inter pt-28">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Header Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-[2rem] bg-white p-1 shadow-2xl overflow-hidden border border-white/50">
                                {student.photoUrl ? (
                                    <img src={student.photoUrl} alt="" className="h-full w-full object-cover rounded-[1.8rem]" />
                                ) : (
                                    <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white text-3xl font-black rounded-[1.8rem]">
                                        {student.fullName?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">Active Student</span>
                                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">ID: {student.registration}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                                {student.fullName?.split(' ')[0]}<span className="text-blue-600">.</span>
                            </h1>
                            <p className="text-slate-500 font-bold text-lg">{student.course} Specialist</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={logoutStudent}
                            className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-sm"
                        >
                            <LogOut size={18} />
                            Logout Portal
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 p-1.5 bg-white/50 backdrop-blur-xl border border-white/50 rounded-[2rem] mb-12 overflow-x-auto no-scrollbar scroll-smooth">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white text-blue-600 shadow-xl shadow-blue-500/10 scale-100"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50 scale-95 opacity-70"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Stats */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                                                <Award size={100} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Course Status</p>
                                                <h3 className="text-3xl font-black text-slate-900 mb-2">{student.status}</h3>
                                                <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                                                    <div className="w-3/4 h-full bg-blue-600 rounded-full" />
                                                </div>
                                                <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-widest">75% Course Completed</p>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
                                            <div className="absolute -bottom-10 -right-10 p-8 text-white/5 group-hover:scale-125 transition-transform duration-700">
                                                <Zap size={180} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-white/40 font-bold uppercase tracking-widest text-xs mb-4">Attendance Rate</p>
                                                <h3 className="text-5xl font-black mb-2">92%</h3>
                                                <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-1">
                                                    <TrendingUp size={14} /> Exceptional performance
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Activity</h3>
                                            <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">View All</button>
                                        </div>
                                        <div className="space-y-6">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                        <Clock size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-black text-slate-900 text-sm">{i === 1 ? 'Attendance Marked' : i === 2 ? 'Quiz Completed: MS Word' : 'Monthly Fee Paid'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{i * 2} days ago • 10:30 AM</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-8">
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">Personal Vault</h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Hash size={18} /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Roll No</p>
                                                    <p className="font-black text-slate-900 text-sm">{student.registration}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Calendar size={18} /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Join Date</p>
                                                    <p className="font-black text-slate-900 text-sm">{student.admissionDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Phone size={18} /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                                                    <p className="font-black text-slate-900 text-sm">{student.mobile}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] shadow-2xl shadow-blue-200">
                                        <div className="p-8 backdrop-blur-xl rounded-[2.4rem] text-white">
                                            <Star className="text-yellow-400 mb-4 fill-yellow-400" size={24} />
                                            <h4 className="text-xl font-black mb-2">Academic Badge</h4>
                                            <p className="text-blue-100 font-bold text-xs leading-relaxed mb-6">Complete your pending modules to unlock the "Master App" certificate.</p>
                                            <button className="w-full py-4 bg-white text-blue-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">Claim Badge</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900">Your Curriculum</h2>
                                        <p className="text-slate-500 font-bold">Comprehensive breakdown of your {student.course} modules.</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-colors">
                                        <FileText size={16} /> Download Syllabus
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courseModules.map((mod, idx) => (
                                        <motion.div
                                            key={mod.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between mb-8">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform",
                                                    mod.color === 'blue' ? 'bg-blue-600' :
                                                        mod.color === 'emerald' ? 'bg-emerald-600' :
                                                            mod.color === 'orange' ? 'bg-orange-600' :
                                                                mod.color === 'green' ? 'bg-green-600' :
                                                                    mod.color === 'yellow' ? 'bg-yellow-500' :
                                                                        mod.color === 'slate' ? 'bg-slate-600' :
                                                                            mod.color === 'indigo' ? 'bg-indigo-600' :
                                                                                mod.color === 'cyan' ? 'bg-cyan-600' :
                                                                                    mod.color === 'teal' ? 'bg-teal-600' :
                                                                                        mod.color === 'red' ? 'bg-red-600' : 'bg-blue-600'
                                                )}>
                                                    <Book size={28} />
                                                </div>
                                                <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full font-black text-[9px] uppercase tracking-widest">
                                                    Module {idx + 1}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2 truncate">{mod.title}</h3>
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">{mod.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-nowrap">
                                                    <Play size={10} fill="currentColor" /> Lectures
                                                </span>
                                                <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-nowrap">
                                                    <FileText size={10} /> PDF Notes
                                                </span>
                                            </div>
                                            <button className="w-full py-4 border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 rounded-[1.5rem] transition-all">Start learning</button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'learning' && (
                            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-blue-500/5 min-h-[600px] border border-slate-100">
                                <QuizModule student={student} />
                            </div>
                        )}

                        {activeTab === 'fees' && (
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="p-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden text-center">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-blue-600 rounded-b-full" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-4">Current Balance Account</p>
                                    <h3 className="text-7xl font-black text-slate-900 tracking-tighter mb-4">
                                        ₹{student.pendingFees || 0}
                                    </h3>
                                    <p className="text-slate-500 font-bold text-sm mb-12">Total balance to clear for certification eligibility.</p>

                                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-12">
                                        <div className="p-6 bg-slate-50 rounded-3xl">
                                            <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest mb-1">Paid Amount</p>
                                            <p className="text-xl font-black text-emerald-600">₹{(student.totalFees || 0) - (student.pendingFees || 0)}</p>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-3xl">
                                            <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest mb-1">Total Fee</p>
                                            <p className="text-xl font-black text-slate-900">₹{student.totalFees || 0}</p>
                                        </div>
                                    </div>

                                    <button className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10">
                                        Download Fee Statement
                                    </button>
                                </div>

                                <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Transaction History</h3>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <ShieldCheck size={14} /> Encrypted
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {(student.paymentHistory || []).length > 0 ? (
                                            student.paymentHistory.map((pmt, i) => (
                                                <div key={i} className="py-6 flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                            <CheckCircle size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900">₹{pmt.amount}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pmt.date}</p>
                                                        </div>
                                                    </div>
                                                    <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors">
                                                        <FileText size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center">
                                                <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CreditCard size={32} />
                                                </div>
                                                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No transactions found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
