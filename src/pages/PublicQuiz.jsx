import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, ChevronLeft, Target, Trophy, Clock, Star, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import SEO from '../components/common/SEO';
import { useSpeech } from '../lib/useSpeech';

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

    const { speak, stop, isSpeaking, supported } = useSpeech();

    const courseData = HINDI_QUIZ_DATA[courseId];
    const topicData = courseData?.[topicId];
    
    // We assume all have 'Master Assessment' as the key for simplicity in public quizzes
    // OR we use the topicId if it matches a module
    const qList = courseData?.modules?.[topicId] || courseData?.modules?.["Master Assessment"] || [];

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
    const progress = ((quizState.qIndex) / qList.length) * 100;

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
            confetti({
                particleCount: 40,
                spread: 60,
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
        }, isCorrect ? 1500 : 3000);
    };

    const finishQuiz = (finalScore, finalXP) => {
        setView('result');
        const percentage = Math.round((finalScore / qList.length) * 100);
        
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
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#3b82f6', '#10b981', '#f59e0b'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#3b82f6', '#10b981', '#f59e0b'] });
            if (Date.now() < end) { requestAnimationFrame(frame); }
        }());
    };

    if (view === 'result') {
        const percentage = Math.round((quizState.score / qList.length) * 100);
        const passed = percentage >= 80;
        const percentile = Math.min(99, Math.max(50, percentage + Math.floor(Math.random() * 10)));

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 text-center font-sans pb-safe">
                <SEO title={`Result: ${topicId} Quiz`} />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto relative mb-8">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            <motion.circle
                                cx="50%" cy="50%" r="45%" fill="none" stroke={passed ? "#10b981" : "#ef4444"} strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset="283"
                                animate={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
                        </div>
                    </div>

                    <h2 className={cn("text-3xl md:text-4xl font-black mb-2 tracking-tight", passed ? "text-emerald-600" : "text-slate-900")}>
                        {passed ? "Excellent! 🌟" : "Keep Learning! 💪"}
                    </h2>
                    <p className="text-slate-500 font-bold text-base md:text-lg mb-8">
                        You scored {quizState.score} out of {qList.length}.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col items-center justify-center">
                            <Star className="text-amber-500 mb-1" size={20} />
                            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest">XP Gained</span>
                            <span className="text-xl font-black text-amber-600">+{quizState.xp}</span>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center">
                            <Trophy className="text-blue-500 mb-1" size={20} />
                            <span className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest">Global Rank</span>
                            <span className="text-xl font-black text-blue-600">Top {100 - percentile}%</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-xs md:text-sm"
                        >
                            Explore More Quizzes
                        </button>
                        {!passed && (
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 text-xs md:text-sm"
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-safe">
            <SEO title={`Quiz: ${topicId}`} />
            
            {/* Top Progress Bar App-like edge */}
            <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-200 z-[100]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: \`\${progress}%\` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-blue-600"
                />
            </div>

            {/* Mobile-friendly App Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 pt-safe-top">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className="text-center flex-1 px-4">
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest truncate">{topicId}</h1>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Q {quizState.qIndex + 1} of {qList.length}</p>
                    </div>

                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs transition-colors",
                        timeLeft <= 5 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600"
                    )}>
                        <Clock size={14} />
                        {timeLeft}s
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6 md:py-10 relative overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={quizState.qIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex-1 flex flex-col"
                    >
                        {/* Question Box */}
                        <div className="mb-6 md:mb-10 relative">
                            {supported && (
                                <button 
                                    onClick={() => isSpeaking ? stop() : speak(currentQ.question)}
                                    className="absolute -top-6 right-0 text-slate-400 hover:text-blue-500 transition-colors p-2 bg-white rounded-full shadow-sm border border-slate-100"
                                >
                                    {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                            )}
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-snug font-hindi pt-2">
                                {currentQ.question}
                            </h3>
                        </div>

                        {/* Options - Large touch targets */}
                        <div className="grid grid-cols-1 gap-3 md:gap-4 pb-24 md:pb-0">
                            {currentQ.options.map((opt, i) => {
                                const isSelected = quizState.selectedOption === i;
                                const isCorrect = i === currentQ.correctAnswer;
                                
                                let stateStyle = "bg-white border-slate-200 hover:border-blue-500 text-slate-700 hover:bg-blue-50/30";
                                if (quizState.isAnswered) {
                                    if (isCorrect) stateStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-lg shadow-emerald-500/20 z-10 scale-[1.02]";
                                    else if (isSelected) stateStyle = "bg-red-50 border-red-500 text-red-800 scale-95 opacity-80";
                                    else stateStyle = "bg-slate-50 border-slate-200 opacity-40 scale-95";
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={quizState.isAnswered}
                                        className={cn(
                                            "w-full text-left p-5 min-h-[4rem] rounded-2xl md:rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between group font-bold text-lg md:text-xl font-hindi tap-highlight-transparent relative overflow-hidden",
                                            stateStyle
                                        )}
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                    >
                                        <span className="relative z-10 pr-8">{opt}</span>
                                        {quizState.isAnswered && isCorrect && <CheckCircle2 className="text-emerald-500 absolute right-4 top-1/2 -translate-y-1/2" size={24} />}
                                        {quizState.isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 absolute right-4 top-1/2 -translate-y-1/2" size={24} />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Explanation Toast Bottom Sheet (App-like) */}
            <AnimatePresence>
                {quizState.isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-50 p-6 md:p-8 rounded-t-[2rem]"
                    >
                        <div className="max-w-3xl mx-auto flex flex-col gap-2">
                            <span className={cn(
                                "font-black uppercase tracking-[0.2em] text-xs flex items-center gap-2",
                                quizState.selectedOption === currentQ.correctAnswer ? "text-emerald-500" : "text-red-500"
                            )}>
                                {quizState.selectedOption === currentQ.correctAnswer ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                                {quizState.selectedOption === currentQ.correctAnswer ? "Awesome!" : "Explanation"}
                            </span>
                            <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed font-hindi">{currentQ.explanation}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
