import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { parseDateToYYYYMM, calculateCourseExpiry } from '../lib/utils';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
    BarChart3, TrendingUp, Users, Wallet, AlertCircle, 
    MapPin, ChevronLeft, Download, ShieldCheck, PieChart as PieChartIcon, Calendar, Zap, AlertTriangle, Building, Activity, Map, Smartphone, Award, CheckCircle, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'];



// calculateCourseExpiry is now imported from utils.js

const normalizeAddress = (addr) => {
    if (!addr) return 'Unknown Location';
    const lower = addr.toLowerCase();
    if (lower.includes('nariyawal') || lower.includes('nariawal')) return 'Nariyawal';
    if (lower.includes('thiriya') || lower.includes('thiria') || lower.includes('thirya') || lower.includes('nizamat')) return 'Thiriya Nizamat Khan';
    if (lower.includes('bareilly') || lower.includes('bly')) return 'Bareilly City';
    if (lower.includes('bithri') || lower.includes('bithiri')) return 'Bithri Chainpur';
    if (lower.includes('fargawan') || lower.includes('fargavan')) return 'Fargawan';
    if (lower.includes('navadia') || lower.includes('nawadia') || lower.includes('navadiya')) return 'Navadia';
    if (lower.includes('tuline') || lower.includes('tulin')) return 'Tuline';
    return 'Other Localities';
};

