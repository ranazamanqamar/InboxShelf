"use client";

import { useEffect, useState } from "react";
import { authedFetch, postAssistantTurn, watchAssistant, watchIntegrations, watchOrders } from "@/lib/dashboard/data";
import { formatMoney, orderStatusLabel } from "@/lib/dashboard/format";
import type { AssistantMessage, Integration, Order } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { PageTitle } from "./ui";

export function AssistantPage() {
  const { tenant } = useDashboard();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    const stops = [
      watchAssistant(tenant.id, setMessages, setError),
      watchOrders(tenant.id, setOrders, setError),
      watchIntegrations(tenant.id, setIntegrations, setError),
    ];
    return () => stops.forEach((stop) => stop());
  }, [tenant]);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!tenant || !draft.trim()) return;
    setPending(true);
    setError(null);
    const text = draft.trim();
    setDraft("");
    try {
      const local = localReply(text, orders, integrations);
      let answer = local.text;
      let intent = local.intent;
      if (!local.handled) {
        const response = await authedFetch("/api/assistant/reply", tenant.id, {
          method: "POST",
          body: JSON.stringify({ text }),
        });
        const body = (await response.json()) as {
          text?: string;
          intent?: string;
          error?: { message?: string };
        };
        answer = body.text || body.error?.message || local.text;
        intent = body.intent ?? local.intent;
      }
      await postAssistantTurn(tenant.id, text, answer, intent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant could not reply.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-3xl flex-col">
      <PageTitle
        title="Assistant"
        lede="Your private ops chat. It does not message customers. Ask about orders, mail, or what is on the knowledge shelf."
      />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-zinc-950">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <p className="text-[14px] text-zinc-500">
              Try “list my important emails today” or “how are orders looking?”
            </p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "owner" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[14px] leading-relaxed ${
                    message.role === "owner"
                      ? "bg-zinc-800 text-white"
                      : "bg-brand/10 text-brand"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))
          )}
        </div>
        <form
          className="flex gap-2 border-t border-white/10 p-3"
          onSubmit={ask}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about this store"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white outline-none focus:border-brand"
          />
          <button type="submit" disabled={pending} className="btn-primary px-3 text-[13px]">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function localReply(
  text: string,
  orders: Order[],
  integrations: Integration[],
): { text: string; intent: string; handled: boolean } {
  const q = text.toLowerCase();
  if (q.includes("email") || q.includes("mail")) {
    const gmail = integrations.find((item) => item.id === "gmail")?.status === "connected";
    const outlook = integrations.find((item) => item.id === "outlook")?.status === "connected";
    if (!gmail && !outlook) {
      return {
        handled: true,
        intent: "list_important_emails",
        text: "No mailbox is connected. Open Integrations and connect Gmail or Outlook, then ask again.",
      };
    }
    return {
      handled: true,
      intent: "list_important_emails",
      text: "Important mail is on the Email page. I don't mix it into customer chats.",
    };
  }
  if (q.includes("order")) {
    if (orders.length === 0) {
      return { handled: true, intent: "order_summary", text: "There are no orders on this store yet." };
    }
    const lines = orders.slice(0, 8).map(
      (order) =>
        `${order.customerName} — ${orderStatusLabel(order.status)} — ${formatMoney(order.total, order.currency)}`,
    );
    return { handled: true, intent: "order_summary", text: lines.join("\n") };
  }
  if (q.includes("pause") || q.includes("customer") || q.includes("message them")) {
    return {
      handled: true,
      intent: "pause_help",
      text: "I don't message customers from here. Open the inbox, pause that chat, and reply yourself.",
    };
  }
  if (q.includes("faq") || q.includes("knowledge")) {
    return {
      handled: true,
      intent: "knowledge_summary",
      text: "FAQs and PDFs live on the Knowledge page. The agent answers customers only from those.",
    };
  }
  return {
    handled: false,
    intent: "fallback",
    text: "I can list important mail, summarize orders, or point you at the knowledge shelf.",
  };
}
