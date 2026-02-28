import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, Users, CheckCircle, Database, Loader2, Zap,
    Laptop, GraduationCap, Award, MapPin, Building, Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import bcc from '../assets/BANNER.jpg';
import { useAuth } from '../app/common/AuthContext';
import { runMigration } from '../lib/migrateStudents';
import { cn } from '../lib/utils';
import { courses as localCourses } from '../data/courses';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCards, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/free-mode';


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



    return (
        <div className="bg-[#f8fafc] overflow-hidden selection:bg-blue-100 selection:text-blue-900 font-sans">
            {/* --- ULTIMATE HERO SECTION --- */}
            <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white px-6">
                {/* Advanced Background Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[140px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[140px] animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-50/50 rounded-full blur-[100px] animate-bounce" style={{ animationDuration: '8s' }}></div>

                <div className="max-w-7xl mx-auto w-full relative z-20">
                    <div className="flex flex-col lg:flex-row items-center gap-20 py-20">
                        {/* Left Side: Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex-1 text-center lg:text-left"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 border border-slate-800 shadow-2xl mb-10 transform -rotate-1 hover:rotate-0 transition-transform">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Bareilly's #1 Ranked Campus</span>
                            </motion.div>

                            <motion.div variants={itemVariants} className="relative inline-block mb-10">
                                <img
                                    src="/assets/img/logo.png"
                                    alt="Bytecore"
                                    className="h-24 md:h-32 object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="absolute -bottom-4 -right-10 px-4 py-1.5 bg-blue-600 rounded-lg text-[10px] font-black text-white uppercase tracking-widest -rotate-6 shadow-xl">14+ Years</div>
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-7xl md:text-[110px] font-[1000] text-slate-900 leading-[0.85] tracking-[-0.06em] mb-10"
                            >
                                CRAFTING <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">THE FUTURE.</span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed tracking-tight"
                            >
                                Join an elite community where high-end development meets creative design. <strong className="text-slate-900">Bytecore Offline Campus</strong> is where Bareilly’s best tech talent is forged.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                                <Link to="/courses" className="group relative w-full sm:w-auto">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative px-10 py-5 bg-slate-900 rounded-xl text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-95 transition-all">
                                        Explore Premium Fees
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                    </div>
                                </Link>
                                <Link to="/about" className="w-full sm:w-auto px-10 py-5 rounded-xl bg-white text-slate-900 font-black uppercase tracking-[0.2em] text-xs border-2 border-slate-100 hover:border-blue-600 hover:text-blue-600 transition-all shadow-xl shadow-slate-200/50 active:scale-95 text-center">
                                    Our Legacy
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Right Side: Visual Masterpiece */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                            className="flex-1 relative w-full max-w-2xl"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 border-2 border-blue-100 rounded-full -z-10 animate-spin-slow"></div>
                            <div className="absolute -bottom-10 -right-10 w-60 h-60 border-2 border-purple-100 rounded-[3rem] -z-10 animate-reverse-spin"></div>

                            <div className="relative z-10 p-4 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)]">
                                <div className="rounded-[3.5rem] overflow-hidden relative group">
                                    <img
                                        src={bcc}
                                        alt="Campus"
                                        className="w-full h-[550px] object-cover transition-transform duration-[2s] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 to-transparent"></div>

                                    {/* Glass Floating Badges */}
                                    <motion.div
                                        animate={{ y: [0, -20, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute top-10 right-10 p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white flex items-center gap-4"
                                    >
                                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><CheckCircle size={24} /></div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ISO Certified</div>
                                            <div className="text-lg font-black text-slate-900">Govt. Verified</div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 20, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className="absolute bottom-10 left-10 p-6 bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700 flex items-center gap-4"
                                    >
                                        <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg"><Award size={24} /></div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumni Network</div>
                                            <div className="text-lg font-black text-white">10,000+ Success</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Center Pin Indicator */}
                            <div className="absolute top-1/2 left-[-10%] translate-y-[-50%] p-5 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-bounce hidden lg:block" style={{ animationDuration: '4s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500"><MapPin size={24} /></div>
                                    <div className="pr-4">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visit Offline</div>
                                        <div className="text-xs font-black text-slate-900">Bareilly Campus</div>
                                    </div>
                                </div>
                            </div>
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
                        {localCourses.slice(0, 3).map((course, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                key={course.id}
                                onClick={() => navigate(`/courses/${course.id || course.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                className="bg-[#f8fafc] rounded-[2rem] p-6 border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
                            >
                                <div className="h-48 rounded-2xl bg-white mb-6 overflow-hidden relative shadow-sm border border-slate-100">
                                    {course.image ? (
                                        <img src={course.image.startsWith('/') || course.image.startsWith('http') ? course.image : `/${course.image}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <Laptop className="w-12 h-12 text-slate-300" />
                                        </div>
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
                        ))}
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

            {/* --- STUDENT GALLERY PREVIEW INTERACTIVE SWIPER --- */}
            <div className="py-32 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] -z-10 transform -translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-6 text-center z-10 relative">
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Proven Results</span>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Campus Life</span></h2>
                    <p className="text-slate-400 font-medium mb-20 max-w-2xl mx-auto text-lg">Discover the incredible environment where our students build projects, attend intensive offline labs, and map their success.</p>

                    <div className="w-full max-w-6xl mx-auto mb-16 cursor-grab active:cursor-grabbing pb-10">
                        <Swiper
                            effect={'cards'}
                            grabCursor={true}
                            modules={[EffectCards, Autoplay, FreeMode]}
                            className="w-[280px] h-[350px] md:w-[450px] md:h-[550px]"
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                        >
                            {[
                                '/images/students/ADITYA (ADCA).jpg',
                                '/images/students/MANJEET (ADCA).jpg',
                                '/images/students/MANOJ (MDCA).jpg',
                                '/images/students/SHIVAM (ADCA).jpg',
                                '/images/students/PRINCE (ADCA).jpg',
                                '/images/students/MOHIT (ADCA).jpg',
                                '/images/students/KASIM (DCA).jpg'
                            ].map((img, i) => (
                                <SwiperSlide key={i} className="rounded-[3rem] shadow-2xl overflow-hidden border-4 border-slate-700 bg-slate-800 group">
                                    <img src={img} alt={`Bytecore Student ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-10 left-10 text-left pointer-events-none">
                                        <div className="text-white font-black text-2xl md:text-3xl tracking-tight flex items-center gap-3 mb-2">Bytecore Scholar <CheckCircle size={24} className="text-blue-400" /></div>
                                        <div className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black">Nariyawal Offline Campus</div>
                                    </div>
                                    <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">#Success</div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto opacity-60 pointer-events-none">
                        <div className="px-6 py-3 rounded-full border border-slate-700 text-slate-300 text-xs font-black uppercase tracking-widest bg-slate-800/50 backdrop-blur-sm">Drag to explore students</div>
                    </div>
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
