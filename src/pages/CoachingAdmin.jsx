import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, orderBy, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, User, CreditCard, Calendar, MapPin, Phone,
    Filter, Download, ChevronRight, X, Check, AlertCircle,
    TrendingUp, Users, Wallet, Loader2, Edit3, Trash2, Database
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function CoachingAdmin() {
    const { user, role } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [studentForm, setStudentForm] = useState({
        registration: '',
        fullName: '',
        course: '',
        mobile: '',
        status: 'unpaid',
        totalFees: '',
        admissionDate: new Date().toLocaleDateString('en-GB'),
        fatherName: '',
        address: ''
    });

    const isOwner = user?.email === 'coderafroj@gmail.com';

    useEffect(() => {
        if (isOwner) fetchStudents();
    }, [isOwner]);

    const fetchStudents = async () => {
        try {
            const q = query(collection(db, "students"), orderBy("updatedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(data);
        } catch (err) {
            console.error("Error fetching students:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStudent = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const studentRef = doc(db, "students", studentForm.registration.trim());
            const data = {
                ...studentForm,
                updatedAt: Date.now(),
                totalFees: parseInt(studentForm.totalFees) || 0,
                registration: studentForm.registration.trim()
            };

            if (!isEditing) {
                data.paidFees = 0;
                data.installments = [];
            }

            await setDoc(studentRef, data, { merge: true });
            await fetchStudents();
            setIsAddEditModalOpen(false);
            setStudentForm({ registration: '', fullName: '', course: '', mobile: '', status: 'unpaid', totalFees: '', admissionDate: new Date().toLocaleDateString('en-GB'), fatherName: '', address: '' });
        } catch (err) {
            alert("Failed to save student data!");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student record? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "students", id));
            await fetchStudents();
        } catch (err) {
            alert("Delete failed!");
        }
    };

    const handleAddFee = async () => {
        if (!paymentAmount || !selectedStudent) return;
        setIsUpdating(true);
        try {
            const studentRef = doc(db, "students", selectedStudent.id);
            const amount = parseInt(paymentAmount);
            const date = new Date().toLocaleDateString('en-GB');

            await updateDoc(studentRef, {
                paidFees: (selectedStudent.paidFees || 0) + amount,
                installments: arrayUnion({ amount, date }),
                updatedAt: Date.now()
            });

            await fetchStudents();
            setIsFeeModalOpen(false);
            setPaymentAmount('');
            setSelectedStudent(null);
        } catch (err) {
            alert("Fee update failed!");
        } finally {
            setIsUpdating(false);
        }
    };

    const openEditModal = (student) => {
        setIsEditing(true);
        setStudentForm({ ...student });
        setIsAddEditModalOpen(true);
    };

    const openAddModal = () => {
        setIsEditing(false);
        const nextId = students.length > 0 ? (Math.max(...students.map(s => parseInt(s.registration) || 0)) + 1).toString() : "1001";
        setStudentForm({
            registration: nextId,
            fullName: '',
            course: '',
            mobile: '',
            status: 'unpaid',
            totalFees: '',
            admissionDate: new Date().toLocaleDateString('en-GB'),
            fatherName: '',
            address: ''
        });
        setIsAddEditModalOpen(true);
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.registration?.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (!isOwner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <AlertCircle size={60} className="text-red-500 mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Access Denied</h1>
                <p className="text-slate-500 font-bold mt-2">Only coderafroj@gmail.com can manage coaching records.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <TrendingUp size={18} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Coaching <span className="text-blue-600">Admin</span></h1>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bytecore Computer Centre Management</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-end gap-6">
                        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                            <StatCard icon={<Users size={16} />} label="Students" value={students.length} color="blue" />
                            <StatCard icon={<Wallet size={16} />} label="Total Collections" value={`₹${students.reduce((acc, s) => acc + (s.paidFees || 0), 0)}`} color="emerald" />
                            <StatCard icon={<AlertCircle size={16} />} label="Pending" value={students.filter(s => s.status !== 'pass').length} color="amber" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={async () => {
                                    if (!window.confirm("This will sync ALL data from the local 'student data.csv' to the database. Continue?")) return;
                                    setIsUpdating(true);
                                    try {
                                        // Fetch the local CSV file
                                        const response = await fetch('/src/assets/student data.csv');
                                        const text = await response.text();
                                        const { runMigration } = await import('../lib/migrateStudents');
                                        const count = await runMigration(text);
                                        alert(`Sync Complete! ${count} students migrated/updated.`);
                                        await fetchStudents();
                                    } catch (err) {
                                        alert("Sync failed. Make sure the CSV file exists in src/assets/");
                                        console.error(err);
                                    } finally {
                                        setIsUpdating(false);
                                    }
                                }}
                                disabled={isUpdating}
                                className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Database size={16} /> {isUpdating ? 'Syncing...' : 'One-Click Sync'}
                            </button>
                            <label className="cursor-pointer bg-white text-slate-900 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 flex items-center gap-3 hover:bg-slate-50 transition-all border border-slate-100">
                                <Download size={16} className="rotate-180" />
                                {isUpdating ? 'Importing...' : 'Import CSV'}
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setIsUpdating(true);
                                            try {
                                                const reader = new FileReader();
                                                reader.onload = async (event) => {
                                                    const text = event.target.result;
                                                    const { runMigration } = await import('../lib/migrateStudents');
                                                    const count = await runMigration(text);
                                                    alert(`Successfully imported ${count} students!`);
                                                    await fetchStudents();
                                                };
                                                reader.readAsText(file);
                                            } catch (err) {
                                                alert("Failed to import CSV data.");
                                                console.error(err);
                                            } finally {
                                                setIsUpdating(false);
                                            }
                                        }
                                    }}
                                    disabled={isUpdating}
                                />
                            </label>
                            <button
                                onClick={openAddModal}
                                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                            >
                                <Plus size={16} /> New Admission
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 mb-10 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Student name or registration number..."
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-16 pr-6 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pass', 'unpaid'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterStatus === status ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Course & Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fee Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Interactions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <Loader2 size={40} className="animate-spin mx-auto text-blue-200" />
                                        </td>
                                    </tr>
                                ) : filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs">
                                                    {student.registration}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 tracking-tight">{student.fullName}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
                                                        <Phone size={10} /> {student.mobile}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="text-xs font-black text-slate-700 uppercase mb-1.5">{student.course}</div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    student.status === 'pass' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    {student.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="w-full max-w-[120px]">
                                                <div className="flex justify-between text-[9px] font-black uppercase mb-1 text-slate-400">
                                                    <span>Paid: ₹{student.paidFees || 0}</span>
                                                    <span>₹{student.totalFees || 0}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(100, ((student.paidFees || 0) / (student.totalFees || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedStudent(student); setIsFeeModalOpen(true); }}
                                                    title="Add Payment"
                                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
                                                >
                                                    <CreditCard size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    title="Edit Profile"
                                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    title="Delete Student"
                                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Student Modal */}
            <AnimatePresence>
                {isAddEditModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddEditModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative z-10 m-auto"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                                        {isEditing ? 'Edit' : 'New'} <span className="text-blue-600">Student</span>
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Admission Management</p>
                                </div>
                                <button onClick={() => setIsAddEditModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Registration ID" value={studentForm.registration} disabled={isEditing}
                                    onChange={v => setStudentForm({ ...studentForm, registration: v })} />
                                <FormInput label="Full Name" value={studentForm.fullName}
                                    onChange={v => setStudentForm({ ...studentForm, fullName: v })} />
                                <FormInput label="Course Name" value={studentForm.course}
                                    onChange={v => setStudentForm({ ...studentForm, course: v })} />
                                <FormInput label="Mobile Number" value={studentForm.mobile}
                                    onChange={v => setStudentForm({ ...studentForm, mobile: v })} />
                                <FormInput label="Father's Name" value={studentForm.fatherName}
                                    onChange={v => setStudentForm({ ...studentForm, fatherName: v })} />
                                <FormInput label="Admission Date" value={studentForm.admissionDate}
                                    onChange={v => setStudentForm({ ...studentForm, admissionDate: v })} />
                                <FormInput label="Total Course Fee (₹)" type="number" value={studentForm.totalFees}
                                    onChange={v => setStudentForm({ ...studentForm, totalFees: v })} />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        value={studentForm.status}
                                        onChange={e => setStudentForm({ ...studentForm, status: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/10 focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="pass">Pass (Cleared)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Address</label>
                                    <textarea
                                        value={studentForm.address}
                                        onChange={e => setStudentForm({ ...studentForm, address: e.target.value })}
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/10 focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        disabled={isUpdating}
                                        className="w-full btn-premium bg-slate-900 text-white rounded-2xl py-5 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                    >
                                        {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">{isEditing ? 'Update Records' : 'Complete Admission'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Fee Payment Modal */}
            <AnimatePresence>
                {isFeeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsFeeModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative z-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Pay <span className="text-blue-600">Fees</span></h3>
                                <button onClick={() => setIsFeeModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Collecting for</div>
                                    <div className="text-lg font-black text-slate-900">{selectedStudent?.fullName}</div>
                                    <div className="text-xs font-bold text-slate-500 mt-1">{selectedStudent?.course} • ID: {selectedStudent?.registration}</div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Installment Amount (₹)</label>
                                    <div className="relative">
                                        <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            placeholder="Enter amount..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 font-black text-xl text-slate-900 outline-none focus:ring-4 ring-blue-500/10 focus:bg-white focus:border-blue-200 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={isUpdating}
                                    onClick={handleAddFee}
                                    className="w-full btn-premium bg-blue-600 text-white rounded-2xl py-5 shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Confirm Receipt</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FormInput({ label, value, onChange, type = "text", disabled = false }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/10 focus:bg-white disabled:opacity-50 transition-all"
            />
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };

    return (
        <div className={cn("p-6 rounded-3xl border shadow-sm", colors[color])}>
            <div className="flex items-center justify-between mb-4">
                <div className="opacity-60">{icon}</div>
            </div>
            <div className="text-2xl font-black tracking-tighter leading-none">{value}</div>
            <div className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">{label}</div>
        </div>
    );
}
