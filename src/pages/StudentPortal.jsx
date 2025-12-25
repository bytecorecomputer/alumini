import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import {
    User, BookOpen, CreditCard, Calendar, MapPin,
    LogOut, Database, Zap, Clock, ShieldCheck, CheckCircle2,
    CalendarDays
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function StudentPortal() {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const session = localStorage.getItem('student_session');
        if (!session) {
            navigate('/student-login');
            return;
        }

        const initialData = JSON.parse(session);
        setStudent(initialData);

        // Listen for real-time updates from Firestore
        const unsub = onSnapshot(doc(db, "students", initialData.registration), (doc) => {
            if (doc.exists()) {
                setStudent(doc.data());
                // Sync local storage for persistence across reloads
                localStorage.setItem('student_session', JSON.stringify(doc.data()));
            }
        });

        return () => unsub();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('student_session');
        navigate('/student-login');
    };

    if (!student) return null;

    const remainingFees = Math.max(0, (student.totalFees || 0) - (student.paidFees || 0));
    const paidPercentage = Math.min(100, ((student.paidFees || 0) / (student.totalFees || 1)) * 100);

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header Card */}
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />

                    <div className="flex items-center gap-8 text-center md:text-left flex-col md:flex-row">
                        <div className="h-32 w-32 rounded-full bg-slate-900 flex items-center justify-center text-4xl font-black text-white italic shadow-2xl shadow-slate-300">
                            {student.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                                <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-200">
                                    Bytecore Student
                                </span>
                                <span className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-100">
                                    ID: {student.registration}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">{student.fullName}</h1>
                            <p className="text-slate-500 font-bold text-sm flex items-center justify-center md:justify-start gap-2">
                                <BookOpen size={16} className="text-blue-500" /> {student.course}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-4 bg-red-50 text-red-600 rounded-3xl hover:bg-red-600 hover:text-white transition-all active:scale-95 group shadow-sm shadow-red-100"
                    >
                        <LogOut size={24} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Stats */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Financial Dashboard */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-slate-50">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <CreditCard size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Fee <span className="text-indigo-600">Overview</span></h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Fee</div>
                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">₹{student.totalFees}</div>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-100 pt-6">
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Fees Paid</div>
                                        <div className="text-3xl font-black text-emerald-600 tracking-tighter">₹{student.paidFees || 0}</div>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-100 pt-6">
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Balance Due</div>
                                        <div className="text-3xl font-black text-red-600 tracking-tighter">₹{remainingFees}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                                    <div className="relative h-40 w-40 flex items-center justify-center mb-6">
                                        <svg className="h-full w-full -rotate-90">
                                            <circle cx="80" cy="80" r="70" className="stroke-white fill-none" strokeWidth="12" />
                                            <circle
                                                cx="80" cy="80" r="70"
                                                className="stroke-indigo-600 fill-none transition-all duration-1000"
                                                strokeWidth="12"
                                                strokeDasharray={440}
                                                strokeDashoffset={440 - (440 * paidPercentage) / 100}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute text-center">
                                            <span className="text-3xl font-black text-slate-900">{Math.round(paidPercentage)}%</span>
                                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Paid</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                        Payment Progress
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Installments */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-slate-50">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                    <Clock size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Payment <span className="text-amber-600">History</span></h2>
                            </div>

                            <div className="space-y-4">
                                {student.installments?.length > 0 ? (
                                    student.installments.map((inst, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 bg-white rounded-2xl shadow-sm">
                                                    <CheckCircle2 size={24} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-900 uppercase">Fee Installment</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                                        <Calendar size={12} /> {inst.date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xl font-black text-slate-900 tracking-tight">
                                                + ₹{inst.amount}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-xs">No records found.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Details */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-blue-200 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-20"><ShieldCheck size={40} /></div>

                            <h3 className="text-xl font-black uppercase tracking-tighter mb-10">Admission <span className="text-blue-400">Status</span></h3>

                            <div className="space-y-8">
                                <SidebarItem icon={<CalendarDays />} label="Join Date" value={student.admissionDate} />
                                <SidebarItem icon={<MapPin />} label="Campus Area" value={student.address} />
                                <SidebarItem icon={<ShieldCheck />} label="Portal Status" value={student.status} />
                            </div>

                            <div className="mt-12 pt-10 border-t border-white/10 text-center">
                                <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4"><Database size={24} className="text-blue-400" /></div>
                                <p className="text-[10px] font-black uppercase tracking-[.3em] text-white/40">Powered by Bytecore Cloud</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, value }) {
    return (
        <div className="flex gap-4">
            <div className="text-blue-400 py-1">{icon}</div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{label}</p>
                <div className="text-sm font-black tracking-tight">{value}</div>
            </div>
        </div>
    );
}
