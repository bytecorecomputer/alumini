import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, orderBy, setDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../app/common/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, User, CreditCard, Calendar, MapPin, Phone,
    Filter, Download, ChevronRight, X, Check, AlertCircle,
    TrendingUp, Users, Wallet, Loader2, Edit3, Trash2, Database,
    BookOpen, Settings, BarChart3, ArrowUpRight, GraduationCap, CheckCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function CoachingAdmin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isUpdating, setIsUpdating] = useState(false);

    // Course Management States
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [courseForm, setCourseForm] = useState({ name: '', fee: '' });

    // Add/Edit Student States
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [studentForm, setStudentForm] = useState({
        registration: '', fullName: '', course: '', mobile: '',
        status: 'unpaid', totalFees: '', oldPaidFees: '', admissionDate: new Date().toISOString().split('T')[0],
        fatherName: '', address: ''
    });

    const isOwner = user?.email === 'coderafroj@gmail.com';

    useEffect(() => {
        if (!isOwner) return;

        // Real-time students listener
        const unsubStudents = onSnapshot(query(collection(db, "students"), orderBy("updatedAt", "desc")), (snap) => {
            setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        // Real-time courses listener
        const unsubCourses = onSnapshot(collection(db, "courses"), (snap) => {
            setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubStudents();
            unsubCourses();
        };
    }, [isOwner]);

    const handleSaveStudent = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const trimmedReg = studentForm.registration.trim();
            if (!trimmedReg) {
                alert("Registration Number is required!");
                setIsUpdating(false);
                return;
            }

            const studentRef = doc(db, "students", trimmedReg);

            // CHECK FOR DUPLICATES IF THIS IS A NEW ENTRY OR ID CHANGED (Though ID change logic isn't fully here yet, primarily for new admissions)
            // Since we are using the ID as the document key, we must check if it exists.
            if (!isEditing) {
                const docSnap = await getDoc(studentRef);
                if (docSnap.exists()) {
                    alert(`DUPLICATE WARNING: A student with Registration ID "${trimmedReg}" already exists!\nPlease use a unique ID.`);
                    setIsUpdating(false);
                    return;
                }
            }

            const data = {
                ...studentForm,
                registration: trimmedReg,
                updatedAt: Date.now(),
                totalFees: parseInt(studentForm.totalFees) || 0,
                oldPaidFees: parseInt(studentForm.oldPaidFees) || 0,
            };

            if (!isEditing) {
                // Initialize default fields for new students
                data.paidFees = 0;
                data.installments = [];
            }

            await setDoc(studentRef, data, { merge: true });

            setIsAddEditModalOpen(false);
            // Reset form
            setStudentForm({
                registration: '', fullName: '', course: '', mobile: '',
                status: 'unpaid', totalFees: '', oldPaidFees: '',
                admissionDate: new Date().toLocaleDateString('en-GB'),
                fatherName: '', address: ''
            });
            alert("Student saved successfully!");

        } catch (err) {
            console.error("Save Error:", err);
            alert("Failed to save student data! " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        if (!courseForm.name || !courseForm.fee) return;
        setIsUpdating(true);
        try {
            await setDoc(doc(db, "courses", courseForm.name), {
                name: courseForm.name,
                fee: parseInt(courseForm.fee),
                updatedAt: Date.now()
            });
            setCourseForm({ name: '', fee: '' });
        } catch (err) {
            alert("Failed to save course.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Delete this course?")) return;
        try {
            await deleteDoc(doc(db, "courses", id));
        } catch (err) {
            alert("Delete failed.");
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        const nextId = students.length > 0 ? (Math.max(...students.map(s => parseInt(s.registration) || 0)) + 1).toString() : "1001";
        setStudentForm({
            registration: nextId, fullName: '', course: '', mobile: '',
            status: 'unpaid', totalFees: '', oldPaidFees: '', admissionDate: new Date().toISOString().split('T')[0],
            fatherName: '', address: ''
        });
        setIsAddEditModalOpen(true);
    };

    const onCourseChange = (courseName) => {
        const selected = courses.find(c => c.name === courseName);
        setStudentForm({
            ...studentForm,
            course: courseName,
            totalFees: selected ? selected.fee : studentForm.totalFees
        });
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.registration?.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: students.length,
        collected: students.reduce((acc, s) => acc + (s.paidFees || 0) + (s.oldPaidFees || 0), 0),
        pending: students.reduce((acc, s) => acc + ((s.totalFees || 0) - ((s.paidFees || 0) + (s.oldPaidFees || 0))), 0),
        active: students.filter(s => s.status !== 'pass').length
    };

    if (!isOwner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <AlertCircle size={60} className="text-red-500 mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Access Denied</h1>
                <p className="text-slate-500 font-bold mt-2">Administrative privileges required for deep access.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdfe] pt-28 pb-20 px-4 md:px-8 font-inter">
            <div className="max-w-7xl mx-auto">

                {/* Advanced Header & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl">
                                <TrendingUp size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Bytecore <span className="text-blue-600">Coaching</span></h1>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Advanced Administration Suite</p>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Enrollments" value={stats.total} icon={<Users size={16} />} color="blue" />
                            <StatCard label="Revenue" value={`₹${stats.collected}`} icon={<Wallet size={16} />} color="emerald" />
                            <StatCard label="Arrears" value={`₹${stats.pending}`} icon={<AlertCircle size={16} />} color="amber" />
                            <StatCard label="Active" value={stats.active} icon={<ArrowUpRight size={16} />} color="indigo" />
                        </div>
                    </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <button
                            onClick={openAddModal}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus size={18} /> New Admission
                        </button>
                        <button
                            onClick={() => setIsCourseModalOpen(true)}
                            className="bg-white text-slate-900 border border-slate-100 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-all"
                        >
                            <Settings size={18} /> Course Config
                        </button>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={async () => {
                                if (!window.confirm("Initiate Global Database Sync? \nThis will merge CSV installments and enforce standard fees.")) return;
                                setIsUpdating(true);
                                try {
                                    // Small delay for UI feel
                                    await new Promise(r => setTimeout(r, 500));

                                    const response = await fetch('/src/assets/ByteCore%20%20(1).csv');
                                    if (!response.ok) throw new Error("CSV file not found");
                                    const text = await response.text();

                                    const { runMigration, applyStandardFees } = await import('../lib/migrateStudents');

                                    console.log("Starting Migration...");
                                    const migratedCount = await runMigration(text);

                                    console.log("Applying Standard Fees...");
                                    const standardizedCount = await applyStandardFees();

                                    alert(`Sync Complete!\n- Processed: ${migratedCount} students\n- Fees Standardized: ${standardizedCount} students`);
                                } catch (err) {
                                    console.error(err);
                                    alert(`Sync failed: ${err.message}`);
                                } finally {
                                    setIsUpdating(false);
                                }
                            }}
                            disabled={isUpdating}
                            className={cn(
                                "flex-1 md:flex-none p-4 rounded-2xl transition-all shadow-sm flex items-center gap-2",
                                isUpdating ? "bg-blue-100 text-blue-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                            )}
                            title="Global Database Sync"
                        >
                            {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                            <span className="md:hidden font-black text-[10px] uppercase">Sync Database</span>
                        </button>
                        <div className="relative flex-grow md:w-80 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search identity..."
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-16 pr-6 font-bold text-slate-700 outline-none focus:ring-4 ring-blue-50 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="premium-card bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Identity</th>
                                    <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden sm:table-cell">Course & Progression</th>
                                    <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Status</th>
                                    <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-24 text-center"><Loader2 size={40} className="animate-spin mx-auto text-blue-200" /></td></tr>
                                ) : filteredStudents.map(student => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                                        onClick={() => navigate(`/admin/coaching/student/${student.id}`)}
                                    >
                                        <td className="px-4 md:px-10 py-6">
                                            <div className="flex items-center gap-3 md:gap-5">
                                                <div className="h-10 w-10 md:h-14 md:w-14 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-xs shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                                    {student.registration}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-slate-900 text-sm md:text-lg tracking-tight mb-0.5 truncate">{student.fullName}</h4>
                                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{student.mobile}</p>
                                                    <div className="sm:hidden mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                                                        <BookOpen size={8} />
                                                        <span className="text-[8px] font-black uppercase">{student.course}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-10 py-6 hidden sm:table-cell">
                                            <div className="flex flex-col gap-2">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-xl w-fit">
                                                    <BookOpen size={12} className="text-blue-500" />
                                                    <span className="text-xs font-black text-slate-700">{student.course}</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-2",
                                                    student.status === 'pass' ? "text-emerald-500" : "text-amber-500"
                                                )}>{student.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-10 py-6">
                                            <div className="space-y-2 min-w-[80px]">
                                                <div className="flex justify-between text-[8px] md:text-[10px] font-black text-slate-400">
                                                    <span>₹{(student.paidFees || 0) + (student.oldPaidFees || 0)}</span>
                                                    <span className="opacity-40">/ {student.totalFees || 0}</span>
                                                </div>
                                                <div className="h-1.5 md:h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (((student.paidFees || 0) + (student.oldPaidFees || 0)) / (student.totalFees || 1)) * 100)}%` }}
                                                        className="h-full bg-blue-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 md:p-3 bg-white text-slate-400 group-hover:text-blue-600 border border-slate-100 rounded-xl transition-all shadow-sm">
                                                    <ChevronRight size={16} />
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

            {/* Course Config Modal */}
            <AnimatePresence>
                {isCourseModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsCourseModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl p-10 rounded-[3rem] shadow-2xl relative z-10 m-auto"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Course <span className="text-blue-600">Database</span></h3>
                                <button onClick={() => setIsCourseModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-950 transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSaveCourse} className="flex gap-4 mb-10 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <input placeholder="Course Name" className="flex-1 bg-white border border-slate-100 rounded-xl px-6 py-4 font-bold outline-none ring-blue-50 focus:ring-4 transition-all" value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} />
                                <input placeholder="Default Fee" type="number" className="w-40 bg-white border border-slate-100 rounded-xl px-6 py-4 font-bold outline-none ring-blue-50 focus:ring-4 transition-all" value={courseForm.fee} onChange={e => setCourseForm({ ...courseForm, fee: e.target.value })} />
                                <button type="submit" disabled={isUpdating} className="p-4 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Plus size={24} /></button>
                            </form>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {courses.map(course => (
                                    <div key={course.id} className="flex justify-between items-center p-5 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">A</div>
                                            <div>
                                                <p className="font-black text-slate-900">{course.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee: ₹{course.fee}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Student Modal */}
            <AnimatePresence>
                {isAddEditModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddEditModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white w-full max-w-2xl p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] shadow-2xl relative z-10 m-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">New <span className="text-blue-600">Enrolment</span></h3>
                                <button onClick={() => setIsAddEditModalOpen(false)} className="p-4 bg-slate-50 text-slate-400 rounded-3xl"><X size={28} /></button>
                            </div>

                            <form onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="Registration"
                                    value={studentForm.registration}
                                    onChange={v => setStudentForm({ ...studentForm, registration: v })}
                                />
                                <Input label="Full Identity Name" value={studentForm.fullName} onChange={v => setStudentForm({ ...studentForm, fullName: v })} />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Course</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-blue-50 transition-all appearance-none"
                                        value={studentForm.course}
                                        onChange={e => onCourseChange(e.target.value)}
                                    >
                                        <option value="">Select Protocol...</option>
                                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>

                                <Input label="Contact Mobile" value={studentForm.mobile} onChange={v => setStudentForm({ ...studentForm, mobile: v })} />
                                <Input label="Admission Date" type="date" value={studentForm.admissionDate} onChange={v => setStudentForm({ ...studentForm, admissionDate: v })} />
                                <Input label="Invested Course Fee (₹)" type="number" value={studentForm.totalFees} onChange={v => setStudentForm({ ...studentForm, totalFees: v })} />
                                <Input label="Old Paid Fees (Subtracted)" type="number" value={studentForm.oldPaidFees} onChange={v => setStudentForm({ ...studentForm, oldPaidFees: v })} />

                                <Input label="Father's Name" value={studentForm.fatherName} onChange={v => setStudentForm({ ...studentForm, fatherName: v })} />
                                <div className="md:col-span-2">
                                    <Input label="Home Address" value={studentForm.address} onChange={v => setStudentForm({ ...studentForm, address: v })} />
                                </div>

                                <div className="md:col-span-2 pt-6">
                                    <button
                                        disabled={isUpdating}
                                        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-slate-300 flex items-center justify-center gap-4 active:scale-98 disabled:opacity-50"
                                    >
                                        {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={24} />}
                                        Complete Entry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };
    return (
        <div className={cn("p-5 md:p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full", colors[color])}>
            <div className="flex justify-between items-center mb-4">
                <div className="opacity-40">{icon}</div>
            </div>
            <div>
                <div className="text-xl md:text-2xl xl:text-3xl font-black tracking-tighter leading-none mb-1 truncate" title={value}>
                    {value}
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-tight truncate">{label}</div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, type = "text", disabled }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={e => onChange?.(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-blue-50 transition-all placeholder:text-slate-200 disabled:opacity-50"
                placeholder="..."
            />
        </div>
    );
}
