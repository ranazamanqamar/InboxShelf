# InboxShelf — Design Brief

| Field | Value |
|-------|--------|
| **Product** | InboxShelf |
| **Tagline** | Every customer chat and order on one shelf |
| **Related** | [PRD](PRD.md) · [TRD](TRD.md) · [Workflow diagram](inboxshelf-flow.png) |
| **Brand assets** | [`docs/brand/`](brand/) |
| **Source of truth** | Values below are taken from the live landing page: [`globals.css`](../src/app/globals.css), [`layout.tsx`](../src/app/layout.tsx), [`LandingPage.tsx`](../src/components/marketing/LandingPage.tsx), [`FeatureScroll.tsx`](../src/components/marketing/FeatureScroll.tsx), [`WorkflowStepPreview.tsx`](../src/components/marketing/WorkflowStepPreview.tsx), [`FaqSection.tsx`](../src/components/marketing/FaqSection.tsx) |

---

## 1. Brand Kit

### 1.1 Brand in one line

A calm, confident AI inbox for store owners: **dark, focused marketing** with one bright **InboxShelf green**, and a **calm light dashboard** that uses the same green so both feel like one product.

- **Personality:** clear, practical, trustworthy, quietly modern. Not playful, not neon-cyberpunk, not purple “AI SaaS”.
- **Voice:** short, plain sentences that say exactly what happens (“answered from your knowledge, confirmed on WhatsApp, logged to Google Sheets”). Use concrete channels and actions, not buzzwords. Use the em dash for asides.

### 1.2 Brand kit at a glance

