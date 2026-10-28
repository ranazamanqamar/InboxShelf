import Link from "next/link";
import { Atmosphere } from "./Atmosphere";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950">
      <Atmosphere />
      {/* Soft fade into light sections below */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-b from-transparent to-white"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-slate-200 shadow-sm backdrop-blur-sm">
            <span aria-hidden>✨</span>
            The All-in-One AI Command Center for E-Commerce
          </p>
          <h1
            className="mt-6 text-[clamp(2.25rem,5vw,3.5rem)] font-normal leading-[1.1] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Every customer chat and order on one shelf.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-slate-300">
            Stop drowning in scattered messages. Unify WhatsApp, Instagram,
            and Messenger into one AI inbox that answers customer
            questions, sends order links, and auto-syncs orders into Google Sheets.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-white px-5 py-3 text-[15px] font-semibold tracking-tight text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Start 14-Day Free Trial
            </Link>
            <a
              href="#demo"
              className="rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-[15px] font-semibold tracking-tight text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/10"
            >
              View Live Demo
            </a>
          </div>
          <p className="mt-4 text-[13px] text-slate-400">
            Interactive inbox below — filter channels and toggle AI ON / Paused.
          </p>
        </div>
      </div>
    </section>
  );
}
