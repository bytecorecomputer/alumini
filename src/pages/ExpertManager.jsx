import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Edit2, Loader2, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadToSupabase, deleteFromSupabase } from '../lib/supabase';

export default function ExpertManager() {
    const { user } = useAuth();
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        role: '',
        desc: '',
        whatsapp: '',
        file: null,
        existingImage: '',
        existingFilePath: ''
    });

    useEffect(() => {
        const q = query(collection(db, "experts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExperts(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let publicUrl = formData.existingImage;
            let filePath = formData.existingFilePath;

            // If new file selected, upload it
            if (formData.file) {
                // Delete old if exists
                if (formData.existingFilePath) {
                    await deleteFromSupabase(formData.existingFilePath, 'student bcc');
                }
                const uploadResult = await uploadToSupabase(
                    formData.file, 
                    `expert_${Date.now()}`, 
                    'student bcc'
                );
                publicUrl = uploadResult.publicUrl;
                filePath = uploadResult.filePath;
            }

            const expertData = {
                name: formData.name,
                role: formData.role,
                desc: formData.desc,
                whatsapp: formData.whatsapp,
                image: publicUrl,
                filePath: filePath,
                updatedAt: serverTimestamp(),
            };

            if (formData.id) {
                // Update existing
                await updateDoc(doc(db, "experts", formData.id), expertData);
                alert("Expert updated successfully!");
            } else {
                // Create new
                expertData.createdAt = serverTimestamp();
                await addDoc(collection(db, "experts"), expertData);
                alert("Expert added successfully!");
            }

            closeModal();
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Failed to save expert: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (expert) => {
        if (!window.confirm(`Are you sure you want to delete ${expert.name}?`)) return;

        try {
            if (expert.filePath) {
                await deleteFromSupabase(expert.filePath, 'student bcc');
            }
            await deleteDoc(doc(db, "experts", expert.id));
            alert("Expert deleted.");
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Failed to delete: " + error.message);
        }
    };

    const openModal = (expert = null) => {
        if (expert) {
            setFormData({
                id: expert.id,
                name: expert.name,
                role: expert.role,
                desc: expert.desc,
                whatsapp: expert.whatsapp,
                file: null,
                existingImage: expert.image,
                existingFilePath: expert.filePath
            });
        } else {
            setFormData({
                id: null,
                name: '',
                role: '',
                desc: '',
                whatsapp: '',
                file: null,
                existingImage: '',
                existingFilePath: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ id: null, name: '', role: '', desc: '', whatsapp: '', file: null, existingImage: '', existingFilePath: '' });
    };

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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-purple-100">
                            <Users size={12} /> Expert Management
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                            Our <span className="text-purple-600">Experts.</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2 text-lg">Manage team members displayed on the About page.</p>
                    </div>

                    <button 
                        onClick={() => openModal()}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-purple-600 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Add Expert
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="animate-spin text-purple-600" size={40} />
                    </div>
                ) : experts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {experts.map((exp, idx) => (
                            <motion.div 
                                key={exp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 relative"
                            >
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-6">
                                    {exp.image ? (
                                        <img src={exp.image} alt={exp.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-50 shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Users size={24} />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-tight">{exp.name}</h3>
                                        <p className="text-purple-600 font-bold text-xs">{exp.role}</p>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-6 h-16">
                                    {exp.desc}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => openModal(exp)}
                                        className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors flex justify-center items-center gap-2"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(exp)}
                                        className="py-3 px-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">No Experts Found</h3>
                        <p className="text-slate-500 font-medium mb-6">Add your team members here to show them on the public About page.</p>
                        <button 
                            onClick={() => openModal()}
                            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-black text-sm"
                        >
                            Add Your First Expert
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-2xl font-black text-slate-900">
                                    {formData.id ? 'Edit Expert' : 'New Expert'}
                                </h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Full Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-purple-100 font-bold" placeholder="e.g. Maisar Hussain" />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Role / Title</label>
                                    <input type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-purple-100 font-bold" placeholder="e.g. Senior Teacher" />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">WhatsApp Number (with country code)</label>
                                    <input type="text" required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-purple-100 font-bold" placeholder="e.g. 917455098949" />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Profile Image</label>
                                    <input type="file" accept="image/*" onChange={e => setFormData({...formData, file: e.target.files[0]})} className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium" />
                                    {formData.existingImage && !formData.file && <p className="text-xs text-green-600 mt-2 font-bold ml-2">Currently has an image.</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Short Description</label>
                                    <textarea required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-purple-100 font-medium h-24 resize-none" placeholder="Short bio..." />
                                </div>
                                <div className="pt-4">
                                    <button disabled={isUploading} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-purple-600 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                        {isUploading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Expert'}
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
