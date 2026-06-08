import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, PlayCircle, ArrowRight, Target, Zap, Trophy, MonitorPlay, Code, FileText } from 'lucide-react';
import SEO from '../components/common/SEO';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';

const ICONS = {
    "file-word": <FileText size={32} />,
    "table": <Target size={32} />,
    "monitor": <MonitorPlay size={32} />,
    "default": <BrainCircuit size={32} />
};

export default function QuizHub() {
    const navigate = useNavigate();
    const [globalXP, setGlobalXP] = useState(0);

    useEffect(() => {
        setGlobalXP(parseInt(localStorage.getItem('bytecore_xp') || '0', 10));
    }, []);

    // Extract all available topics across major courses
    const allTopics = [];
    const targetCourses = ['ADCA', 'Python', 'React', 'Tally', 'O Level']; // Prioritize these if they exist, else take first 5
    
    Object.keys(HINDI_QUIZ_DATA).forEach(courseId => {
        if(targetCourses.includes(courseId) || allTopics.length < 10) {
            Object.keys(HINDI_QUIZ_DATA[courseId]).forEach(topicId => {
                const topic = HINDI_QUIZ_DATA[courseId][topicId];
                if (topic?.modules?.["Master Assessment"]) {
                    // Avoid duplicates
                    if(!allTopics.find(t => t.topicId === topicId)) {
                        allTopics.push({
                            courseId,
                            topicId,
                            description: topic.description,
                            icon: ICONS[topic.icon] || ICONS.default,
                            color: topic.color || 'blue'
                        });
                    }
                }
            });
        }
    });

    const handleStartQuiz = (courseId, topicId) => {
        navigate(`/quiz/${encodeURIComponent(courseId)}/${encodeURIComponent(topicId)}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24 font-sans">
            <SEO title="Global Quizzes | ByteCore" description="Test your IT skills with ByteCore's high-level interactive quizzes." />
            
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Global Stats Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white p-4 rounded-full border border-slate-200 shadow-sm max-w-xl mx-auto mb-16"
                >
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Global XP</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{globalXP}</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Status</p>
                            <p className="text-sm font-black text-amber-600 leading-none">PRO</p>
                        </div>
                    </div>
                </motion.div>

                <div className="text-center mb-20">
                    <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block flex items-center justify-center gap-2">
                        <BrainCircuit size={16} /> Open Assessments
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                        Prove Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dominance</span>.
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        No login required. Challenge yourself with industry-standard quizzes. Secure top ranks, earn XP, and prove your tech skills instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allTopics.map((quiz, i) => (
                        <motion.div 
                            key={`${quiz.courseId}-${quiz.topicId}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 group relative overflow-hidden flex flex-col justify-between hover:-translate-y-2 transition-transform duration-500 cursor-pointer"
                            onClick={() => handleStartQuiz(quiz.courseId, quiz.topicId)}
                        >
                            <div className={`absolute -top-20 -right-20 w-64 h-64 bg-${quiz.color}-500 opacity-5 blur-[80px] rounded-full group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`}></div>
                            
                            <div className="relative z-10 mb-8">
                                <div className={`w-16 h-16 rounded-2xl bg-${quiz.color}-500 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                                    {quiz.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">{quiz.topicId}</h3>
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 border border-slate-200 inline-block px-3 py-1 rounded-full">
                                    {quiz.courseId}
                                </div>
                                <p className="text-slate-500 font-medium leading-relaxed">{quiz.description}</p>
                            </div>
                            
                            <div className="relative z-10 flex items-center justify-between border-t border-slate-100 pt-6">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">30 Questions</span>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
