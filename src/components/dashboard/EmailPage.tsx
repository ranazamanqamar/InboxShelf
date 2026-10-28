"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authedFetch, watchIntegrations } from "@/lib/dashboard/data";
import { providerLabel } from "@/lib/dashboard/format";
import type { Integration } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { Empty, PageTitle, Panel } from "./ui";

type MailItem = { id: string; from: string; subject: string; date: string; provider: string };

export function EmailPage() {
  const { tenant } = useDashboard();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [mail, setMail] = useState<MailItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    return watchIntegrations(tenant.id, setIntegrations, setError);
  }, [tenant]);

  const gmail = integrations.find((item) => item.id === "gmail")?.status === "connected";
  const outlook = integrations.find((item) => item.id === "outlook")?.status === "connected";

  async function load() {
    if (!tenant) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authedFetch("/api/email/important", tenant.id);
      const body = (await response.json()) as {
        messages?: MailItem[];
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(body.error?.message || "Could not load mail.");
      setMail(body.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load mail.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (gmail || outlook) void load();
    // load closes over tenant; reconnect when the store changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id, gmail, outlook]);

  return (
    <div>
      <PageTitle
        title="Email"
        lede="Important mail from Gmail and Outlook. Connect a mailbox before anything can be listed."
      />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      <Panel>
        {!gmail && !outlook ? (
          <Empty
            title="No mailbox connected"
            body="Connect Gmail or Outlook on Integrations. Until the server has those keys, Connect explains exactly what is missing."
          />
        ) : mail.length === 0 ? (
          <Empty
            title={loading ? "Loading mail…" : "No important mail"}
            body="Important Gmail and high-importance Outlook messages show up here."
          />
        ) : (
          <ul className="divide-y divide-white/10">
            {mail.map((item) => (
              <li key={`${item.provider}-${item.id}`} className="px-5 py-4">
                <p className="text-[14px] font-medium">{item.subject}</p>
                <p className="mt-1 text-[12px] text-zinc-500">
                  {providerLabel(item.provider === "outlook" ? "outlook" : "gmail")} · {item.from} ·{" "}
                  {item.date}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-white/10 px-5 py-3">
          <Link href="/dashboard/integrations" className="text-[13px] font-semibold text-brand">
            Manage connections
          </Link>
        </div>
      </Panel>
    </div>
  );
}
