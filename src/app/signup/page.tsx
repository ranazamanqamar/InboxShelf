import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/marketing/AuthShell";

export const metadata: Metadata = { title: "Sign up" };

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-brand";

export default function SignupPage() {
  return (
    <AuthShell mode="signup">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Start free trial
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          14 days free · stub auth for MVP. No card required.
        </p>

        <form className="mt-8 space-y-4" action="/">
          <label className="block">
            <span className="text-[13px] font-medium text-zinc-400">
              Store name
            </span>
            <input
              type="text"
              name="store"
              defaultValue="North & Co."
              className={fieldClass}
              autoComplete="organization"
            />
          </label>
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
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-brand py-3 text-[14px] font-semibold text-black transition-colors hover:bg-brand-dim"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand transition-colors hover:text-brand-dim"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
