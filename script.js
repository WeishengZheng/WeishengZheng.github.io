// ============================================
// PORTFOLIO — INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // INTERACTIVE VECTOR FIELD (Hero Background)
    // ============================================
    const canvas = document.getElementById('vectorField');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let mouseX = -1000, mouseY = -1000;
        let isMouseInHero = false;
        const CELL_SIZE = 28;
        const INFLUENCE_RADIUS = 180;
        const LINE_LENGTH = 16;

        // Warm color palette: red, orange, yellow
        const colors = [
            { r: 255, g: 75, b: 43 },    // red-orange
            { r: 255, g: 107, b: 53 },   // orange
            { r: 255, g: 153, b: 51 },   // deep orange
            { r: 247, g: 183, b: 51 },   // amber
            { r: 247, g: 201, b: 72 },   // yellow
            { r: 255, g: 95, b: 64 },    // red
        ];

        function resize() {
            const hero = canvas.parentElement;
            width = canvas.width = hero.offsetWidth;
            height = canvas.height = hero.offsetHeight;
        }

        resize();
        window.addEventListener('resize', resize);

        // Track mouse position relative to canvas
        const hero = canvas.parentElement;
        hero.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isMouseInHero = true;
            // Allow pointer events on the hero content, not the canvas
            canvas.style.pointerEvents = 'none';
        });

        hero.addEventListener('mouseleave', () => {
            isMouseInHero = false;
        });

        // Noise function for organic movement
        function noise(x, y, t) {
            return Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t * 0.7) +
                Math.sin(x * 0.01 - t * 0.5) * Math.cos(y * 0.015 + t * 0.3);
        }

        let time = 0;

        function draw() {
            ctx.clearRect(0, 0, width, height);
            time += 0.008;

            const cols = Math.floor(width / CELL_SIZE) + 2;
            const rows = Math.floor(height / CELL_SIZE) + 2;
            const offsetX = (width - cols * CELL_SIZE) / 2;
            const offsetY = (height - rows * CELL_SIZE) / 2;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = offsetX + col * CELL_SIZE + CELL_SIZE / 2;
                    const y = offsetY + row * CELL_SIZE + CELL_SIZE / 2;

                    // Base angle from noise
                    let angle = noise(x, y, time) * Math.PI;

                    // Mouse influence
                    let influenceFactor = 0;
                    if (isMouseInHero) {
                        const dx = mouseX - x;
                        const dy = mouseY - y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < INFLUENCE_RADIUS) {
                            influenceFactor = 1 - dist / INFLUENCE_RADIUS;
                            influenceFactor = influenceFactor * influenceFactor; // ease-in
                            const mouseAngle = Math.atan2(dy, dx);
                            // Vectors point AWAY from mouse
                            angle = angle * (1 - influenceFactor * 0.85) + (mouseAngle + Math.PI) * influenceFactor * 0.85;
                        }
                    }

                    // Color selection based on position + time
                    const colorIndex = Math.abs(Math.floor(
                        noise(x * 0.5, y * 0.5, time * 0.3) * colors.length + time
                    )) % colors.length;
                    const color = colors[colorIndex];

                    // Dynamic opacity: base + mouse boost
                    const baseOpacity = 0.12 + Math.abs(noise(x, y, time * 0.5)) * 0.08;
                    const opacity = Math.min(0.6, baseOpacity + influenceFactor * 0.45);

                    // Line width gets thicker near mouse
                    const lineWidth = 1 + influenceFactor * 1.5;

                    // Draw vector line
                    const endX = x + Math.cos(angle) * LINE_LENGTH * (0.6 + influenceFactor * 0.6);
                    const endY = y + Math.sin(angle) * LINE_LENGTH * (0.6 + influenceFactor * 0.6);

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
                    ctx.lineWidth = lineWidth;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Small dot at the tip when influenced
                    if (influenceFactor > 0.2) {
                        ctx.beginPath();
                        ctx.arc(endX, endY, 1.5 * influenceFactor, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`;
                        ctx.fill();
                    }
                }
            }

            requestAnimationFrame(draw);
        }

        draw();
    }

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.querySelector('.navbar');

    const handleScroll = () => {
        const scroll = window.scrollY;
        if (scroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // SCROLL REVEAL
    // ============================================
    const revealElements = document.querySelectorAll(
        'section:not(#hero), .skill-card, .project-card, .detail-card, .contact-card, .hero-stats'
    );

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // ============================================
    // TILT EFFECT ON CARDS (subtle, desktop only)
    // ============================================
    if (window.matchMedia('(min-width: 768px)').matches) {
        const tiltCards = document.querySelectorAll('.skill-card, .project-card');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;

                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ============================================
    // ACTIVE NAV LINK HIGHLIGHT
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const highlightNav = () => {
        const scroll = window.scrollY + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scroll >= top && scroll < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    console.log('✨ Portfolio loaded');
});
