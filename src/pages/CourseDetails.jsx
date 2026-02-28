import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock, Users, BookOpen, Star, CheckCircle, Target,
    ArrowRight, BookMarked, Download, FileText, Link as LinkIcon, AlertCircle, Loader2
} from 'lucide-react';
import { courses as localCourses } from '../data/courses';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

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
            {/* --- HERO BANNER --- */}
            <div className="relative bg-slate-900 text-white overflow-hidden pt-20 pb-32">
                <div className="absolute inset-0 z-0">
                    {course.image ? (
                        <>
                            <img src={course.image.startsWith('/') || course.image.startsWith('http') ? course.image : `/${course.image}`} alt={course.title} className="w-full h-full object-cover opacity-20" />
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

                        {/* Syllabus Accordion / Outline */}
                        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <FileText className="text-blue-600 w-8 h-8" />
                                    Course Syllabus
                                </h2>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    {(course.syllabus?.length || 0)} Modules
                                </span>
                            </div>

                            <div className="space-y-4">
                                {course.syllabus && course.syllabus.length > 0 ? (
                                    course.syllabus.map((syl, idx) => (
                                        <div key={idx} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition-all group bg-slate-50/50 hover:bg-white">
                                            <div className="flex gap-6 items-start">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{syl.module || `Module ${idx + 1}`}</h4>
                                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{syl.details || "Comprehensive practical covering essential foundations and advanced problem solving patterns."}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold max-w-sm mx-auto">Detailed curriculum information is being updated by the instructors. Check back soon for full module breakdowns.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Sticky Enrollment Card */}
                    <div className="lg:w-[400px] order-1 lg:order-2">
                        <div className="sticky top-32 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-transform hover:-translate-y-1 duration-500">

                            {/* Card Image */}
                            <div className="h-56 bg-slate-100 relative">
                                {course.image ? (
                                    <img src={course.image.startsWith('/') || course.image.startsWith('http') ? course.image : `/${course.image}`} alt={course.title} className="w-full h-full object-cover" />
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
