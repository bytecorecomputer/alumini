import React from 'react';
import SEO from '../components/common/SEO';
import { FileText, Mail } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-32 pb-20">
            <SEO
                title="Terms of Service"
                description="Review the Terms of Service for using ByteCore Computer Centre educational platforms and resources."
                url="https://bytecores.in/terms"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FileText size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Terms of <span className="text-purple-600">Service</span></h1>
                    <p className="text-lg text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-100 space-y-8 font-medium leading-relaxed text-slate-600">
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">1. Acceptance of Terms</h2>
                        <p>By accessing and using the ByteCore Computer Centre website and enrolling in our courses, you accept and agree to be bound by the terms and provisions of this agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">2. Educational Services</h2>
                        <p>ByteCore provides premium IT and computer education. Course structures, timelines, and certifications are subject to the satisfactory completion of the respective curricula and practical examinations.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">3. User Conduct</h2>
                        <p>Students are expected to maintain professional conduct on the platform and within the community. Any form of harassment, unauthorized sharing of course materials, or system abuse may result in immediate termination of access.</p>
                    </section>

                    <div className="pt-8 mt-8 border-t border-slate-100 flex items-center gap-4 bg-slate-50 p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Support Contact</p>
                            <a href="mailto:coderafroj@gmail.com" className="text-purple-600 font-bold hover:underline">coderafroj@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
