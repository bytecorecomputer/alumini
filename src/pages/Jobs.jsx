import { useState, useEffect } from 'react';
import { useAuth } from '../app/common/AuthContext';
import { db } from '../firebase/firestore';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Building, Plus, Trash2, X, Search, Filter } from 'lucide-react';

export default function Jobs() {
    const { user, role, userData } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time', // Full-time, Internship, Freelance
        link: '',
        description: ''
    });

    const isAlumni = role === 'alumni' || role === 'admin' || role === 'super_admin';
    const isSuperAdmin = role === 'super_admin' || role === 'admin';

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const jobsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setJobs(jobsList);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this job posting?")) return;
        try {
            await deleteDoc(doc(db, "jobs", id));
            setJobs(jobs.filter(j => j.id !== id));
        } catch (error) {
            alert("Error deleting job");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, "jobs"), {
                ...formData,
                postedBy: user.uid,
                posterName: userData?.displayName || 'Alumni Member',
                posterRole: role,
                createdAt: Date.now()
            });
            setJobs([{ id: docRef.id, ...formData, postedBy: user.uid, posterName: userData?.displayName, createdAt: Date.now() }, ...jobs]);

            setIsModalOpen(false);
            setFormData({ title: '', company: '', location: '', type: 'Full-time', link: '', description: '' });
            alert("Job Posted Successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to post job");
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || job.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Career Center</h1>
                        <p className="text-gray-600 mt-2">Find your next opportunity or hire talent from your network.</p>
                    </div>
                    {isAlumni && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-800 transition shadow-lg active:scale-95"
                        >
                            <Plus size={20} /> Post a Job
                        </button>
                    )}
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                        <input
                            placeholder="Search by role or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="md:w-48">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Internship">Internship</option>
                            <option value="Freelance">Freelance</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading opportunities...</div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900">No jobs found</h3>
                        <p className="text-gray-500">Be the first to post an opportunity!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map((job) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                            <div className="flex items-center gap-2 text-primary-600 font-medium mt-1">
                                                <Building size={16} /> {job.company}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${job.type === 'Internship' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                job.type === 'Freelance' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {job.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-gray-500 text-sm mt-3">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                        <span>• Posted by {job.posterName}</span>
                                        <span>• {new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <p className="mt-3 text-gray-600 line-clamp-2 text-sm">{job.description}</p>
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <a
                                        href={job.link.startsWith('http') ? job.link : `https://${job.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 text-center transition"
                                    >
                                        Apply Now
                                    </a>

                                    {(isSuperAdmin || user.uid === job.postedBy) && (
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="px-6 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 border border-red-200 flex items-center justify-center gap-2 transition"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Job Modal */}
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
                                <h2 className="text-xl font-bold text-gray-900">Post Opportunity</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="e.g. Frontend Developer"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                        <input
                                            required
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Freelance">Freelance</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="City, Remote, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Link / Email</label>
                                    <input
                                        required
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="https://... or mailto:..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Job details, requirements..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary-900 text-white py-3 rounded-xl font-bold hover:bg-primary-800 transition shadow-lg active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <Plus size={20} /> Post Opportunity
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
