import React, { useState, useEffect, useCallback } from 'react';
import SEO from '../components/common/SEO';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Users, CheckCircle, Database, Loader2, Zap,
    Laptop, GraduationCap, Award, MapPin, Building, Star, Settings, Image as ImageIcon
} from 'lucide-react';
import { collection, query, orderBy, limit as firestoreLimit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import heroGraphic from '../assets/images/hero_graphic.png';
import DomeGallery from '../components/ui/DomeGallery';
import { useAuth } from '../app/common/AuthContext';
import { runMigration } from '../lib/migrateStudents';
import { cn } from '../lib/utils';
import { courses as localCourses } from '../data/courses';

// Import Lottie Animations
import heroLottie from '../assets/lottie/hero.json';
import webLottie from '../assets/lottie/web.json';
import dataLottie from '../assets/lottie/data.json';
import pythonLottie from '../assets/lottie/python.json';

// Import Lab Assets
import rahulSirVideo from '../assets/images/computer lab/rahul sir teach student.mp4';
import students1 from '../assets/images/computer lab/students (1).jpg';
import students2 from '../assets/images/computer lab/students (2).jpg';
import topper1 from '../assets/images/computer lab/scholership exam topper.jpg';


const LabGallery = () => {
    const { role } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin';
    const [dynamicImages, setDynamicImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'lab_gallery'), orderBy('createdAt', 'desc'), firestoreLimit(4));
        
        // Define Static Items for Preview immediately
        const staticItems = [
            {
                id: 'static-video',
                title: 'Practical Guidance: Rahul Sir',
                category: 'lab',
                imageUrl: rahulSirVideo,
                type: 'video',
                featured: true
            },
            {
                id: 'static-1',
                title: 'Professional Environment',
                category: 'lab',
                imageUrl: students1,
                type: 'image'
            },
            {
                id: 'static-2',
                title: 'Industry Standards',
                category: 'lab',
                imageUrl: students2,
                type: 'image'
            },
            {
                id: 'static-3',
                title: 'Achievement Hub',
                category: 'exam',
                imageUrl: topper1,
                type: 'image'
            }
        ];

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestoreItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Merge: Static items first to ensure they are always there
            // We want to make sure the Rahul Sir video is always in the grid
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
                            <video
                                src={img.imageUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700 scale-110 group-hover:scale-100"
                            />
                        ) : (
                            <div className="w-full h-full relative">
                                <img 
                                    src={img.imageUrl} 
                                    alt="" 
                                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-125"
                                />
                                <img
                                    src={img.imageUrl}
                                    alt={img.title}
                                    className="w-full h-full object-contain relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 scale-100 group-hover:scale-105"
                                />
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


export default function Home() {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const { user } = useAuth();
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationDone, setMigrationDone] = useState(false);
    const navigate = useNavigate();

    const isOwner = user?.email === 'coderafroj@gmail.com';

    const handleDataMigration = async () => {
        try {
            setIsMigrating(true);
            const response = await fetch('/src/assets/student data.csv');
            const csvText = await response.text();
            const count = await runMigration(csvText);
            setMigrationDone(true);
            alert(`Success! ${count} students migrated to database.`);
        } catch (err) {
            console.error("Migration failed:", err);
            alert("Migration failed. Check console.");
        } finally {
            setIsMigrating(false);
        }
    };

    const team = [
        { name: "Maisar Hussain", role: "Senior Teacher (Thiriya)", image: "/images/cd/maisar.jpg" },
        { name: "Rahul", role: "Founder & CEO", image: "/images/cd/rahul.jfif" },
        { name: "Coder Afroj", role: "Lead Instructor & Web Dev", image: "/images/cd/coderafroj.jpg" }
    ];

    const OrbEffect = () => {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white pointer-events-none z-0 flex items-center justify-center">
                {/* Massive Animated Orb */}
                <div className="relative w-[140vw] h-[140vw] md:w-[80vw] md:h-[80vw] flex items-center justify-center translate-y-[-10%] md:translate-y-0">
                    <motion.div 
                        animate={{ 
                            rotate: 360,
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute inset-0 rounded-full border-[1px] border-blue-500/10 shadow-[0_0_100px_rgba(59,130,246,0.1)]"
                    />
                    <motion.div 
                        animate={{ 
                            rotate: -360,
                            scale: [1.05, 1, 1.05]
                        }}
                        transition={{ 
                            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute inset-[10%] rounded-full border-[1px] border-indigo-500/10 shadow-[inner_0_0_80px_rgba(99,102,241,0.05)]"
                    />
                    
                    {/* Glowing Core */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 rounded-full blur-[120px]" />
                    
                    {/* Watermark Logo */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.08, scale: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="relative z-10 w-1/3 md:w-1/4 opacity-[0.08] grayscale select-none"
                    >
                        <img src="/logo.png" alt="ByteCore Watermark" className="w-full h-full object-contain" />
                    </motion.div>
                </div>

                {/* Subtle Grid & Grain */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-[length:50px_50px]"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
                
                {/* Massive Floating Text (Hidden on small screens) */}
                <div className="absolute bottom-10 left-10 opacity-[0.02] font-black text-[15vw] leading-none tracking-tighter text-slate-950 uppercase hidden lg:block select-none">
                    ENGINEER
                </div>
                
                {/* Bottom Protection Gradient */}
                <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
            </div>
        );
    };

    return (
        <div className="bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-900 font-sans">
            <SEO
                title="#1 Rank Offline Tech Lab in Bareilly"
                description="ByteCore Computer Centre is the BEST offline IT lab in Bareilly. We teach Web Development, Python, Full Stack, ADCA, Tally Prime. Contact Nariyawal and Thiriya centers."
                keywords="ByteCore, ByteCore Computer Centre, Computer Centre Bareilly, Coding classes Bareilly, Nariyawal computer centre, Thiriya computer centre, Best IT institute in Bareilly, Nariyawal hub, offline computer courses"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": "ByteCore Computer Centre",
                    "image": "https://bytecores.in/banner-og.png",
                    "@id": "https://bytecores.in",
                    "url": "https://bytecores.in",
                    "telephone": "+91XXXXXXXXXX",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Nariyawal & Thiriya",
                        "addressLocality": "Bareilly",
                        "addressRegion": "UP",
                        "postalCode": "243001",
                        "addressCountry": "IN"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": 28.3670,
                        "longitude": 79.4322
                    },
                    "openingHoursSpecification": {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday"
                        ],
                        "opens": "09:00",
                        "closes": "18:00"
                    },
                    "sameAs": [
                        "https://www.facebook.com/bytecore",
                        "https://www.instagram.com/bytecore"
                    ]
                }}
            />
            {/* --- ULTIMATE TECH HERO SECTION --- */}
            <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12">
                <OrbEffect />

                <div className="max-w-7xl mx-auto w-full relative z-20 px-6 pt-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        {/* Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="max-w-5xl mx-auto flex flex-col items-center"
                        >
                            <motion.div variants={itemVariants} className="mb-4">
                                <h1 className="text-6xl md:text-[120px] font-[1000] text-slate-900 leading-[0.95] tracking-[-0.04em] mb-4">
                                    TECH <span className="text-blue-600">MASTERY</span><br />
                                    <span className="text-slate-900">STARTS HERE.</span>
                                </h1>
                            </motion.div>

                            <motion.p
                                variants={itemVariants}
                                className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
                            >
                                Experience Bareilly's most advanced offline coding lab. We don't just teach courses; we build <strong className="text-slate-900 border-b-4 border-blue-500/20">Future Architects</strong>.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
                                <Link to="/courses" className="group relative w-full sm:w-auto">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                                    <div className="relative px-12 py-5 bg-slate-900 rounded-xl text-white font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl">
                                        Join The Network
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                    </div>
                                </Link>
                                <Link to="/about" className="w-full sm:w-auto px-12 py-5 rounded-xl bg-white text-slate-900 font-black uppercase tracking-[0.2em] text-[12px] border border-slate-200 hover:border-blue-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 text-center">
                                    Explore Lab
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* --- TECH MARQUEE (Modern Feature) --- */}
            <div className="py-12 bg-white border-y border-slate-100 overflow-hidden relative">
                <div className="flex whitespace-nowrap animate-scroll gap-20 items-center">
                    {[
                        "REACT JS", "PYTHON", "JAVA", "WEB DESIGN", "ADCA",
                        "FULL STACK", "TALLY PRIME", "CCC", "O LEVEL", "DIGITAL MARKETING",
                        "REACT JS", "PYTHON", "JAVA", "WEB DESIGN", "ADCA",
                        "FULL STACK", "TALLY PRIME", "CCC", "O LEVEL", "DIGITAL MARKETING"
                    ].map((tech, i) => (
                        <div key={i} className="text-slate-300 font-black text-2xl md:text-4xl tracking-tighter hover:text-blue-600 transition-colors cursor-default select-none">
                            {tech}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- BENTO GRID FEATURES (Modern Feature) --- */}
            <div className="py-32 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="max-w-3xl">
                            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline underline-offset-8 decoration-2 decoration-blue-100">Why Choose The Lab?</span>
                            <h2 className="text-4xl md:text-6xl font-[1000] text-slate-900 tracking-tight leading-[0.95]">Design your future with <span className="text-blue-600">Enterprise Standards</span>.</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Big Card 1 */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="md:col-span-2 md:row-span-2 p-12 rounded-[3.5rem] bg-slate-50 text-slate-900 relative overflow-hidden group border border-slate-100 shadow-sm"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                                <Database size={240} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-blue-500/20 text-white">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-4xl font-black mb-6 tracking-tight">Enterprise Lab Facility</h3>
                                <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-sm mb-12">Access high-performance workstations and professional dev environments used by top tech firms.</p>
                                <div className="mt-auto flex items-center gap-6">
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">ST</div>)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trusted by over 1,000 students</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Small Card 1 */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all"
                        >
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Award size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 mt-8 tracking-tight">ISO Certified</h3>
                                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Global recognition for your technical skills with our ISO verified certifications.</p>
                            </div>
                        </motion.div>

                        {/* Small Card 2 */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all"
                        >
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <Users size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 mt-8 tracking-tight">Direct Mentorship</h3>
                                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Learn from instructors with 10+ years of industry experience building software.</p>
                            </div>
                        </motion.div>

                        {/* Horizontal Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="md:col-span-2 p-10 rounded-[3.5rem] bg-slate-900 text-white flex items-center gap-10 relative overflow-hidden group"
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
                            <div className="flex-1 relative z-10">
                                <h3 className="text-3xl font-black mb-4 tracking-tight">Real-World Projects</h3>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">Build production-grade applications to populate your professional engineering portfolio.</p>
                            </div>
                            <div className="hidden sm:flex w-28 h-28 bg-white/10 backdrop-blur-xl rounded-3xl items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform shadow-2xl">
                                <Laptop size={48} className="text-blue-400" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* --- POPULAR COURSES PREVIEW --- */}
            <div className="py-24 bg-white border-b border-slate-100 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Accelerate Your Coding Career</span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                                World-Class <span className="text-purple-600">IT Training</span>.
                            </h2>
                        </div>
                        <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-full bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-xs border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2 group active:scale-95">
                            Check All Fees & Syllabus <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="relative mt-8">
                        <motion.div
                            className="flex gap-8 cursor-grab active:cursor-grabbing px-4 pb-12 overflow-visible"
                            drag="x"
                            dragConstraints={{ left: -1400, right: 0 }}
                            initial={{ x: 0 }}
                        >
                            {localCourses.filter(c => [1, 10, 8, 18, 7, 6, 21, 20].includes(c.id)).map((course) => (
                                <motion.div
                                    key={course.id}
                                    whileHover={{ y: -10 }}
                                    onClick={() => navigate(`/courses/${course.id || course.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                    className="min-w-[320px] md:min-w-[420px] bg-white rounded-[3rem] p-8 border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden group select-none"
                                >
                                    <div className="h-64 rounded-[2.5rem] bg-slate-50 mb-8 overflow-hidden relative shadow-inner border border-slate-100 flex items-center justify-center group-hover:bg-blue-50/50 transition-colors duration-500">
                                        <div className="w-full h-full p-4 relative z-10 flex items-center justify-center">
                                            <img
                                                src={course.illustration || `/images/courses/adca.png`}
                                                alt={course.title}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = "https://storyset.com/illustration/web-development-amico.svg";
                                                }}
                                            />
                                        </div>

                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm text-[10px] font-[1000] uppercase tracking-widest text-blue-600 z-20">
                                            {course.category}
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fee Status</span>
                                            <span className="text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                                                <CheckCircle size={12} /> Live Verification
                                            </span>
                                        </div>
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-blue-600 transition-all shadow-lg active:scale-90">
                                            <ArrowRight size={20} className="group-hover:-rotate-45 transition-transform" />
                                        </div>
                                    </div>

                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors"></div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Custom Navigation Hints */}
                        <div className="flex justify-center mt-4 gap-4">
                            <div className="h-1.5 w-12 bg-blue-600 rounded-full shadow-sm"></div>
                            <div className="h-1.5 w-4 bg-slate-200 rounded-full"></div>
                            <div className="h-1.5 w-4 bg-slate-200 rounded-full"></div>
                            <p className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400 self-center">Drag to explore more</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- OUR INSTRUCTORS / TEAM --- */}
            <div className="py-24 bg-[#f8fafc]" >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Mentorship</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Meet The <span className="text-blue-600">Experts</span>.</h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto">Learn from industry veterans who have built real-world applications and managed successful businesses.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {team.map((t, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-blue-100 rounded-[3rem] transform translate-y-4 group-hover:translate-y-2 transition-transform -z-10"></div>
                                <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-50 shadow-inner mb-6 relative">
                                        <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">{t.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-blue-600 mb-4">{t.role}</p>
                                    <div className="flex justify-center gap-1 text-amber-400 mb-2">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={12} className="fill-current" />)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div >

            {/* --- STUDENT LAB GALLERY (Bento Grid) --- */}
            <div className="py-32 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[200px] -z-10 transform -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px] -z-10"></div>

                <div className="max-w-7xl mx-auto text-center z-10 relative mb-16 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            Authentic Environment
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 italic">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-400">ByteCore Lab</span> Experience
                        </h2>
                        <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                            Step inside our state-of-the-art computer labs. This is where theory meets practice, and students transform into industry-ready professionals.
                        </p>
                    </motion.div>
                </div>

                <LabGallery />

                {/* Added CTA Button to Full Gallery */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center mt-16 px-6"
                >
                    <Link
                        to="/gallery"
                        className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:shadow-blue-500/20 transition-all active:scale-95 border border-white/10"
                    >
                        Explore Full Gallery
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    </Link>
                </motion.div>

                {/* Dynamic Student Dome Gallery  */}
                <div className="mt-24 transition-all hover:opacity-100 group">
                    <div className="text-center mb-10 px-6">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4"
                        >
                            Our Growing Tech Family
                        </motion.span>
                        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                            The <span className="text-blue-500">ByteCore</span> Faces.
                        </h3>
                    </div>
                    <DomeGallery />
                </div>
            </div>

            {/* --- CTA BANNER --- */}
            < div className="py-20 px-6 bg-slate-50" >
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-[3rem] bg-slate-900 overflow-hidden p-12 md:p-20 text-center shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-transparent opacity-50"></div>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Building className="w-64 h-64 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-6">Start Your Tech Journey Offline.</h2>
                            <p className="text-slate-400 font-bold text-lg mb-10 max-w-xl mx-auto">Visit our Nariyawal Campus for direct counseling, or register your profile online to view your course dashboard instantly.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link to="/register" className="px-10 py-4 rounded-xl bg-white text-slate-900 font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/50 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    Register Online <ArrowRight size={16} />
                                </Link>
                                <Link to="/about" className="px-10 py-4 rounded-xl bg-slate-800 text-white border border-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    Location & Contact
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* --- SECRET ADMIN MIGRATION TOOL --- */}
            {
                isOwner && (
                    <div className="fixed bottom-10 left-10 z-[100]">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 flex items-center gap-4"
                        >
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Database size={20} />
                            </div>
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Admin</div>
                                <h4 className="text-xs font-black text-slate-900 uppercase">MIGRATE DATA</h4>
                            </div>
                            <button
                                disabled={isMigrating || migrationDone}
                                onClick={handleDataMigration}
                                className={cn(
                                    "py-2 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white transition-all shadow-md active:scale-95",
                                    migrationDone ? "bg-emerald-500 shadow-emerald-200" : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                                )}
                            >
                                {isMigrating ? <Loader2 className="animate-spin" size={14} /> : (migrationDone ? <CheckCircle size={14} /> : <Zap size={14} />)}
                                {migrationDone ? 'Done' : 'Execute'}
                            </button>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
}
