import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, IndianRupee, Briefcase } from 'lucide-react';

const ROICalculator = () => {
    const [course, setCourse] = useState('fullstack');
    const [experience, setExperience] = useState(0); // 0-5 years

    const data = {
        fullstack: { name: 'Full Stack Dev', base: 300000, max: 1500000, roles: ['Frontend Engineer', 'Backend Dev', 'Tech Lead'] },
        python: { name: 'Python Data Science', base: 350000, max: 1800000, roles: ['Data Analyst', 'Python Developer', 'AI Engineer'] },
        adca: { name: 'ADCA / Core IT', base: 180000, max: 600000, roles: ['Data Entry Operator', 'Office Exec', 'IT Support'] },
        tally: { name: 'Tally Prime', base: 200000, max: 700000, roles: ['Junior Accountant', 'Senior Acc.', 'Financial Analyst'] }
    };

    const selectedData = data[course];
    const calculatedSalary = selectedData.base + (experience * ((selectedData.max - selectedData.base) / 5));

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    
                    {/* Left Text */}
                    <div className="flex-1">
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block flex items-center gap-2">
                                <Calculator size={14} /> Career ROI Calculator
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">
                                See Your True <span className="text-blue-600">Earning Potential</span>.
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                                Don't just take a course. Make an investment. Use real industry data to see how much your salary can grow after graduating from ByteCore.
                            </p>
                            
                            <div className="flex flex-col gap-4">
                                {selectedData.roles.map((role, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-100 shadow-sm">
                                        <Briefcase size={16} className="text-slate-400" />
                                        <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">{role}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Calculator */}
                    <div className="flex-1 w-full">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }}
                            className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative"
                        >
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl"></div>
                            
                            <div className="mb-8 relative z-10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Select Your Path</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(data).map(([key, val]) => (
                                        <button 
                                            key={key}
                                            onClick={() => setCourse(key)}
                                            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${course === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                                        >
                                            {val.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-12 relative z-10">
                                <div className="flex justify-between items-end mb-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Years of Experience</label>
                                    <span className="text-xl font-black text-slate-900">{experience} Years</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="5" 
                                    value={experience} 
                                    onChange={(e) => setExperience(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase">
                                    <span>Fresher</span>
                                    <span>Senior (5+)</span>
                                </div>
                            </div>

                            <div className="bg-slate-950 rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block mb-2 flex items-center gap-2">
                                    <TrendingUp size={14} /> Expected CTC
                                </span>
                                <div className="text-4xl md:text-5xl font-[1000] text-white tracking-tighter">
                                    {formatCurrency(calculatedSalary)} <span className="text-lg text-slate-500 font-medium">/ yr</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ROICalculator;
