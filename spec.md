# EcoVision — Frontend-Only Build Specification

> **Audience:** AI coding agents (Google Antigravity, OpenAI Codex) and human developers.
> **Goal:** Rebuild the existing Bolt app (https://ecovision-websit-cw2s.bolt.host) as a **pure frontend application** — no backend, no database, no API keys. All user-generated data lives in the browser.
> **How to use this file:** Read sections 1–4 first, then follow the phased plan in section 14. Do not skip the acceptance criteria in section 15.

---

## 1. Project Overview

**EcoVision** is a community-style environmental awareness and action platform. Visitors can:

1. Learn about environmental threats and why they matter.
2. Report local environmental issues with a photo.
3. Browse, search, filter, upvote, and resolve reported issues.
4. Read an upcycling/recycling guide with worked examples.
5. Share and browse upcycling ideas with photos and instructions.
6. Make an eco-pledge and share it on social media.

**No accounts, no login.** The app is anonymous and works fully offline after the first load.

### 1.1 What Changes vs. the Original Bolt App

| Area | Original (Bolt) | New Build |
|---|---|---|
| Backend / DB | Supabase (PostgreSQL + RLS) | **Removed.** Browser storage only |
| Image storage | Supabase Storage buckets | **IndexedDB** (as Blobs), with thumbnail compression |
| Data scope | Shared across all visitors | **Per-browser.** Each visitor sees their own data plus seed data |
| Routing | `page` state variable | **React Router (HashRouter)** with real URLs |
| Upvotes | Unlimited, client-side increment | **One upvote per item per browser** (toggle) |
| Delete / "Mark Solved" | Anyone could do it to anything | Only on items **created in this browser** |
| Empty state | Empty feed on first visit | **Seeded with sample reports and ideas** |
| Hosting | Bolt hosting | Any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages) |

### 1.2 Important Limitation (state this in the UI)

Because there is no server, reports and ideas **are not shared between users or devices**. Add a small, dismissible info banner on the Report and Ideas pages:

> "Your reports and ideas are saved on this device only."

Include an **Export / Import JSON** feature (section 9.5) so users can move their data.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18 | |
| Language | TypeScript 5.x (strict mode) | |
| Build tool | Vite 5.x | |
| Styling | Tailwind CSS 3.4 | Custom palette, see section 7 |
| Routing | `react-router-dom` v6 | Use **`HashRouter`** so deep links work on any static host with zero config |
| Icons | `lucide-react` | |
| State | React Context + `useReducer` | No Redux/Zustand |
| Persistence | `localStorage` (metadata) + **IndexedDB** via `idb-keyval` (image blobs) | |
| IDs | `crypto.randomUUID()` | |
| Fonts | Plus Jakarta Sans (headings), Inter (body) | Self-host via `@fontsource` packages (no Google Fonts CDN, for offline use) |
| Testing | Vitest + React Testing Library | Unit tests for storage layer and hooks |
| Linting | ESLint + typescript-eslint, Prettier | |
| Package manager | npm | |

**Explicitly NOT allowed:** Supabase, Firebase, any server, any `.env` secrets, any paid API.

---

## 3. Pages and Routes

| Route | Page | Contents |
|---|---|---|
| `/` | Home | Hero, Stats, WhyItMatters, Threats, TakeAction |
| `/report` | Report Issue | Report form + recent reports feed |
| `/issues` | Issues Raised | Searchable/filterable grid of all reports |
| `/recycle` | Recycling Guide | Process steps, material categories, 6 example cards |
| `/ideas` | Innovative Ideas | Idea form + searchable/filterable gallery |
| `*` | Not Found | Friendly 404 with link home |

- Home-section links (Why It Matters, Threats, Take Action, Impact) scroll to anchors on `/`. If the user is on another route, navigate to `/` first, then scroll.
- On every route change, scroll to top (except when navigating to a hash anchor).
- Update `document.title` per route.
- A persistent **Navbar** and **Footer** wrap every page.
- A thin gradient **ScrollProgress** bar sits at the top of the viewport (z-index 60).

