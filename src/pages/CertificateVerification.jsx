import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { db } from '../firebase/firestore';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Award,
    Calendar,
    BookOpen,
    XCircle,
    ChevronLeft,
    Loader2,
    Fingerprint,
    Lock,
    Download,
    Printer,
    Hash,
    CheckCircle2,
    Building2,
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
                const certHit = await findCertificateDoc(db, certId, token);

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

                // 3. Authenticated fallback (admin or logged-in student)
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
            <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-[#0b132b] to-indigo-950 flex flex-col items-center justify-center p-6 font-inter">
                <Helmet>
                    <title>Verifying Certificate | ByteCore Computer Centre</title>
                </Helmet>
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4"
                >
                    <Fingerprint className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <div className="flex items-center gap-2 text-white">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    <p className="font-black uppercase tracking-[0.2em] text-xs">
                        Verifying Credential...
                    </p>
                </div>
            </div>
        );
    }

    if (errorType) {
        const isTokenError = errorType === 'INVALID_TOKEN';
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-[#0b132b] to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden font-inter">
                <Helmet>
                    <title>
                        {isTokenError ? 'Invalid QR Token' : 'Certificate Not Found'} | ByteCore
                    </title>
                </Helmet>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-red-500/10 blur-[110px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative z-10 border border-slate-800"
                >
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto mb-5">
                        {isTokenError ? (
                            <Lock size={28} className="text-red-400" />
                        ) : (
                            <XCircle size={28} className="text-red-400" />
                        )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-white mb-2.5 tracking-tight">
                        {isTokenError ? 'Invalid Verification Token' : 'Certificate Not Found'}
                    </h1>

                    <div className="bg-slate-950/70 rounded-2xl p-3.5 mb-6 border border-slate-800">
                        <p className="text-slate-400 font-medium text-xs sm:text-sm leading-relaxed">
                            {isTokenError
                                ? 'This QR security token does not match our official record. Please scan the original QR code issued by ByteCore Computer Centre.'
                                : `No verified certificate record was found for "${certId}". Please check the Roll Number or contact ByteCore administration.`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <Link
                            to="/certificate"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex-1"
                        >
                            Lookup by Roll & DOB
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs transition-all"
                        >
                            <ChevronLeft size={15} /> Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const data = certificateData;
    const displayTitle = data.studentName || `Roll No. ${data.roll}`;
    const displayDate = data.issueDate || data.uploadedDate || 'Verified';
    const verificationRef = token
        ? `BC-${token.slice(0, 8).toUpperCase()}`
        : `BC-${String(data.roll || 'VER').toUpperCase()}`;

    const statusLabel = data.isStudentOnly
        ? 'Verified Enrolled Student'
        : data.isPendingUpload
            ? 'Verified Registration Record'
            : 'Authentic & Digitally Verified';

    const hasDistinctCertNo = Boolean(data.certificateNumber && data.certificateNumber !== data.roll);

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-[#0b132b] to-indigo-950 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-inter print:bg-white print:min-h-0 print:p-0">
            <Helmet>
                <title>Verified Credential ({data.roll}) | ByteCore Computer Centre</title>
            </Helmet>

            {/* Ambient Hero Glow */}
            <div className="absolute -top-32 right-0 w-[420px] h-[420px] bg-emerald-500/15 blur-[130px] rounded-full pointer-events-none print:hidden" />
            <div className="absolute -bottom-32 left-0 w-[420px] h-[420px] bg-blue-600/15 blur-[130px] rounded-full pointer-events-none print:hidden" />
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none print:hidden"
                style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Single-Screen Hero Verification Card */}
            <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] border border-slate-200/80 overflow-hidden relative z-10 print:shadow-none print:border-slate-300"
            >
                {/* Top Official Brand Band */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-xl p-1.5 shadow-md shrink-0">
                            <img
                                src={LOGO_SRC}
                                alt="ByteCore"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                                ByteCore Computer Centre
                            </p>
                            <p className="text-[10px] sm:text-[11px] font-semibold text-blue-300 tracking-wide truncate">
                                ISO 9001:2015 • Online Credential Verification
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        Verified
                    </div>
                </div>

                {/* Authenticity Confirmation Strip */}
                <div className="bg-emerald-50 border-b border-emerald-100 px-4 sm:px-6 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="text-[11px] sm:text-xs font-extrabold text-emerald-900 uppercase tracking-wide truncate">
                            {statusLabel}
                        </span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        {verificationRef}
                    </span>
                </div>

                {/* Main Credential Content (No Photo, No Inline Scan Image) */}
                <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                    {/* Recipient Header */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            This Credential Is Officially Verified For
                        </p>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight mt-0.5 break-words">
                            {displayTitle}
                        </h1>
                        {data.fatherName && (
                            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                                S/O, D/O, W/O:{' '}
                                <span className="text-slate-800 font-bold uppercase">
                                    {data.fatherName}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Skill / Program Banner */}
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50/75 to-slate-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
                                <BookOpen size={12} /> Certified Skill / Program
                            </p>
                            <p className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5 truncate">
                                {data.courseName || 'Computer Skill Certification'}
                            </p>
                            {data.duration && (
                                <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">
                                    Duration: {data.duration}
                                </p>
                            )}
                        </div>

                        {(data.grade || data.division || data.percentage !== null) && (
                            <div className="bg-white border border-amber-200/80 rounded-xl px-3 py-1.5 text-right shrink-0 shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                                    {data.grade ? 'Grade' : 'Score'}
                                </p>
                                <p className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                                    {data.grade || `${data.percentage.toFixed(1)}%`}
                                </p>
                                {data.percentage !== null && data.grade && (
                                    <p className="text-[10px] font-bold text-slate-500">
                                        {data.percentage.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Compact Structured Credential Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <Hash size={11} className="text-blue-600" /> Roll / ID
                            </p>
                            <p className="font-mono font-black text-slate-900 text-xs sm:text-sm mt-1 truncate">
                                {data.roll}
                            </p>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <Calendar size={11} className="text-emerald-600" />{' '}
                                {data.isStudentOnly ? 'Admitted' : 'Issued'}
                            </p>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                                {displayDate}
                            </p>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <Award size={11} className="text-amber-600" />{' '}
                                {hasDistinctCertNo ? 'Cert No.' : data.division ? 'Result' : 'Status'}
                            </p>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                                {hasDistinctCertNo
                                    ? data.certificateNumber
                                    : data.division || 'Active'}
                            </p>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <Building2 size={11} className="text-indigo-600" /> Issuer
                            </p>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                                ByteCore, Bareilly
                            </p>
                        </div>
                    </div>
                </div>

                {/* Compact Footer Bar */}
                <div className="bg-slate-50 border-t border-slate-100 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        <Lock size={13} className="text-emerald-600 shrink-0" />
                        <span>Tamper-Proof ByteCore Digital Registry</span>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                        {data.fileUrl && (
                            <button
                                type="button"
                                onClick={handleDownloadFile}
                                disabled={downloading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-wider shadow-sm transition-colors disabled:opacity-60"
                            >
                                {downloading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Download size={12} />
                                )}
                                Download
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors"
                        >
                            <Printer size={12} /> Print
                        </button>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors"
                        >
                            Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
