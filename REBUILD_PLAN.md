# Fraser Photography — Site Rebuild Plan

## Vision

A purpose-built photography portfolio and business site for Fraser Embrey, events
photographer. The site replaces the current community template with a site designed
specifically around Fraser's brand, work, and business goals. It should feel
confident, editorial, and timeless — letting the photography lead — while being
fast, maintainable, and essentially free to run.

**Primary goal:** Establish Fraser as the go-to events photographer, build trust
through great work, clear process, and authentic voice, and generate enquiries.

---

## Starting Fresh

This is a clean-slate build. The existing codebase is a community template that
was used to experiment; nothing from it is being carried forward except the
actual photography assets.

**The only thing migrated from the old repo:** `src/gallery/` — the raw images
organised by collection folder. Everything else (components, scripts, layouts,
styles, data layer, config, dependencies) is written from scratch with purpose.

---

## Site Architecture

```
/                         Home
/work                     Portfolio hub (all collections)
/work/events              Events — primary specialism page
/work/[project-slug]      Curated project pages (e.g. /work/city-marathon-2024)
/services                 Services overview
/services/[service-slug]  Individual service page (e.g. event-coverage, corporate)
/about                    About Fraser + working with me
/blog                     Blog index
/blog/[slug]              Individual blog post
/contact                  Contact (Netlify Forms, no backend needed)
```

### Nav items (desktop)
`Work` · `Services` · `About` · `Blog` · `Contact`

`Work` and `Services` can have simple dropdown/flyout menus or just be links
to their respective hub pages.

---

## Brand & Design System

### Philosophy
The UI should be near-invisible — a neutral, high-quality frame for the images.
Modern editorial, not trendy. Timeless, not dated. Confident, not loud.

### Typography

**DECISION PENDING** — premium font required. See open questions below.

| Role | Font | Notes |
|---|---|---|
| Display / headings | TBD — premium serif | See candidates below |
| Body / UI | TBD — premium sans | See candidates below |
| Logo / wordmark | TBD — SVG logomark exists, wordmark option also being considered | |

Fonts must be self-hosted (no CDN round-trips). Adobe Fonts, Fontshare, or
licensed fonts preferred over Google Fonts for a premium feel.

### Colour Palette

```
--colour-bg:       #F7F5F2   /* warm off-white — gives photos breathing room */
--colour-surface:  #EFECE8   /* cards, subtle backgrounds */
--colour-ink:      #1C1A18   /* near-black — softer than pure black */
--colour-muted:    #7A746E   /* secondary text, captions, labels */
--colour-rule:     #DDD9D4   /* dividers, borders */
--colour-accent:   TBD pink  /* CONFIRMED: pink. Specific shade TBD —
                                see open questions for tone options */
```

Pink accent confirmed. Specific shade TBD — needs to sit well against warm
off-white without fighting the photography. A muted/dusty rose will age
better than a saturated or bright pink.

Images work better against warm off-white than pure white. The palette above
is intentionally restrained so the photography dominates.

### Spacing & Grid
- Max content width: `1280px`
- Generous whitespace — don't crowd the photos
- Use an 8px base unit

### Motion Principles
Animations must earn their place. Rules:
1. **Fade + subtle lift on scroll** for content sections (CSS + single IntersectionObserver instance)
2. **Page transitions** via Astro View Transitions (`@view-transition-api`) — cross-fade between pages
3. **Image hover** — CSS `scale(1.03)` + slight brightness increase, 300ms ease
4. **Nav background** — `backdrop-filter: blur` + opacity on scroll (CSS + ~10 lines of JS)
5. No parallax, no heavy JS animation libraries, no carousels that need JS

---

## Page Breakdown

### Home `/`

Goal: Immediate strong impression, establish identity, route visitors to the
right place.

Sections:
1. **Hero** — Full-viewport single image or tight 2–3 image collage. Name,
   short descriptor ("Events Photographer · Edinburgh"), single CTA ("See my work").
   The hero image needs to be exceptional — this is the first impression.
