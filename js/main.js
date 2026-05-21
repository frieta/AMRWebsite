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
    const equipmentControls = equipmentSlider.closest('.equipment-slider-block');
    const equipmentModal = document.getElementById('equipmentModal');
    const equipmentModalImage = document.getElementById('equipmentModalImage');
    const equipmentModalKicker = document.getElementById('equipmentModalKicker');
    const equipmentModalTitle = document.getElementById('equipmentModalTitle');
    const equipmentModalSummary = document.getElementById('equipmentModalSummary');
    const equipmentModalSpecs = document.getElementById('equipmentModalSpecs');
    const slides = Array.from(equipmentSlider.querySelectorAll('.equipment-slide'));
    let activeEquipmentIndex = 0;

    const equipmentDetails = {
      '1 Ton Steam Jacketed Mixing Machine': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 1 ton',
          'Configured with side scraper and homogenizer mixer',
          'Designed for emulsions, gels, and surfactant-based products',
        ],
      },
      '600 Kg Steam Jacketed Mixing Machine': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 600 kg',
          'Features a side scraper and homogenizer mixer',
          'Suitable for emulsions, gels, and surfactant-based products',
        ],
      },
      '500 Kg Steam Jacketed Mixing Machine': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 500 kg',
          'Features a side scraper and homogenizer mixer',
          'Designed specifically for emulsions',
        ],
      },
      '250 Kg Steam Jacketed Mixing Machine': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 250 kg',
          'Uses a propeller-type mixer',
          'Handles surfactant-based, low-viscosity products',
        ],
      },
      '100 Kg Steam Jacketed Mixing Machine': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 100 kg',
          'Uses a propeller-type mixer',
          'Handles surfactant-based, low-viscosity products',
        ],
      },
      '2 Tons Steam Jacketed Mixing Machine': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 2 tons',
          'Features side scraper, agitator, and homogenizer mixer',
          'Optimized for emulsions, gels, and surfactant products',
        ],
      },
      '2 Tons Mixing Vessel': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 2 tons',
          'Uses an agitator mixer',
          'Ideal for liniment and low-viscosity products',
        ],
      },
      '500 Kgs Mixing Vessel': {
        kicker: 'Mixing Equipment',
        specs: [
          'Capacity: 500 kg each (2 units)',
          'Uses an agitator mixer',
          'Ideal for hydro-alcoholic and low-viscosity oil-based products',
        ],
      },
      'Complete Filling Line': {
        kicker: 'Filling Automation',
        specs: [
          'Handles filling through lot coding',
          'Output: 8,000–15,000 pieces per 8 hours',
          'Filling capacity: 30g–100g for serums and hydro-alcoholic solutions',
        ],
      },
      '4 Head Filling Machine': {
        kicker: 'Filling Automation',
        specs: [
          'Output: 5,000–8,000 pieces per 8 hours',
          'Filling capacity: 10g–100g',
          'Designed for low-viscosity products',
        ],
      },
      '1 Head Filling Machine (8 units)': {
        kicker: 'Filling Automation',
        specs: [
          '8 individual units',
          'Output: 5,000–8,000 pieces per 8 hours',
          'Filling capacity: 10g–200g for creams, lotions, and shampoos',
        ],
      },
      '1 Head Filling Machine (3 units)': {
        kicker: 'Filling Automation',
        specs: [
          '3 individual units',
          'Output: 5,000–8,000 pieces per 8 hours',
          'Filling capacity: 50g–500g for viscous products like creams, lotions, and shampoos',
        ],
      },
      'Plodder Machine Complete Line': {
        kicker: 'Soap & Powder Processing',
        specs: [
          'Runs the entire process from mixing to stamping',
          'Includes Sigma Mixer, Roll Mill, Duplex Vacuum Plodder, Extruding, and Stamping/Cutting',
          'Output: 10,000–20,000 pieces per 8 hours',
        ],
      },
      '300 Kgs Mixing to Filling Machine': {
        kicker: 'Soap & Powder Processing',
        specs: [
          'Capacity: 300 kg',
          'Ribbon mixer dedicated entirely to powder products',
          'Supports controlled powder preparation and transfer',
        ],
      },
      'Offline Stamping Machines (3 units)': {
        kicker: 'Finishing & Packaging',
        specs: [
          '3 units available',
          'Output: 3,000–4,000 pieces per 8 hours',
          'Accommodates sizes from 10g up to 135g',
        ],
      },
      'Ink Jet Lot Coding Machine (3 units)': {
        kicker: 'Finishing & Packaging',
        specs: [
          '3 units available',
          'Output: 10,000–20,000 pieces per 8 hours',
          'Configured for hydro-alcoholic products and general products',
        ],
      },
      'Shrink Tunnel (3 units)': {
        kicker: 'Finishing & Packaging',
        specs: [
          '3 units available',
          'Output: 5,000–10,000 pieces per 8 hours',
          'Includes 1 machine for cap shrinking and 2 machines for full product wrapping',
        ],
      },
      'Pillow Wrapping Machine': {
        kicker: 'Finishing & Packaging',
        specs: [
          'Output: 11,000 pieces per 8 hours',
          'Handles product dimensions between 65g and 100g',
          'Suitable for final wrapping and presentation',
        ],
      },
    };

    const openEquipmentModalByIndex = (targetIndex) => {
      if (!equipmentModal || !equipmentModalImage || !equipmentModalKicker || !equipmentModalTitle || !equipmentModalSummary || !equipmentModalSpecs) return;
      if (!slides.length) return;

      const normalizedIndex = ((targetIndex % slides.length) + slides.length) % slides.length;
      activeEquipmentIndex = normalizedIndex;
      const slide = slides[normalizedIndex];

      const titleEl = slide.querySelector('.equipment-slide-title');
      const summaryEl = slide.querySelector('.equipment-slide-desc');
      const imageEl = slide.querySelector('.equipment-slide-img');
      const title = titleEl ? titleEl.textContent.trim() : 'Equipment Details';
      const summary = summaryEl ? summaryEl.textContent.trim() : '';
      const details = equipmentDetails[title] || { kicker: 'Machines & Equipment', specs: [summary || 'Detailed information not available.'] };

      equipmentModalKicker.textContent = details.kicker;
      equipmentModalTitle.textContent = title;
      equipmentModalSummary.textContent = summary;
      equipmentModalImage.src = imageEl ? imageEl.getAttribute('src') || '' : '';
      equipmentModalImage.alt = imageEl ? imageEl.getAttribute('alt') || title : title;
      equipmentModalSpecs.innerHTML = '';
      details.specs.forEach((spec) => {
        const li = document.createElement('li');
        li.textContent = spec;
        equipmentModalSpecs.appendChild(li);
      });

      equipmentModal.classList.add('open');
      equipmentModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const closeButton = equipmentModal.querySelector('.equipment-modal-close');
      if (closeButton) closeButton.focus();
    };

    const openEquipmentModal = (slide) => {
      const slideIndex = slides.indexOf(slide);
      openEquipmentModalByIndex(slideIndex >= 0 ? slideIndex : 0);
    };

    const closeEquipmentModal = () => {
      if (!equipmentModal) return;
      equipmentModal.classList.remove('open');
      equipmentModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    slides.forEach((slide) => {
      const titleEl = slide.querySelector('.equipment-slide-title');
      slide.setAttribute('role', 'button');
      slide.setAttribute('tabindex', '0');
      slide.setAttribute('aria-label', `View details for ${titleEl ? titleEl.textContent.trim() : 'equipment'}`);

      slide.addEventListener('click', (event) => {
        if (event.target.closest('.equipment-slide-content')) {
          openEquipmentModal(slide);
          return;
        }
        openEquipmentModal(slide);
      });

      slide.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEquipmentModal(slide);
        }
      });
    });

    if (equipmentModal) {
      equipmentModal.querySelectorAll('[data-equipment-close]').forEach((closer) => {
        closer.addEventListener('click', closeEquipmentModal);
      });

      equipmentModal.querySelectorAll('[data-equipment-modal-dir]').forEach((button) => {
        button.addEventListener('click', () => {
          const direction = button.getAttribute('data-equipment-modal-dir');
          openEquipmentModalByIndex(activeEquipmentIndex + (direction === 'next' ? 1 : -1));
        });
      });

      document.addEventListener('keydown', (event) => {
        if (!equipmentModal.classList.contains('open')) return;

        if (event.key === 'Escape') {
          closeEquipmentModal();
        }
        if (event.key === 'ArrowRight') {
          openEquipmentModalByIndex(activeEquipmentIndex + 1);
        }
        if (event.key === 'ArrowLeft') {
          openEquipmentModalByIndex(activeEquipmentIndex - 1);
        }
      });
    }

    const getEquipmentScrollStep = () => {
      const firstSlide = equipmentSlider.querySelector('.equipment-slide');
      if (!firstSlide) return 320;

      const slideWidth = firstSlide.getBoundingClientRect().width;
      const styles = window.getComputedStyle(equipmentSlider);
      const gap = parseFloat(styles.gap || styles.columnGap || '0') || 0;
      return slideWidth + gap;
    };

    const handleEquipmentNext = () => {
      equipmentSlider.scrollBy({ left: getEquipmentScrollStep(), behavior: 'smooth' });
    };

    const handleEquipmentPrev = () => {
      equipmentSlider.scrollBy({ left: -getEquipmentScrollStep(), behavior: 'smooth' });
    };

    const prevButton = equipmentControls ? equipmentControls.querySelector('[data-eq-dir="prev"]') : null;
    const nextButton = equipmentControls ? equipmentControls.querySelector('[data-eq-dir="next"]') : null;

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
      const intervalMs = 7500;

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
