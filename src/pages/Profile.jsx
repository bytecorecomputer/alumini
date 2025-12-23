import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../app/common/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, BookOpen, MapPin, Save, Loader2, Award, Camera, Phone, Linkedin, Github, Shield, ShieldAlert, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
    const { user, userData, role } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        displayName: '',
        headline: '',
        course: '',
        batch: '',
        company: '',
        location: '',
        bio: '',
        skills: '',
        phoneNumber: '',
        linkedin: '',
        github: ''
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                displayName: userData.displayName || '',
                headline: userData.headline || '',
                course: userData.course || '',
                batch: userData.batch || '',
                company: userData.company || '',
                location: userData.location || '',
                bio: userData.bio || '',
                skills: userData.skills ? userData.skills.join(', ') : '',
                phoneNumber: userData.phoneNumber || '',
                linkedin: userData.linkedin || '',
                github: userData.github || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }

        // Base64 logic might handle slightly larger files but let's keep it reasonable for Firestore
        if (file.size > 800 * 1024) {
            alert("Image is too large. Please upload something under 800KB for better performance.");
            return;
        }

        setUploading(true);

        try {
            // Read file as Base64 (Jugaad to bypass Firebase Storage CORS)
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64String = reader.result;

                // Update Firestore user document directly
                await updateDoc(doc(db, "users", user.uid), {
                    photoURL: base64String
                });

                alert("Profile picture updated (Simplified Upload)!");
                window.location.reload();
            };
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to update image: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setSuccess("");

        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

            await updateDoc(doc(db, "users", user.uid), {
                ...formData,
                skills: skillsArray,
                updatedAt: Date.now()
            });

            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error(err);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.displayName) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary-600" /></div>;
    }

    const displayRole = userData?.role || 'student';
    const profileImage = userData?.photoURL || null;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card bg-white overflow-hidden"
                >
                    {/* Premium Header/Cover */}
                    <div className="h-48 md:h-64 relative bg-gradient-to-br from-purple-600 via-blue-600 to-slate-900">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                        <div className="absolute -bottom-16 left-8 md:left-12 group">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white bg-slate-50 flex items-center justify-center text-slate-400 text-5xl font-black shadow-2xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    formData.displayName.charAt(0).toUpperCase()
                                )}

                                {/* Upload Overlay */}
                                <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-white h-8 w-8" />
                                    ) : (
                                        <>
                                            <Camera className="text-white mb-2" size={28} />
                                            <span className="text-white text-xs font-black uppercase tracking-widest">Update</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-8 md:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 break-words">
                                    {formData.displayName || user?.displayName || 'New Member'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider border border-slate-200">
                                        <User size={12} /> {displayRole}
                                    </div>
                                    <p className="text-slate-500 font-bold">{formData.headline || 'Add a professional headline'}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {displayRole === 'alumni' && (
                                    <span className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-700 text-sm font-black flex items-center gap-2 border border-amber-100 shadow-sm">
                                        <Award size={18} className="text-amber-500" /> Verified Alumni
                                    </span>
                                )}
                                {(displayRole === 'admin' || displayRole === 'super_admin') && (
                                    <span className="px-4 py-2 rounded-2xl bg-purple-50 text-purple-700 text-sm font-black flex items-center gap-2 border border-purple-100 shadow-sm">
                                        <Shield className="text-purple-500" size={18} /> Administrative Access
                                    </span>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* Super Admin Shield Fix */}
                            {user?.email === "coderafroj@gmail.com" && role !== 'super_admin' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-4 text-center md:text-left">
                                        <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                                            <ShieldAlert size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-red-900 font-black text-lg">Admin Access Needed</h3>
                                            <p className="text-red-600 font-bold">Your account needs to be set as Admin to manage the portal.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            if (!window.confirm("Make this account an Admin?")) return;
                                            try {
                                                await updateDoc(doc(db, "users", user.uid), { role: "super_admin" });
                                                alert("Role updated. Reloading...");
                                                window.location.reload();
                                            } catch (err) {
                                                alert("Failed: " + err.message);
                                            }
                                        }}
                                        className="w-full md:w-auto px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
                                    >
                                        Fix My Role
                                    </button>
                                </motion.div>
                            )}

                            {/* Section: Identity */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <User size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Basic Info</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Full Identity</label>
                                        <input
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 font-bold"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Professional Headline</label>
                                        <input
                                            name="headline"
                                            value={formData.headline}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 font-bold"
                                            placeholder="e.g. Senior Product Designer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Connectivity */}
                            <div className="p-8 md:p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                                        <Phone size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Social Links</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Direct Contact</label>
                                        <input
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold shadow-sm"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">LinkedIn Network</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                name="linkedin"
                                                value={formData.linkedin}
                                                onChange={handleChange}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold shadow-sm"
                                                placeholder="linkedin.com/in/handle"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">GitHub Portfolio</label>
                                        <div className="relative">
                                            <Github className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                name="github"
                                                value={formData.github}
                                                onChange={handleChange}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-purple-100 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-slate-800 font-bold shadow-sm"
                                                placeholder="github.com/handle"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Academic & Professional */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                        <BookOpen size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Work & School</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Academic Path</label>
                                        <input
                                            name="course"
                                            value={formData.course}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-slate-800 font-bold"
                                            placeholder="e.g. B.Tech Computer Science"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Graduation Class</label>
                                        <input
                                            name="batch"
                                            value={formData.batch}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-slate-800 font-bold"
                                            placeholder="Batch of 2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Current Organization</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-slate-800 font-bold"
                                                placeholder="e.g. Google India"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Base Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-slate-800 font-bold"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Narrative & Expertise */}
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 font-bold resize-none"
                                        placeholder="Write something about yourself..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Skills (Comma Separated)</label>
                                    <input
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        className="w-full px-8 py-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 font-bold"
                                        placeholder="React, Node.js, System Architecture, UI/UX..."
                                    />
                                </div>
                            </div>

                            {/* Final Actions */}
                            <div className="sticky bottom-8 left-0 right-0 flex items-center justify-between p-6 px-10 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-slate-100 shadow-2xl z-40 transform translate-y-4">
                                <div className="flex items-center gap-3">
                                    <AnimatePresence>
                                        {success && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center gap-2 text-emerald-600 font-black"
                                            >
                                                <div className="p-1.5 bg-emerald-100 rounded-full">
                                                    <Save size={14} />
                                                </div>
                                                <span className="text-sm uppercase tracking-tighter">Changes Saved</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="flex items-center gap-6">
                                    <Link
                                        to="/resume"
                                        className="hidden md:flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-all group/resume"
                                    >
                                        <FileText size={18} className="group-hover/resume:scale-110 transition-transform" />
                                        Professional Dossier
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={cn(
                                            "btn-premium px-12 py-4 flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                            loading && "animate-pulse"
                                        )}
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin h-5 w-5" />
                                        ) : (
                                            <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                        )}
                                        <span className="text-lg font-black uppercase tracking-widest">Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
