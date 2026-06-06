import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Briefcase, GraduationCap, Trophy } from 'lucide-react';

const AlumniTimeline = () => {
    const steps = [
        { icon: <Code2 size={24} />, title: "Day 1: The Foundation", desc: "Started with zero coding knowledge in our intensive tech bootcamp.", color: "bg-slate-800" },
        { icon: <Briefcase size={24} />, title: "Month 3: Building Real Projects", desc: "Developed 5+ full-stack applications solving real-world problems.", color: "bg-blue-600" },
        { icon: <GraduationCap size={24} />, title: "Month 6: ISO Certification", desc: "Graduated with top honors and a verified professional tech portfolio.", color: "bg-purple-600" },
        { icon: <Trophy size={24} />, title: "Today: Industry Placed", desc: "Working as a Software Engineer at a top IT firm with a 300% salary hike.", color: "bg-emerald-500" }
    ];

    return (
        <div className="py-32 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-24">
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Proven Success Path</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">ByteCore Journey</span>.
                    </h2>
                </div>

                <div className="relative">
                    {/* Central Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-800 transform -translate-x-1/2 rounded-full hidden md:block"></div>
                    <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="absolute left-1/2 top-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 transform -translate-x-1/2 rounded-full hidden md:block"
                    ></motion.div>

                    {/* Timeline Items */}
                    <div className="space-y-12 md:space-y-24 relative z-10">
                        {steps.map((step, idx) => (
                            <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                
                                {/* Content Box */}
                                <motion.div 
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className={`flex-1 w-full ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
                                >
                                    <div className={`p-8 rounded-[2rem] bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shadow-xl inline-block w-full max-w-md ${idx % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                                        <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Center Icon */}
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                                    className={`w-16 h-16 rounded-full ${step.color} border-4 border-slate-950 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center text-white z-20 shrink-0 mx-auto md:mx-0`}
                                >
                                    {step.icon}
                                </motion.div>

                                {/* Spacer for flex layout */}
                                <div className="flex-1 hidden md:block"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniTimeline;
