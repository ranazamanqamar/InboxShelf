# InboxShelf — Product Requirements Document (PRD)

## 1. Product summary

| Field | Value |
|-------|--------|
| **Name** | InboxShelf |
| **Tagline** | Every customer chat and order on one shelf |
| **Type** | Multi-tenant SaaS (web) |
| **Primary URL** | https://inboxshelf.com |
| **Secondary URL** | https://inboxshelf.ai → redirect to `.com` |
| **Audience** | Ecommerce / website store owners drowning in chats + orders + email |
| **Problem** | Too many channels (WhatsApp, IG, Messenger, site, Shopify); hard to reply; hard to keep order/sales records; hard to triage email |
| **Solution** | One AI inbox that answers product questions, sends order links, confirms orders on WhatsApp, logs to Google Sheets (deduped, with location), updates customers when delivery status ticks, asks for receive + in-chat rating, surfaces important email, hands stuck chats to the human, and gives the owner a private Assistant for ops |

## 2. Goals

**MVP goals**
- Owner connects channels and sees all chats in one dashboard
- AI replies in a human tone, auto-detecting language, using only uploaded FAQs/PDFs (**valid product info only**)
- Product Q&A → site order link → WhatsApp confirm (order’s provided number) → Sheets row → delivery tick → “on the way” + receive notify → in-chat rating 1–5 + optional site link (see §5.3)
- Orders from Shopify + chat land in Google Sheets with full details (incl. location); duplicates skipped
- Important Gmail + Outlook mail listed; owner can instruct actions (Email page + Assistant)
- Stuck chat → notify owner (WhatsApp + Gmail + dashboard); pause only that chat; **owner can type a human reply**
- Owner has a separate **Assistant** chat for ops questions (e.g. “list my important emails today”)
- Marketing: black background with white content sheet + motion; dashboard: calm light UI; mock/demo mode first

**Non-goals (MVP)**
- Play Store / App Store native apps
- TikTok
- Full Paddle packaging / team roles / white-label
- Cold bulk WhatsApp marketing blasts (compliance: reply + approved templates only)
- Assistant messaging end customers on the owner’s behalf (MVP is read/ops only)

## 3. Personas

1. **Store owner (buyer)** — runs Shopify/social shop; wants less typing, clean order sheet, alerts when AI needs help, and a place to ask the bot about mail/orders
2. **End customer** — messages on WA/IG/Messenger/website; expects fast, natural replies
3. **SaaS operator** — one Meta app, many tenants; ship updates once for everyone

## 4. User journey (public site)

1. Open **inboxshelf.com** → **Home** (not login-first)
2. See **Pricing (USD)** on home — Starter free 14-day trial / Pro $10
3. **Sign up** (`/signup`) — **email + password** first, then **or**, then **Sign up with Google** → tenant created; **14-day free trial starts with no card**
4. **Dashboard** → connect integrations + knowledge; use Inbox + Assistant (full features during trial)
5. Later visits → **Log in** (`/login`) — email + password, or **Continue with Google**
6. After 14 days → **all features blocked** until owner adds a card and upgrades to Pro ($10/mo)
7. **Add another store** (optional) → same login, **new subscription** for that store, Pro $10/mo from day 1 (**no second free trial**); owner switches between stores in the dashboard

Full visual: [inboxshelf-flow.png](inboxshelf-flow.png) · [inboxshelf-flow.svg](inboxshelf-flow.svg).

## 4.1 Pricing (USD)

| Plan | Price | Notes |
|------|--------|--------|
| **Starter** | **Free** · 14-day trial | Full core product during trial (inbox, knowledge, Sheets, email, handover, Assistant). **No card at signup.** |
| **Pro** | **$10**/mo **per store** | After trial: features stay **locked** until card + Pro payment. Same app; higher limits / later modules via flags |

**One subscription per store**
- Each store has its **own subscription**. An owner with two stores pays for two subscriptions.
- **One free trial per owner** — only the first store gets the 14-day trial. Every extra store is Pro ($10/mo) from day 1.
- The owner uses **one login** for all their stores and switches between them in the dashboard.

**Trial / paywall rules**
- Signup never asks for card credentials (first store).
- Day 1–14: full core access.
- Day 15+: that store’s dashboard features blocked; paywall prompts add card / upgrade to Pro $10/mo. A locked store never locks the owner’s other stores.
- Charge only when the owner chooses Pro (not during the free trial).

Marketing shows pricing only on the home `#pricing` panel (no separate pricing page).

## 4.2 Auth methods

