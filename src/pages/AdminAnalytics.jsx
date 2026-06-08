import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
    BarChart3, TrendingUp, Users, Wallet, AlertCircle, 
    MapPin, ChevronLeft, Download, ShieldCheck, PieChart as PieChartIcon, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

// Utility to parse dates into YYYY-MM
const parseDateToYYYYMM = (dateStr) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.toString().trim().toLowerCase();
    
    const isoMatch = cleanStr.match(/^(\d{4})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`;

    const months = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    let foundMonth = null;
    for (const [name, num] of Object.entries(months)) {
        if (cleanStr.includes(name)) {
            foundMonth = num;
            break;
        }
    }

    const yearMatch = cleanStr.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    if (foundMonth) return `${year}-${foundMonth}`;

    const slashMatch = cleanStr.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
    if (slashMatch) {
        let y = slashMatch[3];
        if (y.length === 2) y = "20" + y;
        let m = slashMatch[2].padStart(2, '0');
        return `${y}-${m}`;
    }
    return null;
}

export default function AdminAnalytics() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('all');

    const isOwner = user?.email === 'coderafroj@gmail.com' || role === 'super_admin';

    useEffect(() => {
        if (!isOwner) return;

        const fetchAllStudents = async () => {
            const q = query(collection(db, "students"));
            const snap = await getDocs(q);
            setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        };
        fetchAllStudents();

    }, [isOwner]);

    const monthOptions = useMemo(() => {
        const opts = [{ value: 'all', label: 'All Time' }];
        const now = new Date();
        for(let i=0; i<12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            const label = d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
            opts.push({ value: val, label });
        }
        return opts;
    }, []);

    // Pro-Level Analytics Engine
    const analytics = useMemo(() => {
        if (!students.length) return null;

        let totalRevenue = 0;
        let totalArrears = 0;
        let totalEnrolled = 0;
        let branchStats = { Nariyawal: { rev: 0, arr: 0, stu: 0 }, Thiriya: { rev: 0, arr: 0, stu: 0 } };
        let courseCount = {};
        let defaulters = [];
        
        // For Area Chart (Velocity)
        let monthlyTrends = {}; 

        students.forEach(s => {
            const branch = s.center || 'Nariyawal';
            const course = s.course || 'Unknown';
            const admMonth = parseDateToYYYYMM(s.admissionDate);
            
            // Collect overall trends regardless of filter for the Area chart
            if (admMonth) {
                if (!monthlyTrends[admMonth]) monthlyTrends[admMonth] = { month: admMonth, Admissions: 0, Revenue: 0 };
                monthlyTrends[admMonth].Admissions += 1;
            }

            let stuTotalPaidAllTime = (s.paidFees || 0) + (s.oldPaidFees || 0);
            
            if (selectedMonth === 'all') {
                totalEnrolled++;
                totalRevenue += stuTotalPaidAllTime;
                
                const stuArrears = Math.max(0, (s.totalFees || 0) - stuTotalPaidAllTime);
                totalArrears += stuArrears;

                if (branchStats[branch]) {
                    branchStats[branch].stu++;
                    branchStats[branch].rev += stuTotalPaidAllTime;
                    branchStats[branch].arr += stuArrears;
                }
                courseCount[course] = (courseCount[course] || 0) + 1;

                if (stuArrears > 0) defaulters.push({ ...s, pending: stuArrears, paidInPeriod: stuTotalPaidAllTime });

            } else {
                // Specific Month Logic
                const isAdmittedThisMonth = admMonth === selectedMonth;
                if (isAdmittedThisMonth) {
                    totalEnrolled++;
                    if (branchStats[branch]) branchStats[branch].stu++;
                    courseCount[course] = (courseCount[course] || 0) + 1;
                }

                // Calculate Revenue strictly collected this month via installments
                let paidThisMonth = 0;
                if (s.installments && s.installments.length > 0) {
                    s.installments.forEach(inst => {
                        const instMonth = parseDateToYYYYMM(inst.date);
                        if (instMonth === selectedMonth) {
                            paidThisMonth += (Number(inst.amount) || 0);
                        }
                    });
                } else if (isAdmittedThisMonth) {
                    // Fallback: If no explicit installments but they were admitted this month, count oldPaidFees
                    paidThisMonth += (Number(s.oldPaidFees) || 0);
                }

                totalRevenue += paidThisMonth;
                if (branchStats[branch]) branchStats[branch].rev += paidThisMonth;
                
                // Track revenue trend
                if (paidThisMonth > 0 && monthlyTrends[selectedMonth]) {
                    monthlyTrends[selectedMonth].Revenue += paidThisMonth;
                }

                // Calculate Arrears (Only consider arrears active in that month or currently)
                // For simplicity in a specific month filter, "Arrears" represents the current standing of students admitted up to that month.
                if (admMonth && admMonth <= selectedMonth) {
                    const stuArrears = Math.max(0, (s.totalFees || 0) - stuTotalPaidAllTime);
                    totalArrears += stuArrears;
                    if (branchStats[branch]) branchStats[branch].arr += stuArrears;

                    if (stuArrears > 0) defaulters.push({ ...s, pending: stuArrears, paidInPeriod: paidThisMonth });
                }
            }
        });

        // Format charts data
        const branchData = Object.keys(branchStats).map(k => ({
            name: k, Revenue: branchStats[k].rev, Arrears: branchStats[k].arr, Students: branchStats[k].stu
        }));

        const courseData = Object.keys(courseCount).map(k => ({ name: k, value: courseCount[k] })).sort((a,b) => b.value - a.value);
        
        const trendData = Object.values(monthlyTrends).sort((a,b) => a.month.localeCompare(b.month)).slice(-12);

        // Sort defaulters by pending highest first
        defaulters.sort((a,b) => b.pending - a.pending);

        return {
            totalRevenue, totalArrears, totalEnrolled,
            branchData, courseData, trendData, defaulters: defaulters.slice(0, 50)
        };
    }, [students, selectedMonth]);

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

    if (loading || !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
                <div className="text-center animate-pulse">
                    <BarChart3 size={40} className="mx-auto text-blue-500 mb-4" />
                    <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">Compiling Intelligence...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9] pt-28 pb-20 font-inter">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <button onClick={() => navigate('/admin/coaching')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors">
                            <ChevronLeft size={14} /> Back to Directory
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
                            Financial <span className="text-blue-600">Intelligence</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2">Pro-Level Multi-Dimensional Analytics Engine.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white border border-slate-200 p-2 rounded-2xl flex items-center shadow-sm">
                            <Calendar size={18} className="text-slate-400 ml-2" />
                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none text-slate-700 font-black outline-none px-4 py-2 cursor-pointer uppercase text-xs"
                            >
                                {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <button onClick={() => window.print()} className="px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Top High-Level Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Wallet size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Collection</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedMonth === 'all' ? 'Total Revenue' : 'Revenue This Month'}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900">₹{analytics.totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-1 rounded">Pending</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Arrears</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900">₹{analytics.totalArrears.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded">Active</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedMonth === 'all' ? 'Total Enrolled' : 'Admissions This Month'}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900">{analytics.totalEnrolled}</h3>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 md:p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                        <TrendingUp size={100} className="absolute -right-6 -bottom-6 opacity-10" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md"><BarChart3 size={20} /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Avg Collection/Student</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white">
                                ₹{analytics.totalEnrolled ? Math.round(analytics.totalRevenue / analytics.totalEnrolled).toLocaleString() : 0}
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
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Center Performance</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.branchData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

                    {/* Admission & Revenue Velocity */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px] flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp size={20} className="text-emerald-600" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Velocity (Last 12 Mo)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                                    <Area type="monotone" dataKey="Admissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAdmissions)" />
                                    <Line type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={3} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                    <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px] flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <PieChartIcon size={20} className="text-purple-600" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Course Dist.</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics.courseData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {analytics.courseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 justify-center">
                            {analytics.courseData.slice(0, 5).map((entry, idx) => (
                                <div key={entry.name} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-[9px] font-black uppercase text-slate-500">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="text-red-500" />
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Top Defaulters</h3>
                            </div>
                            <span className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-3 py-1 rounded-lg">High Priority</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-l-xl">Student</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Course</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Collected</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-r-xl">Pending Arrears</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.defaulters.map((d, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/coaching/student/${d.id}`)}>
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{d.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{d.registration}</p>
                                            </td>
                                            <td className="p-3 text-xs font-bold text-slate-600">{d.course}</td>
                                            <td className="p-3 text-xs font-black text-emerald-600">₹{d.paidInPeriod || 0}</td>
                                            <td className="p-3 text-xs font-black text-red-600 bg-red-50/30 rounded-r-xl">₹{d.pending}</td>
                                        </tr>
                                    ))}
                                    {analytics.defaulters.length === 0 && (
                                        <tr><td colSpan="4" className="text-center py-8 text-slate-400 font-bold text-sm">No significant defaulters found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <ShieldCheck size={200} className="absolute -right-10 -bottom-10 text-white/5" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 relative z-10">Data Integrity System</h3>
                    <p className="text-slate-400 font-bold text-sm mb-8 relative z-10 max-w-md">Real-time synchronization active. Analytics engine processes thousands of data points instantly based on your query context.</p>
                    
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Query Context</p>
                            <p className="font-bold text-lg">{selectedMonth === 'all' ? 'All-Time Global' : selectedMonth}</p>
                        </div>
                        <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">System Health</p>
                            <p className="font-bold text-lg text-emerald-400">Optimal</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