---

## 4. Folder Structure

```
ecovision/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── eslint.config.js
├── public/
│   ├── leaf.svg                    # favicon
│   ├── manifest.webmanifest        # PWA manifest
│   └── images/                     # LOCAL copies of all images (see 10)
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Router + layout shell
│   ├── index.css
│   ├── types/
│   │   └── index.ts                # Report, Idea, Pledge types
│   ├── data/
│   │   ├── seedReports.ts
│   │   ├── seedIdeas.ts
│   │   ├── recyclingExamples.ts
│   │   ├── pledges.ts
│   │   ├── quotes.ts
│   │   ├── threats.ts
│   │   ├── stats.ts
│   │   └── whyItMatters.ts
│   ├── storage/
│   │   ├── db.ts                   # localStorage + IndexedDB wrapper
│   │   ├── images.ts               # compress, save, load, delete image blobs
│   │   └── exportImport.ts
│   ├── context/
│   │   ├── ReportsContext.tsx
│   │   └── IdeasContext.tsx
│   ├── hooks/
│   │   ├── useReveal.ts
│   │   ├── useCountUp.ts
│   │   ├── useObjectUrl.ts         # load blob → object URL, revoke on unmount
│   │   ├── useLocalStorage.ts
│   │   └── useScrollToHash.ts
│   ├── utils/
│   │   ├── timeAgo.ts
│   │   ├── share.ts                # WhatsApp/Facebook/Instagram/native/copy
│   │   └── validate.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ReportPage.tsx
│   │   ├── IssuesPage.tsx
│   │   ├── RecyclePage.tsx
│   │   ├── IdeasPage.tsx
│   │   └── NotFoundPage.tsx
│   └── components/
│       ├── layout/  Navbar.tsx, Footer.tsx, ScrollProgress.tsx
│       ├── home/    Hero.tsx, Stats.tsx, WhyItMatters.tsx, Threats.tsx, TakeAction.tsx, PledgeModal.tsx
│       ├── reports/ ReportForm.tsx, ReportCard.tsx, ReportFeed.tsx
│       ├── ideas/   IdeaForm.tsx, IdeaCard.tsx
│       ├── recycle/ ProcessSteps.tsx, MaterialChips.tsx, ExampleCard.tsx
│       └── ui/      ImageUpload.tsx, ConfirmModal.tsx, Badge.tsx, EmptyState.tsx,
│                    Toast.tsx, UpvoteButton.tsx, InfoBanner.tsx, SearchInput.tsx
└── tests/
```

---

## 5. Data Models

```ts
// src/types/index.ts

export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export type ProblemType =
  | 'Trash & Litter' | 'Water Pollution' | 'Air Pollution' | 'Deforestation'
  | 'Government Issue' | 'Roads & Infrastructure' | 'Wildlife Threat' | 'Other';

export interface Report {
  id: string;                 // crypto.randomUUID()
  title: string;              // required, 3–100 chars
  description: string;        // required, 10–1000 chars
  area: string;               // required, 2–100 chars
  problemType: ProblemType;   // required
  imageId: string | null;     // key into IndexedDB; null if no photo
  imageUrl?: string;          // for SEED data only (bundled /images/... path)
  reporterName: string | null;
  status: ReportStatus;       // default 'pending'
  upvotes: number;
  createdAt: string;          // ISO 8601
  isSeed: boolean;            // true for bundled sample data
  isOwn: boolean;             // true if created in this browser
}

export type IdeaCategory =
  | 'Plastic' | 'Paper' | 'Glass' | 'Metal' | 'Wood' | 'Fabric' | 'Other';

export interface Idea {
  id: string;
  title: string;              // required, 3–100 chars
  whatItIs: string;           // required, 10–500 chars
  requiredItems: string;      // required
  steps: string;              // required, max 1500 chars
  category: IdeaCategory;     // default 'Other'
  imageId: string | null;
  imageUrl?: string;          // seed only
  creatorName: string | null;
  upvotes: number;
  createdAt: string;
  isSeed: boolean;
  isOwn: boolean;
}
```

