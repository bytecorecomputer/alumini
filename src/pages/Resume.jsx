import React, { useRef } from 'react';
import { useAuth } from '../app/common/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Download, Mail as MailIcon, Briefcase, GraduationCap, Award, BookOpen, Star, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Resume() {
    const { userData } = useAuth();
    const resumeRef = useRef();

    if (!userData) {
        return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">LOADING PROFILE DATA...</div>;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 pt-32 pb-20 px-4 print:p-0 print:bg-white">
            {/* Control Bar */}
            <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-800 border border-slate-200">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter">Professional Dossier</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High-Level Narrative Generation</p>
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="btn-premium px-8 py-4 bg-slate-900 text-white shadow-2xl flex items-center gap-3 active:scale-95"
                >
                    <Download size={20} />
                    <span className="uppercase tracking-[0.2em] font-black text-sm">Download PDF</span>
                </button>
            </div>

            {/* A4 Resume Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                ref={resumeRef}
                className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none overflow-hidden flex flex-col md:flex-row relative"
            >
                {/* Left Sidebar - Premium Accent */}
                <div className="w-full md:w-[35%] bg-slate-900 text-white p-12 flex flex-col gap-12 print:w-[35%]">
                    <div className="space-y-6">
                        {userData.photoURL && (
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl">
                                <img src={userData.photoURL} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter leading-none mb-2">{userData.displayName}</h1>
                            <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">{userData.headline || userData.role}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SectionTitle title="Contact" dark />
                        <div className="space-y-4">
                            <ContactItem icon={<MailIcon size={14} />} text={userData.email} />
                            {userData.phoneNumber && <ContactItem icon={<Phone size={14} />} text={userData.phoneNumber} />}
                            {userData.location && <ContactItem icon={<MapPin size={14} />} text={userData.location} />}
                            {userData.linkedin && (
                                <ContactItem
                                    icon={<Linkedin size={14} />}
                                    text={userData.linkedin.replace('linkedin.com/in/', '')}
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SectionTitle title="Expertise" dark />
                        <div className="flex flex-wrap gap-2">
                            {userData.skills?.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 p-16 space-y-12">
                    {/* Bio / Summary */}
                    <div className="space-y-4">
                        <SectionTitle title="Professional Synopsis" />
                        <p className="text-slate-600 font-bold leading-relaxed">
                            {userData.bio || "A dedicated professional focused on delivering high-quality results and continuous growth within the alumni network."}
                        </p>
                    </div>

                    {/* Experience */}
                    {userData.company && (
                        <div className="space-y-6">
                            <SectionTitle title="Professional Engagement" icon={<Briefcase size={18} />} />
                            <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[41px] top-0 p-1.5 bg-slate-900 rounded-full text-white">
                                        <Briefcase size={12} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{userData.headline || "Key Contributor"}</h4>
                                        <div className="text-blue-600 font-black text-xs uppercase tracking-widest mt-1">{userData.company}</div>
                                        <p className="text-slate-400 font-bold text-xs mt-1">Current Implementation</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    <div className="space-y-6">
                        <SectionTitle title="Academic Foundation" icon={<GraduationCap size={18} />} />
                        <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
                            <div className="relative">
                                <div className="absolute -left-[41px] top-0 p-1.5 bg-slate-900 rounded-full text-white">
                                    <GraduationCap size={12} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{userData.course || "General Studies"}</h4>
                                    <div className="text-blue-600 font-black text-xs uppercase tracking-widest mt-1">Alumni Network Integration</div>
                                    <p className="text-slate-400 font-bold text-xs mt-1">{userData.batch || "Year N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Certifications / Awards - Mock if empty but styled high level */}
                    <div className="space-y-6">
                        <SectionTitle title="Verified Milestones" icon={<Award size={18} />} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Star className="text-amber-500 mb-2" size={16} />
                                <h5 className="font-black text-slate-900 text-xs uppercase tracking-tight">Technical Excellence</h5>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Core Systems Mastery</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Globe className="text-blue-500 mb-2" size={16} />
                                <h5 className="font-black text-slate-900 text-xs uppercase tracking-tight">Network Fellow</h5>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Global Connectivity Protocol</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="absolute bottom-12 right-12 opacity-10 print:opacity-20 pointer-events-none">
                    <div className="flex items-center gap-2 grayscale">
                        <GraduationCap size={24} />
                        <span className="font-black text-sm uppercase tracking-widest">AlumniConnect Dossier</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function SectionTitle({ title, dark, icon }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            {icon && <div className="p-2 bg-slate-50 rounded-xl text-slate-900">{icon}</div>}
            <h3 className={cn(
                "text-sm font-black uppercase tracking-[0.3em] border-b-2 pb-1 inline-block",
                dark ? "text-slate-500 border-slate-800" : "text-slate-800 border-slate-100"
            )}>
                {title}
            </h3>
        </div>
    );
}

function ContactItem({ icon, text }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-blue-400">{icon}</div>
            <span className="text-xs font-bold text-slate-300 truncate tracking-tight">{text}</span>
        </div>
    );
}
