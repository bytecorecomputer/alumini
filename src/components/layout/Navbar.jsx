import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Shield, Database, User, Zap, ArrowUpRight, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../app/common/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/auth';
import { cn } from '../../lib/utils';
import { getOptimizedUrl } from '../../lib/cloudinary';

const mobileNavItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const MobileNavLink = ({ to, children, onClick }) => (
    <motion.div variants={mobileNavItem}>
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-2 py-3 text-slate-600 hover:text-blue-600 font-bold text-[16px] transition-all group rounded-xl hover:bg-slate-50"
        >
            <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <span className="group-hover:translate-x-1 transition-transform uppercase tracking-tight">{children}</span>
        </Link>
    </motion.div>
);

const NavLink = ({ to, children }) => (
    <Link
        to={to}
        className="px-5 py-2.5 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 rounded-2xl"
    >
        {children}
    </Link>
);

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { user, userData, role, student, isStudent, logoutStudent } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        if (isStudent) {
            logoutStudent();
        } else if (user) {
            await signOut(auth);
        }
        setIsOpen(false);
        navigate('/login');
    };

    const mobileNavContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    return (
        <nav className={cn(
            "fixed top-0 w-full z-[100] transition-all duration-500 px-3 sm:px-4 md:px-8",
            scrolled ? "py-2.5 sm:py-3" : "py-3 sm:py-5"
        )}>
            <div className="max-w-7xl mx-auto flex justify-center">
                <div className={cn(
                    "glass flex justify-between items-center relative z-20 transition-all duration-500 w-full",
                    scrolled
                        ? "rounded-full shadow-2xl shadow-blue-900/10 border border-white/60 h-14 sm:h-16 max-w-5xl bg-white/85 backdrop-blur-2xl px-2.5 sm:px-4"
                        : "rounded-full sm:rounded-[2rem] shadow-lg shadow-slate-900/5 border border-white/70 h-14 sm:h-18 bg-white/85 backdrop-blur-xl px-3 sm:px-6"
                )}>
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 group-hover:scale-105 transition-all duration-300 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm border border-slate-100 p-1">
                            <img src="/logo.png" alt="ByteCore Logo" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none hidden lg:block italic">
                                ByteCore <span className="text-blue-600">Computer Centre</span>
                            </span>
                            <span className="font-black text-base sm:text-xl text-slate-900 tracking-tighter leading-none lg:hidden italic">
                                ByteCore
                            </span>
                        </div>
                    </Link>

                    {/* Minimal Desktop Nav - Responsive Center Aligned */}
                    <div className="hidden lg:flex flex-1 justify-center items-center px-4">
                        <div className="flex items-center bg-slate-100/50 backdrop-blur-md rounded-full p-1 border border-slate-200/50 overflow-hidden shadow-sm">
                            <NavLink to="/">Home</NavLink>
                            <NavLink to="/courses">Courses</NavLink>
                            <NavLink to="/quizzes">Quizzes</NavLink>
                            <a href="https://coderafroj.bytecores.in" target="_blank" rel="noopener noreferrer" className="relative px-3 md:px-5 py-2 text-[13px] md:text-sm font-semibold transition-all duration-300 text-slate-600 hover:text-blue-600 group flex items-center gap-1">CodeLabs <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span></a>
                            <NavLink to="/contact">Contact</NavLink>
                            {isStudent && <NavLink to="/student-portal">Dashboard</NavLink>}
                            {(role === 'admin' || role === 'super_admin') && (
                                <NavLink to="/admin/dashboard">Admin Hub</NavLink>
                            )}
                        </div>
                    </div>

                    {/* Actions (Responsive) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {user || isStudent ? (
                            <div className="flex items-center gap-2">
                                <Link to={isStudent ? "/student-portal" : "/profile"} className="flex items-center gap-1.5 p-1 pr-2.5 sm:pr-4 bg-white/80 hover:bg-white border border-slate-200 rounded-full transition-all group shadow-sm">
                                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                        {isStudent ? (
                                            student.photoUrl ? (
                                                <img src={student.photoUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white text-[10px] font-black uppercase">
                                                    {student.fullName?.[0]}
                                                </div>
                                            )
                                        ) : userData?.photoURL ? (
                                            <img src={getOptimizedUrl(userData.photoURL, 'w_100,h_100,c_fill,g_face,f_auto,q_auto')} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white text-[10px] font-black uppercase">
                                                {user.displayName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest hidden sm:block">
                                        {isStudent ? student.fullName?.split(' ')[0] : user.displayName?.split(' ')[0]}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 md:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all hidden md:block"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 md:gap-2.5">
                                <Link
                                    to="/student-login"
                                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[9px] md:text-[10px] uppercase tracking-wider sm:tracking-widest rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 whitespace-nowrap"
                                >
                                    <GraduationCap size={14} />
                                    <span>Portal</span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="hidden sm:inline-flex px-3 md:px-4 py-2 text-slate-600 hover:text-slate-900 font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Staff
                                </Link>
                                <Link
                                    to="/register"
                                    className="hidden sm:inline-flex px-3 md:px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap transition-colors"
                                >
                                    Join
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle Menu"
                                className="p-2.5 text-slate-900 bg-slate-100 hover:bg-white rounded-full transition-all border border-slate-200/70 shadow-sm active:scale-95"
                            >
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Overlay (The Toggle/Card Nav) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[90] lg:hidden flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative h-full w-full bg-white shadow-2xl p-6 md:p-12 pt-10 pb-32 flex flex-col overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center p-1 border border-slate-100">
                                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="font-black text-2xl text-slate-900 tracking-tighter italic">ByteCore</span>
                                </div>
                                <X size={32} onClick={() => setIsOpen(false)} className="text-slate-400 cursor-pointer" />
                            </div>

                            <motion.div
                                variants={mobileNavContainer}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col gap-6"
                            >
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 ml-2">Quick Navigation</p>
                                    <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home Landing</MobileNavLink>
                                    <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About Us</MobileNavLink>
                                    <MobileNavLink to="/courses" onClick={() => setIsOpen(false)}>Professional Courses</MobileNavLink>
                                    <MobileNavLink to="/quizzes" onClick={() => setIsOpen(false)}>Skill Quizzes</MobileNavLink>
                                    <a href="https://coderafroj.bytecores.in" target="_blank" rel="noopener noreferrer" className="block text-2xl font-black text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>CoderAfroj Arena <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span></a>
                                    <MobileNavLink to="/gallery" onClick={() => setIsOpen(false)}>Dome Gallery</MobileNavLink>
                                    {(role === 'admin' || role === 'super_admin') && (
                                        <>
                                            <MobileNavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>Admin Command Center</MobileNavLink>
                                            <MobileNavLink to="/admin/resources" onClick={() => setIsOpen(false)}>Materials Repository</MobileNavLink>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-1 pt-6 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 ml-2">ByteCore Network</p>
                                    <MobileNavLink to="/directory" onClick={() => setIsOpen(false)}>ByteCore Directory</MobileNavLink>
                                    <MobileNavLink to="/events" onClick={() => setIsOpen(false)}>Networking Events</MobileNavLink>
                                    <MobileNavLink to="/jobs" onClick={() => setIsOpen(false)}>Career & Jobs</MobileNavLink>
                                </div>

                                <div className="space-y-1 pt-6 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 ml-2">Academics & Support</p>
                                    <MobileNavLink to="/certificate" onClick={() => setIsOpen(false)}>Student Certificates</MobileNavLink>
                                    <MobileNavLink to="/donate" onClick={() => setIsOpen(false)}>Donate / Support</MobileNavLink>
                                    <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>Connect With Us</MobileNavLink>
                                </div>

                                <div className="mt-auto pt-10 space-y-4">
                                    {user || isStudent ? (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <LogOut size={16} /> Sign Out Session
                                        </button>
                                    ) : (
                                        <>
                                            <Link to="/student-login" onClick={() => setIsOpen(false)} className="block w-full py-4 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20">
                                                🎓 Student Portal Login
                                            </Link>
                                            <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full py-3.5 text-center border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-700">
                                                Staff / Admin Login
                                            </Link>
                                            <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full py-3.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                                Register Profile
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </nav>
    );
}
