import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import SEO from '../components/common/SEO';
import { 
    Camera, Play, Maximize2, X, Filter, 
    ChevronRight, Video, Image as ImageIcon,
    Loader2, Lock, Sparkles, Zap, Heart, Info, Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';

// Import Static Assets for Collage Hero
import labImg1 from '../assets/images/computer lab/students (1).jpg';
import labImg2 from '../assets/images/computer lab/students (2).jpg';
import agraTrip from '../assets/images/computer lab/agra trip.jpg';
import topper1 from '../assets/images/computer lab/scholership exam topper.jpg';
import topper2 from '../assets/images/computer lab/scholership exam topper (2).jpg';
import rahulSirVideo from '../assets/images/computer lab/rahul sir teach student.mp4';

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
        { id: 'lab', label: 'Computer Lab', icon: Monitor },
        { id: 'trip', label: 'Trips & Tours', icon: ImageIcon },
        { id: 'exam', label: 'Exams & Toppers', icon: Zap }
    ];

    // Collage Photos for Hero
    const collagePhotos = [
        { src: labImg1, rotate: -5, x: '5%', y: '10%' },
        { src: labImg2, rotate: 10, x: '75%', y: '15%' },
        { src: agraTrip, rotate: -8, x: '15%', y: '50%' },
        { src: topper1, rotate: 12, x: '80%', y: '55%' },
        { src: topper2, rotate: -15, x: '45%', y: '70%' },
        { src: labImg1, rotate: 5, x: '60%', y: '5%' },
        { src: labImg2, rotate: -12, x: '2%', y: '80%' },
        { src: agraTrip, rotate: 15, x: '85%', y: '85%' },
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
                    { id: 's3', title: 'Agra Educational Trip', description: 'Exploring the heritage and building memories.', category: 'trip', imageUrl: agraTrip, type: 'image' },
                    { id: 's4', title: 'Toppers Celebration', description: 'Honoring excellence in the scholarship exam.', category: 'exam', imageUrl: topper1, type: 'image' },
                    { id: 's5', title: 'Interactive Learning', description: 'Expert guidance by Rahul Sir in the command center.', category: 'lab', imageUrl: rahulSirVideo, type: 'video' },
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
            : images.filter(item => item.category === filter);
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
                {item.type === 'video' || item.imageUrl?.endsWith('.mp4') ? (
                    <video src={item.imageUrl || item.src} autoPlay controls className="w-full h-full object-contain" />
                ) : (
                    <img 
                        src={item.imageUrl || item.src} 
                        alt={item.title} 
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
                            <Lock size={12} /> SECURED_RECORD
                        </span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">{item.title}</h3>
                    <p className="text-slate-400 font-medium text-lg max-w-3xl leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-24 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            <SEO
                title="Lab Gallery | ByteCore Experience"
                description="Explore the ByteCore Command Center. A premium showcase of Bareilly's most results-driven tech community."
            />

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 z-[250] origin-left"
                style={{ scaleX }}
            />

            {/* Collage Hero Section */}
            <div className="relative h-[80vh] md:h-[90vh] overflow-hidden flex items-center justify-center mb-20">
                {/* Floating Images Background */}
                <div className="absolute inset-0 z-0">
                    {collagePhotos.map((photo, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.5, rotate: photo.rotate }}
                            animate={{ 
                                opacity: 0.4, 
                                scale: 0.8, 
                                y: [0, -20, 0],
                                rotate: [photo.rotate, photo.rotate + 5, photo.rotate]
                            }}
                            transition={{ 
                                duration: 5 + i, 
                                repeat: Infinity, 
                                delay: i * 0.2,
                                opacity: { duration: 1 }
                            }}
                            className="absolute hidden md:block"
                            style={{ left: photo.x, top: photo.y }}
                        >
                            <img 
                                src={photo.src} 
                                alt="" 
                                className="w-56 h-72 object-cover rounded-3xl border-4 border-white/5 shadow-2xl filter grayscale hover:grayscale-0 transition-all duration-700" 
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 z-10"></div>
                
                <div className="relative z-20 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] mb-12"
                    >
                        Sector Archive Protocol
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-7xl md:text-[10rem] font-black tracking-tighter italic leading-none mb-12 uppercase"
                    >
                        THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-indigo-400">ARCHIVE</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl md:text-3xl text-slate-400 font-black uppercase tracking-widest max-w-4xl mx-auto leading-tight"
                    >
                        Visual Documentation of Mastery <br />
                        <span className="text-white opacity-20 whitespace-pre"> ///////////////////////////// </span>
                    </motion.p>
                </div>

                {/* Glassy Filter Bar Floating */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
                    <div className="flex flex-wrap gap-2 md:gap-4 bg-white/5 backdrop-blur-2xl p-2 md:p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        {categories.map((btn) => {
                            const Icon = btn.icon;
                            return (
                                <button
                                    key={btn.id}
                                    onClick={() => setFilter(btn.id)}
                                    className={cn(
                                        "flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-5 rounded-3xl transition-all duration-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest whitespace-nowrap group",
                                        filter === btn.id 
                                            ? "bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] scale-105" 
                                            : "text-slate-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={16} />
                                    {btn.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Heading for Section */}
                <div className="flex items-center gap-6 mb-16">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <h2 className="text-xs font-black uppercase tracking-[1em] text-slate-500 italic">Sector Breakdown</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
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
                    </div>
                ) : (
                    /* High Performance Masonry Columns - College Style */
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
                                    className="break-inside-avoid group relative rounded-[4rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all hover:shadow-[0_0_80px_rgba(59,130,246,0.1)] hover:border-blue-500/20"
                                >
                                    <div 
                                        className="relative overflow-hidden bg-black/40 cursor-pointer"
                                        onClick={() => setSelectedId(item.id)}
                                    >
                                        <img
                                            src={item.imageUrl || item.src}
                                            alt={item.title}
                                            className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                            loading="lazy"
                                        />
                                        
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90" />
                                        
                                        {/* Security Tag */}
                                        <div className="absolute top-8 left-8 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0 z-20 flex items-center gap-2 border border-white/10">
                                            <Lock size={12} className="text-blue-400" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">PROTECTED_SECTOR</span>
                                        </div>

                                        <div className="absolute bottom-8 left-8 right-8 z-20">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                                                    {item.category}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic line-clamp-1">{item.title}</h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
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
