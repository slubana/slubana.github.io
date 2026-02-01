# TODO — Personal Website (Modern Archive) — Jekyll + GitHub Pages

Goal: Build a minimalist personal website with **Home**, **Blog**, and **Gallery** pages.  
Design: typography-first, centered column (Home/Blog), full-bleed masonry (Gallery), dual light/dark theme toggle.  
Hosting constraint: **GitHub Pages serves static files only** — no server-side runtime, no dynamic APIs, no filesystem reads at request-time.  
Non-goals: **no SEO**, **no RSS**, **no tags/filters/search**, **no excerpts**, **no reading time**, **no TOC**, **no related posts**, **no captions**, **no gallery filters/tabs**.

---

## 0) Tech decisions (recommended defaults)
- Site generator: **Jekyll**
- Repo: **public**
- Hosting: **GitHub Pages (static hosting)**
- Deployment: **GitHub Actions builds + deploys**
- Image workflow: **Prebuild images locally** (optimized outputs + manifest committed). GitHub Actions must NOT do image conversion.

---

## 1) Static hosting rules (must follow)
Everything must be resolved **at build time**:
- Blog index is generated from Markdown posts at build time.
- Gallery list is generated from a committed manifest at build time.
- No runtime directory listing (GitHub Pages cannot run server code).
- Any “logic” must be client-side JS (theme toggle, back button, lightbox).

---

## 2) Design system (CSS variables + hex colors)
Implement theme tokens as CSS variables. Support light/dark via `data-theme="light|dark"` on `<html>`.

### Light theme (linen / carbon)
- `--bg`: **#F7F3EA**
- `--text`: **#111111**
- `--muted`: **#4B4B4B**
- `--border`: **#E6E0D6**
- `--link`: **#2F6FED**
- `--linkHover`: **#2459BD**
- `--cardBg` (optional): **#FBF8F2**
- `--shadow` (optional): **rgba(17,17,17,0.06)**

### Dark theme (espresso / parchment)
- `--bg`: **#0F0D0B**
- `--text`: **#E9E1D6**
- `--muted`: **#B7AEA2**
- `--border`: **#2A241F**
- `--link`: **#7AA2FF**
- `--linkHover`: **#9BB9FF**
- `--cardBg` (optional): **#14110E**
- `--shadow` (optional): **rgba(0,0,0,0.35)**

### Global style constraints
- Use borders + spacing (not colored panels) for structure.
- Links: subtle underline on hover; no big button styling.
- Focus states: visible for keyboard navigation (outline using `--link`).

---

## 3) Typography
- Headings/UI: **Satoshi** (sans)
- Body: **Newsreader** (serif)

Implementation:
- Use Google Fonts for Newsreader.
- For Satoshi, either:
  - self-host in `assets/fonts/`, or
  - load via a reliable CDN.
