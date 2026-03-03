import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Mail, Phone, ExternalLink } from 'lucide-react';

const icons = {
    mail: <Mail size={16} />,
    phone: <Phone size={16} />,
    link: <ExternalLink size={16} />
};

export default function ProfileCard({
    name = 'ByteCore Member',
    role = 'Instructor',
    image = 'https://bytecores.in/images/logo.png',
    theme = 'light',
    bgColor = '#ffffff',
    className = '',
    socials = []
}) {
    const [isHovered, setIsHovered] = useState(false);

    const themeStyles = {
        light: {
            bg: bgColor,
            text: '#1e293b',
            roleText: '#64748b',
            border: 'rgba(226, 232, 240, 0.8)',
            shadow: '0 20px 40px rgba(0,0,0,0.05)'
        },
        dark: {
            bg: '#0f172a',
            text: '#f8fafc',
            roleText: '#94a3b8',
            border: 'rgba(30, 41, 59, 0.8)',
            shadow: '0 20px 40px rgba(0,0,0,0.4)'
        }
    };

    const currentTheme = themeStyles[theme] || themeStyles.light;

    return (
        <motion.div
            className={`relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden ${className}`}
            style={{
                backgroundColor: currentTheme.bg,
                boxShadow: currentTheme.shadow,
                border: `1px solid ${currentTheme.border}`
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* Dynamic Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            <div className="relative z-10 p-8 flex flex-col items-center">
                {/* Avatar Container */}
                <div className="relative mb-6">
                    <motion.div
                        className="w-32 h-32 rounded-full overflow-hidden border-4"
                        style={{ borderColor: currentTheme.bg }}
                        animate={{ scale: isHovered ? 1.05 : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    </motion.div>
                    {/* Decorative Ring */}
                    <motion.div
                        className="absolute -inset-2 rounded-full border-2 border-blue-500/30 -z-10"
                        animate={{ rotate: isHovered ? 90 : 0, scale: isHovered ? 1.1 : 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                </div>

                {/* Text Details */}
                <motion.h3
                    className="text-2xl font-black mb-1 tracking-tight text-center"
                    style={{ color: currentTheme.text }}
                >
                    {name}
                </motion.h3>
                <motion.p
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center"
                    style={{ color: currentTheme.roleText }}
                >
                    {role}
                </motion.p>

                {/* Social Interactive Icons */}
                {socials.length > 0 && (
                    <div className="flex gap-4 items-center justify-center mt-2 w-full pt-6 border-t" style={{ borderColor: currentTheme.border }}>
                        {socials.map((social, idx) => (
                            <motion.a
                                key={idx}
                                href={social.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                style={{ backgroundColor: currentTheme.border, color: currentTheme.text }}
                                whileHover={{ scale: 1.15, backgroundColor: social.color || '#3b82f6', color: '#fff' }}
                                whileTap={{ scale: 0.95 }}
                                title={social.label}
                            >
                                {social.icon && icons[social.icon] ? icons[social.icon] : <Phone size={16} />}
                            </motion.a>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
