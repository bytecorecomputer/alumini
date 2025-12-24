import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../app/common/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Phone, MapPin, Linkedin, Github, Globe, Download,
    Briefcase, GraduationCap, Award, BookOpen, Star, FileText,
    Plus, Trash2, Edit3, Eye, Layout, ChevronRight, Save, Loader2, ArrowLeft,
    CheckCircle2, Sparkles, User, Code, Languages, Terminal
} from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Link } from 'react-router-dom';
import { getOptimizedUrl } from '../lib/cloudinary';

// --- DATA STRUCTURE ---
const INITIAL_DATA = {
    personal: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        bio: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
};

export default function Resume() {
    const { user, userData, refreshUserData } = useAuth();
    const resumeRef = useRef();
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [isEditMode, setIsEditMode] = useState(true);
    const [activeSection, setActiveSection] = useState('personal');
    const [resumeData, setResumeData] = useState(INITIAL_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'success', 'error'

    // Load data from Firebase on mount
    // Load data from Firebase on mount
    useEffect(() => {
        if (userData?.resumeData) {
            setResumeData(userData.resumeData);
        } else if (userData) {
            // Pre-fill from profile if no resume data exists
            // Map Profile Skills -> Resume Skills
            const profileSkills = Array.isArray(userData.skills) ? userData.skills :
                (userData.skills ? userData.skills.split(',').map(s => s.trim()) : []);

            // Map Profile Company -> Resume Experience
            const currentExp = userData.company ? [{
                company: userData.company,
                role: userData.headline || 'Member',
                duration: 'Present',
                description: 'Current role at ' + userData.company
            }] : [];

            // Map Profile Course -> Resume Education
            const currentEdu = userData.course ? [{
                school: 'University/College', // Default if generic
                degree: userData.course,
                year: userData.batch || 'Present',
                grade: ''
            }] : [];

            setResumeData(prev => ({
                ...prev,
                personal: {
                    ...prev.personal,
                    fullName: userData.displayName || prev.personal.fullName,
                    email: user?.email || prev.personal.email,
                    phone: userData.phoneNumber || prev.personal.phone,
                    location: userData.location || prev.personal.location,
                    linkedin: userData.linkedin || prev.personal.linkedin,
                    bio: userData.bio || prev.personal.bio,
                    photoURL: userData.photoURL || prev.personal.photoURL,
                    title: userData.headline || prev.personal.title,
                    website: userData.github ? `https://${userData.github}` : prev.personal.website
                },
                skills: profileSkills.length > 0 ? profileSkills : prev.skills,
                experience: currentExp.length > 0 ? currentExp : prev.experience,
                education: currentEdu.length > 0 ? currentEdu : prev.education
            }));
        }
    }, [userData, user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            await updateDoc(doc(db, "users", user.uid), {
                resumeData: resumeData,
                resumeLastUpdated: Date.now()
            });

            // Refresh the AuthContext userData to sync changes
            if (refreshUserData) {
                await refreshUserData();
            }

            const now = new Date();
            setLastSaved(now.toLocaleTimeString());
            setSaveStatus('success');

            // Clear success message after 3 seconds
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error("Save error:", error);
            setSaveStatus('error');
            alert("Failed to save resume data. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const updatePersonal = (field, value) => {
        setResumeData(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: value }
        }));
    };

    const addItem = (section) => {
        const newItem = section === 'experience' ? { company: '', role: '', duration: '', description: '' }
            : section === 'education' ? { school: '', degree: '', year: '', grade: '' }
                : section === 'projects' ? { name: '', link: '', description: '' }
                    : { name: '', issuer: '' };

        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], newItem]
        }));
    };

    const removeItem = (section, index) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const updateItem = (section, index, field, value) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) => i === index ? { ...item, [field]: value } : item)
        }));
    };

    const templates = {
        modern: <ModernTemplate data={resumeData} />,
        minimal: <MinimalTemplate data={resumeData} />,
        creative: <CreativeTemplate data={resumeData} />
    };

    const sections = [
        { id: 'personal', label: 'Personal', icon: <User size={18} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
        { id: 'skills', label: 'Skills', icon: <Code size={18} /> },
        { id: 'projects', label: 'Projects', icon: <Layout size={18} /> },
        { id: 'certifications', label: 'Awards', icon: <Award size={18} /> },
    ];

    if (!userData) {
        return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">LOADING PROFILE DATA...</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20 px-4 print:p-0 print:bg-white overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: A4 portrait; 
                        margin: 0;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    html, body {
                        width: 210mm;
                        height: auto;
                        min-height: 297mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: white !important;
                    }
                    
                    /* Hide known UI elements - explicit targeting is safer */
                    nav, header, footer, .control-bar, .no-print, 
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    /* Ensure parent containers are visible */
                    #root, #root > div, main {
                        display: block !important;
                        visibility: visible !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* Ensure Resume Container is Positioned Correctly */
                    .print-active-resume {
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 auto !important; /* Center it */
                        padding: 0 !important;
                        display: block !important;
                        visibility: visible !important;
                        z-index: 9999 !important;
                        background: white !important;
                    }
                    
                    /* Reset any transform or fixed positioning on parents that might interfere */
                    .print-active-resume * {
                        visibility: visible !important;
                    }
                    
                    /* Allow multi-page if content overflows */
                    .print-active-resume > div {
                        min-height: 297mm !important;
                        height: auto !important;
                    }
                    
                    /* Page Break Protection */
                    p, h1, h2, h3, h4, h5, h6, li, span, .group {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}} />

            {/* Premium Control Bar */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col lg:flex-row justify-between items-center gap-6 print:hidden control-bar">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-black uppercase text-[10px] hover:bg-slate-50 transition-all active:scale-95">
                        <ArrowLeft size={14} /> Back
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase">Resume Architect</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                Premium AI Builder
                                {saveStatus === 'saving' && <span className="text-blue-500 font-black animate-pulse">• Saving...</span>}
                                {saveStatus === 'success' && <span className="text-emerald-500 font-black">• Saved ✓</span>}
                                {saveStatus === 'error' && <span className="text-red-500 font-black">• Error!</span>}
                                {!saveStatus && lastSaved && <span className="text-slate-400 font-black">• {lastSaved}</span>}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
                    {!isEditMode && (
                        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto max-w-[100vw] scrollbar-hide">
                            {['modern', 'minimal', 'creative'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedTemplate(t)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap",
                                        selectedTemplate === t ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-black uppercase text-xs hover:border-blue-200 hover:bg-blue-50/30 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Save size={16} className="text-blue-600" />}
                            <span className="hidden sm:inline">{isSaving ? 'Saving' : 'Save'}</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="btn-premium px-6 py-3 flex items-center gap-2 active:scale-95 bg-blue-600 text-white shadow-xl shadow-blue-500/20 rounded-2xl"
                        >
                            <Download size={18} />
                            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Export PDF</span>
                            <span className="text-xs font-black uppercase tracking-widest sm:hidden">PDF</span>
                        </button>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-900 rounded-2xl text-white font-black uppercase text-xs hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
                        >
                            {isEditMode ? <Eye size={16} /> : <Layout size={16} />}
                            <span className="hidden sm:inline">{isEditMode ? 'Preview' : 'Editor'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
                {/* Editor Component */}
                <AnimatePresence mode="wait">
                    {isEditMode ? (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="lg:col-span-5 xl:col-span-4 space-y-6 print:hidden"
                        >
                            {/* Section Tabs */}
                            <div className="bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap gap-1">
                                {sections.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className={cn(
                                            "flex-1 flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 gap-1.5",
                                            activeSection === s.id ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm" : "text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        {s.icon}
                                        <span className="text-[9px] font-black uppercase tracking-wider">{s.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Section Form */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl min-h-[500px]">
                                {activeSection === 'personal' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                                        <SectionHeader title="Personal Details" icon={<User className="text-blue-500" />} />
                                        <FormInput label="Full Name" value={resumeData.personal.fullName} onChange={(v) => updatePersonal('fullName', v)} />
                                        <FormInput label="Professional Title" value={resumeData.personal.title} onChange={(v) => updatePersonal('title', v)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Email" value={resumeData.personal.email} onChange={(v) => updatePersonal('email', v)} />
                                            <FormInput label="Phone" value={resumeData.personal.phone} onChange={(v) => updatePersonal('phone', v)} />
                                        </div>
                                        <FormInput label="Location" value={resumeData.personal.location} onChange={(v) => updatePersonal('location', v)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="LinkedIn" value={resumeData.personal.linkedin} onChange={(v) => updatePersonal('linkedin', v)} />
                                            <FormInput label="Website" value={resumeData.personal.website} onChange={(v) => updatePersonal('website', v)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Professional Bio</label>
                                            <textarea
                                                value={resumeData.personal.bio}
                                                onChange={(e) => updatePersonal('bio', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
                                                placeholder="Tell your story..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'experience' && (
                                    <div className="space-y-6">
                                        <SectionHeader title="Experience" icon={<Briefcase className="text-amber-500" />} />
                                        {resumeData.experience.map((exp, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group">
                                                <button onClick={() => removeItem('experience', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="space-y-4">
                                                    <FormInput label="Company" value={exp.company} onChange={(v) => updateItem('experience', idx, 'company', v)} />
                                                    <FormInput label="Role" value={exp.role} onChange={(v) => updateItem('experience', idx, 'role', v)} />
                                                    <FormInput label="Duration (e.g. 2020 - Present)" value={exp.duration} onChange={(v) => updateItem('experience', idx, 'duration', v)} />
                                                    <textarea
                                                        value={exp.description}
                                                        onChange={(e) => updateItem('experience', idx, 'description', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500 transition-all min-h-[80px]"
                                                        placeholder="Key achievements..."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <AddButton onClick={() => addItem('experience')} label="Add Experience" />
                                    </div>
                                )}

                                {activeSection === 'education' && (
                                    <div className="space-y-6">
                                        <SectionHeader title="Education" icon={<GraduationCap className="text-emerald-500" />} />
                                        {resumeData.education.map((edu, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                                                <button onClick={() => removeItem('education', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="space-y-4">
                                                    <FormInput label="School / University" value={edu.school} onChange={(v) => updateItem('education', idx, 'school', v)} />
                                                    <FormInput label="Degree / Course" value={edu.degree} onChange={(v) => updateItem('education', idx, 'degree', v)} />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput label="Year" value={edu.year} onChange={(v) => updateItem('education', idx, 'year', v)} />
                                                        <FormInput label="Grade / GPA" value={edu.grade} onChange={(v) => updateItem('education', idx, 'grade', v)} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <AddButton onClick={() => addItem('education')} label="Add Education" />
                                    </div>
                                )}

                                {activeSection === 'skills' && (
                                    <div className="space-y-6">
                                        <SectionHeader title="Expertise" icon={<Code className="text-violet-500" />} />
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills.map((skill, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-wider border border-blue-100 group">
                                                    {skill}
                                                    <button onClick={() => setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))}>
                                                        <Trash2 size={12} className="text-blue-300 hover:text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                id="skill-input"
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:border-blue-500"
                                                placeholder="Add skill (e.g. React, UI Design)"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.target.value) {
                                                        setResumeData(prev => ({ ...prev, skills: [...prev.skills, e.target.value] }));
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const input = document.getElementById('skill-input');
                                                    if (input && input.value) {
                                                        setResumeData(prev => ({ ...prev, skills: [...prev.skills, input.value] }));
                                                        input.value = '';
                                                    }
                                                }}
                                                className="p-3 bg-slate-900 text-white rounded-xl active:scale-95 transition-transform"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'projects' && (
                                    <div className="space-y-6">
                                        <SectionHeader title="Key Projects" icon={<Layout className="text-rose-500" />} />
                                        {resumeData.projects.map((proj, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                                                <button onClick={() => removeItem('projects', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="space-y-4">
                                                    <FormInput label="Project Name" value={proj.name} onChange={(v) => updateItem('projects', idx, 'name', v)} />
                                                    <FormInput label="Link" value={proj.link} onChange={(v) => updateItem('projects', idx, 'link', v)} />
                                                    <textarea
                                                        value={proj.description}
                                                        onChange={(e) => updateItem('projects', idx, 'description', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500 transition-all min-h-[60px]"
                                                        placeholder="Briefly describe..."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <AddButton onClick={() => addItem('projects')} label="Add Project" />
                                    </div>
                                )}

                                {activeSection === 'certifications' && (
                                    <div className="space-y-6">
                                        <SectionHeader title="Achievements" icon={<Award className="text-cyan-500" />} />
                                        {resumeData.certifications.map((cert, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                                                <button onClick={() => removeItem('certifications', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="space-y-4">
                                                    <FormInput label="Title" value={cert.name} onChange={(v) => updateItem('certifications', idx, 'name', v)} />
                                                    <FormInput label="Issuer" value={cert.issuer} onChange={(v) => updateItem('certifications', idx, 'issuer', v)} />
                                                </div>
                                            </div>
                                        ))}
                                        <AddButton onClick={() => addItem('certifications')} label="Add Certification" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Preview Component */}
                <div className={cn(
                    "transition-all duration-500 sticky top-24",
                    isEditMode ? "lg:col-span-7 xl:col-span-8" : "col-span-12 mx-auto"
                )}>
                    <div className={cn(
                        "w-full max-w-[210mm] mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none print:m-0 print:max-w-none print:w-full print-active-resume",
                        !isEditMode && "scale-100 origin-top"
                    )}>
                        <div ref={resumeRef} className="bg-white print:w-full">
                            {templates[selectedTemplate]}
                        </div>
                    </div>
                </div>
            </main>

            {/* Float Action for PDF in Edit Mode */}
            {isEditMode && (
                <button
                    onClick={() => setIsEditMode(false)}
                    className="fixed bottom-10 right-10 p-5 bg-blue-600 text-white rounded-full shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-110 active:scale-95 transition-all z-50 group lg:hidden"
                >
                    <Eye size={24} />
                </button>
            )}
        </div>
    );
}

// --- SUB-COMPONENTS ---

function FormInput({ label, value, onChange, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 leading-none">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-4 py-3.5 font-bold text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all"
            />
        </div>
    );
}

function SectionHeader({ title, icon }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-slate-100 rounded-xl">
                {icon}
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{title}</h3>
        </div>
    );
}

function AddButton({ onClick, label }) {
    return (
        <button
            onClick={onClick}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 group"
        >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

// --- RESUME TEMPLATES ---

function ModernTemplate({ data }) {
    const { personal, experience, education, skills, projects, certifications } = data;
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white flex flex-col md:flex-row shadow-none text-slate-800 font-inter print:w-[210mm] print:min-h-[297mm]">
            {/* Left Sidebar - Refined Dark Mode */}
            <div className="w-full md:w-[32%] bg-[#1a1c2e] text-white p-8 flex flex-col gap-8 print:w-[32%] print:min-h-full">
                <div className="space-y-6">
                    {personal.photoURL && (
                        <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-[#2d3047] shadow-2xl mx-auto">
                            <img src={getOptimizedUrl(personal.photoURL, 'w_400,h_400,c_fill,g_face,f_auto,q_auto')} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="text-center">
                        <h1 className="text-2xl font-black tracking-tighter leading-none mb-3 uppercase">{personal.fullName || 'Full Name'}</h1>
                        <div className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em]">
                            {personal.title || 'Professional Title'}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 border-b border-slate-700 pb-2">Connect</h3>
                        <div className="space-y-3">
                            <ContactRow icon={<Mail size={14} />} text={personal.email} />
                            <ContactRow icon={<Phone size={14} />} text={personal.phone} />
                            <ContactRow icon={<MapPin size={14} />} text={personal.location} />
                            <ContactRow icon={<Linkedin size={14} />} text={personal.linkedin} />
                            <ContactRow icon={<Globe size={14} />} text={personal.website} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 border-b border-slate-700 pb-2">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-[#2d3047] text-white text-[9px] font-bold uppercase tracking-wider rounded-md border border-slate-700/50">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Refined Clean Look */}
            <div className="flex-1 p-10 space-y-8 print:p-10">
                <div className="space-y-4">
                    <TemplateSectionHeader title="About Me" />
                    <p className="text-slate-600 text-[13px] leading-7 font-medium text-justify">
                        {personal.bio || 'Enter your bio in the editor to see it here...'}
                    </p>
                </div>

                {experience.length > 0 && (
                    <div className="space-y-6">
                        <TemplateSectionHeader title="Professional Path" />
                        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                            {experience.map((exp, i) => (
                                <div key={i} className="pl-8 relative group">
                                    <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-4 border-slate-200 rounded-full flex items-center justify-center z-10 group-hover:border-blue-500 transition-colors"></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">{exp.role}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">{exp.duration}</span>
                                    </div>
                                    <div className="text-blue-600 font-bold text-[11px] uppercase tracking-widest mb-2">{exp.company}</div>
                                    <p className="text-slate-600 text-[11px] leading-relaxed font-medium whitespace-pre-wrap">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {education.length > 0 && (
                    <div className="space-y-6">
                        <TemplateSectionHeader title="Academic Foundation" />
                        <div className="grid grid-cols-1 gap-4">
                            {education.map((edu, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                                    <div>
                                        <h4 className="font-black text-slate-800 text-xs tracking-tight uppercase mb-1">{edu.degree}</h4>
                                        <div className="text-slate-500 text-[11px]">{edu.school}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">{edu.year}</div>
                                        {edu.grade && <div className="text-[9px] font-bold text-blue-500 mt-1">{edu.grade}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {projects.length > 0 && (
                    <div className="space-y-6">
                        <TemplateSectionHeader title="Key Projects" />
                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((p, i) => (
                                <div key={i} className="space-y-1 border-l-2 border-blue-500 pl-4">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-black text-slate-900 text-xs uppercase tracking-tight">{p.name}</h5>
                                        {p.link && <span className="text-[9px] font-bold text-blue-500 uppercase flex items-center gap-1"><Globe size={10} /> Link</span>}
                                    </div>
                                    <p className="text-slate-600 text-[10px] leading-relaxed">{p.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MinimalTemplate({ data }) {
    const { personal, experience, education, skills, projects, certifications } = data;
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-800 print:w-[210mm] print:min-h-[297mm] print:p-[10mm] font-inter">
            <div className="border-b-[3px] border-black pb-8 mb-10 flex flex-col items-center text-center">
                <h1 className="text-6xl font-black tracking-tighter uppercase text-slate-900 mb-4">{personal.fullName || 'Name'}</h1>
                <p className="text-sm font-bold uppercase tracking-[0.4em] text-slate-500 mb-6">{personal.title || 'Professional Title'}</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {personal.email && <span>{personal.email}</span>}
                    {personal.phone && <span>• {personal.phone}</span>}
                    {personal.location && <span>• {personal.location}</span>}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="col-span-8 space-y-10">
                    {experience.length > 0 && (
                        <MinimalSection title="Work Experience">
                            {experience.map((exp, i) => (
                                <div key={i} className="mb-8 last:mb-0">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">{exp.role}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{exp.duration}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{exp.company}</div>
                                    <p className="text-slate-600 text-[11px] leading-relaxed whitespace-pre-wrap text-justify">{exp.description}</p>
                                </div>
                            ))}
                        </MinimalSection>
                    )}

                    {projects.length > 0 && (
                        <MinimalSection title="Key Projects">
                            <div className="grid grid-cols-1 gap-6">
                                {projects.map((p, i) => (
                                    <div key={i}>
                                        <h5 className="font-black text-slate-800 text-xs uppercase mb-1 flex items-center gap-2">
                                            {p.name}
                                            {p.link && <Globe size={10} className="text-slate-400" />}
                                        </h5>
                                        <p className="text-slate-500 text-[10px] leading-relaxed">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </MinimalSection>
                    )}
                </div>

                {/* Sidebar */}
                <div className="col-span-4 space-y-10 pl-8 border-l border-slate-100">
                    <MinimalSection title="Education">
                        {education.map((edu, i) => (
                            <div key={i} className="mb-6 last:mb-0">
                                <h4 className="font-black text-slate-800 text-[11px] uppercase leading-tight mb-1">{edu.degree}</h4>
                                <div className="text-[10px] text-slate-500 mb-1">{edu.school}</div>
                                <div className="text-[9px] font-bold text-slate-400 bg-slate-50 inline-block px-1.5 rounded">{edu.year}</div>
                            </div>
                        ))}
                    </MinimalSection>

                    <MinimalSection title="Skills">
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s, i) => (
                                <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </MinimalSection>

                    {personal.linkedin || personal.github || personal.website ? (
                        <MinimalSection title="Links">
                            <div className="flex flex-col gap-2">
                                {personal.linkedin && <a href={personal.linkedin} className="text-[10px] text-slate-500 hover:text-black truncate flex items-center gap-2"><Linkedin size={12} /> LinkedIn</a>}
                                {personal.github && <a href={`https://${personal.github}`} className="text-[10px] text-slate-500 hover:text-black truncate flex items-center gap-2"><Github size={12} /> GitHub</a>}
                                {personal.website && <a href={personal.website} className="text-[10px] text-slate-500 hover:text-black truncate flex items-center gap-2"><Globe size={12} /> Website</a>}
                            </div>
                        </MinimalSection>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function CreativeTemplate({ data }) {
    const { personal, experience, education, skills, projects, certifications } = data;
    return (
        <div className="w-[210mm] min-h-[297mm] bg-[#0f0f11] text-white relative font-outfit print:w-[210mm] print:min-h-[297mm] overflow-hidden">
            {/* Improved Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-blue-600/20 to-transparent blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-violet-600/20 to-transparent blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 p-14 h-full flex flex-col">
                <header className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-12 mb-12 gap-8">
                    <div className="space-y-4 max-w-lg">
                        <h1 className="text-6xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-white leading-none">
                            {personal.fullName || 'Name'}
                        </h1>
                        <p className="text-white/60 font-black text-sm uppercase tracking-[0.4em] flex items-center gap-3">
                            <span className="w-8 h-0.5 bg-blue-500"></span>
                            {personal.title || 'Role Name'}
                        </p>
                    </div>
                    <div className="text-right space-y-3 pt-2">
                        <div className="flex justify-end gap-3 text-xs font-bold text-white/70">
                            <span>{personal.email}</span>
                            <Mail size={16} className="text-blue-400" />
                        </div>
                        <div className="flex justify-end gap-3 text-xs font-bold text-white/70">
                            <span>{personal.location}</span>
                            <MapPin size={16} className="text-violet-400" />
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            {personal.github && <Github size={18} className="text-white hover:text-blue-400 transition-colors" />}
                            {personal.linkedin && <Linkedin size={18} className="text-white hover:text-blue-400 transition-colors" />}
                            {personal.website && <Globe size={18} className="text-white hover:text-blue-400 transition-colors" />}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-16 flex-1">
                    <div className="col-span-8 space-y-12">
                        <CreativeSection title="The Experience" accent="bg-blue-500">
                            {experience.map((exp, i) => (
                                <div key={i} className="mb-10 group">
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-xs font-black text-blue-400 border border-blue-400/30 px-3 py-1 rounded-full uppercase italic">{exp.duration}</span>
                                        <h4 className="text-xl font-black uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform">{exp.company}</h4>
                                    </div>
                                    <p className="text-white/40 font-black text-[10px] uppercase tracking-widest mb-4">{exp.role}</p>
                                    <p className="text-white/60 text-sm leading-relaxed font-medium">{exp.description}</p>
                                </div>
                            ))}
                        </CreativeSection>

                        <CreativeSection title="Side Projects" accent="bg-emerald-500">
                            <div className="grid grid-cols-2 gap-6">
                                {projects.map((p, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <h5 className="font-black text-sm uppercase italic mb-2">{p.name}</h5>
                                        <p className="text-white/50 text-xs leading-relaxed">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CreativeSection>
                    </div>

                    <div className="col-span-4 space-y-12">
                        <CreativeSection title="Arsenal" accent="bg-violet-500">
                            <div className="flex flex-wrap gap-2">
                                {skills.map((s, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </CreativeSection>

                        <CreativeSection title="Learning" accent="bg-amber-500">
                            {education.map((edu, i) => (
                                <div key={i} className="mb-4">
                                    <h5 className="text-sm font-black text-white italic uppercase">{edu.degree}</h5>
                                    <p className="text-white/40 text-[10px] font-bold uppercase">{edu.school}</p>
                                </div>
                            ))}
                        </CreativeSection>

                        <CreativeSection title="Milestones" accent="bg-cyan-500">
                            <div className="space-y-4">
                                {certifications.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Award size={14} className="text-blue-400" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{c.name}</p>
                                    </div>
                                ))}
                            </div>
                        </CreativeSection>
                    </div>
                </div>
            </div >
        </div >
    );
}

// --- HELPER COMPONENTS ---

function ContactRow({ icon, text }) {
    if (!text) return null;
    return (
        <div className="flex items-center gap-3 text-slate-400 group cursor-default">
            <div className="text-blue-400 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="text-[10px] font-bold truncate max-w-[150px]">{text}</span>
        </div>
    );
}

function TemplateSectionHeader({ title }) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 border-l-4 border-slate-900 pl-4 leading-none">{title}</h3>
            <div className="flex-1 h-[1px] bg-slate-100" />
        </div>
    );
}

function MinimalContact({ icon, text }) {
    if (!text) return null;
    return (
        <div className="flex items-center gap-2 text-slate-500">
            <span className="text-slate-400">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{text}</span>
        </div>
    );
}

function MinimalSection({ title, children }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 border-b border-slate-100 pb-2">{title}</h3>
            <div>{children}</div>
        </div>
    );
}

function CreativeSection({ title, children, accent }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", accent)} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">{title}</h3>
            </div>
            <div>{children}</div>
        </div>
    );
}
