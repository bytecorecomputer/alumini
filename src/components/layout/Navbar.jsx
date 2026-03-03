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
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-2 py-3 text-white/80 hover:text-white font-medium text-[15px] transition-all group"
        >
            <ArrowUpRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            <span className="group-hover:translate-x-1 transition-transform">{children}</span>
        </Link>
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
            "fixed top-0 w-full z-[100] transition-all duration-500 px-4 md:px-8 py-4",
            scrolled ? "py-2" : "py-4"
        )}>
            <div className="max-w-7xl mx-auto">
                <div className={cn(
                    "glass rounded-[2rem] px-6 h-20 flex justify-between items-center relative z-20 transition-all duration-500",
                    scrolled ? "shadow-2xl shadow-slate-200/50 border-white/40 h-16" : "shadow-none border-transparent h-20"
                )}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-auto group-hover:scale-105 transition-all duration-500 rounded-lg overflow-hidden flex items-center justify-center bg-white p-1">
                            <img src="/assets/img/logo.png" alt="ByteCore Logo" className="h-full w-auto object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150x50?text=ByteCore" }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none hidden sm:block">
                                ByteCore <span className="text-blue-600">Computer Centre</span>
                            </span>
                            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none sm:hidden">
                                ByteCore
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-1">
                        <NavLink to="/">Home</NavLink>
                        {isStudent && <NavLink to="/student-portal">Dashboard</NavLink>}
                        <NavLink to="/about">About Us</NavLink>
                        <NavLink to="/contact">Contact</NavLink>

                        {(role === 'admin' || role === 'super_admin') && (
                            <div className="relative group/mgmt">
                                <button className="px-5 py-2.5 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 rounded-2xl flex items-center gap-2">
                                    <Shield size={16} className="text-blue-600" /> Management
                                </button>
                                <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/mgmt:opacity-100 group-hover/mgmt:translate-y-0 group-hover/mgmt:pointer-events-auto transition-all duration-300">
                                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 min-w-[200px]">
                                        <Link to="/admin/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group/item">
                                            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg group-hover/item:bg-purple-600 group-hover/item:text-white transition-colors">
                                                <Shield size={14} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Admin Panel</span>
                                        </Link>
                                        <Link to="/admin/coaching" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group/item">
                                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                                                <Database size={14} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Students</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="h-6 w-px bg-slate-200/60 mx-4" />

                        {user || isStudent ? (
                            <div className="flex items-center gap-3">
                                <Link to={isStudent ? "/student-portal" : "/profile"} className="flex items-center gap-3 p-1 pr-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-full transition-all group shadow-sm">
                                    <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
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
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                        {isStudent ? student.fullName?.split(' ')[0] : user.displayName?.split(' ')[0]}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="px-6 py-2.5 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors">Login</Link>
                                <Link to="/register" className="btn-premium px-8 py-3.5 bg-slate-900 text-white shadow-xl shadow-slate-200 text-xs uppercase tracking-widest">
                                    Join Network
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-3 text-slate-900 bg-slate-50 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Overlay (Card Nav Style) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[90] lg:hidden flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '120%', scale: 0.9, opacity: 0, rotateY: 15 }}
                            animate={{ x: 0, scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ x: '120%', scale: 0.9, opacity: 0, rotateY: 15 }}
                            transition={{ type: "spring", damping: 22, stiffness: 200, mass: 1, bounce: 0.2 }}
                            className="relative h-[calc(100vh-32px)] w-[calc(100%-32px)] max-w-sm bg-[#f8fafc] backdrop-blur-3xl shadow-[0_0_100px_rgba(30,58,138,0.2)] rounded-[2.5rem] p-6 pt-10 m-4 flex flex-col overflow-y-auto overflow-x-hidden border border-white perspective-[1000px] no-scrollbar"
                        >
                            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#0f172a 2px, transparent 2px)', backgroundSize: '24px 24px' }} />

                            <div className="flex justify-between items-center mb-8 relative z-10 px-2 mt-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                                        <Zap size={20} className="text-white" />
                                    </div>
                                    <span className="font-black text-2xl text-slate-900 tracking-tighter">ByteCore</span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-all"
                                >
                                    <X size={28} strokeWidth={1.5} />
                                </button>
                            </div>

                            <motion.div
                                variants={mobileNavContainer}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col gap-4 flex-grow relative z-10 pb-20"
                            >
                                {/* Pages Card */}
                                <motion.div variants={mobileNavItem} className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-800">
                                    <h4 className="text-white font-black text-xl mb-3 tracking-tight">Explore</h4>
                                    <div className="flex flex-col">
                                        <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
                                        <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About Us</MobileNavLink>
                                        <MobileNavLink to="/courses" onClick={() => setIsOpen(false)}>Courses</MobileNavLink>
                                        <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</MobileNavLink>
                                    </div>
                                </motion.div>

                                {/* Academics Card */}
                                <motion.div variants={mobileNavItem} className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-800">
                                    <h4 className="text-white font-black text-xl mb-3 tracking-tight">Academics</h4>
                                    <div className="flex flex-col">
                                        <MobileNavLink to="/certificate" onClick={() => setIsOpen(false)}>Certificate Download</MobileNavLink>
                                        <MobileNavLink to="/fee-check" onClick={() => setIsOpen(false)}>Fee Check / Verify</MobileNavLink>
                                    </div>
                                </motion.div>

                                {/* Management / Portal Card */}
                                <motion.div variants={mobileNavItem} className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-800">
                                    <h4 className="text-white font-black text-xl mb-3 tracking-tight">Portal Interface</h4>
                                    <div className="flex flex-col">
                                        {user || isStudent ? (
                                            <>
                                                <MobileNavLink to={isStudent ? "/student-portal" : "/profile"} onClick={() => setIsOpen(false)}>
                                                    <span className="text-blue-400">{isStudent ? student?.fullName?.split(' ')[0] + "'s Profile" : role}</span>
                                                </MobileNavLink>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-2 py-3 text-red-500 hover:text-red-400 transition-all group text-left font-medium text-[15px]"
                                                >
                                                    <LogOut size={16} className="text-red-500/50 group-hover:text-red-400 group-hover:-translate-x-1 transition-all" />
                                                    <span className="group-hover:translate-x-1 transition-transform">Logout Session</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <MobileNavLink to="/login" onClick={() => setIsOpen(false)}>Login / Secure Access</MobileNavLink>
                                                <MobileNavLink to="/register" onClick={() => setIsOpen(false)}>Join Main Network</MobileNavLink>
                                            </>
                                        )}

                                        {(role === 'admin' || role === 'super_admin') && (
                                            <div className="pt-4 border-t border-slate-700/50 mt-3 flex flex-col gap-1">
                                                <MobileNavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>
                                                    <span className="text-purple-400">Main Admin Panel</span>
                                                </MobileNavLink>
                                                <MobileNavLink to="/admin/coaching" onClick={() => setIsOpen(false)}>
                                                    <span className="text-purple-400">Student Database</span>
                                                </MobileNavLink>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </nav>
    );
}