### 5.1 Storage Keys

| Key | Store | Value |
|---|---|---|
| `ecovision:v1:reports` | localStorage | `Report[]` (user-created only) |
| `ecovision:v1:ideas` | localStorage | `Idea[]` (user-created only) |
| `ecovision:v1:upvotes` | localStorage | `{ reports: string[], ideas: string[] }` (IDs this browser has upvoted) |
| `ecovision:v1:seedState` | localStorage | Per-seed-item overrides: `{ [id]: { upvotes?, status?, hidden? } }` |
| `ecovision:v1:banner-dismissed` | localStorage | boolean |
| IndexedDB store `ecovision-images` | idb-keyval | `imageId → Blob` |

- **Merge rule:** at runtime, `allReports = seedReports (with overrides applied, minus hidden) + userReports`, sorted by `createdAt` descending.
- Always wrap storage access in try/catch. If `localStorage` is unavailable or full, show a toast ("Couldn't save — storage is full or disabled") and keep working in memory.
- Version the keys (`v1`) so a future migration is possible.

---

## 6. Feature Specifications

### 6.1 Navbar
- Fixed, z-50. Transparent at top; solid with backdrop blur once `scrollY > 24`.
- Logo (gradient leaf icon + "EcoVision") → links to `/`.
- **Desktop (≥1024px):** Home, Why It Matters, Threats, Take Action, Impact | divider | Report Issue, Issues Raised, Recycling Guide, Innovative Ideas, plus "Get Involved" CTA (scrolls to `#action`).
  - At `lg` use short labels ("Why", "Recycle", "Ideas"); at `xl` use full labels.
- **Below 1024px:** hamburger toggling a dropdown with all links + CTA. Close on route change and on Escape.
- Highlight the active route (use `NavLink`).
- Accessible: `<nav aria-label>`, `aria-expanded` on hamburger, visible focus rings.

### 6.2 Hero
- Full-height, gradient background (`sky-100 → forest-50 → forest-100`).
- 5 floating leaf SVGs with staggered `float` / `float-slow` animations (**hidden below `sm`**).
- Headline with gradient text and hand-drawn SVG underline.
- CTAs: "Take Action Today" (→ `#action`) and "Learn Why" (→ `#why`).
- Circular Earth image with two floating stat cards (31% forest cover; 1.5°C warming limit).
- SVG wave divider at the bottom.
- Respect `prefers-reduced-motion`: disable float/drift animations.

### 6.3 Stats
- 4 cards with count-up animation, triggered once via `IntersectionObserver` (threshold 0.3):
  - 1M+ species at risk · 68% wildlife lost · 11M tons plastic · 2.4B tons CO₂.
- `useCountUp`: `requestAnimationFrame`, cubic ease-out, 1800 ms. If `prefers-reduced-motion`, show the final value immediately.
- Hover: lift + gradient top border scales in. Staggered transition delays.

### 6.4 WhyItMatters
- 4 pillar cards: Clean Air, Health & Well-being, Future Generations, Biodiversity.
- Gradient icon badge, tinted background, decorative blur glow on hover.
- Scroll-reveal with staggered delays (`useReveal`).

### 6.5 Threats
- Dark section (`bg-forest-950`), 4 cards: Air & Industrial Pollution, Climate Change, Plastic & Waste, Water Scarcity.
- Each: image with gradient overlay, stat badge, overhanging icon badge, description.
- Hover: card lift + image zoom.

