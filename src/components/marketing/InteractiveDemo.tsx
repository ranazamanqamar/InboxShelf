"use client";

import { useMemo, useState } from "react";
import { Reveal } from "./Reveal";

type Channel = "whatsapp" | "instagram" | "messenger" | "web";
type Mode = "ai_on" | "paused";

type Message = {
  id: string;
  role: "customer" | "ai" | "system";
  text: string;
};

type Conversation = {
  id: string;
  name: string;
  channel: Channel;
  preview: string;
  mode: Mode;
  messages: Message[];
};

const CHANNELS: { id: Channel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "messenger", label: "Messenger" },
  { id: "web", label: "Web" },
];

const INITIAL: Conversation[] = [
  {
    id: "c1",
    name: "Ayesha Khan",
    channel: "whatsapp",
    preview: "Do you ship to Lahore this week?",
    mode: "ai_on",
    messages: [
      {
        id: "m1",
        role: "customer",
        text: "Do you ship to Lahore this week?",
      },
      {
        id: "m2",
        role: "ai",
        text: "Yes — we deliver to Lahore in 2–3 business days. Want the site order link?",
      },
    ],
  },
  {
    id: "c2",
    name: "Omar R.",
    channel: "instagram",
    preview: "Same order again, please",
    mode: "ai_on",
    messages: [
      {
        id: "m3",
        role: "customer",
        text: "Same order again, please — blue tee M.",
      },
      {
        id: "m4",
        role: "ai",
        text: "Got it. Here’s your order link to confirm size and location on the site.",
      },
    ],
  },
  {
    id: "c3",
    name: "Priya S.",
    channel: "web",
    preview: "Can I return after 30 days?",
    mode: "paused",
    messages: [
      {
        id: "m5",
        role: "customer",
        text: "Can I return after 30 days? Your FAQ only mentions 14.",
      },
      {
        id: "m6",
        role: "ai",
        text: "I’m not sure from your knowledge base — pausing for the shop owner.",
      },
      {
        id: "m7",
        role: "system",
        text: "Human handover · owner notified on WhatsApp",
      },
    ],
  },
  {
    id: "c4",
    name: "James Lee",
    channel: "messenger",
    preview: "Order #1042 status?",
    mode: "ai_on",
    messages: [
      {
        id: "m8",
        role: "customer",
        text: "What’s the status on order #1042?",
      },
      {
        id: "m9",
        role: "ai",
        text: "Order #1042 is packed and marked to deliver — you’ll get a WhatsApp when it’s on the way.",
      },
    ],
  },
];

const channelShort: Record<Channel, string> = {
  whatsapp: "WA",
  instagram: "IG",
  messenger: "Msg",
  web: "Web",
};

export function InteractiveDemo() {
  const [items, setItems] = useState(INITIAL);
  const [filter, setFilter] = useState<Channel | "all">("all");
  const [activeId, setActiveId] = useState(INITIAL[0].id);

  const filtered = useMemo(
    () =>
      filter === "all" ? items : items.filter((c) => c.channel === filter),
    [items, filter],
  );

  const active =
    filtered.find((c) => c.id === activeId) ?? filtered[0] ?? items[0];

  function setMode(mode: Mode) {
    if (!active) return;
    setItems((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, mode } : c)),
    );
  }

  function selectConversation(id: string) {
    setActiveId(id);
  }

  return (
    <section
      id="demo"
      className="scroll-mt-24 bg-slate-50/80 py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Interactive preview
            </p>
            <h2
              className="mt-3 text-[clamp(1.75rem,3vw,2.35rem)] font-normal tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Try the live inbox workflow
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              Filter channels, open a conversation, and toggle AI ON or Paused —
              same handover pattern your team will use every day.
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={80}>
          <div className="mx-auto mt-10 flex flex-wrap justify-center gap-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setFilter(ch.id);
                  const next =
                    ch.id === "all"
                      ? items
                      : items.filter((c) => c.channel === ch.id);
                  if (next[0]) setActiveId(next[0].id);
                }}
                className={`rounded-lg border px-3.5 py-2 text-[13px] font-semibold tracking-tight transition-all ${
                  filter === ch.id
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200/90 bg-white text-slate-700 shadow-sm hover:shadow-md"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <div className="mx-auto mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="grid min-h-[420px] md:grid-cols-[280px_1fr]">
              {/* List */}
              <div className="border-b border-slate-200/90 md:border-b-0 md:border-r">
                <div className="border-b border-slate-200/90 px-5 py-4">
                  <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                    Unified Inbox
                  </p>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Mock data · click a chat
                  </p>
                </div>
                <ul className="max-h-[360px] overflow-auto">
                  {filtered.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectConversation(c.id)}
                        className={`flex w-full flex-col gap-1 border-b border-slate-200/90 px-5 py-4 text-left transition ${
                          active?.id === c.id
                            ? "bg-slate-50/80"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-semibold tracking-tight text-slate-900">
                            {c.name}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {channelShort[c.channel]}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          {c.mode === "ai_on" ? "AI ON" : "Paused"}
                        </span>
                        <span className="truncate text-[13px] text-slate-600">
                          {c.preview}
                        </span>
                      </button>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <li className="px-5 py-8 text-[13px] text-slate-500">
                      No chats in this channel.
                    </li>
                  )}
                </ul>
              </div>

              {/* Thread */}
              <div className="flex flex-col">
                {active ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 px-5 py-4">
                      <div>
                        <p className="text-[15px] font-semibold tracking-tight text-slate-900">
                          {active.name}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {CHANNELS.find((c) => c.id === active.channel)?.label}{" "}
                          ·{" "}
                          {active.mode === "ai_on"
                            ? "AI replying from knowledge"
                            : "Human takeover"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setMode("ai_on")}
                          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold tracking-tight transition ${
                            active.mode === "ai_on"
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          AI ON
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode("paused")}
                          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold tracking-tight transition ${
                            active.mode === "paused"
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Paused
                        </button>
                      </div>
                    </div>

                    {active.mode === "paused" && (
                      <div className="border-b border-amber-200/80 bg-amber-50 px-5 py-2.5 text-[13px] text-amber-900">
                        Auto-reply paused for this chat only. Owner alerted —
                        other conversations keep running.
                      </div>
                    )}

                    <div className="flex-1 space-y-3 overflow-auto px-5 py-5">
                      {active.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                            m.role === "customer"
                              ? "bg-slate-100 text-slate-800"
                              : m.role === "system"
                                ? "border border-slate-200/90 bg-slate-50/80 text-slate-600"
                                : "ml-auto bg-slate-900 text-white"
                          }`}
                        >
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">
                            {m.role === "customer"
                              ? "Customer"
                              : m.role === "ai"
                                ? "AI"
                                : "System"}
                          </p>
                          {m.text}
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200/90 bg-slate-50/80 px-5 py-3 text-[12px] font-medium text-slate-500">
                      Orders → Google Sheets · location synced · WhatsApp confirm
                      · Assistant for owner ops
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center p-8 text-[14px] text-slate-500">
                    Select a conversation
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
