import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/firestore';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
    Plus, Trash2, Save, ArrowLeft, CheckCircle2,
    BookOpen, Layers, Edit3, X, Copy, ArrowUp, ArrowDown,
    Search, ChevronDown, ChevronRight, ListChecks, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COURSE_MODULES_MAP } from '../data/curriculum';
import { QUIZ_BANK } from '../lib/quizData';

const moduleLabel = (id) => QUIZ_BANK[id]?.title || id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
const courseOptions = Object.keys(COURSE_MODULES_MAP).filter(k => k !== 'default');

export default function AdminQuizBuilder() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [view, setView] = useState('list'); // 'list' | 'pickCourse' | 'editor'
    const [listSearch, setListSearch] = useState('');
    const [expandedCourse, setExpandedCourse] = useState(null);

    const [existingQuizzes, setExistingQuizzes] = useState([]);
    const [quizzesLoading, setQuizzesLoading] = useState(true);
    const [editingQuizId, setEditingQuizId] = useState(null);

    const [courseName, setCourseName] = useState('');
    const [topicName, setTopicName] = useState('');
    const [selectedCourseCategory, setSelectedCourseCategory] = useState('');
    const [useCustomCourseId, setUseCustomCourseId] = useState(false);
    const [questions, setQuestions] = useState([emptyQuestion()]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'custom_quizzes'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setExistingQuizzes(list);
            setQuizzesLoading(false);
        });
        return () => unsub();
    }, []);

    // Group every saved quiz under the course it belongs to, so the admin
    // can find "all quizzes for ADCA" at a glance instead of scanning a
    // flat list. Quizzes whose courseId doesn't match a known course are
    // bucketed under "Other / Custom".
    const groupedQuizzes = useMemo(() => {
        const groups = new Map();
        const term = listSearch.trim().toLowerCase();

        existingQuizzes.forEach(quiz => {
            if (term) {
                const haystack = `${quiz.courseId} ${quiz.topicId} ${QUIZ_BANK[quiz.courseId]?.title || ''}`.toLowerCase();
                if (!haystack.includes(term)) return;
            }
            const owner = courseOptions.find(c => (COURSE_MODULES_MAP[c] || []).includes(quiz.courseId));
            const key = owner || 'Other / Custom';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(quiz);
        });

        // Keep course order matching COURSE_MODULES_MAP, then "Other" last.
        const ordered = courseOptions.filter(c => groups.has(c)).map(c => [c, groups.get(c)]);
        if (groups.has('Other / Custom')) ordered.push(['Other / Custom', groups.get('Other / Custom')]);
        return ordered;
    }, [existingQuizzes, listSearch]);

    const resetForm = () => {
        setCourseName('');
        setTopicName('');
        setSelectedCourseCategory('');
        setUseCustomCourseId(false);
        setQuestions([emptyQuestion()]);
        setEditingQuizId(null);
    };

    const handleCreateNew = (presetCourseCategory) => {
        resetForm();
        if (presetCourseCategory) {
            setSelectedCourseCategory(presetCourseCategory);
            setView('pickCourse');
        } else {
            setView('pickCourse');
        }
    };

    const handleEditQuiz = (quiz) => {
        setCourseName(quiz.courseId);
        setTopicName(quiz.topicId);
        const ownerCourse = Object.entries(COURSE_MODULES_MAP).find(([, mods]) => mods.includes(quiz.courseId));
        if (ownerCourse) {
            setSelectedCourseCategory(ownerCourse[0]);
            setUseCustomCourseId(false);
        } else {
            setUseCustomCourseId(true);
        }
        setQuestions(quiz.questions?.length ? quiz.questions : [emptyQuestion()]);
        setEditingQuizId(quiz.id);
        setView('editor');
    };

    const handleDeleteQuiz = async (id, e) => {
        e?.stopPropagation();
        if (!window.confirm("Delete this quiz permanently? This can't be undone.")) return;
        try {
            await deleteDoc(doc(db, 'custom_quizzes', id));
            toast.success("Quiz deleted");
            if (editingQuizId === id) { resetForm(); setView('list'); }
        } catch (e) {
            toast.error("Failed to delete quiz");
        }
    };

    const handleDuplicateQuiz = async (quiz, e) => {
        e?.stopPropagation();
        try {
            await addDoc(collection(db, 'custom_quizzes'), {
                courseId: quiz.courseId,
                topicId: `${quiz.topicId} (Copy)`,
                questions: quiz.questions,
                createdAt: serverTimestamp(),
                createdBy: 'Admin'
            });
            toast.success("Quiz duplicated");
        } catch (e) {
            toast.error("Failed to duplicate quiz");
        }
    };

    const handleAddQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);

    const handleRemoveQuestion = (index) => {
        if (questions.length === 1) return toast.error("A quiz needs at least one question.");
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleMoveQuestion = (index, direction) => {
        setQuestions(prev => {
            const next = [...prev];
            const target = direction === 'up' ? index - 1 : index + 1;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const handleDuplicateSingleQuestion = (index) => {
        setQuestions(prev => {
            const next = [...prev];
            const copy = { ...next[index], options: [...next[index].options] };
            next.splice(index + 1, 0, copy);
            return next;
        });
        toast.success("Question duplicated");
    };

    const handleQuestionChange = (index, field, value) => {
        setQuestions(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        setQuestions(prev => {
            const next = [...prev];
            const opts = [...next[qIndex].options];
            opts[optIndex] = value;
            next[qIndex] = { ...next[qIndex], options: opts };
            return next;
        });
    };

    const handleSaveQuiz = async () => {
        if (!courseName.trim() || !topicName.trim()) {
            return toast.error("Pick a course/module and give this quiz a topic name.");
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) return toast.error(`Question ${i + 1} is empty.`);
            if (q.options.some(opt => !opt.trim())) return toast.error(`Question ${i + 1} has an empty option.`);
            if (!q.explanation.trim()) return toast.error(`Question ${i + 1} needs an explanation.`);
        }

        setIsSaving(true);
        try {
            if (editingQuizId) {
                await updateDoc(doc(db, 'custom_quizzes', editingQuizId), {
                    courseId: courseName.trim(),
                    topicId: topicName.trim(),
                    questions,
                    updatedAt: serverTimestamp()
                });
                toast.success("Quiz updated");
            } else {
                await addDoc(collection(db, 'custom_quizzes'), {
                    courseId: courseName.trim(),
                    topicId: topicName.trim(),
                    questions,
                    createdAt: serverTimestamp(),
                    createdBy: 'Admin'
                });
                toast.success("Quiz published");
            }
            resetForm();
            setView('list');
        } catch (error) {
            console.error("Error saving quiz:", error);
            toast.error("Failed to save quiz");
        } finally {
            setIsSaving(false);
        }
    };

    const totalQuizCount = existingQuizzes.length;
    const canProceedToEditor = courseName.trim().length > 0;

    return (
        <div className="min-h-screen bg-[#F7F8FC] pb-24 font-inter">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 text-white/10 pointer-events-none">
                    <Sparkles size={220} />
                </div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <button
                        onClick={() => (view === 'list' ? navigate('/admin/dashboard') : (setView('list'), resetForm()))}
                        className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6 font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> {view === 'list' ? 'Dashboard' : 'Back to quizzes'}
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tighter">Quiz Builder</h1>
                            <p className="text-blue-100 font-bold max-w-xl">
                                {view === 'list' && `${totalQuizCount} quiz${totalQuizCount === 1 ? '' : 'es'} across ${groupedQuizzes.length} course${groupedQuizzes.length === 1 ? '' : 's'}`}
                                {view === 'pickCourse' && 'Step 1 of 2 — pick the course this quiz belongs to'}
                                {view === 'editor' && 'Step 2 of 2 — add your questions'}
                            </p>
                        </div>
                        {view === 'list' && (
                            <button
                                onClick={() => handleCreateNew()}
                                className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl"
                            >
                                <Plus size={20} /> New Quiz
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">

                {/* ---------- LIST VIEW (grouped by course) ---------- */}
                {view === 'list' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3">
                            <Search size={18} className="text-slate-400 ml-2 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by course or topic…"
                                value={listSearch}
                                onChange={(e) => setListSearch(e.target.value)}
                                className="w-full py-2 outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
                            />
                        </div>

                        {quizzesLoading ? (
                            <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100">
                                <p className="text-slate-400 font-bold">Loading quizzes…</p>
                            </div>
                        ) : groupedQuizzes.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                                <ListChecks size={40} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-bold text-lg mb-6">
                                    {listSearch ? 'No quizzes match your search.' : 'No quizzes yet — create your first one.'}
                                </p>
                                {!listSearch && (
                                    <button onClick={() => handleCreateNew()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs">
                                        Create a Quiz
                                    </button>
                                )}
                            </div>
                        ) : (
                            groupedQuizzes.map(([course, quizzes]) => {
                                const isOpen = expandedCourse === course || groupedQuizzes.length === 1;
                                return (
                                    <div key={course} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                        <button
                                            onClick={() => setExpandedCourse(isOpen ? null : course)}
                                            className="w-full flex items-center justify-between px-6 md:px-8 py-6 hover:bg-slate-50/70 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{course}</h3>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{quizzes.length} quiz{quizzes.length === 1 ? '' : 'zes'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {course !== 'Other / Custom' && (
                                                    <span
                                                        onClick={(e) => { e.stopPropagation(); handleCreateNew(course); }}
                                                        className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Plus size={14} /> Add here
                                                    </span>
                                                )}
                                                <ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 md:px-8 pb-8">
                                                        {quizzes.map(quiz => (
                                                            <div
                                                                key={quiz.id}
                                                                onClick={() => handleEditQuiz(quiz)}
                                                                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col"
                                                            >
                                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{moduleLabel(quiz.courseId)}</p>
                                                                <h4 className="font-black text-slate-900 mb-3 line-clamp-2">{quiz.topicId}</h4>
                                                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-200/70">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.questions?.length || 0} questions</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button onClick={(e) => { e.stopPropagation(); handleEditQuiz(quiz); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                                            <Edit3 size={15} />
                                                                        </button>
                                                                        <button onClick={(e) => handleDuplicateQuiz(quiz, e)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Duplicate">
                                                                            <Copy size={15} />
                                                                        </button>
                                                                        <button onClick={(e) => handleDeleteQuiz(quiz.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ---------- STEP 1: PICK COURSE (single screen, no nested dropdown maze) ---------- */}
                {view === 'pickCourse' && (
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                        {!useCustomCourseId ? (
                            <>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Choose a course</label>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {courseOptions.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => { setSelectedCourseCategory(c); setCourseName(''); }}
                                            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                                                selectedCourseCategory === c
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25'
                                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>

                                {selectedCourseCategory && (
                                    <>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                            2. Choose a module in {selectedCourseCategory}
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {(COURSE_MODULES_MAP[selectedCourseCategory] || []).map(id => (
                                                <button
                                                    key={id}
                                                    onClick={() => setCourseName(id)}
                                                    className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                                                        courseName === id
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-emerald-200'
                                                    }`}
                                                >
                                                    {moduleLabel(id)}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={() => { setUseCustomCourseId(true); setCourseName(''); setSelectedCourseCategory(''); }}
                                    className="text-[11px] font-black text-blue-600 uppercase tracking-wider hover:underline"
                                >
                                    My course isn't listed — type a custom name →
                                </button>
                            </>
                        ) : (
                            <>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Custom course / quiz name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g., Special Workshop Quiz"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all mb-3"
                                />
                                <p className="text-[11px] font-bold text-amber-600 mb-4">
                                    Note: a custom name only appears on the public Quiz Hub, not on a specific course's student dashboard.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setUseCustomCourseId(false); setCourseName(''); }}
                                    className="text-[11px] font-black text-blue-600 uppercase tracking-wider hover:underline"
                                >
                                    ← Pick from course list instead
                                </button>
                            </>
                        )}

                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Topic / Chapter Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Chapter 1: Fundamentals & MCQs"
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={() => canProceedToEditor && topicName.trim() ? setView('editor') : toast.error('Pick a course/module and give this quiz a topic name.')}
                            className="w-full mt-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Continue to Questions <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* ---------- STEP 2: QUESTIONS ---------- */}
                {view === 'editor' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Layers className="text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{moduleLabel(courseName)}</p>
                                    <h2 className="text-lg font-black text-slate-900">{topicName}</h2>
                                </div>
                            </div>
                            <button onClick={() => setView('pickCourse')} className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-1 shrink-0">
                                <Edit3 size={13} /> Change course/topic
                            </button>
                        </div>

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

                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            {qIndex > 0 && (
                                                <button onClick={() => handleMoveQuestion(qIndex, 'up')} className="text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition-all" title="Move Up">
                                                    <ArrowUp size={18} />
                                                </button>
                                            )}
                                            {qIndex < questions.length - 1 && (
                                                <button onClick={() => handleMoveQuestion(qIndex, 'down')} className="text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition-all" title="Move Down">
                                                    <ArrowDown size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDuplicateSingleQuestion(qIndex)} className="text-slate-400 hover:text-emerald-500 bg-slate-50 hover:bg-emerald-50 p-2 rounded-lg transition-all" title="Duplicate Question">
                                                <Copy size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveQuestion(qIndex)}
                                                className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-all ml-2 border-l border-slate-200 pl-4"
                                                title="Remove Question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-6 mt-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Question Text</label>
                                                <textarea
                                                    placeholder="Enter your question here..."
                                                    value={q.question}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                    className="w-full p-4 md:p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-base md:text-xl text-slate-900 font-hindi focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[80px] md:min-h-[100px] resize-none"
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
                                                            className={`w-full p-3 md:p-4 pl-12 md:pl-14 border-2 rounded-xl font-bold text-sm md:text-base font-hindi outline-none transition-all ${
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

                        <div className="flex flex-col md:flex-row items-center gap-4 pt-4 sticky bottom-4">
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
