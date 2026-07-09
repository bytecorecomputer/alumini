import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firestore';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { QrCode, Search, Download, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function AdminQRGenerator() {
    const navigate = useNavigate();
    const [rollNo, setRollNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [certData, setCertData] = useState(null);
    const qrRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!rollNo.trim()) return toast.error("Please enter a Roll Number");

        setLoading(true);
        setCertData(null);
        try {
            const q = query(collection(db, 'certificates'), where('roll', '==', rollNo.trim().toUpperCase()));
            const snap = await getDocs(q);
            
            let docSnap = null;
            let isStudentFallback = false;

            if (snap.empty) {
                // Try case sensitive just in case
                const q2 = query(collection(db, 'certificates'), where('roll', '==', rollNo.trim()));
                const snap2 = await getDocs(q2);
                if (snap2.empty) {
                    // Fallback to students collection
                    const qStudent = query(collection(db, 'students'), where('registration', '==', rollNo.trim().toUpperCase()));
                    const snapStudent = await getDocs(qStudent);
                    if (snapStudent.empty) {
                        const qStudent2 = query(collection(db, 'students'), where('registration', '==', rollNo.trim()));
                        const snapStudent2 = await getDocs(qStudent2);
                        if (snapStudent2.empty) {
                            toast.error("No record found in Certificates or Students database");
                            return;
                        }
                        docSnap = snapStudent2.docs[0];
                        isStudentFallback = true;
                    } else {
                        docSnap = snapStudent.docs[0];
                        isStudentFallback = true;
                    }
                } else {
                    docSnap = snap2.docs[0];
                }
            } else {
                docSnap = snap.docs[0];
            }

            let data = docSnap.data();

            // Retroactively generate and save verificationToken if it doesn't exist
            if (!data.verificationToken) {
                const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await updateDoc(docSnap.ref, { verificationToken: token });
                data.verificationToken = token;
            }

            if (isStudentFallback) {
                setCertData({ ...data, roll: data.registration, studentName: data.fullName });
            } else {
                setCertData(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch certificate");
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = async () => {
        if (!qrRef.current || !certData) return;
        
        try {
            const canvas = await html2canvas(qrRef.current, { scale: 4 });
            const url = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `QR_${certData.studentName}_${certData.roll}.png`;
            link.href = url;
            link.click();
            toast.success("QR Code Downloaded!");
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Failed to download QR code");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter pb-20">
            {/* Header */}
            <div className="bg-slate-900 text-white pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <button 
                        onClick={() => navigate('/admin/dashboard')} 
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Admin Dashboard
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <QrCode size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">QR Generator</h1>
                            <p className="text-blue-400 font-bold mt-2">Generate secure, standalone QR codes for physical diplomas.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-12">
                    
                    {/* Search Section */}
                    <div className="flex-1">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Search size={20} className="text-blue-600" /> Find Student
                        </h2>
                        
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Student Roll Number</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. BYT-2024-001"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-lg text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all uppercase"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                                {loading ? 'Searching...' : 'Search Record'}
                            </button>
                        </form>

                        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <h3 className="font-bold text-blue-900 mb-2">How it works</h3>
                            <p className="text-blue-700 text-sm">Enter the student's exact Roll Number. The system will securely locate their certificate ID and generate an unguessable QR Code. When scanned, it will open their verified digital record.</p>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8">
                        {!certData ? (
                            <div className="text-center text-slate-400 flex flex-col items-center">
                                <QrCode size={60} className="mb-4 opacity-50" />
                                <p className="font-bold">QR will appear here</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                {/* The area to capture */}
                                <div 
                                    ref={qrRef} 
                                    className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 flex flex-col items-center gap-4 relative overflow-hidden"
                                    style={{ minWidth: '300px' }}
                                >
                                    {/* Verification Badge */}
                                    <div className="absolute top-0 left-0 w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1">
                                        <CheckCircle2 size={12} className="text-emerald-400" /> 100% Verified
                                    </div>
                                    
                                    <div className="mt-6">
                                        <QRCodeCanvas
                                            value={`${window.location.origin}/verify/${certData.roll}?t=${certData.verificationToken}`}
                                            size={200}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    
                                    <div className="text-center w-full mt-2">
                                        <h3 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{certData.studentName}</h3>
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Scan to Verify Record</p>
                                        <div className="h-px w-full bg-slate-200 my-3"></div>
                                        <p className="text-[10px] font-black text-slate-400">BYTECORE INSTITUTE OF IT</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={downloadQR}
                                    className="mt-8 w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} /> Download High-Res QR
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