### 6.6 TakeAction + Pledge Modal
- Two columns: copy + CTAs on the left; 6-card action grid on the right (Reduce/Reuse/Recycle, Plant Trees, Green Transport, Save Energy, Conserve Water, Eat Sustainably).
- Buttons to `/report`, `/issues`, `/recycle`.
- **"Make Your Pledge"** opens a modal:
  - 8 pledges: Zero Waste Week, Plant a Tree, Car-Free Commute, Save 100 Litres, Switch to LED, Meatless Mondays, Refuse Plastic Bags, Unplug Standby.
  - 5 environmental quotations (Chief Seattle, Robert Swan, Jane Goodall, etc. — use only short, correctly attributed, public-domain-safe quotes).
  - Live preview of the chosen pledge + quote.
  - **Share actions** (see 6.9).
  - Bottom sheet on mobile, centered dialog on desktop. Closes on Escape or backdrop click. Locks body scroll while open. **Trap focus** inside and restore focus on close.
- **New (frontend-only improvement):** persist the user's chosen pledges in `localStorage` (`ecovision:v1:pledges`) and show "You've made N pledges" on the Take Action section. This replaces the "pledge persistence" item from the original's future-work list.

### 6.7 Report Issue (`/report`)
**Form (left):**
- Photo upload (optional): click or drag-and-drop; image types only; **max 5 MB input**; shows preview with a remove button.
- Title, Area/Location (with map-pin icon), Problem Type (select with emoji per option), Description (live counter, max 1000), Reporter Name (optional).
- Inline validation errors under each field; disable submit while saving.
- On submit: compress image → save blob to IndexedDB → add report → reset form → success message + toast.

**Feed (right):**
- Newest first. Each card: image, type badge, status badge, title, location, description, reporter, relative time (`timeAgo`), upvote button.
- Status colors: pending = earth, reviewed = sky, resolved = leaf.
- Show the latest 10 here with a "View all issues →" link to `/issues`.

### 6.8 Issues Raised (`/issues`)
- **Tabs:** All · Pending · Resolved, each with a live count.
- **Search:** case-insensitive across title, area, problem type, description; debounce 200 ms.
- Optional extra: sort dropdown (Newest / Most upvoted).
- Responsive grid: 1 / 2 / 3 columns. Cards use `content-visibility: auto` (`.cv-auto`).
- Card: image (or "No photo" bar), status badge, type badge, title, location, description (3-line clamp), reporter, time, upvote.
- **Actions:**
  - **Upvote:** toggle; one per report per browser (tracked in `ecovision:v1:upvotes`). Button shows filled state when upvoted.
  - **Mark Solved:** visible only if `isOwn` and status ≠ resolved.
  - **Delete:** visible only if `isOwn`. Opens `ConfirmModal` (z-index 70); deleting also removes the image blob from IndexedDB.
  - Seed reports can be upvoted but not deleted or resolved.
- Empty states: "No reports yet" and "No results match your search" (with a clear-search button).

### 6.9 Social Sharing (`utils/share.ts`)

Share text template:

```
🌱 My EcoVision Pledge:

"<pledge text>"

💬 "<quotation>"

Join me in protecting our planet at EcoVision! 🌍💚
<window.location.origin + pathname>
```

| Action | Behavior |
|---|---|
| WhatsApp | `window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer')` |
| Facebook | `window.open('https://www.facebook.com/sharer/sharer.php?u=<url>&quote=<text>', '_blank', 'noopener,noreferrer')` |
| Instagram | Use `navigator.share` if available; else copy text to clipboard, toast "Copied — paste it in Instagram", then open `https://www.instagram.com` |
| More | `navigator.share` if available; else copy |
| Copy | `navigator.clipboard.writeText`, with `document.execCommand('copy')` fallback; button shows "Copied!" for 2 s |

Handle `AbortError` from `navigator.share` silently (user cancelled).

### 6.10 Recycling Guide (`/recycle`)
- **4-step process:** Collect → Clean → Create → Use (icon + description each).
- **Material chips:** Plastic, Paper, Glass, Metal, Fabric, Wood.
- **6 example cards** (data in `recyclingExamples.ts`): image, waste→result badge, required-item chips, expandable numbered steps, hover image zoom.
- CTA block linking to `/ideas`.
- Reveal-on-scroll with staggered delays.

