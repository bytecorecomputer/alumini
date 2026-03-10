import React, { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '../../lib/notifications';
import { useAuth } from '../../app/common/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function NotificationHandler() {
    const { user, student } = useAuth();
    const [notification, setNotification] = useState(null);
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

    const userId = user?.uid || student?.registration;

    useEffect(() => {
        if (!userId) return;

        // 1. Check permission status
        if (Notification.permission === 'default') {
            setShowPermissionPrompt(true);
        } else if (Notification.permission === 'granted') {
            requestNotificationPermission(userId);
        }

        // 2. Listen for foreground messages
        onMessageListener()
            .then((payload) => {
                setNotification(payload);
                // Auto-hide after 6 seconds
                setTimeout(() => setNotification(null), 6000);
            })
            .catch((err) => console.log('Failed to listen for messaging:', err));

    }, [userId]);

    const handleEnable = async () => {
        const token = await requestNotificationPermission(userId);
        if (token) {
            setShowPermissionPrompt(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {/* 1. Permission Prompt Toast */}
                {showPermissionPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999]"
                    >
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl flex items-start gap-4 ring-1 ring-white/10">
                            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
                                <Bell className="text-white animate-bounce" size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Enable Alerts</h4>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-4">Never miss an update! Get instant job alerts and event notifications on your device.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEnable}
                                        className="flex-1 py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-95"
                                    >
                                        Enable Now
                                    </button>
                                    <button
                                        onClick={() => setShowPermissionPrompt(false)}
                                        className="px-4 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. Incoming Notification Toast */}
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed top-24 right-6 left-6 md:left-auto md:right-8 md:w-96 z-[9999]"
                    >
                        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-2xl flex items-start gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <Info size={20} />
                            </div>
                            <div className="flex-1 pr-6">
                                <h4 className="text-slate-900 font-black text-sm uppercase tracking-tight mb-1 truncate">
                                    {notification.notification?.title || "New Message"}
                                </h4>
                                <p className="text-slate-500 text-xs font-bold leading-snug line-clamp-2">
                                    {notification.notification?.body || "Broadcasting live from ByteCore Computer Centre."}
                                </p>
                            </div>
                            <button
                                onClick={() => setNotification(null)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
