# A.M. Rieta Corporation Website

Static multi-page site for A.M. Rieta Corporation (HTML, CSS, vanilla JS).

## Project Overview

Pages:
- Home (`index.html`)
- About (`about.html`)
- Services (`services.html`)
- Products (`products.html`)
- Quality (`quality.html`)
- Contact (`contact.html`)

Core assets:
- Global styles: `css/style.css`
- Interactive behaviors: `js/main.js`

## Current Features (high level)

- Responsive navigation with mobile hamburger
- Floating chat widget with draggable FAB (snap-to-edge)
- Nested gallery modal (Quality page) with thumbnails and keyboard navigation
- Responsive Home hero slider and equipment slider on Quality
- Cookie consent banner and simple visit tracking (localStorage)
- Contact page includes an embedded responsive Google Map iframe

## Notable Recent Changes (2026-05-26)

- Fixed mobile hamburger navigation being blocked by the floating chat widget by using pointer-events toggling and updated z-index handling.
- Floating chat widget now stays mounted, uses pointer-events:none when closed, and exposes a draggable FAB that snaps to the nearest edge with smooth animation.
- Chat panel behaviour:
  - Opens inward from the FAB (left/right + up/down) depending on FAB position.
  - FAB is header-aware and respects a top inset so it doesn't overlap the sticky header.
- Replaced inline heart emoji on Services page with an icon image (`images/icons/heart.ico`).
- Hidden the "Partner With Us" CTA on the Contact page (display:none) and added a responsive Google Maps iframe section.
- Added a nested gallery modal to the Quality page and updated the gallery mapping to include new warehouse images `images/Index/warehouse/1.jpg`–`5.jpg`.
- Gallery modal includes keyboard navigation (Esc, Arrow keys), thumbnails, and a close/backdrop that doesn't conflict with the vicinity modal.

## Files Changed (summary)

- `js/main.js` — chat widget (createChatWidget, FAB drag/snap), nav adjustments, gallery modal wiring
- `css/style.css` — chat widget z-index and pointer-events rules, FAB styles, gallery modal styles
- `quality.html` — added "View More Photos" button, nested gallery modal HTML/CSS
- `contact.html` — hid Partner CTA; added responsive Google Map iframe
- `services.html` — replaced heart emoji with `images/icons/heart.ico`

## How to verify the recent changes locally

1. Start XAMPP Apache and open `http://localhost/AMRWebsite/`.
2. On mobile width (or responsive emulator) open the hamburger menu — verify links navigate (chat should not block clicks).
3. Interact with the floating chat FAB:
  - Drag it around; it should snap to an edge and open the panel inward.
  - When closed, the widget should not block underlying navigation (pointer-events:none).
4. Go to the Quality page and open the vicinity/premises modal, then click "View More Photos" to open the nested gallery.
  - Use left/right arrows and thumbnails; press `Esc` to close the gallery.
5. Open Contact page and confirm the map iframe appears and Partner CTA is hidden.
6. Open Services page and confirm the heart icon is rendered from `images/icons/heart.ico`.

## Known Issues & Next Steps

- Image folders are currently mapped manually in `js/main.js` (facilityImages). Consider implementing automatic folder discovery or a small build step to generate a manifest when images are added.
- FAB position is not persisted across page loads. Persisting to `localStorage` could improve UX.
- If additional images are added under `images/Index/*`, update the `facilityImages` mapping in `js/main.js` or implement an automated manifest.

## Local Development

Run locally with XAMPP:

1. Place project in `c:/xampp/htdocs/AMRWebsite`
2. Start Apache in XAMPP
3. Visit `http://localhost/AMRWebsite/`

## Contact / Contributing

If you add images or make structural changes, update `README.md` and the relevant mappings in `js/main.js`.

---
Generated update: 2026-05-26 — concise summary of recent front-end changes and testing steps.
