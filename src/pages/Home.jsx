import { motion } from 'framer-motion';
import { ArrowRight, Users, Calendar, Award, Zap, Target, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import bcc from '../assets/BANNER.jpg'
import { useAuth } from '../app/common/AuthContext';
import { runMigration } from '../lib/migrateStudents';
import { useState } from 'react';
import { Database, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Home() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const { user } = useAuth();
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationDone, setMigrationDone] = useState(false);

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

    return (
        <div className="bg-white overflow-hidden" >
            {/* --- HERO SECTION --- */}
            < div className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6" >
                {/* Dynamic Background Elements */}
                < div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] -z-10 opacity-40" >
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[120px] animate-pulse delay-700"></div>
                </div >

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="flex-1 text-center lg:text-left"
                    >
                        <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-100/80 backdrop-blur-md border border-slate-200/50">
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                Ecosystem is LIVE
                            </span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                            Legacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">Redefined.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-500 font-bold max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                            The next generation of alumni networking. Bridging the gap between historic excellence and future innovation.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                            <Link to="/register" className="btn-premium px-10 py-5 group shadow-2xl shadow-purple-200">
                                Join the Elite
                                <Zap className="ml-2 group-hover:scale-125 transition-transform" size={18} fill="currentColor" />
                            </Link>
                            <Link to="/directory" className="flex items-center gap-3 px-8 py-5 rounded-3xl bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-widest text-sm hover:border-blue-100 hover:bg-slate-50 transition-all shadow-sm group">
                                Browse Network
                                <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10 p-4 rounded-[3rem] bg-white/30 backdrop-blur-3xl border border-white/40 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
                            <img
                                src={bcc}
                                alt="Platform Hub"
                                className="rounded-[2.5rem] shadow-2xl w-full h-[500px] object-cover"
                            />
                            {/* Visual Floaties */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 p-6 rounded-3xl bg-white shadow-2xl border border-slate-50 hidden md:block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Users size={24} /></div>
                                    <div>
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Fellows</div>
                                        <div className="text-2xl font-black text-slate-900">12,400+</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div >

            {/* --- STATS STRIP --- */}
            < div className="py-24 border-y border-slate-100" >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
                        {[
                            { label: "Partner Institutions", val: "45+", icon: <Target className="text-blue-600" /> },
                            { label: "Career Transitions", val: "2.4k", icon: <Zap className="text-amber-600" /> },
                            { label: "Community Grants", val: "$1.2M", icon: <Heart className="text-rose-600" /> },
                            { label: "System Uptime", val: "99.9%", icon: <Shield className="text-emerald-600" /> }
                        ].map((s, i) => (
                            <div key={i} className="space-y-4 group">
                                <div className="p-3 w-fit bg-slate-50 rounded-2xl group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl transition-all duration-500">
                                    {s.icon}
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-slate-900">{s.val}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div >

            {/* --- CORE CAPABILITIES --- */}
            < div className="py-32 bg-slate-50" >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mb-24">
                        <div className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4">Core Capabilities</div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                            High-Performance <br /><span className="text-slate-400">Networking Engine.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Smart Directory",
                                desc: "Proprietary search algorithm to locate precise alumni connections across years and industries.",
                                color: "bg-blue-600",
                                icon: <Users size={32} />
                            },
                            {
                                title: "Verified Governance",
                                desc: "Advanced verification protocols ensure authentic alumni profiles and secure data integrity.",
                                color: "bg-purple-600",
                                icon: <Shield size={32} />
                            },
                            {
                                title: "Opportunity Hub",
                                desc: "Curated high-tier job listings and mentor sessions exclusive to our registered network.",
                                color: "bg-amber-600",
                                icon: <Target size={32} />
                            }
                        ].map((c, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-10 rounded-[3rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 group transition-all"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${c.color} text-white flex items-center justify-center mb-10 shadow-xl group-hover:rotate-6 transition-transform`}>
                                    {c.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{c.title}</h3>
                                <p className="text-slate-500 font-bold leading-relaxed">{c.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div >

            {/* --- CTA BANNER --- */}
            < div className="py-20 px-6" >
                <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-[4rem] bg-slate-900 overflow-hidden p-12 md:p-24 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-transparent"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 italic uppercase">Ready to join the network?</h2>
                            <p className="text-slate-400 font-bold text-lg mb-12">Registration takes less than 60 seconds. Start your journey today.</p>
                            <Link to="/register" className="btn-premium px-12 py-5 shadow-2xl shadow-blue-500/20">
                                Create Your Account
                                <ArrowRight className="ml-2" size={20} />
                            </Link>
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
                            className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 flex items-center gap-4"
                        >
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Database size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Tool</div>
                                <h4 className="text-xs font-black text-slate-900 uppercase">Data Migration</h4>
                            </div>
                            <button
                                disabled={isMigrating || migrationDone}
                                onClick={handleDataMigration}
                                className={cn(
                                    "btn-premium py-3 px-6 text-xs uppercase tracking-widest flex items-center gap-2",
                                    migrationDone ? "bg-emerald-500 shadow-emerald-200" : "bg-blue-600 shadow-blue-200"
                                )}
                            >
                                {isMigrating ? <Loader2 className="animate-spin" size={16} /> : (migrationDone ? <CheckCircle size={16} /> : <Zap size={16} />)}
                                {migrationDone ? 'Done' : 'Migrate'}
                            </button>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
}
