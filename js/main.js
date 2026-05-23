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
    // Function to close menu
    const closeMenu = () => {
      hamburger.classList.remove('open');
      mainNav.classList.remove('open');
    };
    
    // Function to open menu
    const openMenu = () => {
      hamburger.classList.add('open');
      mainNav.classList.add('open');
      const existingChatWidget = document.querySelector('.chat-widget');
      if (existingChatWidget) {
        existingChatWidget.classList.remove('open');
      }
    };
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (hamburger.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }, false);
    
    // Handle nav link clicks - close menu and allow navigation
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Don't prevent default - let the link navigate
        // Just close the menu (which re-enables chat)
        closeMenu();
      }, false);
    });
    
    // Close menu when clicking outside of header (but not on nav links)
    document.addEventListener('click', (e) => {
      // If click is inside header, don't close (nav links handle it)
      if (header.contains(e.target)) return;
      // Only close if menu is open
      if (hamburger.classList.contains('open')) {
        closeMenu();
      }
    }, false);
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

  // --- Vicinity Slider ---
  const vicinitySlider = document.getElementById('vicinitySlider');
  const vicinitySliderBlock = vicinitySlider ? vicinitySlider.closest('.vicinity-slider-block') : null;
  const vicinityControls = vicinitySliderBlock ? vicinitySliderBlock.querySelector('.vicinity-slider-controls') : null;

  if (vicinitySlider && vicinityControls) {
    const getVicinityScrollStep = () => {
      const firstSlide = vicinitySlider.querySelector('.vicinity-slide');
      if (!firstSlide) return 320;

      const slideWidth = firstSlide.getBoundingClientRect().width;
      const styles = window.getComputedStyle(vicinitySlider);
      const gap = parseFloat(styles.gap || styles.columnGap || '0') || 0;
      return slideWidth + gap;
    };

    const handleVicinityNext = () => {
      vicinitySlider.scrollBy({ left: getVicinityScrollStep(), behavior: 'smooth' });
    };

    const handleVicinityPrev = () => {
      vicinitySlider.scrollBy({ left: -getVicinityScrollStep(), behavior: 'smooth' });
    };

    const vicinityPrevButton = vicinityControls ? vicinityControls.querySelector('[data-vic-dir="prev"]') : null;
    const vicinityNextButton = vicinityControls ? vicinityControls.querySelector('[data-vic-dir="next"]') : null;

    if (vicinityPrevButton) {
      vicinityPrevButton.addEventListener('click', handleVicinityPrev);
    }

    if (vicinityNextButton) {
      vicinityNextButton.addEventListener('click', handleVicinityNext);
    }

    // Vicinity modal and click handler
    const vicinityModal = document.getElementById('vicinityModal');
    const vicinityModalImage = document.getElementById('vicinityModalImage');
    const vicinityModalTitle = document.getElementById('vicinityModalTitle');
    const vicinityModalDesc = document.getElementById('vicinityModalDesc');
    const vicinityModalDetails = document.getElementById('vicinityModalDetails');
    const vicinityModalCloseBtn = vicinityModal ? vicinityModal.querySelector('.vicinity-modal-close') : null;
    const vicinityModalCloseTriggers = vicinityModal ? vicinityModal.querySelectorAll('[data-vicinity-close]') : [];

    // Vicinity details data
    const vicinityDetails = {
      'Main Manufacturing Facility': {
        desc: 'Production floor designed with GMP compliance and controlled workflow.',
        details: [
          'Production capacity: 10,000–20,000 pieces per 8 hours (varies by product)',
          'Controlled personnel flow pathways to prevent contamination',
          'Dedicated material receiving, quarantine, and release zones',
          'Equipment layout optimized for GMP-compliant manufacturing',
          'Environmental controls to maintain product integrity and safety'
        ]
      },
      'Quality Control Laboratory': {
        desc: 'Advanced testing facilities for microbiology, physicochemical, and organoleptic analysis.',
        details: [
          'Microbiology lab with biosafety cabinets and annually calibrated autoclaves',
          'Physicochemical lab with calibrated instruments for pH, viscosity, and conductivity',
          '3–5 day testing cycle prior to product release',
          'Environmental swab testing and gram staining procedures',
          'Stability and compatibility testing capabilities'
        ]
      },
      'Production Area': {
        desc: 'Organized zones for material handling, equipment operation, and product assembly.',
        details: [
          'Multiple mixing vessels ranging from 100 kg to 2 tons capacity',
          'High-speed filling machines producing 5,000–15,000 pieces per 8 hours',
          'Dedicated zones for material staging and quality checks',
          'Equipment surfaces sanitized and maintained regularly',
          'Waste management and disposal areas separated from production zones'
        ]
      },
      'Warehouse & Storage': {
        desc: 'Climate-controlled storage for raw materials and finished goods with full traceability.',
        details: [
          'Separate zones for raw materials, work-in-process, and finished goods',
          'Climate and humidity control to maintain product stability',
          'Full batch traceability and lot tracking systems',
          'Regular inventory audits and stock rotation procedures',
          'Quarantine area for testing and hold samples'
        ]
      },
      'Office & Conference Spaces': {
        desc: 'Professional meeting and documentation areas supporting client communications and compliance.',
        details: [
          'Dedicated documentation and records management area',
          'Quality management and compliance personnel offices',
          'Client meeting and negotiation rooms',
          'Training and instruction areas for staff development',
          'Regulatory file and certification storage'
        ]
      }
    };

    const slides = Array.from(vicinitySlider.querySelectorAll('.vicinity-slide'));
    let activeVicinityIndex = 0;

    const closeVicinityModal = () => {
      if (!vicinityModal) return;
      vicinityModal.classList.remove('open');
      document.body.classList.remove('vicinity-modal-open');
    };

    const openVicinityModalByIndex = (targetIndex) => {
      if (!vicinityModal || !slides.length) return;
      const total = slides.length;
      const nextIndex = ((targetIndex % total) + total) % total;
      const slide = slides[nextIndex];
      const title = slide.querySelector('.vicinity-slide-title')?.textContent?.trim();
      const detailData = title ? vicinityDetails[title] : null;
      const image = slide.querySelector('.vicinity-slide-img');

      if (!title || !detailData || !image) return;

      activeVicinityIndex = nextIndex;
      vicinityModalImage.src = image.src;
      vicinityModalImage.alt = title;
      vicinityModalTitle.textContent = title;
      vicinityModalDesc.textContent = detailData.desc;
      vicinityModalDetails.innerHTML = detailData.details.map(d => `<li>${d}</li>`).join('');
      vicinityModal.classList.add('open');
      document.body.classList.add('vicinity-modal-open');
      if (vicinityModalCloseBtn) vicinityModalCloseBtn.focus();
    };

    slides.forEach((slide, index) => {
      slide.setAttribute('role', 'button');
      slide.setAttribute('tabindex', '0');
      slide.addEventListener('click', () => openVicinityModalByIndex(index));
      slide.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openVicinityModalByIndex(index);
        }
      });
    });

    vicinityModalCloseTriggers.forEach((el) => {
      el.addEventListener('click', closeVicinityModal);
    });

    if (vicinityModal) {
      vicinityModal.querySelectorAll('[data-vicinity-modal-dir]').forEach((button) => {
        button.addEventListener('click', () => {
          const direction = button.getAttribute('data-vicinity-modal-dir');
          openVicinityModalByIndex(activeVicinityIndex + (direction === 'next' ? 1 : -1));
        });
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!vicinityModal || !vicinityModal.classList.contains('open')) return;
      if (e.key === 'Escape') closeVicinityModal();
      if (e.key === 'ArrowRight') openVicinityModalByIndex(activeVicinityIndex + 1);
      if (e.key === 'ArrowLeft') openVicinityModalByIndex(activeVicinityIndex - 1);
    });
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

  // --- Floating Messenger Chat Widget - Helper Functions ---
  const ENABLE_FLOATING_CHAT_WIDGET = true;
  
  // Function to create and initialize chat widget
  const createChatWidget = () => {
    const existingChatWidget = document.querySelector('.chat-widget');
    if (existingChatWidget) return; // Don't create if already exists
    
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
      <div class="chat-widget-panel" aria-label="Messenger chat preview">
        <div class="chat-widget-header">
          <div class="chat-widget-avatar" aria-hidden="true">AMR</div>
          <div>
            <h3 class="chat-widget-title">Chat with A.M. Rieta</h3>
            <p class="chat-widget-subtitle">We'll continue in Messenger</p>
          </div>
          <button type="button" class="chat-widget-close" aria-label="Close chat preview">&times;</button>
        </div>
        <div class="chat-widget-body">
          <div class="chat-widget-bubble chat-widget-bubble--system">
            Hi! Need help with product development, quality, or manufacturing support?
          </div>
          <div class="chat-widget-bubble chat-widget-bubble--bridge">
            Tap below to open a conversation with our Page in Messenger.
            <div style="margin-top:0.8rem;">
              <a class="chat-widget-link" href="https://m.me/AMRietaLaboratory" target="_blank" rel="noopener noreferrer">Open Messenger chat</a>
            </div>
          </div>
          <p class="chat-widget-note">You'll be routed straight to the Page conversation thread.</p>
        </div>
      </div>
      <button type="button" class="chat-widget-fab" aria-label="Open chat">
        <span class="chat-widget-fab-icon" aria-hidden="true">💬</span>
        <span class="chat-widget-fab-label">Chat</span>
      </button>
    `;
    document.body.appendChild(chatWidget);

    const chatPanel = chatWidget.querySelector('.chat-widget-panel');
    const chatFab = chatWidget.querySelector('.chat-widget-fab');
    const chatClose = chatWidget.querySelector('.chat-widget-close');
    let isDraggingFab = false;
    let suppressFabToggle = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartLeft = 0;
    let dragStartTop = 0;
    let snapAnimationFrameId = 0;

    const closeChatWidget = () => {
      chatWidget.classList.remove('open');
    };

    const updateChatWidgetPlacement = () => {
      const fabRect = chatFab.getBoundingClientRect();
      const fabCenterX = fabRect.left + (fabRect.width / 2);
      const shouldOpenRight = fabCenterX < (window.innerWidth / 2);
      chatWidget.classList.toggle('chat-widget--left', shouldOpenRight);
      chatWidget.classList.toggle('chat-widget--right', !shouldOpenRight);

      const panelRect = chatPanel.getBoundingClientRect();
      const styles = window.getComputedStyle(chatWidget);
      const gap = parseFloat(styles.gap || '0') || 0;
      const requiredVerticalSpace = panelRect.height + gap;
      const availableAbove = fabRect.top;
      const availableBelow = window.innerHeight - fabRect.bottom;

      const shouldOpenDown = requiredVerticalSpace > availableAbove && availableBelow >= availableAbove;
      chatWidget.classList.toggle('chat-widget--panel-down', shouldOpenDown);
      chatWidget.classList.toggle('chat-widget--panel-up', !shouldOpenDown);
    };

    const setChatWidgetPosition = (left, top) => {
      chatWidget.style.left = `${left}px`;
      chatWidget.style.top = `${top}px`;
      chatWidget.style.right = 'auto';
      chatWidget.style.bottom = 'auto';
      updateChatWidgetPlacement();
    };

    const getDragSafeInsets = (padding = 8) => {
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      return {
        top: Math.max(padding, headerBottom + padding),
        right: padding,
        bottom: padding,
        left: padding,
      };
    };

    const getFabConstrainedBounds = (padding = 0) => {
      const widgetRect = chatWidget.getBoundingClientRect();
      const fabRect = chatFab.getBoundingClientRect();
      const fabOffsetLeft = fabRect.left - widgetRect.left;
      const fabOffsetTop = fabRect.top - widgetRect.top;
      const insets = getDragSafeInsets(padding);

      return {
        minLeft: insets.left - fabOffsetLeft,
        maxLeft: window.innerWidth - insets.right - fabRect.width - fabOffsetLeft,
        minTop: insets.top - fabOffsetTop,
        maxTop: window.innerHeight - insets.bottom - fabRect.height - fabOffsetTop,
      };
    };

    const clampChatWidgetPosition = (left, top, padding = 0) => {
      const bounds = getFabConstrainedBounds(padding);
      return {
        left: Math.min(Math.max(bounds.minLeft, left), bounds.maxLeft),
        top: Math.min(Math.max(bounds.minTop, top), bounds.maxTop),
      };
    };

    const animateChatWidgetPosition = (targetLeft, targetTop, duration = 180) => {
      if (snapAnimationFrameId) {
        cancelAnimationFrame(snapAnimationFrameId);
        snapAnimationFrameId = 0;
      }

      const startRect = chatWidget.getBoundingClientRect();
      const startLeft = startRect.left;
      const startTop = startRect.top;
      const deltaLeft = targetLeft - startLeft;
      const deltaTop = targetTop - startTop;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setChatWidgetPosition(startLeft + (deltaLeft * eased), startTop + (deltaTop * eased));

        if (progress < 1) {
          snapAnimationFrameId = requestAnimationFrame(step);
        } else {
          snapAnimationFrameId = 0;
          setChatWidgetPosition(targetLeft, targetTop);
        }
      };

      snapAnimationFrameId = requestAnimationFrame(step);
    };

    const snapChatWidgetToEdge = () => {
      const edgePadding = 8;
      const bounds = getFabConstrainedBounds(edgePadding);
      const fabRect = chatFab.getBoundingClientRect();
      const fabCenterX = fabRect.left + (fabRect.width / 2);
      const midpoint = window.innerWidth / 2;
      const targetLeft = fabCenterX < midpoint ? bounds.minLeft : bounds.maxLeft;
      const currentRect = chatWidget.getBoundingClientRect();
      const clampedTop = Math.min(Math.max(bounds.minTop, currentRect.top), bounds.maxTop);
      animateChatWidgetPosition(targetLeft, clampedTop);
    };

    chatFab.addEventListener('click', (event) => {
      if (suppressFabToggle) {
        event.preventDefault();
        event.stopPropagation();
        suppressFabToggle = false;
        return;
      }
      updateChatWidgetPlacement();
      chatWidget.classList.toggle('open');
    });

    chatFab.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (snapAnimationFrameId) {
        cancelAnimationFrame(snapAnimationFrameId);
        snapAnimationFrameId = 0;
      }
      const rect = chatWidget.getBoundingClientRect();
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartLeft = rect.left;
      dragStartTop = rect.top;
      isDraggingFab = false;
      suppressFabToggle = false;
      chatFab.setPointerCapture(event.pointerId);
    });

    chatFab.addEventListener('pointermove', (event) => {
      if (!chatFab.hasPointerCapture(event.pointerId)) return;

      const deltaX = event.clientX - dragStartX;
      const deltaY = event.clientY - dragStartY;

      if (!isDraggingFab && Math.hypot(deltaX, deltaY) < 6) return;

      isDraggingFab = true;
      suppressFabToggle = true;

      const nextLeft = dragStartLeft + deltaX;
      const nextTop = dragStartTop + deltaY;
      const clamped = clampChatWidgetPosition(nextLeft, nextTop, 8);
      setChatWidgetPosition(clamped.left, clamped.top);
    });

    chatFab.addEventListener('pointerup', (event) => {
      if (chatFab.hasPointerCapture(event.pointerId)) {
        chatFab.releasePointerCapture(event.pointerId);
      }
      if (isDraggingFab) {
        snapChatWidgetToEdge();
      }
      isDraggingFab = false;
    });

    chatFab.addEventListener('pointercancel', (event) => {
      if (chatFab.hasPointerCapture(event.pointerId)) {
        chatFab.releasePointerCapture(event.pointerId);
      }
      isDraggingFab = false;
    });

    window.addEventListener('resize', () => {
      if (!chatWidget.style.left || !chatWidget.style.top) return;
      const currentRect = chatWidget.getBoundingClientRect();
      const clamped = clampChatWidgetPosition(currentRect.left, currentRect.top, 8);
      setChatWidgetPosition(clamped.left, clamped.top);
    });

    updateChatWidgetPlacement();

    chatClose.addEventListener('click', closeChatWidget);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && chatWidget.classList.contains('open')) {
        closeChatWidget();
      }
    });

    document.addEventListener('click', (event) => {
      if (!chatWidget.classList.contains('open')) return;
      if (!chatPanel.contains(event.target) && !chatFab.contains(event.target)) {
        closeChatWidget();
      }
    });
  };
  
  // Initialize chat widget on page load
  if (ENABLE_FLOATING_CHAT_WIDGET) {
    createChatWidget();
  }

});
