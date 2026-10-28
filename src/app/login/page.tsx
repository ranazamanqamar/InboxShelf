import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/marketing/AuthShell";

export const metadata: Metadata = { title: "Log in" };

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

        <LoginForm />

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
