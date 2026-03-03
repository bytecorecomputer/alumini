import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { UploadCloud, CheckCircle2, FileImage, ShieldCheck, Loader2, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useGithubUpload } from '../hooks/useGithubUpload';
import { db } from '../firebase/firestore';
import { Key, Eye, EyeOff } from 'lucide-react';

export default function AdminCertificateUpload() {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [dob, setDob] = useState('');
    const [token, setToken] = useState(() => sessionStorage.getItem('gh_vault_token') || '');
    const [showToken, setShowToken] = useState(false);

    const { uploadFile } = useGithubUpload();

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState({ type: '', message: '' }); // 'success' | 'error'

    // Persist token in session memory (safe - cleared on tab close)
    const handleTokenChange = (val) => {
        setToken(val);
        sessionStorage.setItem('gh_vault_token', val);
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            // Check file type
            if (!selected.type.match('image/jpeg') && !selected.type.match('image/png') && !selected.type.match('application/pdf')) {
                setStatus({ type: 'error', message: 'Only JPG, PNG and PDF files are allowed.' });
                return;
            }
            if (selected.size > 5 * 1024 * 1024) { // 5MB limit
                setStatus({ type: 'error', message: 'File is too large (max 5MB).' });
                return;
            }
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
            setStatus({ type: '', message: '' });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            // mimic file change
            handleFileChange({ target: { files: [droppedFile] } });
        }
    };

    const clearForm = () => {
        setFile(null);
        setPreviewUrl('');
        setRollNo('');
        setDob('');
        setUploadProgress(0);
        // deliberately leaving status so they see the success message
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!file || !rollNo.trim() || !dob.trim()) {
            setStatus({ type: 'error', message: 'Please provide all details and select a file.' });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // 1. Upload to GitHub Repository using Dynamic Token
            console.log("Deploying to GitHub Vault...");
            const downloadURL = await uploadFile(file, rollNo.trim(), token.trim());
            setUploadProgress(100);

            // 2. Save metadata to Firestore
            const q = query(collection(db, 'certificates'), where('roll', '==', rollNo.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, {
                    dob: dob.trim(),
                    link: downloadURL,
                    updatedAt: new Date()
                });
                setStatus({ type: 'success', message: `Certificate securely updated in Vault: ${rollNo.trim()}` });
            } else {
                await addDoc(collection(db, 'certificates'), {
                    roll: rollNo.trim(),
                    dob: dob.trim(),
                    link: downloadURL,
                    createdAt: new Date()
                });
                setStatus({ type: 'success', message: `Certificate deployed to Vault: ${rollNo.trim()}` });
            }
            clearForm();
        } catch (err) {
            console.error("Vault deployment failed:", err);
            const isAuthError = err.message?.includes('Bad credentials') || err.message?.includes('401') || err.message?.includes('Authentication');
            setStatus({
                type: 'error',
                message: isAuthError
                    ? 'Authentication Failed: Please ensure your Secret Token is valid and has "repo" scope.'
                    : (err.message || 'Deployment failed. Check your connection.')
            });
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-12 px-4 relative flex flex-col items-center selection:bg-purple-500/30">
            <Helmet>
                <title>Upload Certificate | Admin Panel</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Premium Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            <main className="w-full max-w-2xl relative z-10 flex flex-col items-center">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-10 w-full"
                >
                    <div className="flex items-center justify-between mb-8 w-full">
                        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Admin Dashboard
                        </Link>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest rounded-full">
                            <ShieldCheck size={14} /> Secured
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4 text-left w-full">
                        Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">Upload</span> System
                    </h1>
                    <p className="text-slate-400 text-left w-full text-base">
                        Deploy student certificates directly into the encrypted Firebase Vault. This instantly activates them for public verification.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Secret Token Input - Dynamic Insertion */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                                <Key size={10} /> GitHub Secret Token (Active Session)
                            </label>
                            <div className="relative group">
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={token}
                                    onChange={(e) => handleTokenChange(e.target.value)}
                                    placeholder="Enter your ghp_... token here"
                                    disabled={isUploading}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm placeholder:text-slate-800 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-purple-400 transition-colors"
                                >
                                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-500 pl-1">Token is kept in temporary session memory and cleared on close.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Roll No</label>
                                <input
                                    type="text"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    placeholder="e.g. 1044"
                                    disabled={isUploading}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-bold placeholder:text-slate-700 disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                                <input
                                    type="text"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                    disabled={isUploading}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-bold placeholder:text-slate-700 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Certificate File</label>

                            {!file ? (
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className="w-full h-48 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden"
                                >
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png, application/pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        disabled={isUploading}
                                    />
                                    <div className="w-14 h-14 bg-slate-800 group-hover:bg-purple-500/20 text-slate-400 group-hover:text-purple-400 rounded-full flex items-center justify-center mb-4 transition-colors">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-white font-bold mb-1">Upload JPG or PDF</p>
                                    <p className="text-slate-500 text-xs font-medium">Drag & drop or click to browse</p>
                                </div>
                            ) : (
                                <div className="w-full p-2 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                                            {file.type.includes('image') ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <FileImage size={24} className="text-slate-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                                            <p className="text-slate-500 text-xs font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>

                                    {!isUploading && (
                                        <button
                                            type="button"
                                            onClick={() => { setFile(null); setPreviewUrl(''); }}
                                            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors mr-2"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Status Messages */}
                        <AnimatePresence mode="wait">
                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`text-sm font-medium rounded-xl p-4 flex items-center gap-3 ${status.type === 'error'
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                        }`}
                                >
                                    {status.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Upload Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isUploading || !file || !rollNo || !dob || !token}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-sm rounded-xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale active:scale-[0.98] shadow-lg shadow-purple-600/20 relative overflow-hidden group"
                            >
                                {isUploading ? (
                                    <>
                                        <div
                                            className="absolute left-0 top-0 bottom-0 bg-white/20 animate-pulse w-full"
                                        />
                                        <Loader2 size={18} className="animate-spin relative z-10" />
                                        <span className="relative z-10">Deploying to High-Speed Vault...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={18} />
                                        Deploy Certificate
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

            </main>
        </div>
    );
}
