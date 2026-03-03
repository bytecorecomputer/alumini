import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LogOut, Shield, Database, User, Zap } from 'lucide-react';
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
            className="block px-6 py-4 text-slate-900 font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 rounded-[2rem] transition-all"
        >
            {children}
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
                            className="relative h-[calc(100vh-32px)] w-[calc(100%-32px)] max-w-sm bg-white/95 backdrop-blur-3xl shadow-[0_0_100px_rgba(30,58,138,0.2)] rounded-[2.5rem] p-8 pt-12 m-4 flex flex-col overflow-y-auto overflow-x-hidden border border-white/80 perspective-[1000px]"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <span className="font-black text-xl text-slate-900 tracking-tighter">Navigation</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <motion.div
                                variants={mobileNavContainer}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col gap-2 flex-grow"
                            >
                                <motion.div variants={mobileNavItem}><MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink></motion.div>
                                {isStudent && <motion.div variants={mobileNavItem}><MobileNavLink to="/student-portal" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink></motion.div>}
                                <motion.div variants={mobileNavItem}><MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About Us</MobileNavLink></motion.div>
                                <motion.div variants={mobileNavItem}><MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</MobileNavLink></motion.div>

                                {(role === 'admin' || role === 'super_admin') && (
                                    <>
                                        <motion.div variants={mobileNavItem} className="h-px bg-slate-100 my-3" />
                                        <motion.div variants={mobileNavItem}>
                                            <MobileNavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>
                                                <div className="flex items-center gap-2 text-purple-600">
                                                    <Shield size={16} /> Admin Panel
                                                </div>
                                            </MobileNavLink>
                                        </motion.div>
                                        <motion.div variants={mobileNavItem}>
                                            <MobileNavLink to="/admin/coaching" onClick={() => setIsOpen(false)}>
                                                <div className="flex items-center gap-2 text-blue-600">
                                                    <Database size={16} /> Student Management
                                                </div>
                                            </MobileNavLink>
                                        </motion.div>
                                    </>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
                                className="pt-6 mt-6 border-t border-slate-100 space-y-4 pb-8"
                            >
                                {user || isStudent ? (
                                    <>
                                        <Link
                                            to={isStudent ? "/student-portal" : "/profile"}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-3xl transition-colors group"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md overflow-hidden border-2 border-white">
                                                {isStudent ? (
                                                    student.photoUrl ? (
                                                        <img src={student.photoUrl} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white text-sm font-black uppercase">
                                                            {student.fullName?.[0]}
                                                        </div>
                                                    )
                                                ) : userData?.photoURL ? (
                                                    <img src={getOptimizedUrl(userData.photoURL, 'w_100,h_100,c_fill,g_face,f_auto,q_auto')} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-sm truncate max-w-[150px]">
                                                    {isStudent ? student.fullName : user.displayName}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {isStudent ? "Student Profile" : role}
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-3 p-4 text-red-600 font-black uppercase tracking-widest text-xs hover:bg-red-50 rounded-3xl transition-all border border-transparent hover:border-red-100"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout System</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-4 text-center text-slate-900 font-black uppercase tracking-widest text-xs border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all">Login / Portal</Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-4 text-center bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">Join Network</Link>
                                    </div>
                                )}
                            </motion.div>

                            <div className="flex items-center justify-center gap-2 text-slate-300 mt-auto">
                                <Zap size={14} />
                                <span className="text-[10px] uppercase font-black tracking-widest">Secure Link Established</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </nav>
    );
}
