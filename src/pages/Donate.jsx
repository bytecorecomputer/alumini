import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Building, GraduationCap, ArrowRight, CreditCard, Gift, Target, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { sendTelegramNotification } from '../lib/telegram';
import SEO from '../components/common/SEO';

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

        // Validate Key Presence
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            alert("Razorpay Key is missing in client configuration. If you are testing online, please add VITE_RAZORPAY_KEY_ID to Vercel Environment Variables.");
            setIsLoading(false);
            return;
        }

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create Order on Backend
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalAmount })
            });
            
            if (!orderRes.ok) {
                const errorData = await orderRes.json().catch(() => ({}));
                throw new Error(`API Error (${orderRes.status}): ${errorData.details || errorData.error || 'Failed to create order'}`);
            }

            const orderData = await orderRes.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Alumni Association",
                description: "Empowering the Legacy Donation",
                image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                order_id: orderData.id,
                handler: async function (response) {
                    setIsLoading(true);
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok && verifyData.success) {
                            setPaymentId(response.razorpay_payment_id);
                            setIsSuccess(true);
                            setIsLoading(false);

                            // Send Telegram Notification
                            await sendTelegramNotification('donation', {
                                name,
                                email,
                                amount: finalAmount,
                                paymentId: response.razorpay_payment_id
                            });
                        } else {
                            throw new Error(verifyData.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        alert(err.message);
                        setIsLoading(false);
                    }
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
        } catch (error) {
            alert(error.message);
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-950 flex items-center justify-center relative overflow-hidden">
                {/* Matrix-like background effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-slate-950 to-slate-950"></div>
                    <div className="grid grid-cols-12 h-full w-full">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: ['0%', '100%'], opacity: [0, 1, 0] }}
                                transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
                                className="w-px bg-gradient-to-b from-transparent via-rose-500/50 to-transparent h-40 mx-auto"
                            />
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="max-w-2xl w-full bg-white/5 backdrop-blur-3xl p-1 md:p-1 rounded-[3rem] border border-white/10 shadow-3xl perspective-1000"
                >
                    <div className="bg-white rounded-[2.9rem] p-12 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 animate-gradient-x"></div>

                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-10 text-rose-600 border-2 border-rose-100 relative shadow-lg shadow-rose-100/50">
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                            >
                                <ShieldCheck size={48} strokeWidth={2.5} />
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute inset-0 rounded-full bg-rose-400/20"
                            />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter italic">
                            Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 font-black not-italic uppercase">Successful.</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg mb-12 max-w-md mx-auto leading-relaxed">
                            Your legacy contribution has been securely processed and integrated into the global network.
                        </p>

                        <div className="bg-slate-50 rounded-3xl p-8 mb-12 border border-slate-100 space-y-6 text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0"></div>
                            
                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <span className="flex items-center gap-2"><Zap size={10} className="text-rose-500" /> Transaction Hash</span>
                                    <span className="text-slate-900 select-all font-mono bg-white px-3 py-1 rounded-full border border-slate-100">{paymentId}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <span className="flex items-center gap-2"><Target size={10} className="text-blue-500" /> Status</span>
                                    <span className="text-emerald-600 flex items-center gap-1.5 font-black">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                                        VERIFIED_BY_SYSTEM
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <span className="flex items-center gap-2"><Building size={10} className="text-purple-500" /> Network Node</span>
                                    <span className="text-slate-900 font-black">{name}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setAmount('100');
                            }}
                            className="w-full py-6 bg-slate-950 text-white rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 group flex items-center justify-center gap-4 transition-all hover:bg-slate-900 hover:-translate-y-1"
                        >
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span className="uppercase tracking-[0.5em] font-black text-sm">Return to Command Center</span>
                        </button>

                        <div className="mt-10 flex items-center justify-center gap-3">
                            <span className="h-px w-8 bg-slate-100"></span>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
                                End of Transmission
                            </p>
                            <span className="h-px w-8 bg-slate-100"></span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }


    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-50 relative overflow-hidden">
            <SEO
                title="Empower the Legacy | Donate"
                description="Support ByteCore Computer Centre in empowering the next generation of tech leaders. Sponsor scholarships, infrastructure, and events."
                url="https://bytecores.in/donate"
            />
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
                        <div className="bg-slate-950 p-12 text-center relative overflow-hidden group">
                            {/* Animated background lines */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-rose-500 animate-scanline"></div>
                                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(225,29,72,0.1)_50%,transparent_100%)] bg-[length:100%_4px]"></div>
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/30 via-transparent to-blue-600/10"></div>
                            
                            {/* Glowing corner accents */}
                            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-rose-500/30 rounded-tl-3xl group-hover:border-rose-500 transition-colors duration-500"></div>
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/30 rounded-br-3xl group-hover:border-blue-500 transition-colors duration-500"></div>

                            <div className="relative z-10 space-y-2">
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-block px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[8px] text-rose-500 font-black tracking-[0.3em] uppercase mb-2"
                                >
                                    System Status: Online
                                </motion.div>
                                <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-1 italic leading-none">
                                    Initialization <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 font-black not-italic uppercase">Terminal</span>
                                </h2>
                                <div className="flex items-center justify-center gap-4 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></span>
                                    Contribution Protocol v5.0.4
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></span>
                                </div>
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
