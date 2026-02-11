// ============================================
// PORTFOLIO — INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // INTERACTIVE VECTOR FIELD (Hero Background)
    // Warm red / orange / yellow
    // ============================================
    const canvas = document.getElementById('vectorField');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let mouseX = -1000, mouseY = -1000;
        let isMouseInHero = false;

        // Bigger, more visible vectors
        const CELL_SIZE = 38;
        const INFLUENCE_RADIUS = 220;
        const LINE_LENGTH = 24;

        // Warm color palette
        const colors = [
            { r: 239, g: 68, b: 68 },    // red
            { r: 249, g: 115, b: 22 },   // orange
            { r: 251, g: 146, b: 60 },   // light orange
            { r: 245, g: 158, b: 11 },   // amber
            { r: 234, g: 179, b: 8 },    // yellow
            { r: 253, g: 186, b: 116 },  // peach
            { r: 220, g: 38, b: 38 },    // deep red
            { r: 251, g: 191, b: 36 },   // gold
        ];

        function resize() {
            const hero = canvas.parentElement;
            width = canvas.width = hero.offsetWidth;
            height = canvas.height = hero.offsetHeight;
        }

        resize();
        window.addEventListener('resize', resize);

        // Track mouse
        const hero = canvas.parentElement;
        hero.style.cursor = 'default';

        hero.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isMouseInHero = true;
        });

        hero.addEventListener('mouseleave', () => {
            isMouseInHero = false;
        });

        // Noise for organic flow
        function noise(x, y, t) {
            return Math.sin(x * 0.015 + t) * Math.cos(y * 0.015 + t * 0.7) +
                Math.sin(x * 0.008 - t * 0.5) * Math.cos(y * 0.012 + t * 0.3);
        }

        let time = 0;

        // Helper: angular difference normalized to [0, PI]
        function angleDiff(a, b) {
            let d = Math.abs(a - b) % (Math.PI * 2);
            if (d > Math.PI) d = Math.PI * 2 - d;
            return d;
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            time += 0.006;

            const cols = Math.floor(width / CELL_SIZE) + 2;
            const rows = Math.floor(height / CELL_SIZE) + 2;
            const offsetX = (width - cols * CELL_SIZE) / 2;
            const offsetY = (height - rows * CELL_SIZE) / 2;

            // === PASS 1: Compute all angles & mouse influence ===
            const angles = new Float32Array(rows * cols);
            const influences = new Float32Array(rows * cols);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = offsetX + col * CELL_SIZE + CELL_SIZE / 2;
                    const y = offsetY + row * CELL_SIZE + CELL_SIZE / 2;
                    const idx = row * cols + col;

                    let angle = noise(x, y, time) * Math.PI;

                    let inf = 0;
                    if (isMouseInHero) {
                        const dx = mouseX - x;
                        const dy = mouseY - y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < INFLUENCE_RADIUS) {
                            inf = 1 - dist / INFLUENCE_RADIUS;
                            inf = inf * inf;
                            const mouseAngle = Math.atan2(dy, dx);
                            angle = angle * (1 - inf * 0.9) + (mouseAngle + Math.PI) * inf * 0.9;
                        }
                    }

                    angles[idx] = angle;
                    influences[idx] = inf;
                }
            }

            // === PASS 2: Compute coherence & render ===
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const idx = row * cols + col;
                    const angle = angles[idx];
                    const influenceFactor = influences[idx];

                    const x = offsetX + col * CELL_SIZE + CELL_SIZE / 2;
                    const y = offsetY + row * CELL_SIZE + CELL_SIZE / 2;

                    // Check alignment with neighbors (8-directional)
                    let coherence = 0;
                    let neighborCount = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const nr = row + dr;
                            const nc = col + dc;
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                                const nIdx = nr * cols + nc;
                                const diff = angleDiff(angle, angles[nIdx]);
                                // Similarity: 1 = perfectly aligned, 0 = perpendicular
                                coherence += Math.max(0, 1 - diff / (Math.PI * 0.5));
                                neighborCount++;
                            }
                        }
                    }
                    coherence = neighborCount > 0 ? coherence / neighborCount : 0;
                    // coherence is 0..1, where 1 = all neighbors point the same way

                    // Wave boost: vectors in coherent streams glow brighter
                    const waveBoost = coherence * coherence; // ease-in for sharper waves

                    // Color
                    const colorIndex = Math.abs(Math.floor(
                        noise(x * 0.4, y * 0.4, time * 0.25) * colors.length + time * 2
                    )) % colors.length;
                    const color = colors[colorIndex];

                    // Opacity: base + mouse + wave coherence
                    const baseOpacity = 0.1 + Math.abs(noise(x, y, time * 0.5)) * 0.08;
                    const opacity = Math.min(0.85,
                        baseOpacity + influenceFactor * 0.5 + waveBoost * 0.35
                    );

                    // Width: thicker in waves and near mouse
                    const lineWidth = 1 + waveBoost * 1.5 + influenceFactor * 2;

                    // Length: longer in coherent streams
                    const len = LINE_LENGTH * (0.5 + waveBoost * 0.4 + influenceFactor * 0.4);
                    const endX = x + Math.cos(angle) * len;
                    const endY = y + Math.sin(angle) * len;

                    // Draw the vector
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
                    ctx.lineWidth = lineWidth;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Glow dot at tip for coherent streams or mouse-influenced vectors
                    if (waveBoost > 0.5 || influenceFactor > 0.15) {
                        const dotSize = 1.5 + waveBoost * 1.5 + influenceFactor * 2;
                        ctx.beginPath();
                        ctx.arc(endX, endY, dotSize, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.6})`;
                        ctx.fill();
                    }
                }
            }

            requestAnimationFrame(draw);
        }

        draw();
    }

    // ============================================
    // SIDE NAVIGATION — Active section tracking
    // ============================================
    const sideNav = document.getElementById('sideNav');
    if (sideNav) {
        const navItems = sideNav.querySelectorAll('.side-nav-item');
        const sections = document.querySelectorAll('section[id]');

        const updateActiveNav = () => {
            const scroll = window.scrollY + window.innerHeight / 3;

            let activeId = 'hero';
            sections.forEach(section => {
                if (scroll >= section.offsetTop) {
                    activeId = section.id;
                }
            });

            navItems.forEach(item => {
                item.classList.toggle('active', item.dataset.section === activeId);
            });
        };

        window.addEventListener('scroll', updateActiveNav, { passive: true });
        updateActiveNav();

        // Smooth scroll on click
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(item.getAttribute('href'));
                if (target) {
                    const offset = target.id === 'hero' ? 0 : 40;
                    window.scrollTo({
                        top: target.offsetTop - offset,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Also handle org page nav toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================================
    // SMOOTH SCROLL (for # links)
    // ============================================
    document.querySelectorAll('a[href^="#"]:not(.side-nav-item)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 60;
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
    // TILT EFFECT ON CARDS (desktop only)
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

    console.log('🔥 Portfolio loaded');
});
