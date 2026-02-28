import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Eye, Calendar, ArrowRight, Quote, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const team = [
    {
        name: "Maisar Hussain",
        role: "Centre Director",
        image: "/images/cd/maisar.jpg",
        desc: "Expert in training and mentoring future tech leaders.",
        whatsapp: "917455098949"
    },
    {
        name: "RAHUL",
        role: "Founder & CEO",
        image: "/images/cd/rahul.jfif",
        desc: "Former ITI at COPA with 3+ years in software development.",
        whatsapp: "918923916987"
    },
    {
        name: "AFROJ",
        role: "Web Dev",
        image: "/images/cd/coderafroj.jpg",
        desc: "BCA (present) & Web Developer passionate about student growth.",
        whatsapp: "917017733805"
    }
];

const testimonials = [
    {
        name: "Aditya Singh",
        course: "ADCA Student",
        image: "/images/students/ADITYA (ADCA).jpg",
        text: "Maine Bytecore se ADCA course kiya. Teachers bahut achhe se padhate hain aur practical knowledge milti hai. Computer skills improve ho gayi."
    },
    {
        name: "Manjeet Singh",
        course: "ADCA Student",
        image: "/images/students/MANJEET (ADCA).jpg",
        text: "ADCA course complete kiya Bytecore se. Multimedia aur animation bahut achhe se sikhaya. Projects bhi karwaye."
    },
    {
        name: "Manoj",
        course: "MDCA Student",
        image: "/images/students/MANOJ (MDCA).jpg",
        text: "ADCA course kiya yahan se. MS Office, Tally, Internet sab sikha diya. Ab office work easily kar leta hun."
    }
];

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 font-sans transition-colors duration-300 overflow-hidden">

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -ml-32 -mb-32 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase border border-blue-100"
                    >
                        Our Legacy
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tighter text-slate-900"
                    >
                        Empowering the Next <br />
                        <span className="text-blue-600">Generation</span> of Tech
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10"
                    >
                        Bytecore Computer Centre has been the bridge between ambition and achievement since 2010. We don't just teach code; we build careers.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center gap-4"
                    >
                        <button onClick={() => navigate('/register')} className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1">
                            Join Our Community
                        </button>
                        <button onClick={() => navigate('/courses')} className="px-8 py-4 bg-white text-slate-600 rounded-xl font-black uppercase text-xs tracking-widest border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all hover:-translate-y-1 shadow-sm">
                            Explore Courses
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-200 to-purple-200 opacity-50 blur-2xl rounded-[2.5rem] group-hover:opacity-70 transition-opacity duration-700"></div>
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                            <img src="/images/courseimg/BANNER.jpg" alt="Bytecore team working together" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" />
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hidden md:block border border-slate-100 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Community</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tight">1000+ Alumni</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter text-slate-900">Our <span className="text-purple-600">Story</span></h2>
                        <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed">
                            <p>
                                Our journey began with extensive research to identify the ideal location for quality IT education. We chose <span className="text-slate-900 font-bold">Nariyawal</span> to serve the community with accessible, high-standard tech training.
                            </p>
                            <p>
                                On <strong className="text-slate-900">May 13, 2010</strong>, passionate partners united with a shared vision. Established with a commitment to excellence, Bytecore Computer Centre has grown into a leading hub for IT education.
                            </p>
                            <p>
                                Today, we are proud to be a catalyst for digital literacy and professional growth, offering hands-on training that prepares students for real-world challenges.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-12">
                            <div className="p-6 rounded-2xl bg-white shadow-xl shadow-slate-100 border border-slate-50 hover:-translate-y-1 transition-transform">
                                <div className="text-4xl font-black text-blue-600 mb-2 tracking-tighter">2010</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Established</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white shadow-xl shadow-slate-100 border border-slate-50 hover:-translate-y-1 transition-transform">
                                <div className="text-4xl font-black text-purple-600 mb-2 tracking-tighter">10+</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Courses</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 bg-white border-y border-slate-100 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Our Core <span className="text-blue-600">Values</span></h2>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">The principles that guide everything we do at Bytecore.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100 group hover:bg-blue-50/50 transition-colors duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-300 shadow-inner">
                                <Target className="text-blue-600 group-hover:text-white transition-colors w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">Our Mission</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                To empower individuals with practical, industry-relevant tech skills that transform careers and drive innovation. We're committed to making quality IT education accessible to everyone.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100 group hover:bg-purple-50/50 transition-colors duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-8 group-hover:bg-purple-600 transition-colors duration-300 shadow-inner">
                                <Eye className="text-purple-600 group-hover:text-white transition-colors w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">Our Vision</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                To become the most trusted partner for tech education in India, recognized for producing highly skilled professionals who lead the digital transformation across industries.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Our <span className="text-purple-600">Journey</span></h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Milestones in our growth and success.</p>
                </div>

                <div className="max-w-3xl mx-auto relative">
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent rounded-full"></div>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative pl-24 pb-16 group"
                    >
                        <div className="absolute left-[26px] top-6 w-5 h-5 rounded-full bg-blue-600 border-[5px] border-white shadow-xl z-10 transition-transform group-hover:scale-125"></div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 group-hover:shadow-blue-100/50 transition-all">
                            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-slate-50 pb-4">
                                <h3 className="text-2xl font-black text-slate-900">Research & Planning</h3>
                                <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">Early 2010</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Conducted extensive research to identify the best location for establishing a quality computer training center in Nariyawal.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative pl-24 pb-12 group"
                    >
                        <div className="absolute left-[26px] top-6 w-5 h-5 rounded-full bg-purple-600 border-[5px] border-white shadow-xl z-10 transition-transform group-hover:scale-125"></div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 group-hover:shadow-purple-100/50 transition-all">
                            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-slate-50 pb-4">
                                <h3 className="text-2xl font-black text-slate-900">Founded Bytecore</h3>
                                <span className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-purple-100">May 2010</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Bytecore was established in Nariyawal with a vision to provide accessible and quality IT training.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Leadership Team */}
            <section className="py-24 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Meet The <span className="text-blue-600">Leadership</span></h2>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">The passionate team driving Bytecore's vision.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <div className="aspect-[4/5] overflow-hidden relative m-4 rounded-[2rem]">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <a
                                            href={`https://wa.me/${member.whatsapp}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="self-start px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md flex items-center gap-2 text-white hover:bg-[#25D366] transition-colors"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Connect</span>
                                        </a>
                                    </div>
                                </div>
                                <div className="p-8 text-center bg-white m-4 rounded-[2rem] shadow-sm">
                                    <h3 className="text-xl font-black mb-1 group-hover:text-blue-600 transition-colors tracking-tight text-slate-900">{member.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{member.role}</p>
                                    <p className="text-sm text-slate-500 font-medium line-clamp-2">{member.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Success <span className="text-purple-600">Stories</span></h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Hear from our students who have transformed their careers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 relative"
                        >
                            <Quote className="absolute top-10 right-10 w-12 h-12 text-slate-100" />
                            <div className="flex items-center gap-4 mb-8">
                                <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                                <div>
                                    <h4 className="font-black text-slate-900 tracking-tight text-lg">{t.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{t.course}</p>
                                </div>
                            </div>
                            <div className="flex text-amber-400 gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-slate-600 font-medium italic leading-relaxed">
                                "{t.text}"
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative border border-slate-800">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="md:w-1/2 mb-10 md:mb-0 text-white relative z-10">
                            <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Start Your Journey Today</h3>
                            <p className="text-slate-400 text-lg mb-10 max-w-md font-medium">Join the next batch of future tech leaders and start building your career with Bytecore today.</p>

                            <div className="space-y-5">
                                <div className="flex items-center gap-4 text-slate-300 font-medium">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    <span>Industry-expert instructors</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-300 font-medium">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    <span>100% Practical hands-on learning</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-300 font-medium">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    <span>Government recognized certifications</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-5/12 w-full relative z-10">
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
                                <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Ready to enroll?</h4>
                                <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">Create an account or login to access your student portal and enroll in premium courses.</p>

                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group mb-4"
                                >
                                    Create an Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all"
                                >
                                    Student Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;
