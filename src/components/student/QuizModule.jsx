import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, Trophy, Brain, ArrowRight, RefreshCcw, Timer,
    FileText, Table, Presentation, Calculator, Activity, ShoppingBag,
    BarChart2, Image, PenTool, File, Wifi, Code, Keyboard, Lock, Star, ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { COURSE_CURRICULUM, MODULE_EXPANSION, QUIZ_BANK } from '../../lib/quizData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';

// Icon Map
const ICONS = {
    FileText, Table, Presentation, Calculator, Activity, ShoppingBag,
    BarChart2, Image, PenTool, File, Wifi, Code, Keyboard
};

export default function QuizModule({ student }) {
    const [view, setView] = useState('dashboard'); // dashboard | quiz | result
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [quizState, setQuizState] = useState({
        qIndex: 0,
        score: 0,
        answers: [], // boolean array
        isAnswered: false,
        selectedOption: null
    });
    const [saving, setSaving] = useState(false);

    // 1. Resolve Modules for this Student
    const studentModules = React.useMemo(() => {
        let courseKey = student.course || "DCA";
        // Handle specialized naming if needed, fallback to DCA
        if (!COURSE_CURRICULUM[courseKey]) {
            // Fuzzy match or default
            courseKey = Object.keys(COURSE_CURRICULUM).find(k => student.course && student.course.includes(k)) || "DCA";
        }

        const highLevelModules = COURSE_CURRICULUM[courseKey] || [];
        let finalTopics = [];

        highLevelModules.forEach(hm => {
            if (MODULE_EXPANSION[hm]) {
                finalTopics = [...finalTopics, ...MODULE_EXPANSION[hm]];
            } else {
                finalTopics.push(hm);
            }
        });

        // Unique modules
        return [...new Set(finalTopics)];
    }, [student.course]);

    // 2. Start Quiz Logic
    const startQuiz = (moduleId) => {
        const moduleData = QUIZ_BANK[moduleId];
        if (!moduleData || !moduleData.questions || moduleData.questions.length === 0) {
            alert("This module is currently being updated. Please check back later!");
            return;
        }

        setActiveModuleId(moduleId);
        setQuizState({
            qIndex: 0,
            score: 0,
            answers: [],
            isAnswered: false,
            selectedOption: null
        });
        setView('quiz');
    };

    // 3. Handle Answer
    const handleAnswer = (optionIndex) => {
        if (quizState.isAnswered) return;

        const currentData = QUIZ_BANK[activeModuleId];
        const currentQ = currentData.questions[quizState.qIndex];
        const isCorrect = optionIndex === currentQ.correct;

        setQuizState(prev => ({
            ...prev,
            isAnswered: true,
            selectedOption: optionIndex,
            score: isCorrect ? prev.score + 1 : prev.score,
            answers: [...prev.answers, isCorrect]
        }));

        // Auto Advance
        setTimeout(() => {
            if (quizState.qIndex < currentData.questions.length - 1) {
                setQuizState(prev => ({
                    ...prev,
                    qIndex: prev.qIndex + 1,
                    isAnswered: false,
                    selectedOption: null
                }));
            } else {
                finishQuiz(isCorrect ? quizState.score + 1 : quizState.score);
            }
        }, 1500);
    };

    // 4. Finish & Save
    const finishQuiz = async (finalScore) => {
        setView('result');
        setSaving(true);
        const moduleData = QUIZ_BANK[activeModuleId];
        const totalQ = moduleData.questions.length;
        const percentage = Math.round((finalScore / totalQ) * 100);

        try {
            // Save to Firestore
            // Assuming 'student' object has 'id' or 'registration' as the document key
            // Based on previous files, it seems to be 'registration' or the doc ID itself. 
            // We will rely on 'student.id' if available, otherwise 'student.registration'.
            // However, previous code used `doc(db, "students", student.registration)`.
            // Check if student.id is available in the passed prop.
            // If the prop comes from a snapshot where `id` was added, good. 
            // Safe fallback: student.id || student.registration

            const docId = student.id || student.registration;
            if (!docId) {
                console.error("No student ID found for saving progress");
                return;
            }

            const studentRef = doc(db, "students", docId);
            const progressKey = `quizProgress.${activeModuleId}`;

            await updateDoc(studentRef, {
                [progressKey]: {
                    score: percentage,
                    attempts: (student.quizProgress?.[activeModuleId]?.attempts || 0) + 1,
                    lastPlayed: new Date().toISOString()
                },
                // We don't want to overwrite the main updatedAt if not needed, but it helps track activity
                lastQuizActivity: new Date().toISOString()
            });
        } catch (err) {
            console.error("Failed to save progress", err);
        } finally {
            setSaving(false);
        }
    };

    // View Components
    if (view === 'dashboard') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Learning Hub</h2>
                    <p className="text-slate-500 font-bold">Your course curriculum modules. Unlock badges by scoring 80%+.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {studentModules.map((modId) => {
                        const data = QUIZ_BANK[modId];
                        // Render placeholder if data doesn't exist yet, or skip
                        if (!data) return null;

                        const progress = student.quizProgress?.[modId];
                        const Icon = ICONS[data.icon] || Brain;
                        const isCompleted = progress?.score >= 80;

                        return (
                            <motion.div
                                key={modId}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => startQuiz(modId)}
                                className={cn(
                                    "p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group select-none",
                                    isCompleted
                                        ? "bg-emerald-50 border-emerald-100"
                                        : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                                        isCompleted ? "bg-emerald-500" : `bg-${data.color || 'blue'}-500`
                                    )}>
                                        <Icon size={24} />
                                    </div>
                                    {progress && (
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-slate-900">{progress.score}%</p>
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Best Score</p>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-1 relative z-10">{data.title}</h3>
                                <p className="text-slate-500 text-xs font-bold mb-4 relative z-10 line-clamp-2">{data.description}</p>

                                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 gap-2 relative z-10">
                                    <span className="flex items-center gap-1"><Brain size={12} /> {data.questions.length} Qs</span>
                                    <span>•</span>
                                    <span>{progress?.attempts || 0} Attempts</span>
                                </div>

                                {isCompleted && (
                                    <div className="absolute -bottom-4 -right-4 text-emerald-500/10 rotate-12">
                                        <Trophy size={120} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (view === 'quiz') {
        const moduleData = QUIZ_BANK[activeModuleId];
        const currentQ = moduleData.questions[quizState.qIndex];

        return (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-500">
                <button
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 mb-8 self-start"
                >
                    <ChevronLeft size={20} /> Back to Hub
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            {moduleData.title} <span className="text-slate-300">/</span> <span className="text-blue-600">Q{quizState.qIndex + 1}</span>
                        </h2>
                    </div>
                    <div className="h-10 w-10 rounded-full border-4 border-slate-100 flex items-center justify-center font-black text-xs text-slate-400">
                        {quizState.qIndex + 1}/{moduleData.questions.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full mb-12 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((quizState.qIndex + 1) / moduleData.questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-blue-600"
                    />
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={quizState.qIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 leading-relaxed">
                            {currentQ.q}
                        </h3>

                        <div className="space-y-4">
                            {currentQ.options.map((opt, i) => {
                                const isSelected = quizState.selectedOption === i;
                                const isCorrect = i === currentQ.correct;

                                let stateStyle = "bg-white border-slate-100 hover:border-blue-300";
                                if (quizState.isAnswered) {
                                    if (isCorrect) stateStyle = "bg-emerald-50 border-emerald-500 text-emerald-800";
                                    else if (isSelected) stateStyle = "bg-red-50 border-red-500 text-red-800";
                                    else stateStyle = "bg-slate-50 border-transparent opacity-50";
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={quizState.isAnswered}
                                        className={cn(
                                            "w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group font-bold text-lg",
                                            stateStyle
                                        )}
                                    >
                                        <span>{opt}</span>
                                        {quizState.isAnswered && isCorrect && <CheckCircle2 className="text-emerald-500 shrink-0 ml-2" />}
                                        {quizState.isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 shrink-0 ml-2" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {quizState.isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-800 "
                    >
                        <span className="font-black uppercase tracking-wider text-xs block mb-1 text-blue-400">Explanation</span>
                        <p className="text-sm font-medium">{currentQ.explanation}</p>
                    </motion.div>
                )}
            </div>
        );
    }

    if (view === 'result') {
        const percentage = Math.round((quizState.score / QUIZ_BANK[activeModuleId].questions.length) * 100);
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full animate-in zoom-in-95 duration-500">
                <div className="w-32 h-32 relative mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <motion.circle
                            cx="64" cy="64" r="56" fill="none" stroke={percentage >= 80 ? "#10b981" : "#3b82f6"} strokeWidth="8"
                            strokeDasharray="351"
                            strokeDashoffset="351"
                            animate={{ strokeDashoffset: 351 - (351 * percentage) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-black text-slate-900">{percentage}%</span>
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    {percentage >= 80 ? "Mastery Achieved! 🏆" : percentage >= 50 ? "Good Progress! 👍" : "Keep Practicing! 💪"}
                </h2>
                <p className="text-slate-500 font-bold mb-8">
                    You scored {quizState.score} out of {QUIZ_BANK[activeModuleId].questions.length} correct in {QUIZ_BANK[activeModuleId].title}.
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                    <button
                        onClick={() => setView('dashboard')}
                        className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 font-black text-slate-600 uppercase tracking-widest hover:border-slate-300 transition-all"
                    >
                        Back to Hub
                    </button>
                    <button
                        onClick={() => startQuiz(activeModuleId)}
                        className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200"
                    >
                        Retry Module
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
