import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useAuth } from "../app/common/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Users, GraduationCap, Briefcase, Shield, Trash2, Search, CheckCircle, XCircle, TrendingUp, Edit3, X } from "lucide-react";
import { cn } from "../lib/utils";

export default function AdminDashboard() {
    const { user, role } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ total: 0, students: 0, alumni: 0, admins: 0 });

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
            setStats({ total: usersList.length, students: s, alumni: a, admins: ad });
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
                ...editForm,
                role: editForm.role // Ensure role is updated
            });
            alert("User updated successfully!");
            setEditingUser(null);
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Failed to update user: " + e.message);
        }
    };

    const promoteToAdmin = async (userId) => {
        if (!window.confirm("Are you sure you want to promote this user to Admin?")) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: "admin" });
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Error updating role");
        }
    };

    const removeAdmin = async (userId) => {
        if (!window.confirm("Are you sure you want to remove Admin privileges?")) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: "student" });
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Error updating role");
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("This will permanently delete the user profile from the database. This action cannot be undone. Confirm?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Error deleting user");
        }
    };

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <div className="mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Governance</h1>
                        <p className="text-gray-500">
                            Welcome back, {user?.displayName}.
                            {role === 'super_admin' && <span className="ml-2 text-purple-600 font-bold text-sm bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">SUPER ADMIN</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Users" value={stats.total} icon={Users} color="bg-blue-500" />
                <StatCard title="Students" value={stats.students} icon={GraduationCap} color="bg-green-500" />
                <StatCard title="Alumni" value={stats.alumni} icon={Briefcase} color="bg-amber-500" />
                <StatCard title="Admins" value={stats.admins} icon={Shield} color="bg-purple-600" />
            </div>

            {/* User Management Section */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage permissions and account details</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3.5 border-none bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-full transition-all"
                        />
                    </div>
                </div>

                {/* Mobile View (Cards) */}
                <div className="block lg:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 animate-pulse font-medium">Loading Database...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 font-medium">No users found in your search.</div>
                    ) : (
                        filteredUsers.map((u, index) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-5 space-y-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden shadow-inner ring-2 ring-white">
                                        {u.photoURL ? <img src={u.photoURL} alt={u.displayName} className="h-full w-full object-cover" /> : u.displayName?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-gray-900 text-lg leading-tight">{u.displayName || "Unknown"}</p>
                                            <RoleBadge role={u.role} />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{u.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs font-medium">
                                    {u.company && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl">
                                            <Briefcase size={14} /> <span className="truncate">{u.company}</span>
                                        </div>
                                    )}
                                    {u.course && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl">
                                            <GraduationCap size={14} /> <span className="truncate">{u.course}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        onClick={() => handleEditClick(u)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                                    >
                                        Edit Details
                                    </button>
                                    {u.role !== 'admin' && u.role !== 'super_admin' ? (
                                        <button
                                            onClick={() => promoteToAdmin(u.id)}
                                            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-purple-200 active:scale-95"
                                        >
                                            Make Admin
                                        </button>
                                    ) : u.role === 'admin' ? (
                                        <button
                                            onClick={() => removeAdmin(u.id)}
                                            className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-amber-200 active:scale-95"
                                        >
                                            Revoke Admin
                                        </button>
                                    ) : (
                                        <div className="flex-1 text-center py-3 text-gray-400 font-bold text-sm italic">Super Admin</div>
                                    )}
                                    <button
                                        onClick={() => deleteUser(u.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                                <th className="p-6">User Details</th>
                                <th className="p-6 text-center">Identity</th>
                                <th className="p-6">Affiliation</th>
                                <th className="p-6 text-right">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="p-20 text-center text-gray-400 font-medium">Gathering community data...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="4" className="p-20 text-center text-gray-500 font-medium">No members found matching your criteria.</td></tr>
                            ) : (
                                filteredUsers.map((u, index) => (
                                    <motion.tr
                                        key={u.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-blue-50/30 transition-all duration-300 group"
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                                    {u.photoURL ? <img src={u.photoURL} alt={u.displayName} className="h-full w-full object-cover" /> : u.displayName?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors uppercase tracking-tight">{u.displayName || "Unknown"}</p>
                                                    <p className="text-sm text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <RoleBadge role={u.role} />
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1.5 text-sm">
                                                {u.company && <div className="flex items-center gap-2 text-gray-700 font-medium"><Briefcase size={14} className="text-blue-500" /> {u.company}</div>}
                                                {u.course && <div className="flex items-center gap-2 text-gray-500"><GraduationCap size={14} className="text-green-500" /> {u.course}</div>}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <div className="flex justify-end items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(u)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
                                                >
                                                    <Edit3 size={14} /> EDIT
                                                </button>

                                                {u.role !== 'admin' && u.role !== 'super_admin' ? (
                                                    <button
                                                        onClick={() => promoteToAdmin(u.id)}
                                                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-xs border border-purple-100 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        PROMOTE
                                                    </button>
                                                ) : u.role === 'admin' ? (
                                                    <button
                                                        onClick={() => removeAdmin(u.id)}
                                                        className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs border border-amber-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        REVOKE
                                                    </button>
                                                ) : <span className="text-[10px] font-black text-purple-900/40 uppercase tracking-widest px-4">IMMUNE</span>}

                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={editForm.displayName || ""}
                                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                                            value={editForm.role || "student"}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        >
                                            <option value="student">Student</option>
                                            <option value="alumni">Alumni</option>
                                            <option value="admin">Admin</option>
                                            {role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={editForm.company || ""}
                                            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={editForm.headline || ""}
                                        onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={editForm.course || ""}
                                            onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={editForm.location || ""}
                                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${color} text-white shadow-lg shadow-${color}/20`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    )
}

function RoleBadge({ role }) {
    const styles = {
        admin: "bg-purple-100 text-purple-800 border-purple-200",
        super_admin: "bg-purple-900 text-purple-100 border-purple-700",
        student: "bg-blue-50 text-blue-700 border-blue-200",
        alumni: "bg-amber-50 text-amber-700 border-amber-200"
    };

    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border capitalize", styles[role] || "bg-gray-100 text-gray-800")}>
            {role?.replace('_', ' ')}
        </span>
    );
}