2. **Intro strip** — One or two sentences about Fraser's approach, maybe 30 words.
3. **Selected work** — 6–9 images, curated, masonry or grid. Link to `/work`.
4. **What I cover** — Simple icon/text list of service types or event categories.
5. **One featured project** — A call-out card linking to a deep project page.
6. **Social proof** — A short quote from a client, or a brief statement of
   experience (10+ years, X events covered, etc.).
7. **CTA strip** — "Working on an event? Let's talk." → `/contact`.

### Work Hub `/work`

Filterable grid of all collections/categories. Filter tabs at top (All · Events ·
Portraits · Street · etc.). Reuse the existing imageStore collection system.

### Events `/work/events`

A dedicated "specialism" page, not just a gallery. Tells the story of Fraser's
events work — kinds of events covered, approach, representative images, link to
relevant services.

Sections:
1. **Hero image** — Strong events shot, page title
2. **Gallery grid** — Events collection from imageStore
3. **What makes a great event photo** — Short editorial copy
4. **CTA** → relevant service page or contact

### Project Pages `/work/[project-slug]`

Content Collection entries. Each project is a curated story:
- Cover image, title, date, event/client type
- Short narrative (why the event, what the approach was)
- Photo essay — full-width images, pairs, quotes
- Metadata: location, event type, year

These are powerful for SEO and for demonstrating depth of work.

### Services `/services`

Overview page listing all offerings as cards: what, for whom, rough scope.
No prices necessarily, but clear positioning.

Example services (to be confirmed):
- **Event Coverage** — corporate events, ceremonies, launches
- **Sports & Running Events** — marathon/race coverage (existing marathon work)
- **Awards & Galas** — internal awards, formal dinners
- **Portraits** — professional headshots, team photos

### Service Pages `/services/[service-slug]`

For each offering, a dedicated page:
- What it includes
- Who it's for
- How it works (brief process steps)
- Representative images
- CTA → Contact

### About `/about`

Combines "about me" and "working with me" in one well-structured page — two
audiences (personal connection seekers and evaluating-buyers) served in sequence.

Sections:
1. **Portrait + short bio** — Who Fraser is, background, philosophy (expand the
   existing `about.md` content)
2. **Approach** — How Fraser works, what to expect on the day
3. **Working with me** — What clients can expect: process, communication,
   turnaround, deliverables
4. **Behind the camera** — The personal bit (sailing, beach, cooking — from
   existing copy) — humanises the brand

### Blog `/blog`

Content Collection. Establishes expertise, helps SEO, builds trust over time.

Post types to consider:
- Behind the scenes at an event
- "What to expect from your event photographer"
- Camera/gear talk (for hobbyist audience)
- Location guides

### Contact `/contact`

Simple form via Netlify Forms — no backend, no cost. Fields: name, email, event
type, event date, message. Set up a Netlify notification email.

---

## Technical Architecture

### Content Collections (`src/content/config.ts`)

```ts
// Blog posts
blog: {
  title: string
  date: Date
  excerpt: string
  coverImage: string
  tags: string[]
  published: boolean
}

// Curated projects
projects: {
  title: string
  date: Date
  slug: string
  coverImage: string
  category: string          // 'events' | 'marathon' | etc.
  description: string       // short, for cards
  location?: string
  featured: boolean         // show on homepage
}

// Service pages
services: {
  title: string
  slug: string
  order: number             // for nav/listing order
  icon?: string
  tagline: string
  coverImage?: string
}
```

### Gallery System

Written from scratch, but the same architecture: YAML manifest per gallery
collection, Sharp for build-time image optimisation, Astro `<Image />` for
rendering. The YAML approach is good — it's the implementation that gets
rebuilt.

- `featured: true` flag on individual images for homepage curation
- Optional `caption` and `altText` fields
- `npm run generate` script for bulk-adding images from a folder

### Image Optimisation

Use Astro's `<Image />` component everywhere. Configure in `astro.config.mts`:
```ts
image: {
  service: sharpImageService(),
  defaultFormat: 'webp',
}
```

For the gallery grid, generate multiple sizes (`widths: [400, 800, 1200]`).

### Layout System

```
src/layouts/
  BaseLayout.astro          <html>, <head>, meta, fonts, View Transitions
  PageLayout.astro          BaseLayout + NavBar + Footer + page wrapper
  BlogPostLayout.astro      PageLayout variant with article typography
  ProjectLayout.astro       PageLayout variant with full-bleed images
```

