import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PlayCircle, Users, Trophy, ChevronRight, XCircle, CheckCircle2,
    Monitor, Target, Zap, Clock, ShieldCheck, Bot, Copy, PauseCircle
} from 'lucide-react';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import { db } from '../firebase/firestore';
import { doc, setDoc, updateDoc, collection, onSnapshot, deleteDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { initAudio, playCountdownBeep, playCountdownGo, playTick, playSuccess } from '../lib/soundEffects';

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
        // Fetch Custom Quizzes from Firestore
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

    const combinedQuizData = { ...HINDI_QUIZ_DATA };
    // Merge custom quizzes into combined
    Object.keys(customQuizzes).forEach(cId => {
        if (!combinedQuizData[cId]) {
            combinedQuizData[cId] = customQuizzes[cId];
        } else {
            // Merge topics if course already exists
            combinedQuizData[cId].modules = {
                ...combinedQuizData[cId].modules,
                ...customQuizzes[cId].modules
            };
        }
    });

    // Derived questions
    const questions = selectedCourse && combinedQuizData[selectedCourse]?.modules[selectedTopic] 
        ? combinedQuizData[selectedCourse].modules[selectedTopic] 
        : [];

    async function handleShowResult() {
        playSuccess();
        await updateDoc(doc(db, 'live_quizzes', roomId), { status: 'result' });
    }

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
                // Room deleted
                setQuizState('setup');
                setRoomId(null);
            }
        });

        const participantsRef = collection(db, `live_quizzes/${roomId}/participants`);
        const unsubParticipants = onSnapshot(participantsRef, (snapshot) => {
            const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by score descending
            parts.sort((a, b) => b.score - a.score);
            setParticipants(parts);
        });

        return () => {
            unsubscribe();
            unsubParticipants();
        };
    }, [roomId, quizState]);

    // Timer countdown
    useEffect(() => {
        if (quizState === 'active' && timer > 0 && !isPaused) {
            if (timer <= 10) playTick();
            const t = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(t);
        } else if (quizState === 'active' && timer === 0 && !isPaused) {
            // Auto move to result
            handleShowResult();
        }
    }, [quizState, timer, isPaused]);

    // Pre-question countdown
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

    // Automate bot answers
    useEffect(() => {
        if (quizState === 'active' && roomId && !isPaused) {
            const bots = participants.filter(p => p.isBot && (p.lastAnswer === null || p.lastAnswer === undefined));
            if (bots.length > 0) {
                const currentQ = questions[currentQuestionIndex];
                if (!currentQ) return;
                
                bots.forEach((bot) => {
                    const delay = 2000 + Math.random() * 15000; // Bots answer between 2 and 17 seconds
                    setTimeout(async () => {
                        // Simple 70% accuracy for bots
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
                            // Check if bot still hasn't answered (in case room status changed)
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
            // Global state for real-time banner on Student Portal
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
        initAudio(); // Initialize audio context on user interaction
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

    // Rendering
    if (quizState === 'setup') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-12 md:py-20 px-4 sm:px-6 flex items-center justify-center font-inter">
                <div className="max-w-xl w-full bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-blue-50">
                        <Monitor size={100} className="md:w-[120px] md:h-[120px]" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-600 text-white rounded-2xl"><Zap size={24} /></div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Host Live Quiz</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Course / App</label>
                                <select 
                                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                                    value={selectedCourse}
                                    onChange={(e) => {
                                        setSelectedCourse(e.target.value);
                                        setSelectedTopic('');
                                    }}
                                >
                                    <option value="">-- Choose Course --</option>
                                    {Object.entries(combinedQuizData).map(([key, data]) => (
                                        <option key={key} value={key}>{data.title || key}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {selectedCourse && combinedQuizData[selectedCourse]?.modules && (
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Quiz Topic</label>
                                    <select 
                                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                    >
                                        <option value="">-- Choose Topic --</option>
                                        {Object.keys(combinedQuizData[selectedCourse].modules).map(topic => (
                                            <option key={topic} value={topic}>{topic}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <button 
                                onClick={handleCreateRoom}
                                disabled={!selectedCourse || !selectedTopic}
                                className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate Room Code
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
            <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-4 md:p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 w-full max-w-4xl">
                    <h1 className="text-white text-xl md:text-3xl font-medium mb-4 uppercase tracking-widest opacity-80">Join at Student Portal</h1>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] mb-6 shadow-2xl relative">
                        <p className="text-blue-200 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4 text-xs md:text-base">Live Room PIN</p>
                        <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">{roomId}</h2>
                        
                        <div className="mt-6 md:mt-8 flex justify-center">
                            <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 hover:text-white rounded-full font-bold text-xs md:text-sm transition-colors border border-blue-400/30">
                                <Copy size={16} /> Copy Invite Link
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between bg-white/5 backdrop-blur-md px-6 py-4 md:px-8 md:py-6 rounded-[2rem] md:rounded-full border border-white/10 mb-8 gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Users className="text-blue-400" size={24} />
                            <span className="text-2xl md:text-3xl font-black text-white">{participants.length}</span>
                            <span className="text-blue-200 font-bold uppercase tracking-widest text-xs md:text-sm">Players Joined</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button onClick={handleAddBots} className="flex-1 sm:flex-none px-4 py-3 md:px-6 md:py-4 bg-indigo-600/50 text-indigo-100 rounded-xl md:rounded-full font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors border border-indigo-400/30 flex justify-center items-center gap-2 text-xs md:text-sm">
                                <Bot size={18} /> <span className="hidden sm:inline">Add Bots</span>
                            </button>
                            <button 
                                onClick={handleStartQuiz}
                                disabled={participants.length === 0}
                                className="flex-2 sm:flex-none px-6 py-3 md:px-8 md:py-4 bg-white text-indigo-900 rounded-xl md:rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 text-xs md:text-sm"
                            >
                                Start Game
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-h-[30vh] overflow-y-auto p-2 scrollbar-hide">
                        {participants.map(p => (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={p.id} 
                                className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-800/50 rounded-lg text-white font-bold text-xs md:text-base flex items-center gap-2 group cursor-pointer"
                                onClick={() => handleKickPlayer(p.id)}
                                title="Click to kick player"
                            >
                                {p.name}
                                <XCircle size={14} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Active, Result, Leaderboard Views
    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
            {/* Admin Header Bar */}
            <div className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0">
                <div className="flex items-center gap-2 md:gap-4">
                    <ShieldCheck className="text-emerald-500 hidden sm:block" />
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs md:text-sm">Host Panel</span>
                    <span className="px-2 py-1 md:px-3 md:py-1 bg-slate-100 text-slate-600 text-[10px] md:text-xs font-black rounded-full">PIN: {roomId}</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <span className="font-black text-slate-400 text-xs md:text-sm hidden sm:inline">Q {currentQuestionIndex + 1}/{totalQ}</span>
                    <button onClick={handleEndSession} className="px-3 py-1.5 md:px-4 md:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-widest transition-colors">
                        End Session
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-4 md:gap-8 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col relative min-h-[50vh]">

                    {quizState === 'countdown' && (
                        <div className="p-8 md:p-12 flex-1 flex flex-col items-center justify-center bg-indigo-600 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 tracking-widest uppercase text-indigo-200">Get Ready!</h2>
                            <motion.div 
                                key={countdownTimer}
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="text-8xl md:text-9xl font-black drop-shadow-2xl"
                            >
                                {countdownTimer > 0 ? countdownTimer : 'GO!'}
                            </motion.div>
                        </div>
                    )}
                    
                    {quizState === 'active' && (
                        <div className="p-6 md:p-12 flex-1 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                <div className="h-3 md:h-4 flex-1 bg-slate-100 rounded-full overflow-hidden mr-4 md:mr-8 relative">
                                    <motion.div 
                                        className={`h-full ${isPaused ? 'bg-amber-400' : 'bg-blue-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((timer)/30)*100}%` }}
                                        transition={isPaused ? { duration: 0 } : { duration: 1, ease: "linear" }}
                                    />
                                    {isPaused && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-900 uppercase">PAUSED</div>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={handleTogglePause} className={`p-2 rounded-full ${isPaused ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} hover:opacity-80 transition-opacity`} title={isPaused ? "Resume Timer" : "Pause Timer"}>
                                        {isPaused ? <PlayCircle size={24}/> : <PauseCircle size={24}/>}
                                    </button>
                                    <div className={`text-3xl md:text-4xl font-black ${isPaused ? 'text-amber-500' : 'text-blue-600'}`}>{timer}s</div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex items-center justify-center overflow-y-auto mb-6">
                                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 leading-tight font-hindi text-center">
                                    {currentQ?.question}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 shrink-0">
                                {currentQ?.options.map((opt, i) => {
                                    // Count how many answered this option
                                    const count = participants.filter(p => p.lastAnswer === i).length;
                                    return (
                                        <div key={i} className="p-4 md:p-8 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-[2rem] font-bold text-lg md:text-xl text-slate-700 text-center relative overflow-hidden flex items-center justify-center min-h-[60px] md:min-h-[100px]">
                                            <div className="relative z-10">{opt}</div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center mt-6 shrink-0">
                                <button onClick={handleShowResult} className="px-6 py-3 md:px-8 md:py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs md:text-sm hover:scale-105 transition-transform shadow-xl">
                                    Skip Timer (Show Answer)
                                </button>
                            </div>
                        </div>
                    )}

                    {quizState === 'result' && (
                        <div className="p-6 md:p-12 flex-1 flex flex-col text-center justify-center overflow-y-auto">
                            <h2 className="text-xl md:text-3xl font-black text-slate-500 mb-6 md:mb-12 uppercase tracking-widest">Correct Answer</h2>
                            <div className="p-6 md:p-10 bg-emerald-50 border-4 border-emerald-500 rounded-3xl md:rounded-[3rem] mb-8 md:mb-12 shadow-lg">
                                <CheckCircle2 className="text-emerald-500 mx-auto mb-2 md:mb-4 w-12 h-12 md:w-16 md:h-16" />
                                <h3 className="text-2xl md:text-4xl font-black text-emerald-900 font-hindi">{currentQ?.options[currentQ?.correctAnswer]}</h3>
                            </div>
                            
                            <p className="text-base md:text-xl font-medium text-slate-600 mb-8 md:mb-12 font-hindi max-w-3xl mx-auto">{currentQ?.explanation}</p>

                            <button onClick={handleShowLeaderboard} className="mt-auto mx-auto px-8 py-4 md:px-12 md:py-5 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-sm md:text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/20 shrink-0">
                                View Leaderboard
                            </button>
                        </div>
                    )}

                    {quizState === 'leaderboard' && (
                        <div className="p-6 md:p-12 flex-1 flex flex-col bg-slate-900 text-white overflow-y-auto">
                            <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 shrink-0">
                                <Trophy className="text-yellow-400 w-10 h-10 md:w-12 md:h-12" />
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-yellow-400 drop-shadow-lg">Leaderboard</h2>
                            </div>
                            
                            <div className="max-w-3xl mx-auto w-full space-y-3 md:space-y-4 flex-1">
                                <AnimatePresence>
                                    {participants.slice(0, 5).map((p, index) => (
                                        <motion.div 
                                            key={p.id}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10"
                                        >
                                            <div className="w-8 md:w-12 text-center text-lg md:text-2xl font-black text-slate-400">#{index + 1}</div>
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-lg md:text-xl mr-4 md:mr-6 shrink-0">
                                                {p.name[0]}
                                            </div>
                                            <div className="flex-1 text-lg md:text-2xl font-bold truncate pr-2">{p.name}</div>
                                            <div className="text-xl md:text-3xl font-black text-blue-400 shrink-0">{p.score}</div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {participants.length === 0 && <p className="text-center text-slate-500 mt-10">No participants yet</p>}
                            </div>

                            <div className="mt-8 shrink-0 flex justify-center">
                                <button onClick={handleNextQuestion} className="px-8 py-4 md:px-12 md:py-5 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-sm md:text-lg hover:scale-105 transition-transform shadow-2xl">
                                    {currentQuestionIndex >= totalQ - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight className="inline" />
                                </button>
                            </div>
                        </div>
                    )}

                    {quizState === 'finished' && (
                        <div className="p-6 md:p-12 flex-1 flex flex-col items-center justify-center bg-indigo-950 text-white text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            
                            <h2 className="text-4xl md:text-6xl font-black mb-2 md:mb-4 tracking-tighter relative z-10">Quiz Complete!</h2>
                            
                            {/* Podium */}
                            <div className="flex items-end justify-center gap-2 md:gap-4 mb-8 md:mb-12 h-48 md:h-64 mt-8 md:mt-12 relative z-10 w-full px-2">
                                {/* 2nd Place */}
                                {participants[1] && (
                                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center flex-1 max-w-[120px]">
                                        <div className="text-sm md:text-xl font-bold mb-1 md:mb-2 truncate w-full text-center">{participants[1].name}</div>
                                        <div className="text-xs md:text-sm text-blue-200 mb-1 md:mb-2">{participants[1].score} pts</div>
                                        <div className="w-full h-24 md:h-32 bg-slate-400 rounded-t-lg md:rounded-t-xl flex items-center justify-center text-2xl md:text-4xl font-black text-slate-100 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2)]">2</div>
                                    </motion.div>
                                )}
                                {/* 1st Place */}
                                {participants[0] && (
                                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center z-10 flex-1 max-w-[140px] md:max-w-[160px]">
                                        <Trophy className="text-yellow-400 mb-1 md:mb-2 drop-shadow-xl w-8 h-8 md:w-12 md:h-12" />
                                        <div className="text-lg md:text-2xl font-black mb-1 md:mb-2 text-yellow-400 truncate w-full text-center">{participants[0].name}</div>
                                        <div className="text-xs md:text-sm text-yellow-200 mb-1 md:mb-2 font-bold">{participants[0].score} pts</div>
                                        <div className="w-full h-32 md:h-48 bg-yellow-500 rounded-t-lg md:rounded-t-xl flex items-center justify-center text-4xl md:text-6xl font-black text-yellow-100 shadow-[0_0_40px_rgba(234,179,8,0.4),inset_0_-10px_20px_rgba(0,0,0,0.2)]">1</div>
                                    </motion.div>
                                )}
                                {/* 3rd Place */}
                                {participants[2] && (
                                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center flex-1 max-w-[120px]">
                                        <div className="text-sm md:text-xl font-bold mb-1 md:mb-2 truncate w-full text-center">{participants[2].name}</div>
                                        <div className="text-xs md:text-sm text-orange-200 mb-1 md:mb-2">{participants[2].score} pts</div>
                                        <div className="w-full h-16 md:h-24 bg-orange-700 rounded-t-lg md:rounded-t-xl flex items-center justify-center text-2xl md:text-4xl font-black text-orange-200 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2)]">3</div>
                                    </motion.div>
                                )}
                            </div>

                            <button onClick={handleEndSession} className="relative z-10 px-6 py-3 md:px-8 md:py-4 bg-white text-indigo-900 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform text-xs md:text-sm">
                                Close Room
                            </button>
                        </div>
                    )}

                </div>

                {/* Sidebar Stats */}
                <div className="lg:w-80 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col shrink-0">
                    <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">Live Status</h3>
                    
                    <div className="flex items-center justify-between mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-100">
                        <span className="font-bold text-slate-600 text-sm md:text-base">Total Players</span>
                        <span className="text-xl md:text-2xl font-black text-slate-900">{participants.length}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-100">
                        <span className="font-bold text-slate-600 text-sm md:text-base">Answers In</span>
                        <span className="text-xl md:text-2xl font-black text-blue-600">
                            {quizState === 'active' ? participants.filter(p => p.lastAnswer !== undefined && p.lastAnswer !== null).length : 0}
                        </span>
                    </div>

                    <div className="mt-auto pt-4">
                        <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl text-center ${isPaused ? 'bg-amber-50' : 'bg-slate-50'}`}>
                            {isPaused ? <PauseCircle className="text-amber-500 mx-auto mb-2 w-6 h-6 md:w-8 md:h-8" /> : <Zap className="text-amber-500 mx-auto mb-2 w-6 h-6 md:w-8 md:h-8" />}
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System</p>
                            <p className="font-bold text-slate-700 text-xs md:text-sm">{isPaused ? 'Quiz Paused' : 'Realtime Sync Active'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
