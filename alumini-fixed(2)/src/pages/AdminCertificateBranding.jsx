import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, UploadCloud, Loader2, Save, Image as ImageIcon, PenTool, User } from 'lucide-react';
import { uploadToCloudinary } from '../lib/cloudinary';
import {
    subscribeCertificateBranding,
    saveCertificateBranding,
    DEFAULT_BRANDING,
} from '../lib/certificateBranding';
import CertificateTemplate from '../components/certificate/CertificateTemplate';

// Sample data so the admin can see exactly how their changes will look on
// a real certificate before saving.
const PREVIEW_DATA = {
    studentName: 'Sample Student',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    courseName: 'ADCA',
    duration: '12 Months',
    marksheetNumber: 'BC-2026-0001',
    certificateNumber: 'BC-2026-0001',
    issueDate: new Date().toLocaleDateString('en-IN'),
    subjects: [{ name: 'MS Office', maxMarks: 100, obtainedMarks: 92 }],
    totalMarks: 100,
    obtainedMarks: 92,
    percentage: 92,
    grade: 'A+',
    division: 'First',
};

function UploadField({ label, icon: Icon, currentUrl, onUploaded, hint }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            if (url) {
                onUploaded(url);
                toast.success(`${label} uploaded!`);
            }
        } catch (err) {
            toast.error(err.message || `Failed to upload ${label}`);
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Icon size={16} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</h3>
            </div>

            <div className="flex items-center gap-5">
                <div className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {currentUrl ? (
                        <img src={currentUrl} alt={label} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <ImageIcon size={22} className="text-slate-300" />
                    )}
                </div>
                <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-all">
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                        {uploading ? 'Uploading…' : `Upload ${label}`}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
                    </label>
                    {hint && <p className="text-[11px] text-slate-400 font-medium mt-2">{hint}</p>}
                </div>
            </div>
        </div>
    );
}

export default function AdminCertificateBranding() {
    const navigate = useNavigate();
    const [branding, setBranding] = useState(DEFAULT_BRANDING);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsub = subscribeCertificateBranding((b) => {
            setBranding(b);
            setLoaded(true);
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveCertificateBranding({
                logoUrl: branding.logoUrl,
                signatureUrl: branding.signatureUrl,
                signatoryName: branding.signatoryName,
                signatoryTitle: branding.signatoryTitle,
            });
            toast.success('Certificate branding updated! Every new certificate & diploma will use this from now on.');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-inter">
            <div className="bg-slate-900 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-6"
                    >
                        <ArrowLeft size={14} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Certificate & Diploma Branding</h1>
                    <p className="text-slate-400 font-medium mt-2 max-w-2xl">
                        Set the logo, signature image, and signatory name that appear on every marksheet, certificate, and course-completion diploma across the whole site.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Controls */}
                    <div className="space-y-6">
                        <UploadField
                            label="Logo"
                            icon={ImageIcon}
                            currentUrl={branding.logoUrl}
                            onUploaded={(url) => setBranding(b => ({ ...b, logoUrl: url }))}
                            hint="Square/circular logo works best. Shown top-left and as a faint watermark."
                        />
                        <UploadField
                            label="Signature"
                            icon={PenTool}
                            currentUrl={branding.signatureUrl}
                            onUploaded={(url) => setBranding(b => ({ ...b, signatureUrl: url }))}
                            hint="A signature photographed/scanned on a plain background, cropped tight. Leave empty to just print the signatory's name in italics instead."
                        />

                        <div className="bg-white border-2 border-slate-100 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User size={16} className="text-blue-600" />
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Signatory Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={branding.signatoryName}
                                        onChange={(e) => setBranding(b => ({ ...b, signatoryName: e.target.value }))}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={branding.signatoryTitle}
                                        onChange={(e) => setBranding(b => ({ ...b, signatoryTitle: e.target.value }))}
                                        placeholder="e.g. Director, ByteCore Computer Centre"
                                        className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !loaded}
                            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving…' : 'Save Branding'}
                        </button>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 overflow-auto">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Live Preview</p>
                        <div style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: '238%' }}>
                            <CertificateTemplate data={PREVIEW_DATA} branding={branding} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
