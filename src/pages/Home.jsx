import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { motion } from 'framer-motion';
import { Database, Loader2, Zap, Building, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/common/AuthContext';
import { runMigration } from '../lib/migrateStudents';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

import HeroSection from '../components/home/HeroSection';
import CourseCarousel from '../components/home/CourseCarousel';
import LabGalleryPreview from '../components/home/LabGalleryPreview';

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

    return (
        <div className="bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-900 font-sans">
            <SEO
                title="#1 Offline Tech & Computer Centre in Bareilly"
                description="ByteCore Computer Centre is the BEST offline IT lab in Nariyawal, Bareilly. We offer O Level, ADCA, Python, Web Development, Full Stack, and Tally Prime with 100% practical training."
                keywords="bytecore computer centre, best computer center in bareilly, o level institute in bareilly, adca coaching in nariyawal, python programming classes bareilly, tally prime course, web design training bareilly, best it lab bareilly"
                schema={{
                    "@context": "https://schema.org",
                    "@type": ["EducationalOrganization", "LocalBusiness"],
                    "name": "ByteCore Computer Centre",
                    "description": "Premium offline computer centre offering advanced IT, coding, and professional courses.",
                    "url": "https://bytecores.in",
                    "logo": "https://bytecores.in/logo.png",
                    "image": "https://bytecores.in/banner-og.png",
                    "telephone": "+91-8859942426",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Nariyawal",
                        "addressLocality": "Bareilly",
                        "addressRegion": "Uttar Pradesh",
                        "postalCode": "243001",
                        "addressCountry": "IN"
                    },
                    "sameAs": [
                        "https://bytecores.in/"
                    ]
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

            <div className="py-24 bg-slate-50">
                <CourseCarousel />
            </div>

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
