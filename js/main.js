/* ============================================
   A.M. RIETA CORPORATION - Main Script
   ============================================ */

const COLOR_SCHEME_STORAGE_KEY = 'amrColorSchemeCustom';

const SAMPLE_PALETTE_FALLBACKS = [
  {
    id: 'palette-1',
    label: 'Palette 1',
    note: 'Fresh green brand',
    sourceBase: 'colorschemes/1',
    primary: '#5aaa1e',
    secondary: '#f44336',
    background: '#ffffff',
    text: '#1e2a10',
  },
  {
    id: 'palette-2',
    label: 'Palette 2',
    note: 'Deep ocean contrast',
    sourceBase: 'colorschemes/2',
    primary: '#0f766e',
    secondary: '#f59e0b',
    background: '#f8fffe',
    text: '#10343a',
  },
  {
    id: 'palette-3',
    label: 'Palette 3',
    note: 'Warm modern neutral',
    sourceBase: 'colorschemes/3',
    primary: '#7c3aed',
    secondary: '#ec4899',
    background: '#fffafc',
    text: '#2d1738',
  },
  {
    id: 'palette-4',
    label: 'Palette 4',
    note: 'Soft slate accent',
    sourceBase: 'colorschemes/4',
    primary: '#334155',
    secondary: '#14b8a6',
    background: '#f8fafc',
    text: '#0f172a',
  },
];

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
  const fallbackCandidate = String(fallback || '').trim();
  const safeFallback = longHex.test(fallbackCandidate)
    ? fallbackCandidate.toLowerCase()
    : shortHex.test(fallbackCandidate)
      ? `#${fallbackCandidate.slice(1).split('').map((char) => char + char).join('')}`.toLowerCase()
      : '#000000';

  if (longHex.test(candidate)) {
    return candidate.toLowerCase();
  }

  if (shortHex.test(candidate)) {
    return `#${candidate.slice(1).split('').map((char) => char + char).join('')}`.toLowerCase();
  }

  return safeFallback;
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

function paletteFromJsonPayload(payload, fallback) {
  const source = Array.isArray(payload) ? {
    primary: payload[0],
    secondary: payload[1],
    background: payload[2],
    text: payload[3],
  } : (payload || {});

  const colors = source.colors || source.vars || source.variables || source;

  return {
    id: fallback.id,
    label: source.label || source.name || fallback.label,
    note: source.note || fallback.note,
    sourceBase: fallback.sourceBase,
    primary: normalizeHexColor(colors.primary, fallback.primary),
    secondary: normalizeHexColor(colors.secondary || colors.accent, fallback.secondary),
    background: normalizeHexColor(colors.background || colors.bg, fallback.background),
    text: normalizeHexColor(colors.text || colors.foreground, fallback.text),
  };
}

function paletteFromCssPayload(text, fallback) {
  const read = (token, fallbackValue) => {
    const match = text.match(new RegExp(`--${token}\\s*:\\s*([^;]+);`, 'i'));
    return normalizeHexColor(match ? match[1] : '', fallbackValue);
  };

  return {
    id: fallback.id,
    label: fallback.label,
    note: fallback.note,
    sourceBase: fallback.sourceBase,
    primary: read('primary', fallback.primary),
    secondary: read('secondary', read('accent', fallback.secondary)),
    background: read('background', fallback.background),
    text: read('text', fallback.text),
  };
}

function buildThemeVars(palette) {
  const primary = normalizeHexColor(palette.primary, SAMPLE_PALETTE_FALLBACKS[0].primary);
  const secondary = normalizeHexColor(palette.secondary, SAMPLE_PALETTE_FALLBACKS[0].secondary);
  const background = normalizeHexColor(palette.background, SAMPLE_PALETTE_FALLBACKS[0].background);
  const text = normalizeHexColor(palette.text, SAMPLE_PALETTE_FALLBACKS[0].text);

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
      id: 'custom',
      label: parsed.label || 'Custom Scheme',
      note: 'Saved locally',
      primary: normalizeHexColor(parsed.primary, SAMPLE_PALETTE_FALLBACKS[0].primary),
      secondary: normalizeHexColor(parsed.secondary, SAMPLE_PALETTE_FALLBACKS[0].secondary),
      background: normalizeHexColor(parsed.background, SAMPLE_PALETTE_FALLBACKS[0].background),
      text: normalizeHexColor(parsed.text, SAMPLE_PALETTE_FALLBACKS[0].text),
    };
  } catch {
    return null;
  }
}

