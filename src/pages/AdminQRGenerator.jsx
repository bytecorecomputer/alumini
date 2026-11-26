import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { db } from '../firebase/firestore';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import {
    QrCode,
    Search,
    Download,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Copy,
    Check,
    ExternalLink,
    Sparkles,
    ShieldCheck,
    UploadCloud,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
    buildVerifyUrl,
    findCertificateDoc,
    findInDiplomaArchive,
    findStudentDoc,
    generateVerificationToken,
    getTodayDisplayDate,
    getTodayISODate,
    normalizeCertificateRecord,
    normalizeIdentifier,
} from '../lib/certificateVerificationUtils';

const LOGO_PATH = '/logo.png';

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export default function AdminQRGenerator() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRoll = searchParams.get('roll') || '';

    const [rollNo, setRollNo] = useState(initialRoll);
    const [optionalName, setOptionalName] = useState('');
    const [loading, setLoading] = useState(false);
    const [exportingCard, setExportingCard] = useState(false);
    const [certData, setCertData] = useState(null);
    const [copied, setCopied] = useState(false);

    // Hidden high-res QR canvas used as the crisp raster source for PNG exports
    const exportQrWrapperRef = useRef(null);

    const resolveAndGenerate = useCallback(
        async (rawInput) => {
            const cleanRoll = normalizeIdentifier(rawInput);
            if (!cleanRoll) {
                toast.error('Please enter a Roll Number');
                return;
            }

            setLoading(true);
            try {
                const [certHit, studentHit] = await Promise.all([
                    findCertificateDoc(db, cleanRoll),
                    findStudentDoc(db, cleanRoll),
                ]);
                const archiveHit = findInDiplomaArchive(cleanRoll);

                let finalRecord = null;
                let sourceLabel = 'Certificate Vault';

                if (certHit) {
                    const data = certHit.data;
                    const token =
                        data.verificationToken ||
                        studentHit?.data?.verificationToken ||
                        generateVerificationToken();
                    const patch = {};
                    if (!data.verificationToken) patch.verificationToken = token;
                    if (!data.rollNormalized) patch.rollNormalized = cleanRoll.toUpperCase();

                    // Enrich missing public display info from student collection if available
                    if (studentHit?.data) {
                        if (!data.studentName && (studentHit.data.fullName || studentHit.data.name)) {
                            patch.studentName = studentHit.data.fullName || studentHit.data.name;
                        }
                        if (!data.fatherName && (studentHit.data.fatherName || studentHit.data.father)) {
                            patch.fatherName = studentHit.data.fatherName || studentHit.data.father;
                        }
                        if (!data.courseName && (studentHit.data.course || studentHit.data.trade)) {
                            patch.courseName = studentHit.data.course || studentHit.data.trade;
                        }
                        if (!data.studentPhotoUrl && studentHit.data.photoUrl) {
                            patch.studentPhotoUrl = studentHit.data.photoUrl;
                        }
                        if (!studentHit.data.verificationToken) {
                            await updateDoc(studentHit.ref, { verificationToken: token }).catch(() => {});
                        }
                    }

                    if (Object.keys(patch).length > 0) {
                        await updateDoc(certHit.ref, patch);
                    }

                    finalRecord = normalizeCertificateRecord(
                        { ...data, ...patch, verificationToken: token },
                        cleanRoll
                    );
                    sourceLabel = data.link || data.pdfUrl ? 'Certificate Vault' : 'Pre-Registered Roll';
                } else if (studentHit) {
                    const s = studentHit.data;
                    const token = s.verificationToken || generateVerificationToken();
                    const todayDisplay = getTodayDisplayDate();
                    const todayISO = getTodayISODate();

                    // Save a public verification record in `certificates` so unauthenticated phones can verify
                    const newCert = {
                        roll: s.registration || cleanRoll,
                        rollNormalized: (s.registration || cleanRoll).toUpperCase(),
                        studentName: s.fullName || s.name || optionalName.trim() || '',
                        fatherName: s.fatherName || s.father || '',
                        courseName: s.course || s.trade || '',
                        studentPhotoUrl: s.photoUrl || '',
                        link: archiveHit?.link || s.certificate?.url || '',
                        dob: archiveHit?.dob || '',
                        issueDate: s.certificate?.issueDate || todayDisplay,
                        issueDateISO: todayISO,
                        uploadedDate: todayDisplay,
                        verificationToken: token,
                        status: archiveHit?.link || s.certificate?.url ? 'verified' : 'active_student',
                        isStudentOnly: !(archiveHit?.link || s.certificate?.url),
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };

                    await addDoc(collection(db, 'certificates'), newCert);
                    if (!s.verificationToken) {
                        await updateDoc(studentHit.ref, { verificationToken: token }).catch(() => {});
                    }

                    finalRecord = normalizeCertificateRecord(newCert, cleanRoll);
                    sourceLabel = 'Student Database';
                } else if (archiveHit) {
                    const token = generateVerificationToken();
                    const todayDisplay = getTodayDisplayDate();
                    const todayISO = getTodayISODate();

                    const newCert = {
                        roll: archiveHit.roll || cleanRoll,
                        rollNormalized: (archiveHit.roll || cleanRoll).toUpperCase(),
                        dob: archiveHit.dob || '',
                        link: archiveHit.link || '',
                        studentName: optionalName.trim() || '',
                        issueDate: todayDisplay,
                        issueDateISO: todayISO,
                        uploadedDate: todayDisplay,
                        verificationToken: token,
                        source: 'archive',
                        status: 'verified',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };

                    await addDoc(collection(db, 'certificates'), newCert);
                    finalRecord = normalizeCertificateRecord(newCert, cleanRoll);
                    sourceLabel = 'Diploma Archive';
                } else {
                    // Generate QR for ANY entered roll number & register it for instant verification
                    const token = generateVerificationToken();
                    const todayDisplay = getTodayDisplayDate();
                    const todayISO = getTodayISODate();

                    const newCert = {
                        roll: cleanRoll,
                        rollNormalized: cleanRoll.toUpperCase(),
                        studentName: optionalName.trim() || '',
                        issueDate: todayDisplay,
                        issueDateISO: todayISO,
                        uploadedDate: todayDisplay,
                        verificationToken: token,
                        status: 'registered',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };

                    await addDoc(collection(db, 'certificates'), newCert);
                    finalRecord = normalizeCertificateRecord(newCert, cleanRoll);
                    sourceLabel = 'Instant Roll Registration';
                }

                const verifyUrl = buildVerifyUrl(finalRecord.roll, finalRecord.verificationToken);
                setCertData({
                    ...finalRecord,
                    sourceLabel,
                    verifyUrl,
                    verifyPath: `/verify/${encodeURIComponent(finalRecord.roll)}?t=${encodeURIComponent(
                        finalRecord.verificationToken
                    )}`,
                });
                toast.success(`QR Ready for Roll ${finalRecord.roll}`);
            } catch (error) {
                console.error(error);
                toast.error('Failed to generate QR code. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        [optionalName]
    );

    useEffect(() => {
        if (initialRoll.trim()) {
            resolveAndGenerate(initialRoll);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        resolveAndGenerate(rollNo);
    };

    /**
     * Generates a crisp 1024x1024 PNG QR code with the ByteCore logo centered
     * on a clean rounded white plate using native HTML5 Canvas (no html2canvas).
     */
    const renderCenteredLogoQrCanvas = async (size = 1024) => {
        const sourceQrCanvas = exportQrWrapperRef.current?.querySelector('canvas');
        if (!sourceQrCanvas) throw new Error('QR canvas not ready');

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // White quiet-zone background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Draw crisp QR modules without blurring
        const padding = Math.round(size * 0.06);
        const qrArea = size - padding * 2;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sourceQrCanvas, padding, padding, qrArea, qrArea);

        // Draw center white badge & ByteCore logo
        try {
            const logoImg = await loadImage(LOGO_PATH);
            const badgeSize = Math.round(size * 0.24);
            const badgeX = Math.round((size - badgeSize) / 2);
            const badgeY = Math.round((size - badgeSize) / 2);
            const corner = Math.round(badgeSize * 0.22);

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Subtle shadow + crisp white rounded plate
            ctx.save();
            ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
            ctx.shadowBlur = Math.round(size * 0.015);
            ctx.fillStyle = '#ffffff';
            drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, corner);
            ctx.fill();
            ctx.restore();

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = Math.max(2, Math.round(size * 0.004));
            drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, corner);
            ctx.stroke();

            const logoPad = Math.round(badgeSize * 0.12);
            ctx.drawImage(
                logoImg,
                badgeX + logoPad,
                badgeY + logoPad,
                badgeSize - logoPad * 2,
                badgeSize - logoPad * 2
            );
        } catch (err) {
            console.warn('Logo overlay skipped:', err);
        }

        return canvas;
    };

    const downloadPureQrPng = async () => {
        if (!certData) return;
        try {
            const canvas = await renderCenteredLogoQrCanvas(1024);
            const url = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            const safeRoll = certData.roll.replace(/[^a-zA-Z0-9_-]/g, '_');
            link.download = `ByteCore_QR_${safeRoll}.png`;
            link.href = url;
            link.click();
            toast.success('High-Res QR PNG Downloaded!');
        } catch (err) {
            console.error('QR PNG download failed:', err);
            toast.error('Failed to download QR PNG');
        }
    };

    const downloadBrandedCardPng = async () => {
        if (!certData) return;
        setExportingCard(true);
        try {
            const qrCanvas = await renderCenteredLogoQrCanvas(760);
            const cardW = 960;
            const cardH = 1180;
            const canvas = document.createElement('canvas');
            canvas.width = cardW;
            canvas.height = cardH;
            const ctx = canvas.getContext('2d');

            // Outer white card
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cardW, cardH);

            // Top dark navy header band
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, cardW, 130);

            // Emerald accent stripe
            ctx.fillStyle = '#10b981';
            ctx.fillRect(0, 130, cardW, 8);

            // Header text
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 24px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('OFFICIALLY VERIFIED CREDENTIAL', cardW / 2, 58);

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 34px Inter, system-ui, sans-serif';
            ctx.fillText('BYTECORE COMPUTER CENTRE', cardW / 2, 102);

            // Draw QR with centered logo
            const qrX = Math.round((cardW - 760) / 2);
            ctx.drawImage(qrCanvas, qrX, 170, 760, 760);

            // Student / Roll info below QR
            ctx.fillStyle = '#0f172a';
            ctx.font = '900 40px Inter, system-ui, sans-serif';
            const titleText = certData.studentName
                ? certData.studentName.toUpperCase()
                : `ROLL NO: ${certData.roll.toUpperCase()}`;
            ctx.fillText(titleText, cardW / 2, 990);

            ctx.fillStyle = '#2563eb';
            ctx.font = 'bold 28px monospace';
            ctx.fillText(`ROLL NO: ${certData.roll.toUpperCase()}`, cardW / 2, 1040);

            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 22px Inter, system-ui, sans-serif';
            ctx.fillText('SCAN QR TO VERIFY OFFICIAL CERTIFICATE ONLINE', cardW / 2, 1105);

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 18px Inter, system-ui, sans-serif';
            ctx.fillText('bytecores.in • Nariyawal & Thiriya, Bareilly', cardW / 2, 1145);

            const url = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            const safeRoll = certData.roll.replace(/[^a-zA-Z0-9_-]/g, '_');
            link.download = `ByteCore_Card_${safeRoll}.png`;
            link.href = url;
            link.click();
            toast.success('Verification Card PNG Downloaded!');
        } catch (err) {
            console.error('Card export failed:', err);
            toast.error('Failed to download card PNG');
        } finally {
            setExportingCard(false);
        }
    };

    const copyVerifyLink = async () => {
        if (!certData?.verifyUrl) return;
        try {
            await navigator.clipboard.writeText(certData.verifyUrl);
            setCopied(true);
            toast.success('Verification link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy link');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter pb-20">
            {/* Header */}
            <div className="bg-slate-900 text-white pt-28 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest"
                        >
                            <ArrowLeft size={16} /> Admin Dashboard
                        </button>
                        <Link
                            to="/admin/certificates/upload"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                        >
                            <UploadCloud size={14} className="text-emerald-400" /> Upload Certificate
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                            <QrCode size={30} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
                                ByteCore QR Generator
                            </h1>
                            <p className="text-blue-300 font-semibold text-sm sm:text-base mt-1">
                                Enter any Roll Number to generate a crisp PNG QR code with the ByteCore logo in the center.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-2xl border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* Left: Input Form */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <Search size={18} className="text-blue-600" /> Enter Roll Number
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Student Roll / Registration No. *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1044 or BYT-2026-001"
                                        value={rollNo}
                                        onChange={(e) => setRollNo(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-lg text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Student Name (Optional for Unlisted Roll)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Auto-fills if found in database"
                                        value={optionalName}
                                        onChange={(e) => setOptionalName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-semibold text-sm text-slate-800 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-900/15"
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={18} />
                                    )}
                                    {loading ? 'Generating QR...' : 'Generate QR Code'}
                                </button>
                            </form>
                        </div>

                        <div className="mt-6 bg-blue-50/80 border border-blue-100 rounded-2xl p-5 space-y-2">
                            <h3 className="font-black text-xs uppercase tracking-widest text-blue-900 flex items-center gap-1.5">
                                <ShieldCheck size={15} className="text-blue-600" /> Smart Verification Link
                            </h3>
                            <p className="text-blue-800/80 text-xs leading-relaxed font-medium">
                                Works for every Roll Number — whether already uploaded, in Student Records, in the Archive, or newly added. Scanning the PNG opens their verified ByteCore credential page.
                            </p>
                        </div>
                    </div>

                    {/* Right: QR Preview & PNG Downloads */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 sm:p-8">
                        {!certData ? (
                            <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                                    <QrCode size={40} className="text-slate-300" />
                                </div>
                                <p className="font-bold text-slate-600">QR Preview Appears Here</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                    Enter any roll number on the left to generate a high-res PNG QR with the ByteCore logo in the center.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full max-w-md">
                                {/* Hidden High-Res QR Canvas Source for 1024px Export */}
                                <div ref={exportQrWrapperRef} className="hidden" aria-hidden="true">
                                    <QRCodeCanvas
                                        value={certData.verifyUrl}
                                        size={900}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>

                                {/* Visual Card Preview */}
                                <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col items-center w-full relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] text-center py-2 flex items-center justify-center gap-1.5">
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                        {certData.sourceLabel}
                                    </div>

                                    <div className="mt-7 p-3 bg-white rounded-2xl border border-slate-100 shadow-inner">
                                        <QRCodeCanvas
                                            value={certData.verifyUrl}
                                            size={240}
                                            level="H"
                                            includeMargin={false}
                                            imageSettings={{
                                                src: LOGO_PATH,
                                                height: 54,
                                                width: 54,
                                                excavate: true,
                                            }}
                                        />
                                    </div>

                                    <div className="text-center w-full mt-4">
                                        {certData.studentName && (
                                            <h3 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">
                                                {certData.studentName}
                                            </h3>
                                        )}
                                        <p className="font-mono font-black text-blue-600 text-sm mt-1">
                                            ROLL NO: {certData.roll}
                                        </p>
                                        {certData.courseName && (
                                            <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase">
                                                {certData.courseName}
                                            </p>
                                        )}
                                        <div className="h-px w-full bg-slate-100 my-3" />
                                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                            Scan to Verify • ByteCore Computer Centre
                                        </p>
                                    </div>
                                </div>

                                {/* Download & Utility Buttons */}
                                <div className="mt-5 w-full space-y-2.5">
                                    <button
                                        onClick={downloadPureQrPng}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <Download size={18} /> Download QR PNG (With Logo)
                                    </button>

                                    <button
                                        onClick={downloadBrandedCardPng}
                                        disabled={exportingCard}
                                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {exportingCard ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Download size={16} />
                                        )}
                                        Download Full Verification Card PNG
                                    </button>

                                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={copyVerifyLink}
                                            className="py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                        <Link
                                            to={certData.verifyPath}
                                            className="py-2.5 px-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <ExternalLink size={14} /> Open Verify Page
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
