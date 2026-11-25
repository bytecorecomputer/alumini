import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    UploadCloud,
    CheckCircle2,
    FileImage,
    ShieldCheck,
    Loader2,
    ArrowLeft,
    X,
    Key,
    Eye,
    EyeOff,
    Calendar,
    QrCode,
    ExternalLink,
    User,
    BookOpen,
    Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { useGithubUpload } from '../hooks/useGithubUpload';
import { db } from '../firebase/firestore';
import {
    buildVerifyUrl,
    findCertificateDoc,
    findStudentDoc,
    formatVerificationDate,
    generateVerificationToken,
    getTodayDisplayDate,
    getTodayISODate,
    normalizeIdentifier,
} from '../lib/certificateVerificationUtils';

const HAS_ENV_GITHUB_TOKEN = Boolean(import.meta.env.VITE_GITHUB_TOKEN);

export default function AdminCertificateUpload() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [dob, setDob] = useState('');
    const [studentName, setStudentName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [grade, setGrade] = useState('');
    const [issueDateISO, setIssueDateISO] = useState(() => getTodayISODate());
    const [studentPhotoUrl, setStudentPhotoUrl] = useState('');
    const [lookingUp, setLookingUp] = useState(false);
    const [autofilledFrom, setAutofilledFrom] = useState('');

    const [token, setToken] = useState(() => sessionStorage.getItem('gh_vault_token') || '');
    const [showToken, setShowToken] = useState(false);

    const { uploadFile } = useGithubUpload();

    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [uploadedResult, setUploadedResult] = useState(null);

    const handleTokenChange = (val) => {
        setToken(val);
        sessionStorage.setItem('gh_vault_token', val);
    };

    const lookupStudentDetails = useCallback(async (rollValue) => {
        const clean = normalizeIdentifier(rollValue);
        if (!clean || clean.length < 2) return;

        setLookingUp(true);
        try {
            const [certHit, studentHit] = await Promise.all([
                findCertificateDoc(db, clean),
                findStudentDoc(db, clean),
            ]);

            if (studentHit?.data) {
                const s = studentHit.data;
                setStudentName((prev) => prev || s.fullName || s.name || '');
                setFatherName((prev) => prev || s.fatherName || s.father || '');
                setCourseName((prev) => prev || s.course || s.trade || '');
                setStudentPhotoUrl(s.photoUrl || '');
                setAutofilledFrom('Student Registry');
            } else if (certHit?.data) {
                const c = certHit.data;
                setStudentName((prev) => prev || c.studentName || '');
                setFatherName((prev) => prev || c.fatherName || '');
                setCourseName((prev) => prev || c.courseName || '');
                setStudentPhotoUrl(c.studentPhotoUrl || c.studentPhoto || '');
                setAutofilledFrom('Existing Certificate');
            } else {
                setAutofilledFrom('');
            }
        } catch (err) {
            console.warn('Auto-lookup skipped:', err);
        } finally {
            setLookingUp(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (
            !selected.type.match('image/jpeg') &&
            !selected.type.match('image/png') &&
            !selected.type.match('image/webp') &&
            !selected.type.match('application/pdf')
        ) {
            setStatus({ type: 'error', message: 'Only JPG, PNG, WEBP and PDF files are allowed.' });
            return;
        }
        if (selected.size > 10 * 1024 * 1024) {
            setStatus({ type: 'error', message: 'File is too large (max 10MB).' });
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
        setStatus({ type: '', message: '' });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            handleFileChange({ target: { files: [droppedFile] } });
        }
    };

    const clearForm = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
        setRollNo('');
        setDob('');
        setStudentName('');
        setFatherName('');
        setCourseName('');
        setGrade('');
        setStudentPhotoUrl('');
        setAutofilledFrom('');
        setIssueDateISO(getTodayISODate());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setUploadedResult(null);

        const cleanRoll = normalizeIdentifier(rollNo);
        const cleanDob = normalizeIdentifier(dob);

        if (!file || !cleanRoll || !cleanDob) {
            setStatus({
                type: 'error',
                message: 'Please provide Roll Number, Date of Birth, and select a certificate file.',
            });
            return;
        }

        setIsUploading(true);

        try {
            // 1. Upload certificate file to GitHub Vault
            const downloadURL = await uploadFile(file, cleanRoll, token.trim() || null);

            // 2. Resolve date & enrich student metadata if not manually filled
            const chosenISO = issueDateISO || getTodayISODate();
            const issueDateDisplay = formatVerificationDate(chosenISO) || getTodayDisplayDate();
            const todayISO = getTodayISODate();
            const todayDisplay = getTodayDisplayDate();

            let resolvedName = studentName.trim();
            let resolvedFather = fatherName.trim();
            let resolvedCourse = courseName.trim();
            let resolvedPhoto = studentPhotoUrl;

            const [existingCert, studentHit] = await Promise.all([
                findCertificateDoc(db, cleanRoll),
                !resolvedName || !resolvedCourse || !resolvedFather
                    ? findStudentDoc(db, cleanRoll)
                    : Promise.resolve(null),
            ]);

            if (studentHit?.data) {
                resolvedName = resolvedName || studentHit.data.fullName || studentHit.data.name || '';
                resolvedFather = resolvedFather || studentHit.data.fatherName || studentHit.data.father || '';
                resolvedCourse = resolvedCourse || studentHit.data.course || studentHit.data.trade || '';
                resolvedPhoto = resolvedPhoto || studentHit.data.photoUrl || '';
            }

            const verificationToken =
                existingCert?.data?.verificationToken || generateVerificationToken();

            const payload = {
                roll: cleanRoll,
                rollNormalized: cleanRoll.toUpperCase(),
                dob: cleanDob,
                link: downloadURL,
                studentName: resolvedName || existingCert?.data?.studentName || '',
                fatherName: resolvedFather || existingCert?.data?.fatherName || '',
                courseName: resolvedCourse || existingCert?.data?.courseName || '',
                studentPhotoUrl: resolvedPhoto || existingCert?.data?.studentPhotoUrl || '',
                grade: grade.trim() || existingCert?.data?.grade || '',
                issueDate: issueDateDisplay,
                issueDateISO: chosenISO,
                uploadedDate: todayDisplay,
                uploadedDateISO: todayISO,
                uploadedAt: serverTimestamp(),
                verificationToken,
                status: 'verified',
                updatedAt: serverTimestamp(),
            };

            if (existingCert?.ref) {
                await updateDoc(existingCert.ref, payload);
            } else {
                await addDoc(collection(db, 'certificates'), {
                    ...payload,
                    createdAt: serverTimestamp(),
                });
            }

            // Link certificate & token to student doc if it exists
            try {
                const targetStudentRef =
                    studentHit?.ref || doc(db, 'students', cleanRoll);
                const snap = studentHit ? { exists: () => true } : await getDoc(targetStudentRef);
                if (snap.exists()) {
                    await updateDoc(targetStudentRef, {
                        certificate: {
                            url: downloadURL,
                            number: cleanRoll,
                            issueDate: issueDateDisplay,
                            course: resolvedCourse || '',
                        },
                        verificationToken,
                    });
                }
            } catch (linkErr) {
                console.warn('Non-blocking student link notice:', linkErr?.message);
            }

            const verifyUrl = buildVerifyUrl(cleanRoll, verificationToken);
            setUploadedResult({
                roll: cleanRoll,
                studentName: resolvedName,
                issueDate: issueDateDisplay,
                verificationToken,
                verifyUrl,
                verifyPath: `/verify/${encodeURIComponent(cleanRoll)}?t=${encodeURIComponent(verificationToken)}`,
            });

            setStatus({
                type: 'success',
                message: `Certificate uploaded & verified for Roll No. ${cleanRoll} (${issueDateDisplay}).`,
            });
            clearForm();
        } catch (err) {
            console.error('Vault deployment failed:', err);
            const isAuthError =
                err.message?.includes('Bad credentials') ||
                err.message?.includes('401') ||
                err.message?.includes('Authentication');
            setStatus({
                type: 'error',
                message: isAuthError
                    ? 'Authentication Failed: Please ensure your GitHub Secret Token is valid and has "repo" scope.'
                    : err.message || 'Deployment failed. Check your connection.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const hasToken = Boolean(token.trim() || HAS_ENV_GITHUB_TOKEN);

    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-16 px-4 relative flex flex-col items-center selection:bg-indigo-500/30">
            <Helmet>
                <title>Upload Certificate | Admin Panel</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <main className="w-full max-w-2xl relative z-10 flex flex-col items-center">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="text-center mb-8 w-full"
                >
                    <div className="flex items-center justify-between mb-6 w-full gap-3 flex-wrap">
                        <Link
                            to="/admin/dashboard"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Admin Dashboard
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/admin/qr-generator"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-full transition-colors"
                            >
                                <QrCode size={14} className="text-blue-400" /> QR Generator
                            </Link>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-full">
                                <ShieldCheck size={14} /> Vault Ready
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3 text-left w-full">
                        Upload & Verify{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-300">
                            Certificate
                        </span>
                    </h1>
                    <p className="text-slate-400 text-left w-full text-sm md:text-base">
                        Upload student diplomas with automatic issue date stamping & instant QR verification readiness.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="w-full bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Secret Token Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                                    <Key size={10} /> GitHub Secret Token{' '}
                                    {HAS_ENV_GITHUB_TOKEN ? '(Optional — Env Configured)' : '(Active Session)'}
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    value={token}
                                    onChange={(e) => handleTokenChange(e.target.value)}
                                    placeholder={
                                        HAS_ENV_GITHUB_TOKEN
                                            ? 'Using configured env token (or paste override)'
                                            : 'Enter your ghp_... token here'
                                    }
                                    disabled={isUploading}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm placeholder:text-slate-600 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Primary Required Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                                    <span>Roll Number *</span>
                                    {lookingUp && <Loader2 size={11} className="animate-spin text-blue-400" />}
                                </label>
                                <input
                                    type="text"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    onBlur={() => lookupStudentDetails(rollNo)}
                                    placeholder="e.g. 1044"
                                    disabled={isUploading}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-600 disabled:opacity-50 uppercase"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="text"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                    disabled={isUploading}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-600 disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <Calendar size={10} /> Upload / Issue Date
                                </label>
                                <input
                                    type="date"
                                    value={issueDateISO}
                                    onChange={(e) => setIssueDateISO(e.target.value)}
                                    disabled={isUploading}
                                    className="w-full bg-slate-950 border border-emerald-500/30 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-sm disabled:opacity-50 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Student Metadata for Public QR Verification Display */}
                        <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-blue-400" />
                                    QR Verification Details (Shown on Scan)
                                </span>
                                <div className="flex items-center gap-2">
                                    {autofilledFrom && (
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                            Loaded from {autofilledFrom}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => lookupStudentDetails(rollNo)}
                                        disabled={!rollNo.trim() || lookingUp}
                                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 disabled:opacity-40 transition-colors"
                                    >
                                        Auto-Fill
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        placeholder="Student Name (e.g. Rahul Kumar)"
                                        disabled={isUploading}
                                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={fatherName}
                                        onChange={(e) => setFatherName(e.target.value)}
                                        placeholder="Father's Name (optional)"
                                        disabled={isUploading}
                                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="relative">
                                    <BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        placeholder="Course (e.g. ADCA, MDCA, DCA)"
                                        disabled={isUploading}
                                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 uppercase"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        placeholder="Grade / Result (e.g. A+ or Pass)"
                                        disabled={isUploading}
                                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                Certificate File (JPG, PNG, WEBP, PDF) *
                            </label>

                            {!file ? (
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className="w-full h-44 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl bg-slate-950/40 flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden"
                                >
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png, image/webp, application/pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        disabled={isUploading}
                                    />
                                    <div className="w-12 h-12 bg-slate-800 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-400 rounded-full flex items-center justify-center mb-3 transition-colors">
                                        <UploadCloud size={22} />
                                    </div>
                                    <p className="text-white font-bold text-sm mb-1">Upload Certificate File</p>
                                    <p className="text-slate-500 text-xs font-medium">Drag & drop or click to browse (max 10MB)</p>
                                </div>
                            ) : (
                                <div className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-14 h-14 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shrink-0">
                                            {file.type.includes('image') ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <FileImage size={22} className="text-indigo-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-sm truncate">{file.name}</p>
                                            <p className="text-slate-500 text-xs font-medium">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>

                                    {!isUploading && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFile(null);
                                                if (previewUrl) URL.revokeObjectURL(previewUrl);
                                                setPreviewUrl('');
                                            }}
                                            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors shrink-0"
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
                                    className={`text-sm font-medium rounded-2xl p-4 space-y-3 ${
                                        status.type === 'error'
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                                            : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {status.type === 'error' ? (
                                            <X size={18} className="shrink-0" />
                                        ) : (
                                            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                                        )}
                                        <span>{status.message}</span>
                                    </div>

                                    {uploadedResult && status.type === 'success' && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/qr-generator?roll=${encodeURIComponent(uploadedResult.roll)}`
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors"
                                            >
                                                <QrCode size={14} /> Generate QR with Logo
                                            </button>
                                            <Link
                                                to={uploadedResult.verifyPath}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
                                            >
                                                <ExternalLink size={14} /> Preview Verify Page
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Upload Button */}
                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isUploading || !file || !rollNo.trim() || !dob.trim() || !hasToken}
                                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 text-white font-black uppercase tracking-widest text-sm rounded-xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-45 disabled:grayscale active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Uploading & Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={18} />
                                        <span>Upload & Activate Certificate</span>
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
