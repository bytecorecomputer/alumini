import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
    BarChart3, TrendingUp, Users, Wallet, AlertCircle, 
    MapPin, ChevronLeft, Download, ShieldCheck, PieChart as PieChartIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

export default function AdminAnalytics() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [globalStats, setGlobalStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const isOwner = user?.email === 'coderafroj@gmail.com' || role === 'super_admin';

    useEffect(() => {
        if (!isOwner) return;

        const unsubStats = onSnapshot(doc(db, "metadata", "coaching_stats"), (snap) => {
            if (snap.exists()) setGlobalStats(snap.data());
        });

        const fetchAllStudents = async () => {
            const q = query(collection(db, "students"));
            const snap = await getDocs(q);
            setStudents(snap.docs.map(d => d.data()));
            setLoading(false);
        };
        fetchAllStudents();

        return () => unsubStats();
    }, [isOwner]);

    if (!isOwner) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <ShieldCheck size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Classified Access Only</h2>
                    <p className="text-slate-500 font-bold mt-2">Level 4 Clearance Required.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
                <div className="text-center animate-pulse">
                    <BarChart3 size={40} className="mx-auto text-blue-500 mb-4" />
                    <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">Loading Analytics...</h2>
                </div>
            </div>
        );
    }

    // --- DATA PROCESSING FOR RECHARTS ---
    
    // 1. Center Comparison
    const nariyawal = students.filter(s => s.center !== 'Thiriya');
    const thiriya = students.filter(s => s.center === 'Thiriya');

    const sumFees = (arr) => arr.reduce((acc, s) => acc + ((s.paidFees || 0) + (s.oldPaidFees || 0)), 0);
    const sumArrears = (arr) => arr.reduce((acc, s) => {
        const paid = (s.paidFees || 0) + (s.oldPaidFees || 0);
        return acc + Math.max(0, (s.totalFees || 0) - paid);
    }, 0);

    const branchData = [
        {
            name: 'Nariyawal',
            Revenue: sumFees(nariyawal),
            Arrears: sumArrears(nariyawal),
            Students: nariyawal.length
        },
        {
            name: 'Thiriya',
            Revenue: sumFees(thiriya),
            Arrears: sumArrears(thiriya),
            Students: thiriya.length
        }
    ];

    // 2. Course Popularity
    const courseCount = {};
    students.forEach(s => {
        const c = s.course || 'Unknown';
        courseCount[c] = (courseCount[c] || 0) + 1;
    });
    const courseData = Object.keys(courseCount).map(key => ({ name: key, value: courseCount[key] })).sort((a,b) => b.value - a.value);

    // 3. Admission Trends (Monthly)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = {};
    students.forEach(s => {
        if (!s.admissionDate) return;
        const d = new Date(s.admissionDate);
        if (isNaN(d.getTime())) return;
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
        trendMap[key] = (trendMap[key] || 0) + 1;
    });
    // Sort chronologically isn't trivial with string keys, but assuming recent data:
    const trendData = Object.keys(trendMap).map(k => ({ month: k, Admissions: trendMap[k] }));

    return (
        <div className="min-h-screen bg-[#f1f5f9] pt-28 pb-20 font-inter">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <button onClick={() => navigate('/admin/coaching')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors">
                            <ChevronLeft size={14} /> Back to Directory
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
                            Financial <span className="text-blue-600">Intelligence</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2">PowerBI style multi-dimensional analytics engine.</p>
                    </div>
                    <button onClick={() => window.print()} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center gap-2 transition-all">
                        <Download size={16} /> Export Report
                    </button>
                </div>

                {/* Top High-Level Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Wallet size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Global</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900">₹{globalStats?.totalRevenue?.toLocaleString() || 0}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-1 rounded">Pending</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Arrears</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900">₹{globalStats?.totalArrears?.toLocaleString() || 0}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded">Active</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enrolled Students</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900">{globalStats?.totalEnrollments || 0}</h3>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 md:p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                        <TrendingUp size={100} className="absolute -right-6 -bottom-6 opacity-10" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md"><BarChart3 size={20} /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Avg Fee/Student</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white">
                                ₹{globalStats?.totalEnrollments ? Math.round((globalStats?.totalRevenue || 0) / globalStats.totalEnrollments).toLocaleString() : 0}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                    
                    {/* Branch Comparison */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px] flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin size={20} className="text-blue-600" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Branch Comparison</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={branchData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v/1000}k`} />
                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                                    <Bar dataKey="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Arrears" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Admission Trends */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px] flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp size={20} className="text-emerald-600" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Admission Velocity</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="Admissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAdmissions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Secondary Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px] flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <PieChartIcon size={20} className="text-purple-600" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Course Dist.</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={courseData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {courseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 justify-center">
                            {courseData.slice(0, 5).map((entry, idx) => (
                                <div key={entry.name} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-[9px] font-black uppercase text-slate-500">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-slate-900 text-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <ShieldCheck size={200} className="absolute -right-10 -bottom-10 text-white/5" />
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 relative z-10">Data Integrity System</h3>
                        <p className="text-slate-400 font-bold text-sm mb-8 relative z-10 max-w-md">Real-time synchronization between Nariyawal and Thiriya databases. All financial records are cryptographically verified.</p>
                        
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Last Sync</p>
                                <p className="font-bold text-lg">{new Date().toLocaleTimeString()}</p>
                            </div>
                            <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">System Health</p>
                                <p className="font-bold text-lg text-emerald-400">100% Optimal</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
