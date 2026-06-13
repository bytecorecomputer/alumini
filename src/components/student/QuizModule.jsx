import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
    CheckCircle2, XCircle, Trophy, Brain, ArrowRight, BookOpen,
    FileText, Table, Lock, Zap, ChevronLeft, Target, Award,
    PlayCircle, Sparkles, Monitor
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { HINDI_QUIZ_DATA } from '../../data/hindiQuizData';
import { studentQuizProfileInit, getStudentQuizProgress, markModuleCompleted, awardMasterBadge } from '../../lib/quizDb';
import { selectActiveCourseModules, selectActiveStudentCourse } from '../../app/store/courseSlice';
import toast from 'react-hot-toast';

// Icon Map for dynamic rendering
const ICONS = {
    "file-word": FileText,
    "table": Table,
    "monitor": Monitor,
    "brain": Brain,
    "default": BookOpen
};

export default function QuizModule({ student }) {
    const [view, setView] = useState('courses'); // courses | topics | quiz | result | badge
    const [activeCourseKey, setActiveCourseKey] = useState(null); // Actually module key, e.g. "ms_word"
    const [activeSubModule, setActiveSubModule] = useState(null); // e.g. "Home Tab"

    // Fetch dynamic modules mapped to this specific student's compound course (e.g., O Level + Accounting)
    const activeModules = useSelector(selectActiveCourseModules);
    const compoundCourseName = useSelector(selectActiveStudentCourse) || student.course || "DCA";

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
    const [isDownloading, setIsDownloading] = useState(false);

    // 1. Build courseData dynamically from activeModules
    const courseData = React.useMemo(() => {
        const data = {};
        if (activeModules && activeModules.length > 0) {
            activeModules.forEach(mod => {
                if (HINDI_QUIZ_DATA[mod.id]) {
                    data[mod.id] = HINDI_QUIZ_DATA[mod.id];
                } else {
                    // Inject a placeholder so the UI looks complete even if no questions exist yet
                    data[mod.id] = {
                        title: mod.title,
                        description: mod.description,
                        icon: mod.icon || "default",
                        color: mod.color || "slate",
                        modules: {} // Empty modules = "Coming Soon"
                    };
                }
            });
        }
        return data;
    }, [activeModules]);

    const downloadCertificate = async () => {
        setIsDownloading(true);
        toast.loading('Generating high-resolution certificate...', { id: 'certGen' });
        const certElement = document.getElementById('certificate-node');
        if (certElement) {
            try {
                const [html2canvas, { default: jsPDF }] = await Promise.all([
                    import('html2canvas').then(m => m.default),
                    import('jspdf')
                ]);
                const canvas = await html2canvas(certElement, {
                    scale: 3, // High resolution
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                
                pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                const modTitle = courseData[activeCourseKey]?.title || "Course";
                pdf.save(`${student.studentName || 'Student'}_${modTitle}_Certificate.pdf`);
                toast.success('Certificate downloaded successfully!', { id: 'certGen' });
            } catch (error) {
                console.error("Failed to generate certificate", error);
                toast.error("Failed to download certificate. Please try again.", { id: 'certGen' });
            }
        } else {
            toast.dismiss('certGen');
        }
        setIsDownloading(false);
    };

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
    const totalAvailableSubModules = Object.values(courseData).reduce((sum, topic) => sum + Object.keys(topic.modules || {}).length, 0);
    const overallPercentage = totalAvailableSubModules > 0 ? Math.round((progress.completedModules.length / totalAvailableSubModules) * 100) : 0;

    // Handlers
    const handleTopicClick = (topicKey) => {
        const data = courseData[topicKey];
        if (Object.keys(data.modules || {}).length === 0) {
            toast.success("This premium module will be unlocked soon!", { icon: "⏳" });
            return;
        }
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
        }, 3000);
    };

    const finishQuiz = async (finalScore) => {
        setSaving(true);
        const qList = courseData[activeCourseKey].modules[activeSubModule];
        const requiredScore = Math.ceil(qList.length * 0.8); // 80% to pass
        const passed = finalScore >= requiredScore;

        const moduleIdentifier = `${activeCourseKey}|${activeSubModule}`;

        const allSubModules = Object.keys(courseData[activeCourseKey].modules);
        const isFirstModule = allSubModules.indexOf(activeSubModule) === 0;

        if ((passed || isFirstModule) && student?.registration) {
            await markModuleCompleted(student.registration, moduleIdentifier, finalScore);
            // Refresh local state
            const newData = await getStudentQuizProgress(student.registration);
            if (newData) setProgress(newData);

            // Check if entire topic is completed
            const completedCount = allSubModules.filter(sub => (newData.completedModules || []).includes(`${activeCourseKey}|${sub}`)).length;

            if (completedCount === allSubModules.length) {
                const badgeIdentifier = `${courseData[activeCourseKey].title} Master`;
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
                <Brain className="animate-pulse text-indigo-400" size={48} />
            </div>
        );
    }

    if (view === 'notes') {
        const data = courseData[activeCourseKey];
        return (
            <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
                <button
                    onClick={() => setView('topics')}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors mb-8"
                >
                    <ChevronLeft size={20} /> Back to Modules
                </button>

                <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                        <div className={`p-4 rounded-2xl bg-${data.color || 'blue'}-100 text-${data.color || 'blue'}-600`}>
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{data.title} - Master Guide</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Official Study Notes</p>
                        </div>
                    </div>

                    <div 
                        className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-ul:list-disc prose-li:font-medium"
                        dangerouslySetInnerHTML={{ __html: data.notes }}
                    />
                </div>
            </div>
        );
    }

    if (view === 'courses') {
        const topics = Object.keys(courseData);
        if (topics.length === 0) {
            return (
                <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-2xl font-black text-slate-800">No Content Found</h3>
                    <p className="text-slate-500 mt-2">Contact admin to map modules for your course.</p>
                </div>
            );
        }

        return (
            <div className="space-y-10 animate-in fade-in duration-500 pb-20">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 p-8 md:p-12 border border-slate-800 shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <Sparkles size={200} className="text-blue-200" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-xs font-black tracking-widest uppercase mb-6 border border-white/10">
                                <Sparkles size={14} /> My Learning Hub
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mastery</span>
                            </h2>
                            <p className="text-slate-400 font-medium mt-4 max-w-xl text-lg">
                                Access precise practice modules curated specifically for your <strong className="text-white bg-white/10 px-2 py-0.5 rounded-md">{compoundCourseName}</strong> enrollment. Complete modules to earn mastery certificates.
                            </p>
                        </div>
                        
                        {/* Overall Progress Widget */}
                        <div className="shrink-0 flex items-center gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                    <circle cx="48" cy="48" r="40" fill="none" stroke="#60a5fa" strokeWidth="8"
                                        strokeDasharray="251" strokeDashoffset={251 - (251 * overallPercentage) / 100}
                                        strokeLinecap="round" className="transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">{overallPercentage}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Progress</p>
                                <p className="text-sm font-bold text-slate-300">{progress.completedModules.length} Modules Finished</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map((topicKey, idx) => {
                        const data = courseData[topicKey];
                        const Icon = ICONS[data.icon] || ICONS.default;
                        
                        const subModules = Object.keys(data.modules || {});
                        const completedCount = subModules.filter(sub => progress.completedModules.includes(`${topicKey}|${sub}`)).length;
                        const isTopicComplete = completedCount === subModules.length && subModules.length > 0;
                        const isComingSoon = subModules.length === 0;

                        return (
                            <motion.div
                                key={topicKey}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleTopicClick(topicKey)}
                                className={cn(
                                    "group cursor-pointer p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col min-h-[260px]",
                                    isComingSoon 
                                        ? "bg-slate-50 border-slate-200 grayscale-[0.5] opacity-80" 
                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10"
                                )}
                            >
                                {/* Background Accent */}
                                <div className={cn(
                                    "absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:scale-150",
                                    isComingSoon ? "bg-slate-400" : `bg-${data.color || 'blue'}-500`
                                )} />

                                <div className="relative z-10 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                            isTopicComplete ? "bg-emerald-500 shadow-emerald-500/30" 
                                            : isComingSoon ? "bg-slate-400" 
                                            : `bg-gradient-to-br from-${data.color || 'blue'}-500 to-${data.color || 'blue'}-600 shadow-${data.color || 'blue'}-500/30`
                                        )}>
                                            <Icon size={28} />
                                        </div>
                                        {isTopicComplete && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                <Award size={12} /> Mastered
                                            </div>
                                        )}
                                        {isComingSoon && (
                                            <div className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                Soon
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{data.title || topicKey.replace('_', ' ').toUpperCase()}</h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2">
                                        {data.description}
                                    </p>
                                </div>

                                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        {isComingSoon ? "In Development" : `${completedCount} / ${subModules.length} Modules`}
                                    </p>
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                                        isComingSoon ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white"
                                    )}>
                                        <ArrowRight size={16} className={cn("transition-transform", !isComingSoon && "group-hover:translate-x-0.5")} />
                                    </div>
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
        const subModules = Object.keys(data.modules || {});
        const Icon = ICONS[data.icon] || ICONS.default;

        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                <button
                    onClick={() => setView('courses')}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors w-max"
                >
                    <ChevronLeft size={20} /> Back to Hub
                </button>

                <div className={cn(`p-10 rounded-[2.5rem] bg-gradient-to-br from-${data.color || 'blue'}-500 to-${data.color || 'blue'}-700 text-white shadow-2xl relative overflow-hidden`)}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="h-24 w-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shrink-0">
                            <Icon size={48} className="text-white drop-shadow-md" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-4xl md:text-5xl font-black mb-3">{data.title || activeCourseKey}</h2>
                            <p className="text-white/80 font-medium text-lg max-w-2xl">{data.description}</p>
                        </div>
                        {data.notes && (
                            <button onClick={() => setView('notes')} className="shrink-0 mt-4 md:mt-0 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-black/10">
                                <FileText size={18} /> Master Guide
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subModules.map((subMod, idx) => {
                        const identifier = `${activeCourseKey}|${subMod}`;
                        const isCompleted = progress.completedModules.includes(identifier);
                        const qCount = data.modules[subMod].length;

                        return (
                            <motion.div
                                key={subMod}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => startQuiz(subMod)}
                                className={cn(
                                    "group cursor-pointer p-6 rounded-3xl border-2 flex items-center justify-between transition-all",
                                    isCompleted 
                                        ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-300" 
                                        : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center text-white font-black shadow-sm",
                                        isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                                    )}>
                                        {isCompleted ? <CheckCircle2 size={24} /> : <PlayCircle size={24} className="ml-1" />}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{subMod}</h4>
                                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest mt-1.5 flex items-center gap-1.5">
                                            <FileText size={12} /> {qCount} Questions
                                        </p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "opacity-0 -translate-x-4 transition-all duration-300",
                                    "group-hover:opacity-100 group-hover:translate-x-0"
                                )}>
                                    <ArrowRight className="text-indigo-500" size={24} />
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
        const progressPercent = ((quizState.qIndex) / qList.length) * 100;

        return (
            <div className="max-w-3xl mx-auto flex flex-col min-h-[70vh] pb-32 animate-in fade-in slide-in-from-bottom-8 duration-500 relative">
                {/* Thin App-like Progress Bar inside container */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 rounded-full overflow-hidden mb-6">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: \`\${progressPercent}%\` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-indigo-600"
                    />
                </div>

                <div className="flex justify-between items-center mb-8 mt-4">
                    <button
                        onClick={() => setView('topics')}
                        className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors bg-white hover:bg-slate-50 px-4 py-2 rounded-full text-sm border border-slate-200 shadow-sm"
                    >
                        <ChevronLeft size={16} /> Exit
                    </button>
                    
                    <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</span>
                        <div className="text-sm font-black text-indigo-600">
                            {quizState.qIndex + 1} <span className="text-indigo-300">/ {qList.length}</span>
                        </div>
                    </div>
                </div>

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
                        <div className="mb-6 md:mb-10">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-snug font-hindi">
                                {currentQ.question}
                            </h3>
                        </div>

                        {/* Options - Touch friendly */}
                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                            {currentQ.options.map((opt, i) => {
                                const isSelected = quizState.selectedOption === i;
                                const isCorrect = i === currentQ.correctAnswer;

                                let stateStyle = "bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md text-slate-700 hover:bg-indigo-50/30";
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

                {/* Mobile App-like Bottom Sheet for Explanation */}
                <AnimatePresence>
                    {quizState.isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed md:absolute bottom-16 md:bottom-0 left-0 right-0 bg-white border-t md:border border-slate-200 shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.1)] md:shadow-2xl z-40 p-5 md:p-8 rounded-t-[2rem] md:rounded-[2rem]"
                        >
                            <div className="max-w-3xl mx-auto flex flex-col gap-2">
                                <span className={cn(
                                    "font-black uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-1.5",
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

    if (view === 'result') {
        const qList = courseData[activeCourseKey].modules[activeSubModule];
        const percentage = Math.round((quizState.score / qList.length) * 100);
        const passed = percentage >= 80;

        return (
            <div className="flex flex-col items-center justify-center py-20 text-center min-h-[60vh] animate-in zoom-in-95 duration-500">
                <div className="relative mb-12">
                    <div className={cn(
                        "absolute inset-0 rounded-full blur-3xl opacity-30",
                        passed ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    <div className="w-48 h-48 relative bg-white rounded-full shadow-2xl p-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <motion.circle
                                cx="80" cy="80" r="70" fill="none" stroke={passed ? "#10b981" : "#f43f5e"} strokeWidth="12"
                                strokeDasharray="440" strokeDashoffset="440"
                                animate={{ strokeDashoffset: 440 - (440 * percentage) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-800">{percentage}%</span>
                        </div>
                    </div>
                </div>

                <h2 className={cn("text-4xl md:text-5xl font-black mb-4 tracking-tight", passed ? "text-emerald-600" : "text-slate-800")}>
                    {passed ? "शानदार! (Mastered)" : "फिर प्रयास करें (Keep Trying)"}
                </h2>
                <p className="text-slate-500 font-medium text-lg mb-12 max-w-md">
                    You answered {quizState.score} out of {qList.length} questions correctly. 
                    {passed ? " Brilliant performance." : " Review the concepts and try again."}
                </p>

                <div className="flex flex-col md:flex-row gap-4 w-full max-w-md px-4">
                    <button
                        onClick={() => setView('topics')}
                        className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                        Return to Hub
                    </button>
                    {!passed && (
                        <button
                            onClick={() => startQuiz(activeSubModule)}
                            className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:-translate-y-1"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (view === 'badge') {
        const Icon = ICONS[courseData[activeCourseKey]?.icon] || Trophy;
        const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        
        return (
            <div className="flex flex-col items-center justify-center py-10 min-h-[60vh] animate-in zoom-in duration-700 relative w-full overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/20 rounded-full blur-[100px] pointer-events-none" />
                
                {/* Actions */}
                <div className="flex gap-4 mb-12 relative z-50">
                    <button
                        onClick={() => setView('courses')}
                        className="px-6 py-3 rounded-full bg-white/80 backdrop-blur-md text-slate-700 font-black uppercase tracking-widest hover:bg-white transition-all text-xs border border-slate-200 shadow-sm"
                    >
                        Back to Hub
                    </button>
                    <button
                        onClick={downloadCertificate}
                        disabled={isDownloading}
                        className="px-6 py-3 rounded-full bg-amber-500 text-white font-black uppercase tracking-widest hover:bg-amber-600 transition-all text-xs shadow-xl shadow-amber-500/30 flex items-center gap-2"
                    >
                        {isDownloading ? <span className="animate-pulse">Generating HD PDF...</span> : 'Download Certificate'}
                    </button>
                </div>

                {/* --- CERTIFICATE RENDER NODE (HIDDEN FROM RESPONSIVE SCALING, FIXED SIZE FOR EXPORT) --- */}
                <div className="w-full overflow-hidden flex justify-center pb-10">
                    <div 
                        id="certificate-node" 
                        className="relative bg-white text-slate-900 shadow-2xl flex-shrink-0"
                        style={{ width: '1122px', height: '793px', border: '20px solid #1e293b' }}
                    >
                        {/* Intricate Borders */}
                        <div className="absolute inset-2 border-[4px] border-amber-500/30"></div>
                        <div className="absolute inset-4 border-[1px] border-amber-600/50"></div>
                        
                        {/* Corner Ornaments */}
                        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-500"></div>
                        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-500"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-500"></div>
                        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-500"></div>

                        {/* Background Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] grayscale pointer-events-none">
                            <img src="/logo.png" alt="" className="w-2/3 object-contain" />
                        </div>

                        {/* Certificate Content */}
                        <div className="relative z-10 w-full h-full flex flex-col items-center pt-20 px-24 text-center">
                            
                            <div className="flex items-center gap-6 mb-12">
                                <img src="/logo.png" alt="ByteCore" className="h-20" />
                                <div className="text-left border-l-2 border-slate-200 pl-6">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">ByteCore</h1>
                                    <p className="text-sm font-bold text-amber-600 tracking-[0.3em] uppercase mt-1">Computer Centre</p>
                                </div>
                            </div>

                            <h2 className="text-6xl font-[1000] text-amber-500 tracking-widest uppercase mb-4 font-serif">Certificate of Mastery</h2>
                            <p className="text-slate-500 font-medium tracking-[0.2em] uppercase mb-12">This acknowledges that</p>

                            <h3 className="text-7xl font-black text-slate-900 mb-10 capitalize italic border-b-2 border-slate-200 pb-4 px-20">
                                {student?.studentName || 'Esteemed Student'}
                            </h3>

                            <p className="text-xl text-slate-600 max-w-3xl leading-relaxed mb-6">
                                has successfully completed all advanced assessments and demonstrated outstanding proficiency in the 
                                <strong className="text-slate-900 px-2">{courseData[activeCourseKey]?.title || activeCourseKey}</strong> curriculum.
                            </p>

                            <div className="flex items-center gap-2 bg-amber-50 px-6 py-2 rounded-full border border-amber-200 mb-16">
                                <Icon className="text-amber-600" size={24} />
                                <span className="font-black text-amber-700 tracking-widest uppercase text-sm">Verified Professional Skill</span>
                            </div>

                            {/* Footer / Signatures */}
                            <div className="w-full flex justify-between items-end mt-auto pb-16 px-10">
                                <div className="text-center">
                                    <div className="w-48 h-12 flex items-center justify-center font-serif text-3xl text-slate-800 border-b border-slate-400 mb-2">
                                        Rahul
                                    </div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Rahul Sir<br/>Director, ByteCore</p>
                                </div>

                                <div className="w-40 h-40 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl relative">
                                    <div className="absolute inset-2 border-2 border-dashed border-white/50 rounded-full"></div>
                                    <div className="text-center">
                                        <Award className="text-white mx-auto mb-1" size={32} />
                                        <div className="text-white font-black text-[10px] tracking-[0.2em] uppercase">Official<br/>Seal</div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="w-48 h-12 flex items-center justify-center text-lg font-medium text-slate-800 border-b border-slate-400 mb-2">
                                        {currentDate}
                                    </div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Date of Issue</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
