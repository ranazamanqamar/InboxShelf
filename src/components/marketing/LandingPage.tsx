"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Menu,
  X,
  MessageSquare,
  Sparkles,
  Bot,
  ArrowUpRight,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";
import { FaqSection } from "./FaqSection";
import { BrandLogo } from "./BrandLogo";
import { IntegrationsStrip } from "./IntegrationsStrip";
import { FeatureScroll } from "./FeatureScroll";

const LIFECYCLE = [
  {
    title: "Answer from knowledge",
    body: "Product Q&A from your FAQs and PDFs only — no invented stock or prices.",
  },
  {
    title: "Send order link",
    body: "When they are ready to buy, send the site order link and capture location.",
  },
  {
    title: "Confirm on WhatsApp",
    body: "Message the order’s WhatsApp number with a summary and ask them to confirm.",
  },
  {
    title: "Log to Sheets",
    body: "On yes, write a deduped Sheets row with name, phone, location, and items.",
  },
  {
    title: "Delivery ticks + notify",
    body: "When you tick delivery in Sheets, customers get an on-the-way WhatsApp.",
  },
  {
    title: "Ask for rating",
    body: "After they receive it, ask for an in-chat rating 1–5 (optional site review link).",
  },
] as const;

const OWNER_BENEFITS = [
  "One inbox: WhatsApp, Instagram, Messenger, website",
  "AI from your FAQs/PDFs only — no invented stock or prices",
  "Shopify + chat orders → Google Sheets (deduped, with location)",
  "Important Gmail/Outlook + private ops Assistant",
  "Stuck chat → alert + human takeover for that thread",
] as const;

const CUSTOMER_BENEFITS = [
  "Fast replies in their language",
  "Product answers from real knowledge",
  "Site order link when ready to buy",
  "WhatsApp confirm on their number",
  "Delivery updates + in-chat rating 1–5",
] as const;

const HERO_CHATS = [
  { channel: "WA", name: "Ayesha", message: "Is the linen shirt in size M?", aiReplied: true },
  { channel: "IG", name: "Omar", message: "Can you deliver to Lahore by Friday?", aiReplied: false },
  { channel: "Web", name: "Sara", message: "Placed my order — thanks!", aiReplied: false },
] as const;

const ASSISTANT_PROMPTS = [
  "List my important emails today",
  "Which orders are on the way?",
  "Show stuck chats",
] as const;

