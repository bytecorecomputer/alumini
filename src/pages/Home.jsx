import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { motion } from 'framer-motion';
import { Database, Loader2, Zap, Building, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/common/AuthContext';
import { runMigration } from '../lib/migrateStudents';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import DomeGallery from '../components/ui/DomeGallery';

import HeroSection from '../components/home/HeroSection';
import FeatureSlider from '../components/home/FeatureSlider';
import CourseCarousel from '../components/home/CourseCarousel';
import LabGalleryPreview from '../components/home/LabGalleryPreview';
import ROICalculator from '../components/home/ROICalculator';
import CourseAssessment from '../components/home/CourseAssessment';
import AlumniTimeline from '../components/home/AlumniTimeline';

export default function Home() {
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
            toast.success(`Success! ${count} students migrated to database.`);
        } catch (err) {
            console.error("Migration failed:", err);
            toast.error("Migration failed. Check console.");
        } finally {
            setIsMigrating(false);
        }
    };

    const team = [
        { name: "Maisar Hussain", role: "Senior Teacher (Thiriya)", image: "/images/cd/maisar.jpg" },
        { name: "Rahul", role: "Founder & CEO", image: "/images/cd/rahul.jfif" },
        { name: "Coder Afroj", role: "Lead Instructor & Web Dev", image: "/images/cd/coderafroj.jpg" }
    ];

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
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        "opens": "09:00",
                        "closes": "18:00"
                    },
                    "sameAs": ["https://www.facebook.com/bytecore", "https://www.instagram.com/bytecore"]
                }}
            />

            <HeroSection />

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

            <ROICalculator />

            <FeatureSlider />

            <CourseCarousel />
            
            <CourseAssessment />

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

            <AlumniTimeline />

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

                <LabGalleryPreview />

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
