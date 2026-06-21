import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Trophy, Star, ChevronLeft, ChevronRight, Zap, Target, Flame, Code2, Award, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';
import { CODER_AFROJ_PROBLEMS } from '../data/coderAfrojProblems';
import SEO from '../components/common/SEO';

const ITEMS_PER_PAGE = 20;

export default function CoderAfroj() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProblems = useMemo(() => {
        return CODER_AFROJ_PROBLEMS.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
            return matchesSearch && matchesDiff;
        });
    }, [searchTerm, filterDifficulty]);

    const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
    const paginatedProblems = filteredProblems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getDifficultyColor = (diff) => {
        switch(diff) {
            case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            <SEO title="CoderAfroj Arena | Master 1000+ Challenges" />
            
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Navbar / Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                            <Terminal size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight">CoderAfroj <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Arena</span></h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Code2 size={10} /> 1000+ Premium Challenges
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                            Exit Arena
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { title: "Total Problems", val: "1000+", icon: <Target className="text-blue-400" /> },
                        { title: "Languages", val: "C, C++, JS, Python", icon: <Code2 className="text-indigo-400" /> },
                        { title: "Global Rank", val: "Unranked", icon: <Trophy className="text-amber-400" /> },
                        { title: "Current Streak", val: "0 Days", icon: <Flame className="text-rose-400" /> }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{stat.title}</p>
                                <p className="text-lg font-black text-white">{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-full md:w-auto">
                        {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => { setFilterDifficulty(diff); setCurrentPage(1); }}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none",
                                    filterDifficulty === diff 
                                        ? "bg-white/10 text-white shadow-sm" 
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search problems or tags (e.g. Array, dp)..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Problem List */}
                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/[0.02] text-xs font-black uppercase tracking-widest text-slate-500">
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-6 md:col-span-5">Title</div>
                        <div className="col-span-2 hidden md:block">Acceptance</div>
                        <div className="col-span-2">Difficulty</div>
                        <div className="col-span-3 md:col-span-2 text-right">Action</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        <AnimatePresence>
                            {paginatedProblems.map((p, idx) => (
                                <motion.div 
                                    key={p.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className="col-span-1 flex justify-center">
                                        <div className="w-5 h-5 rounded-full border-2 border-white/10 group-hover:border-white/30 transition-colors" />
                                    </div>
                                    <div className="col-span-6 md:col-span-5 flex flex-col gap-1">
                                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                                            {p.id}. {p.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {p.tags.slice(0,3).map(t => (
                                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 whitespace-nowrap">
                                                    {t}
                                                </span>
                                            ))}
                                            {p.tags.length > 3 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">+{p.tags.length - 3}</span>}
                                        </div>
                                    </div>
                                    <div className="col-span-2 hidden md:block text-sm font-medium text-slate-400">
                                        {p.acceptance}
                                    </div>
                                    <div className="col-span-2">
                                        <span className={cn("text-xs font-black px-2.5 py-1 rounded-full border", getDifficultyColor(p.difficulty))}>
                                            {p.difficulty}
                                        </span>
                                    </div>
                                    <div className="col-span-3 md:col-span-2 flex justify-end">
                                        <button 
                                            onClick={() => navigate(`/coderafroj/${p.id}`)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                                        >
                                            Solve
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {paginatedProblems.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            <Brain size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-bold">No problems found</p>
                            <p className="text-sm">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <strong className="text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong className="text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProblems.length)}</strong> of <strong className="text-white">{filteredProblems.length}</strong> problems
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
