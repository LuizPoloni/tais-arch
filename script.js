/* ═══════════════════════════════════════════════════════════
   THAIS ARQUITETURA — Premium JavaScript
   GSAP + ScrollTrigger + Lenis + SplitType
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── WAIT FOR DOM ─── */
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initGSAP();
  initCursor();
  initNavbar();
  initHeroAnimations();
  initScrollAnimations();
  initParallax();
  initServiceCards();
  initCounters();
  initMagneticButtons();
  initContactForm();
  initScrollProgress();
  initMobileMenu();
  initMouseParallax();
  initSectionObserver();
});

/* ══════════════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════════════ */
/* ══════════════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════════════ */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 1.5,
  });

  // Synchronize ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Optimized lag smoothing to prevent stutter while handling high refresh rate displays
  gsap.ticker.lagSmoothing(500, 33);

  // Store globally for unified scroll listener
  window._lenis = lenis;
}

/* ══════════════════════════════════════════
   GSAP SETUP
══════════════════════════════════════════ */
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
}

/* ══════════════════════════════════════════
   CUSTOM CURSOR (IDLE-PAUSED RAF LOOP)
══════════════════════════════════════════ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (!cursor || !follower) return;
  if (window.matchMedia('(hover: none)').matches) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;
  let isMoving = false;
  let rafId = null;

  function updateFollower() {
    const dx = mouseX - followerX;
    const dy = mouseY - followerY;

    followerX += dx * 0.15;
    followerY += dy * 0.15;

    gsap.set(follower, { x: followerX, y: followerY });

    // Pause loop when follower catches up to mouse to free main thread
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      rafId = requestAnimationFrame(updateFollower);
    } else {
      isMoving = false;
      rafId = null;
    }
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.set(cursor, { x: mouseX, y: mouseY });

    if (!isMoving) {
      isMoving = true;
      rafId = requestAnimationFrame(updateFollower);
    }
  }, { passive: true });

  // Hover states
  const hoverElements = document.querySelectorAll('a, button, .service-card, .client-logo');
  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor, { scale: 2.5, duration: 0.2, overwrite: 'auto' });
      gsap.to(follower, { scale: 1.5, borderColor: '#C6A66B', duration: 0.2, overwrite: 'auto' });
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: 'auto' });
      gsap.to(follower, { scale: 1, borderColor: 'rgba(198,166,107,0.5)', duration: 0.2, overwrite: 'auto' });
    }, { passive: true });
  });
}

/* ══════════════════════════════════════════
   NAVBAR (UNIFIED LENIS SCROLL LISTENER)
══════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let isScrolled = false;

  const checkScroll = (scrollY) => {
    const shouldBeScrolled = scrollY > 60;
    if (shouldBeScrolled !== isScrolled) {
      isScrolled = shouldBeScrolled;
      if (isScrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  };

  if (window._lenis) {
    window._lenis.on('scroll', (e) => checkScroll(e.scroll));
  } else {
    window.addEventListener('scroll', () => checkScroll(window.scrollY), { passive: true });
  }

  // Animate navbar in
  gsap.to([
    document.getElementById('navLogo'),
    document.querySelector('.nav-links'),
    document.getElementById('navCta'),
  ], {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.6,
  });
}

/* ══════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ══════════════════════════════════════════
   HERO ANIMATIONS
══════════════════════════════════════════ */
function initHeroAnimations() {
  const tl = gsap.timeline({ delay: 0.2 });

  // Label
  tl.to('#heroLabel', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
  });

  // Title lines
  tl.to('.title-line', {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out',
  }, '-=0.5');

  // Subtitle
  tl.to('#heroSubtitle', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
  }, '-=0.5');

  // Actions
  tl.to('#heroActions', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.5');

  // Scroll indicator
  tl.to('#scrollIndicator', {
    opacity: 1,
    duration: 0.8,
  }, '-=0.3');

  // Stat bar
  tl.to('.hero-stat-bar', {
    opacity: 1,
    duration: 0.8,
  }, '-=0.5');

  // Hero image: subtle scale-in on load
  gsap.fromTo('#heroImg',
    { scale: 1.1 },
    { scale: 1.05, duration: 1.8, ease: 'power2.out', delay: 0 }
  );
}

