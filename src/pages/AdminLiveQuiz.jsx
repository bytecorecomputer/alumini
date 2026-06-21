import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PlayCircle, Users, Trophy, ChevronRight, XCircle, CheckCircle2,
    Monitor, Target, Zap, Clock, ShieldCheck, Bot, Copy, PauseCircle,
    Triangle, Square, Circle, Hexagon
} from 'lucide-react';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import { db } from '../firebase/firestore';
import { doc, setDoc, updateDoc, collection, onSnapshot, deleteDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { initAudio, playCountdownBeep, playCountdownGo, playTick, playSuccess } from '../lib/soundEffects';

const OPTION_COLORS = ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];
const OPTION_BORDER = ['border-rose-600', 'border-blue-600', 'border-amber-600', 'border-emerald-600'];
const OPTION_ICONS = [Triangle, Hexagon, Circle, Square];

export default function AdminLiveQuiz() {
    const navigate = useNavigate();
    const [quizState, setQuizState] = useState('setup'); // setup | waiting | active | result | leaderboard | finished
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    
    // Live Quiz Data
    const [liveData, setLiveData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timer, setTimer] = useState(0);
    const [countdownTimer, setCountdownTimer] = useState(3);
    
    // Custom Quizzes State
    const [customQuizzes, setCustomQuizzes] = useState({});

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'custom_quizzes'), (snap) => {
            const formatted = {};
            snap.forEach(docSnap => {
                const data = docSnap.data();
                const cId = data.courseId;
                if (!formatted[cId]) {
                    formatted[cId] = { title: cId + ' (Custom)', modules: {} };
                }
                formatted[cId].modules[data.topicId] = data.questions;
            });
            setCustomQuizzes(formatted);
        });
        return () => unsub();
    }, []);

    const combinedQuizData = useMemo(() => {
        const data = { ...HINDI_QUIZ_DATA };
        Object.keys(customQuizzes).forEach(cId => {
            if (!data[cId]) {
                data[cId] = customQuizzes[cId];
            } else {
                data[cId].modules = {
                    ...data[cId].modules,
                    ...customQuizzes[cId].modules
                };
            }
        });
        return data;
    }, [customQuizzes]);

    const questions = useMemo(() => {
        return selectedCourse && combinedQuizData[selectedCourse]?.modules[selectedTopic] 
            ? combinedQuizData[selectedCourse].modules[selectedTopic] 
            : [];
    }, [selectedCourse, selectedTopic, combinedQuizData]);

    const handleShowResult = useCallback(async () => {
        playSuccess();
        if (roomId) {
            await updateDoc(doc(db, 'live_quizzes', roomId), { status: 'result' });
        }
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;
        
        const roomRef = doc(db, 'live_quizzes', roomId);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.status === 'finished' && quizState !== 'finished') {
                    confetti({
                        particleCount: 200,
                        spread: 160,
                        origin: { y: 0.3 },
                        colors: ['#FBBF24', '#F87171', '#60A5FA', '#34D399']
                    });
                }
                setLiveData(data);
                setQuizState(data.status);
                setCurrentQuestionIndex(data.currentQuestionIndex || 0);
                setIsPaused(data.isPaused || false);
            } else {
                setQuizState('setup');
                setRoomId(null);
            }
        });

        const participantsRef = collection(db, `live_quizzes/${roomId}/participants`);
        const unsubParticipants = onSnapshot(participantsRef, (snapshot) => {
            const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            parts.sort((a, b) => b.score - a.score);
            setParticipants(parts);
        });

        return () => {
            unsubscribe();
            unsubParticipants();
        };
    }, [roomId, quizState]);

    useEffect(() => {
        if (quizState === 'active' && timer > 0 && !isPaused) {
            if (timer <= 10) playTick();
            const t = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(t);
        } else if (quizState === 'active' && timer === 0 && !isPaused) {
            handleShowResult();
        }
    }, [quizState, timer, isPaused, handleShowResult]);

    useEffect(() => {
        if (quizState === 'countdown') {
            if (countdownTimer > 0) {
                playCountdownBeep();
                const t = setTimeout(() => setCountdownTimer(prev => prev - 1), 1000);
                return () => clearTimeout(t);
            } else if (countdownTimer === 0) {
                playCountdownGo();
                updateDoc(doc(db, 'live_quizzes', roomId), {
                    status: 'active',
                    questionStartedAt: Date.now(),
                    isPaused: false
                });
            }
        } else {
             setTimeout(() => setCountdownTimer(3), 0);
        }
    }, [quizState, countdownTimer, roomId]);

    useEffect(() => {
        if (quizState === 'active' && roomId && !isPaused) {
            const bots = participants.filter(p => p.isBot && (p.lastAnswer === null || p.lastAnswer === undefined));
            if (bots.length > 0) {
                const currentQ = questions[currentQuestionIndex];
                if (!currentQ) return;
                
                bots.forEach((bot) => {
                    const delay = 2000 + Math.random() * 15000;
                    setTimeout(async () => {
                        const isCorrect = Math.random() < 0.7;
                        let randomAnswer;
                        if (isCorrect) {
                            randomAnswer = currentQ.correctAnswer;
                        } else {
                            let wrongAnswers = currentQ.options.map((_, i) => i).filter(i => i !== currentQ.correctAnswer);
                            randomAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
                        }
                        
                        const points = isCorrect ? Math.max(500, Math.round(1000 - (delay / 1000 / 30) * 500)) : 0;
                        
                        try {
                            await updateDoc(doc(db, `live_quizzes/${roomId}/participants/${bot.id}`), {
                                lastAnswer: randomAnswer,
                                score: increment(points),
                                lastPoints: points
                            });
                        } catch (e) {
                            // ignore errors if room closed
                        }
                    }, delay);
                });
            }
        }
    }, [quizState, currentQuestionIndex, participants, roomId, questions, isPaused]);

    const handleCreateRoom = async () => {
        if (!selectedCourse) return toast.error("Select a course module");
        if (!selectedTopic) return toast.error("Select a quiz topic");
        if (!questions || questions.length === 0) return toast.error("No questions available for this topic");
        
        const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
        try {
            await setDoc(doc(db, 'live_quizzes', newRoomId), {
                courseId: selectedCourse,
                topicId: selectedTopic,
                status: 'waiting',
                currentQuestionIndex: 0,
                createdAt: Date.now(),
                totalQuestions: questions.length,
                host: 'Admin',
                isPaused: false
            });
            await setDoc(doc(db, 'settings', 'live_quiz_state'), {
                activeRoomId: newRoomId,
                courseId: selectedCourse,
                topicId: selectedTopic,
                updatedAt: Date.now()
            });
            
            setRoomId(newRoomId);
            setQuizState('waiting');
            toast.success("Room created! Students can join now.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create live room");
        }
    };

    const handleAddBots = async () => {
        const bots = [
            { id: 'bot_' + Date.now() + '1', name: 'Bot Rahul' },
            { id: 'bot_' + Date.now() + '2', name: 'Bot Neha' },
            { id: 'bot_' + Date.now() + '3', name: 'Bot Amit' }
        ];
        for (let bot of bots) {
            await setDoc(doc(db, `live_quizzes/${roomId}/participants/${bot.id}`), {
                name: bot.name,
                score: 0,
                lastAnswer: null,
                joinedAt: Date.now(),
                isBot: true
            });
        }
        toast.success("3 Test Bots Joined!");
    };

    const handleKickPlayer = async (playerId) => {
        if(window.confirm("Kick this player?")) {
            await deleteDoc(doc(db, `live_quizzes/${roomId}/participants/${playerId}`));
            toast.success("Player kicked.");
        }
    };

    const handleStartQuiz = async () => {
        initAudio();
        await updateDoc(doc(db, 'live_quizzes', roomId), {
            status: 'countdown',
            currentQuestionIndex: 0,
            isPaused: false
        });
        setTimer(30);
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex >= questions.length - 1) {
            await updateDoc(doc(db, 'live_quizzes', roomId), { status: 'finished' });
            return;
        }
        await updateDoc(doc(db, 'live_quizzes', roomId), {
            status: 'countdown',
            currentQuestionIndex: currentQuestionIndex + 1,
            isPaused: false
        });
        setTimer(30);
    };

    const handleShowLeaderboard = async () => {
        await updateDoc(doc(db, 'live_quizzes', roomId), { status: 'leaderboard' });
    };

    const handleTogglePause = async () => {
        const newPauseState = !isPaused;
        setIsPaused(newPauseState);
        await updateDoc(doc(db, 'live_quizzes', roomId), { isPaused: newPauseState });
        toast(newPauseState ? "Quiz Paused" : "Quiz Resumed", { icon: newPauseState ? '⏸️' : '▶️' });
    };

    const handleEndSession = async () => {
        if (window.confirm("Are you sure you want to end and delete this live session?")) {
            await deleteDoc(doc(db, 'live_quizzes', roomId));
            await setDoc(doc(db, 'settings', 'live_quiz_state'), { activeRoomId: null });
            setRoomId(null);
            setQuizState('setup');
            setParticipants([]);
        }
    };

    if (quizState === 'setup') {
        return (
            <div className="min-h-screen bg-slate-900 py-12 md:py-20 px-4 sm:px-6 flex items-center justify-center font-inter relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

                <div className="max-w-xl w-full bg-white/10 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/20 relative z-10">
                    <div className="absolute top-8 right-8 text-white/10">
                        <Monitor size={80} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-indigo-500 text-white rounded-[1.5rem] shadow-lg shadow-indigo-500/30">
                                <Zap size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Host Dashboard</h2>
                                <p className="text-indigo-200 font-bold tracking-wide mt-1">Start a live multiplayer session</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-indigo-200 uppercase tracking-widest mb-2 ml-2">Select Course Module</label>
                                <select 
                                    className="w-full p-5 rounded-2xl bg-black/20 border-2 border-white/10 text-white font-bold outline-none focus:border-indigo-400 transition-colors appearance-none cursor-pointer"
                                    value={selectedCourse}
                                    onChange={(e) => {
                                        setSelectedCourse(e.target.value);
                                        setSelectedTopic('');
                                    }}
                                >
                                    <option value="" className="text-slate-800">-- Choose Course --</option>
                                    {Object.entries(combinedQuizData).map(([key, data]) => (
                                        <option key={key} value={key} className="text-slate-800">{data.title || key}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {selectedCourse && combinedQuizData[selectedCourse]?.modules && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="block text-xs font-black text-indigo-200 uppercase tracking-widest mb-2 ml-2">Select Quiz Topic</label>
                                    <select 
                                        className="w-full p-5 rounded-2xl bg-black/20 border-2 border-white/10 text-white font-bold outline-none focus:border-indigo-400 transition-colors appearance-none cursor-pointer"
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                    >
                                        <option value="" className="text-slate-800">-- Choose Topic --</option>
                                        {Object.keys(combinedQuizData[selectedCourse].modules).map(topic => (
                                            <option key={topic} value={topic} className="text-slate-800">{topic}</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}
                            
                            <button 
                                onClick={handleCreateRoom}
                                disabled={!selectedCourse || !selectedTopic}
                                className="w-full mt-8 py-5 bg-indigo-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-lg"
                            >
                                Generate Live Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (quizState === 'waiting') {
        const inviteLink = `${window.location.origin}/student-portal?tab=live&pin=${roomId}`;
        const handleCopyLink = () => {
            navigator.clipboard.writeText(inviteLink);
            toast.success("Invite Link Copied!");
        };

        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-inter">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                <div className="absolute top-0 w-full h-[50vh] bg-gradient-to-b from-indigo-600/30 to-transparent pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
                    
                    {/* Left: PIN DISPLAY */}
                    <div className="flex-1 w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-10 md:p-16 rounded-[3rem] shadow-2xl flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                        
                        <p className="text-indigo-300 font-black uppercase tracking-[0.4em] mb-6 text-lg md:text-xl">Join at Student Portal</p>
                        
                        <div className="bg-black/30 w-full py-8 md:py-12 rounded-[3rem] border-y border-white/10 mb-8 shadow-inner relative">
                            <p className="text-white/50 font-black uppercase tracking-[0.3em] mb-2 text-sm">Live Room PIN</p>
                            <h2 className="text-[6rem] md:text-[9rem] font-black text-white tracking-widest drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] leading-none">
                                {roomId}
                            </h2>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <button onClick={handleCopyLink} className="flex-1 flex justify-center items-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] font-bold text-sm md:text-base transition-colors border border-white/10 backdrop-blur-md">
                                <Copy size={20} /> Copy Direct Link
                            </button>
                            <button onClick={handleAddBots} className="flex-1 flex justify-center items-center gap-3 py-4 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 rounded-[1.5rem] font-bold text-sm md:text-base transition-colors border border-indigo-500/30 backdrop-blur-md">
                                <Bot size={20} /> Add Test Bots
                            </button>
                        </div>
                    </div>

                    {/* Right: PARTICIPANTS */}
                    <div className="w-full lg:w-[450px] flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] shadow-2xl h-[600px] lg:h-auto">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <Users size={28} />
                                </div>
                                <div className="text-left">
                                    <p className="text-emerald-400 font-black uppercase tracking-widest text-xs">Waiting in Lobby</p>
                                    <h3 className="text-4xl font-black text-white">{participants.length} <span className="text-xl text-white/50">Players</span></h3>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-wrap gap-3 content-start">
                            <AnimatePresence>
                                {participants.map(p => (
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        key={p.id} 
                                        className="px-4 py-3 bg-white/10 border border-white/10 hover:border-red-400/50 hover:bg-red-400/10 rounded-xl text-white font-bold text-sm flex items-center gap-2 group cursor-pointer transition-all"
                                        onClick={() => handleKickPlayer(p.id)}
                                        title="Click to kick player"
                                    >
                                        {p.name}
                                        <XCircle size={16} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity" />
                                    </motion.div>
                                ))}
                                {participants.length === 0 && (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                                        <Users size={48} className="mb-4 opacity-50" />
                                        <p className="font-bold uppercase tracking-widest text-sm text-center">Waiting for players...</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <button 
                                onClick={handleStartQuiz}
                                disabled={participants.length === 0}
                                className="w-full py-6 bg-emerald-500 text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-95"
                            >
                                Start Game
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col font-inter">
            {/* Top Presentation Bar */}
            <div className="h-20 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 shadow-sm shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500 w-8 h-8" />
                    <div>
                        <div className="font-black text-white uppercase tracking-widest text-sm leading-none mb-1">Host Screen</div>
                        <div className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">Live Quiz Active</div>
                    </div>
                </div>
                
                {quizState !== 'countdown' && (
                    <div className="px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white font-black tracking-[0.2em] flex items-center gap-3">
                        <span className="text-white/50 text-xs">JOIN PIN:</span>
                        <span className="text-xl">{roomId}</span>
                    </div>
                )}

                <div className="flex items-center gap-6">
                    {quizState === 'active' && (
                        <div className="text-white/50 font-black uppercase tracking-widest text-sm">
                            Question <span className="text-white">{currentQuestionIndex + 1}</span> / {totalQ}
                        </div>
                    )}
                    <button onClick={handleEndSession} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all border border-red-500/30">
                        End Session
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

                {quizState === 'countdown' && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-indigo-600/90 backdrop-blur-sm text-white">
                        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-[0.3em] uppercase text-indigo-200 drop-shadow-lg">Get Ready!</h2>
                        <motion.div 
                            key={countdownTimer}
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="text-[15rem] font-black drop-shadow-[0_0_60px_rgba(255,255,255,0.4)] leading-none text-yellow-300"
                        >
                            {countdownTimer > 0 ? countdownTimer : 'GO!'}
                        </motion.div>
                    </div>
                )}
                
                {quizState === 'active' && (
                    <div className="flex-1 flex flex-col p-8 relative z-10">
                        {/* Header Stats for projector */}
                        <div className="flex justify-between items-center mb-8 px-4">
                            <div className="flex items-center gap-6 bg-white/10 px-8 py-4 rounded-3xl border border-white/20 backdrop-blur-md">
                                <div className="text-center">
                                    <div className="text-white/50 font-black text-[10px] uppercase tracking-widest mb-1">Answers In</div>
                                    <div className="text-4xl font-black text-white leading-none">
                                        {participants.filter(p => p.lastAnswer !== undefined && p.lastAnswer !== null).length} <span className="text-xl text-white/30">/ {participants.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Massive Timer */}
                            <div className="flex items-center gap-4">
                                <button onClick={handleTogglePause} className={`w-16 h-16 rounded-full flex items-center justify-center ${isPaused ? 'bg-amber-500 text-white animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.5)]' : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'} transition-all`} title={isPaused ? "Resume Timer" : "Pause Timer"}>
                                    {isPaused ? <PlayCircle size={32}/> : <PauseCircle size={32}/>}
                                </button>
                                <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center text-5xl font-black bg-black/30 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.5)]
                                    ${isPaused ? 'border-amber-500 text-amber-500' : timer > 10 ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400 animate-pulse'}
                                `}>
                                    {timer}
                                </div>
                            </div>
                        </div>
                        
                        {/* Huge Question Display */}
                        <div className="flex-1 flex items-center justify-center px-10 mb-8 bg-white/5 backdrop-blur-sm rounded-[3rem] border border-white/10 shadow-inner">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight font-hindi text-center drop-shadow-xl w-full max-w-7xl">
                                {currentQ?.question}
                            </h2>
                        </div>

                        {/* Kahoot Style Options Grid */}
                        <div className="grid grid-cols-2 gap-6 h-[35vh] shrink-0">
                            {currentQ?.options.map((opt, i) => {
                                const Icon = OPTION_ICONS[i % OPTION_ICONS.length];
                                return (
                                    <div key={i} className={`rounded-[2rem] p-8 flex items-center justify-start gap-8 relative overflow-hidden shadow-2xl border-b-8 ${OPTION_BORDER[i % OPTION_BORDER.length]} ${OPTION_COLORS[i % OPTION_COLORS.length]}`}>
                                        <div className="absolute inset-0 bg-black/10"></div>
                                        <div className="w-24 h-24 bg-black/20 rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-inner backdrop-blur-md">
                                            <Icon size={50} className="text-white drop-shadow-md" strokeWidth={3} />
                                        </div>
                                        <div className="text-3xl md:text-5xl font-black text-white font-hindi relative z-10 drop-shadow-lg leading-tight">
                                            {opt}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="absolute bottom-8 right-8 z-20">
                            <button onClick={handleShowResult} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-black uppercase tracking-widest text-sm backdrop-blur-md border border-white/20 transition-colors shadow-xl">
                                Skip Timer
                            </button>
                        </div>
                    </div>
                )}

                {quizState === 'result' && (
                    <div className="flex-1 flex flex-col p-12 relative z-10 overflow-hidden">
                        <div className="absolute top-10 left-10 text-white/50 font-black uppercase tracking-widest text-2xl">Result</div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full text-center">
                            <h3 className="text-2xl font-black text-white/50 mb-8 uppercase tracking-[0.3em]">Correct Answer</h3>
                            
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full p-12 bg-emerald-500 rounded-[3rem] border-b-8 border-emerald-700 shadow-[0_0_100px_rgba(16,185,129,0.3)] mb-12 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-black/10"></div>
                                <CheckCircle2 className="text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96" />
                                <h3 className="text-5xl md:text-7xl font-black text-white font-hindi relative z-10 drop-shadow-2xl">
                                    {currentQ?.options[currentQ?.correctAnswer]}
                                </h3>
                            </motion.div>
                            
                            {currentQ?.explanation && (
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl w-full">
                                    <p className="text-xl md:text-2xl font-medium text-blue-100 font-hindi leading-relaxed">
                                        <span className="font-black uppercase tracking-widest text-sm text-blue-300 block mb-3">Explanation</span>
                                        {currentQ.explanation}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-12 right-12">
                            <button onClick={handleShowLeaderboard} className="px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black uppercase tracking-widest text-xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.5)] active:scale-95 flex items-center gap-3">
                                View Standings <ChevronRight size={28} />
                            </button>
                        </div>
                    </div>
                )}

                {quizState === 'leaderboard' && (
                    <div className="flex-1 flex flex-col p-12 relative z-10">
                        <div className="flex flex-col items-center justify-center mb-12">
                            <Trophy className="text-yellow-400 w-20 h-20 mb-4 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
                            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-[0.2em] text-white drop-shadow-xl">Top Players</h2>
                        </div>
                        
                        <div className="flex-1 max-w-4xl mx-auto w-full space-y-4">
                            <AnimatePresence>
                                {participants.slice(0, 5).map((p, index) => (
                                    <motion.div 
                                        key={p.id}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-lg"
                                    >
                                        <div className="w-16 text-center text-3xl font-black text-white/30">#{index + 1}</div>
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-black text-2xl text-white mr-6 shadow-inner border border-white/20">
                                            {p.name[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-3xl font-bold text-white truncate pr-4">{p.name}</div>
                                        <div className="text-4xl font-black text-yellow-400 shrink-0 drop-shadow-md">{p.score}</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {participants.length === 0 && <p className="text-center text-white/50 text-2xl mt-20 font-bold uppercase tracking-widest">No participants</p>}
                        </div>

                        <div className="absolute bottom-12 right-12">
                            <button onClick={handleNextQuestion} className="px-12 py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full font-black uppercase tracking-widest text-xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-95 flex items-center gap-3">
                                {currentQuestionIndex >= totalQ - 1 ? 'Finish Game' : 'Next Question'} <ChevronRight size={28} />
                            </button>
                        </div>
                    </div>
                )}

                {quizState === 'finished' && (
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 to-slate-900/50 pointer-events-none"></div>
                        
                        <h2 className="text-6xl md:text-8xl font-black mb-16 tracking-tighter text-white drop-shadow-2xl relative z-20">Final Podium</h2>
                        
                        {/* Podium */}
                        <div className="flex items-end justify-center gap-6 h-[400px] relative z-20 w-full max-w-5xl px-8">
                            {/* 2nd Place */}
                            {participants[1] && (
                                <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center flex-1 max-w-[250px]">
                                    <div className="w-20 h-20 bg-slate-300 rounded-full flex items-center justify-center font-black text-3xl text-slate-800 mb-4 shadow-[0_0_30px_rgba(203,213,225,0.5)] border-4 border-slate-100">{participants[1].name[0].toUpperCase()}</div>
                                    <div className="text-3xl font-black text-white mb-2 truncate w-full text-center drop-shadow-md">{participants[1].name}</div>
                                    <div className="text-xl font-bold text-slate-300 mb-4 tracking-widest">{participants[1].score} pts</div>
                                    <div className="w-full h-[200px] bg-gradient-to-b from-slate-400 to-slate-600 rounded-t-3xl flex items-start justify-center pt-8 text-6xl font-black text-white/50 border-t-4 border-slate-300 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">2</div>
                                </motion.div>
                            )}
                            
                            {/* 1st Place */}
                            {participants[0] && (
                                <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center z-10 flex-1 max-w-[300px]">
                                    <Trophy className="text-yellow-400 mb-4 drop-shadow-[0_0_50px_rgba(250,204,21,0.8)] w-24 h-24" />
                                    <div className="text-4xl font-black text-yellow-400 mb-2 truncate w-full text-center drop-shadow-lg">{participants[0].name}</div>
                                    <div className="text-2xl font-bold text-yellow-200 mb-4 tracking-widest">{participants[0].score} pts</div>
                                    <div className="w-full h-[300px] bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-3xl flex items-start justify-center pt-10 text-8xl font-black text-white/50 border-t-8 border-yellow-300 shadow-[0_-20px_60px_rgba(250,204,21,0.4)]">1</div>
                                </motion.div>
                            )}
                            
                            {/* 3rd Place */}
                            {participants[2] && (
                                <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center flex-1 max-w-[250px]">
                                    <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center font-black text-3xl text-orange-900 mb-4 shadow-[0_0_30px_rgba(251,146,60,0.5)] border-4 border-orange-200">{participants[2].name[0].toUpperCase()}</div>
                                    <div className="text-3xl font-black text-white mb-2 truncate w-full text-center drop-shadow-md">{participants[2].name}</div>
                                    <div className="text-xl font-bold text-orange-300 mb-4 tracking-widest">{participants[2].score} pts</div>
                                    <div className="w-full h-[150px] bg-gradient-to-b from-orange-600 to-orange-800 rounded-t-3xl flex items-start justify-center pt-6 text-6xl font-black text-white/50 border-t-4 border-orange-400 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">3</div>
                                </motion.div>
                            )}
                        </div>

                        <div className="absolute bottom-12 right-12 z-30">
                            <button onClick={handleEndSession} className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-full font-black uppercase tracking-widest text-lg backdrop-blur-md border border-white/20 transition-all shadow-xl">
                                Close Room
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
