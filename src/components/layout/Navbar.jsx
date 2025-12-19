
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LogOut, User, Shield } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../app/common/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/auth';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { user, userData, role } = useAuth(); // Destructure role

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-900 text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
                            <GraduationCap size={24} />
                        </div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight">
                            Alumni<span className="text-primary-600">Connect</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
                        <Link to="/directory" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Directory</Link>
                        <Link to="/events" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Events</Link>
                        <Link to="/jobs" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Career Center</Link>

                        {(role === 'admin' || role === 'super_admin') && (
                            <Link to="/admin" className="text-purple-600 hover:text-purple-800 font-bold transition-colors flex items-center gap-1">
                                <Shield size={16} /> Governance
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/donate" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Donate</Link>
                                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-900">
                                    <User size={20} />
                                    <span>Profile</span>
                                </Link>
                                <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/donate" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Donate</Link>
                                <Link to="/login" className="text-gray-700 hover:text-primary-900 font-medium">Login</Link>
                                <Link to="/register" className="bg-primary-900 text-white px-5 py-2 rounded-full font-medium hover:bg-primary-800 transition-all shadow-lg hover:shadow-primary-900/20 active:scale-95">
                                    Join Network
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <Link to="/" className="block py-2 text-gray-600 font-medium">Home</Link>
                            <Link to="/directory" className="block py-2 text-gray-600 font-medium">Directory</Link>
                            <Link to="/events" className="block py-2 text-gray-600 font-medium">Events</Link>
                            <Link to="/jobs" className="block py-2 text-gray-600 font-medium">Career Center</Link>
                            <Link to="/donate" className="block py-2 text-gray-600 font-medium">Donate</Link>
                            <div className="pt-4 border-t border-gray-100">
                                <Link to="/login" className="block py-2 text-gray-600 font-medium">Login</Link>
                                <Link to="/register" className="block w-full text-center bg-primary-900 text-white py-3 rounded-lg font-medium mt-2">
                                    Join Now
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
