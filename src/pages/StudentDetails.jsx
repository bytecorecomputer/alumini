import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc, arrayUnion, onSnapshot, deleteDoc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, Calendar, User, Edit3, Trash2, Save, X,
    ArrowRight, TrendingUp, ShieldCheck, Wallet, History,
    GraduationCap
} from "lucide-react";
import { cn } from "../lib/utils";
import { uploadToCloudinary } from "../lib/cloudinary";
import { compressImage } from "../lib/imageCompression";

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [installmentNo, setInstallmentNo] = useState('1');
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Use onSnapshot for real-time updates on this specific student
        const unsub = onSnapshot(doc(db, "students", id), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStudent({ id: doc.id, ...data });
                setEditForm(data);
            } else {
                navigate('/admin/coaching');
            }
            setLoading(false);
        });

        return () => unsub();
    }, [id, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const newReg = editForm.registration?.trim();
            const currentReg = id;

            // 1. If Registration Number (ID) is changed, we need to MOVE the document
            if (newReg && newReg !== currentReg) {
                // Check if new ID already exists
                const newDocRef = doc(db, "students", newReg);
                const newDocSnap = await getDoc(newDocRef);

                if (newDocSnap.exists()) {
                    alert(`Error: Registration Number "${newReg}" already exists. Please choose a unique one.`);
                    setIsUpdating(false);
                    return;
                }

                if (!window.confirm(`You are about to change the Registration Number from ${currentReg} to ${newReg}.\nThis will move all student data to a new record.\n\nProceed?`)) {
                    setIsUpdating(false);
                    return;
                }

                // Copy data to new doc
                const newData = {
                    ...editForm,
                    registration: newReg,
                    updatedAt: Date.now()
                };

                await setDoc(newDocRef, newData);
                await deleteDoc(doc(db, "students", currentReg));

                alert("Registration Number updated successfully! Redirecting...");
                navigate(`/admin/coaching/student/${newReg}`, { replace: true });
                return; // Navigation will unmount component
            }

            // 2. Normal Update (Same ID)
            await updateDoc(doc(db, "students", id), {
                ...editForm,
                updatedAt: Date.now()
            });
            setIsEditing(false);
            alert("Profile updated successfully.");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddFee = async () => {
        if (!paymentAmount) return;
        setIsUpdating(true);
        try {
            const amount = parseInt(paymentAmount);
            // Format YYYY-MM-DD to DD/MM/YYYY for consistency
            const [y, m, d] = paymentDate.split('-');
            const formattedDate = `${d}/${m}/${y}`;

            await updateDoc(doc(db, "students", id), {
                paidFees: increment(amount), // Atomic increment
                installments: arrayUnion({
                    id: Date.now(), // Unique ID for this transaction
                    amount,
                    date: formattedDate,
                    installmentNo: installmentNo,
                    note: paymentNote
                }),
                updatedAt: Date.now()
            });
            setIsFeeModalOpen(false);
            setPaymentAmount('');
            setPaymentNote('');
            alert("Fee collected successfully.");
        } catch (err) {
            console.error(err);
            alert("Fee update failed.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteInstallment = async (instToDelete, index) => {
        if (!window.confirm("Are you sure you want to delete this payment record? This will reduce the total fees received.")) return;
        setIsUpdating(true);
        try {
            // Safe filter approach: 
            // If the installment has an ID, use it. If not (legacy), use index as fallback (risky but necessary for old data).
            const newInstallments = student.installments.filter((inst, i) => {
                if (instToDelete.id && inst.id) {
                    return inst.id !== instToDelete.id;
                }
                // Fallback for old data without IDs
                return i !== index;
            });

            await updateDoc(doc(db, "students", id), {
                paidFees: increment(-Math.abs(parseInt(instToDelete.amount))), // Atomic decrement
                installments: newInstallments,
                updatedAt: Date.now()
            });
        } catch (err) {
            alert("Failed to delete installment.");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!window.confirm("CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE this student? This action cannot be undone.")) return;
        setIsUpdating(true);
        try {
            await deleteDoc(doc(db, "students", id));
            navigate('/admin/coaching');
        } catch (err) {
            alert("Failed to delete student.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-600">
                    <TrendingUp size={40} />
                </motion.div>
            </div>
        );
    }

    const totalReceived = (student.paidFees || 0) + (student.oldPaidFees || 0);
    const remainingFees = Math.max(0, (student.totalFees || 0) - totalReceived);
    const rawPercentage = (totalReceived / (student.totalFees || 1)) * 100;
    const feePercentage = Math.min(100, Math.round(rawPercentage));

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 font-inter">
            <div className="max-w-6xl mx-auto px-4 md:px-8">

                {/* Back & Actions */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={() => navigate('/admin/coaching')}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={cn(
                                "p-4 rounded-2xl transition-all shadow-xl",
                                isEditing ? "bg-red-50 text-red-600 shadow-red-100" : "bg-white text-slate-900 shadow-slate-200 border border-slate-100"
                            )}
                        >
                            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Panel: Identity & Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="premium-card bg-slate-900 p-10 text-white relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 opacity-10 blur-2xl">
                                <GraduationCap size={200} />
                            </div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="h-24 w-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-900/50 ring-4 ring-white/10 overflow-hidden">
                                    {student.photoUrl ? (
                                        <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter mb-1 capitalize">{student.fullName}</h2>
                                <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-8">Registration: {student.registration}</p>

                                <div className="w-full space-y-4 text-left">
                                    <DetailRow label="Primary Course" value={student.course} isDark />
                                    <DetailRow label="Identity Contact" value={student.mobile} isDark />
                                    <DetailRow label="Admission Data" value={student.admissionDate} isDark />
                                </div>
                            </div>
                        </motion.div>

                        <div className="premium-card bg-white p-6 border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2 w-2 rounded-full", student.status === 'pass' ? "bg-emerald-500" : "bg-amber-500")} />
                                    <span className={cn(
                                        "font-black uppercase tracking-tight px-3 py-1 rounded-lg text-[10px]",
                                        student.status === 'pass' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                    )}>{student.status}</span>
                                </div>
                            </div>
                            <ShieldCheck size={24} className="text-blue-600" />
                        </div>
                    </div>

                    {/* Right Panel: Detailed Management */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Financial Overview Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card bg-white p-8 md:p-10 border border-slate-100"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Financial <span className="text-blue-600">Ledger</span></h3>
                                    <p className="text-slate-400 font-bold text-xs">Real-time revenue synchronization.</p>
                                </div>
                                <button
                                    onClick={() => setIsFeeModalOpen(true)}
                                    className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Wallet size={16} /> Collect Fee
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
                                <LedgerStat label="Total Payable" value={`₹${student.totalFees}`} color="slate" />
                                <LedgerStat label="Total Received" value={`₹${totalReceived}`} color="emerald" tooltip={`Inst: ₹${student.paidFees || 0} + Old: ₹${student.oldPaidFees || 0}`} />
                                <LedgerStat label="Current Arrears" value={`₹${remainingFees}`} color="amber" />
                            </div>

                            <div className="relative">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Realization</span>
                                    <span className="text-xl font-black text-blue-600">{feePercentage}%</span>
                                </div>
                                <div className="h-5 w-full bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner border border-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${feePercentage}%` }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Profile Edit / Display Section */}
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.form
                                    key="edit"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    onSubmit={handleUpdate}
                                    className="premium-card bg-white p-10 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8"
                                >
                                    <div className="md:col-span-2 flex justify-between items-center border-b border-slate-50 pb-6 mb-2">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Modify Student Profile</h4>
                                        <div className="flex gap-2">
                                            <button type="submit" disabled={isUpdating} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                                                <Save size={16} /> Save Changes
                                            </button>
                                        </div>
                                    </div>
                                    <EditField label="Registration (Roll Number)" value={editForm.registration} onChange={v => setEditForm({ ...editForm, registration: v })} />
                                    <EditField label="Full Name" value={editForm.fullName} onChange={v => setEditForm({ ...editForm, fullName: v })} />
                                    <EditField label="Mobile Number" value={editForm.mobile} onChange={v => setEditForm({ ...editForm, mobile: v })} />
                                    <EditField label="Course" value={editForm.course} onChange={v => setEditForm({ ...editForm, course: v })} />
                                    <EditField label="Status" value={editForm.status} type="select" options={['unpaid', 'pass']} onChange={v => setEditForm({ ...editForm, status: v })} />
                                    <EditField label="Total Fee" value={editForm.totalFees} type="number" onChange={v => setEditForm({ ...editForm, totalFees: parseInt(v) })} />
                                    <EditField label="Old Fees Received" value={editForm.oldPaidFees} type="number" onChange={v => setEditForm({ ...editForm, oldPaidFees: parseInt(v) })} />
                                    <EditField label="Father's Name" value={editForm.fatherName} onChange={v => setEditForm({ ...editForm, fatherName: v })} />
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Portrait</label>
                                        <div className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem]">
                                            <div className="h-20 w-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                                                {editForm.photoUrl ? (
                                                    <img src={editForm.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="text-slate-200" size={32} />
                                                )}
                                                {isUpdating && (
                                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                                        <TrendingUp className="animate-spin text-blue-600" size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id="edit-student-photo"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setIsUpdating(true);
                                                        try {
                                                            const compressed = await compressImage(file, 50);
                                                            const url = await uploadToCloudinary(compressed);
                                                            setEditForm({ ...editForm, photoUrl: url });
                                                        } catch (err) {
                                                            alert("Photo upload failed: " + err.message);
                                                        } finally {
                                                            setIsUpdating(false);
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="edit-student-photo"
                                                    className="inline-flex py-3 px-6 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                                                >
                                                    Select New Aesthetic
                                                </label>
                                                <p className="text-[9px] font-bold text-slate-400">Target Weight: 50KB (Auto-optimized)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <EditField label="Home Address" value={editForm.address || ''} type="textarea" onChange={v => setEditForm({ ...editForm, address: v })} />
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="md:col-span-2 mt-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex justify-between items-center">
                                        <div>
                                            <h5 className="text-red-800 font-bold uppercase tracking-widest text-xs mb-1">Danger Zone</h5>
                                            <p className="text-red-600/60 text-xs">Permanently remove this student and all associated data.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDeleteStudent}
                                            className="px-6 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Delete Student
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="premium-card bg-white p-10 border border-slate-100"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                                            <History size={20} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Transaction Timeline</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {student.installments?.map((inst, i) => (
                                            <div key={i} className="flex justify-between items-start p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-100 transition-all">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-10 w-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                                        <Wallet size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Receipt Confirmed</p>
                                                            {inst.installmentNo && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded-lg uppercase tracking-tighter">Inst. #{inst.installmentNo}</span>
                                                            )}
                                                        </div>
                                                        <p className="font-black text-slate-900 leading-none mb-2">{inst.date}</p>
                                                        {inst.note && (
                                                            <p className="text-[10px] text-slate-500 italic font-medium max-w-xs">{inst.note}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-900 tracking-tighter">₹{inst.amount}</p>
                                                    <button
                                                        onClick={() => handleDeleteInstallment(inst, i)}
                                                        className="mt-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 flex items-center justify-end gap-1 ml-auto"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!student.installments || student.installments.length === 0) && (
                                            <div className="text-center py-10 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[2rem]">
                                                No financial activity recorded.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Premium Fee Collection Modal */}
            <AnimatePresence>
                {isFeeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsFeeModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl relative z-10 border border-slate-100"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Collect <span className="text-blue-600">Payment</span></h3>
                                <button onClick={() => setIsFeeModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all"><X size={20} /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Due</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">₹{remainingFees}</p>
                                    </div>
                                    <select
                                        value={installmentNo}
                                        onChange={e => setInstallmentNo(e.target.value)}
                                        className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                            <option key={n} value={n}>Installment #{n}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Transaction Date</label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={e => setPaymentDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-blue-600 outline-none text-center cursor-pointer shadow-sm hover:border-blue-200 focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Receipt Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-5 px-8 text-2xl font-black text-center text-slate-900 focus:bg-white focus:border-blue-200 focus:ring-4 ring-blue-50 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="000.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Notes (Optional)</label>
                                    <textarea
                                        value={paymentNote}
                                        onChange={e => setPaymentNote(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-blue-50 transition-all"
                                        rows="2"
                                        placeholder="e.g. Paid via UPI / Partial payment"
                                    />
                                </div>

                                <button
                                    disabled={isUpdating || !paymentAmount}
                                    onClick={handleAddFee}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdating ? <TrendingUp className="animate-pulse" /> : <Save size={20} />}
                                    Finalize Receipt
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DetailRow({ label, value, isDark }) {
    return (
        <div className="flex items-center gap-4">
            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", isDark ? "bg-white/10 text-white/50" : "bg-slate-50 text-slate-400")}>
                <ArrowRight size={14} />
            </div>
            <div>
                <p className={cn("text-[8px] font-black uppercase tracking-widest leading-none mb-1", isDark ? "text-white/30" : "text-slate-400")}>{label}</p>
                <p className={cn("text-xs font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>{value || 'N/A'}</p>
            </div>
        </div>
    );
}

function LedgerStat({ label, value, color }) {
    const colors = {
        slate: "bg-slate-50 border-slate-100 text-slate-900",
        amber: "bg-amber-50 border-amber-100 text-amber-600",
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-600"
    };
    return (
        <div className={cn("p-6 rounded-3xl border shadow-sm", colors[color])} title={arguments[0].tooltip}>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
            <p className="text-2xl font-black tracking-tighter">{value}</p>
        </div>
    );
}

function EditField({ label, value, onChange, type = "text", options }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            {type === 'select' ? (
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-blue-50 transition-all appearance-none"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 ring-blue-50 transition-all shadow-sm"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-blue-50 transition-all"
                />
            )}
        </div>
    );
}