### Animation Implementation

Single shared `src/scripts/animations.ts` (~30 lines):
```ts
// Intersection Observer for .animate-on-scroll elements
// Sets data-visible="true" which CSS transitions react to
// One observer, zero dependencies
```

CSS handles everything else:
```css
.animate-on-scroll {
  opacity: 0;
  translate: 0 16px;
  transition: opacity 0.5s ease, translate 0.5s ease;
}
[data-visible="true"] {
  opacity: 1;
  translate: 0 0;
}
```

Nav scroll behaviour: ~15 lines inline `<script>` in `NavBar.astro`.

### Removing Alpine.js

The current site only uses Alpine for:
- Mobile menu toggle (open/close)
- Nav scroll class toggle

Both are trivially replaced with a small `<script>` tag and CSS. No Alpine
dependency needed.

### Netlify Configuration

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

Netlify Forms for contact — add `data-netlify="true"` to the form element, no
other config needed.

**Cost:** Netlify free tier covers 100GB bandwidth/month, 300 build minutes/month,
unlimited form submissions (100/month on free). Should be zero cost unless the
site sees significant traffic, at which point it's a good problem to have.

### SEO

- Dynamic `<title>` and `<meta description>` per page via `BaseLayout` props
- Open Graph image per page (could use a default branded OG image for most,
  specific images for blog posts and projects)
- Astro's `@astrojs/sitemap` integration — one line, auto-generates `sitemap.xml`
- `robots.txt` in `/public`
- Semantic HTML throughout (proper heading hierarchy, `<article>`, `<nav>`, etc.)

---

## Key Decisions Needed (Open Questions)

Before or during implementation, these need answers from Fraser:

1. **Logo / wordmark** — OPEN. SVG logomark exists but Fraser unsure about it.
   Options: (a) use the SVG mark, (b) text wordmark "Fraser Embrey" or
   "Fraser Embrey Photography", (c) monogram "FE" in a premium typeface,
   (d) combination mark (SVG + text). Can prototype multiple options early in
   Phase 1. Sharing the SVG would help evaluate it.

2. **Accent colour** — CONFIRMED pink. Specific shade TBD. Candidates:
   - `#C4748A` — dusty rose, refined, ages well
   - `#D4849A` — medium rose, warmer
   - `#B85C72` — deeper rose, more dramatic
   - `#E8B4BC` — soft blush, very subtle
   Used sparingly: CTAs, active states, hover underlines, decorative rules.
   Not used on or near photos.

3. **Font** — OPEN, premium required. Candidates by source:
   - **Adobe Fonts** (free with Adobe CC — Fraser likely already has access):
     Freight Display Pro, Warnock Pro, Acumin Pro, Neue Haas Grotesk Display
   - **Fontshare** (free, high quality): Zodiak (serif), Satoshi (sans),
     Cabinet Grotesk (sans), Instrument (serif)
   - **Google Fonts** (premium-feeling options): Fraunces, Instrument Serif,
     Spectral, DM Serif Display
   - **Licensed** (one-off cost): GT Sectra, Canela, Tiempos Headline
   Recommendation: check Adobe Fonts first — if CC subscription exists, this
   is the path to genuinely premium type at no extra cost.

4. **Service offering list** — What are the 3–5 services to feature? Rough scope
   and positioning for each.

5. **Project content** — Which events/shoots become "project" deep-dives?
   Marathon series is an obvious one (lots of existing images). What else?

6. **Blog intent** — Primarily SEO/trust-building, or does Fraser actively want
   to write? Affects how much infrastructure to build.

7. **Hero image** — What single image best represents the brand for the homepage
   hero? This is the most important creative decision.

8. **Domain/Netlify setup** — fraser.photography is configured. Does the domain
   need to point to a new Netlify site, or is there an existing one?

---

## Implementation Phases

