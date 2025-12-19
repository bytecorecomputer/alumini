import { motion } from 'framer-motion';
import { Heart, Building, GraduationCap, ArrowRight, CreditCard, Gift, Target, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Donate() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-50 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block p-6 bg-white rounded-[2rem] shadow-2xl shadow-rose-200/50 text-rose-600 mb-8 border border-rose-50"
                    >
                        <Heart size={48} fill="currentColor" className="animate-pulse" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-8"
                    >
                        Empower the <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">Legacy.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed"
                    >
                        Your contribution is the catalyst for the next generation of excellence. Bridge the gap between historic achievement and future potential.
                    </motion.p>
                </div>

                {/* Impact Areas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
                    <DonationImpactCard
                        icon={Target}
                        title="Strategic Talent"
                        description="Funding elite scholarship programs for the top 1% of incoming fellows."
                        color="bg-blue-600"
                        accent="blue"
                    />
                    <DonationImpactCard
                        icon={Zap}
                        title="Quantum Infrastructure"
                        description="Revolutionizing campus facilities with state-of-the-art research ecosystems."
                        color="bg-purple-600"
                        accent="purple"
                    />
                    <DonationImpactCard
                        icon={Gift}
                        title="Network Synergy"
                        description="Sponsoring global alumni convergences and high-impact connectivity meetups."
                        color="bg-emerald-600"
                        accent="emerald"
                    />
                </div>

                {/* Donation Interface */}
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="premium-card bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]"
                    >
                        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-transparent"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2 italic">Initialization Terminal</h2>
                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Secure Contribution Protocol v4.0</p>
                            </div>
                        </div>

                        <div className="p-12 md:p-16">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                                {['$100', '$500', '$2.5k', 'Custom'].map((amt) => (
                                    <button
                                        key={amt}
                                        className="p-6 rounded-2xl border-2 border-slate-50 font-black text-slate-400 uppercase tracking-widest text-xs hover:border-rose-600 hover:text-rose-600 hover:bg-rose-50 hover:shadow-xl hover:shadow-rose-100 transition-all active:scale-95"
                                    >
                                        {amt}
                                    </button>
                                ))}
                            </div>

                            <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); alert("Redirecting to Secure Payment Gateway..."); }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Tag</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-100 outline-none text-slate-800 font-bold transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network UID</label>
                                        <input
                                            type="email"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-100 outline-none text-slate-800 font-bold transition-all"
                                            placeholder="Email Address"
                                        />
                                    </div>
                                </div>

                                <button className="btn-premium w-full py-6 bg-slate-900 text-white shadow-2xl shadow-rose-950/20 active:scale-95 group">
                                    <CreditCard size={24} className="group-hover:rotate-12 transition-transform" />
                                    <span className="uppercase tracking-[0.4em] font-black ml-4">Execute Connection</span>
                                </button>

                                <div className="flex items-center justify-center gap-2 text-slate-300">
                                    <ShieldCheck size={16} />
                                    <span className="text-[10px] uppercase font-black tracking-widest leading-none">Military-Grade Encryption Active</span>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Offline Details */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-24 p-12 rounded-[3.5rem] bg-blue-50/50 border-2 border-blue-100 flex flex-col md:flex-row items-center gap-10"
                >
                    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-blue-200/50 text-blue-600">
                        <Building size={40} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-2xl tracking-tighter mb-2">Manual Transfer Protocol</h3>
                        <p className="text-slate-500 font-bold mb-6">For direct legacy investment, utilize the following parameters:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 font-black uppercase tracking-widest text-[10px] text-blue-900">
                            <p className="flex justify-between border-b border-blue-100 pb-2">Label: <span>Association Governance</span></p>
                            <p className="flex justify-between border-b border-blue-100 pb-2">UID: <span>123 456 7890</span></p>
                            <p className="flex justify-between border-b border-blue-100 pb-2">C-Code: <span>HDFC0001234</span></p>
                            <p className="flex justify-between border-b border-blue-100 pb-2">Sector: <span>University Hub</span></p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function DonationImpactCard({ icon: Icon, title, description, color, accent }) {
    const accents = {
        blue: "shadow-blue-200/50 group-hover:shadow-blue-300/50 hover:bg-blue-50/10",
        purple: "shadow-purple-200/50 group-hover:shadow-purple-300/50 hover:bg-purple-50/10",
        emerald: "shadow-emerald-200/50 group-hover:shadow-emerald-300/50 hover:bg-emerald-50/10"
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={cn("premium-card p-10 bg-white group transition-all duration-500 shadow-2xl", accents[accent])}
        >
            <div className={`w-20 h-20 rounded-[2rem] ${color} flex items-center justify-center text-white mb-8 shadow-xl group-hover:rotate-6 transition-all duration-500`}>
                <Icon size={36} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">{title}</h3>
            <p className="text-slate-500 font-bold leading-relaxed">{description}</p>
        </motion.div>
    );
}