const ASSISTANT_EMAILS = [
  { subject: "Supplier invoice #4821 — due Friday", box: "Gmail" },
  { subject: "Refund request — order #1043", box: "Outlook" },
  { subject: "Courier pickup moved to 3 pm", box: "Gmail" },
] as const;

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-black text-zinc-100">
      {/* Fixed nav — stays on top for the whole page scroll */}
      <div className="fixed inset-x-0 top-0 z-50 bg-black">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <BrandLogo tone="onDark" size="md" />

          <div className="hidden items-center gap-8 text-[13px] font-medium text-zinc-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#workflow" className="transition-colors hover:text-white">
              How it works
            </a>
            <a href="#faq" className="transition-colors hover:text-white">
              FAQ
            </a>
            <a href="#pricing" className="transition-colors hover:text-white">
              Pricing
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="/login" className="btn-secondary px-3.5 py-2 text-[14px]">
              Log in
            </a>
            <a href="/signup" className="btn-primary px-3.5 py-2 text-[14px]">
              Start free trial
            </a>
          </div>

          <button
            type="button"
            className="text-zinc-300 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {mobileOpen ? (
          <div className="mx-5 mb-4 space-y-3 rounded-2xl border border-white/10 bg-zinc-950 px-5 py-5 md:hidden">
            <a
              href="#features"
              className="block text-sm text-zinc-300"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#workflow"
              className="block text-sm text-zinc-300"
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </a>
            <a
              href="#faq"
              className="block text-sm text-zinc-300"
              onClick={() => setMobileOpen(false)}
            >
              FAQ
            </a>
            <a
              href="#pricing"
              className="block text-sm text-zinc-300"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <a href="/login" className="btn-secondary py-2.5 text-sm">
                Log in
              </a>
              <a href="/signup" className="btn-primary py-2.5 text-sm">
                Start free trial
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tall track pins the black hero while the white sheet climbs over it */}
      <div className="hero-track">
        <header className="hero-sticky flex flex-col bg-black pt-20 sm:pt-24">
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-8 text-center sm:px-8 sm:pb-20">
            <h1 className="max-w-5xl text-[2.05rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              <span className="seq-lead">Every customer chat</span>
              <br className="hidden sm:block" />{" "}
              <span className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 sm:gap-x-3">
                <span className="seq-lead" style={{ animationDelay: "0.15s" }}>
                  and order on one
                </span>
                <MessageSquare
                  className="seq-icon-1 inline size-7 sm:size-9 md:size-11"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <span className="inline-flex items-center gap-x-2.5 whitespace-nowrap sm:gap-x-3">
                  <span className="seq-shelf">shelf</span>
                  <span className="seq-plus">+</span>
                  <Sparkles
                    className="seq-icon-2 inline size-7 sm:size-9 md:size-11"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                  <span className="seq-ai">AI</span>
                </span>
              </span>
            </h1>

            <p className="hero-rise hero-rise-delay-1 mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg">
              WhatsApp, Instagram, Messenger, your site and Shopify — answered from your
              knowledge, confirmed on WhatsApp, logged to Google Sheets.
            </p>

            <div className="hero-rise hero-rise-delay-2 mt-10">
              <a href="/signup" className="btn-primary cta-arrow px-7 py-3.5 text-[15px]">
                Start free trial
                <ArrowRight size={16} aria-hidden />
              </a>
            </div>

            <p className="hero-rise hero-rise-delay-3 mt-4 text-xs text-zinc-600">
              14-day free Starter trial · no card needed · then Pro $10/mo
            </p>

            <div className="hero-rise hero-rise-delay-4 mt-2 w-full max-w-5xl">
              <IntegrationsStrip tone="onDark" />
            </div>

            <div
              className="hero-rise hero-rise-delay-5 mt-8 w-full max-w-[420px] text-left [@media(max-height:760px)]:hidden"
              aria-hidden
            >
              <div className="is-glass is-glass-tight">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[11px]">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Bot size={12} className="text-brand" />
                    Inbox · AI on
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <span className="size-1.5 rounded-full bg-brand" />
                    {HERO_CHATS.length} chats
                  </span>
                </div>
                <div className="px-4 pt-3">
                  <div className="shelf-plank" aria-hidden />
                </div>
                <ul className="divide-y divide-white/5 pt-1">
                  {HERO_CHATS.map((chat, i) => (
                    <li
                      key={chat.name}
                      className={`shelf-slot shelf-slot-${i} flex items-center gap-3 px-4 py-2.5`}
                    >
                      <span className="w-9 shrink-0 rounded bg-white/5 py-0.5 text-center text-[10px] font-semibold text-zinc-300">
                        {chat.channel}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-white">
                          {chat.name}
                        </span>
                        <span className="block truncate text-[11px] text-zinc-500">
                          {chat.message}
                        </span>
                      </span>
                      {chat.aiReplied ? (
                        <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                          AI replied
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* White sheet — overlaps the pin track so scroll climbs over the hero */}
      <main className="sheet-panel relative z-20 -mt-[92svh] rounded-t-[3rem] bg-white text-zinc-900 sm:rounded-t-[4.5rem]">
        <section
          id="features"
          className="section-y mx-auto max-w-6xl scroll-mt-28 px-5 sm:px-8"
        >
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              <span className="text-zinc-500">Choose your</span>{" "}
              <span className="text-brand">shelf</span>
            </h2>
            <p className="mt-4 text-base text-zinc-600 sm:text-lg">
              One inbox for the store you run — and clear, fast replies for the
              people who buy from you.
            </p>
          </Reveal>

          <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-2">
            <Reveal className="is-glass flex h-full min-h-[420px] p-6 text-left text-zinc-100 sm:min-h-[440px] sm:p-8">
              <div className="flex h-full w-full flex-col gap-8 sm:flex-row sm:items-stretch">
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-xl font-semibold text-white">
                    For store owners
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Run every customer channel from one AI shelf tied to your
                    Sheets — and take over only when a chat gets stuck.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                    {OWNER_BENEFITS.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="font-semibold text-brand">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/signup"
                    className="btn-primary mt-auto w-fit px-5 py-2.5 text-sm"
                  >
                    Start free trial
                  </a>
                </div>
                <div
                  className="relative hidden w-[42%] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 sm:block"
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,color-mix(in_srgb,var(--brand)_22%,transparent),transparent_55%)]" />
                  <div className="relative space-y-2 p-4">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <Bot size={12} className="text-brand" />
                      Inbox · AI on
                    </div>
                    {["Ayesha · WA", "Omar · IG", "Sara · Web"].map((row) => (
                      <div
                        key={row}
                        className="rounded-lg border border-white/8 bg-black/40 px-3 py-2 text-[11px] text-zinc-300"
                      >
                        {row}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="is-glass flex h-full min-h-[420px] p-6 text-left text-zinc-100 sm:min-h-[440px] sm:p-8">
              <div className="flex h-full w-full flex-col gap-8 sm:flex-row sm:items-stretch">
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-xl font-semibold text-white">
                    For your customers
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Fast, natural replies — then a clean path from question to
                    confirmed delivery and rating.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                    {CUSTOMER_BENEFITS.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="font-semibold text-brand">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#workflow"
                    className="btn-secondary mt-auto w-fit px-4 py-2.5 text-sm"
                  >
                    See how it works
                  </a>
                </div>
                <div
                  className="relative hidden w-[42%] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 sm:block"
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_50%)]" />
                  <div className="relative flex h-full flex-col justify-end gap-2 p-4">
                    <div className="self-start rounded-2xl rounded-bl-sm bg-zinc-800 px-3 py-2 text-[11px] text-zinc-200">
                      Is the blue hoodie in stock?
                    </div>
                    <div className="self-end rounded-2xl rounded-br-sm bg-brand/20 px-3 py-2 text-[11px] text-brand">
                      Yes — size M available. Order link ↓
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                      <Sparkles size={11} className="text-brand" />
                      AI reply
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="workflow"
          className="scroll-mt-28 bg-gradient-to-b from-white from-0% via-zinc-50 via-24% to-zinc-50"
        >
          <div className="section-y mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="text-brand">How it works</span>
                <br />
                <span className="text-zinc-900">from chat to rating</span>
              </h2>
              <p className="mt-4 text-base text-zinc-600">
                Scroll to move through each step — the preview on the right
                follows the feature on the left.
              </p>
            </Reveal>

            <FeatureScroll steps={LIFECYCLE} reducedMotion={reducedMotion} />
          </div>

          {/* Handover — clear You vs AI split so feature is obvious */}
          <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
            <Reveal className="is-glass p-7 text-zinc-100 sm:p-10">
              <p className="mx-auto max-w-2xl text-center text-sm text-zinc-500">
                Feature: Handover — when AI is stuck, you take that chat;
                everything else keeps moving.
              </p>
              <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.5rem] md:leading-tight">
                    <span className="text-brand">InboxShelf</span>{" "}
                    <span className="text-white">
                      keeps mundane chat work on the shelf
                    </span>
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-500">
                    When the AI is unsure, that chat pauses and alerts you —
                    other customers still get automatic replies.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_80%_20%,color-mix(in_srgb,var(--brand)_16%,transparent),#09090b_55%)]">
                  <div className="grid sm:grid-cols-2">
                    {/* You · Handover */}
                    <div className="flex min-h-[240px] flex-col border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-white">
                          You
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                          <Sparkles size={9} aria-hidden />
                          Handover
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-500">
                        Stuck thread · composer unlocked
                      </p>
                      <div className="mt-4 flex flex-1 flex-col gap-2">
                        <div className="max-w-[95%] rounded-2xl rounded-tl-md border border-white/10 bg-zinc-800/90 px-3 py-2 text-[12px] leading-relaxed text-zinc-100">
                          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
                            Customer
                          </p>
                          Is the size chart for XS? Your FAQ only shows S–L.
                        </div>
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
                          AI paused · owner notified on WhatsApp + email
                        </div>
                        <div className="mt-auto rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-[11px] text-brand">
                          You can reply… composer active
                        </div>
                      </div>
                    </div>

                    {/* AI · Still running */}
                    <div className="flex min-h-[240px] flex-col p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-white">
                          AI
                        </span>
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                          Still running
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-500">
                        Other chats · no pause
                      </p>
                      <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-[12px]">
                        {[
                          "On-the-way WhatsApp sent",
                          "Rating asked (1–5)",
                          "Other chats: AI on",
                        ].map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2.5 text-zinc-300"
                          >
                            <span className="mt-0.5 text-brand" aria-hidden>
                              +
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="border-t border-white/10 px-4 py-3 text-center text-[11px] text-zinc-400 sm:text-xs">
                    Only the stuck thread pauses. Everything else stays on AI.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <div
            id="assistant"
            className="mx-auto max-w-6xl scroll-mt-28 px-5 pb-16 sm:px-8 sm:pb-24"
          >
            <Reveal className="is-glass p-7 text-zinc-100 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.5rem] md:leading-tight">
                    <span className="text-brand">Assistant</span>
                    <br />
                    <span className="text-white">your private ops chat</span>
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-500">
                    Ask the bot about your store — it answers in its own thread,
                    never in customer chats.
                  </p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {ASSISTANT_PROMPTS.map((prompt) => (
                      <li
                        key={prompt}
                        className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-200"
                      >
                        <Sparkles size={14} className="text-brand" aria-hidden />
                        “{prompt}”
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Lock size={12} aria-hidden />
                    Owner-only · never messages your customers
                  </p>
                </div>

                <div
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_20%_10%,color-mix(in_srgb,var(--brand)_14%,transparent),#09090b_55%)]"
                  aria-hidden
                >
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] text-zinc-400">
                    <Bot size={13} className="text-brand" />
                    <span className="font-semibold text-white">Assistant</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                      Private
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 p-4 sm:p-5">
                    <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-zinc-800 px-3 py-2 text-[12px] text-zinc-100">
                      List my important emails today
                    </div>
                    <div className="max-w-[95%] rounded-2xl rounded-tl-md border border-white/10 bg-zinc-900/90 px-3 py-2.5 text-[12px] text-zinc-200">
                      <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        <Sparkles size={10} aria-hidden />
                        InboxShelf
                      </p>
                      <p className="mb-2 text-zinc-300">3 important emails today:</p>
                      <ul className="flex flex-col gap-1.5">
                        {ASSISTANT_EMAILS.map((mail) => (
                          <li
                            key={mail.subject}
                            className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/40 px-2.5 py-2"
                          >
                            <Mail size={12} className="mt-0.5 shrink-0 text-zinc-500" />
                            <span className="min-w-0 flex-1">{mail.subject}</span>
                            <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400">
                              {mail.box}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="border-t border-white/10 px-4 py-3 text-center text-[11px] text-zinc-400 sm:text-xs">
                    Answers stay in this thread — never in customer DMs.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <FaqSection />

        <section
          id="pricing"
          className="section-y scroll-mt-28 bg-gradient-to-b from-zinc-50 to-zinc-50 px-5 sm:px-8 lg:px-[1in]"
        >
          <Reveal className="is-glass mx-auto w-full max-w-6xl p-7 text-zinc-100 sm:p-10">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Simple pricing
              </h2>
              <p className="mt-3 text-sm text-zinc-500 sm:text-base">
                Start free for 14 days. Continue on Pro when you are ready.
              </p>
            </div>

            <div className="mt-10 grid items-stretch gap-5 sm:grid-cols-2">
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/40 p-6 text-left">
                <p className="text-sm font-medium text-brand">Starter</p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    Free
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-500">14-day trial · no card needed</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                  {[
                    "WhatsApp, Instagram, Messenger, website chat",
                    "AI replies from your FAQs and PDFs only",
                    "Product Q&A → site order link",
                    "WhatsApp order confirm on the order phone",
                    "Orders logged to Google Sheets (with location)",
                    "Shopify order sync to Sheets",
                    "Important Gmail / Outlook surfacing",
                    "Owner Assistant for ops questions",
                    "Stuck-chat handover alerts (pause that thread only)",
                  ].map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-brand">+</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/signup" className="btn-primary cta-arrow mt-8 w-full py-3 text-sm">
                  Start free trial
                  <ArrowRight size={16} aria-hidden />
                </a>
              </div>

              <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-black/40 p-6 text-left">
                <span className="absolute right-4 top-4 rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                  Most Popular
                </span>
                <p className="text-sm font-medium text-brand">Pro</p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    $10
                  </span>
                  <span className="text-sm text-zinc-500">/mo per store</span>
                </p>
                <p className="mt-1 text-sm text-zinc-500">After trial</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                  {[
                    "Everything in Starter",
                    "Higher chat and AI limits",
                    "TikTok messaging (coming)",
                    "Sales and reply-rate analytics",
                    "White-label and custom domain",
                    "Extra sheets and mailboxes",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-brand">+</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/signup" className="btn-primary cta-arrow mt-8 w-full py-3 text-sm">
                  Start free trial
                  <ArrowRight size={16} aria-hidden />
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-zinc-100 bg-white px-5 py-10 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <BrandLogo tone="onLight" size="sm" href="/" />
            <div className="flex flex-wrap gap-5 text-sm text-zinc-500">
              <a href="#features" className="hover:text-zinc-900">
                Features
              </a>
              <a href="#faq" className="hover:text-zinc-900">
                FAQ
              </a>
              <a href="#pricing" className="hover:text-zinc-900">
                Pricing
              </a>
              <a href="/login" className="hover:text-zinc-900">
                Log in
              </a>
              <a
                href="/signup"
                className="btn-link text-brand-ink hover:text-emerald-800"
              >
                Sign up
                <ArrowUpRight size={14} />
              </a>
            </div>
            <p className="text-xs text-zinc-400">© 2026 InboxShelf</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
