import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Clock, Users, Star, ArrowRight, BookMarked, Loader2 } from 'lucide-react';
import { courses as localCourses } from '../data/courses';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';

const Courses = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState("All");
    const [firebaseCourses, setFirebaseCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "courses"));
                const fetchedCourses = [];
                querySnapshot.forEach((doc) => {
                    fetchedCourses.push({ id: doc.id, ...doc.data() });
                });
                setFirebaseCourses(fetchedCourses);
            } catch (error) {
                console.error("Error fetching courses from Firebase: ", error);
                // Fallback or error handling
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Merge Firebase courses with local rich data so UI (images, tags, descriptions) isn't lost
    const displayCourses = localCourses.map(localCourse => {
        const fbMatch = firebaseCourses.find(fb =>
            fb.id.toLowerCase() === localCourse.title.toLowerCase() ||
            fb.name?.toLowerCase() === localCourse.title.toLowerCase() ||
            fb.id === localCourse.id?.toString()
        );
        return {
            ...localCourse,
            price: fbMatch?.fee || fbMatch?.price || localCourse.price || "Contact for Pricing",
        };
    });

    const categories = ["All", ...new Set(displayCourses.map(c => c.category || "General"))];

    const filteredCourses = displayCourses.filter(course => {
        const titleMatch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const tagMatch = course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSearch = titleMatch || descMatch || tagMatch;
        const matchesCategory = activeCategory === "All" || course.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Hero Section */}
            <div className="relative max-w-7xl mx-auto mb-16 text-center z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] border border-blue-100"
                >
                    Learning Ecosystem
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-slate-900"
                >
                    Explore Our <span className="text-blue-600">Premium</span> Courses
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10"
                >
                    Unlock your potential with our industry-leading courses designed to help you master the future of technology.
                </motion.p>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl mx-auto relative group"
                >
                    <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative flex items-center bg-white rounded-full border border-slate-200 p-2 shadow-xl hover:border-blue-300 transition-colors">
                        <Search className="text-slate-400 ml-4 mr-2 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for a course, skill, or tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none flex-1 py-3 text-slate-800 placeholder-slate-400 font-bold"
                        />
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((category, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${activeCategory === category
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Course Grid Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Featured <span className="text-blue-600">Programs</span></h2>
                    <div className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                        {loading ? "Loading..." : `${filteredCourses.length} Courses Found`}
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-600" />
                        <p className="font-black uppercase tracking-widest text-sm">Fetching Latest Courses</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No courses found</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">We couldn't find any courses matching your criteria. Please try a different keyword or category.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence>
                            {filteredCourses.map((course) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={course.id}
                                    onClick={() => navigate(`/courses/${course.id || course.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                    className="group relative bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-all duration-500 flex flex-col h-full overflow-hidden cursor-pointer"
                                >
                                    {/* Hover effect background */}
                                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${course.color || "from-blue-500 to-purple-500"} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-[2rem] z-0`}></div>

                                    <div className="relative z-10 flex-grow flex flex-col">
                                        {/* Course Image Wrapper */}
                                        <div className="relative h-56 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-[2rem]">
                                            {course.image ? (
                                                <img
                                                    src={course.image.startsWith('/') || course.image.startsWith('http') ? course.image : `/${course.image}`}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${course.color || "from-slate-200 to-slate-100"} transform group-hover:scale-105 transition-transform duration-700 flex items-center justify-center opacity-90`}>
                                                    <BookMarked className="w-20 h-20 text-slate-300 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>

                                            {/* Tags container */}
                                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                {(course.tags || []).slice(0, 2).map((tag, i) => (
                                                    <span key={i} className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm ${tag.toLowerCase() === 'popular' || tag.toLowerCase() === 'high-demand' ? 'bg-amber-400 text-amber-950' : 'bg-white/90 text-slate-800'}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute bottom-4 left-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30">
                                                    {course.category || "Course"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 tracking-tight">
                                                {course.title}
                                            </h3>
                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1.5 rounded-lg shrink-0 border border-amber-100">
                                                <span className="font-black text-xs">{course.rating || "4.5"}</span>
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                            </div>
                                        </div>

                                        <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow font-medium leading-relaxed">
                                            {course.description}
                                        </p>

                                        <div className="grid grid-cols-3 gap-2 mb-6 py-4 border-y border-slate-100 bg-slate-50/50 rounded-2xl">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <Clock className="w-4 h-4 text-blue-500 mb-1.5" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {course.duration || "Self-Paced"}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center text-center border-x border-slate-200">
                                                <Users className="w-4 h-4 text-purple-500 mb-1.5" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {course.enrolled || "50+"} Enrolled
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <BookOpen className="w-4 h-4 text-emerald-500 mb-1.5" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest line-clamp-1 truncate">
                                                    {course.level || "Beginner"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end mt-auto">
                                            <div>
                                                <span className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Course Fee</span>
                                                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                                    ₹{course.price ? course.price.toLocaleString() : "TBD"}
                                                </span>
                                            </div>
                                            <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 shadow-sm border border-slate-200 group-hover:border-transparent">
                                                <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Courses;
