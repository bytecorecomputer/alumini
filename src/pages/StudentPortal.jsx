import { useEffect, useState } from "react";
import { db } from "../firebase/firestore";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { uploadToCloudinary } from "../lib/cloudinary";
import { compressImage } from "../lib/imageCompression";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, MapPin, Phone, GraduationCap,
    CheckCircle2, AlertCircle,
    BookOpen, History, User, LogOut, Wallet, Camera,
    LayoutDashboard, CheckSquare, Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";
import QuizModule from "../components/student/QuizModule";

export default function StudentPortal() {
    const [student, setStudent] = useState(() => {
        const session = localStorage.getItem('student_session');
        return session ? JSON.parse(session) : null;
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
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
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20 font-inter selection:bg-blue-100 selection:text-blue-900">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-50/40 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
                {/* Modern Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 text-slate-500 shadow-sm text-[10px] font-black uppercase tracking-widest mb-4">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Bytecore Student Portal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-2">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{student.fullName?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg max-w-md">Your personalized dashboard for academics, finance, and skill growth.</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white text-slate-600 font-black text-xs uppercase tracking-widest border border-slate-100 shadow-xl shadow-slate-200/50 hover:bg-slate-900 hover:text-white transition-all group active:scale-95"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Log Out
                    </button>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 md:gap-4 mb-10 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                    <TabButton
                        id="overview"
                        label="Overview"
                        icon={<LayoutDashboard size={18} />}
                        active={activeTab}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="fees"
                        label="Financials"
                        icon={<Wallet size={18} />}
                        active={activeTab}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="quiz"
                        label="Learning Hub"
                        icon={<Sparkles size={18} />}
                        active={activeTab}
                        onClick={setActiveTab}
                        badge="New"
                    />
                </div>

                {/* Active Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Profile Identity Card */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="premium-card bg-white p-8 md:p-10 border border-slate-100 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                            <User size={200} />
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                            {/* Photo Box */}
                                            <div className="relative group shrink-0">
                                                <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-200/50 ring-4 ring-white relative z-10">
                                                    {student.photoUrl ? (
                                                        <img src={student.photoUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                                            <User size={48} />
                                                        </div>
                                                    )}
                                                </div>
                                                <label htmlFor="upload-photo" className="absolute -bottom-4 -right-4 h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-600 transition-colors z-20 hover:scale-110 active:scale-95">
                                                    <Camera size={20} />
                                                </label>
                                                <input
                                                    type="file"
                                                    id="upload-photo"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        // Simple Loader Handling could be added here
                                                        if (confirm("Upload new profile photo?")) {
                                                            try {
                                                                const compressed = await compressImage(file, 50);
                                                                const url = await uploadToCloudinary(compressed);
                                                                await updateDoc(doc(db, "students", student.registration), {
                                                                    photoUrl: url,
                                                                    updatedAt: Date.now()
                                                                });
                                                            } catch (err) {
                                                                alert("Failed to upload");
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-6 flex-1">
                                                <div>
                                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{student.fullName}</h2>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Badge>{student.course}</Badge>
                                                        <Badge variant="outline">Reg: {student.registration}</Badge>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <InfoRow icon={<Phone size={16} />} label="Mobile" value={student.mobile} />
                                                    <InfoRow icon={<Calendar size={16} />} label="Joined" value={student.admissionDate || 'N/A'} />
                                                    <InfoRow icon={<MapPin size={16} />} label="Location" value={student.address} />
                                                    <InfoRow icon={<User size={16} />} label="Father" value={student.fatherName} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Quick Stats */}
                                <div className="space-y-6">
                                    <div className="premium-card bg-slate-900 text-white p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20" />
                                        <h3 className="text-xl font-black mb-4">Current Status</h3>
                                        <div className="flex items-center gap-4 mb-8">
                                            {student.status === 'pass' ? (
                                                <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50">
                                                    <CheckSquare size={32} />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/50">
                                                    <Sparkles size={32} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-2xl font-black tracking-tight">
                                                    {student.status === 'pass' ? 'Alumni' : 'Active Student'}
                                                </p>
                                                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
                                                    {student.status === 'pass' ? 'Course Completed' : 'In Progress'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[70%]" /> {/* Fake progress for visual */}
                                        </div>
                                        <p className="text-right text-[10px] text-white/40 mt-2 font-mono">ID: {student.registration}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'fees' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="premium-card bg-white p-8 border border-slate-100 h-full">
                                        <h3 className="text-xl font-black text-slate-900 mb-6">Summary</h3>
                                        <div className="space-y-6">
                                            <FeeStat label="Total Course Fee" amount={student.totalFees} color="slate" />
                                            <FeeStat label="Amount Paid" amount={student.paidFees} color="green" />
                                            <div className="h-px bg-slate-100" />
                                            <FeeStat label="Pending Dues" amount={remainingFees} color="red" />
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <div className="flex justify-between text-xs font-black uppercase text-slate-400 mb-2">
                                                <span>Completion</span>
                                                <span>{feePercentage}%</span>
                                            </div>
                                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${feePercentage}%` }}
                                                    className={cn("h-full rounded-full shadow-sm",
                                                        feePercentage === 100 ? "bg-emerald-500" : "bg-blue-600"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="premium-card bg-white p-8 border border-slate-100 min-h-[500px]">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                <History size={20} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">Payment History</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {student.installments && student.installments.length > 0 ? (
                                                student.installments.map((inst, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={i}
                                                        className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-blue-50/50 border border-transparent hover:border-blue-100 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                                                <CheckCircle2 size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900">Payment Received</p>
                                                                <p className="text-xs font-bold text-slate-400">{inst.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-lg text-slate-900">₹{inst.amount}</p>
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Paid</span>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                                    <Wallet size={48} className="mb-4 text-slate-300" />
                                                    <p className="font-bold text-slate-400">No transactions found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'quiz' && (
                            <div className="premium-card bg-white p-6 md:p-10 border border-slate-100 min-h-[600px] flex flex-col">
                                <QuizModule student={student} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Sub Components ---

function TabButton({ id, label, icon, active, onClick, badge }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap",
                isActive
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105"
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
            )}
        >
            {icon}
            {label}
            {badge && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] rounded-md animate-pulse">
                    {badge}
                </span>
            )}
        </button>
    );
}

function Badge({ children, variant = 'default' }) {
    return (
        <span className={cn(
            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
            variant === 'outline' ? "border border-slate-200 text-slate-500" : "bg-blue-50 text-blue-600"
        )}>
            {children}
        </span>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="text-slate-400">{icon}</div>
            <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function FeeStat({ label, amount, color }) {
    const colors = {
        slate: "text-slate-900",
        green: "text-emerald-600",
        red: "text-red-500"
    };

    return (
        <div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
            <p className={cn("text-2xl font-black tracking-tighter", colors[color])}>
                ₹{amount?.toLocaleString()}
            </p>
        </div>
    );
}
