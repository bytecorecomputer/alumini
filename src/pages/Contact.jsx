import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, ArrowRight, Building, Globe } from 'lucide-react';

const Contact = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    const centers = [
        {
            name: "Nariyawal Campus (HQ)",
            address: "Nariyawal, Bareilly, Uttar Pradesh, India - 243122",
            phone: "+91 63968 35709",
            email: "bytecore.info@gmail.com",
            timing: "Mon - Sat: 8:00 AM - 7:00 PM (Sunday Off)",
            mapUrl: "https://www.google.com/maps/embed?pb=...", // Placeholder or real
            features: ["Main Computer Labs", "Admin Office", "Counseling Centre"],
            gradient: "from-blue-600 to-indigo-600"
        },
        {
            name: "Thiriya Campus",
            address: "Thiriya Nizamat Khan, Bareilly, Uttar Pradesh, India - 243123",
            phone: "+91 63968 35709",
            email: "bytecore.info@gmail.com",
            timing: "Mon - Sat: 8:00 AM - 7:00 PM (Sunday Off)",
            mapUrl: "https://www.google.com/maps/embed?pb=...", // Placeholder or real
            features: ["Advanced Coding Labs", "Student Hub", "Doubt Sessions"],
            gradient: "from-purple-600 to-pink-600"
        }
    ];

    return (
        <div className="bg-[#f8fafc] overflow-hidden selection:bg-blue-100 selection:text-blue-900 font-sans min-h-screen">
            <Helmet>
                <title>Contact Us | ByteCore Computer Centre</title>
                <meta name="description" content="Get in touch with ByteCore Computer Centre. Visit our Nariyawal and Thiriya campuses in Bareilly for the best IT and Coding courses." />
                <meta name="keywords" content="ByteCore Computer Centre, ByteCore contact, computer centre Nariyawal, computer centre Thiriya, Bareilly coding classes contact" />
                <link rel="canonical" href="https://bytecores.in/contact" />
                <meta property="og:title" content="Contact Us | ByteCore Computer Centre" />
                <meta property="og:description" content="Get in touch with ByteCore Computer Centre. Visit our Nariyawal and Thiriya campuses in Bareilly for the best IT and Coding courses." />
                <meta property="og:url" content="https://bytecores.in/contact" />
            </Helmet>

            {/* Premium Header Section */}
            <div className="relative py-24 bg-slate-900 overflow-hidden isolate">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>

                {/* Decorative Lights */}
                <div className="absolute top-0 right-1/4 w-[30%] h-[50%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-[30%] h-[50%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl mx-auto">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 mb-6 backdrop-blur-md">
                            <Globe size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">We Are Here For You</span>
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-xl">
                            Let's Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Future.</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-300 font-medium">
                            Reach out to our experts at <strong className="text-white">ByteCore Computer Centre</strong>. We have two state-of-the-art campuses in Bareilly ready to transform your career.
                        </motion.p>
                    </motion.div>
                </div>
            </div>

            {/* Centers Section */}
            <div className="py-24 max-w-7xl mx-auto px-6 relative z-20 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {centers.map((center, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 group hover:-translate-y-2 transition-transform duration-500"
                        >
                            {/* Card Header */}
                            <div className={`p-8 bg-gradient-to-br ${center.gradient} text-white relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                                        <Building size={28} className="text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight mb-2">{center.name}</h2>
                                    <p className="text-white/80 text-sm font-medium uppercase tracking-widest">Premium Learning Hub</p>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Location</p>
                                        <p className="text-slate-700 font-medium text-sm leading-relaxed">{center.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Phone</p>
                                        <p className="text-slate-900 font-bold text-lg">{center.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                                        <p className="text-slate-700 font-medium text-sm">{center.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Working Hours</p>
                                        <p className="text-slate-700 font-medium text-sm">{center.timing}</p>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="pt-6 border-t border-slate-100">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Centre Features</p>
                                    <div className="flex flex-wrap gap-2">
                                        {center.features.map((feature, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Inquiry Form Banner */}
            <div className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 rounded-full blur-[80px] -z-10"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Have Questions?</h3>
                            <p className="text-slate-300 font-medium mb-10 max-w-xl mx-auto">Drop by any of our campuses or send us a message. Our team is always ready to guide you towards the best tech career path.</p>

                            <form className="bg-white/10 backdrop-blur-md p-2 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto border border-white/20">
                                <input
                                    type="text"
                                    placeholder="Enter your phone number..."
                                    className="flex-1 bg-transparent text-white px-6 py-4 outline-none placeholder:text-slate-400 font-medium"
                                />
                                <button type="button" className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 active:scale-95">
                                    Call Me Back <ArrowRight size={16} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
