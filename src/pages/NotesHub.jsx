import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ArrowRight, FileText, Sparkles, X } from 'lucide-react';
import SEO from '../components/common/SEO';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import { cn } from '../lib/utils';

export default function NotesHub() {
    const navigate = useNavigate();
    const [selectedNote, setSelectedNote] = useState(null);

    // Extract all topics that have notes
    const allNotes = [];
    Object.keys(HINDI_QUIZ_DATA).forEach(courseId => {
        Object.keys(HINDI_QUIZ_DATA[courseId]).forEach(topicId => {
            const topic = HINDI_QUIZ_DATA[courseId][topicId];
            if (topic?.notes) {
                // Avoid duplicates
                if (!allNotes.find(n => n.topicId === topicId)) {
                    allNotes.push({
                        courseId,
                        topicId,
                        title: topic.title || topicId,
                        description: topic.description,
                        color: topic.color || 'blue',
                        content: topic.notes
                    });
                }
            }
        });
    });

    // Typography styling for injected HTML
    const typographyStyles = `
        .prose-notes h3 { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem; }
        .prose-notes ul { list-style-type: none; padding-left: 0; margin-bottom: 1.5rem; }
        .prose-notes li { margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative; color: #475569; line-height: 1.6; }
        .prose-notes li::before { content: '•'; position: absolute; left: 0; color: #3b82f6; font-weight: bold; font-size: 1.2rem; }
        .prose-notes strong { color: #0f172a; font-weight: 800; }
        .prose-notes p { margin-bottom: 1.5rem; color: #475569; line-height: 1.8; }
        .prose-notes table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        .prose-notes th, .prose-notes td { border: 1px solid #e2e8f0; padding: 1rem; text-align: left; }
        .prose-notes th { background-color: #f8fafc; font-weight: bold; color: #1e293b; }
    `;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-safe">
            <style>{typographyStyles}</style>
            <SEO title="Study Materials & Notes | ByteCore" description="Access free premium study materials and notes for all IT courses." />
            
            {/* Main Listing View */}
            <div className={cn("transition-all duration-500", selectedNote ? "opacity-0 pointer-events-none scale-95 fixed inset-0" : "opacity-100 scale-100")}>
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 pt-safe-top pt-20">
                    <div className="px-4 md:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex flex-col">
                            <span className="text-blue-600 font-black uppercase tracking-widest text-[10px] md:text-xs mb-1 flex items-center gap-1.5">
                                <Sparkles size={14}/> Open Library
                            </span>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Study Materials</h1>
                        </div>
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            Quizzes <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    {allNotes.length === 0 ? (
                        <div className="text-center py-20">
                            <FileText size={64} className="mx-auto text-slate-300 mb-6" />
                            <h2 className="text-2xl font-black text-slate-700">No notes available yet.</h2>
                            <p className="text-slate-500 mt-2">Check back later for high-quality study materials.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {allNotes.map((note, idx) => (
                                <motion.div
                                    key={`${note.courseId}-${note.topicId}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedNote(note)}
                                    className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 cursor-pointer group hover:border-blue-300 transition-all active:scale-[0.98]"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-${note.color}-50 text-${note.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                                            {note.courseId}
                                        </span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight">
                                        {note.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2 mb-6">
                                        {note.description}
                                    </p>
                                    <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Read Notes</span>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reading View (Full Screen Overlay) */}
            <AnimatePresence>
                {selectedNote && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden"
                    >
                        {/* Reader Header */}
                        <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between pt-safe-top sticky top-0 z-10 shadow-sm">
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <span className="font-black text-sm uppercase tracking-widest text-slate-400 truncate max-w-[200px] text-center">
                                {selectedNote.courseId}
                            </span>
                            <div className="w-10" /> {/* Spacer for centering */}
                        </div>

                        {/* Reader Content */}
                        <div className="flex-1 overflow-y-auto pb-safe">
                            <div className="max-w-3xl mx-auto px-6 py-10 md:py-16">
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
                                    {selectedNote.title}
                                </h1>
                                <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 pb-8 border-b border-slate-100">
                                    {selectedNote.description}
                                </p>
                                
                                <div 
                                    className="prose-notes font-hindi"
                                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                                />
                                
                                <div className="mt-20 pt-10 border-t border-slate-100 text-center">
                                    <h3 className="text-xl font-black text-slate-900 mb-4">Ready to test your knowledge?</h3>
                                    <button
                                        onClick={() => {
                                            navigate(`/quiz/${encodeURIComponent(selectedNote.courseId)}/${encodeURIComponent(selectedNote.topicId)}`);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                    >
                                        Start Quiz
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
