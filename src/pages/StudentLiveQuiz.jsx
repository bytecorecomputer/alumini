import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Loader2, Zap, AlertCircle } from 'lucide-react';
import { db } from '../firebase/firestore';
import { doc, setDoc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
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
    
    // Auto-join logic
    useEffect(() => {
        const pin = searchParams.get('pin');
        if (pin && !joined && student) {
            setRoomId(pin);
            // Slightly delay auto-join to allow UI to render
            setTimeout(() => {
                initAudio();
                joinRoom(pin);
            }, 500);
        }
    }, [searchParams, student]);
    
    // Live State
    const [liveData, setLiveData] = useState(null);
    const [myState, setMyState] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    // Join via manual input
    const handleJoin = async (e) => {
        e?.preventDefault();
        if (!roomId || !student) return;
        initAudio();
        joinRoom(roomId);
    };

    const joinRoom = async (rId) => {
        try {
            const myRef = doc(db, `live_quizzes/${rId}/participants/${student.registration}`);
            await setDoc(myRef, {
                name: student.fullName || student.studentName || 'Student',
                score: 0,
                lastAnswer: null,
                joinedAt: Date.now()
            });
            setJoined(true);
        } catch (err) {
            console.error(err);
            alert("Room not found or error joining.");
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
                    // Also clear lastAnswer in DB
                    updateDoc(doc(db, `live_quizzes/${roomId}/participants/${student.registration}`), {
                        lastAnswer: null
                    });
                }
                setLiveData(data);
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
                setMyState(snap.data());
            }
        });

        return () => {
            unsubscribe();
            unsubMe();
        };
    }, [joined, roomId]);

    // Audio effects for results
    useEffect(() => {
        if (liveData?.status === 'result') {
            const courseData = HINDI_QUIZ_DATA[liveData.courseId];
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
    }, [liveData?.status, liveData?.currentQuestionIndex]);

    const handleAnswer = async (index) => {
        if (hasAnswered || !liveData) return;
        setHasAnswered(true);

        const courseData = HINDI_QUIZ_DATA[liveData.courseId];
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
        
        const myRef = doc(db, `live_quizzes/${roomId}/participants/${student.registration}`);
        await updateDoc(myRef, {
            lastAnswer: index,
            score: increment(points),
            lastPoints: points
        });
    };

    if (!student) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Auth...</div>;
    }

    if (!joined) {
        return (
            <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 w-full max-w-md bg-white rounded-[3rem] p-10 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Zap size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Join Live Quiz</h1>
                    <p className="text-slate-500 font-bold mb-8">Enter the PIN provided by your instructor</p>
                    
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Game PIN" 
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full text-center text-4xl font-black tracking-widest p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] outline-none focus:border-indigo-500 transition-colors uppercase"
                            maxLength={6}
                        />
                        <button 
                            type="submit" 
                            disabled={!roomId || roomId.length < 5}
                            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg disabled:opacity-50 hover:scale-105 transition-transform"
                        >
                            Enter
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (!liveData) return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Loader2 className="animate-spin" size={48} /></div>;

    const { status, currentQuestionIndex, courseId, topicId } = liveData;
    const questions = HINDI_QUIZ_DATA[courseId]?.modules[topicId] || [];
    const currentQ = questions[currentQuestionIndex];

    if (status === 'waiting') {
        return (
            <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10">
                    <h1 className="text-5xl font-black mb-4 tracking-tighter">You're in!</h1>
                    <p className="text-2xl font-bold opacity-90">See your nickname on screen</p>
                    <div className="mt-12 text-6xl font-black bg-white/20 px-12 py-6 rounded-full border border-white/30 backdrop-blur-md">
                        {myState?.name}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'countdown') {
        return (
            <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-widest uppercase animate-pulse">Get Ready!</h1>
                <p className="text-2xl font-bold opacity-80">Look at the main screen</p>
            </div>
        );
    }

    if (status === 'active') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-slate-200">
                    <div className="font-black text-slate-400 uppercase tracking-widest text-xs">Question {currentQuestionIndex + 1}/{questions.length}</div>
                    <div className="px-4 py-1.5 bg-blue-100 text-blue-600 font-black rounded-full text-sm">Score: {myState?.score || 0}</div>
                </div>

                <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200 mb-6 relative overflow-hidden flex items-center justify-center min-h-[200px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                        <h2 className="text-2xl md:text-3xl font-black text-center text-slate-800 leading-relaxed font-hindi">
                            {currentQ?.question}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        {currentQ?.options.map((opt, i) => {
                            const isSelected = myState?.lastAnswer === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    disabled={hasAnswered}
                                    className={`
                                        p-6 md:p-8 rounded-[1.5rem] border-4 transition-all duration-300 font-bold text-xl md:text-2xl font-hindi
                                        ${hasAnswered 
                                            ? isSelected 
                                                ? 'bg-blue-100 border-blue-500 text-blue-900 scale-[0.98]' 
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
                    
                    {hasAnswered && (
                        <div className="mt-8 text-center text-slate-500 font-bold animate-pulse">
                            Waiting for others... Look at the main screen!
                        </div>
                    )}
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
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center text-white ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md">
                        {isCorrect ? <CheckCircle2 size={80} className="text-white drop-shadow-md" /> : <XCircle size={80} className="text-white drop-shadow-md" />}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                        {resultText}
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-black/20 px-6 py-3 rounded-full font-bold text-xl">
                        {isCorrect ? `Speed Bonus: +${myState?.lastPoints || 0} Points` : '0 Points'}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'leaderboard') {
        return (
            <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <Trophy size={100} className="text-yellow-400 mx-auto mb-8 drop-shadow-2xl" />
                    <h1 className="text-4xl font-black mb-2 uppercase tracking-widest text-blue-200">Look at the Screen</h1>
                    <p className="text-xl font-bold opacity-80">Your total score is <strong className="text-white text-3xl">{myState?.score}</strong></p>
                </div>
            </div>
        );
    }

    if (status === 'finished') {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 bg-white/10 p-12 rounded-[3rem] backdrop-blur-xl border border-white/20">
                    <h1 className="text-5xl font-black mb-4">Game Over!</h1>
                    <p className="text-xl font-bold text-blue-200 mb-8">Thanks for playing.</p>
                    <button onClick={() => navigate('/student-portal')} className="px-8 py-4 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest w-full">
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
}
