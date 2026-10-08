"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-[17px] font-semibold tracking-tight text-slate-900">
          InboxShelf
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-slate-600 transition hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-[14px] font-medium text-slate-600 transition hover:text-slate-900"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-slate-900 px-4 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Start Free Trial
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200/80 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[14px] font-medium text-slate-700"
              >
                {l.label}
              </a>
            ))}
            <Link href="/login" className="text-[14px] font-medium text-slate-700">
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-[14px] font-semibold text-white"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
