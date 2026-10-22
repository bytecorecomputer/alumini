// Website Finalizer - Complete Bytecore Website Setup
class WebsiteFinalizer {
    constructor() {
        this.init();
    }

    init() {
        this.fixSwiper();
        this.enhancePerformance();
        this.addFinalTouches();
        this.setupErrorHandling();
        this.addLoadingStates();
        this.optimizeImages();
        this.setupSEOEnhancements();
    }

    // Ultimate Swiper Fix
    fixSwiper() {
        const fixSwiperLayout = () => {
            const swiperWrapper = document.querySelector('.swiper-wrapper');
            if (swiperWrapper) {
                // Remove any vertical layout classes
                swiperWrapper.classList.remove('flex-col', 'flex-column', 'vertical');

                // Force horizontal layout
                swiperWrapper.style.cssText += `
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: stretch !important;
                `;

                // Fix individual slides
                const slides = document.querySelectorAll('.swiper-slide');
                slides.forEach(slide => {
                    slide.style.cssText += `
                        flex-shrink: 0 !important;
                        width: auto !important;
                        height: auto !important;
                    `;
                });
            }
        };

        // Fix immediately and on intervals
        fixSwiperLayout();
        setInterval(fixSwiperLayout, 1000);

        // Observer for DOM changes
        const observer = new MutationObserver(fixSwiperLayout);
        const swiperContainer = document.querySelector('.swiper');
        if (swiperContainer) {
            observer.observe(swiperContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        }
    }

    // Performance Enhancements
    enhancePerformance() {
        // Lazy load images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });

        // Preload critical resources
        const criticalResources = [
            { href: '/assets/img/logo.png', as: 'image' },
            { href: '/hero.jpg', as: 'image' },
            { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });

        // Optimize scroll performance
        let ticking = false;
        const optimizeScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Update scroll-dependent elements
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', optimizeScroll, { passive: true });
    }

    // Add Final UI Touches
    addFinalTouches() {
        // Add smooth transitions to all interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .course-card, .feature-icon');
        interactiveElements.forEach(el => {
            if (!el.style.transition) {
                el.style.transition = 'all 0.3s ease';
            }
        });

        // Add hover effects to course cards
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
                card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        });

        // Add loading animation to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const originalText = button.textContent;
                button.textContent = 'Loading...';
                button.disabled = true;

                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 1000);
            });
        });
    }

    // Error Handling
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.log('Error caught:', e.error);
            this.showErrorMessage('Something went wrong. Please refresh the page.');
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.log('Promise rejection:', e.reason);
            e.preventDefault();
        });

        // Network error detection
        window.addEventListener('online', () => {
            this.hideErrorMessage();
            this.showSuccessMessage('Connection restored!');
        });

        window.addEventListener('offline', () => {
            this.showErrorMessage('No internet connection. Some features may not work.');
        });
    }

    // Loading States
    addLoadingStates() {
        // Page loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="fixed top-0 left-0 w-full h-1 bg-primary z-50 transform -translate-x-full transition-transform duration-300"></div>
        `;
        document.body.appendChild(loadingIndicator);

        // Show loading on navigation
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.href && !e.target.href.startsWith('#')) {
                this.showLoading();
            }
        });

        // Hide loading when page loads
        window.addEventListener('load', () => {
            this.hideLoading();
        });
    }

    // Image Optimization
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add error handling
            img.addEventListener('error', () => {
                img.src = '/assets/img/logo.png'; // Fallback image
                img.alt = 'Bytecore Computer Centre';
            });

            // Add loading placeholder
            if (!img.complete) {
                img.style.backgroundColor = '#f3f4f6';
                img.style.minHeight = '200px';
            }

            img.addEventListener('load', () => {
                img.style.backgroundColor = '';
                img.style.minHeight = '';
                img.classList.add('loaded');
            });
        });
    }

    // SEO Enhancements
    setupSEOEnhancements() {
        // Add structured data for courses
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach((card, index) => {
            const courseName = card.querySelector('h3').textContent;
            const coursePrice = card.querySelector('.text-primary').textContent;
            const courseDuration = card.querySelector('.bg-green-100').textContent;

            const structuredData = {
                "@context": "https://schema.org",
                "@type": "Course",
                "name": courseName,
                "description": card.querySelector('p').textContent,
                "provider": {
                    "@type": "Organization",
                    "name": "Bytecore Computer Centre"
                },
                "offers": {
                    "@type": "Offer",
                    "price": coursePrice.replace('₹', '').replace(',', ''),
                    "priceCurrency": "INR"
                }
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        });

        // Update meta description dynamically
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = `🏆 Bytecore Computer Centre - India's #1 IT Training Institute. Courses: Python (₹15,999), Full Stack (₹25,999), O Level (₹20,999), ADCA (₹7,999). 100% Placement Guarantee. Enroll Now!`;
        }
    }

    // Utility Methods
    showLoading() {
        const indicator = document.querySelector('#loading-indicator div');
        if (indicator) {
            indicator.style.transform = 'translateX(0)';
        }
    }

    hideLoading() {
        const indicator = document.querySelector('#loading-indicator div');
        if (indicator) {
            indicator.style.transform = 'translateX(100%)';
        }
    }

    showErrorMessage(message) {
        this.removeExistingMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 error-message';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccessMessage(message) {
        this.removeExistingMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 success-message';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(successDiv);

        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    removeExistingMessages() {
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
    }
}

// Initialize Website Finalizer
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteFinalizer();

    // Additional final checks
    setTimeout(() => {
        // Final Swiper check
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (swiperWrapper && swiperWrapper.style.flexDirection !== 'row') {
            swiperWrapper.style.flexDirection = 'row';
            swiperWrapper.classList.remove('flex-col');
            console.log('Final Swiper fix applied');
        }

        // Performance check
        if (typeof gtag !== 'undefined') {
            gtag('event', 'website_loaded', {
                load_time: performance.now(),
                custom_parameter: 'performance'
            });
        }
    }, 2000);
});