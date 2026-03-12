import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import SEO from '../components/common/SEO';
import { 
    Camera, Play, Maximize2, X, Filter, 
    ChevronRight, Video, Image as ImageIcon,
    Loader2, Lock, Sparkles, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

// Import Static Assets for Fallback/Initial
import labImg1 from '../assets/images/computer lab/students (1).jpg';
import labImg2 from '../assets/images/computer lab/students (2).jpg';

const Gallery = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Categories Configuration
    const categories = [
        { id: 'all', label: 'All Records', icon: Sparkles },
        { id: 'lab', label: 'Computer Lab', icon: Camera },
        { id: 'trip', label: 'Trips & Tours', icon: ImageIcon },
        { id: 'exam', label: 'Exams & Toppers', icon: Zap }
    ];

    // Fetch Images from Firestore
    useEffect(() => {
        const q = query(collection(db, 'lab_gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Inject some static records if DB is empty for initial load/safety
            if (items.length === 0) {
                setImages([
                    { id: 's1', title: 'Advanced Lab Session', description: 'Intensive coding session at the Command Center.', category: 'lab', imageUrl: labImg1, type: 'image' },
                    { id: 's2', title: 'Collaborative Learning', description: 'Students working together on real-world projects.', category: 'lab', imageUrl: labImg2, type: 'image' },
                ]);
            } else {
                setImages(items);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredItems = useMemo(() => {
        return filter === 'all' 
            ? images 
            : images.filter(item => item.category === filter || (filter === 'video' && item.type === 'video'));
    }, [images, filter]);

    const Lightbox = ({ item, close }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
        >
            <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={close}></div>
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative z-10 w-full max-w-6xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)] border border-white/10"
            >
                {/* Security Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none" />
                
                {item.type === 'video' || item.imageUrl?.endsWith('.mp4') ? (
                    <video src={item.imageUrl || item.src} autoPlay controls className="w-full h-full object-contain" />
                ) : (
                    <img 
                        src={item.imageUrl || item.src} 
                        alt={`${item.title} - ByteCore Computer Centre Lab`} 
                        className="w-full h-full object-contain"
                    />
                )}
                
                <button
                    onClick={close}
                    className="absolute top-8 right-8 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-xl border border-white/20 z-30"
                >
                    <X size={28} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-30">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Lock size={12} /> Protected Asset
                        </span>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest hidden md:block">ByteCore Command Center Sector</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">{item.title}</h3>
                    <p className="text-slate-400 font-medium text-lg max-w-3xl leading-relaxed">
                        {item.description || item.desc}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            <SEO
                title="Lab Gallery | ByteCore Experience"
                description="Witness the future of tech. Explore real moments from Bareilly's premier computer centre. No stock photos, just authentic excellence."
                keywords="ByteCore Lab, Computer Centre Bareilly, coding lab photos, student achievements, tech education gallery"
            />

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 z-[250] origin-left"
                style={{ scaleX }}
            />

            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-blue-600/5 rounded-full blur-[250px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[200px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-white/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                        >
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                            Live Archive: Synchronized
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-7xl md:text-9xl font-black tracking-tighter italic mb-8 leading-[0.8] uppercase"
                        >
                            Visual <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.3)]">Intel</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 font-medium text-xl leading-relaxed"
                        >
                            Dive into the heart of high-performance tech education. Every frame captures a moment of focus, collaboration, and breakthrough in Bareilly's most advanced lab environment.
                        </motion.p>
                    </div>

                    {/* Premium Filter Controls */}
                    <div className="flex flex-wrap gap-3 bg-slate-900/30 backdrop-blur-2xl p-3 rounded-[2rem] border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
                        {categories.map((btn) => {
                            const Icon = btn.icon;
                            return (
                                <button
                                    key={btn.id}
                                    onClick={() => setFilter(btn.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest whitespace-nowrap group",
                                        filter === btn.id 
                                            ? "bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] scale-105" 
                                            : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                                    )}
                                >
                                    <Icon size={16} className={cn(
                                        "transition-transform group-hover:scale-110",
                                        filter === btn.id ? "animate-pulse" : ""
                                    )} />
                                    {btn.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 size={64} className="text-blue-500 animate-spin mb-8" />
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Visual Databases</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-40 bg-white/5 rounded-[4rem] border border-white/5 border-dashed">
                        <Camera size={80} className="mx-auto text-slate-800 mb-8" />
                        <h2 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Archive Entry Restricted</h2>
                        <p className="text-slate-600 mt-2 font-bold">No records found matching current protocol.</p>
                    </div>
                ) : (
                    /* High Performance Masonry Columns */
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        <AnimatePresence mode='popLayout'>
                            {filteredItems.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                                    className="break-inside-avoid group relative rounded-[3.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] hover:border-blue-500/20"
                                >
                                    {/* Security Shield Overlay */}
                                    <div className="absolute inset-0 z-10 pointer-events-auto bg-transparent" />
                                    
                                    <div 
                                        className="relative overflow-hidden bg-black/40 cursor-pointer"
                                        onClick={() => setSelectedId(item.id)}
                                    >
                                        {/* Dynamic Content Rendering */}
                                        {item.type === 'video' || item.imageUrl?.endsWith('.mp4') ? (
                                            <div className="relative">
                                                <video
                                                    src={item.imageUrl || item.src}
                                                    muted
                                                    loop
                                                    autoPlay
                                                    playsInline
                                                    className="w-full h-auto object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-blue-600 transition-all z-20">
                                                    <Play size={24} className="text-white fill-current ml-1" />
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={item.imageUrl || item.src}
                                                alt={`${item.title} - Professional Lab Showcase`}
                                                className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                                loading={idx < 6 ? "eager" : "lazy"}
                                            />
                                        )}

                                        {/* Security Tag */}
                                        <div className="absolute top-8 left-8 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0 z-20 flex items-center gap-2 border border-white/10">
                                            <Lock size={12} className="text-blue-400" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">BCC Protected</span>
                                        </div>
                                    </div>

                                    {/* Content Card Overlay (Premium Static) */}
                                    <div className="p-10 relative">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-400">
                                                {item.category || "Lab Record"}
                                            </div>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sector ARCHV-0{idx + 1}</span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-white tracking-tight mb-4 group-hover:text-blue-400 transition-colors uppercase italic">{item.title}</h3>
                                        <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8 line-clamp-2 italic">
                                            "{item.description || item.desc || "A visual proof of technical dedication at ByteCore Command Center."}"
                                        </p>
                                        
                                        <button
                                            onClick={() => setSelectedId(item.id)}
                                            className="w-full py-5 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all duration-500 hover:bg-blue-50 active:scale-95 flex items-center justify-center gap-3 group/btn"
                                        >
                                            Inspect Entry
                                            <Maximize2 size={14} className="group-hover/btn:rotate-12 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* CTA / Join Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 p-16 md:p-32 rounded-[5rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-950 relative overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)]"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
                    
                    <div className="relative z-10 w-full flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center mb-12 border border-white/20">
                            <Camera size={40} className="text-white" />
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] uppercase italic">
                            Become Part of <br />
                            <span className="opacity-40">The Legacy</span>
                        </h2>
                        <p className="text-blue-100 font-medium text-xl mb-16 max-w-2xl leading-relaxed">
                            Don't just watch the success stories—build your own. Join Bareilly's most results-driven tech community today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button className="px-12 py-6 bg-white text-blue-700 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95">
                                Initialize Enrollment
                            </button>
                            <button className="px-12 py-6 bg-blue-950/40 backdrop-blur-xl text-white border border-white/20 rounded-[2.5rem] font-black uppercase text-xs tracking-widest hover:bg-blue-900/60 transition-all active:scale-95">
                                Virtual Tour
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Lightbox Rendering */}
            <AnimatePresence>
                {selectedId && (
                    <Lightbox
                        item={images.find(i => i.id === selectedId)}
                        close={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
