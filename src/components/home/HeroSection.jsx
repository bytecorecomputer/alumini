import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, AlertCircle, Clock } from 'lucide-react';

const TerminalEffect = () => {
    const [lines, setLines] = useState([]);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        const commands = [
            "ssh bytecore@lab.nariyawal -p 22",
            "Connecting to ByteCore Enterprise Server...",
            "Authenticating...",
            "Access Granted. Welcome Future Engineer.",
            "Loading curriculum modules...",
            "Running init_career.sh ... [OK]"
        ];
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < commands.length) {
                setLines(prev => [...prev, commands[currentLine]]);
                currentLine++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-lg mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 font-mono text-[10px] md:text-xs text-left mb-8 hidden md:block group">
            <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto flex items-center gap-2 text-slate-500 text-[10px]">
                    <Terminal size={12} /> root@bytecore:~
                </div>
            </div>
            <div className="p-5 text-emerald-400 min-h-[160px] relative">
                {lines.map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-1.5">
                        <span className="text-blue-400 mr-2">$</span>{line}
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-emerald-400 inline-block align-middle ml-1"></motion.div>
                )}
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
            </div>
        </div>
    );
};

const BatchUrgencyCounter = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm"
        >
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="flex items-center gap-1.5">
                <Clock size={12} />
                Next Python Batch Starts in 5 Days
            </span>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] hidden sm:block">Only 3 Seats Left</span>
        </motion.div>
    );
};

const OrbEffect = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-white pointer-events-none z-0 flex items-center justify-center">
            {/* Massive Animated Orb */}
            <div className="relative w-[140vw] h-[140vw] md:w-[80vw] md:h-[80vw] flex items-center justify-center translate-y-[-10%] md:translate-y-0">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
                    className="absolute inset-0 rounded-full border-[1px] border-blue-500/10 shadow-[0_0_100px_rgba(59,130,246,0.1)]"
                />
                <motion.div 
                    animate={{ rotate: -360, scale: [1.05, 1, 1.05] }}
                    transition={{ rotate: { duration: 25, repeat: Infinity, ease: "linear" }, scale: { duration: 10, repeat: Infinity, ease: "easeInOut" } }}
                    className="absolute inset-[10%] rounded-full border-[1px] border-indigo-500/10 shadow-[inner_0_0_80px_rgba(99,102,241,0.05)]"
                />
                
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 rounded-full blur-[120px]" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.08, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="relative z-10 w-1/3 md:w-1/4 opacity-[0.08] grayscale select-none"
                >
                    <img src="/logo.png" alt="ByteCore Watermark" className="w-full h-full object-contain" />
                </motion.div>
            </div>

            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-[length:50px_50px]"></div>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
            
            <div className="absolute bottom-10 left-10 opacity-[0.02] font-black text-[15vw] leading-none tracking-tighter text-slate-950 uppercase hidden lg:block select-none">
                ENGINEER
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
        </div>
    );
};

const HeroSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12">
            <OrbEffect />

            <div className="max-w-7xl mx-auto w-full relative z-20 px-6 pt-12">
                <div className="flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="max-w-5xl mx-auto flex flex-col items-center"
                    >
                        <BatchUrgencyCounter />
                        
                        <TerminalEffect />

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
    );
};

export default HeroSection;
