import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Play, CheckCircle2, XCircle, Terminal as TerminalIcon, ChevronLeft, Settings, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { CODER_AFROJ_PROBLEMS } from '../data/coderAfrojProblems';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';

// Language Map for Piston API
const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    python: "3.10.0",
    c: "10.2.0",
    cpp: "10.2.0"
};

const EDITOR_LANGUAGES = {
    javascript: "javascript",
    python: "python",
    c: "c",
    cpp: "cpp"
};

export default function Workspace() {
    const { problemId } = useParams();
    const navigate = useNavigate();
    
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState(null); // { status: 'loading' | 'success' | 'error', text: string }
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        const p = CODER_AFROJ_PROBLEMS.find(x => x.id === problemId);
        if (p) {
            setProblem(p);
            setCode(p.starterCode[language] || "");
        } else {
            navigate('/coderafroj');
        }
    }, [problemId, navigate]);

    // Handle language change
    useEffect(() => {
        if (problem) {
            setCode(problem.starterCode[language] || "");
        }
    }, [language, problem]);

    const runCode = async () => {
        if (!code.trim()) return;
        
        setIsRunning(true);
        setOutput({ status: 'loading', text: 'Executing code...' });

        try {
            // Free public Piston API for code execution
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: language === 'cpp' ? 'c++' : language,
                    version: LANGUAGE_VERSIONS[language],
                    files: [{ content: code }]
                })
            });

            const data = await response.json();
            
            if (data.run && data.run.code === 0) {
                setOutput({ status: 'success', text: data.run.stdout || "Program finished with no output." });
                toast.success('Execution Successful!', { id: 'run' });
            } else {
                const errorText = data.run ? (data.run.stderr || data.run.stdout) : data.message;
                setOutput({ status: 'error', text: errorText || "Compilation Error" });
                toast.error('Execution Failed!', { id: 'run' });
            }
        } catch (error) {
            setOutput({ status: 'error', text: error.message || "Network error. Execution engine might be down." });
            toast.error('Network Error!', { id: 'run' });
        } finally {
            setIsRunning(false);
        }
    };

    if (!problem) return null;

    const getDifficultyColor = (diff) => {
        switch(diff) {
            case 'Easy': return 'text-emerald-400 bg-emerald-400/10';
            case 'Medium': return 'text-amber-400 bg-amber-400/10';
            case 'Hard': return 'text-rose-400 bg-rose-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    return (
        <div className="h-screen w-full bg-[#0a0a0a] text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
            <SEO title={`${problem.id}. ${problem.title} | CoderAfroj`} />

            {/* Header */}
            <header className="h-14 bg-[#111111] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/coderafroj')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold">
                        <ChevronLeft size={16} /> Problem List
                    </button>
                    <div className="w-px h-4 bg-white/10"></div>
                    <span className="text-sm font-black text-white flex items-center gap-2">
                        {problem.id}. {problem.title}
                        <span className={cn("px-2 py-0.5 rounded text-[10px] tracking-widest uppercase", getDifficultyColor(problem.difficulty))}>
                            {problem.difficulty}
                        </span>
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                        {['javascript', 'python', 'c', 'cpp'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-bold transition-all capitalize",
                                    language === lang ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {lang === 'cpp' ? 'C++' : lang}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setCode(problem.starterCode[language])}
                        className="p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors"
                        title="Reset Code"
                    >
                        <RefreshCw size={16} />
                    </button>

                    <button 
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-600/20"
                    >
                        {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        Run Code
                    </button>
                </div>
            </header>

            {/* Resizable Layout */}
            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* Left Panel: Description */}
                    <Panel defaultSize={40} minSize={25} className="bg-[#0f0f0f] flex flex-col">
                        <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 shrink-0">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <TerminalIcon size={14} /> Description
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                            <h1 className="text-2xl font-black text-white mb-4">{problem.title}</h1>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {problem.tags.map(t => (
                                    <span key={t} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <div 
                                className="prose prose-invert max-w-none prose-p:text-slate-300 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:text-slate-300 prose-code:text-indigo-300"
                                dangerouslySetInnerHTML={{ __html: problem.description }}
                            />
                        </div>
                    </Panel>

                    {/* Draggable Handle */}
                    <PanelResizeHandle className="w-1.5 bg-[#0a0a0a] hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500 relative z-10">
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-white/20 rounded-full" />
                    </PanelResizeHandle>

                    {/* Right Panel: Editor & Terminal */}
                    <Panel defaultSize={60} minSize={30}>
                        <PanelGroup direction="vertical">
                            {/* Editor Panel */}
                            <Panel defaultSize={70} minSize={20} className="bg-[#1e1e1e] flex flex-col">
                                <div className="h-10 bg-[#111111] border-b border-white/5 flex items-center px-4 shrink-0 justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Code2 size={14} /> Editor
                                    </span>
                                    <Settings size={14} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 relative">
                                    <Editor
                                        height="100%"
                                        language={EDITOR_LANGUAGES[language]}
                                        theme="vs-dark"
                                        value={code}
                                        onChange={(val) => setCode(val)}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                            fontLigatures: true,
                                            smoothScrolling: true,
                                            cursorBlinking: "smooth",
                                            padding: { top: 16 }
                                        }}
                                        loading={
                                            <div className="flex items-center justify-center h-full text-slate-500">
                                                <Loader2 className="animate-spin" />
                                            </div>
                                        }
                                    />
                                </div>
                            </Panel>

                            <PanelResizeHandle className="h-1.5 bg-[#0a0a0a] hover:bg-indigo-500/50 transition-colors cursor-row-resize active:bg-indigo-500 relative z-10">
                                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-0.5 w-8 bg-white/20 rounded-full" />
                            </PanelResizeHandle>

                            {/* Terminal Panel */}
                            <Panel defaultSize={30} minSize={10} className="bg-[#0a0a0a] flex flex-col border-t border-white/5">
                                <div className="h-10 bg-white/5 flex items-center px-4 shrink-0 justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            Test Results
                                        </span>
                                    </div>
                                    {output && output.status !== 'loading' && (
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1",
                                            output.status === 'success' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                        )}>
                                            {output.status === 'success' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                                            {output.status === 'success' ? 'Accepted' : 'Error'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                                    {!output ? (
                                        <div className="h-full flex items-center justify-center text-slate-600 italic">
                                            Run your code to see the output here...
                                        </div>
                                    ) : output.status === 'loading' ? (
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Loader2 size={16} className="animate-spin" />
                                            Compiling & Executing on remote server...
                                        </div>
                                    ) : (
                                        <pre className={cn(
                                            "whitespace-pre-wrap",
                                            output.status === 'error' ? "text-rose-400" : "text-slate-300"
                                        )}>
                                            {output.text}
                                        </pre>
                                    )}
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