### 6.11 Innovative Ideas (`/ideas`)
**Form (left):** photo upload (same component/rules as reports), title, category (7 options with emoji), "What It Is", required items, step-by-step instructions (max 1500 chars with counter), creator name (optional).

**Gallery (right):**
- Filter by category chips; search across title, description, required items.
- Card: image with category badge, title, description, expandable details (required items + steps), upvote (one per browser), delete (own items only, with confirmation + blob cleanup).
- Seed with at least 6 sample ideas.

### 6.12 Footer
- Three link columns (Explore, Resources, Connect), logo + tagline, copyright, "Made with ♥ for our planet".
- Dark (`bg-forest-950`). No newsletter section.
- "Connect" links may point to `#` placeholders or real social URLs — make them easy to configure in one `config.ts`.

---

## 7. Design System

### 7.1 Colors (Tailwind `theme.extend.colors`)
Four 10-step ramps (50–950): **forest** (primary dark greens), **leaf** (accent greens, buttons), **earth** (warm browns, pending status), **sky** (blues, water, "reviewed" status).

Reference anchors (use as the 500/600 mid-tones; generate the rest to keep contrast AA):
- forest-950 ≈ `#0b2113` · forest-100 ≈ `#dcebe0`
- leaf-500 ≈ `#5c9768` · leaf-600 ≈ `#3a7a48`

### 7.2 Typography
- Headings `h1–h6`: Plus Jakarta Sans. Body: Inter. Applied in `@layer base`.
- Weights: 400, 500, 700/800 only.
- Body line-height 150%, headings 110–120%.

### 7.3 Spacing & Layout
- 8 px grid. Section padding `py-16 sm:py-20 lg:py-28`. Container `max-w-7xl px-4 sm:px-6 lg:px-8`.
- Breakpoints: `sm` 640, `md` 768, `lg` 1024 (desktop nav begins), `xl` 1280.

### 7.4 Animations (Tailwind keyframes)

| Name | Duration | Use |
|---|---|---|
| `fade-in-up` | 0.8s | Entry |
| `fade-in` | 1s | Entry |
| `float` | 6s | Leaves, stat cards |
| `float-slow` | 9s | Leaves |
| `drift` | 20s | Background movement |
| `pulse-ring` | 2.5s | Expanding ring |
| `grow` | 1.2s | Underline / bars |
| `sway` | 4s | Leaf sway |

Scroll reveal: `.reveal` → `.is-visible` (opacity + translateY, 0.7 s ease-out). Wrap all motion in `@media (prefers-reduced-motion: no-preference)`.

### 7.5 Utilities (`index.css`)
`.text-balance`, `.bg-grid` (40 px grid, 5% opacity), `.mask-fade-b`, `.cv-auto` (`content-visibility:auto; contain-intrinsic-size:auto 400px`). Custom WebKit scrollbar: 10 px, track `#dcebe0`, thumb `#5c9768`, hover `#3a7a48`. `scroll-behavior: smooth` on `html`.

---

## 8. Hooks

| Hook | Behavior |
|---|---|
| `useReveal` | **Single shared** `IntersectionObserver` (threshold 0.15, rootMargin `0px 0px -50px 0px`). Returns `{ ref, visible }`. Shows immediately if already in viewport on mount. Cleans up on unmount. |
| `useCountUp(target, duration=1800, start)` | rAF-based, cubic ease-out, respects reduced motion. |
| `useObjectUrl(imageId)` | Loads Blob from IndexedDB, creates object URL, **revokes it on unmount/change**. Returns `url \| null`. |
| `useLocalStorage<T>(key, initial)` | Safe read/write with try/catch and cross-tab `storage` event sync. |
| `useScrollToHash` | After route/hash change, scrolls to the matching element id (accounting for the fixed navbar offset). |

---

