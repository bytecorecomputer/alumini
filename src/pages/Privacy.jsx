import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Mail } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-32 pb-20">
            <Helmet>
                <title>Privacy Policy | ByteCore Computer Centre</title>
                <meta name="description" content="Read the ByteCore Computer Centre Privacy Policy to understand how we securely handle, protect, and use your data." />
                <link rel="canonical" href="https://bytecores.in/privacy" />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Privacy <span className="text-blue-600">Policy</span></h1>
                    <p className="text-lg text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-100 space-y-8 font-medium leading-relaxed text-slate-600">
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">1. Information We Collect</h2>
                        <p>We collect information that you manually provide to us during registration, course enrollment, or when contacting our support team (e.g., Name, Email, Phone Number, Education History).</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">2. How We Use Your Data</h2>
                        <p>Your data is strictly used to facilitate your educational journey at ByteCore. This includes providing access to course materials, issuing verifiable digital certificates, and communicating important updates.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">3. Data Security & Storage</h2>
                        <p>We employ enterprise-grade security protocols to protect your personal information. Digital certificates are securely maintained in our encrypted Vault systems for perpetual verification.</p>
                    </section>

                    <div className="pt-8 mt-8 border-t border-slate-100 flex items-center gap-4 bg-slate-50 p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Questions?</p>
                            <a href="mailto:coderafroj@gmail.com" className="text-blue-600 font-bold hover:underline">coderafroj@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
