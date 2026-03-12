import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
    Camera, Upload, Trash2, X, Plus, 
    Shield, Eye, Image as ImageIcon, 
    Loader2, AlertCircle, CheckCircle2,
    Lock, Edit3, Sparkles, Zap, Maximize2, Play
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
        { id: 'lab', label: 'Computer Lab', icon: Camera },
        { id: 'trip', label: 'Trips & Tours', icon: ImageIcon },
        { id: 'exam', label: 'Exams & Toppers', icon: CheckCircle2 }
    ];

    // New Image Form
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'lab',
        file: null,
        preview: null
    });

    // Security: Anti-Screenshot & Anti-Download
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleKeyDown = (e) => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && (e.key === 's' || e.key === 'p'))) {
                e.preventDefault();
                alert('Security Protocol: Content protection is active.');
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Fetch Images from Firestore
    useEffect(() => {
        const q = query(collection(db, 'lab_gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setImages(items);
                setLoading(false);
            },
            (error) => {
                console.error('Firestore Gallery Error:', error);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const filteredItems = useMemo(() => {
        return activeCategory === 'all' 
            ? images 
            : images.filter(img => img.category === activeCategory);
    }, [images, activeCategory]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm(prev => ({ ...prev, file, preview: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file || !form.title) return;

        setUploading(true);
        try {
            const compressed = await compressImage(form.file, 100); 
            const timestamp = Date.now();
            const fileName = `lab_${timestamp}_${form.file.name}`;
            
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
            alert('Moment captured and secured.');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
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
            alert('Moment synchronized successfully.');
        } catch (error) {
            console.error('Update failed:', error);
            alert('Update failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (image) => {
        if (!window.confirm('Erase this sector record?')) return;
        
        try {
            await deleteDoc(doc(db, 'lab_gallery', image.id));
            if (image.storagePath) {
                await deleteFromSupabase(image.storagePath, 'student bcc');
            }
            alert('Moment erased.');
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Deletion protocol failed.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 selection:bg-blue-500/30 font-sans">
            <SEO 
                title="Command Center Archives | ByteCore"
                description="Secure visual record of ByteCore Computer Centre's lab environment and student achievements."
            />

            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[250] origin-left"
                style={{ scaleX }}
            />

            {/* Background Aesthetics */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[200px] animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 bg-slate-900/40 p-12 md:p-20 rounded-[4rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
                    <div className="max-w-3xl relative z-10">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                        >
                            <Shield size={14} className="animate-pulse" />
                            Content Protected Lab Showcase
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter italic mb-8 leading-[0.85] uppercase"
                        >
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.3)]">Archive</span>
                        </motion.h1>
                        <motion.p 
                            className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl"
                        >
                            Secure visual documentation of professional growth and technical mastery within the ByteCore Command Center.
                        </motion.p>
                    </div>

                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUploadModal(true)}
                            className="px-8 py-5 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center gap-3 hover:bg-blue-50 transition-all z-10 self-start lg:self-end"
                        >
                            <Plus size={20} /> Add Sector Entry
                        </motion.button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-20">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest border",
                                activeCategory === cat.id 
                                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]" 
                                    : "bg-white/5 border-white/10 text-slate-500 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <cat.icon size={16} className={activeCategory === cat.id ? "animate-pulse" : ""} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 size={64} className="text-blue-500 animate-spin mb-8" />
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Visual Records</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-40 bg-white/5 rounded-[4rem] border border-white/5 border-dashed">
                        <Camera size={80} className="mx-auto text-slate-800 mb-8" />
                        <h2 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Sector Entry restricted</h2>
                        <p className="text-slate-600 mt-2 font-bold">The history is waiting to be written.</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((img, idx) => (
                                <motion.div
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="break-inside-avoid group relative rounded-[3.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all hover:bg-slate-800/50 hover:border-blue-500/20"
                                >
                                    <div 
                                        className="relative overflow-hidden bg-black/40 cursor-pointer"
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        {/* Security Shield Overlay */}
                                        <div className="absolute inset-0 z-10 pointer-events-auto bg-transparent" />
                                        
                                        {img.type === 'video' || img.imageUrl?.endsWith('.mp4') ? (
                                            <video 
                                                src={img.imageUrl} 
                                                className="w-full h-auto opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                autoPlay muted loop playsInline
                                            />
                                        ) : (
                                            <img 
                                                src={img.imageUrl} 
                                                alt={img.title}
                                                className="w-full h-auto opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                                loading="lazy"
                                            />
                                        )}
                                        
                                        <div className="absolute top-8 left-8 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center gap-2 border border-white/10">
                                            <Lock size={12} className="text-blue-400" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-200">Protected</span>
                                        </div>

                                        {isAdmin && (
                                            <div className="absolute top-8 right-8 flex gap-3 z-30">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setEditingImage(img); }}
                                                    className="p-4 bg-blue-500/20 hover:bg-blue-600 backdrop-blur-xl rounded-2xl text-white transition-all shadow-xl border border-blue-500/20"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                                                    className="p-4 bg-red-500/20 hover:bg-red-600 backdrop-blur-xl rounded-2xl text-white transition-all shadow-xl border border-red-500/20"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-10 relative">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                                {categories.find(c => c.id === img.category)?.icon ? 
                                                    React.createElement(categories.find(c => c.id === img.category).icon, { size: 14 }) : 
                                                    <Camera size={14} />
                                                }
                                            </div>
                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                                {categories.find(c => c.id === img.category)?.label || "Lab Record"}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight mb-4 group-hover:text-blue-400 transition-colors uppercase italic">{img.title}</h3>
                                        <p className="text-slate-400 font-medium text-xs leading-relaxed mb-8 line-clamp-3 italic">
                                            "{img.description || "Captured at the ByteCore Command Center, Bareilly."}"
                                        </p>
                                        
                                        <button 
                                            onClick={() => setSelectedImage(img)}
                                            className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-[2rem] text-white font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-95"
                                        >
                                            Inspect Sector <Eye size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modals - Standardized Premium Style */}
            <AnimatePresence>
                {(showUploadModal || editingImage) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                            onClick={() => !uploading && (setShowUploadModal(false) || setEditingImage(null))}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-900 w-full max-w-2xl rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] p-12 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                                    {editingImage ? 'Edit' : 'New'} <span className="text-blue-400">Moment</span>
                                </h3>
                                <button 
                                    onClick={() => !uploading && (setShowUploadModal(false) || setEditingImage(null))}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={editingImage ? handleUpdate : handleUpload} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Archive Title</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-white placeholder-slate-700"
                                        placeholder="e.g. Advanced Command Ops"
                                        value={editingImage ? editingImage.title : form.title}
                                        onChange={e => editingImage ? setEditingImage({ ...editingImage, title: e.target.value }) : setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-5">
                                    {categories.filter(c => c.id !== 'all').map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => editingImage ? setEditingImage({ ...editingImage, category: cat.id }) : setForm({ ...form, category: cat.id })}
                                            className={cn(
                                                "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-500",
                                                (editingImage?.category === cat.id || form.category === cat.id)
                                                    ? "bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20 scale-105" 
                                                    : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20"
                                            )}
                                        >
                                            <cat.icon size={24} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description (Deep Context)</label>
                                    <textarea 
                                        className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-white min-h-[120px] placeholder-slate-700"
                                        placeholder="Add mission context..."
                                        value={editingImage ? editingImage.description : form.description}
                                        onChange={e => editingImage ? setEditingImage({ ...editingImage, description: e.target.value }) : setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                {!editingImage && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Uplink</label>
                                        <div className="relative group">
                                            <input type="file" onChange={handleFileChange} className="hidden" id="lab-upload" />
                                            <label 
                                                htmlFor="lab-upload"
                                                className="flex flex-col items-center justify-center gap-6 py-12 bg-white/5 border-2 border-dashed border-white/5 rounded-[3rem] cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
                                            >
                                                {form.preview ? (
                                                    <div className="relative">
                                                        <img src={form.preview} alt="Preview" className="h-40 rounded-[2rem] object-cover shadow-2xl border border-white/10" />
                                                        <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                            <Plus size={32} className="text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="p-5 bg-white/5 rounded-[2rem] text-slate-400 border border-white/10">
                                                            <ImageIcon size={40} />
                                                        </div>
                                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Connect Asset</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    disabled={uploading || (!editingImage && !form.file)}
                                    className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl disabled:opacity-30 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                                >
                                    {uploading ? (
                                        <>Syncing... <Loader2 size={20} className="animate-spin" /></>
                                    ) : (
                                        <>{editingImage ? 'Update Archive' : 'Commit to Archive'} <CheckCircle2 size={20} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"
                            onClick={() => setSelectedImage(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-6xl aspect-video rounded-[5rem] overflow-hidden border border-white/10 shadow-[0_0_150px_rgba(59,130,246,0.3)]"
                        >
                            <div className="absolute inset-0 z-20 pointer-events-none" />
                            {selectedImage.type === 'video' || selectedImage.imageUrl?.endsWith('.mp4') ? (
                                <video src={selectedImage.imageUrl} autoPlay controls className="w-full h-full object-contain bg-black/40" />
                            ) : (
                                <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-contain bg-black/20" />
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-30">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="px-5 py-2 bg-blue-500/20 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Lock size={12} /> SECURE ASSET
                                    </div>
                                    <span className="text-white/10 text-[10px] font-black uppercase tracking-widest italic">BYTECORE_COMMAND_SECTOR</span>
                                </div>
                                <h4 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-5 uppercase italic">{selectedImage.title}</h4>
                                <p className="text-slate-400 text-xl font-medium max-w-4xl italic">
                                    "{selectedImage.description || "Captured at the ByteCore Command Center, Bareilly."}"
                                </p>
                            </div>

                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-12 right-12 w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all border border-white/10 z-[210] active:scale-95"
                            >
                                <X size={32} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LabGallery;