### Phase 1 — Foundation (can start immediately)
- [ ] New Astro project structure (or clean up existing)
- [ ] `netlify.toml`
- [ ] Remove Alpine.js, remove GLightbox dependency
- [ ] Self-hosted fonts via fontsource
- [ ] Design tokens in CSS custom properties (colours, type scale, spacing)
- [ ] `BaseLayout`, `PageLayout` with new nav and footer
- [ ] New `NavBar` with CSS-only mobile menu + scroll behaviour
- [ ] New `Footer` with social links, nav links, copyright

### Phase 2 — Portfolio Core
- [ ] Work hub `/work` with filter tabs
- [ ] Events page `/work/events`
- [ ] Extend imageStore for optional caption/altText
- [ ] PhotoGrid component with `<Image />` and hover states
- [ ] Image lightbox (CSS `<dialog>` based)

### Phase 3 — Content Collections
- [ ] `src/content/config.ts` with blog, projects, services schemas
- [ ] Project pages `/work/[slug]`
- [ ] Services hub `/services`
- [ ] Service detail pages `/services/[slug]`
- [ ] Populate 2–3 projects and 3–4 services with content

### Phase 4 — Content Pages
- [ ] Home page (all sections)
- [ ] About page (bio + working with me)
- [ ] Blog index + post template
- [ ] Contact page with Netlify Form

### Phase 5 — Polish & Launch
- [ ] Animations (scroll reveal, page transitions, image hover)
- [ ] SEO (sitemap, OG images, meta)
- [ ] Performance audit (Lighthouse ≥ 95 on all core pages)
- [ ] Accessibility check (keyboard nav, colour contrast, alt text)
- [ ] Cross-browser / responsive QA
- [ ] DNS → Netlify

---

## File Structure (Target)

```
fraser-photography/
├── netlify.toml
├── astro.config.mts
├── site.config.mts              # extended: logo, socials, nav, contact email
├── tailwind.config.js
├── src/
│   ├── content/
│   │   ├── config.ts
│   │   ├── blog/
│   │   │   └── *.md
│   │   ├── projects/
│   │   │   └── *.md
│   │   └── services/
│   │       └── *.md
│   ├── gallery/                 # existing structure, keep as-is
│   │   ├── gallery.yaml
│   │   └── [Collection]/
│   ├── data/
│   │   ├── imageStore.ts        # keep, minor extensions
│   │   └── galleryData.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PageLayout.astro
│   │   ├── BlogPostLayout.astro
│   │   └── ProjectLayout.astro
│   ├── components/
│   │   ├── nav/
│   │   │   ├── NavBar.astro
│   │   │   └── MobileMenu.astro
│   │   ├── gallery/
│   │   │   ├── PhotoGrid.astro
│   │   │   ├── PhotoLightbox.astro
│   │   │   └── CollectionFilter.astro
│   │   ├── home/
│   │   │   ├── Hero.astro
│   │   │   ├── SelectedWork.astro
│   │   │   ├── FeaturedProject.astro
│   │   │   └── ServicesList.astro
│   │   ├── blog/
│   │   │   ├── PostCard.astro
│   │   │   └── PostGrid.astro
│   │   └── shared/
│   │       ├── Footer.astro
│   │       ├── ContactCTA.astro  # reusable "let's talk" strip
│   │       └── SectionHeading.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── work/
│   │   │   ├── index.astro
│   │   │   ├── events.astro
│   │   │   └── [project].astro
│   │   ├── services/
│   │   │   ├── index.astro
│   │   │   └── [service].astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── scripts/
│   │   └── animations.ts
│   └── styles/
│       └── global.css
└── public/
    ├── fonts/                   # self-hosted via fontsource build output
    ├── images/
    │   ├── og-default.jpg
    │   └── profile.jpeg
    ├── favicon.svg
    └── robots.txt
```

---

## Brand Voice Notes

The existing `about.md` copy is a good starting point. Key traits to carry
through all copy:

- **Honest and direct** — no marketing fluff, no superlatives
- **Craft-focused** — talks about the work, the moment, the approach
- **Warm but professional** — the personal details (sailing, cooking) humanise
  without undermining credibility
- **Confident without being boastful** — "10 years" and "documentary approach"
  are facts, not claims

This voice should be consistent across: page copy, image captions, blog posts,
service descriptions, social media bios, and any email templates.
