import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/marketing/AuthShell";
import { AuthDivider, GoogleButton } from "@/components/marketing/GoogleButton";

export const metadata: Metadata = { title: "Log in" };

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-brand";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Log in
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          Welcome back — log in to your InboxShelf.
        </p>

        <form className="mt-8 space-y-4" action="/">
          <label className="block">
            <span className="text-[13px] font-medium text-zinc-400">Email</span>
            <input
              type="email"
              name="email"
              defaultValue="owner@demo.inboxshelf.com"
              className={fieldClass}
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-zinc-400">
              Password
            </span>
            <input
              type="password"
              name="password"
              defaultValue="demo"
              className={fieldClass}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="btn-primary mt-2 w-full py-3 text-[14px]"
          >
            Continue
          </button>
        </form>

        <AuthDivider />
        <GoogleButton label="Continue with Google" />

        <p className="mt-6 text-center text-[13px] text-zinc-500">
          New here?{" "}
          <Link
            href="/signup"
            className="btn-link text-brand hover:text-brand-dim"
          >
            Start free trial
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
