import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/common/SEO';
import { Camera, Play, Maximize2, X, Filter, ChevronRight, Video, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

// Import Assets
import labVideo from '../assets/images/computer lab/rahul sir teach student.mp4';
import labImg1 from '../assets/images/computer lab/students (1).jpg';
import labImg2 from '../assets/images/computer lab/students (2).jpg';

const Gallery = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('all');

    const items = [
        {
            id: 1,
            type: 'video',
            src: labVideo,
            thumbnail: labImg1,
            title: "Rahul Sir's Teaching Session",
            category: 'Teaching',
            desc: "Live demonstration of advanced coding techniques in unserem Nariyawal Lab."
        },
        {
            id: 2,
            type: 'image',
            src: labImg1,
            title: "Students Group Work",
            category: 'Collaboration',
            desc: "Students working together to solve real-world development challenges."
        },
        {
            id: 3,
            type: 'image',
            src: labImg2,
            title: "Individual Lab Focus",
            category: 'Training',
            desc: "Intensive 1:1 mentorship and focused environment for tech mastery."
        }
    ];

    const filteredItems = filter === 'all' ? items : items.filter(item => item.type === filter);

    const Lightbox = ({ item, close }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
        >
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={close}></div>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 w-full max-w-6xl aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
            >
                {item.type === 'video' ? (
                    <video src={item.src} autoPlay controls className="w-full h-full object-contain" />
                ) : (
                    <img src={item.src} alt={`${item.title} - ByteCore Computer Centre Lab`} className="w-full h-full object-contain" />
                )}
                <button
                    onClick={close}
                    className="absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-xl border border-white/20"
                >
                    <X size={24} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent">
                    <span className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-2 block">{item.category}</span>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">{item.title}</h3>
                    <p className="text-slate-400 font-medium max-w-2xl">{item.desc}</p>
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            <SEO
                title="Lab Gallery | Authentic Moments"
                description="Explore life at ByteCore Computer Centre. Real lab moments, teaching sessions, and the environment where future tech leaders are born in Bareilly."
                keywords="ByteCore Lab, Computer Centre Bareilly students, coding lab images, tech education gallery"
                url="https://bytecores.in/gallery"
            />

            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[200px]"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                            Live Content Feed
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter italic mb-6 leading-tight"
                        >
                            Authentic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-400">Lab Life</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 font-medium text-lg leading-relaxed"
                        >
                            No stock photos. No actors. Just real students building real futures. Experience the atmosphere of Bareilly's premier offline tech lab.
                        </motion.p>
                    </div>

                    {/* Filter UI */}
                    <div className="flex bg-slate-900/50 backdrop-blur-md p-2 rounded-2xl border border-white/5 self-start">
                        {[
                            { id: 'all', label: 'All Feed', icon: Filter },
                            { id: 'video', label: 'Videos', icon: Video },
                            { id: 'image', label: 'Photos', icon: ImageIcon }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                                    filter === btn.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <btn.icon size={14} />
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -10 }}
                                className="group relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all"
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    {item.type === 'video' ? (
                                        <div className="relative h-full w-full">
                                            <video
                                                src={item.src}
                                                muted
                                                loop
                                                autoPlay
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                                            />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-blue-600 transition-all pointer-events-none">
                                                <Play size={24} className="text-white fill-current ml-1" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={item.src}
                                            alt={`${item.title} - Life at ByteCore Computer Centre Bareilly`}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 hover:scale-110"
                                        />
                                    )}
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-10 flex flex-col justify-end">
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-300 border border-white/10">
                                                {item.type === 'video' ? 'Live Session' : 'Moment'}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">{item.title}</h3>
                                        <p className="text-white/40 text-sm font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 mb-6">
                                            {item.desc}
                                        </p>
                                        <button
                                            onClick={() => setSelectedId(item.id)}
                                            className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-95"
                                        >
                                            View {item.type === 'video' ? 'Full Video' : 'Full Detail'}
                                            <Maximize2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Community Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-24 p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden text-center shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-[length:40px_40px]"></div>
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <Camera size={48} className="text-white/30 mb-8" />
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
                            Ready to Be in the <br /> <span className="opacity-60">Next Shot?</span>
                        </h2>
                        <p className="text-blue-100 font-medium text-lg mb-12 max-w-xl">
                            Join our offline batches today and start your journey towards technical excellence. Your success is our best content.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-10 py-5 bg-white text-blue-700 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-white/10 transition-all active:scale-95">
                                Join Now
                            </button>
                            <button className="px-10 py-5 bg-blue-900/30 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-900/50 transition-all active:scale-95">
                                Campus Tour
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Lightbox Rendering */}
            <AnimatePresence>
                {selectedId && (
                    <Lightbox
                        item={items.find(i => i.id === selectedId)}
                        close={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
