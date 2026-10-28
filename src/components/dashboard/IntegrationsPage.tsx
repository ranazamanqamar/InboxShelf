"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { launchWhatsAppEmbeddedSignup } from "@/lib/client/meta-embedded-signup";
import { authedFetch, watchIntegrations } from "@/lib/dashboard/data";
import { firebaseErrorMessage, providerBlurb, providerLabel } from "@/lib/dashboard/format";
import { PROVIDERS, type CredentialFlags, type Integration, type Provider } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { PageTitle, Panel } from "./ui";

export function IntegrationsPage() {
  const { tenant } = useDashboard();
  const params = useSearchParams();
  const [rows, setRows] = useState<Integration[]>([]);
  const [flags, setFlags] = useState<CredentialFlags | null>(null);
  const [shop, setShop] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    return watchIntegrations(tenant.id, setRows, setError);
  }, [tenant]);

  useEffect(() => {
    void fetch("/api/status")
      .then((response) => response.json())
      .then((body) => setFlags(body as CredentialFlags))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const connected = params.get("connected");
    const failed = params.get("error");
    if (connected) setNotice(`${providerLabel(connected as Provider)} is connected.`);
    if (failed) setError(failed);
  }, [params]);

  const byId = new Map(rows.map((row) => [row.id, row]));

  async function connectWhatsAppEmbedded() {
    if (!tenant) return;
    setError(null);
    setNotice(null);
    setPending("whatsapp");
    try {
      const configRes = await fetch("/api/integrations/whatsapp/embedded");
      const config = (await configRes.json()) as {
        appId?: string;
        configId?: string;
        ready?: boolean;
        error?: { message?: string };
      };
      if (!config.ready || !config.appId || !config.configId) {
        throw new Error("WhatsApp Connect is not available yet. Try again later or contact support.");
      }
      const signup = await launchWhatsAppEmbeddedSignup({
        appId: config.appId,
        configId: config.configId,
      });
      const response = await authedFetch("/api/integrations/whatsapp/embedded", tenant.id, {
        method: "POST",
        body: JSON.stringify({
          code: signup.code,
          phoneNumberId: signup.phoneNumberId,
          wabaId: signup.wabaId,
        }),
      });
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message || "Could not connect WhatsApp.");
      setNotice("WhatsApp is connected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect WhatsApp.");
    } finally {
      setPending(null);
    }
  }

  async function connect(provider: Provider) {
    if (!tenant) return;
    if (provider === "whatsapp") {
      await connectWhatsAppEmbedded();
      return;
    }
    setError(null);
    setNotice(null);
    setPending(provider);
    try {
      if (provider === "shopify" && !shop.trim()) {
        throw new Error("Enter your shop domain, like north-co.myshopify.com.");
      }
      const response = await authedFetch(`/api/integrations/${provider}/connect`, tenant.id, {
        method: "POST",
        body: JSON.stringify({ shop }),
      });
      const body = (await response.json()) as {
        url?: string;
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(body.error?.message || "Could not connect.");
      if (body.url) {
        window.location.href = body.url;
        return;
      }
      setNotice(`${providerLabel(provider)} is connected.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : firebaseErrorMessage(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <PageTitle
        title="Integrations"
        lede="Click Connect. Meta (or Shopify/Google) opens so you can approve — then you return here Connected. You never upload an ID or do Meta Business Verification for InboxShelf."
      />
      {flags && !flags.firebaseAdmin ? (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-100/90">
          Channel Connect is temporarily unavailable. Try again later or contact support.
        </p>
      ) : null}
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      {notice ? <p className="mb-3 text-[13px] text-brand">{notice}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const row = byId.get(provider);
          const connected = row?.status === "connected";
          const blockedWhatsApp = provider === "whatsapp" && flags && !flags.metaEmbeddedSignup;
          const blockedShopify = provider === "shopify" && flags && !flags.shopify;
          const linkedGoogleEmail =
            connected &&
            (provider === "gmail" || provider === "google_sheets") &&
            row?.displayName &&
            row.displayName.includes("@")
              ? row.displayName
              : null;
          return (
            <Panel key={provider} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-white">{providerLabel(provider)}</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
                    {providerBlurb(provider)}
                  </p>
                  {linkedGoogleEmail ? (
                    <p className="mt-2 text-[12px] text-zinc-300">Linked · {linkedGoogleEmail}</p>
                  ) : null}
                  {blockedWhatsApp || blockedShopify ? (
                    <p className="mt-2 text-[12px] text-amber-200/90">
                      Connect is temporarily unavailable for this channel.
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                    connected ? "bg-brand/10 text-brand" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {connected ? "Connected" : "Off"}
                </span>
              </div>
              {provider === "shopify" ? (
                <input
                  value={shop}
                  onChange={(event) => setShop(event.target.value)}
                  placeholder="north-co.myshopify.com"
                  className="mt-3 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none focus:border-brand"
                />
              ) : null}
              <button
                type="button"
                disabled={pending === provider || Boolean(blockedWhatsApp) || Boolean(blockedShopify)}
                onClick={() => void connect(provider)}
                className="btn-primary mt-4 px-3 py-2 text-[13px]"
              >
                {pending === provider
                  ? "Connecting…"
                  : connected
                    ? "Reconnect"
                    : "Connect"}
              </button>
            </Panel>
          );
        })}
      </div>

      <Panel className="mt-4 p-5">
        <h2 className="text-[15px] font-semibold text-white">How Connect works</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          You only connect your own channels. You do not verify a business for InboxShelf and you do not type
          WhatsApp or Instagram passwords into this page.
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-zinc-400">
          <li>
            <strong className="text-zinc-200">WhatsApp:</strong> Connect → Meta window → business phone → code from
            Meta on that phone → Connected.
          </li>
          <li>
            <strong className="text-zinc-200">Instagram:</strong> Connect → Meta login → pick the Facebook Page that
            already has your Instagram Business account linked.
          </li>
          <li>
            <strong className="text-zinc-200">Messenger:</strong> Connect → Meta login → pick your Facebook Page →
            Connected.
          </li>
        </ul>
      </Panel>

      <Panel className="mt-4 p-5">
        <h2 className="text-[15px] font-semibold text-white">Before Instagram Connect</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Link your Instagram Business account to your Facebook Page once (Meta Business Suite or Instagram settings).
          Then click Connect here and pick that same Page in Meta.
        </p>
      </Panel>
    </div>
  );
}
