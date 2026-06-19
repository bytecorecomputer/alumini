import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center font-inter relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
        >
            <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"
            >
                <Compass size={48} />
            </motion.div>
            
            <h1 className="text-8xl md:text-9xl font-black text-slate-900 mb-4 tracking-tighter">
                404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                Page Not Found
            </h2>
            <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg">
                Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
            </p>

            <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
            >
                <Home size={20} />
                Back to Home
            </Link>
        </motion.div>
    </div>
  );
}
