import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateTemplate from '../components/certificate/CertificateTemplate';
import {
    generateCertificateNumber,
    generateMarksheetNumber,
    saveCertificate,
    uploadToGitHub,
    calculateGrade,
    calculateDivision,
} from '../lib/certificateService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Search, Loader2 } from 'lucide-react';

export default function CertificateGenerator() {
    const navigate = useNavigate();
    const certificateRef = useRef();
    const printRef = useRef(); // Ref for the unscaled, hidden certificate

    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [studentPhoto, setStudentPhoto] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const [formData, setFormData] = useState({
        studentName: '',
        fatherName: '',
        motherName: '',
        courseName: 'DIPLOMA IN COMPUTER SOFTWARE',
        duration: 'THREE MONTH',
        marksheetNumber: generateMarksheetNumber(),
        certificateNumber: generateCertificateNumber(),
        issueDate: new Date().getFullYear().toString(),
        subjects: [
            { name: 'MS PAINT', type: 'PRACTICAL', maxMarks: 100, minMarks: 75, obtained: 0 },
            { name: 'MS WORD', type: 'PRACTICAL', maxMarks: 100, minMarks: 71, obtained: 0 },
            { name: 'MS EXCEL', type: 'WRITTEN', maxMarks: 100, minMarks: 70, obtained: 0 },
            { name: 'MS POWER POINT', type: 'VIVA', maxMarks: 100, minMarks: 75, obtained: 0 },
        ],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...formData.subjects];
        newSubjects[index][field] = field === 'obtained' ? parseInt(value) || 0 : value;
        setFormData(prev => ({
            ...prev,
            subjects: newSubjects,
        }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setStudentPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            // Search by Registration Number (Roll Number)
            const studentRef = doc(db, "students", searchQuery.trim());
            const studentSnap = await getDoc(studentRef);

            if (studentSnap.exists()) {
                const data = studentSnap.data();
                setFormData(prev => ({
                    ...prev,
                    studentName: data.fullName || '',
                    fatherName: data.fatherName || '',
                    courseName: data.course || prev.courseName,
                    marksheetNumber: data.registration || prev.marksheetNumber, // Roll Number is Registration
                    // Keep other fields or defaults
                }));
                if (data.photoUrl) {
                    setStudentPhoto(data.photoUrl);
                }
                alert("Student data found and autofilled!");
            } else {
                alert("Student not found with this Registration ID.");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Error searching for student.");
        } finally {
            setSearching(false);
        }
    };

    const calculateTotals = () => {
        const totalMarks = formData.subjects.reduce((sum, subj) => sum + subj.maxMarks, 0);
        const obtainedMarks = formData.subjects.reduce((sum, subj) => sum + subj.obtained, 0);
        const percentage = (obtainedMarks / totalMarks) * 100;
        const grade = calculateGrade(percentage);
        const division = calculateDivision(percentage);

        return { totalMarks, obtainedMarks, percentage, grade, division };
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleGeneratePDF = async () => {
        setLoading(true);
        try {
            const element = printRef.current;

            // Generate high-quality canvas
            const canvas = await html2canvas(element, {
                scale: 3, // High resolution for best quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                allowTaint: false,
            });

            // Convert to PDF (portrait A4)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: false, // Better quality
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

            // Get PDF as blob
            const pdfBlob = pdf.output('blob');
            const filename = `certificate_${formData.certificateNumber.replace(/\//g, '_')}.pdf`;

            // Download PDF IMMEDIATELY
            pdf.save(filename);

            // Upload to GitHub
            let pdfUrl = '';
            try {
                pdfUrl = await uploadToGitHub(pdfBlob, filename);
            } catch (githubError) {
                console.error("GitHub upload failed but PDF was downloaded:", githubError);
                // We might still want to save the record without URL or alert user?
                // For now, let's proceed but maybe alert?
                alert("Certificate downloaded, but cloud backup failed: " + githubError.message);
            }

            // Save certificate data to Firestore
            const totals = calculateTotals();
            await saveCertificate({
                ...formData,
                studentPhoto,
                pdfUrl,
                ...totals,
            });

            // Link Certificate to Student Profile
            if (formData.marksheetNumber) {
                try {
                    const studentRef = doc(db, "students", formData.marksheetNumber);
                    const studentSnap = await getDoc(studentRef);

                    if (studentSnap.exists()) {
                        await updateDoc(studentRef, {
                            certificate: {
                                url: pdfUrl,
                                number: formData.certificateNumber,
                                issueDate: formData.issueDate,
                                course: formData.courseName
                            },
                            status: 'pass' // Mark student as passed/alumni
                        });
                        console.log("Certificate linked to student profile");
                    }
                } catch (linkError) {
                    console.error("Failed to link certificate to student:", linkError);
                    // Non-blocking error
                }
            }

            alert('Certificate generated and saved successfully!');
            navigate('/admin/coaching');
        } catch (error) {
            console.error('Error generating certificate:', error);
            alert('Error generating certificate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-4 border-blue-600">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                                Certificate Generator
                            </h1>
                            <p className="text-slate-600">Generate professional certificates for ByteCore students</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/coaching')}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200"
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Student Search Section */}
                        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Autofill from Database</h3>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter Registration / Roll Number"
                                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-slate-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {searching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
                                </button>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                            Student Information
                        </h2>

                        <div className="space-y-4">
                            {/* Student Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Student Name *
                                </label>
                                <input
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            {/* Father Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Father/Husband Name *
                                </label>
                                <input
                                    type="text"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="Enter father/husband name"
                                    required
                                />
                            </div>

                            {/* Mother Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Mother Name *
                                </label>
                                <input
                                    type="text"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="Enter mother name"
                                    required
                                />
                            </div>

                            {/* Course Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Course Name *
                                </label>
                                <input
                                    type="text"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="e.g., DIPLOMA IN COMPUTER SOFTWARE"
                                    required
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Course Duration *
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="e.g., THREE MONTH"
                                    required
                                />
                            </div>

                            {/* Issue Date */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Issue Year *
                                </label>
                                <input
                                    type="text"
                                    name="issueDate"
                                    value={formData.issueDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="e.g., 2024-25"
                                    required
                                />
                            </div>

                            {/* Marksheet Number (Roll Number) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Roll No. / Marksheet No. *
                                </label>
                                <input
                                    type="text"
                                    name="marksheetNumber"
                                    value={formData.marksheetNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all font-mono"
                                    required
                                />
                            </div>

                            {/* Student Photo */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Student Photo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                />
                                {studentPhoto && (
                                    <img src={studentPhoto} alt="Preview" className="mt-2 w-24 h-32 object-cover border-2 border-slate-200 rounded" />
                                )}
                            </div>
                        </div>

                        {/* Subjects Section */}
                        <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                            Marks Entry
                        </h2>

                        <div className="space-y-4">
                            {formData.subjects.map((subject, index) => (
                                <div key={index} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-100">
                                    <div className="font-semibold text-slate-800 mb-2">{subject.name}</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-600 mb-1">Exam Type</label>
                                            <input
                                                type="text"
                                                value={subject.type}
                                                onChange={(e) => handleSubjectChange(index, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-600 mb-1">Obtained Marks *</label>
                                            <input
                                                type="number"
                                                value={subject.obtained}
                                                onChange={(e) => handleSubjectChange(index, 'obtained', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none text-sm font-semibold"
                                                min="0"
                                                max={subject.maxMarks}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2">
                                        Max: {subject.maxMarks} | Min: {subject.minMarks}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                            <h3 className="font-bold text-slate-800 mb-3">Summary</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-slate-600">Total Marks:</span>
                                    <span className="ml-2 font-bold text-slate-800">{totals.obtainedMarks}/{totals.totalMarks}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Percentage:</span>
                                    <span className="ml-2 font-bold text-blue-600">{totals.percentage.toFixed(2)}%</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Grade:</span>
                                    <span className="ml-2 font-bold text-green-600">{totals.grade}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Division:</span>
                                    <span className="ml-2 font-bold text-purple-600">{totals.division}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handlePreview}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg"
                            >
                                Preview Certificate
                            </button>
                            <button
                                onClick={handleGeneratePDF}
                                disabled={loading || !formData.studentName || !formData.fatherName}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Generating...' : 'Generate & Save PDF'}
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                            Live Preview
                        </h2>

                        {showPreview ? (
                            <div className="overflow-auto" style={{ maxHeight: '800px' }}>
                                <div style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%' }}>
                                    <CertificateTemplate
                                        ref={certificateRef}
                                        data={{
                                            ...formData,
                                            studentPhoto,
                                            ...totals,
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-96 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                <div className="text-center">
                                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg">Click "Preview Certificate" to see the certificate</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hidden Print Template - High Quality Capture Source */}
                <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
                    <CertificateTemplate
                        ref={printRef}
                        data={{
                            ...formData,
                            studentPhoto,
                            ...totals,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
