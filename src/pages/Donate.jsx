import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Building, GraduationCap, ArrowRight, CreditCard, Gift, Target, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { sendTelegramNotification } from '../lib/telegram';

export default function Donate() {
    const [amount, setAmount] = useState('100');
    const [customAmount, setCustomAmount] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentId, setPaymentId] = useState('');

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        const finalAmount = amount === 'Custom' ? customAmount : amount.replace('$', '').replace('k', '000');
        if (!finalAmount || isNaN(finalAmount) || parseFloat(finalAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        setIsLoading(true);

        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            alert("Razorpay Key is missing. Please check your environment configuration.");
            setIsLoading(false);
            return;
        }

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsLoading(false);
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: parseFloat(finalAmount) * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            name: "Alumni Association",
            description: "Empowering the Legacy Donation",
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            handler: async function (response) {
                setPaymentId(response.razorpay_payment_id);
                setIsSuccess(true);

                // Send Telegram Notification
                await sendTelegramNotification('donation', {
                    name,
                    email,
                    amount: finalAmount,
                    paymentId: response.razorpay_payment_id
                });
            },
            prefill: {
                name: name,
                email: email,
            },
            theme: {
                color: "#E11D48", // Rose-600
            },
            modal: {
                ondismiss: function () {
                    setIsLoading(false);
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setIsLoading(false);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="max-w-2xl w-full premium-card bg-white p-12 text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-600 to-orange-600"></div>

                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-600 border-2 border-rose-100 relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, delay: 0.2 }}
                        >
                            <ShieldCheck size={48} />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full bg-rose-200/20"
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter italic">Connection <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 font-black not-italic uppercase">Verified.</span></h1>
                    <p className="text-slate-500 font-bold text-lg mb-10 max-w-md mx-auto">
                        Your contribution has been successfully initialized and incorporated into the legacy network.
                    </p>

                    <div className="bg-slate-50 rounded-3xl p-8 mb-10 border border-slate-100 space-y-4 text-left">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Payment ID</span>
                            <span className="text-slate-900 select-all font-mono">{paymentId}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Status</span>
                            <span className="text-emerald-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Success_Confirmed
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Network Node</span>
                            <span className="text-slate-900">{name}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setIsSuccess(false);
                            setAmount('100');
                        }}
                        className="btn-premium w-full py-6 bg-slate-900 text-white shadow-2xl shadow-rose-950/20 active:scale-95 group flex items-center justify-center gap-4 transition-all hover:bg-slate-800"
                    >
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        <span className="uppercase tracking-[0.4em] font-black">Return to Core</span>
                    </button>

                    <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-300">
                        Thank you for empowering the next generation of excellence.
                    </p>
                </motion.div>
            </div>
        );
    }

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
                                        onClick={() => setAmount(amt)}
                                        className={cn(
                                            "p-6 rounded-2xl border-2 font-black uppercase tracking-widest text-xs transition-all active:scale-95",
                                            amount === amt
                                                ? "border-rose-600 text-rose-600 bg-rose-50 shadow-xl shadow-rose-100"
                                                : "border-slate-50 text-slate-400 hover:border-rose-200 hover:text-rose-400"
                                        )}
                                    >
                                        {amt}
                                    </button>
                                ))}
                            </div>

                            <form className="space-y-10" onSubmit={handlePayment}>
                                {amount === 'Custom' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Amount (INR)</label>
                                        <input
                                            type="number"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-100 outline-none text-slate-800 font-bold transition-all"
                                            placeholder="Enter amount"
                                            required
                                        />
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Tag</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-100 outline-none text-slate-800 font-bold transition-all"
                                            placeholder="Full Name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network UID</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-100 outline-none text-slate-800 font-bold transition-all"
                                            placeholder="Email Address"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-premium w-full py-6 bg-slate-900 text-white shadow-2xl shadow-rose-950/20 active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 size={24} className="animate-spin mx-auto" />
                                    ) : (
                                        <>
                                            <CreditCard size={24} className="group-hover:rotate-12 transition-transform" />
                                            <span className="uppercase tracking-[0.4em] font-black ml-4">Execute Connection</span>
                                        </>
                                    )}
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
