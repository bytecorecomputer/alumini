import { useEffect, useState, cloneElement } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useAuth } from "../app/common/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, GraduationCap, Briefcase, Shield, Trash2, Search,
    Award, ShieldAlert, ShieldOff, X, MapPin, Linkedin, Github,
    ChevronRight, ExternalLink, Mail, Edit3, Database
} from "lucide-react";
import { cn } from "../lib/utils";
import { getOptimizedUrl } from "../lib/cloudinary";

export default function AdminDashboard() {
    const { user, role } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ totalUsers: 0, students: 0, alumni: 0, admins: 0 });

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = [];
            let s = 0, a = 0, ad = 0;

            querySnapshot.forEach((doc) => {
                const d = doc.data();
                usersList.push({ id: doc.id, ...d });
                if (d.role === 'student') s++;
                if (d.role === 'alumni') a++;
                if (d.role === 'admin' || d.role === 'super_admin') ad++;
            });

            setUsers(usersList);
            setStats({ totalUsers: usersList.length, students: s, alumni: a, admins: ad });
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (u) => {
        setEditingUser(u);
        setEditForm({ ...u });
    };

    const handleEditSave = async () => {
        if (!editingUser) return;
        try {
            await updateDoc(doc(db, "users", editingUser.id), {
                ...editForm
            });
            alert("Member profile synchronized successfully.");
            setEditingUser(null);
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Database Error: " + e.message);
        }
    };

    const handlePromote = async (userId) => {
        if (!window.confirm("Grant administrative privileges to this member?")) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: "admin" });
            fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRevoke = async (userId) => {
        if (!window.confirm("Revoke administrative privileges from this member?")) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: "alumni" }); // Default back to alumni
            fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("CRITICAL: Permanently purge this member from the network?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-[0.2em] border border-purple-100"
                        >
                            Administrative Control Center
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                            Network <span className="text-purple-600">Governance</span>
                        </h1>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <StatCard
                        label="Total Members"
                        value={stats.totalUsers}
                        icon={<Users className="text-blue-600" />}
                        color="blue"
                        trend="+12% this month"
                    />
                    <StatCard
                        label="Verified Alumni"
                        value={stats.alumni}
                        icon={<Award className="text-amber-600" />}
                        color="amber"
                        trend="+5% this month"
                    />
                    <StatCard
                        label="Active Students"
                        value={stats.students}
                        icon={<GraduationCap className="text-emerald-600" />}
                        color="emerald"
                        trend="+8% total growth"
                    />
                    <StatCard
                        label="Privileged Admins"
                        value={stats.admins}
                        icon={<Shield className="text-purple-600" />}
                        color="purple"
                    />
                    <motion.button
                        whileHover={{ y: -5 }}
                        onClick={() => window.location.href = '/admin/coaching'}
                        className="premium-card p-8 bg-blue-600 text-white shadow-xl shadow-blue-200 flex flex-col justify-between group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl bg-white/20 ring-1 ring-white/30">
                                <Database size={24} strokeWidth={2.5} />
                            </div>
                            <ExternalLink size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-1">Coaching System</p>
                            <h3 className="text-2xl font-black tracking-tight">Manage Students</h3>
                        </div>
                    </motion.button>
                </div>

                {/* User Management Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card bg-white"
                >
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Member Directory</h2>
                            <p className="text-slate-500 font-medium">Verify, manage, and audit all platform users.</p>
                        </div>
                        <div className="relative group w-full md:w-96">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by name, email or role..."
                                className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-purple-100 outline-none transition-all text-slate-800 placeholder-slate-400 font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left bg-slate-50/50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                                    <th className="px-8 py-5">User Profile</th>
                                    <th className="px-8 py-5">Role/Batch</th>
                                    <th className="px-8 py-5">Contact</th>
                                    <th className="px-8 py-5">Verification</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-sm animate-pulse">Synchronizing Database</td></tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform">
                                                        {u.photoURL ? (
                                                            <img src={getOptimizedUrl(u.photoURL, 'w_100,h_100,c_fill,g_face,f_auto,q_auto')} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-bold text-xs uppercase">
                                                                {u.displayName?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900">{u.displayName || "Anonymous"}</div>
                                                        <div className="text-xs font-bold text-slate-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <RoleBadge role={u.role} />
                                                    {u.batch && <span className="text-[10px] font-bold text-slate-400">Class of {u.batch}</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2 text-slate-400">
                                                    <Mail size={16} />
                                                    {u.linkedin && <Linkedin size={16} />}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {u.profileComplete ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-100">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit border border-slate-100">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <AdminActionButtons
                                                        user={u}
                                                        onEdit={() => handleEditClick(u)}
                                                        onPromote={handlePromote}
                                                        onRevoke={handleRevoke}
                                                        onDelete={handleDelete}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="block lg:hidden divide-y divide-slate-50">
                        {filteredUsers.map((u) => (
                            <div key={u.id} className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-slate-100 overflow-hidden ring-4 ring-slate-50">
                                            {u.photoURL ? (
                                                <img src={getOptimizedUrl(u.photoURL, 'w_150,h_150,c_fill,g_face,f_auto,q_auto')} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-black text-lg">
                                                    {u.displayName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900">{u.displayName || "Anonymous"}</div>
                                            <div className="text-xs font-bold text-slate-400">{u.email}</div>
                                        </div>
                                    </div>
                                    <RoleBadge role={u.role} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`text-xs font-black ${u.profileComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
                                            {u.profileComplete ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                                        <span className="text-xs font-black text-slate-900">{u.batch || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <AdminActionButtons
                                        user={u}
                                        onEdit={() => handleEditClick(u)}
                                        onPromote={handlePromote}
                                        onRevoke={handleRevoke}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Edit Member</h3>
                                    <p className="text-slate-500 font-bold text-sm">Modifying identity and permissions.</p>
                                </div>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-purple-100 outline-none font-bold text-slate-800"
                                            value={editForm.displayName || ""}
                                            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network Role</label>
                                        <select
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-purple-100 outline-none font-bold text-slate-800 appearance-none"
                                            value={editForm.role || "student"}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        >
                                            <option value="student">Student</option>
                                            <option value="alumni">Alumni</option>
                                            <option value="admin">Administrator</option>
                                            {role === 'super_admin' && <option value="super_admin">System Owner</option>}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headline</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-purple-100 outline-none font-bold text-slate-800"
                                        value={editForm.headline || ""}
                                        onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Affiliation / Company</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-purple-100 outline-none font-bold text-slate-800"
                                            value={editForm.company || ""}
                                            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course / Major</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-purple-100 outline-none font-bold text-slate-800"
                                            value={editForm.course || ""}
                                            onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
                                >
                                    Synchronize Database
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon, color, trend }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        amber: "bg-amber-50 text-amber-600 ring-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        purple: "bg-purple-50 text-purple-600 ring-purple-100"
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="premium-card p-8 bg-white"
        >
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl shadow-sm ring-1", colors[color])}>
                    {cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </motion.div>
    );
}

function RoleBadge({ role }) {
    const variants = {
        admin: "bg-purple-100 text-purple-700 border-purple-200",
        super_admin: "bg-slate-900 text-white border-slate-900",
        alumni: "bg-amber-100 text-amber-700 border-amber-200",
        student: "bg-emerald-100 text-emerald-700 border-emerald-200"
    };

    return (
        <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit",
            variants[role] || "bg-slate-100 text-slate-600 border-slate-200"
        )}>
            {role?.replace('_', ' ')}
        </span>
    );
}

function AdminActionButtons({ user, onEdit, onPromote, onRevoke, onDelete }) {
    if (user.role === 'super_admin') return <span className="text-xs font-black text-slate-300 uppercase italic">System Owner</span>;

    return (
        <div className="flex gap-1.5">
            <button
                onClick={onEdit}
                className="p-2.5 text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
                title="Edit Detailed Info"
            >
                <Edit3 size={16} />
            </button>
            {user.role === 'admin' ? (
                <button
                    onClick={() => onRevoke(user.id)}
                    className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100"
                    title="Demote to Member"
                >
                    <ShieldOff size={16} />
                </button>
            ) : (
                <button
                    onClick={() => onPromote(user.id)}
                    className="p-2.5 text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-transparent hover:border-purple-100"
                    title="Promote to Admin"
                >
                    <ShieldAlert size={16} />
                </button>
            )}
            <button
                onClick={() => {
                    const confirmName = prompt(`Type "${user.displayName}" to delete this user:`);
                    if (confirmName === user.displayName) onDelete(user.id);
                }}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                title="Delete User"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
