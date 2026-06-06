import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/common/AuthContext';
import { BrainCircuit, X, UserCheck, UserPlus, PlayCircle, Trophy, Code, Database, MonitorPlay } from 'lucide-react';
import SEO from '../components/common/SEO';

const QuizHub = () => {
    const { isStudent } = useAuth();
    const navigate = useNavigate();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const quizzes = [
        { id: 'python', title: 'Python Mastery', desc: 'Test your logic, data structures, and AI knowledge.', icon: <Database size={32} />, color: 'bg-blue-500' },
        { id: 'react', title: 'React JS Developer', desc: 'Assess your React hooks, state management, and UI skills.', icon: <Code size={32} />, color: 'bg-purple-500' },
        { id: 'adca', title: 'ADCA / Core IT', desc: 'Check your knowledge on OS, Word, Excel, and Web basics.', icon: <MonitorPlay size={32} />, color: 'bg-emerald-500' },
        { id: 'tally', title: 'Tally Prime Accounting', desc: 'Evaluate your financial accounting and GST expertise.', icon: <Trophy size={32} />, color: 'bg-amber-500' },
    ];

    const handleStartQuiz = () => {
        if (isStudent) {
            navigate('/student-portal?tab=quiz');
        } else {
            setAuthModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <SEO title="Skill Quizzes | ByteCore" description="Test your IT skills with ByteCore's high-level interactive quizzes." />
            
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block flex items-center justify-center gap-2">
                        <BrainCircuit size={16} /> Knowledge Assessment
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                        Prove Your <span className="text-blue-600">Tech Skills</span>.
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Challenge yourself with our industry-standard quizzes. Secure top ranks and earn verifiable digital badges.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {quizzes.map((quiz, i) => (
                        <motion.div 
                            key={quiz.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 group relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-40 h-40 ${quiz.color} opacity-5 blur-[100px] rounded-full group-hover:opacity-20 transition-opacity duration-700`}></div>
                            
                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-2xl ${quiz.color} text-white flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                                    {quiz.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{quiz.title}</h3>
                                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{quiz.desc}</p>
                                    
                                    <button 
                                        onClick={handleStartQuiz}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-colors shadow-md active:scale-95 group/btn"
                                    >
                                        <PlayCircle size={16} /> 
                                        Start Quiz
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Auth Modal */}
            <AnimatePresence>
                {authModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setAuthModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <button 
                                onClick={() => setAuthModalOpen(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <BrainCircuit size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h2>
                                <p className="text-slate-500 font-medium text-sm">Please identify yourself to record your quiz progress and earn your certificate.</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95"
                                >
                                    <UserCheck size={16} />
                                    Existing Student Login
                                </button>
                                
                                <div className="flex items-center gap-4 my-2 opacity-50">
                                    <div className="flex-1 h-px bg-slate-300"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">OR</span>
                                    <div className="flex-1 h-px bg-slate-300"></div>
                                </div>

                                <button 
                                    onClick={() => navigate('/register')}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors active:scale-95"
                                >
                                    <UserPlus size={16} />
                                    New Registration
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizHub;
