/**
 * ByteCore Unified Site Components System
 * Handles Header, Footer, and Layout consistency site-wide.
 * v2.0 - Premium Design System
 */
(function () {
    'use strict';

    // --- Configuration & Content ---

    const HEADER_HTML = `
        <header class="site-header glass">
            <div class="container header-wrap">
                <div class="logo-area" onclick="window.location.href='index.html'" style="min-height: 48px;">
                    <img src="assets/img/logo.png" alt="Bytecore Computer Centre Logo" width="40" height="40" loading="lazy" class="logo-img">
                    <span class="logo-text font-heading">Bytecore</span>
                </div>
                
                <nav class="desktop-nav">
                    <a href="Courses.html" data-page="courses">Courses</a>
                    <a href="quiz.html" data-page="quiz">Quiz</a>
                    <a href="diploma.html" data-page="diploma">Certificates</a>
                    <a href="About.html" data-page="about">About</a>
                    <a href="contact.html" data-page="contact">Contact</a>
                </nav>
                
                <div class="header-actions">
                    <button id="theme-toggle" class="icon-btn text-slate-600 dark:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full h-10 w-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none" aria-label="Toggle theme">
                        <i class="fas fa-moon block dark:hidden text-lg"></i>
                        <i class="fas fa-sun hidden dark:block text-yellow-400 text-lg"></i>
                    </button>
                    <a href="enroll.html" class="btn-premium hide-mobile">Register Now</a>
                    <button id="menu-toggle" class="icon-btn mobile-only" aria-label="Menu">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>

            <div class="mobile-menu-overlay" id="nav-overlay">
                <div class="mobile-nav-drawer">
                    <div class="drawer-header">
                        <div class="drawer-logo">
                            <img src="assets/img/logo.png" alt="Bytecore">
                            <span>ByteCore</span>
                        </div>
                        <button class="close-drawer" id="close-drawer"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <nav class="mobile-nav-links">
                        <a href="Courses.html" data-page="courses"><i class="fas fa-book"></i> Courses</a>
                        <a href="quiz.html" data-page="quiz"><i class="fas fa-lightbulb"></i> Quiz</a>
                        <a href="diploma.html" data-page="diploma"><i class="fas fa-certificate"></i> Certificates</a>
                        <a href="Fee.html" data-page="fees"><i class="fas fa-wallet"></i> Fees</a>
                        <a href="About.html" data-page="about"><i class="fas fa-user"></i> About</a>
                        <a href="contact.html" data-page="contact"><i class="fas fa-envelope"></i> Contact</a>
                    </nav>

                    <div class="drawer-footer">
                        <a href="enroll.html" class="btn btn-primary w-full">Register Now</a>
                    </div>
                </div>
            </div>
        </header>
    `;

    const FOOTER_HTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-grid">
                    <!-- Brand Section -->
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <img src="assets/img/logo.png" alt="ByteCore">
                            <span class="font-heading">ByteCore</span>
                        </div>
                        <p class="text-muted">
                            Empowering the next generation of tech leaders with industry-standard computer education since 2010.
                        </p>
                        <div class="social-links">
                            <a href="https://www.facebook.com/bytecorecomputercentre/" aria-label="Facebook" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="https://www.instagram.com/bytecore_computer_centre/?hl=en" aria-label="Instagram" target="_blank"><i class="fab fa-instagram"></i></a>
                            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="footer-links">
                        <h4>Explore</h4>
                        <ul>
                            <li><a href="About.html">About Us</a></li>
                            <li><a href="Courses.html">All Courses</a></li>
                            <li><a href="scholarship.html">Scholarship</a></li>
                            <li><a href="diploma.html">Verify Certificate</a></li>
                            <li><a href="contact.html">Contact</a></li>
                        </ul>
                    </div>

                    <!-- Popular Courses -->
                    <div class="footer-links">
                        <h4>Popular</h4>
                        <ul>
                            <li><a href="Courses.html">Python Masterclass</a></li>
                            <li><a href="Courses.html">Full Stack Dev</a></li>
                            <li><a href="Courses.html">O Level (NIELIT)</a></li>
                            <li><a href="Courses.html">ADCA Professional</a></li>
                            <li><a href="quiz.html">Practice Quiz</a></li>
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div class="footer-contact">
                        <h4>Contact Us</h4>
                        <ul>
                            <li>
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Bithri Road, Opposite Sheetala Mata Mandir, Nariyawal BLY, 243123</span>
                            </li>
                            <li>
                                <i class="fas fa-phone"></i>
                                <a href="tel:+916396835709">+91-6396835709</a>
                            </li>
                            <li>
                                <i class="fas fa-envelope"></i>
                                <a href="mailto:bytecore.info@gmail.com">bytecore.info@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; 2010-2025 ByteCore Computer Centre. All Rights Reserved.</p>
                    <div class="legal-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="Fee.html">Fee Structure</a>
                    </div>
                </div>
            </div>
        </footer>
    `;

    const COMPONENT_STYLES = `
        /* --- Component Specific Styles --- */
        
        /* Header */
        .site-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 80px;
            z-index: 1000;
            transition: all 0.3s ease;
            border-bottom: 1px solid var(--glass-border);
        }
        
        body { padding-top: 80px; } /* Prevent content jump */

        .header-wrap {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        }

        .logo-img {
            width: 40px;
            height: 40px;
            border-radius: 8px;
        }

        .logo-text {
            font-size: 1.5rem;
            color: hsl(var(--foreground));
        }

        /* Desktop Nav */
        .desktop-nav {
            display: none;
        }

        @media (min-width: 1024px) {
            .desktop-nav {
                display: flex;
                gap: 32px;
            }
        }

        .desktop-nav a {
            font-weight: 500;
            color: hsl(var(--foreground-muted));
            position: relative;
            padding: 4px 0;
        }

        .desktop-nav a:hover,
        .desktop-nav a.active {
            color: hsl(var(--primary));
        }

        .desktop-nav a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: hsl(var(--primary));
            transition: width 0.3s ease;
        }

        .desktop-nav a:hover::after,
        .desktop-nav a.active::after {
            width: 100%;
        }

        /* Actions */
        .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .theme-toggle-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: hsl(var(--foreground));
            padding: 8px;
            border-radius: 50%;
            transition: background 0.2s;
        }

        .theme-toggle-btn:hover {
            background: hsla(var(--foreground), 0.1);
        }

        .register-btn {
            display: none; 
        }
        @media (min-width: 768px) {
             .register-btn { display: inline-flex; }
        }

        /* Mobile Menu Button */
        .menu-btn {
            width: 40px;
            height: 40px;
            border: none;
            background: none;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 6px;
            z-index: 1002;
        }
        
        @media (min-width: 1024px) {
            .menu-btn { display: none; }
        }

        .menu-btn span {
            width: 24px;
            height: 2px;
            background-color: hsl(var(--foreground));
            transition: 0.3s;
        }

        .menu-btn.active span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
        .menu-btn.active span:nth-child(2) { opacity: 0; }
        .menu-btn.active span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

        /* Mobile Menu Side Drawer */
        .mobile-menu-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 9999; /* Increased z-index */
        }

        .mobile-menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .mobile-nav-drawer {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            height: 100vh; /* Explicit height */
            width: 80%;
            max-width: 300px;
            background: #0f172a !important; /* Solid Slate 900 - No Transparency */
            box-shadow: -10px 0 50px rgba(0,0,0,0.5);
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            padding: 2rem;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-overlay.active .mobile-nav-drawer {
            transform: translateX(0);
        }

        .drawer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .drawer-logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .drawer-logo img { width: 36px; height: 36px; object-fit: contain; }
        .drawer-logo span { 
            font-size: 1.4rem; 
            font-weight: 700; 
            color: #fff; 
            letter-spacing: -0.02em;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .close-drawer {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.25rem;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .close-drawer:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            transform: rotate(90deg);
        }

        .mobile-nav-links {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem 0;
            margin-bottom: auto; /* Push footer down naturally */
            width: 100%;
        }

        .mobile-nav-links a {
            font-size: 1.1rem;
            font-weight: 500;
            color: #ffffff !important; /* Pure white for maximum contrast */
            padding: 0.75rem 1rem;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.2s ease;
            text-decoration: none;
            width: 100%;
        }

        .mobile-nav-links a:hover,
        .mobile-nav-links a.active {
            color: white;
            background: rgba(116, 100, 235, 0.15);
            border-color: rgba(116, 100, 235, 0.2);
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(116, 100, 235, 0.1);
        }

        .mobile-nav-links a i {
            width: 24px;
            text-align: center;
            font-size: 1.1rem;
            color: #94a3b8;
            transition: color 0.3s ease;
        }
        
        .mobile-nav-links a:hover i,
        .mobile-nav-links a.active i {
            color: #818cf8;
        }

        .drawer-footer {
            margin-top: auto;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Footer */
        .site-footer {
            background: hsl(var(--surface));
            border-top: 1px solid hsl(var(--border));
            padding: 4rem 0 2rem;
            margin-top: auto;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .footer-brand .footer-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .footer-brand .footer-logo img {
            width: 32px;
            height: 32px;
        }

        .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .social-links a {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: hsla(var(--primary), 0.1);
            color: hsl(var(--primary));
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .social-links a:hover {
            background: hsl(var(--primary));
            color: white;
            transform: translateY(-3px);
        }

        .footer-links h4, .footer-contact h4 {
            margin-bottom: 1.5rem;
            color: hsl(var(--foreground));
        }

        .footer-links ul, .footer-contact ul {
            list-style: none;
        }

        .footer-links li, .footer-contact li {
            margin-bottom: 0.75rem;
        }

        .footer-links a {
            color: hsl(var(--foreground-muted));
        }

        .footer-links a:hover {
            color: hsl(var(--primary));
            padding-left: 5px;
        }

        .footer-contact li {
            display: flex;
            gap: 12px;
            color: hsl(var(--foreground-muted));
            align-items: flex-start;
        }
        
        .footer-contact i {
            color: hsl(var(--primary));
            margin-top: 4px;
        }

        .footer-bottom {
            padding-top: 2rem;
            border-top: 1px solid hsl(var(--border));
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            text-align: center;
            color: hsl(var(--foreground-muted));
            font-size: 0.9rem;
        }

        @media (min-width: 768px) {
            .footer-bottom {
                flex-direction: row;
                justify-content: space-between;
            }
        }

        .legal-links {
            display: flex;
            gap: 1.5rem;
        }
    `;

    // --- Core Logic ---

    function init() {
        injectStyles();
        injectHeader();
        injectFooter();
        setupFunctionality();
    }

    function injectStyles() {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = COMPONENT_STYLES;
        document.head.appendChild(styleSheet);
    }

    function injectHeader() {
        const existing = document.querySelectorAll('header');
        existing.forEach(el => el.remove());
        document.body.insertAdjacentHTML('afterbegin', HEADER_HTML);
    }

    function injectFooter() {
        const existing = document.querySelectorAll('footer');
        existing.forEach(el => el.remove());
        document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
    }

    function setupFunctionality() {
        const menuBtn = document.getElementById('menu-toggle');
        const overlay = document.getElementById('nav-overlay');
        const themeBtn = document.getElementById('theme-toggle');
        const closeDrawer = document.getElementById('close-drawer');

        // Menu Toggle
        function toggleMenu(force = null) {
            const isActive = force !== null ? force : overlay.classList.toggle('active');
            if (force === true) overlay.classList.add('active');
            if (force === false) overlay.classList.remove('active');

            // Toggle body scroll
            document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMenu();
            });
        }

        if (closeDrawer) {
            closeDrawer.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMenu(false);
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) toggleMenu(false);
            });
        }

        // Active Link Highlighting
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('nav a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });

        // Theme Toggle Logic
        function initTheme() {
            // Check for saved theme or system preference
            const savedTheme = localStorage.getItem('theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        // Initialize immediately
        initTheme();

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
        }
    }

    // Run on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
