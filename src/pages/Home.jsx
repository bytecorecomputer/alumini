import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from "react-helmet-async";
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Users, CheckCircle, Database, Loader2, Zap,
    Laptop, GraduationCap, Award, MapPin, Building, Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import heroGraphic from '../assets/images/hero_graphic.png';
import { useAuth } from '../app/common/AuthContext';
import { runMigration } from '../lib/migrateStudents';
import { cn } from '../lib/utils';
import { courses as localCourses } from '../data/courses';

// Import Lottie Animations
import heroLottie from '../assets/lottie/hero.json';
import webLottie from '../assets/lottie/web.json';
import dataLottie from '../assets/lottie/data.json';
import pythonLottie from '../assets/lottie/python.json';

const DomeCarousel = () => {
    const students = [
        "ABHISHEK (DCST).jpg", "ADIL (DCST).jpg", "ADITYA (ADCA).jpg", "ADITYA (DCST).jpg",
        "AJAY (DFA).jpg", "AMAN (DCST).jpg", "AMAR (TALLY).jpg", "AMIR (ADCA).jpg",
        "ANIKET (DCST).jpg", "ANISH (TALLY0.jpg", "ANUJ (DCST).jpg", "ARFAT (ADCA).jpg",
        "ARIF (DCST).jpg", "ARISH (DCA).jpg", "ARVIND (DCST).jpg"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % students.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [students.length, isHovered]);

    return (
        <div
            className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden flex-col md:flex-row perspective-[1200px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
        >
            <AnimatePresence initial={false}>
                {students.map((file, i) => {
                    let diff = i - currentIndex;
                    if (diff > students.length / 2) diff -= students.length;
                    if (diff < -students.length / 2) diff += students.length;

                    // Optimize by not rendering elements too far away
                    if (Math.abs(diff) > 3) return null;

                    const match = file.match(/^(.+)\s\((.+)\)\.jpg$/);
                    const name = match ? match[1] : file.replace('.jpg', '');
                    const course = match ? match[2] : "Student";

                    // Added active state reflection and deeper 3D transforms
                    const isActive = Math.abs(diff) === 0;

                    return (
                        <motion.div
                            key={file}
                            initial={{ opacity: 0, x: diff > 0 ? (isMobile ? 100 : 300) : -(isMobile ? 100 : 300), rotateY: diff * -30 }}
                            animate={{
                                opacity: isActive ? 1 : Math.abs(diff) === 1 ? 0.7 : 0.2,
                                x: diff * (isMobile ? 140 : 250),
                                scale: isActive ? 1 : 1 - Math.abs(diff) * (isMobile ? 0.15 : 0.2),
                                zIndex: 10 - Math.abs(diff),
                                rotateY: diff * -25,
                                z: isActive ? 50 : Math.abs(diff) * -100
                            }}
                            transition={{ duration: 0.8, type: "spring", damping: 20, stiffness: 100, mass: 1 }}
                            className={cn(
                                "absolute w-[260px] md:w-[400px] h-[360px] md:h-[500px] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden cursor-pointer",
                                isActive ? "border-2 border-blue-400/50 shadow-[0_0_50px_rgba(59,130,246,0.3)]" : "border border-slate-700/50 shadow-black/50"
                            )}
                            onClick={() => setCurrentIndex(i)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-70"></div>
                            <img
                                src={`/images/students/${file}`}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 z-20">
                                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-600/50 p-3 md:p-4 rounded-3xl text-left">
                                    <h3 className="text-lg md:text-xl font-black text-white">{name}</h3>
                                    <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full mt-2 inline-block">{course}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
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
        { name: "Maisar Hussain", role: "Centre Director", image: "/images/cd/maisar.jpg" },
        { name: "Rahul", role: "Founder & CEO", image: "/images/cd/rahul.jfif" },
        { name: "Coder Afroj", role: "Lead Instructor & Web Dev", image: "/images/cd/coderafroj.jpg" }
    ];

    const AuroraBackground = () => {
        return (
            <div className="absolute inset-0 overflow-hidden bg-slate-950 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay z-10"></div>
                <div className="absolute -inset-[20%] opacity-50">
                    <motion.div
                        animate={{
                            x: ["-10%", "10%", "-10%"],
                            y: ["10%", "-10%", "10%"]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute h-[60vh] w-[60vw] rounded-full bg-blue-600/30 blur-[130px] top-[-10%] left-[-10%]"
                    />
                    <motion.div
                        animate={{
                            x: ["10%", "-10%", "10%"],
                            y: ["-10%", "10%", "-10%"]
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute h-[70vh] w-[70vw] rounded-full bg-indigo-600/30 blur-[150px] top-[10%] right-[-10%]"
                    />
                    <motion.div
                        animate={{
                            x: ["-15%", "15%", "-15%"],
                            y: ["-15%", "15%", "-15%"]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute h-[50vh] w-[50vw] rounded-full bg-purple-600/20 blur-[120px] bottom-[-10%] right-[10%]"
                    />
                    <motion.div
                        animate={{
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-40 mix-blend-screen"
                        style={{
                            backgroundImage: `repeating-linear-gradient(100deg,transparent,rgba(255,255,255,0.03) 1px,transparent 3px),repeating-linear-gradient(10deg,rgba(0,0,0,0.05),rgba(0,0,0,0) 2px,transparent 3px)`
                        }}
                    />
                </div>
                {/* Tech Grid overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-[length:50px_50px]"></div>
                {/* Fade to white at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent z-20"></div>
            </div>
        );
    };



    return (
        <div className="bg-[#f8fafc] overflow-hidden selection:bg-blue-100 selection:text-blue-900 font-sans">
            <Helmet>
                <title>ByteCore Computer Centre | #1 Rank Offline Tech Lab in Bareilly</title>
                <meta name="description" content="ByteCore Computer Centre is the BEST offline IT lab in Bareilly. We teach Web Development, Python, Full Stack, ADCA, Tally Prime. Contact Nariyawal and Thiriya centers." />
                <meta name="keywords" content="ByteCore, ByteCore Computer Centre, Computer Centre Bareilly, Coding classes Bareilly, Nariyawal computer centre, Thiriya computer centre, Best IT institute in Bareilly, Nariyawal hub, offline computer courses" />
            </Helmet>
            {/* --- ULTIMATE TECH HERO SECTION --- */}
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <AuroraBackground />

                <div className="max-w-7xl mx-auto w-full relative z-20 px-6 pt-20">
                    <div className="flex flex-col items-center justify-center text-center py-20 pb-32">
                        {/* Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="max-w-4xl mx-auto flex flex-col items-center"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-8 transform hover:scale-105 transition-transform">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">The #1 Choice for Offline Learning</span>
                            </motion.div>

                            <motion.div variants={itemVariants} className="mb-6">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-300 uppercase tracking-[0.4em] mb-4 leading-none drop-shadow-md">BYTECORE</h2>
                                <h1 className="text-6xl md:text-[100px] font-[1000] text-white leading-[1.1] tracking-tighter drop-shadow-2xl">
                                    COMPUTER <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 uppercase">CENTRE.</span>
                                </h1>
                            </motion.div>

                            <motion.div variants={itemVariants} className="mb-8">
                                <span className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight italic drop-shadow-lg">
                                    "Tech Mastery <span className="text-blue-400">Starts Here.</span>"
                                </span>
                            </motion.div>

                            <motion.p
                                variants={itemVariants}
                                className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-md"
                            >
                                Step into the most advanced offline lab in Bareilly. We don't just teach software; we build <strong className="text-white relative inline-block">Digital Masters<div className="absolute bottom-1 left-0 w-full h-1 bg-blue-500 rounded-full"></div></strong>.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
                                <Link to="/courses" className="group relative w-full sm:w-auto">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                                    <div className="relative px-12 py-5 bg-white rounded-xl text-slate-900 font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl">
                                        Join The Mastery
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                    </div>
                                </Link>
                                <Link to="/about" className="w-full sm:w-auto px-12 py-5 rounded-xl bg-slate-900/50 backdrop-blur-md text-white font-black uppercase tracking-[0.2em] text-[12px] border border-slate-600 hover:border-blue-400 hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-center">
                                    Explore Centre
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Gradient Fade to transition smoothly to white section below */}
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
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
            <div className="py-24 bg-[#f8fafc] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center lg:text-left mb-16">
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block underline underline-offset-8 decoration-2 decoration-blue-100">Why Bytecore?</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Succeed</span>.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Big Card 1 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 md:row-span-2 p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group border border-slate-800"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Database size={200} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
                                    <Zap size={28} />
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tight">Enterprise Lab Facility</h3>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">Access high-performance systems and professional work environments that mimic modern software companies.</p>
                                <div className="mt-12 flex items-center gap-4">
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">ST</div>)}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">Joined by 10k+ local scholars</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Small Card 1 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group"
                        >
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                                <Award size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 mt-6">Certifications</h3>
                                <p className="text-slate-500 text-sm font-medium">Govt. recognized and ISO verified certificates that value your efforts.</p>
                            </div>
                        </motion.div>

                        {/* Small Card 2 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group"
                        >
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 mt-6">Mentorship</h3>
                                <p className="text-slate-500 text-sm font-medium">Direct training from industry experts who have built massive projects.</p>
                            </div>
                        </motion.div>

                        {/* Horizontal Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center gap-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black mb-2 tracking-tight">Real World Projects</h3>
                                <p className="text-white/80 text-sm font-medium">Build sites like this one and more to populate your professional portfolio.</p>
                            </div>
                            <div className="hidden sm:flex w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30">
                                <Laptop size={40} />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {localCourses.slice(0, 3).map((course, i) => {
                            // Map local lotties
                            const lottieMap = {
                                'Full Stack Development': webLottie,
                                'Data Science & AI': dataLottie,
                                'Python Programming': pythonLottie
                            };
                            const animationData = lottieMap[course.title];

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    key={course.id}
                                    onClick={() => navigate(`/courses/${course.id || course.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                    className="bg-[#f8fafc] rounded-[2rem] p-6 border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
                                >
                                    <div className="h-56 rounded-2xl bg-white mb-6 overflow-hidden relative shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-lg transition-all">
                                        {animationData ? (
                                            <div className="w-full h-full p-4">
                                                <Lottie
                                                    animationData={animationData}
                                                    loop={true}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                        ) : (
                                            <img
                                                src={course.illustration || "https://edit.storyset.com/images/illustrations/web-development-amico.svg"}
                                                alt={course.title}
                                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                                            />
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-800">
                                            {course.category}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">{course.title}</h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 flex-grow">{course.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                        <span className="text-emerald-600 font-black text-xs uppercase tracking-widest">Verify Fee Inside</span>
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                                            <ArrowRight size={16} className="group-hover:-rotate-45 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- OUR INSTRUCTORS / TEAM --- */}
            <div className="py-24 bg-[#f8fafc]">
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
                                        <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
            </div>

            {/* --- STUDENT DOME GALLERY (React Bits Style) --- */}
            <div className="py-32 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] -z-10 transform -translate-x-1/2"></div>
                <div className="max-w-[100vw] mx-auto text-center z-10 relative overflow-hidden">
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Proven Results</span>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 relative z-20">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ByteCore Dome</span></h2>
                    <p className="text-slate-400 font-medium mb-12 max-w-2xl mx-auto text-lg px-6 relative z-20">Discover the incredible environment where our students build projects, attend intensive offline labs, and map their success.</p>

                    <DomeCarousel />

                </div>
            </div>

            {/* --- CTA BANNER --- */}
            <div className="py-20 px-6 bg-slate-50">
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
            </div>

            {/* --- SECRET ADMIN MIGRATION TOOL --- */}
            {isOwner && (
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
            )}
        </div>
    );
}