/* ══════════════════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════════════════ */
function initScrollAnimations() {
  // Generic reveal
  gsap.utils.toArray('.reveal-text').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });

  // Editorial headings with stagger per block
  gsap.utils.toArray('.editorial-block').forEach((block) => {
    const items = block.querySelectorAll('.reveal-text');
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: block,
        start: 'top 80%',
        once: true,
      },
    });
  });

  // About section text stagger
  gsap.to('.about-text-col .reveal-text', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 75%',
      once: true,
    },
  });

  // About image reveal
  gsap.fromTo('.about-img-wrap', 
    { opacity: 0, x: 50 },
    {
      opacity: 1,
      x: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-image-col',
        start: 'top 80%',
        once: true,
      },
    }
  );

  // Accent card
  gsap.fromTo('.about-accent-card',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.4,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.about-image-col',
        start: 'top 75%',
        once: true,
      },
    }
  );

  // Showcase overlay text
  gsap.fromTo('.showcase-overlay-text span',
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.showcase',
        start: 'top 70%',
        once: true,
      },
    }
  );

  // Why items
  gsap.utils.toArray('.why-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: 30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  // Landscape content
  gsap.utils.toArray('.landscape-content .reveal-text').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.landscape-panel',
        start: 'top 75%',
        once: true,
      },
    });
  });
}

/* ══════════════════════════════════════════
   PARALLAX EFFECTS
══════════════════════════════════════════ */
function initParallax() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Hero image: scale up slightly on scroll (parallax feel)
  gsap.fromTo('#heroImg',
    { scale: 1.05 },
    {
      scale: 1.18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    }
  );

  // Skip heavy scrub parallax on mobile — preserves performance
  if (!isMobile) {
    // Parallax for all parallax-img elements
    gsap.utils.toArray('.parallax-img').forEach((img) => {
      const wrap = img.closest('.parallax-wrap');
      if (!wrap) return;

      gsap.fromTo(img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );
    });

    // Landscape parallax
    gsap.fromTo('.landscape-img',
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.landscape-panel',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }
    );

    // Floating badge subtle movement
    gsap.to('.why-floating-badge', {
      y: -10,
      duration: 2.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    // About accent card float
    gsap.to('.about-accent-card', {
      y: -8,
      duration: 3,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      delay: 0.5,
    });
  }
}


/* ══════════════════════════════════════════
   SERVICE CARDS
══════════════════════════════════════════ */
function initServiceCards() {
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: (i % 3) * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

/* ══════════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════════ */
function initCounters() {
  const statCards = document.querySelectorAll('.stat-card');

  gsap.to(statCards, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.stats-section',
      start: 'top 80%',
      once: true,
    },
  });

  document.querySelectorAll('.stat-counter').forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-target'), 10);

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            counter.textContent = Math.floor(obj.val);
          },
        });
      },
    });
  });
}

/* ══════════════════════════════════════════
   MAGNETIC BUTTONS (CACHED RECT, ZERO REFLOW)
══════════════════════════════════════════ */
function initMagneticButtons() {
  const magnetics = document.querySelectorAll('.magnetic');
  if (window.matchMedia('(hover: none)').matches) return;

  magnetics.forEach((btn) => {
    let rect = null;

    btn.addEventListener('mouseenter', () => {
      rect = btn.getBoundingClientRect();
    }, { passive: true });

    btn.addEventListener('mousemove', (e) => {
      if (!rect) rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      rect = null;
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto',
      });
    }, { passive: true });
  });
}

