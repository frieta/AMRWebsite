# A.M. Rieta Corporation Website

Static multi-page website for A.M. Rieta Corporation, built with HTML, CSS, and vanilla JavaScript.

## Project Overview

This site contains six pages:
- Home (`index.html`)
- About (`about.html`)
- Services (`services.html`)
- Products (`products.html`)
- Quality (`quality.html`)
- Contact (`contact.html`)

Core assets and scripts:
- Global styles: `css/style.css`
- Interactive behaviors: `js/main.js`
- Brand logo: `images/amr-logo.png`

## Current Features

- Responsive navigation and layout
- Timed hero card slider on Home page
- Equipment image slider on Quality page
- Cookie consent banner on Home page (Accept/Decline with saved preference)
- Scroll-based reveal animations
- Contact form UI submission feedback (frontend only)
- Offline-ready assets (no external CDNs required)

## Slider Image Sources

### Home Hero Slider (Index)
The Home hero background and mini cards pull images from:
- `images/Index/`

Current image set:
- `IMG_6738.jpg`
- `IMG_6747.jpg`
- `IMG_6771.jpg`
- `IMG_6842.jpg`
- `Production.jpg`
- `Warehouse.JPG`

### Quality Equipment Slider
The equipment slider pulls images from:
- `images/Equips and Premises/`

Current image set:
- `IMG_3413.JPG`
- `IMG_6738.jpg`
- `IMG_6783.jpg`
- `IMG_6810.jpg`

## Recent Updates

- Replaced placeholder slider artwork with real local photos.
- Expanded Home slider to 6 images.
- Updated Quality slider to use equipment/premises image folder.
- Fixed Home hero mini-card active-state behavior so only the active card renders full size.
- Added a responsive cookie consent banner on the Home page.
- Added monthly visit tracking on the Home page via localStorage keys `npcVisitCount` and `npcVisitMonth`.

## Cookie Consent and Visit Tracking

Home page behavior (`index.html`):
- Cookie consent status is stored in localStorage under `npcCookieConsent`.

Note:
- This is client-side tracking per browser/device only.
- It is not a centralized site-wide counter and does not write to a server file/database.

## Local Development

Recommended local run (XAMPP):
1. Place project in `c:/xampp/htdocs/AMRWebsite`
2. Start Apache in XAMPP
3. Open: `http://localhost/AMRWebsite/`

## Maintenance Notes

- Keep image filenames and folder paths exactly as referenced in HTML.
- On case-sensitive hosts (Linux), folder name casing matters (`Images` vs `images`).
- If slider images are changed, update both image URLs and any matching text labels in:
  - `index.html` (hero stack)
  - `quality.html` (equipment slides)