## 9. Storage Layer Details

### 9.1 Image Pipeline
```
File selected
 → validate: type startsWith 'image/', size ≤ 5 MB
 → preview via URL.createObjectURL (revoke when replaced/removed)
 → on submit: compress via <canvas> (max 1280 px longest side, JPEG/WebP quality 0.8)
 → store Blob in IndexedDB under key "<kind>-<timestamp>-<random6>"
 → save imageId on the record
```
- Compressed images should typically land under ~300 KB so many entries fit.
- Catch `QuotaExceededError` and show a friendly message.

### 9.2 Reducers/Context
`ReportsContext` and `IdeasContext` expose: `items`, `add`, `toggleUpvote`, `markSolved` (reports), `remove`, plus `isUpvoted(id)`. State hydrates from storage on mount and writes through on every change.

### 9.3 Optimistic Updates
All actions update state first, then persist. On persist failure, roll back and toast.

### 9.4 Seed Data
- ≥ 6 seed reports (varied types and statuses, mixed upvote counts, `createdAt` spread over the last 30 days relative to build time) and ≥ 6 seed ideas.
- Seed images are **local files in `public/images/seed/`**, not hotlinked.

### 9.5 Export / Import
- Footer or a small "Your data" menu: **Export my data** downloads `ecovision-backup-YYYY-MM-DD.json` containing user reports, ideas, upvotes, pledges, and images as base64.
- **Import** validates schema, then merges (skip duplicate IDs). Show a summary toast. Provide **Clear my data** with confirmation.

---

## 10. Assets

- **Do not hotlink Pexels or any external image.** Download all images used (hero Earth, 4 threat images, 6 recycling examples, seed report/idea photos) into `public/images/`, optimized to WebP (≤ 200 KB each), with explicit `width`/`height` to prevent layout shift. Keep a `public/images/CREDITS.md` listing the photographer and source for each.
- If an agent cannot download images, use `https://images.pexels.com/...` URLs **temporarily**, centralize them in the data files, and leave a `TODO(assets)` comment.
- Icons: `lucide-react` (import named icons only). Favicon `public/leaf.svg`.
- Fonts: `@fontsource-variable/plus-jakarta-sans` and `@fontsource-variable/inter`.

---

## 11. Accessibility Requirements

- Semantic landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page.
- All images have meaningful `alt` (user-uploaded: use the report/idea title).
- Modals: `role="dialog"`, `aria-modal`, labelled, focus trap, Escape to close, focus returns to trigger.
- Forms: visible `<label>`s, `aria-invalid` + `aria-describedby` for errors.
- Color contrast WCAG AA; visible `:focus-visible` outlines.
- Upvote buttons expose `aria-pressed`.
- Toasts use `role="status"` / `aria-live="polite"`.
- Honor `prefers-reduced-motion`.

---

## 12. Performance Requirements

- Route-level code splitting with `React.lazy` + `Suspense` for all pages except Home.
- `loading="lazy"` and `decoding="async"` on non-critical images; hero image eager with `fetchpriority="high"`.
- `.cv-auto` on long lists; `will-change: transform` only on floating elements.
- `lucide-react` excluded from `optimizeDeps` in `vite.config.ts`.
- Target Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Initial JS ≤ ~150 KB gzipped.

---

## 13. SEO, PWA, and Hosting

- `index.html`: proper `<title>` ("EcoVision — Saving Our Planet, One Action at a Time"), meta description, Open Graph + Twitter tags with a **real local OG image** (not the Bolt default), `theme-color`.
- **PWA (optional but recommended):** `vite-plugin-pwa` with `manifest.webmanifest` and precaching so the app works offline and is installable.
- `vite.config.ts`: set `base: './'` (or the repo name for GitHub Pages).
- `HashRouter` means no `_redirects` file is needed.
- Provide a `README.md` with install, dev, build, and deploy instructions (GitHub Pages workflow example included).

### NPM Scripts