/* ══════════════════════════════════════════
   MOUSE PARALLAX ON HERO (RAF THROTTLED)
══════════════════════════════════════════ */
function initMouseParallax() {
  const hero = document.querySelector('.hero');
  const heroImg = document.getElementById('heroImg');
  if (!hero || !heroImg) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let rect = null;
  let ticking = false;

  hero.addEventListener('mouseenter', () => {
    rect = hero.getBoundingClientRect();
  }, { passive: true });

  hero.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      if (!rect) rect = hero.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(heroImg, {
        x: xRatio * 24,
        y: yRatio * 14,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      ticking = false;
    });
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    rect = null;
    gsap.to(heroImg, {
      x: 0,
      y: 0,
      duration: 1.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, { passive: true });
}

/* ══════════════════════════════════════════
   SCROLL PROGRESS BAR (GPU TRANSFORM scaleX)
══════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  let maxScroll = 1;

  const updateMaxScroll = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };

  updateMaxScroll();
  window.addEventListener('resize', updateMaxScroll, { passive: true });

  const updateProgress = (scrollY, progress) => {
    const p = progress !== undefined ? progress : Math.min(1, Math.max(0, scrollY / maxScroll));
    bar.style.transform = `scaleX(${p}) translateZ(0)`;
  };

  if (window._lenis) {
    window._lenis.on('scroll', (e) => updateProgress(e.scroll, e.progress));
  } else {
    window.addEventListener('scroll', () => updateProgress(window.scrollY), { passive: true });
  }
}

/* ══════════════════════════════════════════
   ACTIVE SECTION OBSERVER (CACHED DOM)
══════════════════════════════════════════ */
function initSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  let currentActive = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (currentActive !== id) {
          currentActive = id;
          navLinks.forEach((link) => {
            if (link.getAttribute('data-section') === id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach((s) => observer.observe(s));
}

/* ══════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  // Input focus animations
  form.querySelectorAll('.form-input, .form-textarea').forEach((input) => {
    input.addEventListener('focus', () => {
      gsap.to(input, { scale: 1.01, duration: 0.3, ease: 'power2.out' });
    });
    input.addEventListener('blur', () => {
      gsap.to(input, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-submit');
    const btnText = btn.querySelector('.btn-text');

    // Animate button
    btnText.textContent = 'Enviando...';
    gsap.to(btn, { scale: 0.96, duration: 0.15 });

    // Simulate sending
    setTimeout(() => {
      gsap.to(btn, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      btnText.textContent = 'Enviado!';

      if (success) {
        success.classList.add('visible');
        gsap.fromTo(success,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      }

      form.reset();

      setTimeout(() => {
        btnText.textContent = 'Enviar Mensagem';
        if (success) success.classList.remove('visible');
      }, 5000);
    }, 1600);
  });
}

/* ══════════════════════════════════════════
   SMOOTH ANCHOR SCROLLING
══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    if (window._lenis) {
      window._lenis.scrollTo(target, {
        offset: -80,
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════
   PAGE LOAD TRANSITION
══════════════════════════════════════════ */
(function createLoadTransition() {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: '#111111',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '12px',
  });

  const logo = document.createElement('div');
  logo.innerHTML = `
    <div style="font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; letter-spacing: 0.2em; color: #ffffff; text-align: center;">THAIS</div>
    <div style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 400; letter-spacing: 0.4em; color: rgba(255,255,255,0.4); text-align: center; text-transform: uppercase;">ARQUITETURA</div>
  `;

  const line = document.createElement('div');
  Object.assign(line.style, {
    width: '0px',
    height: '1px',
    background: '#C6A66B',
    marginTop: '24px',
    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  });

  overlay.appendChild(logo);
  overlay.appendChild(line);
  document.body.appendChild(overlay);

  // Animate loading bar
  requestAnimationFrame(() => {
    setTimeout(() => { line.style.width = '120px'; }, 100);
  });

  // Remove overlay
  window.addEventListener('load', () => {
    setTimeout(() => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => overlay.remove(),
      });
    }, 700);
  });
})();
