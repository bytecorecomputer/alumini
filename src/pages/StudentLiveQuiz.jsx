import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Loader2, Zap, AlertCircle, RefreshCw, Triangle, Square, Circle, Hexagon } from 'lucide-react';
import { db } from '../firebase/firestore';
import { doc, setDoc, onSnapshot, updateDoc, increment, collection } from 'firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import confetti from 'canvas-confetti';
import { initAudio, playSuccess, playError } from '../lib/soundEffects';
import toast from 'react-hot-toast';

const OPTION_COLORS = ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];
const OPTION_HOVER = ['hover:bg-rose-600', 'hover:bg-blue-600', 'hover:bg-amber-600', 'hover:bg-emerald-600'];
const OPTION_BORDER = ['border-rose-600', 'border-blue-600', 'border-amber-600', 'border-emerald-600'];
const OPTION_ICONS = [Triangle, Hexagon, Circle, Square];

export default function StudentLiveQuiz() {
    const { student } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    
    // Live State
    const [liveData, setLiveData] = useState(null);
    const [myState, setMyState] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [timer, setTimer] = useState(30);

    // Timer Effect
    useEffect(() => {
        if (liveData?.status === 'active' && !liveData?.isPaused && liveData?.questionStartedAt) {
            const t = setInterval(() => {
                const elapsed = Math.floor((Date.now() - liveData.questionStartedAt) / 1000);
                setTimer(Math.max(0, 30 - elapsed));
            }, 1000);
            return () => clearInterval(t);
        }
    }, [liveData?.status, liveData?.isPaused, liveData?.questionStartedAt]);
    
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

    const joinRoom = useCallback(async (rId) => {
        try {
            const myRef = doc(db, `live_quizzes/${rId}/participants/${student.registration}`);
            await setDoc(myRef, {
                name: student.fullName || student.studentName || 'Student',
                joinedAt: Date.now()
            }, { merge: true });
            
            setJoined(true);
            setIsReconnecting(false);
        } catch (err) {
            console.error(err);
            toast.error("Room not found or error joining. Please check the PIN.");
            setIsReconnecting(false);
        }
    }, [student]);

    // Auto-join logic
    useEffect(() => {
        const pin = searchParams.get('pin');
        if (pin && !joined && student) {
            setTimeout(() => {
                setRoomId(pin);
                setIsReconnecting(true);
                initAudio();
                joinRoom(pin);
            }, 800);
        }
    }, [searchParams, student, joined, joinRoom]);

    // Join via manual input
    const handleJoin = async (e) => {
        e?.preventDefault();
        if (!roomId || !student) return;
        setIsReconnecting(true);
        initAudio();
        joinRoom(roomId);
    };

    // Listen to Room (SYNC BUG FIXED: removed liveData from dependencies)
    useEffect(() => {
        if (!joined || !roomId || !student?.registration) return;
        
        const roomRef = doc(db, 'live_quizzes', roomId);
        let prevIndex = null;

        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // If moving to a new question, reset local answered state
                if (prevIndex !== null && data.currentQuestionIndex !== prevIndex) {
                    setHasAnswered(false);
                    // Clear lastAnswer in DB robustly
                    updateDoc(doc(db, `live_quizzes/${roomId}/participants/${student.registration}`), {
                        lastAnswer: null
                    }).catch(e => console.error("Error clearing answer:", e));
                }
                prevIndex = data.currentQuestionIndex;
                setLiveData(data);
            } else {
                // Room closed
                setJoined(false);
                setLiveData(null);
                toast.error("Room closed by Admin");
                navigate('/student-portal');
            }
        });

        // Listen to my own score
        const myRef = doc(db, `live_quizzes/${roomId}/participants/${student.registration}`);
        const unsubMe = onSnapshot(myRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setMyState(data);
                // Recovery logic: if we refresh the page mid-question, check if we already answered
                if (data.lastAnswer !== null && data.lastAnswer !== undefined) {
                    setHasAnswered(true);
                }
            } else {
                setJoined(false);
                toast.error("You have been removed from the session.");
                navigate('/student-portal');
            }
        });

        // Listen to all participants for leaderboard
        const participantsRef = collection(db, `live_quizzes/${roomId}/participants`);
        const unsubParticipants = onSnapshot(participantsRef, (snapshot) => {
            const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            parts.sort((a, b) => b.score - a.score);
            setParticipants(parts);
        });

        return () => {
            unsubscribe();
            unsubMe();
            unsubParticipants();
        };
    }, [joined, roomId, student?.registration, navigate]);

    // Audio effects for results
    useEffect(() => {
        if (liveData?.status === 'result' && myState) {
            const courseData = combinedQuizData[liveData.courseId];
            const currentQ = courseData?.modules[liveData.topicId]?.[liveData.currentQuestionIndex];
            const hasAns = myState?.lastAnswer !== null && myState?.lastAnswer !== undefined;
            const isCorrect = hasAns && currentQ?.correctAnswer === myState.lastAnswer;
            
            if (isCorrect) {
                playSuccess();
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            } else {
                playError();
            }
        }
    }, [liveData?.status, liveData?.currentQuestionIndex, liveData?.courseId, liveData?.topicId, myState, combinedQuizData]);

    const handleAnswer = async (index) => {
        if (hasAnswered || !liveData || liveData.isPaused) return;
        
        // Optimistic UI update
        setHasAnswered(true);
        setMyState(prev => ({ ...prev, lastAnswer: index }));

        const courseData = combinedQuizData[liveData.courseId];
        const qList = courseData?.modules[liveData.topicId];
        const currentQ = qList[liveData.currentQuestionIndex];
        
        const isCorrect = currentQ.correctAnswer === index;
        
        // Calculate Speed Score
        let points = 0;
        if (isCorrect) {
            const now = new Date().getTime();
            const timeElapsed = now - (liveData.questionStartedAt || now);
            const secondsElapsed = timeElapsed / 1000;
            points = Math.max(500, Math.round(1000 - (secondsElapsed / 30) * 500));
        }
        
        try {
            const myRef = doc(db, `live_quizzes/${roomId}/participants/${student.registration}`);
            await updateDoc(myRef, {
                lastAnswer: index,
                score: increment(points),
                lastPoints: points
            });
        } catch (e) {
            console.error("Failed to submit answer:", e);
            toast.error("Failed to submit answer. Reconnecting...");
            setHasAnswered(false); // Revert on failure
            setMyState(prev => ({ ...prev, lastAnswer: null }));
        }
    };

    if (!student) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="font-bold tracking-widest uppercase text-indigo-200">Loading Auth...</p>
            </div>
        );
    }

    if (!joined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex flex-col items-center justify-center p-4 md:p-6 font-inter relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                
                {/* Floating animated shapes */}
                <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-20 left-10 opacity-20"><Triangle size={100} className="text-white" /></motion.div>
                <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-20 right-10 opacity-20"><Circle size={120} className="text-white" /></motion.div>
                
                <motion.div 
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl border border-white/20"
                >
                    <div className="w-20 h-20 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner backdrop-blur-md">
                        <Zap size={40} className="drop-shadow-lg" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-md">Live Quiz</h1>
                    <p className="text-indigo-200 font-bold mb-8 text-sm md:text-base tracking-wide">Enter the game PIN to join</p>
                    
                    <form onSubmit={handleJoin} className="space-y-5">
                        <input 
                            type="text" 
                            placeholder="Game PIN" 
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full text-center text-4xl md:text-5xl font-black tracking-[0.2em] p-5 bg-white/90 text-slate-900 border-4 border-transparent rounded-2xl outline-none focus:border-indigo-400 transition-all uppercase placeholder:text-slate-300 shadow-inner"
                            maxLength={6}
                            disabled={isReconnecting}
                        />
                        <button 
                            type="submit" 
                            disabled={!roomId || roomId.length < 5 || isReconnecting}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-lg md:text-xl disabled:opacity-50 hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-3 shadow-xl"
                        >
                            {isReconnecting ? <><RefreshCw className="animate-spin" /> Connecting...</> : 'Enter Game'}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (!liveData) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-emerald-400 mb-4" size={48} />
                <p className="font-bold tracking-widest uppercase text-emerald-200">Syncing with Host...</p>
            </div>
        );
    }

    const { status, currentQuestionIndex, courseId, topicId, isPaused } = liveData;
    const questions = combinedQuizData[courseId]?.modules[topicId] || [];
    const currentQ = questions[currentQuestionIndex];

    if (status === 'waiting') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-600 flex flex-col items-center justify-center p-6 text-center text-white font-inter relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-[600px] h-[600px] bg-white/20 rounded-full blur-[100px]"></motion.div>
                
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-lg">
                    <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-xl">You're in!</h1>
                    <p className="text-xl md:text-2xl font-bold text-emerald-100 mb-12 tracking-wide">See your nickname on the screen</p>
                    <div className="text-4xl md:text-6xl font-black bg-white/20 px-8 py-6 md:px-12 md:py-8 rounded-full border-4 border-white/40 backdrop-blur-xl shadow-2xl break-words transform -rotate-2">
                        {myState?.name}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'countdown') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 flex flex-col items-center justify-center p-6 text-center text-white font-inter relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
                    <motion.h1 animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-5xl md:text-7xl font-black mb-6 tracking-widest uppercase drop-shadow-2xl text-yellow-300">
                        Get Ready!
                    </motion.h1>
                    <div className="w-32 h-2 bg-white/30 rounded-full mx-auto mb-6 overflow-hidden">
                        <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3, ease: "linear" }} className="h-full bg-yellow-300" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold opacity-90 drop-shadow-md">Look at the main screen</p>
                </motion.div>
            </div>
        );
    }

    if (status === 'active') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-inter relative">
                {isPaused && (
                    <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
                        <AlertCircle size={80} className="text-amber-400 mb-6 animate-bounce" />
                        <h2 className="text-5xl font-black mb-4 tracking-widest uppercase text-amber-400">Paused</h2>
                        <p className="text-2xl font-bold opacity-90">Host has paused the timer.</p>
                    </div>
                )}
                
                {/* Top Info Bar */}
                <div className="bg-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-md border-b border-slate-200 shrink-0 z-20">
                    <div className="font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-xs bg-slate-100 px-3 py-1.5 rounded-lg">
                        Q {currentQuestionIndex + 1}/{questions.length}
                    </div>
                    
                    <div className="flex-1 max-w-[200px] mx-4 h-3 md:h-4 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div 
                            className={`h-full ${isPaused ? 'bg-amber-400' : timer > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${(timer / 30) * 100}%` }}
                            transition={isPaused ? { duration: 0 } : { duration: 1, ease: 'linear' }}
                        />
                    </div>
                    <div className={`font-black text-lg md:text-xl ${isPaused ? 'text-amber-500' : timer > 10 ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                        {timer}
                    </div>

                    <div className="ml-4 px-4 py-1.5 bg-slate-900 text-white font-black rounded-lg text-xs md:text-sm shadow-md flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-400" /> {myState?.score || 0}
                    </div>
                </div>

                <div className="flex-1 flex flex-col p-4 md:p-6 w-full mx-auto max-w-3xl overflow-hidden relative z-10">
                    {/* Big Bold Options */}
                    {!hasAnswered ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 flex-1 mt-2">
                            <AnimatePresence>
                                {currentQ?.options.map((opt, i) => {
                                    const Icon = OPTION_ICONS[i % OPTION_ICONS.length];
                                    return (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleAnswer(i)}
                                            disabled={isPaused}
                                            className={`
                                                w-full h-full min-h-[100px] md:min-h-[140px] rounded-2xl md:rounded-[2rem] text-white font-black text-xl md:text-3xl font-hindi flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-[0_8px_0_0_rgba(0,0,0,0.2)]
                                                ${OPTION_COLORS[i % OPTION_COLORS.length]}
                                                ${OPTION_HOVER[i % OPTION_HOVER.length]}
                                                active:translate-y-2 active:shadow-none transition-all duration-150
                                            `}
                                        >
                                            <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity" />
                                            <Icon size={40} className="mb-4 opacity-80" strokeWidth={3} />
                                            <span className="relative z-10 drop-shadow-md text-center">{opt}</span>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border-4 border-slate-200 shadow-xl p-8 text-center"
                        >
                            <div className="w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={50} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Answer Locked In!</h2>
                            <p className="text-lg text-slate-500 font-bold">Look at the main screen to see how you did.</p>
                            <div className="mt-8 flex gap-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'result') {
        const hasAns = myState?.lastAnswer !== null && myState?.lastAnswer !== undefined;
        const isCorrect = hasAns && currentQ?.correctAnswer === myState.lastAnswer;
        
        let resultText = 'Time Up!';
        let resultColor = 'from-slate-700 to-slate-900';
        if (hasAns) {
            resultText = isCorrect ? 'Correct!' : 'Incorrect';
            resultColor = isCorrect ? 'from-emerald-400 to-emerald-600' : 'from-rose-500 to-rose-700';
        }
        
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-6 text-center text-white bg-gradient-to-br ${resultColor} font-inter relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-md">
                    <motion.div 
                        animate={{ y: [0, -10, 0] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-32 h-32 md:w-40 md:h-40 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-xl border border-white/30 shadow-2xl"
                    >
                        {isCorrect ? <CheckCircle2 size={80} className="text-white drop-shadow-md" /> : <XCircle size={80} className="text-white drop-shadow-md" />}
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 drop-shadow-2xl">
                        {resultText}
                    </h1>
                    
                    <div className="inline-flex flex-col items-center gap-2 bg-black/20 px-8 py-6 rounded-3xl font-bold text-xl md:text-3xl border border-white/20 backdrop-blur-md shadow-inner">
                        <span className="text-sm font-black uppercase tracking-widest text-white/70 mb-1">Points Earned</span>
                        <div className="flex items-center gap-3">
                            {isCorrect && <Zap size={30} className="text-yellow-300" />}
                            <span>+{myState?.lastPoints || 0}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'leaderboard') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-6 text-center text-white font-inter relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                
                <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
                    <Trophy size={80} className="text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
                    <h1 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-widest text-indigo-200">Current Standings</h1>
                    
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {participants.slice(0, 5).map((p, index) => {
                                const isMe = p.id === student?.registration;
                                return (
                                    <motion.div 
                                        key={p.id}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center rounded-2xl p-4 border-2 ${isMe ? 'bg-indigo-600/50 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-[1.02]' : 'bg-white/5 border-white/10'} backdrop-blur-md transition-all`}
                                    >
                                        <div className="w-10 text-center text-xl font-black text-indigo-300">#{index + 1}</div>
                                        <div className="flex-1 text-left text-xl font-bold truncate px-4">{p.name} {isMe && <span className="text-indigo-300 text-sm ml-2">(You)</span>}</div>
                                        <div className="text-2xl font-black text-yellow-400 shrink-0">{p.score}</div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 p-6 bg-black/30 rounded-[1.5rem] border border-white/10 flex justify-between items-center shadow-inner">
                        <p className="text-lg font-bold opacity-80 uppercase tracking-widest text-indigo-200">Your Score</p>
                        <p className="text-4xl font-black text-yellow-400">{myState?.score}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'finished') {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 text-center text-white font-inter relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 bg-white/5 p-8 md:p-12 rounded-[3rem] backdrop-blur-2xl border border-white/10 w-full max-w-md shadow-2xl">
                    <Trophy size={60} className="text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-5xl font-black mb-4 tracking-tight drop-shadow-md">Game Over!</h1>
                    <p className="text-xl font-bold text-slate-400 mb-8">Thanks for playing.</p>
                    
                    <div className="bg-black/40 p-8 rounded-[2rem] mb-8 border border-white/5 shadow-inner">
                        <p className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">Final Score</p>
                        <p className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]">{myState?.score}</p>
                    </div>

                    <button onClick={() => navigate('/student-portal')} className="px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black uppercase tracking-widest w-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/30 text-lg">
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
}
