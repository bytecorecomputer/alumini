import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock, Users, BookOpen, Star, CheckCircle, Target,
    ArrowRight, BookMarked, Download, FileText, Link as LinkIcon, AlertCircle, Loader2,
    Laptop, Code, Table, Presentation, Image as ImageIcon, PenTool, Calculator, Activity, Wifi, ShoppingBag, Book, Monitor, Keyboard
} from 'lucide-react';
import { courses as localCourses } from '../data/courses';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import SEO from '../components/common/SEO';
import { COURSE_MODULES_MAP } from '../data/curriculum';
import { QUIZ_BANK } from '../lib/quizData';
import { cn } from '../lib/utils';

const ICON_MAP = {
    Monitor, Keyboard, FileText, Table, Presentation, ImageIcon, PenTool, Code, Activity, Wifi, Calculator, ShoppingBag, Book
};

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firebaseData, setFirebaseData] = useState(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // 1. First, check local rich metadata (images, syllabus, description, etc)
                // Try to find by id, matching numeric or string
                const localData = localCourses.find(c => c.id.toString() === id.toString() || c.title.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase());

                // 2. Fetch from Firebase for dynamic pricing and live stats
                // The document ID in Firebase might exactly match the URL id (e.g. "ADCA")
                // Here we attempt a lookup
                let fbData = null;
                try {
                    // Try to lookup based on route ID first
                    const docRef = doc(db, "courses", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        fbData = { id: docSnap.id, ...docSnap.data() };
                    } else if (localData) {
                        // Fallback: try to lookup based on localData title if different
                        const fallbackRef = doc(db, "courses", localData.title);
                        const fallbackSnap = await getDoc(fallbackRef);
                        if (fallbackSnap.exists()) {
                            fbData = { id: fallbackSnap.id, ...fallbackSnap.data() };
                        }
                    }
                } catch (fbError) {
                    console.log("Firebase course fetch missed:", fbError);
                }

                setFirebaseData(fbData);

                // Merge data (Local provides rich UI data, Firebase provides dynamic fee/updated config)
                if (localData || fbData) {
                    setCourse({
                        ...localData, // Rich UI content
                        ...fbData,    // Firebase dynamic overwrites (like overriding fee with fbData.fee)
                        price: fbData?.fee || fbData?.price || localData?.price || "Contact for Pricing",
                        title: fbData?.name || localData?.title || id,
                    });
                } else {
                    // 404 Case
                    setCourse(null);
                }

            } catch (error) {
                console.error("Error building course profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-20">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
                <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Course Data</h2>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-20 px-4 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Course Not Found</h1>
                <p className="text-slate-500 mb-8 max-w-md font-medium">The course you are looking for might have been removed, renamed, or is temporarily unavailable.</p>
                <button
                    onClick={() => navigate('/courses')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                >
                    Back to Catalog
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-24 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
            <SEO
                title={course.title}
                description={course.description || `Master ${course.title} at ByteCore Computer Centre. Professional offline IT training in Bareilly.`}
                image={course.image ? (course.image.startsWith('/') || course.image.startsWith('http') ? course.image : `/${course.image}`) : undefined}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": course.title,
                    "description": course.description,
                    "provider": {
                        "@type": "Organization",
                        "name": "ByteCore Computer Centre",
                        "sameAs": "https://bytecores.in"
                    },
                    "occupationalCredentialAwarded": "Professional Certification",
                    "courseMode": "Offline Lab",
                    "hasCourseInstance": {
                        "@type": "CourseInstance",
                        "courseMode": "Offline",
                        "location": "Bareilly, Nariyawal & Thiriya"
                    },
                    "offers": {
                        "@type": "Offer",
                        "category": "Education",
                        "price": typeof course.price === 'number' ? course.price : undefined,
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock"
                    }
                }}
            />
            {/* --- HERO BANNER --- */}
            <div className="relative bg-slate-900 text-white overflow-hidden pt-20 pb-32">
                <div className="absolute inset-0 z-0">
                    {course.image ? (
                        <>
                            <img src={course.image.startsWith('/') || course.image.startsWith('http') ? course.image : `/${course.image}`} alt={course.title} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/70"></div>
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/40 to-purple-900/40 opacity-80"></div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black tracking-[0.2em] uppercase border border-white/20 shadow-xl"
                            >
                                {course.category || "Professional Certification"}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight"
                            >
                                {course.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mb-10 leading-relaxed"
                            >
                                {course.description || "Master the skills needed to excel in this field with our comprehensive, offline-first curriculum."}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-4 items-center"
                            >
                                <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                                    <span className="font-black text-white text-sm">{course.rating || "4.8"}</span>
                                    <span className="text-slate-400 text-xs font-bold ml-1">({course.reviews || "120+"} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span className="font-black text-white text-sm">{course.enrolled || "500+"}</span>
                                    <span className="text-slate-400 text-xs font-bold ml-1">Enrolled</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                                    <BookOpen className="w-4 h-4 text-emerald-400" />
                                    <span className="font-black text-white text-sm uppercase tracking-wider text-xs">{course.level || "Beginner to Advanced"}</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-16">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Main Content Area */}
                    <div className="flex-1 order-2 lg:order-1 pt-16 lg:pt-0 pb-16">

                        {/* Overview Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            {[
                                { label: "Duration", val: course.duration || "Self-Paced", icon: <Clock /> },
                                { label: "Modules", val: (course.syllabus?.length || 5) + " Core", icon: <Target /> },
                                { label: "Certificate", val: "Verified", icon: <CheckCircle /> },
                                { label: "Format", val: "Offline Lab", icon: <BookMarked /> }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-colors">
                                    <div className="text-slate-400 mb-3 group-hover:text-blue-600 transition-colors">
                                        {React.cloneElement(stat.icon, { className: "w-6 h-6" })}
                                    </div>
                                    <div className="text-lg font-black text-slate-900 tracking-tight">{stat.val}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* What you'll learn */}
                        <div className="bg-white rounded-[2rem] p-8 md:p-10 mb-10 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                                <Target className="text-blue-600 w-8 h-8" />
                                What you will learn
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(course.requirements || [
                                    "Master core foundational concepts from scratch.",
                                    "Build real-world projects and robust portfolios.",
                                    "Implement industry-standard practices and workflows.",
                                    "Prepare for advanced certification and job placement."
                                ]).map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="mt-1">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <span className="text-slate-600 font-medium text-sm leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Syllabus / Module Grid */}
                        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">
                                        Course <span className="text-blue-600">Syllabus</span>.
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm">Comprehensive modules designed to take you from absolute beginner to industry expert.</p>
                                </div>
                                <span className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100 self-start md:self-center">
                                    {(() => {
                                        let courseKey = id.toUpperCase();
                                        if (!COURSE_MODULES_MAP[courseKey]) {
                                            courseKey = Object.keys(COURSE_MODULES_MAP).find(k => id.toLowerCase().includes(k.toLowerCase())) || "default";
                                        }
                                        return COURSE_MODULES_MAP[courseKey].length;
                                    })()} Core Modules
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(() => {
                                    let courseKey = id.toUpperCase();
                                    if (!COURSE_MODULES_MAP[courseKey]) {
                                        courseKey = Object.keys(COURSE_MODULES_MAP).find(k => id.toLowerCase().includes(k.toLowerCase())) || "default";
                                    }
                                    const modulesList = COURSE_MODULES_MAP[courseKey] || [];
                                    
                                    return modulesList.map((modId, idx) => {
                                        const modData = QUIZ_BANK[modId] || { title: modId.replace('_', ' ').toUpperCase(), description: 'Study material', icon: 'Book', color: 'blue' };
                                        const IconComponent = ICON_MAP[modData.icon] || Book;

                                        return (
                                            <motion.div
                                                key={modId}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
                                            >
                                                <div className="flex items-start gap-6">
                                                    <div className={cn(
                                                        "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform",
                                                        modData.color === 'blue' ? 'bg-blue-600' :
                                                        modData.color === 'emerald' ? 'bg-emerald-600' :
                                                        modData.color === 'orange' ? 'bg-orange-600' :
                                                        modData.color === 'green' ? 'bg-green-600' :
                                                        modData.color === 'yellow' ? 'bg-yellow-500' :
                                                        modData.color === 'slate' ? 'bg-slate-600' :
                                                        modData.color === 'indigo' ? 'bg-indigo-600' :
                                                        modData.color === 'cyan' ? 'bg-cyan-600' :
                                                        modData.color === 'teal' ? 'bg-teal-600' :
                                                        modData.color === 'red' ? 'bg-red-600' : 'bg-blue-600'
                                                    )}>
                                                        <IconComponent size={28} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Module {idx + 1}</span>
                                                            {idx === 0 && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black rounded-md uppercase tracking-tighter">Foundation</span>}
                                                        </div>
                                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{modData.title}</h4>
                                                        <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">{modData.description}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                    </div>

                    {/* Right Sticky Enrollment Card */}
                    <div className="lg:w-[400px] order-1 lg:order-2">
                        <div className="sticky top-32 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-transform hover:-translate-y-1 duration-500">

                            {/* Card Image */}
                            <div className="h-56 bg-slate-100 relative">
                                {course.image ? (
                                    <img src={course.image.startsWith('/') || course.image.startsWith('http') ? course.image : `/${course.image}`} alt={course.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                        <BookMarked className="w-20 h-20 text-slate-200" />
                                    </div>
                                )}
                                {firebaseData?.fee !== undefined && (
                                    <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-400 shadow-lg flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div> Live Fee Data
                                    </div>
                                )}
                            </div>

                            <div className="p-8">
                                {/* Price */}
                                <div className="mb-8">
                                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Investment</span>
                                    <div className="flex items-end gap-3">
                                        <span className="text-5xl font-black text-slate-900 tracking-tighter">
                                            {typeof course.price === 'number' ? `₹${course.price.toLocaleString()}` : course.price}
                                        </span>
                                    </div>
                                </div>

                                {/* Enrollment CTA */}
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group mb-4 active:scale-95"
                                >
                                    Enroll Now
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-center text-[10px] font-bold text-slate-400 mb-8 border-b border-slate-100 pb-8">
                                    30-Day Money-Back Guarantee • Full Lifetime Access
                                </p>

                                {/* Course Meta */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-500 font-medium"><BookOpen className="w-4 h-4" /> Certification</span>
                                        <span className="font-bold text-slate-900">Yes, ISO Certified</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-500 font-medium"><Users className="w-4 h-4" /> Instructor</span>
                                        <span className="font-bold text-slate-900 text-right max-w-[150px] truncate">{course.instructor || "Er. Coder Afroj"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-500 font-medium"><LinkIcon className="w-4 h-4" /> Access</span>
                                        <span className="font-bold text-slate-900">Offline Campus Lab</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