| Method | Where | Label / UI order |
|--------|--------|------------------|
| Email + password | `/signup`, `/login` | **Primary** (shown first) |
| Google | `/signup` only as signup | Below **or**: **Sign up with Google** |
| Google | `/login` for returning users | Below **or**: **Continue with Google** (never “Sign up with Google” on login) |

Firebase Authentication: Email/Password provider + Google provider.

## 5. MVP feature requirements

### 5.1 Channels
- WhatsApp Business (Cloud API)
- Instagram DM
- Messenger
- Website chat widget (embed script)

### 5.2 AI agent
- Knowledge: pasted FAQs + PDF uploads (RAG)
- Humanized replies; auto-detect customer language
- When the customer asks about products/orders, agent answers with **valid info from knowledge only** (no invented stock, prices, or specs)
- Escalate when unsure / out of knowledge
- Per-conversation modes: `ai_on` | `paused` | `human_takeover`
- When the customer wants to place an order, agent sends the shop’s **website order link** so they can order on site (or complete structured details in chat when appropriate)
- When placing or logging a chat order, AI captures **location** (city/area) plus address details before writing the Sheets/DB row

### 5.3 Orders + Google Sheets

**Ingest + sheet**
- Ingest from **Shopify** store webhooks, **non-Shopify website** order webhooks, and structured chat orders (order `source`: `shopify` / `website` / `chat`)
- Agent creates sheet columns if missing
- Fields: order id, date, month, name, phone (WhatsApp), **location**, address, channel, items, qty, price, status (`pending_confirm` / `confirmed` / `to_deliver` / `on_the_way` / `delivered` / rated), rating (1–5), etc.
- When the AI takes an order in chat, it **must ask for or extract delivery location** and save it on the order row (alongside full address when available)
- Dedupe: same person + same order across channels → one row
- Local DB is source of truth; Sheets synced

**Order messaging lifecycle (WhatsApp number on the order)**
1. Customer asks about a product → agent sends accurate product info from knowledge
2. Customer wants to order → agent sends **site order link**
3. Customer orders on **site** or via **chat** → agent messages that customer’s **provided WhatsApp number** with order summary + **final confirmation**: **“Do you confirm your order?”** (**before** any Sheets write)
4. Customer confirms (yes) → **only then** agent **adds/updates order details on Google Sheets** (+ DB, incl. location); may send a short WhatsApp thank-you / confirmed note
5. Owner (in Sheets or dashboard Orders) marks the order ready for delivery — **tick / status → to deliver / on the way**
6. That tick triggers agent WhatsApp to that customer: **order is on the way**, and asks them to **notify when they receive** the order
7. Customer replies that they received it → agent asks for an **in-chat rating (1–5)** about the product, then may send an **optional site review link**

**Acceptance**
- Confirm and status updates go to the **WhatsApp number provided on the order**, not a random channel
- **Google Sheets row is written only after** the customer’s final WhatsApp **yes** (not before)
- Sheets delivery tick is what drives the “on the way” message (owner-controlled)
- Rating is captured **in chat first**; site link is optional follow-up

### 5.4 Email
- Gmail + Outlook connected
- Daily/important mail list in dashboard (**Email** page)
- Owner can say “do this on that mail” → agent executes (reply/forward/mark)
- Owner can ask the **Assistant** (e.g. “list my important emails of today”) → bot fetches and **posts the list into that Assistant thread**

### 5.5 Handover + alerts
- On stuck: notify owner WhatsApp + Gmail + dashboard
- Pause auto-reply **only** for that chat; others continue
- After pause / human takeover, owner replies via the inbox composer (see 5.6)

### 5.6 Dashboard

**Surfaces**
- Unified **Inbox**, **Orders**, **Email**, **Knowledge**, **Integrations**, **Alerts**
- New nav: **Assistant** (owner↔bot only — not a customer channel)
- Upgrade CTA placeholder for Pro

**Customer inbox — reply composer**
- Composer is **always visible** in the conversation detail pane
- **Active** when mode is `paused` or `human_takeover` — owner types and sends
- **Disabled / greyed** when mode is `ai_on` (AI owns replies; owner can still switch mode)
- Human send appends to that customer thread; live mode sends on the channel (mock UI first)
- Acceptance: paused chat shows a usable keyboard; `ai_on` shows the keyboard but cannot send

