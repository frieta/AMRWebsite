/* ============================================
   A.M. RIETA CORPORATION - Main Script
   ============================================ */

const COLOR_SCHEME_STORAGE_KEY = 'amrColorSchemeCustom';
const ORIGINAL_DEFAULT_THEME = {
  primary: '#5aaa1e',
  secondary: '#f57c00',
  background: '#ffffff',
  text: '#1e2a10',
};

function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

function normalizeHexColor(value, fallback) {
  const candidate = String(value || '').trim();
  const shortHex = /^#([0-9a-f]{3})$/i;
  const longHex = /^#([0-9a-f]{6})$/i;

  if (longHex.test(candidate)) {
    return candidate.toLowerCase();
  }

  if (shortHex.test(candidate)) {
    return `#${candidate.slice(1).split('').map((char) => char + char).join('')}`.toLowerCase();
  }

  return fallback || '#000000';
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex, '#000000');
  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0')).join('')}`;
}

function mixHexColor(colorA, colorB, ratio) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  return rgbToHex(
    a.r + (b.r - a.r) * ratio,
    a.g + (b.g - a.g) * ratio,
    a.b + (b.b - a.b) * ratio,
  );
}

function shadeHexColor(color, percent) {
  const base = hexToRgb(color);
  const factor = 1 + percent / 100;
  return rgbToHex(base.r * factor, base.g * factor, base.b * factor);
}

function buildThemeVars(palette) {
  const primary = normalizeHexColor(palette.primary, ORIGINAL_DEFAULT_THEME.primary);
  const secondary = normalizeHexColor(palette.secondary, ORIGINAL_DEFAULT_THEME.secondary);
  const background = normalizeHexColor(palette.background, ORIGINAL_DEFAULT_THEME.background);
  const text = normalizeHexColor(palette.text, ORIGINAL_DEFAULT_THEME.text);

  return {
    '--primary': primary,
    '--primary-dark': shadeHexColor(primary, -22),
    '--accent': secondary,
    '--accent-light': mixHexColor(secondary, background, 0.36),
    '--red': secondary,
    '--secondary': secondary,
    '--white': background,
    '--off-white': mixHexColor(background, primary, 0.06),
    '--light-gray': mixHexColor(background, primary, 0.12),
    '--mid-gray': mixHexColor(text, background, 0.45),
    '--dark-gray': mixHexColor(text, primary, 0.82),
    '--text': text,
    '--text-light': mixHexColor(text, background, 0.52),
    '--border': mixHexColor(primary, background, 0.76),
    '--shadow-sm': `0 2px 8px rgba(${hexToRgb(primary).r}, ${hexToRgb(primary).g}, ${hexToRgb(primary).b}, 0.10)`,
    '--shadow-md': `0 8px 24px rgba(${hexToRgb(primary).r}, ${hexToRgb(primary).g}, ${hexToRgb(primary).b}, 0.15)`,
    '--shadow-lg': `0 16px 48px rgba(${hexToRgb(primary).r}, ${hexToRgb(primary).g}, ${hexToRgb(primary).b}, 0.20)`,
  };
}

function applyTheme(palette) {
  if (!palette) return;

  const root = document.documentElement;
  const vars = buildThemeVars(palette);

  Object.entries(vars).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

function getStoredCustomPalette() {
  const raw = safeLocalStorageGet(COLOR_SCHEME_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      primary: normalizeHexColor(parsed.primary, ORIGINAL_DEFAULT_THEME.primary),
      secondary: normalizeHexColor(parsed.secondary, ORIGINAL_DEFAULT_THEME.secondary),
      background: normalizeHexColor(parsed.background, ORIGINAL_DEFAULT_THEME.background),
      text: normalizeHexColor(parsed.text, ORIGINAL_DEFAULT_THEME.text),
    };
  } catch {
    return null;
  }
}

const storedTheme = getStoredCustomPalette();
applyTheme(storedTheme || ORIGINAL_DEFAULT_THEME);

