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

## Detailed Code Scan (2026-05-26)

Summary of what I found when scanning the codebase (pages, CSS, and JS):

- `index.html`:
  - Includes a cookie banner element with id `npc-cookie-banner` and responsive styles embedded in the page.
  - Vercel analytics script is referenced (`/_vercel/insights/script.js`).
  - Hero uses local images under `images/Index/` and a timed hero / mini-card stack implemented in the DOM.
  - Navigation and header markup are consistent with other pages.

- `about.html`:
  - Standard company story, vision & mission, and footer links. Uses `css/style.css` and `js/main.js`.

- `services.html`:
  - Services and 7-step ODM process documented on the page.
  - The heart emoji was replaced by an icon image `images/icons/heart.ico`.

- `products.html`:
  - Catalog of product categories and tags. Static content rendered as product sections.

- `quality.html`:
  - Vicinity slider (facility slides) and a vicinity modal (`#vicinityModal`) are present.
  - A nested `#galleryModal` is implemented (gallery modal panel, thumbnails, prev/next controls).
  - Gallery is wired to specific folders via mappings in `js/main.js` (see below).

- `contact.html`:
  - Contact form posts to Web3Forms (`https://api.web3forms.com/submit`) with an `access_key` set on the page.
  - Embedded responsive Google Maps iframe present.
  - The header CTA "Partner With Us" is hidden (inline `style="display:none;"`).

- `css/style.css`:
  - Chat widget styles live here (`.chat-widget`, `.chat-widget-panel`, `.chat-widget-fab`) with z-index and pointer-events handling.
  - Vicinity/equipment sliders converted to horizontal scroll galleries.
  - Gallery modal styles (panel, backdrop, thumbnails) included in page-level styles for `quality.html` as well.

- `js/main.js`:
  - Theme and CSS variable helpers, sticky header, mobile nav toggle, and intersection-observer animations.
  - Mobile nav toggling was updated to close the chat widget rather than removing it from DOM.
  - Floating chat widget implementation present:
    - Feature flag: `ENABLE_FLOATING_CHAT_WIDGET = true`.
    - `createChatWidget()` mounts a `.chat-widget` with a draggable FAB, pointer capture drag handlers, clamp-to-viewport, snap-to-edge animation, and logic that opens the panel inward depending on FAB position.
  - Gallery mappings (used by the Quality page nested gallery):
    - `facilityImageFolders` maps facility names to folder paths (for example `"Warehouse & Storage": "images/Index/warehouse/"`).
    - `facilityImages` maps facility names to filename arrays (e.g. `['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg']` for the warehouse).
  - Contact form client-side submit UI feedback is implemented (button text change and local reset).

## Notes & Recommendations

- Image manifest: gallery images are mapped manually inside `js/main.js` (`facilityImages`). If you expect to add photos frequently, consider adding a small manifest generator (build step) or a server-side endpoint to auto-list folder contents.
- Persistence: the floating FAB position is not persisted across page loads — persisting to `localStorage` would improve UX.
- Analytics: the pages include Vercel analytics; if you deploy elsewhere or strip analytics for local dev, update or guard the script include.

If you want, I can:
- add a small Node/PHP script to auto-generate a JSON manifest of `images/Index/*` folders, or
- persist FAB position in `localStorage`, or
- open a PR-style patch that extracts gallery mapping into a single `gallery-manifest.json` file and updates `js/main.js` to read it.

