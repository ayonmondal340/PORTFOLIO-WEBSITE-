/**
 * Main Application Controller for Ayon Mondal Portfolio
 * Orchestrates the cinematic frame-by-frame notebook scroll,
 * smooth navigation, preloader, audio synthesis, paper transitions,
 * interactive cursor follower, click ripples, and project modals.
 */

// ==========================================================================
// PROJECT 01 POWER BI EMBED CONFIGURATION
// Configure the live Power BI dashboard embed or report link here:
// ==========================================================================
const POWER_BI_PROJECT_URL = null; // Set to live URL e.g. "https://app.powerbi.com/view?r=..." when available

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const preloader = document.getElementById('preloaderContainer');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderPercent = document.getElementById('preloaderPercent');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const heroInitialOverlay = document.getElementById('heroInitialOverlay');
  const heroProgressPill = document.getElementById('heroProgressPill');
  const pillPhaseText = document.getElementById('pillPhaseText');
  const pillProgressBar = document.getElementById('pillProgressBar');
  const heroPageOverlay = document.getElementById('heroPageOverlay');
  const paperTransitionSurface = document.getElementById('paperTransitionSurface');
  const navbar = document.getElementById('mainNavbar');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const navBtns = document.querySelectorAll('.nav-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const heroScrollTrack = document.getElementById('heroScrollTrack');

  // Custom Cursor Elements
  const customCursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const rippleContainer = document.getElementById('cursorRippleContainer');

  // Project 01 Modal Elements
  const pbiProjectBtn = document.getElementById('pbiProjectBtn');
  const pbiCardMedia = document.getElementById('pbiCardMedia');
  const projectModal = document.getElementById('projectModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');
  const modalExternalBtn = document.getElementById('modalExternalBtn');

  // Cursor state
  let isCursorActive = false;
  let mouseX = -100, mouseY = -100;
  let dotX = -100, dotY = -100;
  let ringX = -100, ringY = -100;
  let isHovering = false;
  let isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // Initialize Interactive Monochrome Particle Network Background
  let particleNetwork = null;
  if (typeof ParticleNetwork !== 'undefined') {
    particleNetwork = new ParticleNetwork({
      canvas: '#particleNetworkCanvas',
      baseColor: '20, 20, 20',
      maxDistance: 135,
      mouseRadius: 140,
      repelForce: 0.6
    });
  }

  // Initialize Notebook Scroller
  const scroller = new NotebookScroller({
    track: '#heroScrollTrack',
    canvas: '#notebookCanvas',
    startFrame: 2,
    endFrame: 300,
    lerpFactor: 0.16,

    onReady: () => {
      // Frame 2 is rendered and ready
      if (preloaderBar) preloaderBar.style.width = '20%';
      if (preloaderPercent) preloaderPercent.textContent = '20%';
    },

    onLoadProgress: (pct) => {
      if (preloaderBar) preloaderBar.style.width = `${pct}%`;
      if (preloaderPercent) preloaderPercent.textContent = `${pct}%`;

      if (pct >= 35 && preloader) {
        // Once opening sequence + keyframes are cached, reveal smoothly
        preloader.classList.add('fade-out');
        setTimeout(() => {
          if (preloader) preloader.style.display = 'none';
        }, 500);
      }
    },

    onProgress: (progress, frame) => {
      updateHeroOverlays(progress, frame);
    }
  });

  // Overlay choreography based on scroll progress
  function updateHeroOverlays(progress, frame) {
    // 1. Initial Hero Text Overlay (Scroll 0% to 15%)
    if (heroInitialOverlay) {
      if (progress < 0.15) {
        const fade = 1 - (progress / 0.15);
        const translateY = -progress * 150;
        const scale = 1 - (progress * 0.05);
        heroInitialOverlay.style.opacity = fade.toFixed(3);
        heroInitialOverlay.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        heroInitialOverlay.style.pointerEvents = progress > 0.05 ? 'none' : 'auto';
        heroInitialOverlay.style.visibility = 'visible';
      } else {
        heroInitialOverlay.style.opacity = '0';
        heroInitialOverlay.style.pointerEvents = 'none';
        heroInitialOverlay.style.visibility = 'hidden';
      }
    }

    // 2. Scrub / Phase Indicator Pill (Scroll 12% to 75%)
    if (heroProgressPill) {
      if (progress >= 0.10 && progress <= 0.78) {
        heroProgressPill.style.opacity = '1';
        heroProgressPill.style.transform = 'translate(-50%, 0) scale(1)';

        let statusText = 'Opening Notebook...';
        if (progress > 0.22 && progress <= 0.65) {
          statusText = `Page ${Math.min(12, Math.max(1, Math.round((frame - 35) / 16)))} · Turning Pages`;
        } else if (progress > 0.65) {
          statusText = 'Focusing on Strategic Playbook...';
        }

        if (pillPhaseText) pillPhaseText.textContent = statusText;
        if (pillProgressBar) pillProgressBar.style.width = `${Math.round(progress * 100)}%`;
      } else {
        heroProgressPill.style.opacity = '0';
        heroProgressPill.style.transform = 'translate(-50%, 15px) scale(0.95)';
      }
    }

    // 3. In-Page Title as Camera Zooms onto paper (Scroll 76% to 96%)
    if (heroPageOverlay) {
      if (progress >= 0.76 && progress <= 0.96) {
        const inProgress = (progress - 0.76) / 0.12;
        const opacity = Math.min(1, Math.max(0, inProgress));
        heroPageOverlay.style.opacity = opacity.toFixed(3);
        heroPageOverlay.style.transform = `translate(-50%, -50%) scale(${0.96 + opacity * 0.04})`;
        heroPageOverlay.style.visibility = 'visible';
      } else {
        heroPageOverlay.style.opacity = '0';
        heroPageOverlay.style.visibility = 'hidden';
      }
    }

    // 4. Paper Transition Surface (Scroll 92% to 100%)
    if (paperTransitionSurface) {
      if (progress >= 0.90) {
        const blend = (progress - 0.90) / 0.10;
        paperTransitionSurface.style.opacity = Math.min(1, blend).toFixed(3);
      } else {
        paperTransitionSurface.style.opacity = '0';
      }
    }

    // 5. Back to top button visibility
    if (backToTopBtn) {
      if (progress > 0.5 || window.scrollY > 800) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // 6. Custom Interactive Cursor State Check
    // Activates ONLY AFTER the notebook scroll animation has completely finished
    checkCursorActivation(progress);
  }

  // Check whether notebook animation is complete to activate cursor
  function checkCursorActivation(progress) {
    if (isTouchDevice) return;

    let completed = false;
    if (typeof progress === 'number' && progress >= 0.975) {
      completed = true;
    } else if (heroScrollTrack) {
      const trackBottom = heroScrollTrack.offsetTop + heroScrollTrack.offsetHeight;
      if (window.scrollY >= trackBottom - 80) {
        completed = true;
      }
    }

    if (completed) {
      if (!isCursorActive) {
        isCursorActive = true;
        if (customCursor) customCursor.classList.add('active');
      }
    } else {
      if (isCursorActive) {
        isCursorActive = false;
        if (customCursor) {
          customCursor.classList.remove('active');
          customCursor.classList.remove('hovering');
        }
      }
    }
  }

  // Mouse coordinate tracking for custom cursor
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isTouchDevice && isCursorActive && customCursor && !customCursor.classList.contains('active')) {
      customCursor.classList.add('active');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    if (customCursor) customCursor.classList.remove('active');
  });

  document.addEventListener('mouseenter', () => {
    if (isCursorActive && customCursor) customCursor.classList.add('active');
  });

  // RAF loop for smooth lerp easing of custom cursor follower
  function renderCursor() {
    if (!isTouchDevice && isCursorActive) {
      // Lerp center dot (fast, responsive)
      dotX += (mouseX - dotX) * 0.45;
      dotY += (mouseY - dotY) * 0.45;
      if (cursorDot) {
        cursorDot.style.left = `${dotX.toFixed(1)}px`;
        cursorDot.style.top = `${dotY.toFixed(1)}px`;
      }

      // Lerp outer ring (smooth cinematic follower)
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (cursorRing) {
        cursorRing.style.left = `${ringX.toFixed(1)}px`;
        cursorRing.style.top = `${ringY.toFixed(1)}px`;
      }
    }
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover detection on interactive elements
  const interactiveSelectors = 'a, button, input, textarea, select, [role="button"], article, .btn-sound-toggle, .back-to-top-btn, .cursor-pointer';
  
  document.addEventListener('mouseover', (e) => {
    if (!isCursorActive || isTouchDevice) return;
    const target = e.target.closest(interactiveSelectors);
    if (target && customCursor) {
      customCursor.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (!isCursorActive || isTouchDevice) return;
    const target = e.target.closest(interactiveSelectors);
    if (target && customCursor) {
      customCursor.classList.remove('hovering');
    }
  });

  // Click Tracking (Ripple effect at exact click position)
  document.addEventListener('click', (e) => {
    if (!isCursorActive || !rippleContainer) return;

    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    rippleContainer.appendChild(ripple);

    // Clean up ripple element on animation finish
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
    // Fallback cleanup
    setTimeout(() => {
      if (ripple.parentNode) ripple.remove();
    }, 700);
  });

  // Project 01 Modal Interactions (Power BI Details)
  function openPbiModal() {
    if (!projectModal) return;
    if (POWER_BI_PROJECT_URL && modalExternalBtn) {
      modalExternalBtn.href = POWER_BI_PROJECT_URL;
      modalExternalBtn.classList.remove('hidden');
    }
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePbiModal() {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (pbiProjectBtn) pbiProjectBtn.addEventListener('click', openPbiModal);
  if (pbiCardMedia) pbiCardMedia.addEventListener('click', openPbiModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closePbiModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closePbiModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closePbiModal();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
      closePbiModal();
    }
  });

  // Sound Toggle Interaction
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isMuted = soundToggleBtn.classList.contains('muted');
      const newState = scroller.toggleAudio(isMuted);

      if (newState) {
        soundToggleBtn.classList.remove('muted');
        soundToggleBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <span>Sound: On</span>
        `;
      } else {
        soundToggleBtn.classList.add('muted');
        soundToggleBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          <span>Sound: Off</span>
        `;
      }
    });
  }

  // Mobile Menu Toggle
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Active Navigation State Tracking for the 5 Sections
  const navSections = [
    { id: 'heroScrollTrack', elem: document.getElementById('heroScrollTrack') },
    { id: 'about-me', elem: document.getElementById('about-me') },
    { id: 'experience', elem: document.getElementById('experience') },
    { id: 'selected-projects', elem: document.getElementById('selected-projects') },
    { id: 'editorial-insights', elem: document.getElementById('editorial-insights') }
  ];

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    // Check custom cursor activation on scroll
    checkCursorActivation();

    // Navbar background blur/border effect when scrolled past hero
    if (navbar) {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    let currentSectionId = 'heroScrollTrack';

    for (let i = 0; i < navSections.length; i++) {
      const section = navSections[i];
      if (section.elem) {
        const top = section.elem.offsetTop;
        const height = section.elem.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.id;
        } else if (i === navSections.length - 1 && scrollPos >= top) {
          currentSectionId = section.id;
        }
      }
    }

    // Update Desktop Nav Buttons
    navBtns.forEach((btn) => {
      const target = btn.getAttribute('data-target') || btn.getAttribute('href').replace('#', '');
      if (target === currentSectionId) {
        btn.classList.add('active');
        btn.classList.remove('text-secondary');
      } else {
        btn.classList.remove('active');
        btn.classList.add('text-secondary');
      }
    });

    // Update Mobile Nav Links
    mobileNavLinks.forEach((link) => {
      const target = link.getAttribute('data-target') || link.getAttribute('href').replace('#', '');
      if (target === currentSectionId) {
        link.classList.add('active');
        link.classList.add('text-primary');
        link.classList.remove('text-secondary');
      } else {
        link.classList.remove('active');
        link.classList.remove('text-primary');
        link.classList.add('text-secondary');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // Back to top / Rewind Button
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth scroll for all anchor links and close mobile drawer
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();

        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }

        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetTop = targetElem.getBoundingClientRect().top + window.scrollY - (targetId === '#heroScrollTrack' ? 0 : navHeight);

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      }
    });
  });
});
