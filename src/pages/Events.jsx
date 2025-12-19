import { useState, useEffect } from 'react';
import { useAuth } from '../app/common/AuthContext';
import { db } from '../firebase/firestore';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Plus, Trash2, Edit2, X, Save, Users, Video } from 'lucide-react';
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
        image: '' // Optional URL for now
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
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteDoc(doc(db, "events", id));
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            alert("Error deleting event");
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
                // Update
                const eventRef = doc(db, "events", editingEvent.id);
                await updateDoc(eventRef, { ...formData });
                setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, ...formData } : ev));
            } else {
                // Create
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
            alert("Failed to save event");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormData({ title: '', date: '', time: '', location: '', type: 'offline', description: '', image: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Alumni Events</h1>
                        <p className="text-gray-600 mt-2">Connect, network, and grow with your community.</p>
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-800 transition shadow-lg active:scale-95"
                        >
                            <Plus size={20} /> Create Event
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900">No events scheduled</h3>
                        <p className="text-gray-500">Check back later for upcoming meetups.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                            >
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center">
                                            <Calendar className="text-white/20 h-20 w-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary-900 shadow-sm">
                                        {event.type}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-primary-600 font-semibold text-sm mb-1">{event.date}</p>
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{event.title}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Clock size={16} className="text-gray-400" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            {event.type === 'online' ? <Video size={16} className="text-gray-400" /> : <MapPin size={16} className="text-gray-400" />}
                                            {event.location}
                                        </div>
                                        <p className="text-gray-500 text-sm line-clamp-3">{event.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button className="text-primary-900 font-semibold text-sm hover:underline">
                                            View Details
                                        </button>

                                        {isSuperAdmin && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(event)}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition"
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

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingEvent ? "Edit Event" : "Create New Event"}
                                </h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="e.g. Annual Alumni Meetup 2025"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="offline">In-Person</option>
                                            <option value="online">Online / Webinar</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location / Link</label>
                                        <input
                                            required
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder={formData.type === 'online' ? "Meeting Link" : "Venue Address"}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Event details..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary-900 text-white py-3 rounded-xl font-bold hover:bg-primary-800 transition shadow-lg active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <Save size={20} />
                                    {editingEvent ? "Save Changes" : "Create Event"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
