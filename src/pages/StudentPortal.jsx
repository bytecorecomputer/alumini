import { useEffect, useState } from "react";
import { db } from "../firebase/firestore";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { uploadToCloudinary } from "../lib/cloudinary";
import { compressImage } from "../lib/imageCompression";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar, MapPin, Phone, GraduationCap,
    CheckCircle2, AlertCircle,
    BookOpen, History, User, LogOut, Wallet, Camera, Loader2
} from "lucide-react";
import { cn } from "../lib/utils";

export default function StudentPortal() {
    const [student, setStudent] = useState(() => {
        const session = localStorage.getItem('student_session');
        return session ? JSON.parse(session) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!student) {
            navigate('/login');
            return;
        }

        // Listen for real-time updates from Firestore
        const unsub = onSnapshot(doc(db, "students", student.registration), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setStudent(prev => ({ ...prev, ...data }));
                localStorage.setItem('student_session', JSON.stringify(data));
            }
            setLoading(false);
        });

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, student?.registration]);

    const handleLogout = () => {
        localStorage.removeItem('student_session');
        navigate('/login');
    };

    if (loading || !student) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-16 w-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center text-white"
                >
                    <GraduationCap size={32} />
                </motion.div>
            </div>
        );
    }

    const feePercentage = Math.round((student.paidFees / student.totalFees) * 100) || 0;
    const remainingFees = student.totalFees - student.paidFees;

    return (
        <div className="min-h-screen bg-[#fcfdfe] pt-24 pb-20 font-inter">
            {/* Header / Navigation Overlay */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Student Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            Welcome, <span className="text-blue-600">{student.fullName?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2">Manage your course, fees, and academic profile.</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-slate-600 font-black text-xs uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Logout Session
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile & Info */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Identity Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="premium-card bg-slate-900 p-8 text-white relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <GraduationCap size={120} />
                            </div>

                            <div className="relative z-10">
                                <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/20 overflow-hidden relative group">
                                    {student.photoUrl ? (
                                        <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-blue-400" />
                                    )}
                                    <label htmlFor="portal-photo" className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="text-white" size={20} />
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="portal-photo"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setLoading(true);
                                            try {
                                                const compressed = await compressImage(file, 50);
                                                const url = await uploadToCloudinary(compressed);
                                                await updateDoc(doc(db, "students", student.registration), {
                                                    photoUrl: url,
                                                    updatedAt: Date.now()
                                                });
                                            } catch (err) {
                                                alert("Update failed: " + err.message);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    />
                                </div>
                                <h3 className="text-2xl font-black mb-1 tracking-tight">{student.fullName}</h3>
                                <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Registration: {student.registration}</p>

                                <div className="space-y-4">
                                    <InfoItem icon={<BookOpen size={16} />} label="Course" value={student.course} isDark />
                                    <InfoItem icon={<Calendar size={16} />} label="Joined" value={student.admissionDate} isDark />
                                    <InfoItem icon={<Phone size={16} />} label="Contact" value={student.mobile} isDark />
                                    <InfoItem icon={<MapPin size={16} />} label="Location" value={student.address} isDark />
                                </div>
                            </div>
                        </motion.div>

                        {/* Status Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="premium-card bg-white p-6 border border-slate-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Status</p>
                                    <div className="flex items-center gap-2">
                                        {student.status === 'pass' ? (
                                            <>
                                                <CheckCircle2 size={18} className="text-emerald-500" />
                                                <span className="font-black text-emerald-600 uppercase tracking-tight text-lg">Completed</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={18} className="text-amber-500" />
                                                <span className="font-black text-amber-600 uppercase tracking-tight text-lg">Active Session</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <GraduationCap size={24} />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Fees & History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Financial Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card bg-white p-8 md:p-10 border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fee Architecture</h3>
                                    <p className="text-slate-400 font-bold text-sm">Real-time financial synchronization.</p>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Wallet size={24} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <StatItem label="Total Investment" value={`₹${student.totalFees}`} color="slate" />
                                <StatItem label="Paid Amount" value={`₹${student.paidFees}`} color="blue" />
                                <StatItem label="Outstanding Balance" value={`₹${remainingFees}`} color="amber" />
                            </div>

                            <div className="relative pt-2">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Progression</span>
                                    <span className="text-lg font-black text-blue-600">{feePercentage}%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${feePercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-200"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="premium-card bg-white p-8 md:p-10 border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                                        <History size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Transaction Timeline</h3>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {student.installments && student.installments.length > 0 ? (
                                    student.installments.map((inst, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i}
                                            className="flex justify-between items-start p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 hover:bg-white/60 transition-all group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                                    <Wallet size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Receipt Confirmed</p>
                                                        {inst.installmentNo && (
                                                            <span className="px-2 py-0.5 bg-blue-100/50 text-blue-600 text-[8px] font-black rounded-lg uppercase tracking-tighter">Inst. #{inst.installmentNo}</span>
                                                        )}
                                                    </div>
                                                    <p className="font-black text-slate-900 leading-none mb-2">{inst.date}</p>
                                                    {inst.note && (
                                                        <p className="text-[10px] text-slate-500 italic font-medium max-w-xs">{inst.note}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900 tracking-tighter">₹{inst.amount}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 px-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                        <p className="text-slate-400 font-bold text-sm">No transaction records detected in the system.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value, isDark }) {
    return (
        <div className="flex items-center gap-4">
            <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                isDark ? "bg-white/10 text-white/70" : "bg-slate-50 text-slate-400"
            )}>
                {icon}
            </div>
            <div>
                <p className={cn("text-[9px] font-black uppercase tracking-widest leading-none mb-1", isDark ? "text-white/40" : "text-slate-400")}>{label}</p>
                <p className={cn("text-sm font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>{value || 'N/A'}</p>
            </div>
        </div>
    );
}

function StatItem({ label, value, color }) {
    const colors = {
        slate: "bg-slate-50 text-slate-900 border-slate-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    };

    return (
        <div className={cn("p-6 rounded-[2rem] border transition-all hover:scale-105", colors[color])}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
            <p className="text-2xl font-black tracking-tighter">{value}</p>
        </div>
    );
}