| Script | Command |
|---|---|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit -p tsconfig.app.json` |
| `test` | `vitest run` |

---

## 14. Phased Build Plan (for the AI agent)

Complete each phase, run `npm run typecheck && npm run lint && npm run build`, and fix errors before moving on.

1. **Scaffold** — Vite + React + TS, Tailwind with the custom palette/animations/fonts, ESLint/Prettier, folder structure, `HashRouter`, layout shell (Navbar, Footer, ScrollProgress), empty pages.
2. **Static content** — Hero, Stats, WhyItMatters, Threats, TakeAction (without modal), `useReveal`, `useCountUp`, data files.
3. **Storage layer** — `db.ts`, `images.ts`, contexts, seed data, `useObjectUrl`, unit tests.
4. **Report flow** — `ImageUpload`, `ReportForm`, `ReportFeed`, validation, toasts.
5. **Issues page** — tabs, search, grid, upvote toggle, mark solved, delete + confirm modal, empty states.
6. **Recycling guide** — steps, chips, 6 example cards, expandable instructions.
7. **Ideas page** — form, gallery, filter/search, upvote, delete.
8. **Pledge modal & sharing** — modal, focus trap, share utilities, pledge persistence.
9. **Data portability** — export/import/clear.
10. **Polish** — a11y pass, reduced motion, responsive QA at 360 / 768 / 1024 / 1440 px, performance pass, local assets, SEO/OG, optional PWA.
11. **Docs & deploy** — README, CREDITS.md, deploy workflow.

---

## 15. Acceptance Criteria

The build is complete when **all** of the following are true:

**Functional**
- [ ] All 5 routes render and deep-link correctly on reload (HashRouter).
- [ ] A report with a photo can be created, appears at the top of the feed, and survives a page reload.
- [ ] Images persist across reloads (IndexedDB) and no object URLs leak.
- [ ] Upvote toggles once per browser per item and persists.
- [ ] "Mark Solved" and "Delete" appear only on user-created items; delete removes the image blob.
- [ ] Search and tabs on `/issues` combine correctly; counts update live.
- [ ] Ideas gallery filters by category and searches title/description/required items.
- [ ] Pledge modal previews correctly; all 5 share actions work (verify fallbacks on desktop).
- [ ] Export → Clear → Import restores all user data.
- [ ] Seed data appears on first visit; clearing user data does not remove it.
- [ ] No network requests are made to any backend (verify in DevTools; only static assets and optional share URLs).

**Quality**
- [ ] `typecheck`, `lint`, `test`, and `build` all pass with zero errors.
- [ ] No `any` in app code; strict TS.
- [ ] No console errors/warnings on any route.
- [ ] Works at 360 px width with no horizontal scroll.
- [ ] Keyboard-only navigation works for navbar, forms, and both modals.
- [ ] Lighthouse targets in section 12 are met.
- [ ] Works offline after first load (if PWA enabled).

---

## 16. Agent Working Rules

- Prefer small, focused components (< 200 lines each); extract shared UI into `components/ui/`.
- Keep all copy/data in `src/data/`, not inline in JSX.
- Don't add libraries beyond section 2 without a strong reason; list any addition in the README.
- Never store secrets; there should be no `.env` file.
- Write unit tests for: `timeAgo`, `validate`, `images` (compression mock), storage merge logic, and upvote toggling.
- Commit after each phase with a clear message.
- If something in this spec is ambiguous, choose the simplest behavior that satisfies the acceptance criteria and note the decision in the README.

---

## 17. Future Enhancements (out of scope for v1)

1. Optional cloud sync (Supabase/Firebase) behind a feature flag to share data across users.
2. Map view with Leaflet + OpenStreetMap and browser geolocation for report pins.
3. Gamification: badges for reporters and idea contributors (derivable from local data).
4. i18n (e.g., English/Hindi/Telugu).
5. Dark mode via Tailwind `dark:` variant.
6. Moderation/admin view if a backend is added later.
