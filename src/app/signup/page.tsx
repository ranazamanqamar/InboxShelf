import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/marketing/AuthShell";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <AuthShell mode="signup">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Start free trial
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          14 days free · no card required.
        </p>

        <SignupForm />

        <p className="mt-6 text-center text-[13px] text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="btn-link text-brand hover:text-brand-dim"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
