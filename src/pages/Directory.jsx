import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Award, User, Linkedin, Github, Shield, ArrowRight, Zap, ExternalLink, CheckCircle2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getOptimizedUrl } from '../lib/cloudinary';

export default function Directory() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [selectedBatch, setSelectedBatch] = useState("all");
    const [selectedCompany, setSelectedCompany] = useState("all");

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
            console.error("Error fetching ByteCore directory:", error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique batches and companies for filters
    const { uniqueBatches, uniqueCompanies } = useMemo(() => {
        const batches = new Set();
        const companies = new Set();

        users.forEach(u => {
            if (u.batch) batches.add(u.batch);
            if (u.company) companies.add(u.company);
        });

        return {
            uniqueBatches: Array.from(batches).sort(),
            uniqueCompanies: Array.from(companies).sort()
        };
    }, [users]);

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            (user.displayName || "").toLowerCase().includes(searchLower) ||
            (user.company || "").toLowerCase().includes(searchLower) ||
            (user.course || "").toLowerCase().includes(searchLower) ||
            (user.skills && user.skills.some(s => s.toLowerCase().includes(searchLower)));

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesBatch = selectedBatch === 'all' || user.batch === selectedBatch;
        const matchesCompany = selectedCompany === 'all' || user.company === selectedCompany;

        return matchesSearch && matchesRole && matchesBatch && matchesCompany;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10 animate-pulse"></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-5 py-2 mb-6 rounded-full bg-white text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] border border-blue-50 shadow-xl shadow-blue-100/50"
                    >
                        ByteCore Computer Centre Network
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none"
                    >
                        ByteCore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Talent Hub.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed"
                    >
                        Connect with verified alumni, top-performing students, and skilled tech professionals trained at ByteCore Computer Centre.
                    </motion.p>
                </div>

                {/* Filter Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-[2.5rem] p-6 mb-16 sticky top-28 z-[40] max-w-5xl mx-auto shadow-2xl shadow-slate-200/40 border-white/60 space-y-4"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, company, course, or skills (e.g., React, Python)..."
                                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder-slate-400 font-bold shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 shrink-0 overflow-x-auto">
                            {[
                                { key: 'all', label: 'All Network' },
                                { key: 'alumni', label: 'Alumni' },
                                { key: 'student', label: 'Students' }
                            ].map((r) => (
                                <button
                                    key={r.key}
                                    onClick={() => setFilterRole(r.key)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                                        filterRole === r.key
                                            ? "bg-white text-slate-900 shadow-lg scale-100 border border-slate-100"
                                            : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Filters: Batch & Company */}
                    {(uniqueBatches.length > 0 || uniqueCompanies.length > 0) && (
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Filter size={12} /> Refine By:
                            </span>

                            {uniqueBatches.length > 0 && (
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="all">All Batches</option>
                                    {uniqueBatches.map(b => (
                                        <option key={b} value={b}>Batch {b}</option>
                                    ))}
                                </select>
                            )}

                            {uniqueCompanies.length > 0 && (
                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="all">All Companies</option>
                                    {uniqueCompanies.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            )}

                            {(selectedBatch !== 'all' || selectedCompany !== 'all' || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setSelectedBatch('all');
                                        setSelectedCompany('all');
                                        setSearchTerm('');
                                        setFilterRole('all');
                                    }}
                                    className="px-3 py-1.5 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-wider"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[400px] rounded-[3rem] bg-white animate-pulse border border-slate-50"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredUsers.length === 0 ? (
                            <div className="col-span-full text-center py-32 rounded-[3rem] border-4 border-dashed border-slate-200 bg-white">
                                <User size={64} className="mx-auto mb-4 text-slate-200" />
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No profiles found</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Try searching with different keywords or clearing filters.</p>
                            </div>
                        ) : (
                            filteredUsers.map((profile, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i % 3) * 0.05 }}
                                    key={profile.id}
                                    className="premium-card group h-full flex flex-col bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden"
                                >
                                    <div className="p-8 flex-grow relative">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="relative">
                                                <div className="h-24 w-24 rounded-full bg-slate-100 p-1.5 ring-4 ring-white group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-md">
                                                    {profile.photoURL ? (
                                                        <img src={getOptimizedUrl(profile.photoURL, 'w_300,h_300,c_fill,g_face,f_auto,q_auto')} alt={profile.displayName} className="h-full w-full object-cover rounded-full" />
                                                    ) : (
                                                        <div className="h-full w-full bg-slate-900 rounded-full flex items-center justify-center text-2xl font-black text-white italic">
                                                            {profile.displayName?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <RoleBadge role={profile.role} isVerified={profile.isVerified} />
                                                {profile.batch && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch {profile.batch}</span>}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                            {profile.displayName || "ByteCore Fellow"}
                                            {profile.role === 'alumni' && profile.isVerified && (
                                                <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                                            )}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-xs mb-6 leading-relaxed line-clamp-2 min-h-[32px]">
                                            {profile.headline || profile.course || "ByteCore Computer Centre Trainee"}
                                        </p>

                                        {/* Skills tags */}
                                        {profile.skills && profile.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-6">
                                                {profile.skills.slice(0, 4).map((skill, idx) => (
                                                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {profile.skills.length > 4 && (
                                                    <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold">
                                                        +{profile.skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-3 pt-6 border-t border-slate-100">
                                            {(profile.company || profile.currentSalary) && (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                                                        <Briefcase size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company & CTC</p>
                                                        <span className="font-bold text-slate-800 text-xs truncate block">
                                                            {profile.company || "Independent"} 
                                                            {profile.currentSalary && <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md">{profile.currentSalary}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {profile.portfolioUrl && (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                                                        <Zap size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Portfolio <Award size={10} className="text-amber-500"/></p>
                                                        <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="font-bold text-blue-600 text-xs truncate block hover:underline flex items-center gap-1">
                                                            View Work <ExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0 flex flex-col gap-4">
                                        <div className="flex gap-3">
                                            {currentUser?.uid === profile.id ? (
                                                <button
                                                    onClick={() => navigate('/profile')}
                                                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <User size={14} /> My Profile
                                                </button>
                                            ) : (
                                                <a
                                                    href={profile.linkedin || profile.github ? (profile.linkedin || profile.github) : '#'}
                                                    target={profile.linkedin || profile.github ? '_blank' : '_self'}
                                                    onClick={(e) => {
                                                        if (!profile.linkedin && !profile.github) {
                                                            e.preventDefault();
                                                            alert(`Contact ByteCore Admin to connect with ${profile.displayName || 'this fellow'}.`);
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group/btn"
                                                >
                                                    Connect <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex gap-4 text-slate-400">
                                                {profile.linkedin && (
                                                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                                                        <Linkedin size={18} />
                                                    </a>
                                                )}
                                                {profile.github && (
                                                    <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                                                        <Github size={18} />
                                                    </a>
                                                )}
                                            </div>
                                            {profile.location && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <MapPin size={12} className="text-slate-300" /> {profile.location}
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

function RoleBadge({ role, isVerified }) {
    if (role === 'alumni') {
        return (
            <span className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm flex items-center gap-1",
                isVerified 
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
            )}>
                <Award size={12} className={isVerified ? "text-blue-600" : "text-amber-500"} />
                {isVerified ? "Verified Alumni" : "Alumni"}
            </span>
        );
    }

    if (role === 'admin' || role === 'super_admin') {
        return (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm flex items-center gap-1">
                <Shield size={12} className="text-indigo-600" /> Admin
            </span>
        );
    }

    return (
        <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
            Student
        </span>
    );
}
