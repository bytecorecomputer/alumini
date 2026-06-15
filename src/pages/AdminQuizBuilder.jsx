import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { 
    Plus, Trash2, Save, ArrowLeft,
    CheckCircle2, AlertCircle, BookOpen, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminQuizBuilder() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    
    const [courseName, setCourseName] = useState('');
    const [topicName, setTopicName] = useState('');
    const [questions, setQuestions] = useState([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        if (questions.length === 1) return toast.error("You need at least one question!");
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQ = [...questions];
        newQ[index][field] = value;
        setQuestions(newQ);
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const newQ = [...questions];
        newQ[qIndex].options[optIndex] = value;
        setQuestions(newQ);
    };

    const handleSaveQuiz = async () => {
        if (!courseName.trim() || !topicName.trim()) {
            return toast.error("Course and Topic Name are required!");
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) return toast.error(`Question ${i + 1} text is empty!`);
            if (q.options.some(opt => !opt.trim())) return toast.error(`Some options in Question ${i + 1} are empty!`);
            if (!q.explanation.trim()) return toast.error(`Explanation for Question ${i + 1} is empty!`);
        }

        setIsSaving(true);
        try {
            // Save to 'custom_quizzes'
            await addDoc(collection(db, 'custom_quizzes'), {
                courseId: courseName.trim(), // Storing as is, we'll group by this later
                topicId: topicName.trim(),
                questions: questions,
                createdAt: serverTimestamp(),
                createdBy: 'Admin'
            });

            toast.success("Custom Quiz saved successfully!");
            navigate('/admin/live-quiz');
        } catch (error) {
            console.error("Error saving quiz:", error);
            toast.error("Failed to save quiz");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="bg-slate-900 text-white pt-24 pb-32 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
                    <BookOpen size={200} />
                </div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <button 
                        onClick={() => navigate('/admin/dashboard')} 
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Quiz Builder Studio</h1>
                    <p className="text-blue-400 font-bold max-w-2xl text-lg">Create pro-level custom quizzes for your live sessions. No coding required.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 md:px-12 -mt-20 relative z-20 space-y-8">
                {/* Meta Data Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                        <Layers className="text-blue-600" />
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Quiz Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Course / Category Name</label>
                            <input 
                                type="text"
                                placeholder="e.g., Python Masterclass"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Topic / Chapter Name</label>
                            <input 
                                type="text"
                                placeholder="e.g., Variables & Data Types"
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-8">
                    <AnimatePresence>
                        {questions.map((q, qIndex) => (
                            <motion.div 
                                key={qIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm hover:shadow-xl transition-shadow border border-slate-200 relative group"
                            >
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-slate-900/20">
                                    {qIndex + 1}
                                </div>
                                
                                <button 
                                    onClick={() => handleRemoveQuestion(qIndex)}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>

                                <div className="space-y-8 mt-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Question Text</label>
                                        <textarea 
                                            placeholder="Enter your question here..."
                                            value={q.question}
                                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold text-xl text-slate-900 font-hindi focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="relative">
                                                <input 
                                                    type="text"
                                                    placeholder={`Option ${optIndex + 1}`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                    className={`w-full p-4 pl-14 border-2 rounded-2xl font-bold font-hindi outline-none transition-all ${
                                                        q.correctAnswer === optIndex 
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                                                            : 'bg-slate-50 border-slate-100 focus:border-slate-300 text-slate-700'
                                                    }`}
                                                />
                                                <button 
                                                    onClick={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                                                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                                        q.correctAnswer === optIndex ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-transparent hover:bg-slate-300'
                                                    }`}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Detailed Explanation (Shown after answer)</label>
                                        <textarea 
                                            placeholder="Explain why this answer is correct..."
                                            value={q.explanation}
                                            onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                            className="w-full p-4 bg-amber-50/50 border-2 border-amber-100/50 rounded-2xl font-bold text-slate-700 font-hindi focus:border-amber-400 outline-none transition-all resize-none h-24"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 pt-8">
                    <button 
                        onClick={handleAddQuestion}
                        className="w-full md:w-auto px-8 py-5 bg-white text-blue-600 border-2 border-blue-100 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                    >
                        <Plus size={20} /> Add Next Question
                    </button>
                    <button 
                        onClick={handleSaveQuiz}
                        disabled={isSaving}
                        className="w-full md:w-auto flex-1 px-8 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save size={20} /> Save & Publish Custom Quiz</>}
                    </button>
                </div>

                <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-2xl text-blue-800">
                    <AlertCircle className="shrink-0 text-blue-600" />
                    <p className="font-bold text-sm">Once saved, this quiz will immediately be available in your Live Quiz Host Panel under the selected Course Name.</p>
                </div>
            </div>
        </div>
    );
}