async function loadPaletteSource(fallback) {
  const urls = [`${fallback.sourceBase}.json`, `${fallback.sourceBase}.css`];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        continue;
      }

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      const text = await response.text();

      if (url.endsWith('.json')) {
        const trimmed = text.trim();
        if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
          continue;
        }
        if (!contentType.includes('json') && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          continue;
        }

        return paletteFromJsonPayload(JSON.parse(trimmed), fallback);
      }

      if (!text.includes('--primary') && !text.includes('--secondary') && !text.includes('--background') && !text.includes('--text')) {
        continue;
      }

      return paletteFromCssPayload(text, fallback);
    } catch {
      // Try the next candidate or fall back to built-in values.
    }
  }

  return fallback;
}

async function loadSamplePalettes() {
  const loadedPalettes = await Promise.all(
    SAMPLE_PALETTE_FALLBACKS.map((fallback) => loadPaletteSource(fallback))
  );

  return loadedPalettes;
}

function createPaletteButton(palette) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'color-scheme-widget__palette';
  button.dataset.paletteId = palette.id;

  const info = document.createElement('span');
  info.className = 'color-scheme-widget__palette-info';

  const name = document.createElement('span');
  name.className = 'color-scheme-widget__palette-name';
  name.textContent = palette.label;

  const note = document.createElement('span');
  note.className = 'color-scheme-widget__palette-note';
  note.textContent = palette.note;

  info.append(name, note);

  const swatches = document.createElement('span');
  swatches.className = 'color-scheme-widget__swatches';
  swatches.setAttribute('aria-hidden', 'true');

  [palette.primary, palette.secondary, palette.background, palette.text].forEach((color) => {
    const swatch = document.createElement('span');
    swatch.style.background = color;
    swatches.appendChild(swatch);
  });

  button.append(info, swatches);
  return button;
}

