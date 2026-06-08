import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, ChevronLeft, Target, Trophy, Clock, Star, ArrowRight } from 'lucide-react';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import SEO from '../components/common/SEO';

export default function PublicQuiz() {
    const { courseId, topicId } = useParams();
    const navigate = useNavigate();
    
    const [quizState, setQuizState] = useState({
        qIndex: 0,
        score: 0,
        answers: [],
        isAnswered: false,
        selectedOption: null,
        streak: 0,
        xp: 0
    });
    const [timeLeft, setTimeLeft] = useState(30);
    const [view, setView] = useState('quiz'); // quiz | result

    const courseData = HINDI_QUIZ_DATA[courseId];
    const topicData = courseData?.[topicId];
    
    // We assume all have 'Master Assessment' as the key for simplicity in public quizzes
    const qList = topicData?.modules?.["Master Assessment"] || [];

    useEffect(() => {
        if (qList.length === 0) {
            navigate('/quizzes');
        }
    }, [qList, navigate]);

    // Timer logic
    useEffect(() => {
        if (view !== 'quiz' || quizState.isAnswered) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleAnswer(-1); // timeout
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [quizState.qIndex, quizState.isAnswered, view]);

    if (qList.length === 0) return null;

    const currentQ = qList[quizState.qIndex];

    const handleAnswer = (optionIndex) => {
        if (quizState.isAnswered) return;

        const isCorrect = optionIndex === currentQ.correctAnswer;
        
        let newStreak = isCorrect ? quizState.streak + 1 : 0;
        let xpGained = isCorrect ? 10 + (newStreak * 2) + Math.max(0, timeLeft) : 0;

        setQuizState(prev => ({
            ...prev,
            isAnswered: true,
            selectedOption: optionIndex,
            score: isCorrect ? prev.score + 1 : prev.score,
            answers: [...prev.answers, isCorrect],
            streak: newStreak,
            xp: prev.xp + xpGained
        }));

        if (isCorrect) {
            // Mini celebration for correct answer
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#10b981', '#34d399']
            });
        }

        setTimeout(() => {
            if (quizState.qIndex < qList.length - 1) {
                setQuizState(prev => ({
                    ...prev,
                    qIndex: prev.qIndex + 1,
                    isAnswered: false,
                    selectedOption: null
                }));
                setTimeLeft(30);
            } else {
                finishQuiz(isCorrect ? quizState.score + 1 : quizState.score, quizState.xp + xpGained);
            }
        }, isCorrect ? 2500 : 4000); // Wait longer on wrong answer to read explanation
    };

    const finishQuiz = (finalScore, finalXP) => {
        setView('result');
        const percentage = Math.round((finalScore / qList.length) * 100);
        
        // Save to local storage for global ranking illusion
        let currentTotalXP = parseInt(localStorage.getItem('bytecore_xp') || '0', 10);
        localStorage.setItem('bytecore_xp', (currentTotalXP + finalXP).toString());

        if (percentage >= 80) {
            triggerMassiveConfetti();
        }
    };

    const triggerMassiveConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#3b82f6', '#10b981', '#f59e0b']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#3b82f6', '#10b981', '#f59e0b']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    if (view === 'result') {
        const percentage = Math.round((quizState.score / qList.length) * 100);
        const passed = percentage >= 80;
        // Social engineering pseudo-stats
        const percentile = Math.min(99, Math.max(50, percentage + Math.floor(Math.random() * 10)));

        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 pt-24 text-center font-sans">
                <SEO title={`Result: ${topicId} Quiz`} />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl max-w-2xl w-full border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 blur-[100px] rounded-full"></div>
                    
                    <div className="w-40 h-40 mx-auto relative mb-8">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <motion.circle
                                cx="80" cy="80" r="70" fill="none" stroke={passed ? "#10b981" : "#ef4444"} strokeWidth="12"
                                strokeDasharray="440"
                                strokeDashoffset="440"
                                animate={{ strokeDashoffset: 440 - (440 * percentage) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
                        </div>
                    </div>

                    <h2 className={cn("text-4xl font-black mb-2 tracking-tight", passed ? "text-emerald-600" : "text-slate-900")}>
                        {passed ? "Excellent Performance! 🌟" : "Keep Learning! 💪"}
                    </h2>
                    <p className="text-slate-500 font-bold text-lg mb-8">
                        You scored {quizState.score} out of {qList.length} correctly.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col items-center justify-center">
                            <Star className="text-amber-500 mb-2" size={24} />
                            <span className="text-sm font-bold text-amber-900/60 uppercase tracking-widest">XP Gained</span>
                            <span className="text-2xl font-black text-amber-600">+{quizState.xp}</span>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center">
                            <Trophy className="text-blue-500 mb-2" size={24} />
                            <span className="text-sm font-bold text-blue-900/60 uppercase tracking-widest">Global Rank</span>
                            <span className="text-2xl font-black text-blue-600">Top {100 - percentile}%</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                        >
                            Explore More Quizzes
                        </button>
                        {!passed && (
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-5 rounded-[2rem] bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex flex-col">
            <SEO title={`Quiz: ${topicId}`} />
            
            {/* Top Navigation Bar */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 flex items-center justify-between">
                <button
                    onClick={() => navigate('/quizzes')}
                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={20} /> Quit
                </button>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-black text-sm tracking-widest">
                        <Zap size={16} className={quizState.streak > 2 ? "animate-pulse" : ""} />
                        STREAK: {quizState.streak}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-black text-sm tracking-widest">
                        <Target size={16} />
                        XP: {quizState.xp}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-6 flex-1 flex flex-col mt-8">
                
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">{topicId}</h1>
                        <p className="text-slate-500 font-medium text-sm">Question {quizState.qIndex + 1} of {qList.length}</p>
                    </div>
                    
                    {/* Timer */}
                    <div className={cn(
                        "flex items-center gap-2 text-xl font-black px-4 py-2 rounded-xl transition-colors",
                        timeLeft <= 5 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600"
                    )}>
                        <Clock size={20} />
                        00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full mb-10 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((quizState.qIndex + 1) / qList.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-blue-600 rounded-full"
                    />
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={quizState.qIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="flex-1 flex flex-col"
                    >
                        {/* Question Card */}
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 mb-8">
                            <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight font-hindi">
                                {currentQ.question}
                            </h3>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-4">
                            {currentQ.options.map((opt, i) => {
                                const isSelected = quizState.selectedOption === i;
                                const isCorrect = i === currentQ.correctAnswer;
                                const isTimeout = quizState.selectedOption === -1;

                                let stateStyle = "bg-white border-slate-200 hover:border-blue-500 hover:shadow-lg text-slate-700 cursor-pointer";
                                if (quizState.isAnswered) {
                                    if (isCorrect) stateStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-emerald-500/20";
                                    else if (isSelected) stateStyle = "bg-red-50 border-red-500 text-red-800 shadow-red-500/20";
                                    else stateStyle = "bg-slate-50 border-slate-200 opacity-50";
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={quizState.isAnswered}
                                        className={cn(
                                            "w-full text-left p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between group font-bold text-xl font-hindi",
                                            stateStyle
                                        )}
                                    >
                                        <span>{opt}</span>
                                        {quizState.isAnswered && isCorrect && <CheckCircle2 className="text-emerald-500 shrink-0 ml-4" size={28} />}
                                        {quizState.isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 shrink-0 ml-4" size={28} />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Explanation Toast */}
                <AnimatePresence>
                    {quizState.isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl z-50 font-hindi border border-slate-700"
                        >
                            <span className={cn(
                                "font-black uppercase tracking-[0.2em] text-[10px] block mb-2 flex items-center gap-2",
                                quizState.selectedOption === currentQ.correctAnswer ? "text-emerald-400" : "text-red-400"
                            )}>
                                {quizState.selectedOption === currentQ.correctAnswer ? "Awesome!" : "Explanation"}
                            </span>
                            <p className="text-sm font-medium leading-relaxed opacity-90">{currentQ.explanation}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
