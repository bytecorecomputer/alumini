import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

// Mock historical data for visual effect (since we don't store historical dates yet)
const generateActivityData = () => {
    const data = [];
    let currentScore = 0;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for(let i=0; i<7; i++) {
        currentScore += Math.floor(Math.random() * 50) + 10;
        data.push({ day: days[i], xp: currentScore, activity: Math.floor(Math.random() * 100) });
    }
    return data;
};

export default function ProgressCharts({ progress }) {
    const activityData = React.useMemo(() => generateActivityData(), []);

    // Build skills data dynamically based on completed modules
    const skillMap = {};
    (progress?.completedModules || []).forEach(mod => {
        const [course, topic] = mod.split('|');
        skillMap[course] = (skillMap[course] || 0) + 20; // 20 points per module
    });

    const skillsData = Object.keys(skillMap).map(key => ({
        subject: key.substring(0, 10), // truncate
        A: Math.min(100, skillMap[key] + 30), // add baseline 30
        fullMark: 100,
    }));

    // Fallback if no skills
    if (skillsData.length === 0) {
        skillsData.push(
            { subject: 'Word', A: 40, fullMark: 100 },
            { subject: 'Excel', A: 20, fullMark: 100 },
            { subject: 'Web', A: 10, fullMark: 100 },
            { subject: 'Logic', A: 30, fullMark: 100 },
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">
            {/* XP Growth Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40"
            >
                <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-900">Learning Curve</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">XP Gained this week</p>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Area type="monotone" dataKey="xp" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Skills Radar */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40"
            >
                <div className="mb-2">
                    <h3 className="text-lg font-black text-slate-900">Skill Analysis</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Competency Map</p>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Student" dataKey="A" stroke="#0ea5e9" strokeWidth={3} fill="#38bdf8" fillOpacity={0.3} />
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