| Item | Value |
|------|-------|
| Logo | Shelf mark + **Inbox**/**Shelf** wordmark ([files](#22-files)) |
| Greens | `#00E676` brand · `#00C853` hover · `#047857` ink on light |
| Base | Black `#000000` marketing · white / `#FAFAFA` content |
| Fonts | Plus Jakarta Sans (UI) · Space Grotesk (CTAs) · Instrument Serif (rare accent) |
| Primary CTA | Solid green, black text, Space Grotesk 600: **Start free trial** |
| Icons | [lucide-react](https://lucide.dev), stroke icons; green for brand moments, zinc for neutral |

---

## 2. Logo

### 2.1 Concept

The mark is literally the product: **inbox messages sitting on a shelf**.

- Two solid **shelf planks** = the “shelf” where everything lives
- One **green message card** on the top shelf = the active / unread chat the AI is handling
- Two **neutral message cards** on the bottom shelf = other customer chats, organized

Wordmark: **Inbox** (neutral) + **Shelf** (green), one word, bold, tight tracking.

### 2.2 Files

| File | Use |
|------|-----|
| [`brand/logo-mark.svg`](brand/logo-mark.svg) | App icon / favicon / avatar (mark on dark rounded tile) |
| [`brand/logo-wordmark-on-dark.svg`](brand/logo-wordmark-on-dark.svg) | Marketing site, dark backgrounds |
| [`brand/logo-wordmark-on-light.svg`](brand/logo-wordmark-on-light.svg) | Dashboard, documents, white backgrounds |

In code: `BrandLogo` in [`src/components/marketing/BrandLogo.tsx`](../src/components/marketing/BrandLogo.tsx) with `tone="onDark"` or `tone="onLight"`. On the landing page: nav uses `tone="onDark" size="md"`, footer uses `tone="onLight" size="sm"`.

### 2.3 Colors by background

| Part | On dark | On light |
|------|---------|----------|
| Shelf planks | `#FFFFFF` | `#18181B` |
| Neutral cards | `#D4D4D8` | `#71717A` |
| Active card | `#00E676` | `#00C853` |
| “Inbox” | `#FFFFFF` | `#18181B` |
| “Shelf” | `#00E676` | `#047857` |

### 2.4 Rules

- **Minimum size:** mark 20px; with wordmark 96px wide.
- **Clear space:** at least half the mark’s height on every side.
- **Do:** use the provided files; keep the green card on the top shelf.
- **Don’t:** add glows, gradients, outlines, or drop shadows; recolor the cards; stretch; place the dark-tone logo on a light background (or the reverse); rebuild the wordmark in another font.

---

## 3. Colors

### 3.1 Tokens

Defined in `:root` and `@theme` in [`globals.css`](../src/app/globals.css) (Tailwind names in brackets).

| Token | Hex | Use |
|-------|-----|-----|
| `--brand` (`brand`) | `#00E676` | Primary CTA fill, icons, key words in headings, active states, focus ring |
| `--brand-dim` (`brand-dim`) | `#00C853` | Primary CTA hover; link hover on dark |
| `--brand-ink` (`brand-ink`) | `#047857` | Small green text and links on white (footer *Sign up*, light logo “Shelf”) |
| `--background` (`background`) | `#000000` | Page / hero background |
| `--foreground` (`foreground`) | `#F4F4F5` | Default text on dark |
| `--muted` | `#71717A` | Muted text (zinc-500) |
| `--muted-bright` | `#A1A1AA` | Secondary text on dark (zinc-400) |

Rule: green is an **accent**, not a background. Use it for one main action per view, active states, and small highlights.

### 3.2 Landing page surfaces (top to bottom)

| Surface | Value | Where |
|---------|-------|-------|
| Nav bar | `#000000`, fixed | Whole page |
| Hero | `#000000` | Sticky hero behind the sheet |
| Content sheet | `#FFFFFF`, top radius 48px (72px from `sm`), shadow `0 -24px 80px rgb(0 0 0 / .35)` | Climbs over the hero on scroll |
| Section band | Soft fade into `zinc-50` `#FAFAFA` (no hard top border on How it works); FAQ/Pricing stay on `zinc-50` | `#workflow` uses `bg-gradient-to-b from-white via-zinc-50 to-zinc-50`; FAQ + Pricing solid `zinc-50` |
| Section rhythm | `.section-y` — padding-block 4rem → 6rem (`sm`) | Features, How it works, FAQ, Pricing |
| Shared glass (`.is-glass`) | `#09090b` + radial brand wash `#00e67629 → #09090b`, border `white/10`, radius 28px (`.is-glass-tight` = 16px) | Features cards, Handover/Assistant/Pricing shells, hero inbox |
| How it works preview | Same deep black + brand wash (inline on `WorkflowStepPreview`; no frosted grey overlay / grid) | Right sticky slides |
| Inner dark tile | `zinc-900` `#18181B` or `black/40`, border `white/10` | Card mock-ups, price cards |
| Light card in light section | `#FFFFFF`, border `zinc-200` | FAQ items; reduced-motion step chips |
| Footer | `#FFFFFF`, `zinc-100` top border | Bottom of sheet |

### 3.3 Text colors

| Context | Role | Color |
|---------|------|-------|
| On dark | Headings | `#FFFFFF` / zinc-100 `#F4F4F5` |
| On dark | Body, list items | zinc-300 `#D4D4D8` / zinc-400 `#A1A1AA` |
| On dark | Lead / meta | zinc-500 `#71717A` |
| On dark | Microcopy (hero trial line) | zinc-600 `#52525B` |
| On light | Headings, active titles | zinc-900 `#18181B` |
| On light | Lead paragraph | zinc-600 `#52525B` |
| On light | Body, step descriptions, footer links | zinc-500 `#71717A` |
| On light | Labels (“STEP 1”), copyright | zinc-400 `#A1A1AA` |
| Hero headline | Lead words start at `#52525B`, “shelf” brightens to `#FFFFFF` | |

### 3.4 Green usage on the page

| Pattern | Spec |
|---------|------|
| Primary CTA | `brand` fill, black text, hover `brand-dim` |
| Heading key word | `text-brand` (see [Headings](#5-headings)) |
| Icons | Hero chat + sparkle icons, `+` bullets, small UI icons in `text-brand` |
| Active state | How it works: nearest slide sharp (others blurred); reduced-motion chips use `border-brand` + `bg-brand/10`. FAQ: `border-brand` + green question text |
| Badge / chip | `bg-brand/15` (or `/10`) + `text-brand`, 10px semibold, radius 4–6px; optional `border-brand/30` |
| AI chat bubble | `bg-brand/20` + `text-brand` |
| Glow | Soft brand radial on `.is-glass` and How it works previews (`#00e676` ~16% → `#09090b`); never on buttons or the logo |

**Contrast note:** the landing page currently uses bright `--brand` for large headings on white (“Choose your **shelf**”, “**How it works**”, “**Questions**”, active step first word, open FAQ question). This is the current visual style for big, bold text. For **small** green text or links on white, use `--brand-ink` (`#047857`), which is readable; bright `#00E676` on white is low contrast.

### 3.5 Supporting colors

| Use | Spec |
|-----|------|
| Warning / AI paused note (on dark) | `bg-amber-500/10`, `border-amber-500/30`, `text-amber-100/90` |
| Focus ring | 2px `brand` outline, 3px offset (buttons); `ring-brand/40` (FAQ items) |
| Text selection | `brand` at 35%, white text |

### 3.6 Dashboard palette — planned (dashboard)

Not built yet; use this when the dashboard ships.

| Role | Value |
|------|-------|
| App background | `#FAFAFA` (zinc-50) |
| Panels / cards | `#FFFFFF`, border `#E4E4E7` (zinc-200) |
| Primary text | `#18181B` (zinc-900) |
| Secondary text | `#52525B` (zinc-600) |
| Muted text | `#71717A` (zinc-500) |
| Primary button | `--brand` fill, black text (same as marketing) |
| Links / selected nav / active tab text | `--brand-ink` |
| Selected row / active chip background | `--brand` at 10–15% opacity |

Status colors — planned (dashboard):

| Status | Color |
|--------|-------|
| Success / confirmed / AI on | `--brand-ink` text on `--brand` 12% tint |
| Warning / trial ending | `#B45309` (amber-700) on `#FEF3C7` |
| Danger / stuck chat / trial expired | `#B91C1C` (red-700) on `#FEE2E2` |
| Neutral / paused | `#52525B` on `#F4F4F5` |

---

## 4. Typography

### 4.1 Fonts

| Role | Font | Weights | CSS variable | Notes |
|------|------|---------|--------------|-------|
| UI, body, headings | **Plus Jakarta Sans** | 400, 500, 600, 700 | `--font-jakarta` (Tailwind `font-sans`) | Default for everything except CTAs |
| Calls to action | **Space Grotesk** | 500, 600 | `--font-cta` | Only via `btn-primary`, `btn-secondary`, `btn-link` |
| Editorial accent | **Instrument Serif** | 400 | `--font-display` | Reserved for rare quote-style accents; never buttons, nav, or dashboard |

All load via `next/font/google` in [`src/app/layout.tsx`](../src/app/layout.tsx) and are applied as variables on `<html>`.

### 4.2 Body text scale (landing page)

| Style | Size | Weight / color | Example |
|-------|------|----------------|---------|
| Lead | 16px → 18px (`sm`), relaxed leading | 400, zinc-500 on dark / zinc-600 on light | Hero subline, “One inbox for the store you run…” |
| Section subtitle | 16px (Pricing: 14px → 16px) | 400, zinc-600 on light / zinc-500 on dark | “Steps play automatically — tap any step…” |
| Body | 14px, relaxed leading | 400, zinc-400 on dark / zinc-500 on light | Card descriptions, step descriptions, FAQ answers |
| List item | 14px | 400, zinc-300 with green `+` bullet | Feature and pricing lists |
| Nav link | 13px | 500, zinc-400 → white on hover | Features · How it works · FAQ · Pricing |
| Footer link | 14px | 400, zinc-500 → zinc-900 on hover | |
| Form label | 13px | 500, zinc-400 | Email, Password |
| Form input | 15px | 400, white on `black/40` | |
| Label / eyebrow | 11px, wide tracking, uppercase | 600, zinc-400 | “STEP 1” |
| Micro (mock-ups, badges) | 10–12px | 400–600 | Chat bubbles, “Most Popular”, “Handover” |
| Microcopy | 12px | 400, zinc-600 on dark / zinc-400 on light | “14-day free Starter trial · no card needed · then Pro $10/mo”, © line |

---

## 5. Headings

### 5.1 Marketing heading scale

Sizes are the real Tailwind classes converted to px (mobile → `sm` → `md` → `lg`).

| Level | Size | Weight / tracking | Used for |
|-------|------|-------------------|----------|
| H1 hero | 33 → 48 → 60 → 68px | 600, `tracking-tight`, leading 1.12, max width 5xl | “Every customer chat and order on one shelf + AI” |
| H2 section (large) | 30 → 36 → 48px | 600, `tracking-tight` | “Choose your shelf” |
| H2 section | 30 → 36px | 600, `tracking-tight` | How it works, Questions, Simple pricing |
| H3 feature headline | 30 → 36 → 40px, tight leading | 600, `tracking-tight` | Handover: “InboxShelf keeps mundane chat work on the shelf”; Assistant: “Assistant / your private ops chat” |
| H3 card title | 20px | 600, white | “For store owners”, “For your customers” |
| Price figure | 36px | 600, `tracking-tight`, white | “Free”, “$10” |
| Step title (How it works left) | 30 → 36 → 40px | 600, `tracking-tight` | “Answer from knowledge” (first word `text-brand`) |
| FAQ question | 14px → 15px | 600 | |
| Plan name | 14px | 500, `text-brand` | “Starter”, “Pro” |
| Auth page H1 | 24 → 30px | 600, `tracking-tight`, white | “Log in”, “Start free trial” |

### 5.2 Heading patterns

Two-tone headings are part of the voice. Always one green part, never more.

| Pattern | Example | Spec |
|---------|---------|------|
| Muted lead + green key word | Choose your **shelf** | Lead in zinc-500, key word `text-brand` |
| Green line + dark line | **How it works** / from chat to rating · **Questions** / before you start trial | Line 1 `text-brand`, `<br />`, line 2 zinc-900 |
| Green brand word + sentence (on dark) | **InboxShelf** keeps mundane chat work on the shelf | Brand word `text-brand`, rest white |
| Green line + white line (on dark) | **Assistant** / your private ops chat | Line 1 `text-brand`, `<br />`, line 2 white |
| Single color (on dark panel) | Simple pricing | White |
| Active step | **Answer** from knowledge | First word `text-brand`, rest zinc-900; inactive steps all zinc-800 |

### 5.3 Hero headline rules

- Copy: “Every customer chat / and order on one [chat icon] shelf + [sparkle icon] AI”.
- Line break after “Every customer chat” from `sm` up.
- **“shelf + ✦ AI” always stays together on one line** (a `whitespace-nowrap` group), so “AI” never drops to its own line.
- Icons: lucide `MessageSquare` and `Sparkles`, 28 → 36 → 44px, stroke 2.25, `text-brand` with a soft green glow.
- Sequence: grey words rise in, the chat icon pops, “shelf” brightens to white, then “+”, the sparkle and “AI” follow (see [Motion](#9-motion)).
- **Product visual:** one compact inbox preview under the CTA microcopy (max width 420px):
  - `.is-glass.is-glass-tight` shell (deep black + brand wash, 16px radius, `white/10` border).
  - Header “Inbox · AI on” with a green bot icon, and a “3 chats” count with a green dot.
  - Thin green shelf plank, then three chat rows that slot in (WA / IG / Web); only one row carries the green “AI replied” badge.
  - Hidden on screens 760px tall or less so the hero stays on one screen. Nothing else (grids, stats, overlays) goes in the hero.

### 5.4 Dashboard headings — planned (dashboard)

| Level | Size | Weight |
|-------|------|--------|
| Page title (e.g. “Inbox”, “Orders”) | 24px | 600 |
| Section title | 18px | 600 |
| Card / panel title | 15px | 600 |
| Body / table text | 14px | 400 |
| Meta / timestamps | 12px | 500, zinc-500 |

---

## 6. Titles

### 6.1 Browser tab and metadata

Set via the `metadata` template in [`layout.tsx`](../src/app/layout.tsx).

| Page | Tab title |
|------|-----------|
| Home | `InboxShelf` |
| Login | `Log in · InboxShelf` |
| Signup | `Sign up · InboxShelf` |
| New pages | `Page · InboxShelf` (template `%s · InboxShelf`) |

Meta description: “Every customer chat and order on one shelf. AI inbox for WhatsApp, Instagram, Messenger, and your site — synced to Google Sheets.”

### 6.2 Landing page title inventory

Keep new copy in this voice and shape.

| Section | Heading | Subtitle |
|---------|---------|----------|
| Nav | Features · How it works · FAQ · Pricing | CTAs: *Log in*, *Start free trial* |
| Hero | Every customer chat and order on one shelf + AI | WhatsApp, Instagram, Messenger, your site and Shopify — answered from your knowledge, confirmed on WhatsApp, logged to Google Sheets. |
| Hero integrations (`#integrations`) | Pill: **INTEGRATIONS** | Under the trial microcopy on the **black hero**, no section background (`tone="onDark"`). Kinso-style marquee: logo + name for WhatsApp, Instagram, Messenger, Website chat, Shopify, Google Sheets, Gmail, Outlook. Then the compact inbox preview. Component: [`IntegrationsStrip.tsx`](../src/components/marketing/IntegrationsStrip.tsx). |
| Features (`#features`) | Choose your **shelf** | First content under the curved white sheet (black hero → rounded sheet). One inbox for the store you run — and clear, fast replies for the people who buy from you. |
| Feature cards | For store owners · For your customers | Run every customer channel from one AI shelf tied to your Sheets — and take over only when a chat gets stuck. · Fast, natural replies — then a clean path from question to confirmed delivery and rating. |
| How it works (`#workflow`) | **How it works** / from chat to rating | Scroll to move through each step — the preview on the right follows the feature on the left. Sticky left copy + right vertical slide stack via [`FeatureScroll.tsx`](../src/components/marketing/FeatureScroll.tsx). |
| Steps (6 slides) | 1 Answer from knowledge · 2 Send order link · 3 Confirm on WhatsApp · 4 Log to Sheets · 5 Delivery ticks + notify · 6 Ask for rating | Left: sticky raised copy (`self-start` + top padding); right: full-height stack of `WorkflowStepPreview` scenes that translate upward (128px gap; nearest sharp, others blur). Mobile: stacked steps. |
| Handover | **InboxShelf** keeps mundane chat work on the shelf | When the AI is unsure, that chat pauses and alerts you — other customers still get automatic replies. |
| Assistant (`#assistant`) | **Assistant** / your private ops chat | Ask the bot about your store — it answers in its own thread, never in customer chats. Note: “Owner-only · never messages your customers” |
| FAQ (`#faq`) | **Questions** / before you start trial | Straight answers on channels, orders, Sheets, and handover. |
| Pricing (`#pricing`) | Simple pricing | Start free for 14 days. Continue on Pro when you are ready. |
| Footer | Features · FAQ · Pricing · Log in · *Sign up* ↗ | © 2026 InboxShelf |
| Login page | Log in | Welcome back — log in to your InboxShelf. |
| Signup page | Start free trial | 14 days free · no card required. |

---

## 7. Calls to action

Chosen style: **solid green primary + ghost secondary** (no glow).

| Type | Look | Use |
|------|------|-----|
| **Primary** (`btn-primary`) | `--brand` fill, black text, Space Grotesk 600, 12px radius, 1px inner top highlight (`white/35`); hover `--brand-dim`; 1px press | The one main action: *Start free trial*, *Create account*, *Continue*, *Upgrade to Pro* |
| **Secondary** (`btn-secondary`) | Transparent, 1px `white/18` border, zinc-200 text, Space Grotesk 600; hover brighter border + white text | *Log in*, *See how it works* and other secondary actions on dark |
| **Text link** (`btn-link`) | Space Grotesk 600; `--brand` on dark, `--brand-ink` on light; underline on hover | Inline CTAs (footer *Sign up*, “Already have an account? Log in”) |
| **Google** (`GoogleButton`) | Full width, white fill, zinc-900 text, Space Grotesk 600 14px, 12px radius, 18px colour Google “G”; hover zinc-200 | *Sign up with Google* (signup only) · *Continue with Google* (login only) |

Auth pages: email + password form first, then an **“or” divider** (`AuthDivider`: 1px `white/10` lines either side of a 12px zinc-500 “or”), then the Google button. Components live in [`GoogleButton.tsx`](../src/components/marketing/GoogleButton.tsx).

Arrow: hero and pricing CTAs end with a 16px `ArrowRight` that nudges 2px right on hover (`cta-arrow`; disabled with reduced motion).

### 7.1 Sizes

| Size | Padding | Text |
|------|---------|------|
| Small (nav) | 14px × 8px | 14px |
| Medium (cards, forms) | 16–20px × 10–12px | 14px |
| Large (hero) | 28px × 14px | 15px |

### 7.2 Copy

- Primary trial CTA: **Start free trial** (hero microcopy beneath: “14-day free Starter trial · no card needed · then Pro $10/mo”)
- Login submit: **Continue** · Signup submit: **Create account**
- Paywall (after trial): **Add card & upgrade to Pro**

### 7.3 Rules

- One primary button per view or card.
- Always visible keyboard focus ring (2px brand outline, 3px offset).
- No glow halos or animated rings around buttons.

---

## 8. Surfaces summary

| | Marketing | Dashboard (planned) |
|--|-----------|-----------|
| Mood | Dark, focused, a little cinematic | Calm, light, work-mode |
| Background | Black hero + white content sheet fading into `zinc-50` bands | `#FAFAFA` + white panels |
| Cards | Shared `.is-glass` dark panels (Features, Handover, Assistant, Pricing); How it works previews use the same green-black wash | White panels, `zinc-200` border |
| Accent | InboxShelf green | Same green |
| Logo | `tone="onDark"` (nav), `tone="onLight"` (footer) | `tone="onLight"` |
| Motion | Hero sequence + shelf-slot, scroll reveals, How it works stack scrub; respect `prefers-reduced-motion` | Minimal; functional transitions only |

### 8.1 Corner radius

| Element | Radius |
|---------|--------|
| Content sheet top | 48px → 72px (`sm`) |
| Step preview / `.is-glass` | 28px (`1.75rem`) |
| `.is-glass-tight` (hero inbox) | 16px |
| Cards, panels | 16px (legacy / inner) |
| Buttons, FAQ items | 12px |
| Inputs, inner notes | 8px |
| Badges | 4–6px |

---

## 9. Motion

All motion lives in [`globals.css`](../src/app/globals.css) and is turned off under `prefers-reduced-motion: reduce` (content shows in its final state).

| Motion | Spec |
|--------|------|
| Hero headline sequence | Words rise in (`wordIn`, 0.4–0.7s), chat icon pops at 0.55s, “shelf” brightens grey → white at ~1.05s, “+”, sparkle and “AI” follow by 1.7s; icons keep a slow green glow pulse (2.8s) |
| Hero rise | Subline, CTA, microcopy, integrations strip rise at 2.05s / 2.25s / 2.4s / 2.55s; inbox preview shell at 2.75s (`hero-rise-delay-5`) |
| Hero shelf-slot | Green shelf plank under inbox header; three chat rows animate in (`shelfSlotIn`) at 2.9s / 3.15s / 3.4s — chats land on the shelf |
| Sheet over hero | Hero is sticky; the white sheet scrolls up over it |
| Scroll reveal | Sections fade up 20px over 0.85s when 14% visible (`.reveal` / `.section-y` rhythm) |
| Float cards | Mock-up cards drift ±5–8px on 4.5–5.2s loops |
| How it works sticky scroll (desktop `lg+`) | Tall track `n × 100vh`; sticky row under nav; scroll progress → continuous `slidePos`; right stack `translate3d(0, -slidePos × (frameH + 128px), 0)`; nearest panel sharp, others `blur(8px)` / opacity ~0.78; left copy updates from rounded step (`workflow-scene-enter`). Mobile: stacked steps. Reduced motion: step chips + single preview, no tall track / no blur |
| Integrations marquee | Horizontal infinite scroll (`integrationsMarquee`, ~40s linear); track duplicated to −50%; edge fade via CSS mask; off under reduced motion |
| CTA arrow | Nudges 2px right on hover (150ms) |
| Button press | 1px down on active |
