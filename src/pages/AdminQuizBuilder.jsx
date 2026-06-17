import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/firestore';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { 
    Plus, Trash2, Save, ArrowLeft, CheckCircle2, 
    BookOpen, Layers, Edit3, X, Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminQuizBuilder() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    
    // Custom Quizzes Management
    const [existingQuizzes, setExistingQuizzes] = useState([]);
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [showQuizList, setShowQuizList] = useState(true);

    const [courseName, setCourseName] = useState('');
    const [topicName, setTopicName] = useState('');
    const [questions, setQuestions] = useState([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]);

    // Fetch existing custom quizzes
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'custom_quizzes'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setExistingQuizzes(list);
        });
        return () => unsub();
    }, []);

    const resetForm = () => {
        setCourseName('');
        setTopicName('');
        setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
        setEditingQuizId(null);
        setShowQuizList(true);
    };

    const handleCreateNew = () => {
        resetForm();
        setShowQuizList(false);
    };

    const handleEditQuiz = (quiz) => {
        setCourseName(quiz.courseId);
        setTopicName(quiz.topicId);
        setQuestions(quiz.questions || []);
        setEditingQuizId(quiz.id);
        setShowQuizList(false);
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm("Are you sure you want to delete this custom quiz permanently?")) return;
        try {
            await deleteDoc(doc(db, 'custom_quizzes', id));
            toast.success("Quiz deleted successfully");
            if (editingQuizId === id) resetForm();
        } catch (e) {
            toast.error("Failed to delete quiz");
        }
    };

    const handleDuplicateQuiz = async (quiz) => {
        try {
            await addDoc(collection(db, 'custom_quizzes'), {
                courseId: `${quiz.courseId} (Copy)`,
                topicId: quiz.topicId,
                questions: quiz.questions,
                createdAt: serverTimestamp(),
                createdBy: 'Admin'
            });
            toast.success("Quiz duplicated!");
        } catch (e) {
            toast.error("Failed to duplicate quiz");
        }
    };

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

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) return toast.error(`Question ${i + 1} text is empty!`);
            if (q.options.some(opt => !opt.trim())) return toast.error(`Some options in Question ${i + 1} are empty!`);
            if (!q.explanation.trim()) return toast.error(`Explanation for Question ${i + 1} is empty!`);
        }

        setIsSaving(true);
        try {
            if (editingQuizId) {
                await updateDoc(doc(db, 'custom_quizzes', editingQuizId), {
                    courseId: courseName.trim(),
                    topicId: topicName.trim(),
                    questions: questions,
                    updatedAt: serverTimestamp()
                });
                toast.success("Quiz updated successfully!");
            } else {
                await addDoc(collection(db, 'custom_quizzes'), {
                    courseId: courseName.trim(),
                    topicId: topicName.trim(),
                    questions: questions,
                    createdAt: serverTimestamp(),
                    createdBy: 'Admin'
                });
                toast.success("Custom Quiz created successfully!");
            }
            resetForm();
        } catch (error) {
            console.error("Error saving quiz:", error);
            toast.error("Failed to save quiz");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-inter">
            {/* Header */}
            <div className="bg-slate-900 text-white pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
                    <BookOpen size={200} />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <button 
                        onClick={() => navigate('/admin/dashboard')} 
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Quiz Builder Studio</h1>
                            <p className="text-blue-400 font-bold max-w-2xl text-lg">Manage and create pro-level custom quizzes for your live sessions.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                {showQuizList ? (
                    /* Existing Quizzes Dashboard */
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <Layers className="text-blue-600" />
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Your Quizzes</h2>
                            </div>
                            <button 
                                onClick={handleCreateNew}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30 w-full sm:w-auto justify-center"
                            >
                                <Plus size={20} /> Create New Quiz
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {existingQuizzes.length === 0 ? (
                                <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500 font-bold text-lg">No custom quizzes found. Create one to get started!</p>
                                </div>
                            ) : (
                                existingQuizzes.map(quiz => (
                                    <div key={quiz.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all group flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-slate-900 mb-1 line-clamp-1">{quiz.courseId}</h3>
                                            <p className="text-blue-600 font-bold text-sm mb-4 line-clamp-1">{quiz.topicId}</p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-black text-slate-500 uppercase">
                                                <span>{quiz.questions?.length || 0} Questions</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-200">
                                            <button onClick={() => handleEditQuiz(quiz)} className="flex-1 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-colors">
                                                <Edit3 size={16} /> Edit
                                            </button>
                                            <button onClick={() => handleDuplicateQuiz(quiz)} className="p-2 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg transition-colors" title="Duplicate">
                                                <Copy size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* Quiz Editor / Creator */
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <Layers className="text-blue-600" />
                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                                        {editingQuizId ? 'Edit Quiz' : 'New Quiz'} Details
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Course / Category Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g., Python Masterclass"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Topic / Chapter Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g., Variables & Data Types"
                                        value={topicName}
                                        onChange={(e) => setTopicName(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-6">
                            <AnimatePresence>
                                {questions.map((q, qIndex) => (
                                    <motion.div 
                                        key={qIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm hover:shadow-xl transition-shadow border border-slate-200 relative group"
                                    >
                                        <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-slate-900/20">
                                            {qIndex + 1}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleRemoveQuestion(qIndex)}
                                            className="absolute top-6 right-6 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                            title="Remove Question"
                                        >
                                            <Trash2 size={20} />
                                        </button>

                                        <div className="space-y-6 mt-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Question Text</label>
                                                <textarea 
                                                    placeholder="Enter your question here..."
                                                    value={q.question}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                    className="w-full p-4 md:p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg md:text-xl text-slate-900 font-hindi focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[100px] resize-none"
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
                                                            className={`w-full p-3 md:p-4 pl-12 md:pl-14 border-2 rounded-xl font-bold font-hindi outline-none transition-all ${
                                                                q.correctAnswer === optIndex 
                                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                                                                    : 'bg-slate-50 border-slate-100 focus:border-slate-300 text-slate-700'
                                                            }`}
                                                        />
                                                        <button 
                                                            onClick={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                                                            className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                                                q.correctAnswer === optIndex ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-transparent hover:bg-slate-300'
                                                            }`}
                                                            title="Mark as correct answer"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Explanation</label>
                                                <textarea 
                                                    placeholder="Explain why this answer is correct..."
                                                    value={q.explanation}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                                    className="w-full p-4 bg-amber-50/50 border-2 border-amber-100/50 rounded-xl font-bold text-slate-700 font-hindi focus:border-amber-400 outline-none transition-all resize-none h-24"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                            <button 
                                onClick={handleAddQuestion}
                                className="w-full md:w-auto px-6 py-4 bg-white text-blue-600 border-2 border-blue-100 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <Plus size={20} /> Add Next Question
                            </button>
                            <button 
                                onClick={handleSaveQuiz}
                                disabled={isSaving}
                                className="w-full md:w-auto flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save size={20} /> {editingQuizId ? 'Update Quiz' : 'Save & Publish Quiz'}</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