async function initColorSchemeSelector() {
  if (!document.body || document.getElementById('colorSchemeWidget')) {
    return;
  }

  const palettes = await loadSamplePalettes();
  const defaultPalette = palettes[0] || SAMPLE_PALETTE_FALLBACKS[0];
  const storedCustomPalette = getStoredCustomPalette();
  let currentPalette = storedCustomPalette || defaultPalette;

  applyTheme(currentPalette);

  const widget = document.createElement('aside');
  widget.id = 'colorSchemeWidget';
  widget.className = 'color-scheme-widget';
  widget.setAttribute('aria-label', 'Color scheme selector');
  widget.innerHTML = `
    <div class="color-scheme-widget__header">
      <div>
        <span class="color-scheme-widget__eyebrow">Client Review</span>
        <span class="color-scheme-widget__title">Color Scheme Selector</span>
      </div>
      <button type="button" class="color-scheme-widget__toggle" aria-expanded="true" aria-label="Collapse color scheme selector">−</button>
    </div>
    <div class="color-scheme-widget__body">
      <div class="color-scheme-widget__section">
        <span class="color-scheme-widget__label">Sample palettes</span>
        <div class="color-scheme-widget__palette-list"></div>
      </div>
      <div class="color-scheme-widget__section">
        <span class="color-scheme-widget__label">Custom scheme</span>
        <div class="color-scheme-widget__fields">
          <div class="color-scheme-widget__field">
            <label for="amrPrimaryColor">Primary</label>
            <input id="amrPrimaryColor" type="color" value="#5aaa1e" />
          </div>
          <div class="color-scheme-widget__field">
            <label for="amrSecondaryColor">Secondary</label>
            <input id="amrSecondaryColor" type="color" value="#f44336" />
          </div>
          <div class="color-scheme-widget__field">
            <label for="amrBackgroundColor">Background</label>
            <input id="amrBackgroundColor" type="color" value="#ffffff" />
          </div>
          <div class="color-scheme-widget__field">
            <label for="amrTextColor">Text</label>
            <input id="amrTextColor" type="color" value="#1e2a10" />
          </div>
        </div>
        <button type="button" class="color-scheme-widget__save">Save Custom Scheme</button>
      </div>
      <div class="color-scheme-widget__status" aria-live="polite"></div>
    </div>
  `;

  document.body.appendChild(widget);

  const paletteList = widget.querySelector('.color-scheme-widget__palette-list');
  const toggleButton = widget.querySelector('.color-scheme-widget__toggle');
  const statusEl = widget.querySelector('.color-scheme-widget__status');
  const saveButton = widget.querySelector('.color-scheme-widget__save');
  const primaryInput = widget.querySelector('#amrPrimaryColor');
  const secondaryInput = widget.querySelector('#amrSecondaryColor');
  const backgroundInput = widget.querySelector('#amrBackgroundColor');
  const textInput = widget.querySelector('#amrTextColor');

  const paletteButtons = new Map();

  const syncInputs = (palette) => {
    primaryInput.value = normalizeHexColor(palette.primary, SAMPLE_PALETTE_FALLBACKS[0].primary);
    secondaryInput.value = normalizeHexColor(palette.secondary, SAMPLE_PALETTE_FALLBACKS[0].secondary);
    backgroundInput.value = normalizeHexColor(palette.background, SAMPLE_PALETTE_FALLBACKS[0].background);
    textInput.value = normalizeHexColor(palette.text, SAMPLE_PALETTE_FALLBACKS[0].text);
  };

  const clearActivePalette = () => {
    paletteButtons.forEach((button) => button.classList.remove('is-active'));
  };

  const markActivePalette = (paletteId) => {
    clearActivePalette();
    const activeButton = paletteButtons.get(paletteId);
    if (activeButton) {
      activeButton.classList.add('is-active');
    }
  };

  const getCustomPaletteFromInputs = () => ({
    id: 'custom',
    label: 'Custom Scheme',
    note: 'Unsaved preview',
    primary: primaryInput.value,
    secondary: secondaryInput.value,
    background: backgroundInput.value,
    text: textInput.value,
  });

  const setStatus = (message) => {
    statusEl.textContent = message;
  };

  palettes.forEach((palette) => {
    const button = createPaletteButton(palette);
    button.addEventListener('click', () => {
      currentPalette = palette;
      applyTheme(palette);
      syncInputs(palette);
      markActivePalette(palette.id);
      setStatus(`${palette.label} loaded.`);
    });
    paletteList.appendChild(button);
    paletteButtons.set(palette.id, button);
  });

  if (currentPalette.id === 'custom') {
    syncInputs(currentPalette);
    setStatus('Custom scheme restored from localStorage.');
  } else {
    syncInputs(currentPalette);
    markActivePalette(currentPalette.id);
    setStatus(`${currentPalette.label} loaded by default.`);
  }

  const previewCustomPalette = () => {
    currentPalette = getCustomPaletteFromInputs();
    applyTheme(currentPalette);
    clearActivePalette();
    setStatus('Previewing custom scheme. Click Save to persist it.');
  };

  [primaryInput, secondaryInput, backgroundInput, textInput].forEach((input) => {
    input.addEventListener('input', previewCustomPalette);
  });

  saveButton.addEventListener('click', () => {
    const customPalette = getCustomPaletteFromInputs();
    applyTheme(customPalette);
    safeLocalStorageSet(COLOR_SCHEME_STORAGE_KEY, JSON.stringify(customPalette));
    currentPalette = customPalette;
    clearActivePalette();
    setStatus('Custom scheme saved to localStorage.');
  });

  toggleButton.addEventListener('click', () => {
    const collapsed = widget.classList.toggle('is-collapsed');
    toggleButton.setAttribute('aria-expanded', String(!collapsed));
    toggleButton.textContent = collapsed ? '+' : '−';
    toggleButton.setAttribute('aria-label', collapsed ? 'Expand color scheme selector' : 'Collapse color scheme selector');
  });
}

const storedTheme = getStoredCustomPalette();
applyTheme(storedTheme || SAMPLE_PALETTE_FALLBACKS[0]);

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
      const intervalMs = 4500;

      const syncHeroText = () => {
        const cards = timedStack.querySelectorAll('.hero-mini-card');
        if (!cards.length) return;
        const activeCard = cards[0];
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
        const cards = timedStack.querySelectorAll('.hero-mini-card');
        if (cards.length > 1) {
          cards[0].classList.remove('active');
          timedStack.appendChild(cards[0]);
          cards[1].classList.add('active');
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

  initColorSchemeSelector();

});
