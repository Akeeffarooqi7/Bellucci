/* =========================================================
   BELLUCCI'S — Editorial Italian (sample site)
   ========================================================= */
(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    /* -------- Image fallback chain (data-fb="url1,url2,...") -------- */
    const handleImgError = (img) => {
        const fb = img.getAttribute('data-fb');
        if (!fb) {
            img.style.background = 'var(--stone)';
            return;
        }
        const urls = fb.split(',').map(s => s.trim()).filter(Boolean);
        const next = urls.shift();
        if (next) {
            img.src = next;
            if (urls.length) img.setAttribute('data-fb', urls.join(','));
            else img.removeAttribute('data-fb');
        } else {
            img.removeAttribute('data-fb');
        }
    };
    // Delegate via capture so dynamically-added images are handled too
    document.addEventListener('error', (e) => {
        if (e.target && e.target.tagName === 'IMG' && e.target.hasAttribute('data-fb')) {
            handleImgError(e.target);
        }
    }, true);

    /* -------- Loader -------- */
    window.addEventListener('load', () => {
        const loader = $('#loader');
        if (!loader) return;
        setTimeout(() => loader.classList.add('is-done'), 1500);
        setTimeout(() => loader.remove(), 2400);
    });

    /* -------- Year -------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* -------- Sticky nav scroll state -------- */
    const nav = $('#nav');
    const onScroll = () => {
        if (!nav) return;
        nav.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* -------- Active nav link based on scroll -------- */
    const navLinks = $$('.nav__link');
    const sections = navLinks
        .map(l => document.querySelector(l.getAttribute('href')))
        .filter(Boolean);
    const setActiveLink = () => {
        const y = window.scrollY + 120;
        let activeId = null;
        sections.forEach(s => {
            if (s.offsetTop <= y) activeId = s.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + activeId);
        });
    };
    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();

    /* -------- Mobile menu -------- */
    const navToggle = $('#navToggle');
    const navMenu = $('#navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('is-open');
            navToggle.classList.toggle('is-active', open);
            navToggle.setAttribute('aria-expanded', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
        $$('.nav__link', navMenu).forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
                navToggle.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* -------- Reveal on scroll -------- */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('is-visible'));
    }

    /* -------- Parallax background layers -------- */
    const parallaxEls = $$('[data-parallax]');
    let ticking = false;
    const updateParallax = () => {
        const vh = window.innerHeight;
        parallaxEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > vh) return;
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            const center = rect.top + rect.height / 2 - vh / 2;
            const offset = -center * speed;
            el.style.transform = `translate3d(0, ${offset}px, 0)`;
        });
        ticking = false;
    };
    const requestParallax = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    };
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    updateParallax();

    /* -------- Hero photo subtle scroll-tilt -------- */
    const tiltEls = $$('[data-tilt]');
    const updateTilt = () => {
        const vh = window.innerHeight;
        tiltEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > vh) return;
            const dir = parseFloat(el.dataset.tilt) || 1;
            const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
            el.style.setProperty('--scroll-tilt', (progress * dir * 4) + 'deg');
        });
    };
    window.addEventListener('scroll', () => requestAnimationFrame(updateTilt), { passive: true });

    /* -------- Smooth scroll for anchors -------- */
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* -------- Menu tabs -------- */
    const menuTabs = $$('.menu__tab');
    const menuPanels = $$('.menu__panel');
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const cat = tab.dataset.cat;
            menuTabs.forEach(t => t.classList.toggle('is-active', t === tab));
            menuPanels.forEach(p => p.classList.toggle('is-active', p.dataset.cat === cat));
        });
    });

    /* -------- Daily Specials carousel -------- */
    const specialsData = [
        {
            day: 'Monday',
            tag: 'Lunedì',
            title: "Nonna's <em>Lasagna</em>",
            desc: 'Layers of fresh egg pasta, slow-simmered six-hour ragù, hand-pulled mozzarella, and creamy ricotta — baked until the corners crisp.',
            price: '$24',
            img: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200&q=88',
            fb: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=88'
        },
        {
            day: 'Tuesday',
            tag: 'Martedì',
            title: 'Pollo <em>Cacciatore</em>',
            desc: "Hunter's chicken braised with bell peppers, kalamata olives, San Marzano tomato, white wine, and rosemary. Served over polenta.",
            price: '$26',
            img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=88',
            fb: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=88'
        },
        {
            day: 'Wednesday',
            tag: 'Mercoledì',
            title: 'Eggplant <em>Parmigiana</em>',
            desc: 'Twice-fried Sicilian eggplant, San Marzano gravy, fresh mozzarella, parmigiano-reggiano, basil — a Bellucci classic since 1924.',
            price: '$22',
            img: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=1200&q=88',
            fb: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200&q=88'
        },
        {
            day: 'Thursday',
            tag: 'Giovedì',
            title: 'Veal <em>Marsala</em>',
            desc: 'Tender veal scallopine, wild mushroom marsala reduction, butter, parsley. Served with truffle mashed potatoes.',
            price: '$32',
            img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=88',
            fb: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=88'
        },
        {
            day: 'Friday',
            tag: 'Venerdì',
            title: 'Linguine <em>alle Vongole</em>',
            desc: 'Fresh manila clams, white wine, garlic confit, calabrian chili, parsley, and lemon. The taste of the Amalfi coast.',
            price: '$28',
            img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=88',
            fb: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=88,https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&q=88'
        },
        {
            day: 'Saturday',
            tag: 'Sabato',
            title: '<em>Osso Buco</em>',
            desc: 'Braised veal shank in white wine and tomato, finished with bright lemon-parsley gremolata. Served over saffron risotto Milanese.',
            price: '$36',
            img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=88',
            fb: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200&q=88,https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=88'
        },
        {
            day: 'Sunday',
            tag: 'Domenica',
            title: 'La Domenica <em>Gravy</em>',
            desc: "Sunday gravy with house meatballs, sweet sausage, and pork braciole — slow-simmered all morning. Served family-style over rigatoni.",
            price: '$28',
            img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=88',
            fb: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=88'
        }
    ];

    const specialsStage = $('#specialsStage');
    const dayBtns = $$('.specials__day');

    if (specialsStage && dayBtns.length) {
        // build panels
        specialsData.forEach((d, i) => {
            const panel = document.createElement('div');
            panel.className = 'specials__panel';
            panel.dataset.day = i;
            panel.innerHTML = `
                <div class="specials__photo">
                    <img src="${d.img}" data-fb="${d.fb}" alt="${d.day} special" loading="lazy" />
                    <span class="specials__photo-tag">${d.tag}</span>
                </div>
                <div class="specials__info">
                    <span class="specials__day-label">${d.day} Special</span>
                    <h3 class="specials__title">${d.title}</h3>
                    <p class="specials__desc">${d.desc}</p>
                    <div class="specials__price-row">
                        <span class="specials__price">${d.price}</span>
                        <span class="specials__price-label">Available all day</span>
                    </div>
                </div>
            `;
            specialsStage.appendChild(panel);
        });

        const panels = $$('.specials__panel', specialsStage);

        const setDay = (idx) => {
            dayBtns.forEach((b, i) => b.classList.toggle('is-active', i === idx));
            panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
        };

        dayBtns.forEach((b, i) => b.addEventListener('click', () => setDay(i)));

        // Today indicator (Mon=0..Sun=6 in our data; JS getDay: Sun=0..Sat=6)
        const jsDay = new Date().getDay();
        const today = (jsDay + 6) % 7; // shift so Monday=0
        if (dayBtns[today]) dayBtns[today].classList.add('is-today');
        setDay(today);
    }

    /* -------- Delivery stacked carousel -------- */
    const dStage = $('#deliveryStage');
    const dCardsWrap = $('#deliveryCards');
    const dCards = dCardsWrap ? $$('.d-card', dCardsWrap) : [];
    const dPrev = $('#deliveryPrev');
    const dNext = $('#deliveryNext');
    const dDotsWrap = $('#deliveryDots');

    if (dStage && dCards.length) {
        let active = 0;
        let autoTimer = null;
        let isAnimating = false;

        const updateStack = () => {
            dCards.forEach((card, i) => {
                const pos = (i - active + dCards.length) % dCards.length;
                card.setAttribute('data-pos', pos);
                card.classList.remove('is-swipe-left', 'is-swipe-right');
            });
            $$('.delivery__dot', dDotsWrap).forEach((d, i) => {
                d.classList.toggle('is-active', i === active);
            });
        };

        const goNext = () => {
            if (isAnimating) return;
            isAnimating = true;
            const front = dCards.find(c => c.getAttribute('data-pos') === '0');
            if (front) front.classList.add('is-swipe-left');
            setTimeout(() => {
                active = (active + 1) % dCards.length;
                updateStack();
                isAnimating = false;
            }, 480);
        };

        const goPrev = () => {
            if (isAnimating) return;
            isAnimating = true;
            // bring last card forward visually first
            const targetIdx = (active - 1 + dCards.length) % dCards.length;
            const incoming = dCards[targetIdx];
            // animate incoming from right
            incoming.classList.add('is-swipe-right');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    incoming.classList.remove('is-swipe-right');
                    active = targetIdx;
                    updateStack();
                    isAnimating = false;
                }, 30);
            });
        };

        // Build dots
        if (dDotsWrap) {
            dDotsWrap.innerHTML = '';
            dCards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'delivery__dot';
                dot.type = 'button';
                dot.setAttribute('aria-label', `Show option ${i + 1}`);
                dot.addEventListener('click', () => {
                    if (isAnimating || i === active) return;
                    active = i;
                    updateStack();
                    restartAuto();
                });
                dDotsWrap.appendChild(dot);
            });
        }

        // Prev / Next
        dNext?.addEventListener('click', () => { goNext(); restartAuto(); });
        dPrev?.addEventListener('click', () => { goPrev(); restartAuto(); });

        // Click on a back card brings it to the front
        dCards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                const pos = card.getAttribute('data-pos');
                if (pos !== '0') {
                    e.preventDefault();
                    if (isAnimating) return;
                    active = i;
                    updateStack();
                    restartAuto();
                }
            });
        });

        // Touch swipe on the stage
        let touchX = 0, touchY = 0, touchTime = 0, swiping = false;
        dCardsWrap.addEventListener('touchstart', (e) => {
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
            touchTime = Date.now();
            swiping = true;
        }, { passive: true });
        dCardsWrap.addEventListener('touchend', (e) => {
            if (!swiping) return;
            const dx = e.changedTouches[0].clientX - touchX;
            const dy = e.changedTouches[0].clientY - touchY;
            const elapsed = Date.now() - touchTime;
            // horizontal swipe: |dx| > 50, less than ~600ms, and mostly horizontal
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && elapsed < 800) {
                if (dx < 0) goNext(); else goPrev();
                restartAuto();
            }
            swiping = false;
        }, { passive: true });

        // Keyboard
        dStage.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { goNext(); restartAuto(); }
            else if (e.key === 'ArrowLeft') { goPrev(); restartAuto(); }
        });

        // Autoplay
        const startAuto = () => {
            autoTimer = setInterval(goNext, 5500);
        };
        const stopAuto = () => {
            if (autoTimer) clearInterval(autoTimer);
            autoTimer = null;
        };
        const restartAuto = () => { stopAuto(); startAuto(); };

        // Pause on hover (desktop)
        if (window.matchMedia('(hover: hover)').matches) {
            dStage.addEventListener('mouseenter', stopAuto);
            dStage.addEventListener('mouseleave', startAuto);
        }

        // Pause when off-screen, resume when in view
        if ('IntersectionObserver' in window) {
            const visIo = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) startAuto();
                    else stopAuto();
                });
            }, { threshold: 0.3 });
            visIo.observe(dStage);
        } else {
            startAuto();
        }

        updateStack();
    }

    /* -------- Floating Order FAB -------- */
    const fab = $('#fab');
    const fabToggle = $('#fabToggle');
    const fabMenu = $('#fabMenu');
    if (fab && fabToggle) {
        const closeFab = () => {
            fab.classList.remove('is-open');
            fabToggle.setAttribute('aria-expanded', 'false');
        };
        const toggleFab = () => {
            const open = fab.classList.toggle('is-open');
            fabToggle.setAttribute('aria-expanded', String(open));
        };
        fabToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFab();
        });
        document.addEventListener('click', (e) => {
            if (fab.classList.contains('is-open') && !fab.contains(e.target)) closeFab();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeFab();
        });
        // Auto-hide near footer
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            const nearBottom = (window.innerHeight + y) >= (document.documentElement.scrollHeight - 200);
            fab.style.opacity = nearBottom ? '0' : '1';
            fab.style.pointerEvents = nearBottom ? 'none' : '';
        }, { passive: true });
    }

    /* -------- Magnetic CTAs (desktop only) -------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        $$('.btn--primary, .btn--ink, .fab__toggle').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.18;
                const y = (e.clientY - r.top - r.height / 2) * 0.18;
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* -------- Form submit feedback -------- */
    const form = $('#contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            if (!btn) return;
            const original = btn.innerHTML;
            btn.innerHTML = '<span>Sending…</span>';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = '<span>✓ Request sent — we\'ll be in touch</span>';
                form.reset();
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.disabled = false;
                }, 3500);
            }, 900);
        });
    }
})();
