import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
    Shield, Monitor, Globe, Zap, Play, 
    Plus, Edit3, Trash2, X, Upload, 
    Send, Loader2, Image as ImageIcon,
    ChevronDown, Maximize2, Sparkles,
    Layout, Cpu, MousePointer2
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { uploadToSupabase, deleteFromSupabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';
import SEO from '../components/common/SEO';
import { cn } from '../lib/utils';

// Import Static Assets
import students1 from '../assets/images/computer lab/students (1).jpg';
import students2 from '../assets/images/computer lab/students (2).jpg';
import topper2 from '../assets/images/computer lab/scholership exam topper (2).jpg';
import topper1 from '../assets/images/computer lab/scholership exam topper.jpg';
import agraTrip from '../assets/images/computer lab/agra trip.jpg';
import rahulSirVideo from '../assets/images/computer lab/rahul sir teach student.mp4';

const LabGallery = () => {
    const { user, role } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin';
    const [images, setImages] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const categories = [
        { id: 'all', label: 'All Records', icon: Shield, color: 'blue' },
        { id: 'lab', label: 'The Lab', icon: Monitor, color: 'indigo' },
        { id: 'trip', label: 'Exploration', icon: Globe, color: 'purple' },
        { id: 'exam', label: 'Excellence', icon: Zap, color: 'amber' }
    ];

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'lab',
        file: null,
        preview: null
    });

    // Integrated Static Items
    const staticItems = useMemo(() => [
        {
            id: 'static-v1',
            title: 'Rahul Sir: Lab Insights',
            description: 'Direct mentorship session at the ByteCore Command Center.',
            category: 'lab',
            imageUrl: rahulSirVideo,
            type: 'video',
            isStatic: true,
            featured: true
        },
        {
            id: 'static-1',
            title: 'Active Research Hive',
            description: 'Students engaged in deep tech exploration.',
            category: 'lab',
            imageUrl: students1,
            type: 'image',
            isStatic: true
        },
        {
            id: 'static-2',
            title: 'Compute Node Alpha',
            description: 'State-of-the-art workstations for advanced development.',
            category: 'lab',
            imageUrl: students2,
            type: 'image',
            isStatic: true
        },
        {
            id: 'static-3',
            title: 'Excellence Archive',
            description: 'Recognizing the innovators of tomorrow.',
            category: 'exam',
            imageUrl: topper1,
            type: 'image',
            isStatic: true
        },
        {
            id: 'static-4',
            title: 'Deployment: Agra',
            description: 'Field research and historical tech exploration.',
            category: 'trip',
            imageUrl: agraTrip,
            type: 'image',
            isStatic: true
        }
    ], []);

    useEffect(() => {
        // Show static items immediately
        setImages(staticItems);
        
        const q = query(collection(db, 'lab_gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestoreItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setImages([...staticItems, ...firestoreItems]);
            setLoading(false);
        }, (error) => {
            console.error('Firestore Error:', error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [staticItems]);

    const filteredItems = useMemo(() => {
        return activeCategory === 'all' 
            ? images 
            : images.filter(img => img.category === activeCategory);
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
            alert('Upload Interrupted: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
            <SEO 
                title="Lab Archives | Premium Visual Records"
                description="Secure, high-impact visual record management for ByteCore Labs."
            />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-[length:40px_40px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse delay-700" />
            </div>

            {/* Navigation Progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 z-[250] origin-left shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                style={{ scaleX }}
            />

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-40">
                {/* Header Section */}
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
                    <div className="max-w-4xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">
                                System_Visuals_08
                            </span>
                            <div className="h-px w-12 bg-blue-500/20" />
                        </motion.div>
                        <h1 className="text-7xl md:text-[120px] font-black italic uppercase leading-[0.85] tracking-tighter mb-8">
                            Lab <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-400 to-slate-800">Archives.</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg md:text-xl max-w-2xl leading-relaxed">
                            A curated chronological record of innovation, excellence, and tech-driven exploration across the ByteCore ecosystem.
                        </p>
                    </div>

                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowUploadModal(true)}
                            className="group px-12 py-6 bg-white text-black rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center gap-4 shadow-2xl transition-all hover:bg-blue-50"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Deploy Asset
                        </motion.button>
                    )}
                </header>

                {/* Categories Bar */}
                <div className="sticky top-24 z-50 mb-20">
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 p-2 rounded-[2.5rem] flex flex-wrap gap-2 shadow-2xl">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 rounded-3xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest border",
                                    activeCategory === cat.id 
                                        ? "bg-white border-white text-black shadow-xl" 
                                        : "bg-white/5 border-transparent text-slate-500 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="mb-8"
                        >
                            <Cpu size={64} className="text-blue-500" />
                        </motion.div>
                        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Neural Archives</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((img, idx) => (
                                <motion.div
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6, delay: idx * 0.03, ease: [0.23, 1, 0.32, 1] }}
                                    className={cn(
                                        "break-inside-avoid group relative rounded-[3rem] overflow-hidden bg-[#0d0d0d] border border-white/5 transition-all duration-700 hover:border-blue-500/40 hover:shadow-[0_0_60px_rgba(37,99,235,0.1)]",
                                        img.featured && "md:col-span-2 row-span-2"
                                    )}
                                >
                                    <div className="relative w-full h-full min-h-[300px] overflow-hidden">
                                        {img.type === 'video' ? (
                                            <video 
                                                src={img.imageUrl} 
                                                autoPlay 
                                                muted 
                                                loop 
                                                playsInline
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                                            />
                                        ) : (
                                            <img 
                                                src={img.imageUrl} 
                                                alt={img.title}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                                            />
                                        )}
                                        
                                        {/* Overlay Content */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                                        
                                        <div className="absolute top-8 left-8 right-8 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0 duration-500">
                                            <div className="p-3 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/5">
                                                {img.type === 'video' ? <Play size={18} fill="white" /> : <Maximize2 size={18} />}
                                            </div>
                                            {img.isStatic && (
                                                <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-3xl border border-blue-500/30 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">
                                                    Archive_Alpha
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute bottom-10 left-10 right-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                    {img.category}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                                                    {img.type}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-black text-white leading-none italic uppercase tracking-tighter mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                {img.title}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-all delay-100 duration-500">
                                                {img.description}
                                            </p>
                                        </div>

                                        {isAdmin && !img.isStatic && (
                                            <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-3 bg-white text-black rounded-xl hover:bg-blue-500 hover:text-white transition-colors">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(img)}
                                                    className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Footer Subtle */}
            <div className="text-center py-20 px-6 border-t border-white/5 relative z-10">
                <div className="flex items-center justify-center gap-6 text-slate-700 mb-8">
                    <MousePointer2 size={14} className="animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">End of Archive Node</span>
                    <div className="h-px w-20 bg-slate-900" />
                </div>
                <p className="text-slate-800 text-[15vw] font-black leading-none tracking-tighter uppercase select-none opacity-[0.03]">
                    ByteCore
                </p>
            </div>

            {/* Upload Modal Refined */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-[#0a0a0a] w-full max-w-2xl rounded-[4rem] border border-white/10 p-12 relative overflow-hidden shadow-3xl"
                        >
                             <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                                <Cpu size={240} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-12">
                                    <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">Deploy <span className="text-blue-500">Node.</span></h2>
                                    <button onClick={() => setShowUploadModal(false)} className="text-slate-600 hover:text-white"><X size={32} /></button>
                                </div>

                                <form onSubmit={handleUpload} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Archive Identifier</label>
                                        <input 
                                            required
                                            className="w-full px-8 py-6 rounded-3xl bg-white/5 border border-white/5 focus:border-blue-500 outline-none font-black text-xs uppercase"
                                            placeholder="Asset Name"
                                            value={form.title}
                                            onChange={e => setForm({...form, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sector Class</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {categories.filter(c => c.id !== 'all').map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setForm({...form, category: cat.id})}
                                                    className={cn(
                                                        "py-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                                        form.category === cat.id ? "bg-white border-white text-black" : "bg-white/5 border-transparent text-slate-500"
                                                    )}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <input type="file" onChange={handleFileChange} className="hidden" id="file-up" />
                                        <label 
                                            htmlFor="file-up"
                                            className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/5 rounded-[3rem] cursor-pointer hover:bg-blue-600/5 transition-all group-hover:border-blue-500/30"
                                        >
                                            <Upload className="text-slate-700 mb-4 group-hover:text-blue-500 transition-colors" size={40} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Connect Archive Uplink</span>
                                        </label>
                                    </div>

                                    <button 
                                        disabled={uploading || !form.file}
                                        className="w-full py-7 bg-white text-black rounded-[3rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl disabled:opacity-20 flex items-center justify-center gap-4 transition-all active:scale-95"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" /> : <>Execute Transmission <Send size={18} /></>}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LabGallery;