**Assistant (owner↔bot)**
- Separate dashboard section with its own chat history
- Private: store owner ↔ InboxShelf bot only
- Owner asks ops tasks in natural language; bot runs them and **writes results back into the same Assistant chat**
- MVP example intents:
  - List important emails for today
  - Order lookups / status summaries
  - “Pause chat X” / point owner to a stuck thread
  - Knowledge reminders (what’s in the FAQ shelf)
- MVP scope: **read/ops only** — does not message end customers unless explicitly scoped later
- Acceptance: “list my important emails of today” returns a readable list **in the Assistant thread**, not mixed into a customer DM

### 5.7 Compliance (WhatsApp)
- Not a bulk spammer; customer-initiated + templates only
- Guide merchants away from cold blast behavior (Meta can block numbers)

## 6. Pro feature requirements (later)

| Feature | Notes |
|---------|--------|
| TikTok messaging | New channel module |
| Higher chat / AI limits | Plan quotas |
| Advanced analytics | Reply rate, sales by channel |
| Paddle billing | Monetization polish |
| White-label / custom domain | Agencies |
| Extra sheets and mailboxes (per store) | Power users |
| Priority support | Packaging |
| Native mobile apps | Only if demand |
| Assistant actions that message customers | Explicit opt-in later |

**Multiple stores are not a Pro feature:** each store is its own subscription (see §4.1).

**Dashboard access:** only the store owner can access a store’s dashboard — one owner per store, on Starter and Pro. No team members, staff accounts, or shared logins. An owner with more than one store gets a **store switcher** (same login). See [Backend Schema — Access Control](BACKEND_SCHEMA.md#3-access-control).

## 7. MVP → Pro process

**Same product. Same login. Same deploy.**

1. Add Pro features in the same codebase behind `pro_*` feature flags
2. Deploy once (e.g. Vercel) — all tenants get new code
3. Client clicks **Upgrade to Pro** → pays → `plan = pro` in DB
4. Pro features unlock; Starter users unchanged

Clients do not reinstall or buy a second website.

## 8. Design requirements

Full brand rules (logo, colors, type, headings, CTAs): [Design Brief](DESIGN_BRIEF.md).

**Brand**
- One accent: InboxShelf green `#00E676` (hover `#00C853`); darker `#047857` for green text on light backgrounds
- Logo: inbox message cards on a shelf; wordmark **Inbox** + green **Shelf**
- Primary CTA: solid green, black text, no glow; secondary: ghost outline

**Marketing (home, pricing, login, signup)**
- Dark: black base with white content sheet, green accent; honor `prefers-reduced-motion`
- No purple SaaS clichés, no cream/terracotta defaults
- Hero: InboxShelf brand + one headline + one short line + CTA group + one calm product visual
- No busy card grids, stats strips, or overlays on the hero

**Dashboard**
- Calm, light UI (`#FAFAFA` + white panels) using the **same green** accent
- Inbox-first; Assistant as its own clear section
- Composer always present in thread detail; disabled state must still be readable

## 9. Success metrics (MVP)

- Owner connects ≥1 channel and receives an AI reply in demo or live
- Order row appears in Sheets without duplicate on dual-channel test
- After site/chat order, confirm WhatsApp is sent to the order’s phone; confirm writes/updates the row
- Owner ticks to-deliver / on-the-way in Sheets → customer gets “on the way” + “notify when received”
- Customer says received → in-chat 1–5 rating stored; optional site review link sent
- Escalation fires notifications and pauses only that thread; owner can send a human reply
- Assistant returns “important emails today” into the Assistant thread
- Landing + signup + dashboard usable on mobile browser

## 10. Current build status

**Done**
- PRD (this doc, including order messaging lifecycle spec)
- Marketing site (home, pricing, login, signup) — black + motion; sections: Features, How it works, Handover, Assistant, FAQ, Pricing
- Pricing shown on home only: Starter **free 14-day trial** (no card) / Pro **$10**/mo (Most Popular)
- Login / signup UI with email + password and Google button (design only; Firebase Auth not wired yet)

**Not done yet**
- Real Firebase Auth (email/password + Google) and tenant creation
- Real Meta / Shopify / Sheets / Gmail / Outlook OAuth
- Live order messaging lifecycle (product link → WhatsApp confirm → Sheets tick → on-the-way → received → in-chat rating)

**Dashboard — built later with the product**
- Dashboard shell + inbox / orders / knowledge / integrations / email / alerts
- Inbox reply composer (always visible; active on paused / human)
- Assistant dashboard section (owner↔bot; OpenAI when `OPENAI_API_KEY` set)
- Integrations Connect UX (WhatsApp shows demo Business number)
