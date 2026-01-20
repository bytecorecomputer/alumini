import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCertificates, deleteCertificate } from '../lib/certificateService';
import { Download, ExternalLink, Trash2, Copy, CheckCircle } from 'lucide-react';

export default function CertificateList() {
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            setLoading(true);
            const data = await getCertificates();
            setCertificates(data);
        } catch (error) {
            console.error('Error loading certificates:', error);
            alert('Error loading certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return;

        try {
            await deleteCertificate(id);
            setCertificates(certificates.filter(cert => cert.id !== id));
            alert('Certificate deleted successfully');
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('Error deleting certificate');
        }
    };

    const copyToClipboard = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading certificates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-4 border-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                                Certificates
                            </h1>
                            <p className="text-slate-600">View and manage all generated certificates</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/admin/coaching')}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200"
                            >
                                Back to Admin
                            </button>
                            <button
                                onClick={() => navigate('/certificate-generator')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                            >
                                Generate New
                            </button>
                        </div>
                    </div>
                </div>

                {/* Certificates List */}
                {certificates.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <svg className="mx-auto h-24 w-24 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No Certificates Yet</h3>
                        <p className="text-slate-600 mb-6">Generate your first certificate to get started</p>
                        <button
                            onClick={() => navigate('/certificate-generator')}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                        >
                            Generate Certificate
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-2xl font-bold text-slate-800">
                                                {cert.studentName}
                                            </h3>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                {cert.grade}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-slate-600">Father's Name</p>
                                                <p className="font-semibold text-slate-800">{cert.fatherName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">Course</p>
                                                <p className="font-semibold text-slate-800">{cert.courseName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">Certificate Number</p>
                                                <p className="font-semibold text-slate-800">{cert.certificateNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">Marksheet Number</p>
                                                <p className="font-semibold text-slate-800">{cert.marksheetNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">Percentage</p>
                                                <p className="font-semibold text-blue-600">{cert.percentage?.toFixed(2)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">Division</p>
                                                <p className="font-semibold text-purple-600">{cert.division}</p>
                                            </div>
                                        </div>

                                        {/* PDF URL Section */}
                                        {cert.pdfUrl && (
                                            <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                                                <p className="text-sm text-slate-600 mb-2 font-semibold">Certificate PDF URL:</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={cert.pdfUrl}
                                                        readOnly
                                                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-700 font-mono"
                                                    />
                                                    <button
                                                        onClick={() => copyToClipboard(cert.pdfUrl, cert.id)}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-200 flex items-center gap-2"
                                                        title="Copy URL"
                                                    >
                                                        {copiedId === cert.id ? (
                                                            <>
                                                                <CheckCircle size={16} />
                                                                <span className="text-sm">Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy size={16} />
                                                                <span className="text-sm">Copy</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        {cert.pdfUrl && (
                                            <>
                                                <a
                                                    href={cert.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                                                    title="View PDF"
                                                >
                                                    <ExternalLink size={16} />
                                                    <span className="text-sm">View</span>
                                                </a>
                                                <a
                                                    href={cert.pdfUrl}
                                                    download
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                                                    title="Download PDF"
                                                >
                                                    <Download size={16} />
                                                    <span className="text-sm">Download</span>
                                                </a>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(cert.id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                                            title="Delete Certificate"
                                        >
                                            <Trash2 size={16} />
                                            <span className="text-sm">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
