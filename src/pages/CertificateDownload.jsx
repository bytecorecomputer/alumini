import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/common/SEO';
import { Search, Download, FileImage, FileText, ArrowLeft, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import diplomaData from '../Diploma.json';

export default function CertificateDownload() {
    const [rollNo, setRollNo] = useState('');
    const [dob, setDob] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!rollNo.trim() || !dob.trim()) {
            setError('Please enter both Roll Number and Date of Birth.');
            return;
        }

        setIsSearching(true);

        try {
            // 1. First check Firebase Vault (for newly uploaded ones)
            const certificatesRef = collection(db, 'certificates');
            const q = query(
                certificatesRef,
                where('roll', '==', rollNo.trim()),
                where('dob', '==', dob.trim())
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Found in Firebase
                const certData = querySnapshot.docs[0].data();
                setResult({
                    roll: certData.roll,
                    dob: certData.dob,
                    link: certData.link,
                    source: 'firebase'
                });
            } else {
                // 2. Fallback to older JSON records
                const cert = diplomaData.certificates.find(
                    (c) => c.roll === rollNo.trim() && c.dob === dob.trim()
                );

                if (cert) {
                    setResult({ ...cert, source: 'archive' });
                } else {
                    setError('No certificate found with matching Roll Number and Date of Birth in any records.');
                }
            }
        } catch (err) {
            console.error("Error searching records:", err);
            setError('System error occurred while verifying the vault. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const downloadJPG = () => {
        if (!result) return;
        setIsDownloading(true);

        const isPdf = result.link.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            // Cannot download a PDF as a JPG source directly without conversion, so just open/download it
            window.open(result.link, '_blank');
            setIsDownloading(false);
            return;
        }

        // Fetch the image as a blob to force download instead of opening in new tab
        fetch(result.link)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `ByteCore_Certificate_${result.roll}.jpg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setIsDownloading(false);
            })
            .catch(err => {
                console.error('Error downloading image:', err);
                setIsDownloading(false);
                setError('Failed to download image. Try again later.');
            });
    };

    const downloadPDF = () => {
        if (!result) return;
        setIsDownloading(true);

        const isPdf = result.link.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            // It's already a PDF, just trigger download
            fetch(result.link)
                .then(res => res.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `ByteCore_Certificate_${result.roll}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    setIsDownloading(false);
                })
                .catch(err => {
                    console.error('Error downloading pdf:', err);
                    setIsDownloading(false);
                    setError('Failed to download PDF. Try again later.');
                });
            return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = result.link;

        img.onload = () => {
            try {
                // A4 size in mm is 297 x 210 for Landscape
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                // Add image to PDF, filling the A4 page
                pdf.addImage(img, 'JPEG', 0, 0, 297, 210);
                pdf.save(`ByteCore_Certificate_${result.roll}.pdf`);
                setIsDownloading(false);
            } catch (err) {
                console.error('Error composing PDF:', err);
                setIsDownloading(false);
                setError('Failed to generate PDF. Try again later.');
            }
        };

        img.onerror = () => {
            setIsDownloading(false);
            setError('Failed to load certificate image for PDF generation.');
        };
    };

    // Staggered animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-12 px-4 relative overflow-hidden flex flex-col items-center selection:bg-blue-500/30">
            <SEO
                title="Download Certificate"
                description="Securely view and download your verified ByteCore diploma and course certificates using your Roll Number and Date of Birth."
                url="https://bytecores.in/certificate"
            />

            {/* Premium Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            <main className="w-full max-w-4xl relative z-10 flex flex-col items-center">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12"
                >
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-medium transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        Download <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Certificate</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Verify your credentials and easily download your official ByteCore diplomas in high-resolution JPG or PDF formats.
                    </p>
                </motion.div>

                <div className="w-full grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">

                    {/* Search Form Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

                        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <Search className="text-blue-400" size={24} />
                            Secure Lookup
                        </h2>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Roll Number</label>
                                <input
                                    type="text"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    placeholder="e.g. 1044"
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                                <input
                                    type="text"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-700"
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isSearching}
                                className="w-full bg-white text-slate-950 hover:bg-blue-50 active:scale-[0.98] font-black uppercase tracking-widest text-sm rounded-2xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Verifying Identity...
                                    </>
                                ) : (
                                    <>
                                        Locate Record
                                        <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5 font-medium">
                                <Shield size={12} className="text-emerald-500" /> End-to-end securely verified records.
                            </p>
                        </div>
                    </motion.div>

                    {/* Results / Empty State Area */}
                    <div className="w-full h-full min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {!result && !isSearching ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-full w-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 bg-slate-900/10"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-slate-900 shadow-xl flex items-center justify-center mb-6">
                                        <FileText size={32} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Record Selected</h3>
                                    <p className="text-slate-500 max-w-xs text-sm">Enter your roll number and associated date of birth to view and download your official certificate.</p>
                                </motion.div>
                            ) : isSearching ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full w-full rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8"
                                >
                                    <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                                    <p className="text-slate-400 font-medium animate-pulse">Scanning database vault...</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="result"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group/card perspective-[1000px]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                    <motion.div variants={itemVariants} className="flex items-center justify-between mb-6 px-2">
                                        <div>
                                            <h3 className="text-white font-black text-xl tracking-tight flex items-center gap-2">
                                                <CheckCircle2 size={20} className="text-emerald-400" />
                                                Record Verified
                                            </h3>
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mt-1 font-bold">Roll: {result.roll}</p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="aspect-[1.414/1] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-800 relative group/img mb-6 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-slate-900 animate-pulse" /> {/* Loading skeleton */}
                                        {result.link.toLowerCase().endsWith('.pdf') ? (
                                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
                                                <div className="w-24 h-24 mb-4 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                                    <FileText size={48} />
                                                </div>
                                                <p className="font-bold text-lg text-white mb-2">Secure PDF Document</p>
                                                <p className="text-sm">This is a PDF certificate. Please use the download buttons below to view or save it.</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={result.link}
                                                alt={`Certificate for Roll No ${result.roll}`}
                                                className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover/img:scale-[1.02]"
                                                onLoad={(e) => e.target.previousSibling.style.display = 'none'}
                                            />
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={downloadJPG}
                                            disabled={isDownloading}
                                            className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 relative overflow-hidden group/btn"
                                        >
                                            <div className="absolute inset-0 bg-blue-500/10 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform" />
                                            <FileImage size={16} className="text-blue-400" /> JPG Source
                                        </button>

                                        <button
                                            onClick={downloadPDF}
                                            disabled={isDownloading}
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform" />
                                            <FileText size={16} className="text-white" /> PDF Document
                                        </button>
                                    </motion.div>

                                    <div className="mt-4 flex justify-center">
                                        <a href={result.link} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest underline decoration-slate-700 underline-offset-4 transition-colors">
                                            Open Original Link ↗
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>
        </div>
    );
}
