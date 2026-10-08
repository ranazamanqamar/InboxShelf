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
- Marketing: grey fluid atmosphere + motion; dashboard: calm light UI; mock/demo mode first

**Non-goals (MVP)**
- Play Store / App Store native apps
- TikTok
- Full Stripe packaging / team roles / white-label
- Cold bulk WhatsApp marketing blasts (compliance: reply + approved templates only)
- Assistant messaging end customers on the owner’s behalf (MVP is read/ops only)

## 3. Personas

1. **Store owner (buyer)** — runs Shopify/social shop; wants less typing, clean order sheet, alerts when AI needs help, and a place to ask the bot about mail/orders
2. **End customer** — messages on WA/IG/Messenger/website; expects fast, natural replies
3. **SaaS operator** — one Meta app, many tenants; ship updates once for everyone

## 4. User journey (public site)

1. Open **inboxshelf.com** → **Home** (not login-first)
2. See **Pricing (USD)** on home — Starter free 14-day trial / Pro $10
3. **Sign up** → tenant created
4. **Dashboard** → connect integrations + knowledge; use Inbox + Assistant
5. Later visits → **Log in**

## 4.1 Pricing (USD)

| Plan | Price | Notes |
|------|--------|--------|
| **Starter** | **Free** · 14-day trial | Full core product during trial (inbox, knowledge, Sheets, email, handover, Assistant) |
| **Pro** | **$10**/mo | Paid plan after trial (Most Popular) — same app; higher limits / later modules via flags |

Marketing shows pricing only on the home `#pricing` panel (no separate pricing page).

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
- Ingest from Shopify / site webhooks + structured chat orders
- Agent creates sheet columns if missing
- Fields: order id, date, month, name, phone (WhatsApp), **location**, address, channel, items, qty, price, status (`pending_confirm` / `confirmed` / `to_deliver` / `on_the_way` / `delivered` / rated), rating (1–5), etc.
- When the AI takes an order in chat, it **must ask for or extract delivery location** and save it on the order row (alongside full address when available)
- Dedupe: same person + same order across channels → one row
- Local DB is source of truth; Sheets synced

**Order messaging lifecycle (WhatsApp number on the order)**
1. Customer asks about a product → agent sends accurate product info from knowledge
2. Customer wants to order → agent sends **site order link**
3. Customer orders on **site** or via **chat** → agent messages that customer’s **provided WhatsApp number**: summary + **“Do you confirm your order?”**
4. Customer confirms (yes) → agent writes/updates the Sheets/DB row (incl. location); may send a short WhatsApp thank-you / confirmed note
5. Owner (in Sheets or dashboard Orders) marks the order ready for delivery — **tick / status → to deliver / on the way**
6. That tick triggers agent WhatsApp to that customer: **order is on the way**, and asks them to **notify when they receive** the order
7. Customer replies that they received it → agent asks for an **in-chat rating (1–5)** about the product, then may send an **optional site review link**

**Acceptance**
- Confirm and status updates go to the **WhatsApp number provided on the order**, not a random channel
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
| Stripe billing + teams/roles | Monetization polish |
| White-label / custom domain | Agencies |
| Multi-store / multi-sheet / extra mailboxes | Power users |
| Priority support | Packaging |
| Native mobile apps | Only if demand |
| Assistant actions that message customers | Explicit opt-in later |

## 7. MVP → Pro process

**Same product. Same login. Same deploy.**

1. Add Pro features in the same codebase behind `pro_*` feature flags
2. Deploy once (e.g. Vercel) — all tenants get new code
3. Client clicks **Upgrade to Pro** → pays → `plan = pro` in DB
4. Pro features unlock; Starter users unchanged

Clients do not reinstall or buy a second website.

## 8. Design requirements

**Marketing (home, pricing, login, signup)**
- Balanced black–white–**grey** fluid atmosphere (not flat white, not pure dark)
- Soft drifting smoke/fluid blobs + film grain; honor `prefers-reduced-motion`
- Monochrome grit — no purple SaaS clichés, no cream/terracotta defaults
- Hero: InboxShelf brand + one headline + one short line + CTA group + one calm product visual
- No busy card grids, stats strips, or overlays on the hero

**Dashboard**
- Calm, light UI (not the marketing wash)
- Inbox-first; Assistant as its own clear section
- Composer always present in thread detail; disabled state must still be readable

## 9. Technical requirements

| Layer | Choice |
|-------|--------|
| App | TypeScript, Next.js App Router |
| DB | PostgreSQL + Prisma (wired after mock) |
| Auth | Mock session first → NextAuth/Clerk later |
| AI | OpenAI/Anthropic + RAG (mock replies first) |
| Host | Vercel + managed Postgres |
| Mode | **Mock/demo first**; real APIs behind env flags |
| Path | `C:\Users\Administrator\Projects\inboxshelf` |
| Platform secrets | `OPENAI_API_KEY` (and later Meta App secret) in server env only — never in shop UI |
| Tenant connections | WhatsApp / IG / etc. per shop via Integrations (Meta Embedded Signup when live) |

## 10. Success metrics (MVP)

- Owner connects ≥1 channel and receives an AI reply in demo or live
- Order row appears in Sheets without duplicate on dual-channel test
- After site/chat order, confirm WhatsApp is sent to the order’s phone; confirm writes/updates the row
- Owner ticks to-deliver / on-the-way in Sheets → customer gets “on the way” + “notify when received”
- Customer says received → in-chat 1–5 rating stored; optional site review link sent
- Escalation fires notifications and pauses only that thread; owner can send a human reply
- Assistant returns “important emails today” into the Assistant thread
- Landing + signup + dashboard usable on mobile browser

## 11. Current build status

**Done**
- PRD (this doc, including order messaging lifecycle spec)
- Marketing site (home, pricing, login, signup) — mock, grey atmosphere + motion
- Pricing shown on home only: Starter **free 14-day trial** / Pro **$10**/mo (Most Popular)
- Dashboard shell + mock inbox / orders / knowledge / integrations / email / alerts
- Inbox reply composer (always visible; active on paused / human)
- Assistant dashboard section (owner↔bot; mock intents + OpenAI when `OPENAI_API_KEY` set)
- Integrations Connect UX (sellable mock; WhatsApp shows demo Business number)

**Not done yet**
- Real Meta / Shopify / Sheets / Gmail / Outlook OAuth
- Live order messaging lifecycle (product link → WhatsApp confirm → Sheets tick → on-the-way → received → in-chat rating)
