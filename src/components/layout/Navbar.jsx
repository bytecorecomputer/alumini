import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Shield, Database, User, Zap, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../app/common/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/auth';
import { cn } from '../../lib/utils';
import { getOptimizedUrl } from '../../lib/cloudinary';

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

    const NavLink = ({ to, children }) => (
        <Link
            to={to}
            className="px-5 py-2.5 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 rounded-2xl"
        >
            {children}
        </Link>
    );

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

    const mobileNavItem = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <nav className={cn(
            "fixed top-0 w-full z-[100] transition-all duration-700 px-4 md:px-8 py-6",
            scrolled ? "py-3" : "py-6"
        )}>
            <div className="max-w-7xl mx-auto flex justify-center">
                <div className={cn(
                    "glass px-6 h-20 flex justify-between items-center relative z-20 transition-all duration-700",
                    scrolled
                        ? "rounded-full shadow-2xl shadow-blue-900/10 border-white/40 h-16 w-full max-w-5xl bg-white/70 backdrop-blur-2xl px-1.5"
                        : "rounded-[2.5rem] shadow-none border-transparent h-20 w-full bg-transparent px-6"
                )}>
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center gap-3 group ml-2">
                        <div className="h-10 w-10 group-hover:scale-110 transition-all duration-500 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm border border-slate-100 p-1">
                            <img src="/logo.png" alt="ByteCore Logo" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none hidden lg:block italic">
                                ByteCore <span className="text-blue-600">Computer Centre</span>
                            </span>
                            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none lg:hidden italic">
                                ByteCore
                            </span>
                        </div>
                    </Link>

                    {/* Minimal Desktop Nav - Center Aligned */}
                    <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 bg-slate-100/50 backdrop-blur-md rounded-full p-1 border border-slate-200/50">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/courses">Courses</NavLink>
                        <NavLink to="/contact">Contact</NavLink>
                        {isStudent && <NavLink to="/student-portal">Dashboard</NavLink>}
                    </div>

                    {/* Actions (Responsive) */}
                    <div className="flex items-center gap-2">
                        {user || isStudent ? (
                            <div className="flex items-center gap-2">
                                <Link to={isStudent ? "/student-portal" : "/profile"} className="flex items-center gap-1.5 p-1 pr-3 md:pr-4 bg-white/80 hover:bg-white border border-slate-200 rounded-full transition-all group shadow-sm">
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
                            <div className="flex items-center gap-1.5 md:gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 md:px-6 py-2.5 text-slate-500 hover:text-slate-900 font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-premium px-5 md:px-8 py-2.5 md:py-3.5 bg-slate-900 text-white shadow-lg shadow-slate-200 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap"
                                >
                                    Join
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-3 text-slate-900 bg-slate-100 hover:bg-white rounded-2xl transition-all border border-transparent shadow-sm active:scale-95"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
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
                            className="relative h-full w-full bg-white shadow-2xl p-6 md:p-12 pt-10 flex flex-col overflow-y-auto"
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
                                    <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About Our Journey</MobileNavLink>
                                    <MobileNavLink to="/gallery" onClick={() => setIsOpen(false)}>Lab Gallery Feed</MobileNavLink>
                                    <MobileNavLink to="/courses" onClick={() => setIsOpen(false)}>Professional Courses</MobileNavLink>
                                    <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>Connect with Us</MobileNavLink>
                                </div>

                                <div className="space-y-1 pt-6 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-4 ml-2">Academics & Trust</p>
                                    <MobileNavLink to="/certificate" onClick={() => setIsOpen(false)}>Student Certificates</MobileNavLink>
                                    <MobileNavLink to="/fee-check" onClick={() => setIsOpen(false)}>Course Fee Verification</MobileNavLink>
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
                                            <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full py-4 text-center border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-700">
                                                Login Account
                                            </Link>
                                            <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full py-4 text-center bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200">
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
