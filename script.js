/* ═══════════════════════════════════════════════════════════
   THAIS ARQUITETURA — Premium JavaScript
   GSAP + ScrollTrigger + Lenis
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── WAIT FOR DOM ─── */
document.addEventListener('DOMContentLoaded', () => {
  const canAnimate = !prefersReducedMotion() && initGSAP();
  initHeroVideo();

  if (canAnimate) {
    initLenis();
    initHeroAnimations();
    initScrollAnimations();
    initParallax();
    initServiceCards();
    initCounters();
  }

  initNavbar(canAnimate);
  initContactForm(canAnimate);
  initScrollProgress();
  initMobileMenu();
  initSectionObserver();
});

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  const cinematicRate = 0.75;
  const freezeOffset = 0.45;
  let hasFrozenAtEnd = false;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = false;
  video.defaultPlaybackRate = cinematicRate;
  video.playbackRate = cinematicRate;

  video.addEventListener('loadedmetadata', () => {
    video.defaultPlaybackRate = cinematicRate;
    video.playbackRate = cinematicRate;
  }, { once: true });

  const freezeAtEnd = () => {
    if (hasFrozenAtEnd || !Number.isFinite(video.duration) || video.duration <= 0) return;
    if (video.currentTime < video.duration - freezeOffset) return;

    hasFrozenAtEnd = true;
    video.pause();
    video.setAttribute('data-playback', 'ended');
  };

  video.addEventListener('timeupdate', freezeAtEnd);
  video.addEventListener('ended', () => {
    hasFrozenAtEnd = true;
    video.pause();
    video.setAttribute('data-playback', 'ended');
  }, { once: true });

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      video.setAttribute('data-playback', 'poster');
    });
  }
}

/* ══════════════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════════════ */
function initLenis() {
  const shouldUseNativeScroll = window.matchMedia(
    '(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)'
  ).matches;

  if (shouldUseNativeScroll || !window.Lenis || !window.gsap || !window.ScrollTrigger) return;

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
  if (!window.gsap || !window.ScrollTrigger) return false;

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
  return true;
}

/* ══════════════════════════════════════════
   NAVBAR (UNIFIED LENIS SCROLL LISTENER)
══════════════════════════════════════════ */
function initNavbar(canAnimate = false) {
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

  if (!canAnimate) return;

  // Animate navbar in
  gsap.fromTo([
    document.getElementById('navLogo'),
    document.querySelector('.nav-links'),
    document.getElementById('navCta'),
  ].filter(Boolean), {
    y: -12,
  }, {
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

  const closeMenu = () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

/* ══════════════════════════════════════════
   HERO ANIMATIONS
══════════════════════════════════════════ */
function initHeroAnimations() {
  const tl = gsap.timeline();

  // Label
  tl.fromTo('#heroLabel', {
    y: 20,
  }, {
    y: 0,
    duration: 0.65,
    ease: 'power3.out',
  });

  // Title lines
  tl.fromTo('.title-line', {
    y: 40,
  }, {
    y: 0,
    duration: 0.85,
    stagger: 0.15,
    ease: 'power3.out',
  }, '-=0.35');

  // Subtitle
  tl.fromTo('#heroSubtitle', {
    y: 20,
  }, {
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
  }, '-=0.35');

  // Actions
  tl.fromTo('#heroActions', {
    y: 20,
  }, {
    y: 0,
    duration: 0.65,
    ease: 'power3.out',
  }, '-=0.3');

  // Scroll indicator
  tl.fromTo('#scrollIndicator', {
    opacity: 0,
  }, {
    opacity: 1,
    duration: 0.8,
  }, '-=0.3');

  // Stat bar
  tl.fromTo('.hero-stat-bar', {
    opacity: 0,
  }, {
    opacity: 1,
    duration: 0.8,
  }, '-=0.5');

  gsap.fromTo('#heroVideo',
    { opacity: 0.96 },
    { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0 }
  );
}

/* ══════════════════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════════════════ */
function initScrollAnimations() {
  // Generic reveal
  gsap.utils.toArray('.reveal-text').forEach((el) => {
    if (el.closest('.editorial-block') || el.classList.contains('why-item')) return;

    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  // About image reveal
  gsap.fromTo('.about-img-wrap', 
    { opacity: 0, x: 36, scale: 0.98 },
    {
      opacity: 1,
      x: 0,
      scale: 1,
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
    { opacity: 0, y: 24, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
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

  // Editorial project blocks
  gsap.utils.toArray('.editorial-block').forEach((block) => {
    const image = block.querySelector('.editorial-img-wrap');
    const captionNumber = block.querySelector('.caption-num');
    const textItems = block.querySelectorAll('.editorial-text .reveal-text');

    if (image) {
      gsap.fromTo(image,
        { opacity: 0, y: 42, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 78%',
            once: true,
          },
        }
      );
    }

    if (captionNumber) {
      gsap.fromTo(captionNumber,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: 0.25,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 78%',
            once: true,
          },
        }
      );
    }

    if (textItems.length) {
      gsap.fromTo(textItems,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 76%',
            once: true,
          },
        }
      );
    }
  });

  gsap.fromTo('.landscape-img-wrap',
    { opacity: 0, scale: 1.03 },
    {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.landscape-panel',
        start: 'top 82%',
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
      { opacity: 0, x: 24 },
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

}

/* ══════════════════════════════════════════
   PARALLAX EFFECTS
══════════════════════════════════════════ */
function initParallax() {
  const shouldSkipParallax = window.matchMedia(
    '(max-width: 900px), (prefers-reduced-motion: reduce)'
  ).matches;

  if (shouldSkipParallax) return;

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


/* ══════════════════════════════════════════
   SERVICE CARDS
══════════════════════════════════════════ */
function initServiceCards() {
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    const cardNumber = card.querySelector('.card-num');

    gsap.fromTo(card,
      { opacity: 0, y: 36, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: (i % 3) * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true,
        },
      }
    );

    if (cardNumber) {
      gsap.fromTo(cardNumber,
        { opacity: 0, y: -8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.15 + (i % 3) * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }
  });
}

/* ══════════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════════ */
function initCounters() {
  const statCards = document.querySelectorAll('.stat-card');

  gsap.fromTo(statCards,
    { opacity: 0, y: 30 },
    {
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
    }
  );

  document.querySelectorAll('.stat-counter').forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-target'), 10);

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        counter.textContent = '0';
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
              link.setAttribute('aria-current', 'page');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
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
function initContactForm(canAnimate = false) {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  // Input focus animations
  if (canAnimate) {
    form.querySelectorAll('.form-input, .form-textarea').forEach((input) => {
      input.addEventListener('focus', () => {
        gsap.to(input, { scale: 1.01, duration: 0.3, ease: 'power2.out' });
      });
      input.addEventListener('blur', () => {
        gsap.to(input, { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-submit');
    const btnText = btn.querySelector('.btn-text');

    // Animate button
    btn.disabled = true;
    btnText.textContent = 'Enviando...';
    if (canAnimate) {
      gsap.to(btn, { scale: 0.96, duration: 0.15 });
    }

    // Simulate sending
    setTimeout(() => {
      if (canAnimate) {
        gsap.to(btn, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      }
      btnText.textContent = 'Enviado!';

      if (success) {
        success.classList.add('visible');
        if (canAnimate) {
          gsap.fromTo(success,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          );
        }
      }

      form.reset();

      setTimeout(() => {
        btn.disabled = false;
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
