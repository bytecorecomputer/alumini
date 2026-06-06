import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, Code, Database, Paintbrush, MonitorPlay, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseAssessment = () => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState({ logic: 0, design: 0, theory: 0 });
    const navigate = useNavigate();

    const questions = [
        {
            q: "What excites you the most about technology?",
            options: [
                { text: "Building things that people see and click on", type: 'design' },
                { text: "Solving complex logic puzzles and math", type: 'logic' },
                { text: "Learning how software works behind the scenes", type: 'theory' }
            ]
        },
        {
            q: "How much time can you dedicate daily?",
            options: [
                { text: "1-2 Hours (Casual Learning)", type: 'theory' },
                { text: "3-4 Hours (Serious Building)", type: 'design' },
                { text: "5+ Hours (Hardcore Coding)", type: 'logic' }
            ]
        },
        {
            q: "What is your ultimate career goal?",
            options: [
                { text: "Creative Web Designer", type: 'design' },
                { text: "Backend / AI Engineer", type: 'logic' },
                { text: "General IT / Office Admin", type: 'theory' }
            ]
        }
    ];

    const handleAnswer = (type) => {
        setScore(prev => ({ ...prev, [type]: prev[type] + 1 }));
        setStep(step + 1);
    };

    const getRecommendation = () => {
        const { logic, design, theory } = score;
        if (logic >= 2) return { title: "Python & AI Data Science", desc: "You have a highly logical mind. Python is your golden ticket.", icon: <Database size={40} className="text-blue-500" /> };
        if (design >= 2) return { title: "React JS Frontend", desc: "You are a creator. You should build beautiful UIs with React.", icon: <Paintbrush size={40} className="text-purple-500" /> };
        if (theory >= 2) return { title: "ADCA / IT Foundation", desc: "You need a solid foundation. ADCA is perfect for general IT jobs.", icon: <MonitorPlay size={40} className="text-emerald-500" /> };
        return { title: "Full Stack Development", desc: "You are an all-rounder. Master both logic and design.", icon: <Code size={40} className="text-indigo-500" /> };
    };

    const reset = () => {
        setStep(0);
        setScore({ logic: 0, design: 0, theory: 0 });
    };

    return (
        <div className="py-24 bg-white relative border-y border-slate-100">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block flex items-center justify-center gap-2">
                        <Target size={14} /> Path Finder
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        Confused? <span className="text-slate-400">Let AI Find Your Course.</span>
                    </h2>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-inner relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step < questions.length ? (
                            <motion.div 
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-2xl mx-auto"
                            >
                                <div className="text-center mb-8">
                                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-4">Question {step + 1} of {questions.length}</span>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900">{questions[step].q}</h3>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {questions[step].options.map((opt, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleAnswer(opt.type)}
                                            className="w-full text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-blue-50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-0"></div>
                                            <span className="relative z-10 font-bold text-slate-700 group-hover:text-blue-700 flex items-center justify-between">
                                                {opt.text}
                                                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all" />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center max-w-xl mx-auto"
                            >
                                <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center mb-6">
                                    {getRecommendation().icon}
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-4">{getRecommendation().title}</h3>
                                <p className="text-slate-500 font-medium text-lg mb-8">{getRecommendation().desc}</p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button 
                                        onClick={() => navigate('/register')}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 active:scale-95"
                                    >
                                        Claim 10% Discount & Join
                                    </button>
                                    <button 
                                        onClick={reset}
                                        className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <RefreshCcw size={14} /> Retake Quiz
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Progress Bar */}
                    {step < questions.length && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${(step / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseAssessment;
