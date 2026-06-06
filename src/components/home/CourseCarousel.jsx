import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { courses as localCourses } from '../../data/courses';

const CourseCarousel = () => {
    const navigate = useNavigate();

    return (
        <div className="py-24 bg-white border-b border-slate-100 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Accelerate Your Coding Career</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            World-Class <span className="text-purple-600">IT Training</span>.
                        </h2>
                    </div>
                    <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-full bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-xs border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2 group active:scale-95">
                        Check All Fees & Syllabus <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="relative mt-8 group course-slider-container">
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={30}
                        breakpoints={{
                            640: { slidesPerView: 1, spaceBetween: 20 },
                            768: { slidesPerView: 2, spaceBetween: 30 },
                            1024: { slidesPerView: 3, spaceBetween: 40 },
                        }}
                        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        modules={[Autoplay, Pagination]}
                        className="!pb-16 px-4"
                    >
                        {localCourses.filter(c => [1, 10, 8, 18, 7, 6, 21, 20].includes(c.id)).map((course) => (
                            <SwiperSlide key={course.id} className="h-auto">
                                <div
                                    onClick={() => navigate(`/courses/${course.id || course.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                    className="h-full bg-white rounded-[3rem] p-8 border border-slate-100 hover:border-blue-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(59,130,246,0.15)] transition-all duration-500 flex flex-col relative overflow-hidden group/card cursor-pointer transform hover:-translate-y-2"
                                >
                                    <div className="h-64 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-blue-50/30 mb-8 overflow-hidden relative shadow-inner border border-slate-100/50 flex items-center justify-center group-hover/card:bg-blue-50 transition-colors duration-500">
                                        <div className="w-full h-full p-6 relative z-10 flex items-center justify-center">
                                            <img
                                                src={course.illustration || `/images/courses/adca.png`}
                                                alt={course.title}
                                                className="w-full h-full object-contain group-hover/card:scale-110 transition-transform duration-700 pointer-events-none drop-shadow-xl"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = "https://storyset.com/illustration/web-development-amico.svg";
                                                }}
                                            />
                                        </div>

                                        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-5 py-2 rounded-xl border border-white/50 shadow-sm text-[10px] font-[1000] uppercase tracking-widest text-blue-600 z-20">
                                            {course.category}
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover/card:text-blue-600 transition-colors tracking-tight line-clamp-2 leading-tight">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</span>
                                            <span className="text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                                                <CheckCircle size={12} className="fill-emerald-100" /> Active
                                            </span>
                                        </div>
                                        <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover/card:bg-blue-600 group-hover/card:shadow-lg group-hover/card:shadow-blue-500/30 transition-all duration-300">
                                            <ArrowRight size={22} className="group-hover/card:-rotate-45 transition-transform duration-300" />
                                        </div>
                                    </div>

                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl group-hover/card:bg-blue-600/10 transition-colors duration-700"></div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default CourseCarousel;
