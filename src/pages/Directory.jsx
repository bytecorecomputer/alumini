import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, GraduationCap, Award, User, Linkedin, Github, Edit, Shield, ArrowRight, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Directory() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedUsers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching directory:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.course?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Premium Header */}
                <div className="text-center mb-24 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10 animate-pulse"></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-5 py-2 mb-8 rounded-full bg-white text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] border border-blue-50 shadow-xl shadow-blue-100/50"
                    >
                        Community Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-none"
                    >
                        Network <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed"
                    >
                        Precision access to the global collective. Connect with verified fellows, industry leaders, and academic stalwarts.
                    </motion.p>
                </div>

                {/* Refined Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-[2.5rem] p-6 mb-20 sticky top-28 z-[40] max-w-5xl mx-auto shadow-2xl shadow-slate-200/40 border-white/60"
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative flex-grow group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by identity, affiliation, or skill set..."
                                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder-slate-400 font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex p-2 bg-slate-50 rounded-2xl border border-slate-100/50">
                            {['all', 'alumni', 'student'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setFilterRole(r)}
                                    className={cn(
                                        "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                        filterRole === r
                                            ? "bg-white text-slate-900 shadow-xl scale-100 border border-slate-100"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                                    )}
                                >
                                    {r === 'all' ? 'Universal' : r + 's'}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[400px] rounded-[3rem] bg-white animate-pulse border border-slate-50"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {filteredUsers.length === 0 ? (
                            <div className="col-span-full text-center py-40 rounded-[4rem] border-4 border-dashed border-slate-100">
                                <User size={80} className="mx-auto mb-8 text-slate-100" />
                                <h3 className="text-3xl font-black text-slate-900 mb-2">Zero Matches.</h3>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Adjust search parameters for re-scan.</p>
                            </div>
                        ) : (
                            filteredUsers.map((profile, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i % 3) * 0.1 }}
                                    key={profile.id}
                                    className="premium-card group h-full flex flex-col bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/50"
                                >
                                    <div className="p-10 flex-grow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent -z-10 rounded-bl-full opacity-50"></div>

                                        <div className="flex justify-between items-start mb-8">
                                            <div className="relative">
                                                <div className="h-28 w-28 rounded-[2.5rem] bg-slate-50 p-2 shadow-inner ring-4 ring-white group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                                    {profile.photoURL ? (
                                                        <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover rounded-[2rem]" />
                                                    ) : (
                                                        <div className="h-full w-full bg-slate-900 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white italic">
                                                            {profile.displayName?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-4 border-white shadow-lg",
                                                    profile.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                                )} />
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <RoleBadge role={profile.role} />
                                                {profile.batch && <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Class of {profile.batch}</span>}
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                                            {profile.displayName || "Anonymous Entity"}
                                        </h3>
                                        <p className="text-slate-400 font-bold text-sm mb-10 leading-relaxed line-clamp-2 h-10">
                                            {profile.headline || "Passionate about building the future of our ecosystem."}
                                        </p>

                                        <div className="space-y-4 pt-10 border-t-2 border-slate-50">
                                            {profile.company && (
                                                <div className="flex items-center gap-5">
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm shadow-blue-100">
                                                        <Briefcase size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Affiliation</p>
                                                        <span className="font-black text-slate-700 text-sm tracking-tight">{profile.company}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-10 pt-0 flex flex-col gap-6">
                                        <div className="flex gap-4">
                                            {currentUser?.uid === profile.id ? (
                                                <button
                                                    onClick={() => navigate('/profile')}
                                                    className="flex-1 btn-premium px-6 py-4 bg-slate-900 text-white shadow-xl shadow-slate-200 text-xs uppercase tracking-widest active:scale-95"
                                                >
                                                    <User size={16} /> My Profile
                                                </button>
                                            ) : (['admin', 'super_admin'].includes(currentUser?.role)) ? (
                                                <button
                                                    onClick={() => navigate('/admin')}
                                                    className="flex-1 btn-premium px-6 py-4 bg-purple-600 text-white shadow-xl shadow-purple-100 text-xs uppercase tracking-widest active:scale-95"
                                                >
                                                    <Shield size={16} /> Governance
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => alert("Public profiles coming soon!")}
                                                    className="flex-1 btn-premium px-6 py-4 bg-white text-slate-900 border-2 border-slate-50 shadow-xl shadow-slate-100 text-xs uppercase tracking-widest active:scale-95 group/btn"
                                                >
                                                    Establish Link <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex gap-6 text-slate-300">
                                                {profile.linkedin && (
                                                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-all hover:scale-110">
                                                        <Linkedin size={20} />
                                                    </a>
                                                )}
                                                {profile.github && (
                                                    <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-all hover:scale-110">
                                                        <Github size={20} />
                                                    </a>
                                                )}
                                            </div>
                                            {profile.location && (
                                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    <MapPin size={12} className="text-slate-200" /> {profile.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function RoleBadge({ role }) {
    const variants = {
        admin: "bg-purple-50 text-purple-600 border-purple-100",
        super_admin: "bg-slate-900 text-white border-slate-950 shadow-xl shadow-slate-200",
        alumni: "bg-amber-50 text-amber-600 border-amber-100",
        student: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };

    return (
        <span className={cn(
            "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
            variants[role] || "bg-slate-100 text-slate-500 border-slate-200"
        )}>
            {role?.replace('_', ' ')}
        </span>
    );
}
