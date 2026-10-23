import React from 'react';
import { useAuth } from '../../app/common/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Award, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function AdminBottomNav() {
    const { role } = useAuth();
    const location = useLocation();

    // Only render for admins and super_admins on mobile devices
    if (role !== 'admin' && role !== 'super_admin') return null;

    const navItems = [
        { label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
        { label: 'Coaching', icon: Users, path: '/admin/coaching' },
        { label: 'Certificates', icon: Award, path: '/admin/certificates' },
        { label: 'Alerts', icon: Bell, path: '/admin/notifications' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe bg-white border-t border-slate-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-around px-2 py-3 bg-white/80 backdrop-blur-xl">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center w-full focus:outline-none tap-highlight-transparent"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute inset-0 bg-blue-50 rounded-2xl -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                            <div className={cn(
                                "flex items-center justify-center transition-all duration-300 mb-1 rounded-xl p-2",
                                isActive ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"
                            )}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-colors duration-300",
                                isActive ? "text-blue-600" : "text-slate-400"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
