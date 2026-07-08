import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Calendar, BookOpen, Search, XCircle, ChevronLeft, Loader2, User } from 'lucide-react';
import logo from '../assets/format/logo.png';

export default function CertificateVerification() {
    const { certId } = useParams();
    const [loading, setLoading] = useState(true);
    const [certificateData, setCertificateData] = useState(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!certId) return;
            try {
                const q = query(collection(db, 'certificates'), where('certificateNumber', '==', certId));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setCertificateData(snapshot.docs[0].data());
                }
            } catch (error) {
                console.error("Verification Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [certId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                <p className="text-white font-black uppercase tracking-widest animate-pulse">Verifying Credentials...</p>
            </div>
        );
    }

    if (!certificateData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center relative z-10 border border-slate-100"
                >
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={50} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Record Not Found</h1>
                    <p className="text-slate-500 font-medium mb-8">The certificate number <strong>{certId}</strong> does not exist in our authentic records. It may be invalid or forged.</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all">
                        <ChevronLeft size={18} /> Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-inter">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-100"
            >
                {/* Header Header */}
                <div className="bg-slate-900 p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay"></div>
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.3 }}
                        className="w-24 h-24 mx-auto bg-white p-3 rounded-2xl shadow-xl rotate-3 relative z-10 mb-6"
                    >
                        <img src={logo} alt="Logo" className="w-full h-full object-contain -rotate-3" />
                    </motion.div>
                    
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4 relative z-10">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">100% Authentic & Verified</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter relative z-10">Credential Verification</h1>
                </div>

                {/* Content Body */}
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
                        {/* Student Photo */}
                        <div className="w-32 h-40 shrink-0 rounded-2xl overflow-hidden shadow-lg border-4 border-slate-50 bg-slate-100 flex items-center justify-center">
                            {certificateData.studentPhotoUrl ? (
                                <img src={certificateData.studentPhotoUrl} alt="Student" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-slate-300" />
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2 uppercase">{certificateData.studentName}</h2>
                            <p className="text-slate-500 font-bold mb-6">S/O, D/O: <span className="text-slate-800">{certificateData.fatherName}</span></p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-2xl">
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 mb-1">
                                        <BookOpen size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Course</span>
                                    </div>
                                    <div className="font-black text-slate-800 text-lg">{certificateData.courseName}</div>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl">
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-600 mb-1">
                                        <Award size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Grade</span>
                                    </div>
                                    <div className="font-black text-slate-800 text-lg">{certificateData.grade} ({certificateData.division})</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate No.</div>
                            <div className="font-black text-slate-800 text-sm md:text-base">{certificateData.certificateNumber}</div>
                        </div>
                        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marksheet No.</div>
                            <div className="font-black text-slate-800 text-sm md:text-base">{certificateData.marksheetNumber}</div>
                        </div>
                        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</div>
                            <div className="font-black text-slate-800 text-sm md:text-base">{certificateData.issueDate}</div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/" className="inline-block font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest text-xs transition-colors">
                            Bytecore Management System
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
