"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Menu,
  X,
  MessageSquare,
  Sparkles,
  Bot,
  ArrowUpRight,
} from "lucide-react";
import { WorkflowStepPreview } from "./WorkflowStepPreview";
import { FaqSection } from "./FaqSection";
import { BrandLogo } from "./BrandLogo";

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
  "Orders → Google Sheets (deduped, with location)",
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
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % LIFECYCLE.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-zinc-100">
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
            <a
              href="/login"
              className="rounded-lg border border-white/15 px-3.5 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-brand-dim"
            >
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
              <a
                href="/login"
                className="py-2 text-center text-sm text-zinc-300"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-black"
              >
                Start free trial
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tall track pins the black hero while the white sheet climbs over it */}
      <div className="hero-track">
        <header className="hero-sticky flex flex-col bg-black pt-20 sm:pt-24">
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-32 pt-8 text-center sm:px-8 sm:pb-40">
            <h1 className="max-w-4xl text-[2.05rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
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
                <span className="seq-shelf">shelf</span>
                <span className="seq-plus">+</span>
                <Sparkles
                  className="seq-icon-2 inline size-7 sm:size-9 md:size-11"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <span className="seq-ai">AI</span>
              </span>
            </h1>

            <p className="hero-rise hero-rise-delay-1 mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg">
              WhatsApp, Instagram, Messenger, and your site — answered from your
              knowledge, confirmed on WhatsApp, logged to Google Sheets.
            </p>

            <div className="hero-rise hero-rise-delay-2 relative mt-10">
              <span className="cta-glow-ring" aria-hidden />
              <a
                href="/signup"
                className="relative inline-flex items-center justify-center rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-brand-dim"
              >
                Start free trial
              </a>
            </div>

            <p className="hero-rise hero-rise-delay-3 mt-4 text-xs text-zinc-600">
              14-day free Starter trial · then Pro $10/mo
            </p>
          </div>
        </header>
      </div>

      {/* White sheet — overlaps the pin track so scroll climbs over the hero */}
      <main className="sheet-panel relative z-20 -mt-[92svh] rounded-t-[3rem] bg-white text-zinc-900 sm:rounded-t-[4.5rem]">
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-28 px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24"
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
            <Reveal className="flex h-full min-h-[420px] overflow-hidden rounded-2xl bg-zinc-950 p-6 text-left text-zinc-100 sm:min-h-[440px] sm:p-8">
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
                    className="mt-auto inline-flex w-fit items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-dim"
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

            <Reveal className="flex h-full min-h-[420px] overflow-hidden rounded-2xl bg-zinc-950 p-6 text-left text-zinc-100 sm:min-h-[440px] sm:p-8">
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
                    className="mt-auto inline-flex w-fit items-center justify-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/40"
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
          className="scroll-mt-28 border-t border-zinc-100 bg-zinc-50"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="text-brand">How it works</span>
                <br />
                <span className="text-zinc-900">from chat to rating</span>
              </h2>
              <p className="mt-4 text-base text-zinc-600">
                Tap a step — the window below shows exactly what InboxShelf does
                on each channel.
              </p>
            </Reveal>

            <div className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LIFECYCLE.map((step, i) => {
                const active = i === activeStep;
                const words = step.title.split(" ");
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    className={`flex h-full min-h-[148px] flex-col rounded-2xl border p-5 text-left transition-colors ${
                      active
                        ? "border-brand bg-white shadow-[0_0_0_1px_color-mix(in_srgb,var(--brand)_35%,transparent)]"
                        : "border-zinc-200 bg-white/80 hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-[11px] font-semibold tracking-wide text-zinc-400">
                      STEP {i + 1}
                    </p>
                    <p className="mt-2 text-base font-semibold sm:text-lg">
                      {active ? (
                        <>
                          <span className="text-brand">{words[0]}</span>{" "}
                          <span className="text-zinc-900">
                            {words.slice(1).join(" ")}
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-800">{step.title}</span>
                      )}
                    </p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                      {step.body}
                    </p>
                  </button>
                );
              })}
            </div>

            <Reveal>
              <WorkflowStepPreview
                activeStep={activeStep}
                reducedMotion={reducedMotion}
              />
            </Reveal>
          </div>

          {/* Handover — clear You vs AI split so feature is obvious */}
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
            <Reveal className="rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-100 sm:p-10">
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
        </section>

        <FaqSection />

        <section
          id="pricing"
          className="scroll-mt-28 border-t border-zinc-100 bg-zinc-50 px-5 py-16 sm:px-8 sm:py-24 lg:px-[1in]"
        >
          <Reveal className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-zinc-950 p-7 text-zinc-100 sm:p-10">
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
                <p className="mt-1 text-sm text-zinc-500">14-day trial</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                  {[
                    "WhatsApp, Instagram, Messenger, website chat",
                    "AI replies from your FAQs and PDFs only",
                    "Product Q&A → site order link",
                    "WhatsApp order confirm on the order phone",
                    "Orders logged to Google Sheets (with location)",
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
                <a
                  href="/signup"
                  className="mt-8 flex w-full items-center justify-center rounded-lg bg-brand py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-dim"
                >
                  Start free trial
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
                  <span className="text-sm text-zinc-500">/mo</span>
                </p>
                <p className="mt-1 text-sm text-zinc-500">After trial</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                  {[
                    "Everything in Starter after trial",
                    "Higher chat / AI limits",
                    "Pro modules via feature flags",
                    "Priority support lane",
                    "Early access to new channels/modules as we ship",
                  ].map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-brand">+</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="mt-8 flex w-full items-center justify-center rounded-lg bg-brand py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-dim"
                >
                  Start free trial
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
                className="inline-flex items-center gap-1 font-medium text-zinc-900 hover:text-brand-dim"
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