- Provide fallbacks:
  - Sans: `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
  - Serif: `Georgia, 'Times New Roman', serif`

Suggested type scale:
- H1: 44–56px desktop, 34–40px mobile
- H2: 22–28px
- Body: 17–19px
- Line-height: 1.55–1.7

---

## 4) Site architecture + routing (Jekyll)
### Pages
1) `/` — Home (`index.html`)
2) `/blog/` — Blog index (`blog/index.html`)
3) `/blog/<slug>/` — Blog post pages (from `_posts/`)
4) `/gallery/` — Gallery (`gallery/index.html`)

### Global header (site-wide)
- **Top-left:** Name (links to `/`)
- **Top-right:** `Blog` `Gallery` `Theme toggle`
- Keep header consistent across all pages.
- Optional: sticky header with subtle bottom border (`--border`).

---

## 5) Content requirements

### Home page layout (exact)
Home should be centered-column, minimalist, and follow this structure in order:

1) **Global header**  
   - Name in top-left (same across entire site)

2) **Bio block** (stacked lines/paragraphs, not bullets)
   - Line 1: `Currently working at Sage Intacct.`
   - Line 2: `Previously studied engineering and finance.`
   - Line 3: `Living in Vancouver; into photography.`
   - Must be **plain text**, not bullet points.

3) **Blog section**
   - Title: `Blog`
   - Show **max 5** sample post links (newest first).
   - Each link shows:
     - Post title
     - Date (small, muted)
   - Optional `View all` link to `/blog/`.

4) **Links section (icons + placeholder URLs)**
   - Show monochrome logo icons:
     - LinkedIn
     - Email (mailto)
     - GitHub
   - Placeholder URLs to be replaced later.
   - Icons inherit `--text`/`--muted`; use `--link` on hover.
   - Add accessible labels (`aria-label`).

5) **Last updated**
   - Small muted text at bottom: `Last updated: YYYY-MM-DD`
   - Simple implementation is fine (build date or last git commit date).

---

### Blog

#### Blog index (`/blog/`)
- Render a clean list: **date + title only**
- Each row links to post page
- Sort newest → oldest by post date
- Must be build-time generated (no runtime calls)

#### Blog post page
- Show only:
  - **Back button** (see behavior below)
  - Title
  - Date
  - Body content
- No extras (no tags, no excerpt, no reading time, no TOC, no related posts, no author line)

##### Back button behavior (client-side, must implement)
- If user came from **Home** or **Blog index**, back returns them there.
- If user landed externally (no internal referrer), back goes to **`/blog/`**.

Implementation:
- On post page load, check `document.referrer`.
- If same-origin and path is `/` or starts with `/blog`, use that path.
- Else default `/blog/`.

---

### Gallery (`/gallery/`)
- Full-bleed masonry grid
- No captions, no UI controls, no filters/tabs
- Sort images **newest-to-oldest top-to-bottom**
- Click image opens lightbox
- Lightbox supports:
  - next/prev (arrow keys + on-screen)
  - ESC to close
  - scroll lock when open
- Lazy load thumbnails / responsive images
- Must render from committed manifest (no runtime directory listing)

---

## 6) Image pipeline (local prebuild, required — originals are ~4MB)
Purpose: keep the site fast by serving optimized derivatives, while keeping originals locally.

### Folder structure
- Originals (local, NOT committed, NOT served):
  - `gallery-originals/`
- Optimized outputs (committed + served):
  - `assets/gallery/full/`  (lightbox images)
  - `assets/gallery/thumb/` (masonry thumbnails)
- Build-time manifest (committed; used by Jekyll at build time):
  - `_data/gallery_manifest.json`

### Git rules
Add to `.gitignore`:
```
gallery-originals/
```

### Naming + sort rule (deterministic)
**Required original filename format:**
- `YYYY-MM-DD_anything.jpg` (or .jpeg/.png/.webp)
- Example: `2026-01-31_vancouver_001.jpg`

Sort newest → oldest by parsing `YYYY-MM-DD` from filename.  
Tie-breaker: filename descending.

### Output formats + targets
Generate 2 assets per original:

1) **Thumb** (for masonry)
- Format: WebP
- Long edge: **900px**
- Quality: **78**
- Strip metadata

2) **Full** (for lightbox)
- Format: WebP
- Long edge: **2400px**
- Quality: **82**
- Strip metadata

Sorting relies on filename date (not EXIF), since EXIF will be removed.

### Manifest format
Generate `_data/gallery_manifest.json` like:
```json
[
  {
    "id": "2026-01-31_vancouver_001",
    "date": "2026-01-31",
    "full": "/assets/gallery/full/2026-01-31_vancouver_001.webp",
    "thumb": "/assets/gallery/thumb/2026-01-31_vancouver_001.webp"
  }
]
```

Jekyll usage on the Gallery page:
- iterate `site.data.gallery_manifest`
- render items in manifest order (already sorted newest-first)

---

## 7) Local-only conversion script (Node + sharp)
This script is run locally before pushing changes. GitHub Actions must NOT run it.

### Dependencies (dev)
- `sharp`
- `fast-glob` (or Node fs recursion)

### Script location
- `scripts/build-gallery.mjs`

### Script requirements
- Input: `gallery-originals/`
- Output: `assets/gallery/full/`, `assets/gallery/thumb/`
- Manifest: `_data/gallery_manifest.json`
- Parse `YYYY-MM-DD` at start of filename; skip files that don’t match.
- Strip metadata.
- Deterministic sorting (date desc, filename desc).

### Package.json scripts (local workflow)
```json
{
  "scripts": {
    "build:gallery": "node scripts/build-gallery.mjs"
  }
}
```

### Local workflow (document in README)
1) Add originals to `gallery-originals/` (with required filename format)
2) Run `npm run build:gallery`
3) Commit:
   - `assets/gallery/full/*`
   - `assets/gallery/thumb/*`
   - `_data/gallery_manifest.json`

---

## 8) Jekyll implementation tasks
### Core Jekyll structure
- Add `_config.yml`
- Add layouts:
  - `_layouts/default.html` (global shell + header)
  - `_layouts/post.html` (blog posts: back button + title/date + content)
- Add includes:
  - `_includes/header.html` (name left; nav+toggle right)
  - `_includes/icon-links.html` (LinkedIn/Email/GitHub icons)
- Add assets:
  - `assets/css/global.css`
  - `assets/js/theme-toggle.js`
  - `assets/js/post-back.js` (back button referrer logic)
  - `assets/js/lightbox.js` (gallery lightbox; keyboard controls)

### Blog setup
- Posts live in `_posts/` with standard Jekyll naming:
  - `YYYY-MM-DD-my-title.md`
- Ensure blog index only shows **date + title**.

### “Last updated”
Choose one:
- Build date (simple): render today’s date at build time (acceptable), OR
- Use git commit date via Actions env and inject (optional; not required)

---

## 9) GitHub Pages deployment (GitHub Actions for Jekyll)
Use GitHub Actions to build Jekyll and deploy to GitHub Pages.

Create `.github/workflows/deploy.yml`:
```yml
name: Deploy Jekyll site to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/configure-pages@v5

      - uses: actions/jekyll-build-pages@v1
        with:
          source: .
          destination: ./_site

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./_site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

GitHub repo setting:
- Settings → Pages → Source: **GitHub Actions**

Note: Since images are already optimized and committed, Actions only runs Jekyll build + deploy.

---

## 10) Jekyll base path (repo pages)
If hosted at `https://<user>.github.io/<repo>/`, set in `_config.yml`:
- `url: "https://<user>.github.io"`
- `baseurl: "/<repo>"`

Then reference assets and links using `{{ site.baseurl }}`:
- Example: `{{ site.baseurl }}/blog/`
- Example: `{{ site.baseurl }}/assets/css/global.css`

Manifest paths:
- EITHER store absolute paths that include baseurl at render-time, OR
- store paths like `/assets/...` and prepend `site.baseurl` in templates.

Recommended: prepend in templates for safety:
- `src="{{ site.baseurl }}{{ item.thumb }}"`

---

## 11) Layout + responsiveness
### Home/Blog
- Centered column:
  - max-width: 720–780px
  - side padding: 20–24px

### Gallery
- Full width with padding: 12–24px
- Masonry:
  - CSS columns (acceptable) or masonry library if needed
- Responsive columns:
  - Mobile: 1
  - Tablet: 2
  - Desktop: 3–4

---

## 12) Implementation steps (ordered)
1) Scaffold Jekyll structure
   - `_config.yml`, layouts, includes, assets folders
2) Implement global styles + fonts
   - CSS variables (light/dark)
   - typography
3) Header + theme toggle (client-side)
   - persist in `localStorage`
   - respect `prefers-color-scheme` on first load
4) Implement local image pipeline
   - `scripts/build-gallery.mjs` + `npm run build:gallery`
   - generate `_data/gallery_manifest.json`
5) Home page
   - exact layout (bio lines, blog sample links max 5, icon links, last updated)
6) Blog
   - `_posts/` sample posts
   - `/blog/` index shows date + title only
   - post layout includes back button behavior
7) Gallery
   - render from `site.data.gallery_manifest`
   - lightbox keyboard controls + scroll lock
8) GitHub Pages (Actions)
   - add Jekyll deploy workflow
   - configure Pages to use GitHub Actions
9) QA
   - Mobile layout
   - Keyboard focus + accessibility labels on icons
   - Theme persistence
   - Gallery sort correctness (by filename date)
   - Back button behavior (home → post → back; blog → post → back; external → post → back to blog)
   - Performance spot-check: thumbs and full images are reasonably sized

---

## 13) Acceptance criteria (must pass)
- ✅ GitHub Pages serves only static files (no runtime server logic required)
- ✅ Name is top-left on every page (links to Home)
- ✅ Home bio has 3 plain-text lines (not bullets)
- ✅ Home shows Blog section with max 5 post links
- ✅ Home shows icon links (LinkedIn, Email, GitHub) with placeholders
- ✅ Home contains `Last updated: YYYY-MM-DD`
- ✅ Blog index shows only date + title
- ✅ Blog posts show only Back button + title + date + content
- ✅ Back button returns to referrer when internal; defaults to `/blog/` when external
- ✅ Gallery is masonry; no captions/filters/tabs
- ✅ Gallery sorts newest-to-oldest by filename date
- ✅ Gallery uses optimized WebP thumb/full images (NOT 4MB originals)
- ✅ Light/dark theme works and persists
- ✅ GitHub Actions deploy works (Jekyll `_site` deployed to Pages)
- ✅ Image conversion remains local-only (Actions does NOT run `build:gallery`)

---

## 14) Suggested file structure
- `_config.yml`
- `index.html`
- `blog/index.html`
- `gallery/index.html`
- `_layouts/default.html`
- `_layouts/post.html`
- `_includes/header.html`
- `_includes/icon-links.html`
- `_posts/*.md`
- `_data/gallery_manifest.json`               (committed)
- `assets/css/global.css`
- `assets/js/theme-toggle.js`
- `assets/js/post-back.js`
- `assets/js/lightbox.js`
- `assets/gallery/full/*.webp`               (committed)
- `assets/gallery/thumb/*.webp`              (committed)
- `gallery-originals/*.{jpg,jpeg,png,webp}`  (gitignored)
- `scripts/build-gallery.mjs`
- `.github/workflows/deploy.yml`

---

## 15) Placeholders (content stubs)
- Name: `Sehajpreet Lubana`
- Home bio lines:
  - `Currently working at Sage Intacct.`
  - `Previously studied engineering and finance.`
  - `Living in Vancouver; into photography.`
- Links (placeholders):
  - LinkedIn: `https://www.linkedin.com/in/placeholder`
  - Email: `mailto:placeholder@example.com`
  - GitHub: `https://github.com/placeholder`
- Blog:
  - Add 2–4 sample posts in `_posts/` for layout validation
- Gallery:
  - Allow empty state if no images yet (pipeline + manifest generation still works with zero images)
