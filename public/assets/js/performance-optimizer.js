// Performance Optimization Script for Bytecore Website

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.lazyLoadContent();
        this.preloadCriticalResources();
        this.optimizeAnimations();
        this.setupIntersectionObserver();
        this.optimizeScrolling();
    }

    // Lazy load images and content
    lazyLoadContent() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Lazy load course cards
        const courseCards = document.querySelectorAll('.course-card');
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.1 });

        courseCards.forEach(card => cardObserver.observe(card));
    }

    // Optimize images
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading="lazy" for native lazy loading
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // Add proper alt text if missing
            if (!img.hasAttribute('alt')) {
                img.setAttribute('alt', 'Bytecore Computer Centre');
            }

            // Optimize image loading
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });

            img.addEventListener('error', () => {
                img.src = '/logo.png'; // Fallback image
            });
        });
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', as: 'style' },
            { href: '/hero.jpg', as: 'image' },
            { href: '/logo.png', as: 'image' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = () => {
                    link.rel = 'stylesheet';
                };
            }
            document.head.appendChild(link);
        });
    }

    // Optimize animations
    optimizeAnimations() {
        // Reduce motion for users who prefer it
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduce-motion');
        }

        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            const animations = document.querySelectorAll('.animate-pulse, .animate-float');
            animations.forEach(el => {
                if (document.hidden) {
                    el.style.animationPlayState = 'paused';
                } else {
                    el.style.animationPlayState = 'running';
                }
            });
        });
    }

    // Setup intersection observer for animations
    setupIntersectionObserver() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // Optimize scrolling performance
    optimizeScrolling() {
        let ticking = false;

        function updateScrollPosition() {
            // Update scroll-dependent elements
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        });
    }

    // Resource hints
    addResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];

        hints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            if (hint.crossorigin) link.crossOrigin = hint.crossorigin;
            document.head.appendChild(link);
        });
    }

    // Critical CSS inlining
    inlineCriticalCSS() {
        const criticalCSS = `
            .hero { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
            .course-card { transition: transform 0.3s ease; }
            .animate-fade-in { opacity: 1; transform: translateY(0); }
            .animate-fade-in-up { 
                opacity: 0; 
                transform: translateY(20px); 
                transition: opacity 0.6s ease, transform 0.6s ease; 
            }
            .animate-fade-in-up.animate-fade-in { 
                opacity: 1; 
                transform: translateY(0); 
            }
            .reduce-motion * { 
                animation-duration: 0.01ms !important; 
                animation-iteration-count: 1 !important; 
                transition-duration: 0.01ms !important; 
            }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    }
}

// Web Vitals monitoring
class WebVitalsMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measureCLS();
        this.measureFID();
        this.measureLCP();
        this.measureFCP();
        this.measureTTFB();
    }

    // Cumulative Layout Shift
    measureCLS() {
        let clsValue = 0;
        let clsEntries = [];

        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsEntries.push(entry);
                    clsValue += entry.value;
                }
            }
            this.metrics.cls = clsValue;
            this.reportMetric('CLS', clsValue);
        });

        observer.observe({ entryTypes: ['layout-shift'] });
    }

    // First Input Delay
    measureFID() {
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                this.metrics.fid = entry.processingStart - entry.startTime;
                this.reportMetric('FID', this.metrics.fid);
            }
        });

        observer.observe({ entryTypes: ['first-input'] });
    }

    // Largest Contentful Paint
    measureLCP() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
            this.reportMetric('LCP', this.metrics.lcp);
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // First Contentful Paint
    measureFCP() {
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.fcp = entry.startTime;
                    this.reportMetric('FCP', this.metrics.fcp);
                }
            }
        });

        observer.observe({ entryTypes: ['paint'] });
    }

    // Time to First Byte
    measureTTFB() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
            this.reportMetric('TTFB', this.metrics.ttfb);
        }
    }

    reportMetric(name, value) {
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
                metric_name: name,
                metric_value: Math.round(value),
                custom_parameter: 'performance'
            });
        }

        // Log for debugging
        console.log(`${name}: ${Math.round(value)}ms`);

        // Send to custom endpoint
        fetch('/api/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                metric: name,
                value: value,
                url: window.location.href,
                timestamp: Date.now()
            })
        }).catch(err => console.log('Web vitals reporting failed:', err));
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
    new WebVitalsMonitor();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceOptimizer, WebVitalsMonitor };
}