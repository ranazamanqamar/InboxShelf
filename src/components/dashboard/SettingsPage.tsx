"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch, logOut, updateStore } from "@/lib/dashboard/data";
import { firebaseErrorMessage, trialDaysLeft } from "@/lib/dashboard/format";
import { useDashboard } from "./dashboard-context";
import { PageTitle, Panel } from "./ui";

export function SettingsPage() {
  const { tenant, profile } = useDashboard();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(tenant?.name ?? "");
  const [shopUrl, setShopUrl] = useState(tenant?.shopUrl ?? "");
  const [orderLink, setOrderLink] = useState(tenant?.orderLink ?? "");
  const [currency, setCurrency] = useState(tenant?.currency ?? "USD");
  const [timezone, setTimezone] = useState(tenant?.timezone ?? "UTC");
  const [platform, setPlatform] = useState("");

  const days = tenant ? trialDaysLeft(tenant.trialEndsAt) : null;
  const filled = useRef(false);

  useEffect(() => {
    if (!tenant || filled.current) return;
    filled.current = true;
    setName(tenant.name);
    setShopUrl(tenant.shopUrl ?? "");
    setOrderLink(tenant.orderLink ?? "");
    setCurrency(tenant.currency);
    setTimezone(tenant.timezone);
    setPlatform(tenant.storePlatform ?? "");
  }, [tenant]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!tenant) return;
    setPending(true);
    setSaved(false);
    setError(null);
    try {
      await updateStore(tenant.id, {
        name: name.trim(),
        shopUrl: shopUrl.trim() || null,
        orderLink: orderLink.trim() || null,
        currency: currency.trim() || "USD",
        timezone: timezone.trim() || "UTC",
        storePlatform: platform === "shopify" || platform === "website" ? platform : null,
      });
      setSaved(true);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function upgrade() {
    if (!tenant) return;
    setError(null);
    try {
      const response = await authedFetch("/api/billing/checkout", tenant.id, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const body = (await response.json()) as { url?: string; error?: { message?: string } };
      if (!response.ok || !body.url) {
        throw new Error(body.error?.message || "Checkout did not open.");
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout did not open.");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageTitle title="Settings" lede="This store’s profile, your login, and Pro." />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      {saved ? <p className="mb-3 text-[13px] text-brand">Saved.</p> : null}
      <Panel className="p-5">
        <h2 className="text-[15px] font-semibold text-white">Store</h2>
        <form className="mt-4 space-y-3" onSubmit={save}>
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Shop URL" value={shopUrl} onChange={setShopUrl} placeholder="https://" />
          <Field label="Order link" value={orderLink} onChange={setOrderLink} placeholder="https://…/order" />
          <Field label="Currency" value={currency} onChange={setCurrency} />
          <Field label="Timezone" value={timezone} onChange={setTimezone} />
          <label className="block text-[13px] font-medium text-zinc-400">
            Platform
            <select
              value={platform ?? ""}
              onChange={(event) => setPlatform(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white"
            >
              <option value="">Not set</option>
              <option value="shopify">Shopify</option>
              <option value="website">Website</option>
            </select>
          </label>
          <button type="submit" disabled={pending} className="btn-primary px-4 py-2 text-[13px]">
            Save store
          </button>
        </form>
      </Panel>

      <Panel className="mt-4 p-5">
        <h2 className="text-[15px] font-semibold text-white">Upgrade</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
          {tenant?.plan === "pro" && tenant.subscriptionStatus === "active"
            ? "This store is on Pro."
            : `Starter trial${days == null ? "" : `, ${days} days left`}. Pro is $10 a month for this store.`}
        </p>
        <button type="button" onClick={upgrade} className="btn-primary mt-4 px-4 py-2 text-[13px]">
          Upgrade to Pro
        </button>
      </Panel>

      <Panel className="mt-4 p-5">
        <h2 className="text-[15px] font-semibold text-white">Account</h2>
        <p className="mt-2 text-[14px] text-zinc-400">{profile?.email}</p>
        <button
          type="button"
          className="btn-quiet mt-4 px-4 py-2 text-[13px]"
          onClick={async () => {
            await logOut();
            router.replace("/login");
          }}
        >
          Log out
        </button>
      </Panel>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-[13px] font-medium text-zinc-400">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[14px] font-normal text-white outline-none focus:border-brand"
      />
    </label>
  );
}
