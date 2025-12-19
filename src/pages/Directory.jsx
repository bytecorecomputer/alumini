import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, GraduationCap, Award, User, Linkedin, Github, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 mb-6 tracking-tight"
                    >
                        Connect & Collaborate
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto font-medium"
                    >
                        Directory visible only to verified members. Find alumni, students, and mentors to grow your network.
                    </motion.p>
                </div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 mb-12 sticky top-24 z-30"
                >
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-grow w-full md:w-auto">
                            <Search className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, company, skill, or course..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto">
                            {['all', 'alumni', 'student'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setFilterRole(r)}
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${filterRole === r ? 'bg-white text-primary-700 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {r === 'all' ? 'All' : r + 's'}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">Loading amazing people...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredUsers.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <User size={64} className="mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-bold text-gray-900">No members found</h3>
                                <p className="text-gray-500">Try adjusting your search criteria</p>
                            </div>
                        ) : (
                            filteredUsers.map((profile, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={profile.id}
                                    className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    {/* Cover Status Line */}
                                    <div className={`h-2 w-full ${profile.role === 'alumni' ? 'bg-amber-500' : profile.role === 'admin' ? 'bg-purple-600' : 'bg-green-500'}`} />

                                    <div className="p-8 flex-grow">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-1 shadow-inner">
                                                {profile.photoURL ? (
                                                    <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover rounded-xl" />
                                                ) : (
                                                    <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-gray-400">
                                                        {profile.displayName?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {profile.role === 'alumni' && (
                                                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1">
                                                        <Award size={12} /> ALUMNI
                                                    </span>
                                                )}
                                                {profile.role === 'student' && (
                                                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                                        STUDENT
                                                    </span>
                                                )}
                                                {['admin', 'super_admin'].includes(profile.role) && (
                                                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                                                        ADMIN
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-primary-600 transition-colors">
                                            {profile.displayName || "Unknown Member"}
                                        </h3>
                                        <p className="text-gray-500 font-medium mb-6 h-10 line-clamp-2">
                                            {profile.headline || "No headline added yet."}
                                        </p>

                                        <div className="space-y-3 pt-6 border-t border-gray-100">
                                            {profile.company && (
                                                <div className="flex items-center gap-3 text-gray-700 group/item">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                                                        <Briefcase size={16} />
                                                    </div>
                                                    <span className="font-medium text-sm truncate">{profile.company}</span>
                                                </div>
                                            )}
                                            {profile.course && (
                                                <div className="flex items-center gap-3 text-gray-700 group/item">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                                                        <GraduationCap size={16} />
                                                    </div>
                                                    <span className="font-medium text-sm truncate">{profile.course} {profile.batch && `'${profile.batch.slice(-2)}`}</span>
                                                </div>
                                            )}
                                            {profile.location && (
                                                <div className="flex items-center gap-3 text-gray-700 group/item">
                                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover/item:bg-rose-600 group-hover/item:text-white transition-colors">
                                                        <MapPin size={16} />
                                                    </div>
                                                    <span className="font-medium text-sm truncate">{profile.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-8 py-5 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                                        <div className="flex gap-2">
                                            {profile.linkedin && (
                                                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors"><Linkedin size={20} /></a>
                                            )}
                                            {profile.github && (
                                                <a href={profile.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors"><Github size={20} /></a>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (currentUser?.uid === profile.id) {
                                                    navigate('/profile');
                                                } else {
                                                    alert("Public profile view coming soon!");
                                                }
                                            }}
                                            className={`text-sm font-bold transition-colors flex items-center gap-1 ${currentUser?.uid === profile.id
                                                ? "text-primary-600 hover:text-primary-800"
                                                : "text-gray-400 hover:text-gray-600"
                                                }`}
                                        >
                                            {currentUser?.uid === profile.id ? (
                                                <><Edit size={14} /> Edit Profile</>
                                            ) : (['admin', 'super_admin'].includes(currentUser?.role) && profile.role !== 'super_admin') ? (
                                                <span onClick={() => {
                                                    if (window.confirm("Go to Admin Dashboard to edit this user?")) {
                                                        navigate('/admin');
                                                    }
                                                }} className="flex items-center gap-1 cursor-pointer hover:text-purple-600">
                                                    <Shield size={14} /> Edit User
                                                </span>
                                            ) : (
                                                "View Profile →"
                                            )}
                                        </button>
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
