import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, Terminal, LayoutPanelLeft } from 'lucide-react';
import { useAuth } from '../../app/common/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/auth';
import { cn } from '../../lib/utils';
import { getOptimizedUrl } from '../../lib/cloudinary';

export default function CodeLabsNavbar() {
    const navigate = useNavigate();
    const { user, userData, isStudent, student, logoutStudent } = useAuth();

    const handleLogout = async () => {
        if (isStudent) {
            logoutStudent();
        } else if (user) {
            await signOut(auth);
        }
        navigate('/login');
    };

    return (
        <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 sticky top-0 w-full">
            <div className="flex items-center gap-4">
                <Link to="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-transparent hover:border-white/10">
                    <ChevronLeft size={16} /> <span className="hidden sm:inline uppercase tracking-widest">Home</span>
                </Link>
                <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
                <Link to="/coderafroj" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-all">
                        <Terminal size={16} className="text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white tracking-tight uppercase">CoderAfroj <span className="text-indigo-400">Arena</span></span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Interactive Workspace</span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {user || isStudent ? (
                    <div className="flex items-center gap-3 bg-white/5 rounded-full p-1 pr-3 md:pr-4 border border-white/10 shadow-lg shadow-black/50">
                        <Link to={isStudent ? "/student-portal" : "/profile"} className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-800 overflow-hidden border border-white/20 hover:border-indigo-400 transition-colors">
                            {isStudent ? (
                                student.photoUrl ? (
                                    <img src={student.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white text-xs font-black uppercase">
                                        {student.fullName?.[0]}
                                    </div>
                                )
                            ) : userData?.photoURL ? (
                                <img src={getOptimizedUrl(userData.photoURL, 'w_100,h_100,c_fill,g_face,f_auto,q_auto')} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white text-xs font-black uppercase">
                                    {user.displayName?.[0]}
                                </div>
                            )}
                        </Link>
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {isStudent ? student.fullName?.split(' ')[0] : user.displayName?.split(' ')[0]}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 md:p-2 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-full transition-all ml-1"
                            title="Log Out"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap transition-all active:scale-95"
                        >
                            Join
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
