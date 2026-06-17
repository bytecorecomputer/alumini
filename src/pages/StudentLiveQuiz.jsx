import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Loader2, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { db } from '../firebase/firestore';
import { doc, setDoc, onSnapshot, updateDoc, increment, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import confetti from 'canvas-confetti';
import { initAudio, playSuccess, playError } from '../lib/soundEffects';

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
    
    // Custom Quizzes State
    const [customQuizzes, setCustomQuizzes] = useState({});

    useEffect(() => {
        const fetchCustomQuizzes = async () => {
            const snap = await getDocs(collection(db, 'custom_quizzes'));
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
        };
        fetchCustomQuizzes();
    }, []);

    const combinedQuizData = { ...HINDI_QUIZ_DATA };
    Object.keys(customQuizzes).forEach(cId => {
        if (!combinedQuizData[cId]) {
            combinedQuizData[cId] = customQuizzes[cId];
        } else {
            combinedQuizData[cId].modules = {
                ...combinedQuizData[cId].modules,
                ...customQuizzes[cId].modules
            };
        }
    });

    // Auto-join logic
    useEffect(() => {
        const pin = searchParams.get('pin');
        if (pin && !joined && student) {
            setRoomId(pin);
            setIsReconnecting(true);
            setTimeout(() => {
                initAudio();
                joinRoom(pin);
            }, 800);
        }
    }, [searchParams, student]);

    // Join via manual input
    const handleJoin = async (e) => {
        e?.preventDefault();
        if (!roomId || !student) return;
        setIsReconnecting(true);
        initAudio();
        joinRoom(roomId);
    };

    const joinRoom = async (rId) => {
        try {
            const myRef = doc(db, `live_quizzes/${rId}/participants/${student.registration}`);
            // We use merge: true so if they disconnect and reconnect, their score isn't wiped out
            await setDoc(myRef, {
                name: student.fullName || student.studentName || 'Student',
                // Don't overwrite lastAnswer or score if they already exist
                joinedAt: Date.now()
            }, { merge: true });
            
            setJoined(true);
            setIsReconnecting(false);
        } catch (err) {
            console.error(err);
            alert("Room not found or error joining. Please check the PIN.");
            setIsReconnecting(false);
        }
    };

    // Listen to Room
    useEffect(() => {
        if (!joined || !roomId) return;
        
        const roomRef = doc(db, 'live_quizzes', roomId);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // If moving to a new question, reset my local answered state
                if (liveData && data.currentQuestionIndex !== liveData.currentQuestionIndex) {
                    setHasAnswered(false);
                    // Also clear lastAnswer in DB robustly
                    updateDoc(doc(db, `live_quizzes/${roomId}/participants/${student.registration}`), {
                        lastAnswer: null
                    }).catch(e => console.error("Error clearing answer:", e));
                }
                setLiveData(data);
                
                // If paused, we can show a toast or UI indicator
            } else {
                // Room closed
                setJoined(false);
                setLiveData(null);
                alert("Room closed by Admin");
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
                // I was kicked
                setJoined(false);
                alert("You have been removed from the session.");
                navigate('/student-portal');
            }
        });

        return () => {
            unsubscribe();
            unsubMe();
        };
    }, [joined, roomId, liveData, student, navigate]);

    // Audio effects for results
    useEffect(() => {
        if (liveData?.status === 'result' && myState) {
            const courseData = combinedQuizData[liveData.courseId];
            const currentQ = courseData?.modules[liveData.topicId]?.[liveData.currentQuestionIndex];
            const hasAnswer = myState?.lastAnswer !== null && myState?.lastAnswer !== undefined;
            const isCorrect = hasAnswer && currentQ?.correctAnswer === myState.lastAnswer;
            
            if (isCorrect) {
                playSuccess();
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } else {
                playError();
            }
        }
    }, [liveData?.status, liveData?.currentQuestionIndex, myState]);

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
            const timeElapsed = Date.now() - (liveData.questionStartedAt || Date.now());
            const secondsElapsed = timeElapsed / 1000;
            // Max 1000, Min 500. Decreases linearly over 30 seconds
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
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="font-bold tracking-widest uppercase">Loading Auth...</p>
            </div>
        );
    }

    if (!joined) {
        return (
            <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 md:p-6 font-inter">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative z-10 w-full max-w-md bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-center shadow-2xl"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
                        <Zap size={32} className="md:w-10 md:h-10" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Join Live Quiz</h1>
                    <p className="text-slate-500 font-bold mb-6 md:mb-8 text-sm md:text-base">Enter the PIN provided by your instructor</p>
                    
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Game PIN" 
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full text-center text-3xl md:text-4xl font-black tracking-[0.2em] md:tracking-widest p-4 md:p-6 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] md:rounded-[2rem] outline-none focus:border-indigo-500 transition-colors uppercase"
                            maxLength={6}
                            disabled={isReconnecting}
                        />
                        <button 
                            type="submit" 
                            disabled={!roomId || roomId.length < 5 || isReconnecting}
                            className="w-full py-4 md:py-6 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-sm md:text-lg disabled:opacity-50 hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/30"
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
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="font-bold tracking-widest uppercase">Syncing with Host...</p>
            </div>
        );
    }

    const { status, currentQuestionIndex, courseId, topicId, isPaused } = liveData;
    const questions = combinedQuizData[courseId]?.modules[topicId] || [];
    const currentQ = questions[currentQuestionIndex];

    if (status === 'waiting') {
        return (
            <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-6 text-center text-white font-inter">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 w-full max-w-lg">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-lg">You're in!</h1>
                    <p className="text-lg md:text-2xl font-bold opacity-90 mb-8 md:mb-12">See your nickname on the main screen</p>
                    <div className="text-4xl md:text-6xl font-black bg-white/20 px-8 py-6 md:px-12 md:py-8 rounded-full border border-white/30 backdrop-blur-md shadow-2xl break-words">
                        {myState?.name}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'countdown') {
        return (
            <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-center text-white font-inter">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-widest uppercase animate-pulse drop-shadow-xl">Get Ready!</h1>
                    <p className="text-xl md:text-2xl font-bold opacity-80">Look at the main screen</p>
                </motion.div>
            </div>
        );
    }

    if (status === 'active') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col font-inter relative">
                {isPaused && (
                    <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                        <AlertCircle size={64} className="text-amber-400 mb-6 animate-pulse" />
                        <h2 className="text-4xl font-black mb-2 tracking-widest uppercase text-amber-400">Paused</h2>
                        <p className="text-xl font-bold opacity-90">The host has paused the timer.</p>
                    </div>
                )}
                
                <div className="bg-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-sm border-b border-slate-200 shrink-0">
                    <div className="font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-xs">Question {currentQuestionIndex + 1}/{questions.length}</div>
                    <div className="px-3 py-1.5 md:px-4 md:py-1.5 bg-blue-100 text-blue-600 font-black rounded-full text-xs md:text-sm shadow-inner">
                        Score: {myState?.score || 0}
                    </div>
                </div>

                <div className="flex-1 flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full overflow-y-auto">
                    <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-200 mb-4 md:mb-6 relative overflow-hidden flex items-center justify-center min-h-[150px] md:min-h-[200px] shrink-0">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                        <h2 className="text-xl md:text-3xl font-black text-center text-slate-800 leading-relaxed font-hindi w-full">
                            {currentQ?.question}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 flex-1">
                        {currentQ?.options.map((opt, i) => {
                            const isSelected = myState?.lastAnswer === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    disabled={hasAnswered || isPaused}
                                    className={`
                                        p-5 md:p-8 rounded-xl md:rounded-[1.5rem] border-4 transition-all duration-300 font-bold text-lg md:text-2xl font-hindi flex items-center justify-center min-h-[80px]
                                        ${hasAnswered 
                                            ? isSelected 
                                                ? 'bg-blue-100 border-blue-500 text-blue-900 scale-[0.98] shadow-inner' 
                                                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 grayscale'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-xl active:scale-95'
                                        }
                                    `}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    
                    <AnimatePresence>
                        {hasAnswered && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 md:mt-8 text-center bg-indigo-50 border border-indigo-100 p-4 rounded-xl shrink-0"
                            >
                                <p className="text-indigo-600 font-bold text-sm md:text-base animate-pulse">
                                    Answer received! Waiting for others... Look at the main screen.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    if (status === 'result') {
        const hasAnswer = myState?.lastAnswer !== null && myState?.lastAnswer !== undefined;
        const isCorrect = hasAnswer && currentQ?.correctAnswer === myState.lastAnswer;
        
        let resultText = 'Incorrect';
        if (!hasAnswer) resultText = 'Time Up!';
        if (isCorrect) resultText = 'Correct!';
        
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-6 text-center text-white ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'} font-inter`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-sm">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 backdrop-blur-md border border-white/30 shadow-2xl">
                        {isCorrect ? <CheckCircle2 size={64} className="text-white drop-shadow-md md:w-20 md:h-20" /> : <XCircle size={64} className="text-white drop-shadow-md md:w-20 md:h-20" />}
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-lg">
                        {resultText}
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-xl border border-white/10 backdrop-blur-sm">
                        {isCorrect ? `Speed Bonus: +${myState?.lastPoints || 0} Points` : '0 Points'}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'leaderboard') {
        return (
            <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-6 text-center text-white font-inter">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 w-full max-w-sm">
                    <Trophy size={80} className="text-yellow-400 mx-auto mb-6 md:mb-8 drop-shadow-2xl md:w-[100px] md:h-[100px]" />
                    <h1 className="text-2xl md:text-4xl font-black mb-2 uppercase tracking-widest text-blue-200">Look at the Screen</h1>
                    <div className="mt-6 md:mt-8 p-6 md:p-8 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl">
                        <p className="text-sm md:text-xl font-bold opacity-80 uppercase tracking-widest mb-2">Your Score</p>
                        <p className="text-5xl md:text-7xl font-black text-white">{myState?.score}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'finished') {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 text-center text-white font-inter">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 bg-white/10 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] backdrop-blur-xl border border-white/20 w-full max-w-md shadow-2xl">
                    <h1 className="text-4xl md:text-5xl font-black mb-2 md:mb-4 tracking-tight">Game Over!</h1>
                    <p className="text-base md:text-xl font-bold text-blue-200 mb-6 md:mb-8">Thanks for playing.</p>
                    
                    <div className="bg-slate-900/50 p-6 rounded-2xl mb-6 md:mb-8 border border-white/5">
                        <p className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Final Score</p>
                        <p className="text-4xl md:text-5xl font-black text-yellow-400">{myState?.score}</p>
                    </div>

                    <button onClick={() => navigate('/student-portal')} className="px-6 py-4 md:px-8 md:py-4 bg-white text-slate-900 rounded-xl md:rounded-full font-black uppercase tracking-widest w-full hover:scale-105 transition-transform shadow-xl text-sm md:text-base">
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
}
