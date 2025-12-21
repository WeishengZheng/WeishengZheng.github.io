// ============================================
// MINIMALIST PORTFOLIO - JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Grain animation is handled purely by CSS keyframes now
    // No JavaScript manipulation needed for the flicker effect

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('section, .project-card, .skill-category, .info-card, .contact-card').forEach(el => {
        el.classList.add('reveal-element');
        revealObserver.observe(el);
    });

    // ============================================
    // CORNER DECORATION ANIMATION
    // ============================================
    const corners = document.querySelectorAll('.corner-decoration');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const rotation = scrolled * 0.05;

        corners.forEach((corner, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            corner.style.transform = `rotate(${rotation * direction}deg)`;
        });
    });

    // ============================================
    // HOVER EFFECTS FOR CARDS
    // ============================================
    const cards = document.querySelectorAll('.project-card, .skill-category, .contact-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // ============================================
    // CIRCLE PARALLAX
    // ============================================
    const heroCircle = document.querySelector('.hero-circle');

    if (heroCircle) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const scale = 1 + (scrolled * 0.0003);
            const opacity = Math.max(0, 1 - (scrolled * 0.002));
            heroCircle.style.transform = `translate(-50%, -50%) scale(${scale})`;
            heroCircle.style.opacity = opacity;
        });
    }

    console.log('✨ Minimalist Portfolio loaded');
});
