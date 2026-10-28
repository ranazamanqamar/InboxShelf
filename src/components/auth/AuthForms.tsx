"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthDivider, GoogleButton } from "@/components/marketing/GoogleButton";
import { firebaseErrorMessage } from "@/lib/dashboard/format";
import {
  resolveAuthPageBoot,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/dashboard/data";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-brand";

function useAuthPageBoot(
  mode: "login" | "signup",
  router: ReturnType<typeof useRouter>,
) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resolveAuthPageBoot(mode)
      .then((result) => {
        if (cancelled) return;
        if (result === "go-dashboard") router.replace("/dashboard");
        else setPending(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(firebaseErrorMessage(err));
        setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, router]);

  return {
    redirectError: error,
    redirectPending: pending,
    clearRedirectError: () => setError(null),
  };
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { redirectError, redirectPending, clearRedirectError } = useAuthPageBoot(
    "login",
    router,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formPending, setFormPending] = useState(false);

  const error = formError ?? redirectError;
  const pending = formPending || redirectPending;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormPending(true);
    setFormError(null);
    clearRedirectError();
    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (err) {
      setFormError(firebaseErrorMessage(err));
      setFormPending(false);
    }
  }

  async function google() {
    setFormPending(true);
    setFormError(null);
    clearRedirectError();
    try {
      const result = await signInWithGoogle();
      if (result === "signed-in") router.push("/dashboard");
    } catch (err) {
      setFormError(firebaseErrorMessage(err));
      setFormPending(false);
    }
  }

  return (
    <>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-400">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            autoComplete="email"
            placeholder="you@store.com"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-400">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
            autoComplete="current-password"
            placeholder="At least 6 characters"
          />
        </label>
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <button type="submit" disabled={pending} className="btn-primary mt-2 w-full py-3 text-[14px]">
          {pending ? "Continuing…" : "Continue"}
        </button>
      </form>
      <AuthDivider />
      <GoogleButton label="Continue with Google" onClick={google} disabled={pending} />
    </>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { redirectError, redirectPending, clearRedirectError } = useAuthPageBoot(
    "signup",
    router,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formPending, setFormPending] = useState(false);

  const error = formError ?? redirectError;
  const pending = formPending || redirectPending;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormPending(true);
    setFormError(null);
    clearRedirectError();
    try {
      await signUpWithEmail({ storeName, email, password });
      router.push("/dashboard");
    } catch (err) {
      setFormError(firebaseErrorMessage(err));
      setFormPending(false);
    }
  }

  async function google() {
    if (!storeName.trim()) {
      setFormError("Name the store before continuing with Google.");
      return;
    }
    setFormPending(true);
    setFormError(null);
    clearRedirectError();
    try {
      const result = await signInWithGoogle(storeName);
      if (result === "signed-in") router.push("/dashboard");
    } catch (err) {
      setFormError(firebaseErrorMessage(err));
      setFormPending(false);
    }
  }

  return (
    <>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-400">Store name</span>
          <input
            type="text"
            required
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            className={fieldClass}
            autoComplete="organization"
            placeholder="North & Co."
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-400">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            autoComplete="email"
            placeholder="you@store.com"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-400">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </label>
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <button type="submit" disabled={pending} className="btn-primary mt-2 w-full py-3 text-[14px]">
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      <AuthDivider />
      <GoogleButton label="Sign up with Google" onClick={google} disabled={pending} />
    </>
  );
}
