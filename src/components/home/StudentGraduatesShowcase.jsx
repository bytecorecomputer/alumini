import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STUDENT_GRADUATES } from '../../data/studentGraduates';
import { Search, GraduationCap, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StudentGraduatesShowcase() {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  const coursesList = useMemo(() => {
    const set = new Set(STUDENT_GRADUATES.map((s) => s.course));
    return ['ALL', ...Array.from(set).sort()];
  }, []);

  const filteredStudents = useMemo(() => {
    return STUDENT_GRADUATES.filter((s) => {
      const courseMatch = selectedCourse === 'ALL' || s.course === selectedCourse;
      const searchMatch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.course.toLowerCase().includes(search.toLowerCase());
      return courseMatch && searchMatch;
    });
  }, [search, selectedCourse]);

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden font-sans border-t border-slate-900">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            <Award size={14} className="text-yellow-400" /> ByteCore Course Graduates
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 uppercase italic"
          >
            Our Star <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-indigo-400">Graduates & Alumni</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-400 font-medium text-sm md:text-base leading-relaxed"
          >
            Meet the successful students trained at ByteCore Computer Centre. Every graduate represents hard work, practical excellence, and career achievement.
          </motion.p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white/5 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 shadow-2xl">
          {/* Course Pills */}
          <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start w-full md:w-auto">
            {coursesList.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={cn(
                  'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300',
                  selectedCourse === course
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                )}
              >
                {course}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search graduate by name or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Graduates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.3) }}
                className="group relative bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-xl hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-500"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-slate-950 relative">
                  <img
                    src={student.src}
                    alt={student.displayName}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-emerald-400 shadow-md">
                    <CheckCircle2 size={12} />
                  </div>
                </div>

                <div className="p-3 text-center relative z-10 bg-slate-900 border-t border-white/5">
                  <h4 className="font-black text-white text-xs md:text-sm tracking-tight truncate capitalize mb-0.5">
                    {student.name}
                  </h4>
                  <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">
                    ({student.course})
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/10">
            <GraduationCap size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 font-bold text-sm">No graduates found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
}
