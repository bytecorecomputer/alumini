import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
    Camera, Upload, Trash2, X, Plus, 
    Shield, Eye, Image as ImageIcon, 
    Loader2, AlertCircle, CheckCircle2,
    Lock, Edit3, Sparkles, Zap, Maximize2, Play,
    Monitor, FileText, Globe, Send
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { uploadToSupabase, deleteFromSupabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';
import SEO from '../components/common/SEO';
import { cn } from '../lib/utils';

// Import Static Assets
import lab1 from '../assets/images/computer lab/students (1).jpg';
import lab2 from '../assets/images/computer lab/students (2).jpg';

const LabGallery = () => {
    const { user, role } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin';
    const [images, setImages] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingImage, setEditingImage] = useState(null);
    
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Categories Configuration
    const categories = [
        { id: 'all', label: 'All Records', icon: Shield },
        { id: 'lab', label: 'Computer Lab', icon: Monitor },
        { id: 'trip', label: 'Trips & Tours', icon: Globe },
        { id: 'exam', label: 'Exams & Toppers', icon: zap }
    ];

    // Form State
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'lab',
        file: null,
        preview: null
    });

    // Security: Anti-Screenshot (Basic)
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    // Fetch Images
    useEffect(() => {
        const q = query(collection(db, 'lab_gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setImages(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredItems = useMemo(() => {
        return activeCategory === 'all' ? images : images.filter(img => img.category === activeCategory);
    }, [images, activeCategory]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setForm(prev => ({ ...prev, file, preview: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file || !form.title) return;
        setUploading(true);
        try {
            const compressed = await compressImage(form.file, 100); 
            const timestamp = Date.now();
            const { publicUrl, filePath } = await uploadToSupabase(compressed, `lab_${timestamp}`, 'student bcc');
            
            await addDoc(collection(db, 'lab_gallery'), {
                title: form.title,
                description: form.description,
                category: form.category,
                imageUrl: publicUrl,
                storagePath: filePath,
                type: form.file.type.startsWith('video') ? 'video' : 'image',
                createdAt: serverTimestamp(),
                uploader: user.uid
            });

            setForm({ title: '', description: '', category: 'lab', file: null, preview: null });
            setShowUploadModal(false);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Security Breach: Upload Interrupted - ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingImage.title) return;
        setUploading(true);
        try {
            await updateDoc(doc(db, 'lab_gallery', editingImage.id), {
                title: editingImage.title,
                description: editingImage.description,
                category: editingImage.category,
                updatedAt: serverTimestamp()
            });
            setEditingImage(null);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (image) => {
        if (!window.confirm('Erase this sector record?')) return;
        try {
            await deleteDoc(doc(db, 'lab_gallery', image.id));
            if (image.storagePath) await deleteFromSupabase(image.storagePath, 'student bcc');
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-24 selection:bg-blue-500/30 font-sans cursor-crosshair">
            <SEO 
                title="Lab Archives | Admin Console"
                description="Secure visual record management for ByteCore Command Center."
            />

            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 z-[250] origin-left"
                style={{ scaleX }}
            />

            <div className="max-w-7xl mx-auto px-6">
                {/* Admin Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-lg mb-4 inline-flex items-center gap-2"
                        >
                            <Shield size={12} /> SECURE_ADMIN_PORTAL
                        </motion.div>
                        <h1 className="text-6xl font-black tracking-tighter italic uppercase text-white leading-none">
                            ARCHIVE <span className="text-slate-700">CONSOLE</span>
                        </h1>
                    </div>

                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowUploadModal(true)}
                            className="group relative px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <Plus size={18} className="relative z-10" />
                            <span className="relative z-10">Deploy New Asset</span>
                        </motion.button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 md:gap-4 mb-20">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-5 rounded-3xl transition-all duration-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest border",
                                activeCategory === cat.id 
                                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]" 
                                    : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <cat.icon size={16} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 size={64} className="text-blue-500 animate-spin mb-8" />
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Visual Databases</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((img, idx) => (
                                <motion.div
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="break-inside-avoid group relative rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 transition-all hover:border-blue-500/30"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
                                        <img 
                                            src={img.imageUrl} 
                                            alt=""
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                        />
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                                        
                                        {isAdmin && (
                                            <div className="absolute top-6 right-6 flex gap-2 z-20">
                                                <button 
                                                    onClick={() => setEditingImage(img)}
                                                    className="p-3 bg-white/10 hover:bg-blue-600 backdrop-blur-xl rounded-xl text-white transition-all border border-white/10"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(img)}
                                                    className="p-3 bg-white/10 hover:bg-red-600 backdrop-blur-xl rounded-xl text-white transition-all border border-white/10"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                                    {img.category}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-white italic uppercase">{img.title}</h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Upload/Edit Modal */}
            <AnimatePresence>
                {(showUploadModal || editingImage) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-slate-900 w-full max-w-4xl rounded-[4rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                                {/* Preview Side */}
                                <div className="hidden md:block w-1/2 bg-black/40 relative group">
                                    {(form.preview || editingImage?.imageUrl) ? (
                                        <img 
                                            src={form.preview || editingImage?.imageUrl} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-80"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-700 animate-pulse">
                                            <ImageIcon size={80} strokeWidth={1} />
                                            <p className="mt-4 font-black uppercase text-[10px] tracking-widest">Awaiting Material</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                    <div className="absolute bottom-12 left-12 right-12">
                                        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                                            {editingImage ? 'Updating' : 'Deploying'} <br />
                                            <span className="text-blue-500">Archive</span>
                                        </h3>
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-loose">
                                            System encryption active. <br /> All updates are permanent.
                                        </p>
                                    </div>
                                </div>

                                {/* Form Side */}
                                <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-12">
                                        <div className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[8px] font-black px-3 py-1 rounded uppercase tracking-[0.3em]">
                                            Status: {uploading ? 'UPLOADING' : 'IDLE'}
                                        </div>
                                        <button 
                                            onClick={() => !uploading && (setShowUploadModal(false) || setEditingImage(null))}
                                            className="text-slate-600 hover:text-white transition-colors"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <form onSubmit={editingImage ? handleUpdate : handleUpload} className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Archive Title</label>
                                            <input 
                                                type="text"
                                                required
                                                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5 focus:border-blue-500/50 outline-none transition-all font-black text-[11px] uppercase tracking-widest"
                                                placeholder="Mission Identifier"
                                                value={editingImage ? editingImage.title : form.title}
                                                onChange={e => editingImage ? setEditingImage({ ...editingImage, title: e.target.value }) : setForm({ ...form, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {categories.filter(c => c.id !== 'all').map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => editingImage ? setEditingImage({ ...editingImage, category: cat.id }) : setForm({ ...form, category: cat.id })}
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center",
                                                        (editingImage?.category === cat.id || form.category === cat.id)
                                                            ? "bg-blue-600 border-blue-400 text-white" 
                                                            : "bg-white/5 border-white/5 text-slate-600 hover:border-white/20"
                                                    )}
                                                >
                                                    <cat.icon size={16} />
                                                    <span className="text-[7px] font-black uppercase tracking-widest">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Meta Description</label>
                                            <textarea 
                                                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5 focus:border-blue-500/50 outline-none transition-all font-bold text-[11px] min-h-[100px]"
                                                placeholder="Sector details..."
                                                value={editingImage ? editingImage.description : form.description}
                                                onChange={e => editingImage ? setEditingImage({ ...editingImage, description: e.target.value }) : setForm({ ...form, description: e.target.value })}
                                            />
                                        </div>

                                        {!editingImage && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Uplink</label>
                                                <div className="relative">
                                                    <input type="file" onChange={handleFileChange} className="hidden" id="admin-upload" />
                                                    <label 
                                                        htmlFor="admin-upload"
                                                        className="flex flex-col items-center justify-center py-10 bg-white/5 border-2 border-dashed border-white/5 rounded-2xl cursor-pointer hover:bg-blue-600/5 transition-all"
                                                    >
                                                        <Upload size={30} className="text-slate-700 mb-3" />
                                                        <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Connect Archive Node</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        <button 
                                            disabled={uploading || (!editingImage && !form.file)}
                                            className="w-full py-6 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] disabled:opacity-20 transition-all flex items-center justify-center gap-4 hover:bg-blue-50"
                                        >
                                            {uploading ? (
                                                <>TRANSMITTING... <Loader2 size={16} className="animate-spin" /></>
                                            ) : (
                                                <>{editingImage ? 'Sync Changes' : 'Execute Upload'} <Send size={16} /></>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LabGallery;
