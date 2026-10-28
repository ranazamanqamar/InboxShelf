"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Plug,
  Settings,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import {
  clearGoogleRedirectMarkers,
  logOut,
  watchAuth,
  watchProfile,
  watchTenant,
} from "@/lib/dashboard/data";
import { isStoreLocked, trialDaysLeft } from "@/lib/dashboard/format";
import type { OwnerProfile, Tenant } from "@/lib/dashboard/types";
import { getClientAuth } from "@/lib/firebase/client";
import { DashboardContext } from "./dashboard-context";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/email", label: "Email", icon: Mail },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/agent", label: "Agent", icon: Bot },
  { href: "/dashboard/assistant", label: "Assistant", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<OwnerProfile | null | undefined>(undefined);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stop = () => {};
    let cancelled = false;
    void getClientAuth()
      .authStateReady()
      .then(() => {
        if (cancelled) return;
        stop = watchAuth((user) => {
          setUid(user?.uid ?? null);
          setEmail(user?.email ?? null);
          setReady(true);
          if (!user) setProfile(null);
        });
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  useEffect(() => {
    if (!uid) return;
    setProfile(undefined);
    const timer = window.setTimeout(() => {
      setError(
        "This Firebase project has no Firestore database named (default). Create it in the Firebase console, then deploy firestore.rules.",
      );
      setProfile(null);
    }, 12000);
    const stop = watchProfile(
      uid,
      (next) => {
        window.clearTimeout(timer);
        setProfile(next);
      },
      (message) => {
        window.clearTimeout(timer);
        setError(message);
        setProfile(null);
      },
    );
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, [uid]);

  useEffect(() => {
    if (!profile?.activeTenantId) {
      setTenant(null);
      return;
    }
    return watchTenant(profile.activeTenantId, setTenant, setError);
  }, [profile?.activeTenantId]);

  useEffect(() => {
    // Only bounce after auth has settled — avoids null→user flicker kicking to /login.
    if (ready && !uid) router.replace("/login");
  }, [ready, uid, router]);

  useEffect(() => {
    // Drop Strict Mode redirect markers once a session is confirmed on the shelf.
    if (ready && uid) clearGoogleRedirectMarkers();
  }, [ready, uid]);

  const locked = tenant ? isStoreLocked(tenant) : false;
  const days = tenant ? trialDaysLeft(tenant.trialEndsAt) : null;
  const showPaywall = locked && pathname !== "/dashboard/settings";

  async function onLogOut() {
    await logOut();
    router.replace("/login");
  }

  return (
    <DashboardContext.Provider value={{ profile: profile ?? null, tenant, error, locked }}>
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="flex min-h-screen">
          <aside
            className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-white/10 bg-black transition-transform md:static md:translate-x-0`}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <BrandLogo tone="onDark" size="sm" href="/dashboard" />
              <button
                type="button"
                className="rounded-lg p-1 text-zinc-500 md:hidden"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 px-3">
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium ${
                      active
                        ? "bg-brand/10 text-brand"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="space-y-3 border-t border-white/10 p-4">
              {tenant?.subscriptionStatus === "trialing" && days != null ? (
                <p className="text-[12px] text-zinc-500">
                  Trial · {days} day{days === 1 ? "" : "s"} left
                </p>
              ) : null}
              <Link href="/dashboard/settings" className="btn-primary w-full px-3 py-2 text-[13px]">
                Upgrade
              </Link>
              <button
                type="button"
                onClick={onLogOut}
                className="flex w-full items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-white"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </aside>

          {open ? (
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-20 bg-zinc-900/30 md:hidden"
              onClick={() => setOpen(false)}
            />
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-white/10 bg-black px-4 py-3 md:px-6">
              <button
                type="button"
                className="rounded-lg p-1.5 text-zinc-400 md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <p className="truncate text-[14px] font-semibold text-white">
                {tenant?.name ?? "InboxShelf"}
              </p>
              <p className="hidden text-[12px] text-zinc-500 sm:block">{email}</p>
            </header>
            <main className="flex-1 px-4 py-6 md:px-8">
              {!ready || (uid && profile === undefined && !error) ? (
                <p className="mb-4 text-[14px] text-zinc-500">Opening your shelf…</p>
              ) : null}
              {error ? (
                <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
                  {error}
                </p>
              ) : null}
              {ready && uid && profile === null && !error ? (
                <p className="mb-4 max-w-lg text-[14px] leading-relaxed text-zinc-400">
                  You are signed in, but this account does not have a store yet.
                </p>
              ) : null}
              {showPaywall ? <Paywall daysEnded /> : children}
            </main>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

function Paywall({ daysEnded }: { daysEnded: boolean }) {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-8">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-100/90">
        Trial ended
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
        Upgrade to keep this store open
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
        {daysEnded
          ? "The 14-day trial is over. Pro is $10 a month for this store. Chats, orders, and the agent stay paused until you upgrade."
          : "This store is locked until Pro is active."}
      </p>
      <Link href="/dashboard/settings" className="btn-primary mt-6 px-4 py-2.5 text-[14px]">
        Upgrade to Pro
      </Link>
    </section>
  );
}
