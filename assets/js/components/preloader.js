/**
 * GCT Bhakkar - Preloader Component
 * Handles page loading animation and skeleton states
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        minLoadTime: 500,      // Minimum time to show preloader (ms)
        maxLoadTime: 5000,     // Maximum time before forcing hide (ms)
        fadeOutDuration: 500   // Fade out animation duration (ms)
    };

    // Preloader Manager
    const PreloaderManager = {
        preloader: null,
        progressBar: null,
        startTime: Date.now(),
        isLoaded: false,

        init() {
            this.preloader = document.querySelector('.preloader');
            this.progressBar = document.querySelector('.preloader-progress-bar');

            if (!this.preloader) {
                this.createPreloader();
            }

            this.bindEvents();
            this.simulateProgress();
        },

        createPreloader() {
            const preloader = document.createElement('div');
            preloader.className = 'preloader';
            preloader.innerHTML = `
                <div class="preloader-spinner"></div>
                <p class="preloader-text">Loading</p>
                <div class="preloader-progress">
                    <div class="preloader-progress-bar"></div>
                </div>
            `;
            document.body.prepend(preloader);
            this.preloader = preloader;
            this.progressBar = preloader.querySelector('.preloader-progress-bar');
        },

        bindEvents() {
            // Hide on window load
            window.addEventListener('load', () => this.onPageLoad());

            // Fallback timeout
            setTimeout(() => {
                if (!this.isLoaded) {
                    this.hide();
                }
            }, CONFIG.maxLoadTime);
        },

        simulateProgress() {
            let progress = 0;
            const interval = setInterval(() => {
                if (this.isLoaded) {
                    clearInterval(interval);
                    return;
                }

                // Simulate slower progress as it gets higher
                const increment = Math.random() * (100 - progress) / 10;
                progress = Math.min(progress + increment, 90);

                if (this.progressBar) {
                    this.progressBar.style.width = `${progress}%`;
                }
            }, 100);
        },

        onPageLoad() {
            const elapsedTime = Date.now() - this.startTime;
            const remainingTime = Math.max(0, CONFIG.minLoadTime - elapsedTime);

            setTimeout(() => this.hide(), remainingTime);
        },

        hide() {
            if (this.isLoaded || !this.preloader) return;

            this.isLoaded = true;

            // Complete progress bar
            if (this.progressBar) {
                this.progressBar.style.width = '100%';
            }

            // Add loaded class after progress completes
            setTimeout(() => {
                this.preloader.classList.add('loaded');

                // Remove from DOM after animation
                setTimeout(() => {
                    this.preloader.remove();
                }, CONFIG.fadeOutDuration);
            }, 200);
        }
    };

    // Skeleton Loader Manager
    const SkeletonManager = {
        init() {
            // Observe for lazy-loaded content
            this.setupIntersectionObserver();
        },

        setupIntersectionObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const skeleton = entry.target;
                        // Replace skeleton with actual content when visible
                        this.loadContent(skeleton);
                        observer.unobserve(skeleton);
                    }
                });
            }, {
                rootMargin: '100px'
            });

            // Observe all skeleton elements
            document.querySelectorAll('.skeleton-card').forEach(el => {
                observer.observe(el);
            });
        },

        loadContent(skeleton) {
            // Content loading is handled by component-specific JavaScript
            // This just manages the intersection observer
        },

        // Utility to create skeleton placeholders
        createCardSkeleton() {
            return `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-image"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-button" style="margin-top: 1rem;"></div>
                </div>
            `;
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            PreloaderManager.init();
            SkeletonManager.init();
        });
    } else {
        PreloaderManager.init();
        SkeletonManager.init();
    }

    // Expose to global scope for external use
    window.GCTPreloader = PreloaderManager;
    window.GCTSkeleton = SkeletonManager;
})();
