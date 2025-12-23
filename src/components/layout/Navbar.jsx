import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LogOut, User, Shield, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../app/common/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/auth';
import { cn } from '../../lib/utils';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { user, userData, role } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
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
                        <div className="bg-slate-900 text-white p-2.5 rounded-2xl group-hover:rotate-12 transition-all duration-500 shadow-xl group-hover:shadow-blue-500/20">
                            <GraduationCap size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none">
                                Alumni<span className="text-blue-600">Connect</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-2">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/directory">Members</NavLink>
                        <NavLink to="/events">Events</NavLink>
                        <NavLink to="/jobs">Jobs</NavLink>
                        <NavLink to="/donate">Donate</NavLink>

                        {(role === 'admin' || role === 'super_admin') && (
                            <Link
                                to="/admin/dashboard"
                                className="px-5 py-2.5 text-purple-600 hover:text-purple-700 font-black text-xs uppercase tracking-widest transition-all hover:bg-purple-50 rounded-2xl flex items-center gap-2"
                            >
                                <Shield size={16} /> Admin
                            </Link>
                        )}

                        <div className="h-6 w-px bg-slate-200/60 mx-4" />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-3 p-1 pr-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-full transition-all group shadow-sm">
                                    <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        {userData?.photoURL ? (
                                            <img src={userData.photoURL} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white text-[10px] font-black">
                                                {user.displayName?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{user.displayName?.split(' ')[0]}</span>
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

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[90] lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 h-screen w-[85%] max-w-sm bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] p-8 pt-24"
                        >
                            <div className="flex flex-col gap-2">
                                <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
                                <MobileNavLink to="/directory" onClick={() => setIsOpen(false)}>Members</MobileNavLink>
                                <MobileNavLink to="/events" onClick={() => setIsOpen(false)}>Events</MobileNavLink>
                                <MobileNavLink to="/jobs" onClick={() => setIsOpen(false)}>Jobs</MobileNavLink>
                                <MobileNavLink to="/donate" onClick={() => setIsOpen(false)}>Donate</MobileNavLink>

                                {(role === 'admin' || role === 'super_admin') && (
                                    <MobileNavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>
                                        <div className="flex items-center gap-2 text-purple-600">
                                            <Shield size={16} /> Admin Panel
                                        </div>
                                    </MobileNavLink>
                                )}

                                {user ? (
                                    <div className="pt-8 mt-8 border-t border-slate-100 space-y-4">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] group"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-sm">My Profile</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">View Profile</div>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-3 p-5 text-red-600 font-black uppercase tracking-widest text-xs hover:bg-red-50 rounded-[2rem] transition-all border border-transparent hover:border-red-100"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col gap-4">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full py-5 text-center text-slate-900 font-black uppercase tracking-widest text-xs"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="btn-premium w-full py-5 bg-slate-900 text-white shadow-2xl shadow-slate-200 text-xs uppercase tracking-widest"
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )
                                }
                            </div>

                            <div className="absolute bottom-10 left-8 right-8">
                                <div className="flex items-center justify-center gap-2 text-slate-300">
                                    <Zap size={14} />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Secure Link Established</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </nav>
    );
}

function NavLink({ to, children }) {
    return (
        <Link
            to={to}
            className="px-5 py-2.5 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 rounded-2xl"
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ to, children, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block px-6 py-5 text-slate-900 font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 rounded-[2rem] transition-all"
        >
            {children}
        </Link>
    );
}
