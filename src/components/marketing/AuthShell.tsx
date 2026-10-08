import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

type AuthShellProps = {
  mode: "login" | "signup";
  children: ReactNode;
};

export function AuthShell({ mode, children }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]"
        aria-hidden
      />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <BrandLogo tone="onDark" size="md" />

        {isLogin ? (
          <Link
            href="/signup"
            className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-brand-dim"
          >
            Start free trial
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-white/15 px-3.5 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
          >
            Log in
          </Link>
        )}
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col px-5 pb-16 pt-8 sm:px-8 sm:pt-14">
        {children}
      </main>
    </div>
  );
}
