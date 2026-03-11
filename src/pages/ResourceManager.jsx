import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc, addDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Plus, Trash2, Search, Filter, 
    Download, ExternalLink, Loader2, X, 
    Upload, BookOpen, AlertCircle, FileDigit,
    FileType, Monitor, GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { uploadToSupabase, deleteFromSupabase } from '../lib/supabase';

export default function ResourceManager() {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Notes',
        course: 'All',
        file: null
    });

    const categories = ['Syllabus', 'Notes', 'Assignment', 'E-Book', 'Other'];
    const courses = ['All', 'ADCA', 'DCA', 'Python', 'CorelDraw', 'Tally', 'CCC'];

    useEffect(() => {
        const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const resList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResources(resList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file || !formData.title) return;

        setIsUploading(true);
        try {
            // 1. Upload to Supabase
            const { publicUrl, filePath } = await uploadToSupabase(
                formData.file, 
                `resource_${Date.now()}`, 
                'student bcc'
            );

            // 2. Save to Firestore
            await addDoc(collection(db, "resources"), {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                course: formData.course,
                fileUrl: publicUrl,
                filePath: filePath,
                fileType: formData.file.name.split('.').pop(),
                fileName: formData.file.name,
                createdAt: serverTimestamp(),
                uploadedBy: user.email
            });

            setIsAddModalOpen(false);
            setFormData({ title: '', description: '', category: 'Notes', course: 'All', file: null });
            alert("Resource uploaded successfully!");
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Failed to upload resource: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (resource) => {
        if (!window.confirm(`Are you sure you want to delete "${resource.title}"?`)) return;

        try {
            // 1. Delete from Supabase
            if (resource.filePath) {
                await deleteFromSupabase(resource.filePath, 'student bcc');
            }
            // 2. Delete from Firestore
            await deleteDoc(doc(db, "resources", resource.id));
            alert("Resource purged from database.");
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Failed to delete: " + error.message);
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             res.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || res.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
                    <p className="text-slate-500 font-bold">Administrative privileges required.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdfe] pt-28 pb-20 px-4 md:px-8 font-inter">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100"
                        >
                            <BookOpen size={12} /> Resource Repository
                        </motion.div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                            Materials <span className="text-blue-600">Hub.</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2 text-lg">Central control for Syllabus, Notes, and PDFs.</p>
                    </div>

                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Add New Resource
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="relative group md:col-span-2">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by title or description..."
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select 
                            className="w-full pl-14 pr-10 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-black uppercase tracking-widest text-[10px] appearance-none"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Resources Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Repository</p>
                    </div>
                ) : filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredResources.map((res, idx) => (
                            <motion.div 
                                key={res.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FileDigit size={80} />
                                </div>

                                <div className="flex items-start justify-between mb-8">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-0 group-hover:-rotate-6 transition-transform",
                                        res.category === 'Syllabus' ? 'bg-purple-600' :
                                        res.category === 'Notes' ? 'bg-blue-600' :
                                        res.category === 'Assignment' ? 'bg-emerald-600' : 'bg-slate-600'
                                    )}>
                                        <FileText size={28} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full font-black text-[9px] uppercase tracking-widest">
                                            {res.fileType?.toUpperCase()}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-black text-[9px] uppercase tracking-widest">
                                            {res.course}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                    {res.title}
                                </h3>
                                <p className="text-slate-400 font-bold text-xs mb-8 line-clamp-2 min-h-[40px]">
                                    {res.description || 'No description provided for this resource.'}
                                </p>

                                <div className="flex items-center gap-3">
                                    <a 
                                        href={res.fileUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all"
                                    >
                                        <Download size={14} /> View / Get
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(res)}
                                        className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
                        <div className="h-20 w-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileType size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Internal Repository Empty</h3>
                        <p className="text-slate-400 font-bold mb-8">No matching materials found in the system.</p>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                            Upload First Resource
                        </button>
                    </div>
                )}
            </div>

            {/* Add Resource Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <Upload className="text-blue-600" /> New Resource
                                    </h3>
                                    <p className="text-slate-500 font-bold text-sm">Add documents to the student portal.</p>
                                </div>
                                <button 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-800"
                                            placeholder="e.g., Python Course Syllabus"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Category</label>
                                        <select 
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100 font-black uppercase tracking-widest text-[10px] appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Course</label>
                                        <select 
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100 font-black uppercase tracking-widest text-[10px] appearance-none"
                                            value={formData.course}
                                            onChange={(e) => setFormData({...formData, course: e.target.value})}
                                        >
                                            {courses.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Attachment (PDF/DOC/Image)</label>
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                required
                                                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full px-6 py-4 rounded-2xl bg-blue-50/50 border-2 border-dashed border-blue-200 text-blue-600 font-bold text-sm flex items-center gap-3">
                                                <FileText size={18} />
                                                {formData.file ? formData.file.name : "Select Document File"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Description</label>
                                    <textarea 
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100 font-medium text-slate-800 h-24 resize-none"
                                        placeholder="Briefly explain what this resource contains..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isUploading}
                                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} /> 
                                                Syncing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} /> Deploy Resource
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
