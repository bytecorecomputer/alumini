import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Zap, Award, Users, Laptop } from 'lucide-react';
import { cn } from '../../lib/utils';

const FeatureSlider = () => {
    const features = [
        {
            title: "Enterprise Lab Facility",
            desc: "Access high-performance workstations and professional dev environments used by top tech firms with dedicated gigabit connectivity.",
            icon: <Zap size={32} />,
            color: "bg-blue-600",
            shadow: "shadow-blue-500/20",
            extra: "30+ High-End Workstations"
        },
        {
            title: "ISO Certified Excellence",
            desc: "Global recognition for your technical skills with our ISO verified certifications that opening doors to international career opportunities.",
            icon: <Award size={32} />,
            color: "bg-indigo-600",
            shadow: "shadow-indigo-500/20",
            extra: "Verified Professional Credential"
        },
        {
            title: "Direct Industry Mentorship",
            desc: "Learn from instructors with 10+ years of industry experience building software for fortune 500 companies and leading startups.",
            icon: <Users size={32} />,
            color: "bg-purple-600",
            shadow: "shadow-purple-500/20",
            extra: "Personalized Career Coaching"
        },
        {
            title: "Real-World Architecture",
            desc: "Build production-grade applications to populate your professional engineering portfolio with code reviews and deployment cycles.",
            icon: <Laptop size={32} />,
            color: "bg-slate-900",
            shadow: "shadow-slate-500/20",
            extra: "Build-to-Learn Philosophy"
        }
    ];

    return (
        <div className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-3xl">
                        <motion.span 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline underline-offset-8 decoration-2 decoration-blue-100"
                        >
                            Why Choose The Lab?
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-[1000] text-slate-900 tracking-tight leading-[0.95]"
                        >
                            Design your future with <span className="text-blue-600">Enterprise Standards</span>.
                        </motion.h2>
                    </div>
                </div>

                <Swiper
                    spaceBetween={30}
                    centeredSlides={true}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="featureSwiper rounded-[3.5rem] !pb-16"
                >
                    {features.map((feature, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="p-10 md:p-16 rounded-[3.5rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center gap-12 min-h-[450px]">
                                <div className="flex-1">
                                    <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-10 text-white shadow-2xl", feature.color, feature.shadow)}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-xl mb-10">
                                        {feature.desc}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="px-5 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                                            {feature.extra}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block flex-1 h-full">
                                    <div className="w-full h-full bg-white rounded-[3rem] border border-slate-100 shadow-inner overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="absolute inset-0 flex items-center justify-center p-12">
                                            {React.cloneElement(feature.icon, { size: 180, className: "text-slate-100 group-hover:scale-110 transition-transform duration-1000" })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default FeatureSlider;
