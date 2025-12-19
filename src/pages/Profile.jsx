import { useState, useEffect } from 'react';
import { useAuth } from '../app/common/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { motion } from 'framer-motion';
import { User, Briefcase, BookOpen, MapPin, Save, Loader2, Award, Camera, Upload, Phone, Linkedin, Github } from 'lucide-react';
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

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("Image is too large. Please upload something under 2MB.");
            return;
        }

        setUploading(true);

        try {
            const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
            const { storage } = await import("../firebase/storage");

            // 1. Create storage reference
            const fileRef = ref(storage, `profile_images/${user.uid}_${Date.now()}`);

            // 2. Upload file
            const snapshot = await uploadBytes(fileRef, file);

            // 3. Get URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 4. Update Firestore user document
            await updateDoc(doc(db, "users", user.uid), {
                photoURL: downloadURL
            });

            alert("Profile picture updated!");
            window.location.reload();

        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image: " + err.message);
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
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
                {/* Header/Cover */}
                <div className="bg-primary-900 h-32 md:h-48 relative">
                    <div className="absolute -bottom-16 left-8 group">
                        <div className="h-32 w-32 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold shadow-lg overflow-hidden relative">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                formData.displayName.charAt(0).toUpperCase()
                            )}

                            {/* Upload Overlay */}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{formData.displayName || user?.displayName || 'New Member'}</h1>
                            <p className="text-gray-500 font-medium capitalize">{displayRole} • {formData.headline || 'No headline'}</p>
                        </div>
                        {displayRole === 'alumni' && (
                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-amber-200">
                                <Award size={14} /> Verified Alumni
                            </span>
                        )}
                        {displayRole === 'admin' && (
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-purple-200">
                                <Shield size={14} /> Admin
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Owner Admin Fix */}
                        {user?.email === "coderafroj@gmail.com" && role !== 'super_admin' && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center justify-between col-span-full mb-6 relative z-10">
                                <div>
                                    <h3 className="text-red-800 font-bold">Admin Access Missing?</h3>
                                    <p className="text-red-600 text-sm">Click here to force update your role to Super Admin.</p>
                                </div>
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (!window.confirm("Force update to Super Admin?")) return;
                                        try {
                                            await updateDoc(doc(db, "users", user.uid), { role: "super_admin" });
                                            alert("Success! Please refresh the page.");
                                            window.location.reload();
                                        } catch (err) {
                                            alert("Error: " + err.message);
                                        }
                                    }}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 shadow-sm"
                                >
                                    Fix My Role
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="pl-10 w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                                <input
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineer at Google"
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-blue-50 p-6 rounded-xl space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Phone size={20} className="text-primary-600" /> Contact & Socials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="+91 9876543210"
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            placeholder="linkedin.com/in/you"
                                            className="pl-10 w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                                    <div className="relative">
                                        <Github className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            name="github"
                                            value={formData.github}
                                            onChange={handleChange}
                                            placeholder="github.com/you"
                                            className="pl-10 w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic & Work */}
                        <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <BookOpen size={20} className="text-primary-600" /> Academic & Professional
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course / Degree</label>
                                    <input
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        placeholder="e.g. B.Tech Computer Science"
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch / Year</label>
                                    <input
                                        name="batch"
                                        value={formData.batch}
                                        onChange={handleChange}
                                        placeholder="e.g. 2024"
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="e.g. Microsoft"
                                            className="pl-10 w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. New York, USA"
                                            className="pl-10 w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio & Skills */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                                <input
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="Java, React, Leadership, Public Speaking"
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <div className="text-green-600 font-medium h-6">
                                {success}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "flex items-center gap-2 bg-primary-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-800 transition-all shadow-lg active:scale-95",
                                    loading && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={20} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
