import { useState, useEffect } from 'react';
import { useAuth } from '../app/common/AuthContext';
import { db } from '../firebase/firestore';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Plus, Trash2, Edit2, X, Save, Users, Video, ArrowRight, Zap, Target } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Events() {
    const { user, role } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        type: 'offline', // offline, online
        description: '',
        image: '' // Optional URL
    });

    const isSuperAdmin = role === 'super_admin' || role === 'admin';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const q = query(collection(db, "events"), orderBy("date", "asc"));
            const querySnapshot = await getDocs(q);
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent deletion protocol required. Continue?")) return;
        try {
            await deleteDoc(doc(db, "events", id));
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            alert("Protocol failure: deletion aborted.");
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            type: event.type,
            description: event.description,
            image: event.image || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                const eventRef = doc(db, "events", editingEvent.id);
                await updateDoc(eventRef, { ...formData });
                setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, ...formData } : ev));
            } else {
                const docRef = await addDoc(collection(db, "events"), {
                    ...formData,
                    createdBy: user.uid,
                    createdAt: Date.now(),
                    attendees: []
                });
                setEvents([...events, { id: docRef.id, ...formData, attendees: [] }]);
            }
            closeModal();
        } catch (error) {
            console.error(error);
            alert("Database synchronization failed.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormData({ title: '', date: '', time: '', location: '', type: 'offline', description: '', image: '' });
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                            Community Convergence
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Events.</span>
                    </h1>
                </motion.div>

                {isSuperAdmin && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setIsModalOpen(true)}
                        className="btn-premium px-10 py-5 bg-slate-900 text-white shadow-2xl shadow-blue-900/10 group active:scale-95"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="uppercase tracking-[0.2em] font-black text-sm">Initialize Event</span>
                    </motion.button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-96 rounded-[2.5rem] bg-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 rounded-[3.5rem] border-4 border-dashed border-slate-100"
                >
                    <div className="p-8 bg-slate-50 rounded-full w-fit mx-auto mb-8 text-slate-300">
                        <Calendar size={64} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Network Quiet Mode</h2>
                    <p className="text-slate-500 font-bold">No synchronization points found on the horizon.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {events.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="premium-card group bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/50"
                        >
                            <div className="h-56 relative overflow-hidden">
                                {event.image ? (
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                        <Zap className="text-white/10 h-32 w-32" />
                                    </div>
                                )}
                                <div className="absolute top-6 right-6">
                                    <div className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white/50">
                                        {event.type}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-3">
                                        <Target size={14} /> {event.date}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-[1.1] tracking-tighter group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h3>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                        <div className="p-2 bg-slate-50 rounded-xl"><Clock size={16} className="text-slate-400" /></div>
                                        {event.time}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                        <div className="p-2 bg-slate-50 rounded-xl">
                                            {event.type === 'online' ? <Video size={16} className="text-slate-400" /> : <MapPin size={16} className="text-slate-400" />}
                                        </div>
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <button className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[10px] group/btn">
                                        View Sync Points
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>

                                    {isSuperAdmin && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="p-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-3 bg-slate-50 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>

            {/* Premium Modal */ }
    <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100"
                >
                    <div className="flex justify-between items-center p-10 bg-slate-50/50 border-b border-slate-100">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                {editingEvent ? "Calibrate Event" : "Define New Pivot"}
                            </h2>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Network Synchronization Protocol</p>
                        </div>
                        <button onClick={closeModal} className="p-4 bg-white rounded-2xl text-slate-400 hover:text-slate-950 transition-all shadow-sm">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Designation</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 outline-none text-slate-800 font-bold transition-all"
                                placeholder="e.g. Genesis Alumni Convergence"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 outline-none text-slate-800 font-bold transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sync Time (UTC)</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 outline-none text-slate-800 font-bold transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 outline-none text-slate-800 font-bold transition-all appearance-none"
                                >
                                    <option value="offline">In-Person Convergence</option>
                                    <option value="online">Virtual Projection</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spatial Location</label>
                                <input
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 outline-none text-slate-800 font-bold transition-all"
                                    placeholder={formData.type === 'online' ? "Digital Link" : "Physical Address"}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Briefing Dossier</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 outline-none text-slate-800 font-bold transition-all resize-none"
                                placeholder="Outline the mission parameters..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-premium py-5 bg-slate-900 text-white shadow-2xl shadow-blue-900/20 uppercase tracking-[0.3em] font-black text-sm active:scale-95"
                        >
                            <Save size={20} />
                            {editingEvent ? "Commit Calibration" : "Initialize Event"}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
        </div >
    );
}
