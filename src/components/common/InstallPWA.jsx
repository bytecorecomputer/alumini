import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bytecore_pwa_install_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    const checkDismissalState = () => {
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (dismissedAt) {
            const timePassed = Date.now() - parseInt(dismissedAt);
            if (timePassed < DISMISS_DURATION) {
                return true; // Still dismissed
            }
            localStorage.removeItem(STORAGE_KEY); // Expired, clear it
        }
        return false;
    };

    const markAsDismissed = () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsVisible(false);
    };

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsStandalone(true);
        }

        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Only show if not recently dismissed
            if (!checkDismissalState()) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check for iOS instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        let timer;
        if (isIOS && !isStandalone && !checkDismissalState()) {
            // Show iOS specific instructions after a short delay
            timer = setTimeout(() => setIsVisible(true), 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            if (timer) clearTimeout(timer);
        };
    }, [isStandalone]);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // If on iOS, maybe show a nice modal with instructions
            alert('To install on iOS: Tap the "Share" button and then "Add to Home Screen".');
            markAsDismissed(); // Also mark as dismissed so it doesn't pop up again immediately
            return;
        }

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            markAsDismissed(); // Hide it once installed or action taken
        } else {
            console.log('User dismissed the install prompt');
            markAsDismissed(); // Respect the dismissal
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    if (isStandalone || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 inset-x-0 z-[150] px-4 flex justify-center"
            >
                <div className="w-full max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <Smartphone size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 leading-tight">Install App</p>
                            <p className="text-sm font-bold leading-tight">Use ByteCore as an App</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInstall}
                            className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-sm"
                        >
                            Install
                        </button>
                        <button
                            onClick={markAsDismissed}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
