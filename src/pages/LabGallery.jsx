import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, Upload, Trash2, X, Plus, 
    Shield, Eye, Image as ImageIcon, 
    Loader2, AlertCircle, CheckCircle2,
    Lock
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { uploadToSupabase, deleteFromSupabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';
import SEO from '../components/common/SEO';
import { cn } from '../lib/utils';

const LabGallery = () => {
    const { user, role } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin';
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    
    // New Image Form
    const [form, setForm] = useState({
        title: '',
        description: '',
        file: null,
        preview: null
    });

    const galleryRef = useRef(null);

    // Security: Anti-Screenshot & Anti-Download
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleKeyDown = (e) => {
            // Disable PrintScreen, Ctrl+S, Ctrl+P
            if (e.key === 'PrintScreen' || (e.ctrlKey && (e.key === 's' || e.key === 'p'))) {
                e.preventDefault();
                alert('Security Protocol: Content protection is active.');
            }
        };

        // Attempting to detect screenshots via visibility change/blur (unreliable but helpful as deterrent)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Potential screenshot or tab switch
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Fetch Images from Firestore
    useEffect(() => {
        const q = query(collection(db, 'lab_gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setImages(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
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
            // 1. Compress Image
            const compressed = await compressImage(form.file, 80); // Target 80KB for gallery
            
            // 2. Upload to Supabase
            const timestamp = Date.now();
            const fileName = `lab_${timestamp}_${form.file.name}`;
            const storagePath = `lab-gallery/${fileName}`;
            
            // We reuse uploadToSupabase but might need to adjust path logic if it's too rigid
            // Current uploadToSupabase: const filePath = `profiles/${fileName}`;
            // Let's use a temporary tweak or just accept profiles/ for now if supabase.js isn't flexible
            // Actually, let's assume we want a dedicated path.
            
            const { publicUrl, filePath } = await uploadToSupabase(compressed, `lab_${timestamp}`, 'student bcc');
            
            // 3. Save to Firestore
            await addDoc(collection(db, 'lab_gallery'), {
                title: form.title,
                description: form.description,
                imageUrl: publicUrl,
                storagePath: filePath,
                createdAt: serverTimestamp(),
                uploader: user.uid
            });

            setForm({ title: '', description: '', file: null, preview: null });
            setShowUploadModal(false);
            alert('Moment captured and secured.');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (image) => {
        if (!window.confirm('Erase this moment from history?')) return;
        
        try {
            // 1. Delete from Firestore
            await deleteDoc(doc(db, 'lab_gallery', image.id));
            
            // 2. Delete from Supabase (if storagePath exists)
            if (image.storagePath) {
                await deleteFromSupabase(image.storagePath, 'student bcc');
            }
            
            alert('Moment erased.');
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to erase from storage: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 selection:bg-blue-500/30">
            <SEO 
                title="Computer Lab Showcase | ByteCore"
                description="Explore the heart of ByteCore Computer Centre. Professional lab environment, advanced workstations, and the creative pulse of Bareilly's tech hub."
            />

            {/* Background Aesthetics */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <div className="max-w-3xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                        >
                            <Shield size={14} className="animate-pulse" />
                            Content Protected Lab Showcase
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter italic mb-8"
                        >
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Command Center</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl"
                        >
                            Where complex logic meets high-performance hardware. Explore the environment designed for professional tech excellence.
                        </motion.p>
                    </div>

                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUploadModal(true)}
                            className="px-8 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl flex items-center gap-3 hover:bg-blue-50 transition-all"
                        >
                            <Plus size={20} /> Add Moment
                        </motion.button>
                    )}
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 size={60} className="text-blue-500 animate-spin mb-6" />
                        <p className="text-slate-500 font-black uppercase tracking-widest animate-pulse">Synchronizing Visual Records</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-40 bg-white/5 rounded-[4rem] border border-white/5 border-dashed">
                        <Camera size={80} className="mx-auto text-slate-800 mb-8" />
                        <h2 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">No visual archives found</h2>
                        <p className="text-slate-600 mt-2 font-bold">The history is waiting to be written.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" ref={galleryRef}>
                        <AnimatePresence mode="popLayout">
                            {images.map((img, idx) => (
                                <motion.div
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all hover:bg-slate-800/50"
                                >
                                    {/* Security Layer: Protective Overlay */}
                                    <div className="absolute inset-0 z-10 pointer-events-auto bg-transparent" />
                                    
                                    <div className="aspect-[4/5] relative overflow-hidden">
                                        <img 
                                            src={img.imageUrl} 
                                            alt={img.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                            loading="lazy"
                                        />
                                        
                                        {/* Security Banner on hover */}
                                        <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-2">
                                            <Lock size={12} className="text-blue-400" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-200">Protected Content</span>
                                        </div>

                                        {isAdmin && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                                                className="absolute top-6 right-6 p-4 bg-red-500/20 hover:bg-red-500 backdrop-blur-md rounded-2xl text-white transition-all z-20"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Content Card */}
                                    <div className="p-8 relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <Camera size={14} />
                                            </div>
                                            <h3 className="text-2xl font-black text-white tracking-tight truncate">{img.title}</h3>
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm line-clamp-2 mb-6">
                                            {img.description || "The atmosphere of professional growth at ByteCore Lab."}
                                        </p>
                                        
                                        <button 
                                            onClick={() => setSelectedImage(img)}
                                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            Inspect Details <Eye size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                            onClick={() => !uploading && setShowUploadModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-900 w-full max-w-xl rounded-[3rem] border border-white/10 shadow-2xl p-10 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-black text-white tracking-tight">Capture <span className="text-blue-400">Moment</span></h3>
                                <button 
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Photo Title</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-white"
                                        placeholder="e.g. Advanced Workstation Alpha"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deep Context</label>
                                    <textarea 
                                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-white min-h-[100px]"
                                        placeholder="Describe the specialized activity or hardware in the frame..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual File</label>
                                    <div className="relative group">
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            required={!form.preview}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="lab-upload"
                                        />
                                        <label 
                                            htmlFor="lab-upload"
                                            className="flex flex-col items-center justify-center gap-4 py-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                                        >
                                            {form.preview ? (
                                                <img src={form.preview} alt="Preview" className="h-32 rounded-xl object-cover shadow-2xl" />
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-white/5 rounded-2xl text-slate-400">
                                                        <ImageIcon size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400">Click to Select Photographic Asset</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <button 
                                    disabled={uploading || !form.file}
                                    className="w-full py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                >
                                    {uploading ? (
                                        <>Synchronizing... <Loader2 size={18} className="animate-spin" /></>
                                    ) : (
                                        <>Archiving Lab Life <CheckCircle2 size={18} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox / Details */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl"
                            onClick={() => setSelectedImage(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-6xl aspect-video rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.2)]"
                        >
                            {/* Protection Shield */}
                            <div className="absolute inset-0 z-20" />
                            
                            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-contain" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-30">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Lock size={12} /> Protected Asset
                                    </div>
                                    <span className="text-white/20 text-[10px] font-black">BYTECORE COMMAND CENTER</span>
                                </div>
                                <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">{selectedImage.title}</h4>
                                <p className="text-slate-400 text-lg font-medium max-w-3xl italic">
                                    "{selectedImage.description || "Captured at the ByteCore Command Center, Bareilly."}"
                                </p>
                            </div>

                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-10 right-10 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/10 z-[210] active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LabGallery;
