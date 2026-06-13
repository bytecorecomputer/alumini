import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PlayCircle, Users, Trophy, ChevronRight, XCircle, CheckCircle2,
    Monitor, Target, Zap, Clock, ShieldCheck
} from 'lucide-react';
import { HINDI_QUIZ_DATA } from '../data/hindiQuizData';
import { db } from '../firebase/firestore';
import { doc, setDoc, updateDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminLiveQuiz() {
    const navigate = useNavigate();
    const [quizState, setQuizState] = useState('setup'); // setup | waiting | active | result | leaderboard | finished
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('Master Assessment');
    const [roomId, setRoomId] = useState(null);
    const [participants, setParticipants] = useState([]);
    
    // Live Quiz Data
    const [liveData, setLiveData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timer, setTimer] = useState(0);

    // Derived questions
    const questions = selectedCourse && HINDI_QUIZ_DATA[selectedCourse]?.modules[selectedTopic] 
        ? HINDI_QUIZ_DATA[selectedCourse].modules[selectedTopic] 
        : [];

    useEffect(() => {
        if (!roomId) return;
        
        const roomRef = doc(db, 'live_quizzes', roomId);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setLiveData(data);
                setQuizState(data.status);
                setCurrentQuestionIndex(data.currentQuestionIndex);
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
    }, [roomId]);

    // Timer countdown
    useEffect(() => {
        if (quizState === 'active' && timer > 0) {
            const t = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(t);
        } else if (quizState === 'active' && timer === 0) {
            // Auto move to result
            handleShowResult();
        }
    }, [quizState, timer]);

    const handleCreateRoom = async () => {
        if (!selectedCourse) return toast.error("Select a course module");
        
        const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
        try {
            await setDoc(doc(db, 'live_quizzes', newRoomId), {
                courseId: selectedCourse,
                topicId: selectedTopic,
                status: 'waiting',
                currentQuestionIndex: 0,
                createdAt: Date.now(),
                totalQuestions: questions.length,
                host: 'Admin'
            });
            setRoomId(newRoomId);
            setQuizState('waiting');
            toast.success("Room created! Students can join now.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create live room");
        }
    };

    const handleStartQuiz = async () => {
        await updateDoc(doc(db, 'live_quizzes', roomId), {
            status: 'active',
            currentQuestionIndex: 0
        });
        setTimer(30);
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex >= questions.length - 1) {
            await updateDoc(doc(db, 'live_quizzes', roomId), { status: 'finished' });
            return;
        }
        await updateDoc(doc(db, 'live_quizzes', roomId), {
            status: 'active',
            currentQuestionIndex: currentQuestionIndex + 1
        });
        setTimer(30);
    };

    const handleShowResult = async () => {
        await updateDoc(doc(db, 'live_quizzes', roomId), { status: 'result' });
    };

    const handleShowLeaderboard = async () => {
        await updateDoc(doc(db, 'live_quizzes', roomId), { status: 'leaderboard' });
    };

    const handleEndSession = async () => {
        if (window.confirm("Are you sure you want to end and delete this live session?")) {
            await deleteDoc(doc(db, 'live_quizzes', roomId));
            setRoomId(null);
            setQuizState('setup');
            setParticipants([]);
        }
    };

    // Rendering
    if (quizState === 'setup') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 md:px-12 flex items-center justify-center font-inter">
                <div className="max-w-xl w-full bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-blue-50">
                        <Monitor size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-600 text-white rounded-2xl"><Zap size={24} /></div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Host Live Quiz</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Module</label>
                                <select 
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="">-- Choose Module --</option>
                                    {Object.entries(HINDI_QUIZ_DATA).map(([key, data]) => (
                                        <option key={key} value={key}>{data.title || key}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <button 
                                onClick={handleCreateRoom}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
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
        return (
            <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 w-full max-w-3xl">
                    <h1 className="text-white text-3xl font-medium mb-2 uppercase tracking-widest opacity-80">Join at Student Portal</h1>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[4rem] mb-12 shadow-2xl">
                        <p className="text-blue-200 font-black uppercase tracking-[0.3em] mb-4">Live Room PIN</p>
                        <h2 className="text-8xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">{roomId}</h2>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 backdrop-blur-md px-8 py-6 rounded-full border border-white/10 mb-8">
                        <div className="flex items-center gap-4">
                            <Users className="text-blue-400" size={32} />
                            <span className="text-3xl font-black text-white">{participants.length}</span>
                            <span className="text-blue-200 font-bold uppercase tracking-widest text-sm">Players Joined</span>
                        </div>
                        <button 
                            onClick={handleStartQuiz}
                            disabled={participants.length === 0}
                            className="px-8 py-4 bg-white text-indigo-900 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            Start Game
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {participants.map(p => (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={p.id} 
                                className="px-4 py-2 bg-indigo-800/50 rounded-lg text-white font-bold"
                            >
                                {p.name}
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Admin Header Bar */}
            <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500" />
                    <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Host Control Panel</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full">PIN: {roomId}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-black text-slate-400">Q {currentQuestionIndex + 1}/{totalQ}</span>
                    <button onClick={handleEndSession} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors">
                        End Session
                    </button>
                </div>
            </div>

            <div className="flex-1 flex p-8 gap-8 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col relative">
                    
                    {quizState === 'active' && (
                        <div className="p-12 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div className="h-4 flex-1 bg-slate-100 rounded-full overflow-hidden mr-8">
                                    <motion.div 
                                        className="h-full bg-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((timer)/30)*100}%` }}
                                        transition={{ duration: 1, ease: "linear" }}
                                    />
                                </div>
                                <div className="text-4xl font-black text-blue-600">{timer}s</div>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-12 font-hindi text-center flex-1 flex items-center justify-center">
                                {currentQ.question}
                            </h2>

                            <div className="grid grid-cols-2 gap-6 mt-auto">
                                {currentQ.options.map((opt, i) => {
                                    // Count how many answered this option
                                    const count = participants.filter(p => p.lastAnswer === i).length;
                                    return (
                                        <div key={i} className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl text-slate-700 text-center relative overflow-hidden">
                                            <div className="relative z-10">{opt}</div>
                                        </div>
                                    )
                                })}
                            </div>

                            <button onClick={handleShowResult} className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                                Skip Timer (Show Answer)
                            </button>
                        </div>
                    )}

                    {quizState === 'result' && (
                        <div className="p-12 flex-1 flex flex-col text-center">
                            <h2 className="text-3xl font-black text-slate-500 mb-12 uppercase tracking-widest">Correct Answer</h2>
                            <div className="p-10 bg-emerald-50 border-4 border-emerald-500 rounded-[3rem] mb-12">
                                <CheckCircle2 className="text-emerald-500 mx-auto mb-4" size={64} />
                                <h3 className="text-4xl font-black text-emerald-900 font-hindi">{currentQ.options[currentQ.correctAnswer]}</h3>
                            </div>
                            
                            <p className="text-xl font-medium text-slate-600 mb-12 font-hindi max-w-3xl mx-auto">{currentQ.explanation}</p>

                            <button onClick={handleShowLeaderboard} className="mt-auto mx-auto px-12 py-5 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/20">
                                View Leaderboard
                            </button>
                        </div>
                    )}

                    {quizState === 'leaderboard' && (
                        <div className="p-12 flex-1 flex flex-col bg-slate-900 text-white">
                            <div className="flex items-center justify-center gap-4 mb-12">
                                <Trophy className="text-yellow-400" size={48} />
                                <h2 className="text-5xl font-black uppercase tracking-widest text-yellow-400 drop-shadow-lg">Leaderboard</h2>
                            </div>
                            
                            <div className="max-w-3xl mx-auto w-full space-y-4">
                                <AnimatePresence>
                                    {participants.slice(0, 5).map((p, index) => (
                                        <motion.div 
                                            key={p.id}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                                        >
                                            <div className="w-12 text-center text-2xl font-black text-slate-400">#{index + 1}</div>
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-xl mr-6">
                                                {p.name[0]}
                                            </div>
                                            <div className="flex-1 text-2xl font-bold">{p.name}</div>
                                            <div className="text-3xl font-black text-blue-400">{p.score}</div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {participants.length === 0 && <p className="text-center text-slate-500">No participants yet</p>}
                            </div>

                            <button onClick={handleNextQuestion} className="mt-auto mx-auto px-12 py-5 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform shadow-2xl">
                                {currentQuestionIndex >= totalQ - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight className="inline" />
                            </button>
                        </div>
                    )}

                    {quizState === 'finished' && (
                        <div className="p-12 flex-1 flex flex-col items-center justify-center bg-indigo-950 text-white text-center">
                            <Trophy size={120} className="text-yellow-400 mb-8" />
                            <h2 className="text-6xl font-black mb-4 tracking-tighter">Quiz Complete!</h2>
                            <p className="text-2xl text-blue-200 mb-12">Amazing performance by everyone.</p>
                            
                            {participants[0] && (
                                <div className="p-8 bg-yellow-400/20 border border-yellow-400/50 rounded-3xl backdrop-blur-xl mb-12">
                                    <p className="text-yellow-400 font-black uppercase tracking-widest text-sm mb-2">Grand Champion</p>
                                    <h3 className="text-5xl font-black text-white">{participants[0].name}</h3>
                                    <p className="text-xl font-bold text-yellow-200 mt-2">{participants[0].score} Points</p>
                                </div>
                            )}

                            <button onClick={handleEndSession} className="px-8 py-4 bg-white text-indigo-900 rounded-full font-black uppercase tracking-widest">
                                Close Room
                            </button>
                        </div>
                    )}

                </div>

                {/* Sidebar Stats */}
                <div className="w-80 bg-white rounded-[3rem] border border-slate-200 shadow-sm p-8 flex flex-col">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Live Status</h3>
                    
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                        <span className="font-bold text-slate-600">Total Players</span>
                        <span className="text-2xl font-black text-slate-900">{participants.length}</span>
                    </div>

                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                        <span className="font-bold text-slate-600">Answers In</span>
                        <span className="text-2xl font-black text-blue-600">
                            {quizState === 'active' ? participants.filter(p => p.lastAnswer !== undefined && p.lastAnswer !== null).length : 0}
                        </span>
                    </div>

                    <div className="mt-auto">
                        <div className="p-6 bg-slate-50 rounded-3xl text-center">
                            <Zap className="text-amber-500 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System</p>
                            <p className="font-bold text-slate-700">Realtime Sync Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
