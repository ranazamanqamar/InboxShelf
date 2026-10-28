"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  testAgentReply,
  watchAlerts,
  watchConversations,
  watchIntegrations,
  watchKnowledge,
} from "@/lib/dashboard/data";
import { firebaseErrorMessage, providerLabel } from "@/lib/dashboard/format";
import type { AlertItem, Conversation, Integration, KnowledgeDoc } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { PageTitle, Panel } from "./ui";

type TestTurn = { role: "you" | "agent"; text: string; status?: string };

export function AgentPage() {
  const { tenant } = useDashboard();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeDoc[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<TestTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    const stops = [
      watchConversations(tenant.id, setChats, () => undefined),
      watchKnowledge(tenant.id, setKnowledge, () => undefined),
      watchIntegrations(tenant.id, setIntegrations, () => undefined),
      watchAlerts(tenant.id, setAlerts, () => undefined),
    ];
    return () => stops.forEach((stop) => stop());
  }, [tenant]);

  const ready = knowledge.filter((item) => item.status === "ready");
  const channels = integrations.filter((item) =>
    ["whatsapp", "instagram", "messenger"].includes(item.id),
  );
  const aiOn = chats.filter((chat) => chat.mode === "ai_on").length;
  const paused = chats.filter((chat) => chat.mode !== "ai_on").length;

  async function runTest() {
    if (!tenant || !draft.trim() || busy) return;
    const question = draft.trim();
    setBusy(true);
    setError(null);
    setTurns((prev) => [...prev, { role: "you", text: question }]);
    setDraft("");
    try {
      const result = await testAgentReply(tenant.id, question);
      setTurns((prev) => [
        ...prev,
        { role: "agent", text: result.text, status: result.status },
      ]);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageTitle
        title="Agent"
        lede="This is the store agent, separate from your private Assistant. It answers customers only from the knowledge shelf."
      />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel className="p-5">
          <p className="text-[13px] text-zinc-500">Knowledge ready</p>
          <p className="mt-2 text-3xl font-semibold text-white">{ready.length}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-[13px] text-zinc-500">Chats on AI</p>
          <p className="mt-2 text-3xl font-semibold text-white">{aiOn}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-[13px] text-zinc-500">Paused for you</p>
          <p className="mt-2 text-3xl font-semibold text-white">{paused}</p>
        </Panel>
      </div>

      <Panel className="mt-4 p-5">
        <h2 className="text-[15px] font-semibold text-white">Test with FAQ</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Ask like a customer. Uses your ready knowledge and the live AI model — no WhatsApp
          webhook needed. {ready.length === 0 ? "Add a ready FAQ on Knowledge first." : null}
        </p>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3">
          {turns.length === 0 ? (
            <p className="text-[13px] text-zinc-500">No test messages yet.</p>
          ) : (
            turns.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={`rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  turn.role === "you"
                    ? "ml-8 bg-zinc-800 text-white"
                    : turn.status === "paused"
                      ? "mr-8 bg-amber-500/10 text-amber-100/90"
                      : "mr-8 bg-brand/10 text-brand"
                }`}
              >
                {turn.role === "agent" && turn.status && turn.status !== "replied" ? (
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide opacity-80">
                    {turn.status}
                  </span>
                ) : null}
                {turn.text}
              </div>
            ))
          )}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void runTest();
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={busy || ready.length === 0}
            placeholder={
              ready.length === 0
                ? "Add ready knowledge before testing"
                : "e.g. Do you ship to Lahore?"
            }
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white outline-none focus:border-brand disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || ready.length === 0 || !draft.trim()}
            className="btn-primary px-3 text-[13px]"
          >
            {busy ? "Thinking…" : "Ask"}
          </button>
        </form>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-[15px] font-semibold text-white">Channels it can use</h2>
          <ul className="mt-3 space-y-2">
            {["whatsapp", "instagram", "messenger"].map((id) => {
              const row = channels.find((item) => item.id === id);
              const on = row?.status === "connected";
              return (
                <li key={id} className="flex items-center justify-between text-[14px]">
                  <span>{providerLabel(id as Integration["id"])}</span>
                  <span className={on ? "text-brand" : "text-zinc-400"}>
                    {on ? "Connected" : "Off"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
            WhatsApp Connect uses Meta login for a Business Cloud number — it does not ask for your
            personal phone in a popup.
          </p>
          <Link href="/dashboard/integrations" className="mt-4 inline-block text-[13px] font-semibold text-brand">
            Connect a channel
          </Link>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-[15px] font-semibold text-white">Recent handovers</h2>
          {alerts.length === 0 ? (
            <p className="mt-3 text-[13px] text-zinc-500">None yet. A stuck question pauses that chat only.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <li key={alert.id} className="text-[14px] text-zinc-300">
                  {alert.reason}
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/knowledge" className="mt-4 inline-block text-[13px] font-semibold text-brand">
            Add knowledge
          </Link>
        </Panel>
      </div>
    </div>
  );
}
