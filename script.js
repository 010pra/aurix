/* ========================================
   PRISONA™ — Premium Landing Page Script
   White theme, scroll video, animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // === Navigation Scroll Effect ===
    const nav = document.getElementById('nav');

    const handleNavScroll = () => {
        const scrollY = window.scrollY;
        if (scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // === Scroll-Triggered Animations ===
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.15,
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        const parent = el.parentElement;
        const siblings = parent.querySelectorAll('.animate-on-scroll');
        const siblingIndex = Array.from(siblings).indexOf(el);
        if (!el.getAttribute('data-delay')) {
            el.style.transitionDelay = `${siblingIndex * 80}ms`;
        }
        animationObserver.observe(el);
    });

    // === Scroll-Driven Video ===
    const scrollVideo = document.getElementById('scroll-video-el');
    const scrollVideoSection = document.getElementById('scroll-video');
    const videoText1 = document.getElementById('video-text-1');
    const videoText2 = document.getElementById('video-text-2');
    const videoText3 = document.getElementById('video-text-3');

    if (scrollVideo && scrollVideoSection) {
        // Ensure video is loaded enough to seek
        let videoReady = false;

        scrollVideo.addEventListener('loadedmetadata', () => {
            videoReady = true;
        });

        // If already loaded
        if (scrollVideo.readyState >= 2) {
            videoReady = true;
        }

        const handleScrollVideo = () => {
            if (!videoReady) return;

            const rect = scrollVideoSection.getBoundingClientRect();
            const sectionHeight = scrollVideoSection.offsetHeight;
            const viewportHeight = window.innerHeight;

            // Calculate scroll progress through the section (0 to 1)
            // Section starts entering view when rect.top < viewportHeight
            // Section finishes when rect.bottom < viewportHeight
            const scrolled = -rect.top;
            const totalScrollable = sectionHeight - viewportHeight;

            if (totalScrollable <= 0) return;

            const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

            // Set video current time based on scroll progress
            const videoDuration = scrollVideo.duration;
            if (videoDuration && isFinite(videoDuration)) {
                scrollVideo.currentTime = progress * videoDuration;
            }

            // Show/hide overlay text based on scroll progress
            const textElements = [videoText1, videoText2, videoText3];
            textElements.forEach(el => {
                if (el) el.classList.remove('active');
            });

            if (progress > 0.05 && progress < 0.35) {
                if (videoText1) videoText1.classList.add('active');
            } else if (progress > 0.35 && progress < 0.65) {
                if (videoText2) videoText2.classList.add('active');
            } else if (progress > 0.65 && progress < 0.95) {
                if (videoText3) videoText3.classList.add('active');
            }
        };

        window.addEventListener('scroll', handleScrollVideo, { passive: true });

        // Initial call
        handleScrollVideo();
    }

    // === Counter Animation ===
    const counterEl = document.getElementById('waitlist-counter');
    let counterAnimated = false;

    const animateCounter = () => {
        if (counterAnimated || !counterEl) return;

        const target = parseInt(counterEl.getAttribute('data-target'));
        const duration = 2000;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;

        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const animate = () => {
            frame++;
            const progress = easeOutQuart(frame / totalFrames);
            const currentCount = Math.round(target * progress);
            counterEl.textContent = currentCount.toLocaleString();

            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                counterEl.textContent = target.toLocaleString();
            }
        };

        counterAnimated = true;
        animate();
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (counterEl) {
        counterObserver.observe(counterEl);
    }

    // === Waitlist Form Handling (Web3Forms Integration) ===
    // ⚠️ IMPORTANT: Replace 'YOUR_ACCESS_KEY_HERE' with your real Web3Forms access key.
    // Get your free key at: https://web3forms.com (enter your email → get key instantly)
    const WEB3FORMS_ACCESS_KEY = 'ca7b4908-1574-4ffa-bd5f-b88e81cf1181';

    const waitlistForm = document.getElementById('waitlist-form');
    const submitBtn = document.getElementById('submit-btn');
    const emailInput = document.getElementById('email-input');
    const waitlistSuccess = document.getElementById('waitlist-success');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            if (!email || !isValidEmail(email)) {
                shakeElement(emailInput.parentElement);
                return;
            }

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        subject: '🎉 New PRISONA™ Waitlist Signup!',
                        from_name: 'PRISONA Waitlist',
                        email: email,
                        message: `New waitlist signup from: ${email}`,
                    }),
                });

                const result = await response.json();

                submitBtn.classList.remove('loading');

                if (result.success) {
                    submitBtn.classList.add('success');
                    setTimeout(() => {
                        waitlistForm.style.display = 'none';
                        waitlistSuccess.classList.add('show');

                        if (counterEl) {
                            const current = parseInt(counterEl.textContent.replace(/,/g, ''));
                            counterEl.textContent = (current + 1).toLocaleString();
                        }
                    }, 800);
                } else {
                    // If Web3Forms key is not set up yet, still show success to user
                    // but log the error for the developer
                    console.warn('Web3Forms submission issue:', result);
                    submitBtn.classList.add('success');
                    setTimeout(() => {
                        waitlistForm.style.display = 'none';
                        waitlistSuccess.classList.add('show');
                    }, 800);
                }
            } catch (error) {
                console.error('Form submission error:', error);
                submitBtn.classList.remove('loading');
                // Show success anyway so user has a good experience
                // Developer should check console for errors
                submitBtn.classList.add('success');
                setTimeout(() => {
                    waitlistForm.style.display = 'none';
                    waitlistSuccess.classList.add('show');
                }, 800);
            }
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function shakeElement(el) {
        el.style.animation = 'shake 0.4s ease-in-out';
        el.addEventListener('animationend', () => {
            el.style.animation = '';
        }, { once: true });
    }

    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    // === Smooth Scroll for Anchor Links ===
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === Mouse Glow Effect on Hero ===
    const heroGlow = document.querySelector('.hero-bg-glow');
    if (heroGlow) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            heroGlow.style.transform = `translate(${-50 + (x - 0.5) * 30}%, ${-20 + (y - 0.5) * 20}%)`;
        });
    }

    // === Magnetic Buttons ===
    const magneticElements = document.querySelectorAll('.btn-primary, .nav-cta, .social-link');

    magneticElements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    // === Preloader / Initial Load Animation ===
    const heroAnimateElements = document.querySelectorAll('.hero .animate-in');
    heroAnimateElements.forEach((el, index) => {
        el.style.animationDelay = `${0.3 + index * 0.15}s`;
    });

    // === Lazy Image Loading with Fade ===
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((img) => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.6s ease';

        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });

        if (img.complete) {
            img.style.opacity = '1';
        }
    });

    // === Subtle Cursor Ring ===
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
        .custom-cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            border: 1px solid rgba(184, 147, 90, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
            transform: translate(-50%, -50%);
        }
        .custom-cursor.hovering {
            width: 50px;
            height: 50px;
            border-color: rgba(184, 147, 90, 0.6);
        }
        @media (max-width: 768px) {
            .custom-cursor { display: none; }
        }
    `;
    document.head.appendChild(cursorStyle);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    const hoverTargets = document.querySelectorAll('a, button, .lifestyle-card, .problem-card, .step, .feature-card');
    hoverTargets.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    console.log('%c PRISONA™ ', 'background: #b8935a; color: white; font-weight: bold; font-size: 14px; padding: 4px 12px; border-radius: 4px;');
    console.log('%c Premium Ultrasonic Cleaner for Jewelry & Eyewear — Launching Soon ', 'color: #888; font-size: 11px;');
});
