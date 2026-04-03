import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, Trophy, Brain, ArrowRight, BookOpen,
    FileText, Table, Lock, Zap, ChevronLeft, Target, Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { HINDI_QUIZ_DATA } from '../../data/hindiQuizData';
import { studentQuizProfileInit, getStudentQuizProgress, markModuleCompleted, awardMasterBadge } from '../../lib/quizDb';

// Icon Map for dynamic rendering
const ICONS = {
    "file-word": FileText,
    "table": Table,
    "monitor": Brain,
    "default": BookOpen
};

export default function QuizModule({ student }) {
    const [view, setView] = useState('courses'); // courses | topics | quiz | result | badge
    const [activeCourseKey, setActiveCourseKey] = useState(null); // e.g. "MS Word"
    const [activeSubModule, setActiveSubModule] = useState(null); // e.g. "Home Tab"

    // Quiz Progress State from Firebase
    const [progress, setProgress] = useState({ completedModules: [], unlockedBadges: [], totalScore: 0 });
    const [loadingProgress, setLoadingProgress] = useState(true);

    // Active Quiz State
    const [quizState, setQuizState] = useState({
        qIndex: 0,
        score: 0,
        answers: [],
        isAnswered: false,
        selectedOption: null
    });
    const [saving, setSaving] = useState(false);

    // 1. Determine student's master course name to fetch data
    const studentCourse = React.useMemo(() => {
        let courseKey = student.course || "DCA";
        if (!HINDI_QUIZ_DATA[courseKey]) {
            courseKey = Object.keys(HINDI_QUIZ_DATA).find(k => student.course && student.course.includes(k)) || "DCA";
        }
        return courseKey;
    }, [student.course]);

    const courseData = HINDI_QUIZ_DATA[studentCourse] || {};

    // 2. Load Progress on mount
    useEffect(() => {
        let isMounted = true;
        const loadDb = async () => {
            if (student?.registration) {
                await studentQuizProfileInit(student.registration);
                const data = await getStudentQuizProgress(student.registration);
                if (isMounted) {
                    if (data) {
                        setProgress({
                            completedModules: data.completedModules || [],
                            unlockedBadges: data.unlockedBadges || [],
                            totalScore: data.totalScore || 0
                        });
                    }
                    setLoadingProgress(false);
                }
            } else if (isMounted) {
                setLoadingProgress(false);
            }
        };
        loadDb();
        return () => { isMounted = false; };
    }, [student]);

    // Calculate overall completion
    const totalAvailableSubModules = Object.values(courseData).reduce((err, topic) => err + Object.keys(topic.modules).length, 0);
    const overallPercentage = totalAvailableSubModules > 0 ? Math.round((progress.completedModules.length / totalAvailableSubModules) * 100) : 0;

    // Handlers
    const handleTopicClick = (topicKey) => {
        setActiveCourseKey(topicKey);
        setView('topics');
    };

    const startQuiz = (subModuleKey) => {
        if (!courseData[activeCourseKey]?.modules[subModuleKey]) return;

        setActiveSubModule(subModuleKey);
        setQuizState({
            qIndex: 0,
            score: 0,
            answers: [],
            isAnswered: false,
            selectedOption: null
        });
        setView('quiz');
    };

    const handleAnswer = (optionIndex) => {
        if (quizState.isAnswered) return;

        const currentQList = courseData[activeCourseKey].modules[activeSubModule];
        const currentQ = currentQList[quizState.qIndex];
        const isCorrect = optionIndex === currentQ.correctAnswer;

        setQuizState(prev => ({
            ...prev,
            isAnswered: true,
            selectedOption: optionIndex,
            score: isCorrect ? prev.score + 1 : prev.score,
            answers: [...prev.answers, isCorrect]
        }));

        setTimeout(() => {
            if (quizState.qIndex < currentQList.length - 1) {
                setQuizState(prev => ({
                    ...prev,
                    qIndex: prev.qIndex + 1,
                    isAnswered: false,
                    selectedOption: null
                }));
            } else {
                finishQuiz(isCorrect ? quizState.score + 1 : quizState.score);
            }
        }, 3000); // 3 seconds to read explanation in Hindi
    };

    const finishQuiz = async (finalScore) => {
        setSaving(true);
        const qList = courseData[activeCourseKey].modules[activeSubModule];
        const requiredScore = Math.ceil(qList.length * 0.8); // 80% to pass
        const passed = finalScore >= requiredScore;

        const moduleIdentifier = `${studentCourse}|${activeCourseKey}|${activeSubModule}`;

        const allSubModules = Object.keys(courseData[activeCourseKey].modules);
        const isFirstModule = allSubModules.indexOf(activeSubModule) === 0;

        if ((passed || isFirstModule) && student?.registration) {
            await markModuleCompleted(student.registration, moduleIdentifier, finalScore);
            // Refresh local state
            const newData = await getStudentQuizProgress(student.registration);
            if (newData) setProgress(newData);

            // Check if entire topic (e.g., MS Word) is completed
            const completedCount = allSubModules.filter(sub => (newData.completedModules || []).includes(`${studentCourse}|${activeCourseKey}|${sub}`)).length;

            if (completedCount === allSubModules.length) {
                const badgeIdentifier = `${studentCourse} - ${activeCourseKey} Master`;
                if (!(newData.unlockedBadges || []).includes(badgeIdentifier)) {
                    await awardMasterBadge(student.registration, badgeIdentifier);
                    setView('badge'); // Show the reward
                    setSaving(false);
                    return;
                }
            }
        }

        setView('result');
        setSaving(false);
    };

    // View Components
    if (loadingProgress) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Brain className="animate-pulse text-blue-300" size={48} />
            </div>
        );
    }

    if (view === 'courses') {
        const topics = Object.keys(courseData);
        if (topics.length === 0) {
            return (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-2xl font-black text-slate-800">No Hindi Content Available</h3>
                    <p className="text-slate-500 mt-2">Check back soon for upcoming modules!</p>
                </div>
            );
        }

        return (
            <div className="space-y-12 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase flex items-center gap-3">
                            Skill Modules <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm tracking-widest font-black">HINDI</span>
                        </h2>
                        <p className="text-slate-500 font-bold max-w-lg">Complete all topics inside each software module to unlock your certification badge.</p>
                    </div>
                    <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-900 rounded-[2rem] border border-blue-100/50 flex items-center gap-4 shadow-xl shadow-blue-500/10">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Completion</p>
                            <p className="text-2xl font-black tracking-tighter">{overallPercentage}%</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map((topicKey, idx) => {
                        const data = courseData[topicKey];
                        const Icon = ICONS[data.icon] || ICONS.default;

                        // Calculate topic completion
                        const subModules = Object.keys(data.modules);
                        const completedCount = subModules.filter(sub => progress.completedModules.includes(`${studentCourse}|${topicKey}|${sub}`)).length;
                        const isTopicComplete = completedCount === subModules.length && subModules.length > 0;

                        return (
                            <motion.div
                                key={topicKey}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleTopicClick(topicKey)}
                                className="group cursor-pointer premium-card bg-white p-8 border hover:border-blue-300 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[280px]"
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg -rotate-6 group-hover:rotate-0 transition-transform",
                                            isTopicComplete ? "bg-emerald-500 shadow-emerald-200" : `bg-${data.color}-500 shadow-${data.color}-200`
                                        )}>
                                            <Icon size={32} />
                                        </div>
                                        {isTopicComplete && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                <Award size={12} /> Mastered
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{topicKey}</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">{data.description}</p>
                                </div>

                                <div className="relative z-10 mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-500">
                                        {completedCount} / {subModules.length} Modules
                                    </p>
                                    <ArrowRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
                                </div>

                                <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                                    <Icon size={180} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (view === 'topics') {
        const data = courseData[activeCourseKey];
        const subModules = Object.keys(data.modules);
        const Icon = ICONS[data.icon] || ICONS.default;

        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <button
                    onClick={() => setView('courses')}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={20} /> Back to Modules
                </button>

                <div className="flex items-center gap-6">
                    <div className={cn(`h-20 w-20 rounded-[2rem] bg-${data.color}-500 text-white flex items-center justify-center shadow-2xl shadow-${data.color}-500/30`)}>
                        <Icon size={40} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900">{activeCourseKey}</h2>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{data.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {subModules.map((subMod, idx) => {
                        const identifier = `${studentCourse}|${activeCourseKey}|${subMod}`;
                        const isCompleted = progress.completedModules.includes(identifier);
                        const qCount = data.modules[subMod].length;

                        // Progression logic: require previous to be completed, unless it's the first one
                        const prevIdentifier = idx > 0 ? `${studentCourse}|${activeCourseKey}|${subModules[idx - 1]}` : null;
                        const isLocked = false; // Unlocked all as requested

                        return (
                            <motion.div
                                key={subMod}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => !isLocked && startQuiz(subMod)}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all",
                                    isLocked ? "bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed" :
                                        isCompleted ? "bg-emerald-50 border-emerald-200 cursor-pointer hover:shadow-xl" :
                                            "bg-white border-blue-100 cursor-pointer shadow-xl shadow-blue-500/5 hover:-translate-y-1"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-inner font-black text-lg",
                                        isLocked ? "bg-slate-300" : isCompleted ? "bg-emerald-500" : "bg-blue-600"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900">{subMod}</h4>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                                            {qCount} Questions • Hindi
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {isLocked ? <Lock className="text-slate-300" size={24} /> :
                                        isCompleted ? <CheckCircle2 className="text-emerald-500 drop-shadow-sm" size={28} /> :
                                            <ArrowRight className="text-blue-500" size={24} />}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (view === 'quiz') {
        const qList = courseData[activeCourseKey].modules[activeSubModule];
        const currentQ = qList[quizState.qIndex];

        return (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-500">
                <button
                    onClick={() => setView('topics')}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 mb-8 self-start"
                >
                    <ChevronLeft size={20} /> Quit Quiz
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            {activeSubModule} <span className="text-slate-300">/</span> <span className="text-blue-600">Q{quizState.qIndex + 1}</span>
                        </h2>
                    </div>
                    <div className="h-10 w-10 rounded-full border-4 border-slate-100 flex items-center justify-center font-black text-xs text-slate-400 bg-white">
                        {quizState.qIndex + 1}/{qList.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full mb-12 overflow-hidden shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((quizState.qIndex + 1) / qList.length) * 100}%` }}
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
                        <div className="premium-card bg-white p-8 md:p-12 border border-slate-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden mb-8">
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-relaxed font-hindi">
                                {currentQ.question}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {currentQ.options.map((opt, i) => {
                                const isSelected = quizState.selectedOption === i;
                                const isCorrect = i === currentQ.correctAnswer;

                                let stateStyle = "bg-white border-slate-100 hover:border-blue-300 hover:-translate-y-1 shadow-sm text-slate-700";
                                if (quizState.isAnswered) {
                                    if (isCorrect) stateStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-emerald-500/20";
                                    else if (isSelected) stateStyle = "bg-red-50 border-red-500 text-red-800 shadow-red-500/20";
                                    else stateStyle = "bg-slate-50 border-transparent opacity-40 grayscale";
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
                                        {quizState.isAnswered && isCorrect && <CheckCircle2 className="text-emerald-500 shrink-0 ml-4 drop-shadow-sm" size={28} />}
                                        {quizState.isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 shrink-0 ml-4 drop-shadow-sm" size={28} />}
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
                        className="mt-8 p-6 bg-blue-50/80 backdrop-blur-md rounded-3xl border border-blue-100 text-blue-900 shadow-xl shadow-blue-500/10 font-hindi relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                        <span className="font-black uppercase tracking-[0.2em] text-[10px] block mb-2 text-blue-400 flex items-center gap-2"><Zap size={12} /> उत्तर (Explanation)</span>
                        <p className="text-lg font-bold leading-relaxed">{currentQ.explanation}</p>
                    </motion.div>
                )}
            </div>
        );
    }

    if (view === 'result') {
        const qList = courseData[activeCourseKey].modules[activeSubModule];
        const percentage = Math.round((quizState.score / qList.length) * 100);
        const passed = percentage >= 80;

        return (
            <div className="flex flex-col items-center justify-center py-20 text-center h-full animate-in zoom-in-95 duration-500">
                <div className="w-48 h-48 relative mb-10">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                        <circle cx="96" cy="96" r="84" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                        <motion.circle
                            cx="96" cy="96" r="84" fill="none" stroke={passed ? "#10b981" : "#ef4444"} strokeWidth="12"
                            strokeDasharray="528"
                            strokeDashoffset="528"
                            animate={{ strokeDashoffset: 528 - (528 * percentage) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
                    </div>
                </div>

                <h2 className={cn("text-4xl font-black mb-4 tracking-tight", passed ? "text-emerald-600" : "text-slate-900")}>
                    {passed ? "शानदार! (Module Cleared) 🌟" : "फिर प्रयास करें (Try Again) 💪"}
                </h2>
                <p className="text-slate-500 font-bold text-lg mb-12 max-w-md">
                    आपने {qList.length} में से {quizState.score} प्रश्नों का सही उत्तर दिया है।
                </p>

                <div className="flex flex-col md:flex-row gap-4 w-full max-w-sm">
                    <button
                        onClick={() => setView('topics')}
                        className="flex-1 py-5 rounded-[2rem] bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                        Back
                    </button>
                    {!passed && (
                        <button
                            onClick={() => startQuiz(activeSubModule)}
                            className="flex-1 py-5 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-300 transition-all hover:-translate-y-1"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (view === 'badge') {
        const Icon = ICONS[courseData[activeCourseKey]?.icon] || Trophy;
        return (
            <div className="flex flex-col items-center justify-center py-10 min-h-[60vh] text-center animate-in zoom-in-95 duration-700">
                <motion.div
                    initial={{ scale: 0.5, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ type: "spring", damping: 15, duration: 2 }}
                    className="relative mb-12"
                >
                    <div className="absolute inset-0 bg-amber-400 blur-[80px] opacity-30 rounded-full animate-pulse" />
                    <div className="h-64 w-64 bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-amber-900/20 border-[8px] border-amber-100 relative z-10">
                        <Icon size={80} className="text-white drop-shadow-md mb-4" />
                        <span className="text-white font-black uppercase tracking-[0.3em] text-xs opacity-90">Mastery</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
                        {activeCourseKey} <span className="text-amber-500">Master!</span>
                    </h2>
                    <p className="text-slate-500 font-bold text-lg max-w-xl mx-auto mb-10">
                        You have successfully completed every Hindi module inside {activeCourseKey}. Your Mastery Badge has been recorded to your profile!
                    </p>

                    <button
                        onClick={() => setView('courses')}
                        className="px-12 py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all"
                    >
                        Continue Journey
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
}
