import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { db } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Award,
    Calendar,
    BookOpen,
    XCircle,
    ChevronLeft,
    Loader2,
    User,
    Fingerprint,
    Lock,
    Download,
    ExternalLink,
    FileText,
    Printer,
    Hash,
    CheckCircle2,
    Maximize2,
    X,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import {
    findCertificateDoc,
    findInDiplomaArchive,
    findStudentDoc,
    normalizeCertificateRecord,
    normalizeIdentifier,
} from '../lib/certificateVerificationUtils';

const LOGO_SRC = '/logo.png';

export default function CertificateVerification() {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const rawCertParam = params.certId || params['*'] || '';
    const certId = normalizeIdentifier(decodeURIComponent(rawCertParam));
    const token = searchParams.get('t') || '';

    const [loading, setLoading] = useState(true);
    const [certificateData, setCertificateData] = useState(null);
    const [errorType, setErrorType] = useState(null); // 'NOT_FOUND' | 'INVALID_TOKEN'
    const [zoomImage, setZoomImage] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchCertificate = async () => {
            if (!certId) {
                setErrorType('NOT_FOUND');
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorType(null);

            try {
                // 1. Primary lookup in public-readable `certificates` collection
                const certHit = await findCertificateDoc(db, certId);

                if (certHit?.data) {
                    const raw = certHit.data;
                    if (raw.verificationToken && raw.verificationToken !== token) {
                        if (!cancelled) {
                            setErrorType('INVALID_TOKEN');
                            setLoading(false);
                        }
                        return;
                    }
                    if (!cancelled) {
                        setCertificateData(normalizeCertificateRecord(raw, certId));
                        setLoading(false);
                    }
                    return;
                }

                // 2. Archive fallback (`Diploma.json`)
                const archiveHit = findInDiplomaArchive(certId);
                if (archiveHit) {
                    if (!cancelled) {
                        setCertificateData(
                            normalizeCertificateRecord(
                                { ...archiveHit, source: 'archive', status: 'verified' },
                                certId
                            )
                        );
                        setLoading(false);
                    }
                    return;
                }

                // 3. Authenticated fallback (if an admin or the student themselves is viewing)
                const studentHit = await findStudentDoc(db, certId);
                if (studentHit?.data) {
                    const s = studentHit.data;
                    if (s.verificationToken && s.verificationToken !== token) {
                        if (!cancelled) {
                            setErrorType('INVALID_TOKEN');
                            setLoading(false);
                        }
                        return;
                    }
                    if (!cancelled) {
                        setCertificateData(
                            normalizeCertificateRecord(
                                {
                                    isStudentOnly: true,
                                    studentName: s.fullName || s.name,
                                    fatherName: s.fatherName,
                                    courseName: s.course,
                                    studentPhotoUrl: s.photoUrl,
                                    roll: s.registration,
                                    certificateNumber: s.registration,
                                    issueDate: s.certificate?.issueDate || s.admissionDate,
                                    link: s.certificate?.url || '',
                                },
                                certId
                            )
                        );
                        setLoading(false);
                    }
                    return;
                }

                if (!cancelled) {
                    setErrorType('NOT_FOUND');
                }
            } catch (error) {
                console.error('Verification Error:', error);
                if (!cancelled) {
                    setErrorType('NOT_FOUND');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchCertificate();
        return () => {
            cancelled = true;
        };
    }, [certId, token]);

    const handleDownloadFile = async () => {
        if (!certificateData?.fileUrl) return;
        setDownloading(true);
        try {
            const res = await fetch(certificateData.fileUrl);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const ext = certificateData.isPdf ? 'pdf' : 'jpg';
            const safeRoll = (certificateData.roll || 'certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
            a.href = url;
            a.download = `ByteCore_Certificate_${safeRoll}.${ext}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(certificateData.fileUrl, '_blank', 'noopener,noreferrer');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 pt-28 font-inter">
                <Helmet>
                    <title>Verifying Certificate | ByteCore Computer Centre</title>
                </Helmet>
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5"
                >
                    <Fingerprint className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <div className="flex items-center gap-2.5 text-white">
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    <p className="font-black uppercase tracking-[0.2em] text-xs">
                        Verifying ByteCore Credential...
                    </p>
                </div>
            </div>
        );
    }

    if (errorType) {
        const isTokenError = errorType === 'INVALID_TOKEN';
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 pt-28 relative overflow-hidden font-inter">
                <Helmet>
                    <title>
                        {isTokenError ? 'Access Denied' : 'Certificate Not Found'} | ByteCore
                    </title>
                </Helmet>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900/90 backdrop-blur-xl p-7 sm:p-10 rounded-[2rem] shadow-2xl max-w-md w-full text-center relative z-10 border border-slate-800"
                >
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto mb-6">
                        {isTokenError ? (
                            <Lock size={34} className="text-red-400" />
                        ) : (
                            <XCircle size={34} className="text-red-400" />
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                        {isTokenError ? 'Invalid Verification Token' : 'Certificate Not Found'}
                    </h1>

                    <div className="bg-slate-950/70 rounded-2xl p-4 mb-7 border border-slate-800">
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">
                            {isTokenError
                                ? 'The security token in this link does not match our official record. Please scan the original QR code issued by ByteCore Computer Centre.'
                                : `No authentic certificate record was found for "${certId}". Please check the Roll Number or contact ByteCore administration.`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/certificate"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex-1"
                        >
                            Lookup by Roll & DOB
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs transition-all"
                        >
                            <ChevronLeft size={16} /> Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const data = certificateData;
    const displayTitle = data.studentName || `Roll No. ${data.roll}`;
    const displayDate = data.issueDate || data.uploadedDate;
    const verificationRef = token
        ? `BC-${token.slice(0, 8).toUpperCase()}`
        : `BC-${String(data.roll || 'VER').toUpperCase()}`;

    return (
        <div className="min-h-screen bg-slate-100 font-inter pb-16">
            <Helmet>
                <title>Verified Certificate ({data.roll}) | ByteCore Computer Centre</title>
            </Helmet>

            {/* Top Official Verification Navy Header */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-28 pb-28 sm:pb-32 px-4 sm:px-6 relative overflow-hidden print:bg-white print:text-slate-900 print:pt-6 print:pb-6">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[340px] bg-emerald-500/15 blur-[110px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    >
                        <ShieldCheck size={16} className="text-emerald-400" />
                        Officially Verified Credential
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-2 shadow-xl shadow-black/30 border border-white/20 shrink-0">
                            <img
                                src={LOGO_SRC}
                                alt="ByteCore Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white print:text-slate-900">
                                ByteCore Computer Centre
                            </h1>
                            <p className="text-xs sm:text-sm font-bold text-blue-300 uppercase tracking-[0.18em] mt-1">
                                Official Certificate Verification Portal • Bareilly
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Elevated Credential Document Card */}
            <div className="max-w-4xl mx-auto px-3 sm:px-6 -mt-20 sm:-mt-24 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="bg-white rounded-[1.75rem] sm:rounded-[2.25rem] shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden"
                >
                    {/* Authentic Status Strip */}
                    <div className="bg-emerald-50 border-b border-emerald-100 px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 size={18} />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wide">
                                    {data.isStudentOnly
                                        ? 'Verified Enrolled Student'
                                        : data.isPendingUpload
                                            ? 'Verified Registration Record'
                                            : '100% Authentic & Verified'}
                                </p>
                                <p className="text-[11px] font-semibold text-emerald-700">
                                    Record matched with ByteCore Digital Registry
                                </p>
                            </div>
                        </div>

                        {displayDate && (
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 shadow-sm">
                                <Calendar size={14} className="text-emerald-600" />
                                <span className="text-xs font-black">
                                    {data.isStudentOnly ? 'Admitted: ' : 'Issued: '}
                                    {displayDate}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Candidate Profile & Details */}
                    <div className="p-5 sm:p-8 md:p-10 space-y-8">
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            {/* Photo / Avatar */}
                            <div className="w-24 h-28 sm:w-28 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-md flex items-center justify-center relative">
                                {data.studentPhotoUrl ? (
                                    <img
                                        src={data.studentPhotoUrl}
                                        alt={displayTitle}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-indigo-900 flex flex-col items-center justify-center text-white">
                                        {data.studentName ? (
                                            <span className="text-3xl font-black">
                                                {data.studentName[0].toUpperCase()}
                                            </span>
                                        ) : (
                                            <User size={34} className="text-slate-300" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Name & Summary */}
                            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">
                                    <ShieldCheck size={12} /> Verified Candidate
                                </span>

                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase break-words">
                                    {displayTitle}
                                </h2>

                                {data.fatherName && (
                                    <p className="text-slate-500 text-sm font-semibold mt-1">
                                        Father&apos;s Name:{' '}
                                        <span className="text-slate-800 font-bold">{data.fatherName}</span>
                                    </p>
                                )}

                                {/* Key Info Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 text-left">
                                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                            <Hash size={12} className="text-blue-600" /> Roll Number
                                        </p>
                                        <p className="font-mono font-black text-slate-900 text-base mt-1">
                                            {data.roll}
                                        </p>
                                    </div>

                                    {data.courseName && (
                                        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
                                                <BookOpen size={12} /> Program / Course
                                            </p>
                                            <p className="font-black text-slate-900 text-base mt-1 uppercase">
                                                {data.courseName}
                                            </p>
                                        </div>
                                    )}

                                    {displayDate && (
                                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                                                <Calendar size={12} /> {data.isStudentOnly ? 'Admission Date' : 'Issue / Upload Date'}
                                            </p>
                                            <p className="font-black text-emerald-950 text-base mt-1">
                                                {displayDate}
                                            </p>
                                        </div>
                                    )}

                                    {(data.grade || data.division) && (
                                        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
                                                <Award size={12} /> Grade & Division
                                            </p>
                                            <p className="font-black text-amber-950 text-base mt-1">
                                                {data.grade || 'Verified'}
                                                {data.division ? ` (${data.division})` : ''}
                                            </p>
                                        </div>
                                    )}

                                    {data.certificateNumber && data.certificateNumber !== data.roll && (
                                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Certificate No.
                                            </p>
                                            <p className="font-mono font-bold text-slate-900 text-sm mt-1">
                                                {data.certificateNumber}
                                            </p>
                                        </div>
                                    )}

                                    {data.percentage !== null && (
                                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Overall Score
                                            </p>
                                            <p className="font-black text-slate-900 text-base mt-1">
                                                {data.percentage.toFixed(2)}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Uploaded / Generated Official Certificate Preview */}
                        {data.fileUrl ? (
                            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-4 sm:p-6 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <Award size={16} className="text-blue-600" />
                                            Official Certificate Document
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Verified digital copy stored in ByteCore Vault
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {!data.isPdf && (
                                            <button
                                                type="button"
                                                onClick={() => setZoomImage(true)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs transition-colors"
                                            >
                                                <Maximize2 size={14} /> Fullscreen
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleDownloadFile}
                                            disabled={downloading}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all disabled:opacity-60"
                                        >
                                            {downloading ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Download size={14} />
                                            )}
                                            Download
                                        </button>
                                    </div>
                                </div>

                                {data.isPdf ? (
                                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                                                <FileText size={28} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">
                                                    Verified PDF Diploma ({data.roll})
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Click to open or download the official signed PDF document.
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={data.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition-colors"
                                        >
                                            <ExternalLink size={14} /> Open PDF
                                        </a>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setZoomImage(true)}
                                        className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner cursor-zoom-in group relative"
                                    >
                                        <img
                                            src={data.fileUrl}
                                            alt={`Verified Certificate for ${displayTitle}`}
                                            className="w-full h-auto max-h-[560px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border border-blue-100 rounded-2xl bg-blue-50/60 p-5 flex items-start gap-3">
                                <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">
                                        Roll Number Verified in ByteCore Registry
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        This credential identifier ({data.roll}) is officially registered with ByteCore Computer Centre. The scanned diploma copy will appear here automatically once uploaded by administration.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Verification Proof Footer */}
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                <Lock size={14} className="text-emerald-600" />
                                <span>Verification Ref:</span>
                                <span className="font-mono font-black text-slate-800">{verificationRef}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2.5 print:hidden">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                                >
                                    <Printer size={14} /> Print Proof
                                </button>
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                                >
                                    Visit ByteCore
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Fullscreen Certificate Lightbox */}
            <AnimatePresence>
                {zoomImage && data.fileUrl && !data.isPdf && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomImage(false)}
                        className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center"
                    >
                        <button
                            type="button"
                            onClick={() => setZoomImage(false)}
                            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                            aria-label="Close fullscreen preview"
                        >
                            <X size={22} />
                        </button>
                        <img
                            src={data.fileUrl}
                            alt={`Full Certificate for ${displayTitle}`}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
