import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Trophy, Flame, Code2, Terminal, ChevronLeft, ChevronRight, Activity, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { CODER_AFROJ_PROBLEMS } from '../data/coderAfrojProblems';
import SEO from '../components/common/SEO';

// --- Low-Level Hook: Debounce ---
// Prevents UI blocking during rapid typing when filtering 1000+ items
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const ITEMS_PER_PAGE = 20;

export default function CoderAfroj() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const listRef = useRef(null);

    // --- High-Performance Filtering ---
    const filteredProblems = useMemo(() => {
        return CODER_AFROJ_PROBLEMS.filter(p => {
            const term = debouncedSearchTerm.toLowerCase().trim();
            const matchesSearch = term === '' || 
                                  p.title.toLowerCase().includes(term) || 
                                  p.tags.some(t => t.toLowerCase().includes(term)) ||
                                  p.id.toString() === term;
            const matchesDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
            return matchesSearch && matchesDiff;
        });
    }, [debouncedSearchTerm, filterDifficulty]);

    const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
    const paginatedProblems = useMemo(() => {
        return filteredProblems.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );
    }, [filteredProblems, currentPage]);

    // Scroll to top of list when page changes
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        if (listRef.current) {
            const topOffset = listRef.current.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
    };

    const getDifficultyColor = (diff) => {
        switch(diff) {
            case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]';
            case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 font-inter selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
            <SEO 
                title="CoderAfroj Arena | Master 1000+ Challenges" 
                description="Practice 1000+ coding challenges on CoderAfroj Arena. Prepare for top tech interviews with problems in JavaScript, Python, C++, Java, and more."
                schema={{
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "CoderAfroj Arena",
                    "description": "Practice 1000+ coding challenges on CoderAfroj Arena.",
                    "publisher": {
                        "@type": "Organization",
                        "name": "ByteCore Computer Centre"
                    }
                }}
            />
            
            {/* Cyberpunk Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-900/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay"></div>
            </div>

            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-4 shadow-2xl shadow-black/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-full h-full bg-[#050505] rounded-2xl flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                                <Terminal size={24} className="text-white group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter">
                                CoderAfroj <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Arena</span>
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                <Activity size={12} className="text-emerald-400 animate-pulse" />
                                <span>System Online • {CODER_AFROJ_PROBLEMS.length} Active Nodes</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <button onClick={() => navigate('/')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                            <ChevronLeft size={16} /> Disconnect
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
                
                {/* Hero Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12">
                    {[
                        { title: "Total Enigmas", val: CODER_AFROJ_PROBLEMS.length, icon: <Brain className="text-indigo-400 w-6 h-6" /> },
                        { title: "Compilers", val: "C, C++, JS, PY", icon: <Code2 className="text-cyan-400 w-6 h-6" /> },
                        { title: "Global Rank", val: "Unranked", icon: <Trophy className="text-amber-400 w-6 h-6" /> },
                        { title: "Data Stream", val: "Optimized", icon: <Flame className="text-rose-400 w-6 h-6" /> }
                    ].map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-4 md:p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                        >
                            <div className="p-3 md:p-4 bg-black/50 rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{stat.title}</p>
                                <p className="text-lg md:text-2xl font-black text-white tracking-tight">{stat.val}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Advanced Command Center (Search & Filters) */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-4 md:p-6 mb-8 backdrop-blur-xl sticky top-[80px] z-40 shadow-2xl shadow-black/50">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4 md:gap-6">
                        
                        {/* Search Engine */}
                        <div className="relative w-full lg:w-[400px] group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                                <Search className="absolute left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Query by ID, Title, or Topic (e.g. DP, Graph)..." 
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-transparent py-4 pl-12 pr-12 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                        className="absolute right-4 p-1 bg-white/10 hover:bg-white/20 rounded-full text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Difficulty Matrix */}
                        <div className="flex gap-2 p-1.5 bg-[#0a0a0a] border border-white/10 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
                            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                                <button
                                    key={diff}
                                    onClick={() => { setFilterDifficulty(diff); setCurrentPage(1); }}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 lg:flex-none",
                                        filterDifficulty === diff 
                                            ? diff === 'All' ? "bg-white text-black" : getDifficultyColor(diff).replace('text-', 'bg-').replace('bg-', 'text-') + " font-bold shadow-lg"
                                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                    )}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Matrix */}
                <div ref={listRef} className="scroll-mt-32">
                    {/* Desktop View: Advanced Data Grid */}
                    <div className="hidden md:block bg-[#0a0a0a]/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <div className="col-span-1 text-center">ID</div>
                            <div className="col-span-5">Nomenclature & Tags</div>
                            <div className="col-span-2">Acceptance Rate</div>
                            <div className="col-span-2">Complexity</div>
                            <div className="col-span-2 text-right">Execution</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {paginatedProblems.map((p, idx) => (
                                    <motion.div 
                                        layout
                                        key={p.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                                        className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/[0.03] transition-colors group"
                                    >
                                        <div className="col-span-1 flex justify-center text-slate-600 font-mono text-sm group-hover:text-indigo-400 transition-colors">
                                            {String(p.id).padStart(4, '0')}
                                        </div>
                                        <div className="col-span-5 flex flex-col gap-2">
                                            <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                                                {p.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {p.tags.slice(0, 4).map(t => (
                                                    <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 whitespace-nowrap">
                                                        {t}
                                                    </span>
                                                ))}
                                                {p.tags.length > 4 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">+{p.tags.length - 4}</span>}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" 
                                                        style={{ width: p.acceptance }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono font-bold text-slate-400">{p.acceptance}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border backdrop-blur-sm", getDifficultyColor(p.difficulty))}>
                                                {p.difficulty}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <button 
                                                onClick={() => navigate(`/coderafroj/${p.id}`)}
                                                className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-white/20 active:scale-95 flex items-center gap-2"
                                            >
                                                Deploy <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile View: Premium Cards */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {paginatedProblems.map((p, idx) => (
                                <motion.div 
                                    layout
                                    key={p.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-[#0a0a0a]/80 border border-white/5 rounded-3xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 blur-[50px] pointer-events-none" />
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-black text-slate-500 bg-white/5 px-2 py-1 rounded-lg">#{p.id}</span>
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border", getDifficultyColor(p.difficulty))}>
                                                {p.difficulty}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                            {p.acceptance} Acc
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-white mb-3 leading-tight">{p.title}</h3>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                        {p.tags.slice(0, 5).map(t => (
                                            <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/5">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <button 
                                        onClick={() => navigate(`/coderafroj/${p.id}`)}
                                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        Deploy Solution <ChevronRight size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {paginatedProblems.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/[0.02] border border-white/[0.05] rounded-[3rem] p-12 text-center text-slate-500 backdrop-blur-sm max-w-2xl mx-auto mt-8 shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                                <Terminal size={40} className="text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">No Matching Data Found</h2>
                            <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                                Our scanners couldn't locate any problems matching your current query parameters. Try reducing constraints.
                            </p>
                            <button 
                                onClick={() => { setSearchTerm(''); setFilterDifficulty('All'); }}
                                className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Pagination Subsystem */}
                {totalPages > 1 && (
                    <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] border border-white/[0.05] p-4 md:p-6 rounded-[2rem] backdrop-blur-sm">
                        <div className="text-xs md:text-sm text-slate-500 font-medium font-mono">
                            Displaying <strong className="text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong className="text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProblems.length)}</strong> of <strong className="text-white">{filteredProblems.length}</strong> modules
                        </div>
                        <div className="flex gap-2 bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/10">
                            <button 
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2.5 rounded-xl bg-transparent text-white disabled:opacity-30 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <div className="flex items-center px-4 font-mono font-bold text-indigo-400 text-sm">
                                {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                            </div>
                            <button 
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2.5 rounded-xl bg-transparent text-white disabled:opacity-30 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
