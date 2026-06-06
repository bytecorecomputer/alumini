import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit as firestoreLimit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { motion } from 'framer-motion';
import { Loader2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/common/AuthContext';
import { cn } from '../../lib/utils';

import rahulSirVideo from '../../assets/images/computer lab/rahul sir teach student.mp4';
import students1 from '../../assets/images/computer lab/students (1).jpg';
import students2 from '../../assets/images/computer lab/students (2).jpg';
import topper1 from '../../assets/images/computer lab/scholership exam topper.jpg';

const LabGalleryPreview = () => {
    const { role } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin';
    const [dynamicImages, setDynamicImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'lab_gallery'), orderBy('createdAt', 'desc'), firestoreLimit(4));
        
        const staticItems = [
            { id: 'static-video', title: 'Practical Guidance: Rahul Sir', category: 'lab', imageUrl: rahulSirVideo, type: 'video', featured: true },
            { id: 'static-1', title: 'Professional Environment', category: 'lab', imageUrl: students1, type: 'image' },
            { id: 'static-2', title: 'Industry Standards', category: 'lab', imageUrl: students2, type: 'image' },
            { id: 'static-3', title: 'Achievement Hub', category: 'exam', imageUrl: topper1, type: 'image' }
        ];

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestoreItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const combined = [...staticItems, ...firestoreItems].slice(0, 4);
            setDynamicImages(combined);
            setLoading(false);
        }, (error) => {
            console.error("Firestore loading error, falling back to static:", error);
            setDynamicImages(staticItems.slice(0, 4));
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[650px]">
                {dynamicImages.map((img, idx) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                            "relative group rounded-[2.5rem] overflow-hidden bg-slate-800 border-2 border-slate-700/50 shadow-2xl cursor-pointer",
                            idx === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1"
                        )}
                        onClick={() => navigate('/gallery')}
                    >
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        
                        {img.type === 'video' || img.imageUrl?.endsWith('.mp4') ? (
                            <video src={img.imageUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700 scale-110 group-hover:scale-100" />
                        ) : (
                            <div className="w-full h-full relative">
                                <img src={img.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-125" />
                                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-contain relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 scale-100 group-hover:scale-105" />
                            </div>
                        )}

                        <div className="absolute bottom-8 left-8 z-20">
                            <span className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 block group-hover:translate-x-1 transition-transform">
                                {img.category === 'lab' ? 'ByteCore Lab' : img.category === 'trip' ? 'Campus Trip' : 'Achievement'}
                            </span>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight group-hover:text-blue-200 transition-colors uppercase">
                                {img.title}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {isAdmin && (
                <div className="flex justify-center mt-12">
                    <button 
                        onClick={() => navigate('/gallery')}
                        className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl group"
                    >
                        <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                        Admin: Manage Gallery Records
                    </button>
                </div>
            )}
        </div>
    );
};

export default LabGalleryPreview;
