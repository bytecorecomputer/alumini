import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Calendar, BookOpen, Search, XCircle, ChevronLeft, Loader2, User, AlertTriangle, Fingerprint, Lock } from 'lucide-react';
import logo from '../assets/format/logo.png';

export default function CertificateVerification() {
    const { certId } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('t');
    
    const [loading, setLoading] = useState(true);
    const [certificateData, setCertificateData] = useState(null);
    const [errorType, setErrorType] = useState(null); // 'NOT_FOUND' or 'INVALID_TOKEN'

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!certId) {
                setErrorType('NOT_FOUND');
                setLoading(false);
                return;
            }
            
            try {
                let snapshot = await getDocs(query(collection(db, 'certificates'), where('roll', '==', certId)));
                if (snapshot.empty) {
                    snapshot = await getDocs(query(collection(db, 'certificates'), where('certificateNumber', '==', certId)));
                }
                
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    // Secure Token Validation
                    if (!data.verificationToken || data.verificationToken !== token) {
                        setErrorType('INVALID_TOKEN');
                        setLoading(false);
                        return;
                    }
                    setCertificateData(data);
                    setLoading(false);
                    return;
                }
                
                // Fallback to students collection if no certificate found
                const studentSnap = await getDocs(query(collection(db, 'students'), where('registration', '==', certId)));
                if (!studentSnap.empty) {
                    const student = studentSnap.docs[0].data();
                    // Secure Token Validation
                    if (!student.verificationToken || student.verificationToken !== token) {
                        setErrorType('INVALID_TOKEN');
                        setLoading(false);
                        return;
                    }
                    
                    setCertificateData({
                        isStudentOnly: true,
                        studentName: student.fullName,
                        fatherName: student.fatherName || 'N/A',
                        courseName: student.course || 'Unknown Course',
                        studentPhotoUrl: student.photoUrl || null,
                        roll: student.registration,
                        certificateNumber: student.registration,
                        marksheetNumber: 'Off-System / Physical',
                        issueDate: student.admissionDate || 'N/A',
                        grade: 'N/A',
                        division: 'N/A'
                    });
                } else {
                    setErrorType('NOT_FOUND');
                }
            } catch (error) {
                console.error("Verification Error:", error);
                setErrorType('NOT_FOUND');
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [certId, token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    <Fingerprint className="w-20 h-20 text-blue-500/50 mb-6" />
                </motion.div>
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <p className="text-white font-black uppercase tracking-widest text-sm">Authenticating Request...</p>
                </div>
            </div>
        );
    }

    if (errorType) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
                {/* Security Grid Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl shadow-red-900/20 max-w-md w-full text-center relative z-10 border border-slate-800"
                >
                    <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                        {errorType === 'INVALID_TOKEN' ? (
                            <Lock size={40} className="text-red-500 relative z-10" />
                        ) : (
                            <XCircle size={40} className="text-red-500 relative z-10" />
                        )}
                    </div>
                    
                    <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                        {errorType === 'INVALID_TOKEN' ? 'Access Denied' : 'Record Not Found'}
                    </h1>
                    
                    <div className="bg-slate-950/50 rounded-xl p-4 mb-8 border border-slate-800">
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">
                            {errorType === 'INVALID_TOKEN' 
                                ? "Invalid security token. The URL has been tampered with or you do not have permission to view this record. Please scan the original physical QR code."
                                : `The certificate number ${certId} does not exist in our authentic records. It may be invalid or forged.`}
                        </p>
                    </div>
                    
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all w-full justify-center shadow-lg shadow-white/10">
                        <ChevronLeft size={16} /> Return to Safety
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-inter">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-400 to-blue-600 z-50"></div>
            
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-600/10 to-emerald-600/10 rounded-full blur-[100px] pointer-events-none"
            ></motion.div>

            <motion.div 
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                className="w-full max-w-3xl bg-white/5 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-blue-900/20 overflow-hidden relative z-10 border border-white/10"
            >
                {/* Watermark Logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-[120%] flex justify-center mix-blend-overlay">
                    <img src={logo} alt="Watermark" className="w-[800px] h-auto grayscale" />
                </div>

                {/* Secure Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 md:p-12 text-center relative border-b border-white/10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    >
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="text-emerald-400 font-black uppercase tracking-[0.25em] text-[10px]">Secure Verification Protocol</span>
                    </motion.div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
                        <div className="w-24 h-24 bg-white p-3 rounded-2xl shadow-2xl relative group">
                            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <img src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1">
                                ByteCore
                            </h1>
                            <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs">Official Digital Record</p>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8 md:p-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
                        {/* Student Photo with scanning effect */}
                        <div className="w-32 h-40 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-slate-900 flex items-center justify-center relative group">
                            {certificateData.studentPhotoUrl ? (
                                <>
                                    <img src={certificateData.studentPhotoUrl} alt="Student" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                                    <motion.div 
                                        animate={{ top: ['-10%', '110%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                    ></motion.div>
                                </>
                            ) : (
                                <User size={40} className="text-slate-600" />
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
                                Verified Identity
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 uppercase drop-shadow-lg">{certificateData.studentName}</h2>
                            <p className="text-slate-400 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                                <span className="text-[10px] uppercase tracking-widest">Father's Name:</span> 
                                <span className="text-white font-bold">{certificateData.fatherName}</span>
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 mb-2">
                                        <BookOpen size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Enrolled Course</span>
                                    </div>
                                    <div className="font-black text-white text-lg leading-tight">{certificateData.courseName}</div>
                                </div>
                                
                                {certificateData.isStudentOnly ? (
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl backdrop-blur-sm">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 mb-2">
                                            <ShieldCheck size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Current Status</span>
                                        </div>
                                        <div className="font-black text-emerald-400 text-lg">Active Student</div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl backdrop-blur-sm">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 mb-2">
                                            <Award size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Final Grade</span>
                                        </div>
                                        <div className="font-black text-amber-400 text-lg">{certificateData.grade} <span className="text-sm opacity-80">({certificateData.division})</span></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {certificateData.isStudentOnly ? 'Registration No.' : 'Certificate No.'}
                            </div>
                            <div className="font-mono font-black text-white text-sm md:text-base tracking-wider">{certificateData.certificateNumber}</div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {certificateData.isStudentOnly ? 'Enrollment Status' : 'Marksheet No.'}
                            </div>
                            <div className="font-mono font-black text-white text-sm md:text-base tracking-wider">
                                {certificateData.isStudentOnly ? <span className="text-emerald-400 font-inter font-bold text-sm">Verified Profile</span> : certificateData.marksheetNumber}
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {certificateData.isStudentOnly ? 'Admission Date' : 'Issue Date'}
                            </div>
                            <div className="font-black text-white text-sm md:text-base">{certificateData.issueDate}</div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/10 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <Lock size={12} className="text-emerald-400" />
                            Data Cryptographically Secured
                        </div>
                        <Link to="/" className="inline-block px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full font-bold text-white text-xs transition-colors border border-white/10">
                            Back to Bytecore HQ
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