document.addEventListener('DOMContentLoaded', () => {

  // --- Sticky Header Shadow ---
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Mobile Nav Toggle ---
  const hamburger = document.querySelector('.hamburger');
  const mainNav = document.querySelector('.main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mainNav.classList.toggle('open');
    });
    // Close on link click
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mainNav.classList.remove('open');
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        hamburger.classList.remove('open');
        mainNav.classList.remove('open');
      }
    });
  }

  // --- Active Nav Link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Intersection Observer (Fade-in Animations) ---
  const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate').forEach(el => observer.observe(el));

  // --- Contact Form Submission ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      //e.preventDefault();
      const btn = contactForm.querySelector('.form-submit .btn');
      const note = contactForm.querySelector('.form-note');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Message Sent!';
        if (note) note.textContent = '✓ Thank you! We\'ll be in touch within 1-2 business days.';
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.disabled = false;
          if (note) note.textContent = 'We typically respond within 1–2 business days.';
        }, 4000);
      }, 1200);
    });
  }

  // --- Quality Page Equipment Slider ---
  const equipmentSlider = document.getElementById('equipmentSlider');
  if (equipmentSlider) {
    const handleEquipmentNext = () => {
      const slides = equipmentSlider.querySelectorAll('.equipment-slide');
      if (slides.length > 0) {
        equipmentSlider.appendChild(slides[0]);
      }
    };

    const handleEquipmentPrev = () => {
      const slides = equipmentSlider.querySelectorAll('.equipment-slide');
      if (slides.length > 0) {
        equipmentSlider.prepend(slides[slides.length - 1]);
      }
    };

    const prevButton = equipmentSlider.querySelector('[data-eq-dir="prev"]');
    const nextButton = equipmentSlider.querySelector('[data-eq-dir="next"]');

    if (prevButton) {
      prevButton.addEventListener('click', handleEquipmentPrev);
    }

    if (nextButton) {
      nextButton.addEventListener('click', handleEquipmentNext);
    }
  }

  // --- Home Page Timed Hero Card Animation ---
  const heroTimed = document.getElementById('homeHeroTimed');
  if (heroTimed) {
    const timedStack = document.getElementById('heroTimedStack');
    const placeEl = document.getElementById('heroTimedPlace');
    const titleEl = document.getElementById('heroTimedTitle');
    const progressBar = document.getElementById('heroTimedProgress');
    const bgSlides = heroTimed.querySelectorAll('.hero-bg-slide');

    if (timedStack && placeEl && titleEl && progressBar) {
      let current = 0;
      const intervalMs = 6500;

      const getHeroCards = () => Array.from(timedStack.querySelectorAll('.hero-mini-card'));

      const syncHeroText = () => {
        const cards = getHeroCards();
        if (!cards.length) return;
        const activeCard = cards.find((card) => card.classList.contains('active')) || cards[0];
        placeEl.textContent = activeCard.getAttribute('data-place') || '';
        titleEl.textContent = activeCard.getAttribute('data-title') || '';
      };

      const syncBackground = () => {
        bgSlides.forEach((slide, index) => {
          slide.classList.toggle('active', index === current);
        });
      };

      const animateProgress = () => {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            progressBar.style.transition = `width ${intervalMs}ms linear`;
            progressBar.style.width = '100%';
          });
        });
      };

      const advance = () => {
        const cards = getHeroCards();
        if (cards.length > 1) {
          const activeCard = cards.find((card) => card.classList.contains('active')) || cards[0];
          const nextCard = activeCard.nextElementSibling || timedStack.firstElementChild;

          if (activeCard) {
            activeCard.classList.remove('active');
            timedStack.appendChild(activeCard);
          }

          if (nextCard && nextCard.classList.contains('hero-mini-card')) {
            nextCard.classList.add('active');
          } else if (timedStack.firstElementChild) {
            timedStack.firstElementChild.classList.add('active');
          }
        }

        current = (current + 1) % Math.max(bgSlides.length, 1);
        syncBackground();
        syncHeroText();
        animateProgress();
      };

      syncBackground();
      syncHeroText();
      animateProgress();
      setInterval(advance, intervalMs);
    }
  }

});
