import { useState, useEffect } from 'react';
import { useAuth } from '../app/common/AuthContext';
import { db } from '../firebase/firestore';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Building, Plus, Trash2, X, Search, Filter, ArrowRight, Zap, Target, ExternalLink, Camera, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { sendTelegramNotification } from '../lib/telegram';
import { uploadToCloudinary, getOptimizedUrl } from '../lib/cloudinary';

export default function Jobs() {
    const { user, role, userData } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time', // Full-time, Internship, Freelance
        link: '',
        description: '',
        image: ''
    });

    const isAlumni = role === 'alumni' || role === 'admin' || role === 'super_admin';
    const isSuperAdmin = role === 'super_admin' || role === 'admin';

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const jobsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setJobs(jobsList);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Archive this opportunity? This action is irreversible.")) return;
        try {
            await deleteDoc(doc(db, "jobs", id));
            setJobs(jobs.filter(j => j.id !== id));
        } catch (error) {
            alert("Database integrity check failed. Deletion aborted.");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            setFormData({ ...formData, image: imageUrl });
        } catch (error) {
            alert(error.message || "Visual sync failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalData = {
                ...formData,
                postedBy: user.uid,
                posterName: userData?.displayName || 'Network Fellow',
                posterRole: role,
                createdAt: Date.now()
            };

            const docRef = await addDoc(collection(db, "jobs"), finalData);

            // Broadcast to Telegram
            sendTelegramNotification('job', finalData);

            setJobs([{ id: docRef.id, ...finalData }, ...jobs]);

            setIsModalOpen(false);
            setFormData({ title: '', company: '', location: '', type: 'Full-time', link: '', description: '', image: '' });
        } catch (error) {
            console.error(error);
            alert("Opportunity broadcast failed.");
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || job.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100/50">
                            Career Trajectory
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                            Opportunity <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Hub.</span>
                        </h1>
                    </motion.div>

                    {isAlumni && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setIsModalOpen(true)}
                            className="btn-premium px-10 py-5 bg-slate-900 text-white shadow-2xl shadow-emerald-900/10 group active:scale-95"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            <span className="uppercase tracking-[0.2em] font-black text-sm">Post Opportunity</span>
                        </motion.button>
                    )}
                </div>

                {/* Filter & Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/50 mb-12 flex flex-col md:flex-row gap-6"
                >
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                        <input
                            placeholder="Filter by designation, company, or stack..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none transition-all text-slate-800 font-bold"
                        />
                    </div>
                    <div className="md:w-64 relative group">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-16 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                        >
                            <option value="all">All Ecosystems</option>
                            <option value="Full-time">Full-time Roles</option>
                            <option value="Internship">Internship Tracks</option>
                            <option value="Freelance">Freelance PIVOTs</option>
                        </select>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 rounded-[2rem] bg-slate-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 rounded-[3.5rem] border-4 border-dashed border-slate-100"
                    >
                        <div className="p-8 bg-slate-50 rounded-full w-fit mx-auto mb-8 text-slate-300">
                            <Briefcase size={64} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Marketplace Empty</h2>
                        <p className="text-slate-500 font-bold">No career trajectores currently logged in the database.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {filteredJobs.map((job, idx) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="premium-card group bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/50 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8"
                            >
                                <div className="flex-1 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                    {job.image && (
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-slate-50 flex-shrink-0">
                                            <img src={getOptimizedUrl(job.image, 'w_300,h_300,c_pad,b_white,f_auto,q_auto')} alt={job.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                                            <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-xl group-hover:bg-emerald-600 transition-colors duration-500">
                                                <Building size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{job.company}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                                <MapPin size={16} className="text-slate-300" /> {job.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                                <Target size={16} className="text-slate-300" /> {job.type}
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${job.type === 'Internship' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                job.type === 'Freelance' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                Active Link
                                            </div>
                                        </div>

                                        <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-2xl">
                                            {job.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                                    <a
                                        href={job.link.startsWith('http') ? job.link : `https://${job.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-premium py-4 bg-slate-900 text-white shadow-xl shadow-slate-200 active:scale-95 group/btn"
                                    >
                                        Establish Connection
                                        <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </a>

                                    {(isSuperAdmin || user.uid === job.postedBy) && (
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} /> Sever Protocol
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Job Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="flex justify-between items-center p-10 bg-slate-50/50 border-b border-slate-100">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Broadcast Opportunity</h2>
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Initialize Network Career Deployment</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white rounded-2xl text-slate-400 hover:text-slate-950 transition-all shadow-sm">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation Label</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none text-slate-800 font-bold transition-all"
                                        placeholder="e.g. Lead Systems Architect"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Entity</label>
                                        <input
                                            required
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none text-slate-800 font-bold transition-all"
                                            placeholder="Company ID"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Ecosystem</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none text-slate-800 font-bold transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Full-time">Full-time Roles</option>
                                            <option value="Internship">Internship Tracks</option>
                                            <option value="Freelance">Freelance PIVOTs</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spatial Coordinates</label>
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none text-slate-800 font-bold transition-all"
                                        placeholder="Remote / HQ Location"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Gateway (URI)</label>
                                    <input
                                        required
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none text-slate-800 font-bold transition-all"
                                        placeholder="https://career-portal..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Branding (Optional)</label>
                                    <div className="flex items-center gap-6">
                                        <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50 hover:bg-white hover:border-emerald-100 transition-all cursor-pointer group/upload">
                                            {uploading ? (
                                                <Loader2 className="animate-spin text-emerald-600" />
                                            ) : formData.image ? (
                                                <img src={formData.image} className="h-full w-full object-cover rounded-[1.8rem]" />
                                            ) : (
                                                <>
                                                    <Camera size={24} className="text-slate-300 group-hover/upload:text-emerald-500 transition-colors mb-2" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Logo / Preview</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        {formData.image && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: '' })}
                                                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Parameter Manifest</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-100 outline-none text-slate-800 font-bold transition-all resize-none"
                                        placeholder="Detailed role specification..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full btn-premium py-5 bg-slate-900 text-white shadow-2xl shadow-emerald-900/20 uppercase tracking-[0.3em] font-black text-sm active:scale-95"
                                >
                                    <Zap size={20} />
                                    Broadcast Opportunity
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