export default function AdminAnalytics() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [systemUsers, setSystemUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedCenter, setSelectedCenter] = useState('nariyawal');
    const [addressFilter, setAddressFilter] = useState('all');
    const [appInstalls, setAppInstalls] = useState(0);

    const isOwner = user?.role === 'admin' || role === 'super_admin';

    const fetchAllData = async () => {
        const q = query(collection(db, "students"));
        const snap = await getDocs(q);
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        try {
            const userSnap = await getDocs(query(collection(db, "users")));
            setSystemUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch(e) {
            console.error("Error fetching system users:", e);
        }

        try {
            const installDoc = await getDoc(doc(db, "analytics", "app_installs"));
            if (installDoc.exists()) {
                setAppInstalls(installDoc.data().count || 0);
            }
        } catch(e) {
            console.error("Error fetching app installs:", e);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!isOwner) return;
        fetchAllData();
    }, [isOwner]);

    const handleVerifyAlumni = async (userId, currentVerifiedState) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isVerified: !currentVerifiedState
            });
            setSystemUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentVerifiedState } : u));
        } catch(e) {
            console.error("Error toggling verification:", e);
            alert("Failed to update verification state.");
        }
    };

    const exportToCSV = () => {
        if (!students || students.length === 0) return;
        
        const headers = ["Registration", "Name", "Course", "Center", "Village/Address", "Admission Date", "Total Fees", "Registration Fee", "Paid Fees", "Arrears", "Status", "Is High Risk Defaulter"];
        let csvRows = [headers.join(",")];
        
        students.forEach(s => {
            const stuTotalPaidAllTime = (s.paidFees || 0) + (s.oldPaidFees || 0);
            const stuArrears = Math.max(0, (s.totalFees || 0) - stuTotalPaidAllTime);
            const expiryInfo = calculateCourseExpiry(s);
            const isHighRisk = expiryInfo?.isCompleted && stuArrears > ((s.totalFees || 0) * 0.3);
            
            const row = [
                s.registration || '',
                `"${s.fullName || ''}"`,
                `"${s.course || ''}"`,
                s.center || 'Nariyawal',
                `"${normalizeAddress(s.address)}"`,
                s.admissionDate || '',
                s.totalFees || 0,
                s.registrationFee || 0,
                stuTotalPaidAllTime,
                stuArrears,
                s.status || 'unpaid',
                isHighRisk ? 'YES' : 'NO'
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `student_analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const monthOptions = useMemo(() => {
        const opts = [{ value: 'all', label: 'Global (All Time)' }];
        const now = new Date();
        for(let i=0; i<24; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            const label = d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
            opts.push({ value: val, label });
        }
        return opts;
    }, []);

    // Pro-Level Analytics Engine (Power BI Style)
    const analytics = useMemo(() => {
        if (!students.length) return null;

        let totalRevenue = 0;
        let totalRegistrationFees = 0;
        let totalArrears = 0;
        let totalEnrolled = 0;
        let totalBilled = 0; 
        
        let branchStats = { Nariyawal: { rev: 0, arr: 0, stu: 0 }, Thiriya: { rev: 0, arr: 0, stu: 0 } };
        let courseRevenue = {};
        let addressDistribution = {};
        let defaulters = [];
        let highRiskCount = 0;
        let projectedPipeline = 0; 
        let badDebtRisk = 0; 
        let activeStudentsCount = 0;
        
        let monthlyTrends = {}; 

        students.forEach(s => {
            const branch = s.center || 'Nariyawal';
            const normalizedAddr = normalizeAddress(s.address);
            
            // Branch & Address Filtering
            if (selectedCenter !== 'all' && branch.toLowerCase() !== selectedCenter.toLowerCase()) return;
            if (addressFilter !== 'all' && normalizedAddr !== addressFilter) return;

            const course = s.course || 'Unknown';
            const admMonth = parseDateToYYYYMM(s.admissionDate);
            const expiryInfo = calculateCourseExpiry(s);
            const regFee = Number(s.registrationFee) || 0;

            if (!addressDistribution[normalizedAddr]) {
                addressDistribution[normalizedAddr] = { name: normalizedAddr, revenue: 0, students: 0 };
            }

            if (admMonth && !monthlyTrends[admMonth]) {
                monthlyTrends[admMonth] = { month: admMonth, Admissions: 0, Revenue: 0, RegistrationFees: 0 };
            }

            let stuTotalPaidAllTime = (s.paidFees || 0) + (s.oldPaidFees || 0);
            const stuTotalBilledAllTime = (s.totalFees || 0); 
            // Note: Total Billed usually includes admission fee if user entered it that way, 
            // but we'll assume totalFees is the course fee, and admissionFee is extra or part of it.
            const stuArrearsAllTime = Math.max(0, stuTotalBilledAllTime - stuTotalPaidAllTime);

            if (selectedMonth === 'all') {
                totalEnrolled++;
                totalRegistrationFees += regFee;
                // Add registration fee to total revenue (assuming totalPaidAllTime doesn't include it if it's stored separately)
                const stuTotalRevenue = stuTotalPaidAllTime + regFee;
                
                totalRevenue += stuTotalRevenue;
                totalArrears += stuArrearsAllTime;
                totalBilled += (stuTotalBilledAllTime + regFee);

                if (!expiryInfo?.isCompleted) activeStudentsCount++;

                if (branchStats[branch]) {
                    branchStats[branch].stu++;
                    branchStats[branch].rev += stuTotalRevenue;
                    branchStats[branch].arr += stuArrearsAllTime;
                }
                
                courseRevenue[course] = (courseRevenue[course] || 0) + stuTotalRevenue;
                addressDistribution[normalizedAddr].revenue += stuTotalRevenue;
                addressDistribution[normalizedAddr].students += 1;

                if (admMonth) {
                    monthlyTrends[admMonth].Admissions += 1;
                    monthlyTrends[admMonth].RegistrationFees += regFee;
                    // Installments are distributed across months below, but for 'all' we just aggregate trends accurately
                }

                if (stuArrearsAllTime > 0) {
                    const isHighRisk = expiryInfo?.isCompleted && stuArrearsAllTime > (stuTotalBilledAllTime * 0.3);
                    if (isHighRisk) highRiskCount++;
                    if (expiryInfo?.isCompleted) badDebtRisk += stuArrearsAllTime;
                    else projectedPipeline += stuArrearsAllTime;

                    defaulters.push({ 
                        ...s, pending: stuArrearsAllTime, paidInPeriod: stuTotalPaidAllTime, isHighRisk
                    });
                }

            } else {
                // Month Specific Calculation
                const isAdmittedThisMonth = admMonth === selectedMonth;
                
                let paidThisMonth = 0;
                let regFeeThisMonth = 0;

                if (isAdmittedThisMonth) {
                    totalEnrolled++;
                    totalBilled += (stuTotalBilledAllTime + regFee);
                    regFeeThisMonth = regFee;
                    totalRegistrationFees += regFee;
                    if (branchStats[branch]) branchStats[branch].stu++;
                    addressDistribution[normalizedAddr].students += 1;
                }

                if (!expiryInfo?.isCompleted) activeStudentsCount++;

                if (s.installments && s.installments.length > 0) {
                    s.installments.forEach(inst => {
                        const instMonth = parseDateToYYYYMM(inst.date);
                        if (instMonth === selectedMonth) paidThisMonth += (Number(inst.amount) || 0);
                    });
                } else if (isAdmittedThisMonth) {
                    // Legacy records: Assume oldPaidFees were paid at admission month
                    paidThisMonth += (Number(s.oldPaidFees) || 0);
                }

                const totalRevThisMonth = paidThisMonth + regFeeThisMonth;
                totalRevenue += totalRevThisMonth;
                
                courseRevenue[course] = (courseRevenue[course] || 0) + totalRevThisMonth;
                addressDistribution[normalizedAddr].revenue += totalRevThisMonth;

                if (branchStats[branch]) branchStats[branch].rev += totalRevThisMonth;
                
                if (admMonth && admMonth <= selectedMonth) {
                    totalArrears += stuArrearsAllTime;
                    if (branchStats[branch]) branchStats[branch].arr += stuArrearsAllTime;

                    if (stuArrearsAllTime > 0) {
                        const isHighRisk = expiryInfo?.isCompleted && stuArrearsAllTime > (stuTotalBilledAllTime * 0.3);
                        if (isHighRisk) highRiskCount++;
                        defaulters.push({ ...s, pending: stuArrearsAllTime, paidInPeriod: paidThisMonth, isHighRisk });
                    }
                }
            }
        });

        // Calculate Monthly Payers explicitly
        let monthlyPayers = [];
        if (selectedMonth !== 'all') {
            students.forEach(s => {
                const branch = s.center || 'Nariyawal';
                if (selectedCenter !== 'all' && branch.toLowerCase() !== selectedCenter.toLowerCase()) return;
                
                let paidThisMonth = 0;
                
                // Removed Registration Fee from this section as per request
                const admMonth = parseDateToYYYYMM(s.admissionDate);
                
                // Installments
                if (s.installments && s.installments.length > 0) {
                    s.installments.forEach(inst => {
                        if (parseDateToYYYYMM(inst.date) === selectedMonth) paidThisMonth += (Number(inst.amount) || 0);
                    });
                } else if (admMonth === selectedMonth) {
                    paidThisMonth += (Number(s.oldPaidFees) || 0);
                }

                if (paidThisMonth > 0) {
                    monthlyPayers.push({
                        ...s,
                        paidThisMonth
                    });
                }
            });
            // Sort by amount descending
            monthlyPayers.sort((a,b) => b.paidThisMonth - a.paidThisMonth);
        }

        // Now populate trend data installments accurately for 'All Time' view
        if (selectedMonth === 'all') {
            students.forEach(s => {
                const admMonth = parseDateToYYYYMM(s.admissionDate);
                if (s.installments && s.installments.length > 0) {
                    s.installments.forEach(inst => {
                        const instMonth = parseDateToYYYYMM(inst.date);
                        if (instMonth && monthlyTrends[instMonth]) {
                            monthlyTrends[instMonth].Revenue += (Number(inst.amount) || 0);
                        } else if (instMonth) {
                            monthlyTrends[instMonth] = { month: instMonth, Admissions: 0, Revenue: (Number(inst.amount) || 0), RegistrationFees: 0 };
                        }
                    });
                } else if (admMonth && monthlyTrends[admMonth]) {
                    monthlyTrends[admMonth].Revenue += (Number(s.oldPaidFees) || 0);
                }
            });
            // Add registration fees to Revenue trends
            Object.values(monthlyTrends).forEach(mt => {
                mt.Revenue += mt.RegistrationFees;
            });
        }

        const branchData = Object.keys(branchStats).map(k => ({
            name: k, Revenue: branchStats[k].rev, Arrears: branchStats[k].arr, Students: branchStats[k].stu
        }));

        const courseData = Object.keys(courseRevenue).map(k => ({ name: k, value: courseRevenue[k] })).sort((a,b) => b.value - a.value);
        const addressData = Object.values(addressDistribution).filter(a => a.students > 0).sort((a,b) => b.revenue - a.revenue);
        const trendData = Object.values(monthlyTrends).sort((a,b) => a.month.localeCompare(b.month)).slice(-12);

        defaulters.sort((a,b) => {
            if (a.isHighRisk && !b.isHighRisk) return -1;
            if (!a.isHighRisk && b.isHighRisk) return 1;
            return b.pending - a.pending;
        });

        const recoveryRate = totalBilled > 0 ? ((totalRevenue / totalBilled) * 100).toFixed(1) : 0;

        // Alumni Analytics Calculation
        const alumniList = systemUsers.filter(u => u.role === 'alumni');
        const totalAlumniCount = alumniList.length;
        const verifiedAlumniCount = alumniList.filter(u => u.isVerified).length;
        const placedAlumniCount = alumniList.filter(u => u.company && u.company.trim() !== '').length;
        const placementRate = totalAlumniCount > 0 ? ((placedAlumniCount / totalAlumniCount) * 100).toFixed(0) : 0;

        return {
            totalRevenue, totalRegistrationFees, totalArrears, totalEnrolled, activeStudentsCount,
            branchData, courseData, addressData, trendData, recoveryRate,
            defaulters: defaulters.slice(0, 50),
            monthlyPayers,
            highRiskCount, projectedPipeline, badDebtRisk,
            alumniStats: {
                alumniList,
                totalAlumniCount,
                verifiedAlumniCount,
                placedAlumniCount,
                placementRate
            }
        };
    }, [students, systemUsers, selectedMonth, selectedCenter, addressFilter]);

    if (!isOwner) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <div className="text-center">
                    <ShieldCheck size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-black text-white uppercase">Classified Access Only</h2>
                    <p className="text-slate-400 font-bold mt-2">Level 4 Clearance Required.</p>
                </div>
            </div>
        );
    }

    if (loading || !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <div className="text-center animate-pulse">
                    <BarChart3 size={40} className="mx-auto text-blue-500 mb-4" />
                    <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">Compiling Intelligence...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] pt-28 pb-20 font-inter text-slate-200 selection:bg-blue-500/30">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                
                {/* Header & Power BI style Filters */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <button onClick={() => navigate('/admin/coaching')} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors">
                            <ChevronLeft size={14} /> Directory
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                            Business <span className="text-blue-500">Intelligence</span>
                        </h1>
                        <p className="text-slate-400 font-bold mt-1">Deep Level Financial & Demographic Analysis.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-[#1e293b] border border-slate-700/50 p-2 rounded-xl flex items-center shadow-lg w-full md:w-auto">
                            <Building size={16} className="text-blue-400 ml-2" />
                            <select 
                                value={selectedCenter}
                                onChange={(e) => setSelectedCenter(e.target.value)}
                                className="bg-transparent border-none text-white font-black outline-none px-3 py-1.5 cursor-pointer uppercase text-[10px] tracking-wider w-full"
                            >
                                <option value="all">All Centers (HQ + Branch)</option>
                                <option value="nariyawal">HQ: Nariyawal</option>
                                <option value="thiriya">Branch: Thiriya</option>
                            </select>
                        </div>

                        <div className="bg-[#1e293b] border border-slate-700/50 p-2 rounded-xl flex items-center shadow-lg w-full md:w-auto">
                            <Calendar size={16} className="text-blue-400 ml-2" />
                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none text-white font-black outline-none px-3 py-1.5 cursor-pointer uppercase text-[10px] tracking-wider w-full"
                            >
                                {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        <button onClick={exportToCSV} className="w-full md:w-auto justify-center px-6 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/50 flex items-center gap-2 hover:bg-blue-500 transition-all active:scale-95">
                            <Download size={14} /> Export Report
                        </button>
                    </div>
                </div>

                {/* BI Dashboard Grid Top Level Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
                    {/* Gross Revenue */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Wallet size={16} /></div>
                            <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Gross</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedMonth === 'all' ? 'Total Revenue (Inc. Adm)' : 'Revenue This Month'}</p>
                            <h3 className="text-3xl font-black text-white truncate">₹{analytics.totalRevenue.toLocaleString('en-IN')}</h3>
                        </div>
                    </motion.div>

                    {/* Registration Fees Component */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#1e293b] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><TrendingUp size={16} /></div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Fees</p>
                            <h3 className="text-2xl font-black text-white truncate">₹{analytics.totalRegistrationFees.toLocaleString('en-IN')}</h3>
                            <p className="text-[9px] text-blue-400 font-bold mt-1 uppercase tracking-wider">One-time Injection</p>
                        </div>
                    </motion.div>
                    
                    {/* Recovery Rate */}
                    <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Activity size={16} /></div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recovery Rate</p>
                            <h3 className="text-2xl font-black text-white truncate">{analytics.recoveryRate}%</h3>
                            <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${analytics.recoveryRate}%`}}></div>
                            </div>
                        </div>
                    </div>

                    {/* Expected Pipeline */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#1e293b] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg"><Zap size={16} /></div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pipeline (Arrears)</p>
                            <h3 className="text-2xl font-black text-white truncate">₹{analytics.projectedPipeline.toLocaleString('en-IN')}</h3>
                        </div>
                    </motion.div>

                    {/* Enrollment Data */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-5 rounded-2xl border border-blue-500/30 shadow-xl shadow-blue-900/20 relative overflow-hidden">
                        <Users size={80} className="absolute -right-4 -bottom-4 opacity-20 text-white" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-2 bg-white/20 text-white rounded-lg backdrop-blur-sm"><Users size={16} /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">{selectedMonth === 'all' ? 'Total Admitted' : 'New Admissions'}</p>
                            <h3 className="text-3xl font-black text-white truncate">{analytics.totalEnrolled}</h3>
                        </div>
                    </div>

                    {/* App Installations */}
                    <div className="bg-gradient-to-br from-cyan-600 to-blue-900 p-5 rounded-2xl border border-cyan-500/30 shadow-xl shadow-cyan-900/20 relative overflow-hidden">
                        <Smartphone size={80} className="absolute -right-4 -bottom-4 opacity-20 text-white" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-2 bg-white/20 text-white rounded-lg backdrop-blur-sm"><Smartphone size={16} /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-cyan-200 uppercase tracking-widest mb-1">App Installations</p>
                            <h3 className="text-3xl font-black text-white truncate">{appInstalls}</h3>
                        </div>
                    </div>
                </div>

                {/* Monthly Payers Section (Only visible if month is selected) */}
                <AnimatePresence>
                    {selectedMonth !== 'all' && analytics.monthlyPayers && analytics.monthlyPayers.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#1e293b] p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl mb-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><Wallet size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Course Fee Collections for {monthOptions.find(m => m.value === selectedMonth)?.label}</h3>
                                    <p className="text-slate-400 font-bold text-xs">Total: <span className="text-emerald-400">₹{analytics.monthlyPayers.reduce((acc, curr) => acc + curr.paidThisMonth, 0).toLocaleString('en-IN')}</span> collected (excluding registration fees) from {analytics.monthlyPayers.length} students.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {analytics.monthlyPayers.map((payer, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={idx} 
                                        onClick={() => navigate(`/admin/coaching/student/${payer.id}`)}
                                        className="p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/50 transition-all cursor-pointer flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-900 text-slate-300 rounded-xl flex items-center justify-center font-black text-sm shadow-inner">
                                                {payer.fullName?.charAt(0) || '#'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{payer.fullName}</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{payer.registration}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-400">₹{payer.paidThisMonth.toLocaleString('en-IN')}</p>
                                            <span className="text-[8px] font-bold text-emerald-400/50 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full">Paid</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Middle Charts Grid (BI Style) */}
                <div className="grid grid-cols-1 gap-6 mb-6">
                    {/* Growth Velocity & Revenue Timeline */}
                    <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 flex flex-col min-h-[400px] h-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp size={16} className="text-blue-400" />
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Revenue Velocity (Last 12 Mo)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v/1000}k`} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Bar yAxisId="left" dataKey="RegistrationFees" fill="#8b5cf6" barSize={20} radius={[4, 4, 0, 0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Course Popularity */}
                    <div className="xl:col-span-1 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 flex flex-col min-h-[400px] h-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChartIcon size={16} className="text-purple-400" />
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Course Revenue Share</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.courseData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v/1000}k`} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#f8fafc', fontWeight: 700 }} width={80} />
                                    <RechartsTooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }} />
                                    <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]}>
                                        {analytics.courseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Defaulters Data Table (Power BI Matrix style) */}
                    <div className="xl:col-span-2 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 flex flex-col min-h-[400px] h-auto">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Defaulter Matrix</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase">Bad Debt Risk</p>
                                    <p className="text-sm font-black text-red-400">₹{analytics.badDebtRisk.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                            {analytics.defaulters.map((d, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => navigate(`/admin/coaching/student/${d.id}`)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-row items-center justify-between gap-3 ${
                                        d.isHighRisk 
                                        ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20" 
                                        : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${d.isHighRisk ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                                            {d.fullName?.charAt(0) || '#'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-xs">{d.fullName}</h4>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">{d.registration} • {normalizeAddress(d.address)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Collected</p>
                                            <p className="text-xs font-black text-emerald-400">₹{d.paidInPeriod || 0}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Arrears</p>
                                            <p className={`text-sm font-black ${d.isHighRisk ? 'text-red-400' : 'text-amber-400'}`}>₹{d.pending}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {analytics.defaulters.length === 0 && (
                                <div className="text-center py-10">
                                    <ShieldCheck size={32} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No outstanding balances.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ByteCore Alumni & Placement Matrix Section */}
                <div className="mt-10 bg-[#1e293b] p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Award size={20} className="text-amber-400" />
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">ByteCore Alumni & Placement Matrix</h3>
                            </div>
                            <p className="text-xs font-bold text-slate-400">Track career outcomes, company placements, and verify alumni credentials.</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="px-4 py-2 bg-slate-800 rounded-2xl border border-slate-700 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Alumni</p>
                                <p className="text-lg font-black text-white">{analytics.alumniStats.totalAlumniCount}</p>
                            </div>
                            <div className="px-4 py-2 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-center">
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Placement Rate</p>
                                <p className="text-lg font-black text-emerald-400">{analytics.alumniStats.placementRate}%</p>
                            </div>
                            <div className="px-4 py-2 bg-blue-950/40 border border-blue-800/40 rounded-2xl text-center">
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Verified Alumni</p>
                                <p className="text-lg font-black text-blue-400">{analytics.alumniStats.verifiedAlumniCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="py-3 px-4">Alumni Name</th>
                                    <th className="py-3 px-4">Batch / Course</th>
                                    <th className="py-3 px-4">Company</th>
                                    <th className="py-3 px-4">CTC / Package</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-xs">
                                {analytics.alumniStats.alumniList.map((alumni) => (
                                    <tr key={alumni.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-white uppercase overflow-hidden">
                                                {alumni.photoURL ? (
                                                    <img src={alumni.photoURL} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    alumni.displayName?.[0] || 'A'
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{alumni.displayName || 'Unnamed Alumni'}</p>
                                                <p className="text-[10px] text-slate-400 font-normal">{alumni.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-slate-300">
                                            {alumni.course || 'N/A'} {alumni.batch ? `(${alumni.batch})` : ''}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-blue-400">
                                            {alumni.company ? (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase size={12} /> {alumni.company}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 font-normal italic">Unspecified</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-emerald-400">
                                            {alumni.currentSalary || 'N/A'}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {alumni.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                                                    <CheckCircle size={10} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase">
                                                    Pending Verification
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => handleVerifyAlumni(alumni.id, alumni.isVerified)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                                    alumni.isVerified
                                                        ? "bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                                                }`}
                                            >
                                                {alumni.isVerified ? "Revoke Badge" : "Verify Badge"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {analytics.alumniStats.alumniList.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            No alumni profiles registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
