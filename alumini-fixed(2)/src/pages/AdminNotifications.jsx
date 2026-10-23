import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { motion } from "framer-motion";
import { Bell, Send, Loader2, Users, AlertCircle, History, CheckCircle, Zap } from "lucide-react";
import { useAuth } from "../app/common/AuthContext";
import { queueBroadcast } from "../lib/notifications";
import { cn } from "../lib/utils";

export default function AdminNotifications() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [stats, setStats] = useState({ alumni: 0, students: 0, guests: 0 });
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setFetching(true);
        try {
            const usersRef = collection(db, "users");
            const studentsRef = collection(db, "students");
            const guestsRef = collection(db, "guest_subscribers");
            const qUsers = query(usersRef, where("notificationsEnabled", "==", true));
            const qStudents = query(studentsRef, where("notificationsEnabled", "==", true));

            const [uSnap, sSnap, gSnap] = await Promise.all([getDocs(qUsers), getDocs(qStudents), getDocs(guestsRef)]);
            setStats({
                alumni: uSnap.size,
                students: sSnap.size,
                guests: gSnap.size
            });

            // Fetch History
            const qHistory = query(collection(db, "notifications_queue"));
            const hSnap = await getDocs(qHistory);
            const hData = [];
            hSnap.forEach(d => hData.push({ id: d.id, ...d.data() }));
            // Sort locally to avoid needing explicit compound index configuration
            hData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setHistory(hData);
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    }

    const handleSend = async (e) => {
        e.preventDefault();
        const total = stats.alumni + stats.students + (stats.guests || 0);
        if (total === 0) {
            alert("No devices are currently subscribed.");
            return;
        }

        if (!title.trim() || !message.trim()) return;

        if (!window.confirm(`Deploy this message to ${total} secure devices?`)) return;

        setLoading(true);
        try {
            // Gather Tokens
            const usersRef = collection(db, "users");
            const studentsRef = collection(db, "students");
            const guestsRef = collection(db, "guest_subscribers");
            const qUsers = query(usersRef, where("notificationsEnabled", "==", true));
            const qStudents = query(studentsRef, where("notificationsEnabled", "==", true));

            const [uSnap, sSnap, gSnap] = await Promise.all([getDocs(qUsers), getDocs(qStudents), getDocs(guestsRef)]);

            let allTokens = new Set();
            uSnap.forEach(doc => {
                const data = doc.data();
                if (data.fcmTokens) data.fcmTokens.forEach(t => allTokens.add(t));
            });
            sSnap.forEach(doc => {
                const data = doc.data();
                if (data.fcmTokens) data.fcmTokens.forEach(t => allTokens.add(t));
            });
            gSnap.forEach(doc => {
                if (doc.id) allTokens.add(doc.id);
                const data = doc.data();
                if (data.token) allTokens.add(data.token);
            });

            const tokensArray = Array.from(allTokens);
            if (tokensArray.length === 0) throw new Error("No FCM tokens found.");

            // Add to Queue History
            await queueBroadcast(title.trim(), message.trim(), user?.uid);

            // Send via Serverless
            const response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    body: message.trim(),
                    url: url.trim() || undefined,
                    tokens: tokensArray
                })
            });

            if (response.status === 404) {
                alert("Queue Generated ✅\n\n(Local Dev Mode: Live Push via Firebase Admin SDK requires Vercel Production Environment. The broadcast has been queued in Firestore.)");
                setTitle("");
                setMessage("");
                fetchData();
                return;
            }

            const result = await response.json();
            console.log("Push API Response:", result);

            setTitle("");
            setMessage("");
            setUrl("");
            fetchData(); // Refresh history

            if (response.ok) {
                alert(`Broadcast Pushed! Delivered to ${result.successCount} devices.`);
            } else {
                alert(`Broadcast API Failed!\nError: ${result.error || 'Unknown'}\nDetails: ${result.details || 'Check Vercel Serverless Logs'}`);
            }
        } catch (e) {
            console.error("Broadcast failed:", e);
            alert("Broadcast creation failed: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    const totalSubscribed = stats.alumni + stats.students + (stats.guests || 0);

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-inter">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] border border-blue-100"
                    >
                        Network Operations Center
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                        Broadcast <span className="text-blue-600">Command</span>
                    </h1>
                    <p className="mt-4 text-slate-500 font-bold max-w-xl leading-relaxed">
                        Deploy push announcements directly to alumni and student devices.
                    </p>
                </div>

                {fetching ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {/* Stats Panel */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="premium-card bg-white p-6 shadow-xl shadow-blue-100/50">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 ring-1 ring-blue-100">
                                    <Bell size={20} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalSubscribed}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Tuned-in</p>
                            </motion.div>
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="premium-card bg-white p-6">
                                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 ring-1 ring-amber-100">
                                    <Users size={20} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.alumni}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Alumni Network</p>
                            </motion.div>
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="premium-card bg-white p-6 col-span-2 md:col-span-1">
                                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 ring-1 ring-emerald-100">
                                    <Users size={20} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.students}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Student Sector</p>
                            </motion.div>
                        </div>

                        {/* Compose Panel */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="premium-card bg-white overflow-hidden shadow-2xl">
                            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/30 blur-[80px] rounded-full" />
                                <h2 className="text-2xl font-black tracking-tight relative z-10">Compose Broadcast</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 relative z-10">Direct to Device Payload</p>
                            </div>
                            <form onSubmit={handleSend} className="p-8 space-y-6 bg-white relative">
                                {totalSubscribed === 0 && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-4 border border-red-100">
                                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black text-xs uppercase tracking-widest leading-relaxed">No Valid Targets</p>
                                            <p className="text-xs font-bold text-red-500/80 mt-1">Users must accept browser notifications before you can push messages.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payload Title</label>
                                    <input
                                        type="text"
                                        maxLength={50}
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 outline-none rounded-2xl transition-all font-bold text-slate-900 placeholder-slate-400"
                                        placeholder="E.g., Emergency Update / New Course"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={totalSubscribed === 0}
                                    />
                                    <p className="text-right text-[10px] font-bold text-slate-400">{title.length}/50</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payload Body</label>
                                    <textarea
                                        rows={3}
                                        maxLength={150}
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 outline-none rounded-2xl transition-all font-bold text-slate-900 placeholder-slate-400 resize-none"
                                        placeholder="Keep it concise and impactful..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={totalSubscribed === 0}
                                    />
                                    <p className="text-right text-[10px] font-bold text-slate-400">{message.length}/150</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target URL (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 outline-none rounded-2xl transition-all font-bold text-slate-900 placeholder-slate-400"
                                        placeholder="E.g., /quiz or https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        disabled={totalSubscribed === 0}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || totalSubscribed === 0}
                                    className="btn-premium w-full py-5 bg-blue-600 text-white flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all font-black uppercase tracking-widest text-sm"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            <Send size={20} />
                                            Push Broadcast
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                        {/* History Log */}
                        <div className="pt-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 ml-2">
                                <History size={16} /> Transmission Log
                            </h3>
                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <p className="text-slate-400 font-bold text-sm text-center py-10 bg-slate-50 border border-slate-100 border-dashed rounded-3xl">No records found.</p>
                                ) : (
                                    history.map((record) => (
                                        <div key={record.id} className="premium-card bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start gap-4 flex-1 w-full">
                                                <div className={cn(
                                                    "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center mt-1 sm:mt-0 ring-1",
                                                    record.status === 'pending' ? "bg-amber-50 text-amber-600 ring-amber-100" : "bg-emerald-50 text-emerald-600 ring-emerald-100"
                                                )}>
                                                    {record.status === 'pending' ? <Zap size={18} className="animate-pulse" /> : <CheckCircle size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-slate-900 truncate">{record.title}</h4>
                                                    <p className="text-sm font-bold text-slate-500 mt-1 line-clamp-2 md:line-clamp-1">{record.body}</p>
                                                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {record.createdAt ? new Date(record.createdAt.toMillis()).toLocaleString() : 'Just now'}
                                                        </p>
                                                        <span className="h-1 w-1 rounded-full bg-slate-200 hidden sm:block" />
                                                        <p className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest",
                                                            record.status === 'pending' ? "text-amber-600" : "text-emerald-600"
                                                        )}>
                                                            {record.status === 'pending' ? 'Queued' : 'Deployed'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
