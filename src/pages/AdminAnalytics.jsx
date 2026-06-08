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
    MapPin, ChevronLeft, Download, ShieldCheck, PieChart as PieChartIcon, Calendar, Zap, AlertTriangle
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
        
        let d = slashMatch[1].padStart(2, '0');
        let m = slashMatch[2].padStart(2, '0');
        
        if (parseInt(m, 10) > 12) {
            m = slashMatch[1].padStart(2, '0');
            d = slashMatch[2].padStart(2, '0');
        }
        
        if (parseInt(m, 10) > 12 || parseInt(m, 10) === 0) return null;
        return `${y}-${m}`;
    }
    return null;
}

const calculateCourseExpiry = (admissionDateStr, courseName, totalFees) => {
    if (!admissionDateStr || !courseName) return null;
    let durationMonths = 6;
    const course = courseName.toUpperCase();
    if (course.includes('DCST') || course.includes('CCC')) durationMonths = 3;
    else if (course.includes('O LEVEL')) durationMonths = 12;
    else if (course.includes('ADCA') || course.includes('MDCA')) {
        durationMonths = ((totalFees || 0) >= 4500) ? 12 : 6;
    }
    const admission = new Date(admissionDateStr);
    if (isNaN(admission.getTime())) return null;
    const expiryDate = new Date(admission);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    return { duration: durationMonths, isCompleted: new Date() > expiryDate };
};

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
        let highRiskCount = 0;
        let projectedPipeline = 0; // Money expected from active students
        let badDebtRisk = 0; // Money stuck with completed students
        
        let monthlyTrends = {}; 

        students.forEach(s => {
            const branch = s.center || 'Nariyawal';
            const course = s.course || 'Unknown';
            const admMonth = parseDateToYYYYMM(s.admissionDate);
            const expiryInfo = calculateCourseExpiry(s.admissionDate, s.course, s.totalFees);
            
            if (admMonth) {
                if (!monthlyTrends[admMonth]) monthlyTrends[admMonth] = { month: admMonth, Admissions: 0, Revenue: 0 };
                monthlyTrends[admMonth].Admissions += 1;
            }

            let stuTotalPaidAllTime = (s.paidFees || 0) + (s.oldPaidFees || 0);
            const stuArrearsAllTime = Math.max(0, (s.totalFees || 0) - stuTotalPaidAllTime);

            if (selectedMonth === 'all') {
                totalEnrolled++;
                totalRevenue += stuTotalPaidAllTime;
                totalArrears += stuArrearsAllTime;

                if (branchStats[branch]) {
                    branchStats[branch].stu++;
                    branchStats[branch].rev += stuTotalPaidAllTime;
                    branchStats[branch].arr += stuArrearsAllTime;
                }
                courseCount[course] = (courseCount[course] || 0) + 1;

                if (stuArrearsAllTime > 0) {
                    const isHighRisk = expiryInfo?.isCompleted && stuArrearsAllTime > ((s.totalFees || 0) * 0.3);
                    if (isHighRisk) highRiskCount++;
                    
                    if (expiryInfo?.isCompleted) {
                        badDebtRisk += stuArrearsAllTime;
                    } else {
                        projectedPipeline += stuArrearsAllTime;
                    }

                    defaulters.push({ 
                        ...s, 
                        pending: stuArrearsAllTime, 
                        paidInPeriod: stuTotalPaidAllTime,
                        isHighRisk
                    });
                }

            } else {
                const isAdmittedThisMonth = admMonth === selectedMonth;
                if (isAdmittedThisMonth) {
                    totalEnrolled++;
                    if (branchStats[branch]) branchStats[branch].stu++;
                    courseCount[course] = (courseCount[course] || 0) + 1;
                }

                let paidThisMonth = 0;
                if (s.installments && s.installments.length > 0) {
                    s.installments.forEach(inst => {
                        const instMonth = parseDateToYYYYMM(inst.date);
                        if (instMonth === selectedMonth) paidThisMonth += (Number(inst.amount) || 0);
                    });
                } else if (isAdmittedThisMonth) {
                    paidThisMonth += (Number(s.oldPaidFees) || 0);
                }

                totalRevenue += paidThisMonth;
                if (branchStats[branch]) branchStats[branch].rev += paidThisMonth;
                
                if (paidThisMonth > 0 && monthlyTrends[selectedMonth]) {
                    monthlyTrends[selectedMonth].Revenue += paidThisMonth;
                }

                if (admMonth && admMonth <= selectedMonth) {
                    totalArrears += stuArrearsAllTime;
                    if (branchStats[branch]) branchStats[branch].arr += stuArrearsAllTime;

                    if (stuArrearsAllTime > 0) {
                        const isHighRisk = expiryInfo?.isCompleted && stuArrearsAllTime > ((s.totalFees || 0) * 0.3);
                        if (isHighRisk) highRiskCount++;
                        defaulters.push({ ...s, pending: stuArrearsAllTime, paidInPeriod: paidThisMonth, isHighRisk });
                    }
                }
            }
        });

        const branchData = Object.keys(branchStats).map(k => ({
            name: k, Revenue: branchStats[k].rev, Arrears: branchStats[k].arr, Students: branchStats[k].stu
        }));

        const courseData = Object.keys(courseCount).map(k => ({ name: k, value: courseCount[k] })).sort((a,b) => b.value - a.value);
        const trendData = Object.values(monthlyTrends).sort((a,b) => a.month.localeCompare(b.month)).slice(-12);

        // Sort defaulters: High Risk first, then by pending amount
        defaulters.sort((a,b) => {
            if (a.isHighRisk && !b.isHighRisk) return -1;
            if (!a.isHighRisk && b.isHighRisk) return 1;
            return b.pending - a.pending;
        });

        return {
            totalRevenue, totalArrears, totalEnrolled,
            branchData, courseData, trendData, 
            defaulters: defaulters.slice(0, 50),
            highRiskCount, projectedPipeline, badDebtRisk
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
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 font-inter">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <button onClick={() => navigate('/admin/coaching')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors">
                            <ChevronLeft size={14} /> Back to Directory
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                            Predictive <span className="text-blue-600">Analytics</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2">AI-Powered Forecasting & Intelligence Engine.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-white border border-slate-200 p-2 rounded-2xl flex items-center shadow-sm w-full md:w-auto">
                            <Calendar size={18} className="text-slate-400 ml-2" />
                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none text-slate-700 font-black outline-none px-4 py-2 cursor-pointer uppercase text-xs w-full"
                            >
                                {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <button onClick={() => window.print()} className="w-full md:w-auto justify-center px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Top High-Level Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Wallet size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Secured</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedMonth === 'all' ? 'Total Revenue' : 'Revenue This Month'}</p>
                            <h3 className="text-2xl md:text-4xl font-black text-slate-900 truncate">₹{analytics.totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Zap size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded">Pipeline</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Run Rate</p>
                            <h3 className="text-2xl md:text-4xl font-black text-slate-900 truncate">₹{analytics.projectedPipeline.toLocaleString()}</h3>
                            <p className="text-[9px] text-slate-400 font-bold mt-2">Active students arrears</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-1 rounded">Risk</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bad Debt Risk</p>
                            <h3 className="text-2xl md:text-4xl font-black text-slate-900 truncate">₹{analytics.badDebtRisk.toLocaleString()}</h3>
                            <p className="text-[9px] text-red-400 font-bold mt-2">{analytics.highRiskCount} High-Risk Defaulters</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 md:p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden group">
                        <TrendingUp size={100} className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md"><Users size={20} /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">{selectedMonth === 'all' ? 'Total Enrolled' : 'New Admissions'}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white">{analytics.totalEnrolled}</h3>
                            <p className="text-[9px] text-slate-300 font-bold mt-2">
                                Avg LTV: ₹{analytics.totalEnrolled ? Math.round(analytics.totalRevenue / analytics.totalEnrolled).toLocaleString() : 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                    {/* Branch Comparison */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[350px] md:h-[400px] flex flex-col hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin size={20} className="text-blue-600" />
                            <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Center Performance</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${v/1000}k`} />
                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                                    <Bar dataKey="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Arrears" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Admission & Revenue Velocity */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[350px] md:h-[400px] flex flex-col hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp size={20} className="text-emerald-600" />
                            <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Velocity (Last 12 Mo)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${v/1000}k`} />
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
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 mb-8">
                    <div className="xl:col-span-1 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px] flex flex-col hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <PieChartIcon size={20} className="text-purple-600" />
                            <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Course Dist.</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics.courseData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {analytics.courseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 justify-center">
                            {analytics.courseData.slice(0, 6).map((entry, idx) => (
                                <div key={entry.name} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-[9px] font-black uppercase text-slate-600">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[500px] hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="text-red-500" />
                                <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">AI Defaulter Risk</h3>
                            </div>
                            <span className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100">
                                Priority Follow-up
                            </span>
                        </div>
                        
                        {/* Mobile Optimized List View */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {analytics.defaulters.map((d, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => navigate(`/admin/coaching/student/${d.id}`)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                        d.isHighRisk 
                                        ? "bg-red-50/30 border-red-100 hover:border-red-200" 
                                        : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${d.isHighRisk ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {d.fullName?.charAt(0) || '#'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-sm">{d.fullName}</h4>
                                                {d.isHighRisk && <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">High Risk</span>}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{d.registration} • {d.course}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                        <div className="text-left md:text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Collected</p>
                                            <p className="text-xs font-black text-emerald-600">₹{d.paidInPeriod || 0}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pending Arrears</p>
                                            <p className={`text-sm font-black ${d.isHighRisk ? 'text-red-600' : 'text-amber-600'}`}>₹{d.pending}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {analytics.defaulters.length === 0 && (
                                <div className="text-center py-10">
                                    <ShieldCheck size={40} className="mx-auto text-emerald-400 mb-3" />
                                    <p className="text-slate-500 font-bold text-sm">No significant defaulters found. Outstanding metrics.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
