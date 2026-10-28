"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearConversation,
  markConversationRead,
  sendHumanReply,
  setConversationMode,
  watchConversations,
  watchMessages,
  watchOrders,
} from "@/lib/dashboard/data";
import {
  channelLabel,
  firebaseErrorMessage,
  formatWhen,
  modeLabel,
} from "@/lib/dashboard/format";
import type { Conversation, ConversationMode, ChatMessage, Order } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { PageTitle } from "./ui";

export function InboxPage() {
  const { tenant } = useDashboard();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<"all" | "needs" | "ai">("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    const stopChats = watchConversations(tenant.id, setChats, setError);
    const stopOrders = watchOrders(tenant.id, setOrders, setError);
    return () => {
      stopChats();
      stopOrders();
    };
  }, [tenant]);

  const visible = useMemo(() => {
    return chats.filter((chat) => {
      if (filter === "needs" && chat.mode === "ai_on") return false;
      if (filter === "ai" && chat.mode !== "ai_on") return false;
      const haystack = `${chat.customerName ?? ""} ${chat.lastMessagePreview}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [chats, filter, search]);

  const selected = chats.find((chat) => chat.id === selectedId) ?? visible[0] ?? null;

  const activeId = selected?.id ?? null;

  useEffect(() => {
    if (!tenant || !activeId) return;
    return watchMessages(tenant.id, activeId, setMessages, setError);
  }, [tenant, activeId]);

  useEffect(() => {
    if (!tenant || !activeId) return;
    const chat = chats.find((item) => item.id === activeId);
    if (!chat || chat.unreadCount === 0) return;
    void markConversationRead(tenant.id, activeId).catch(() => undefined);
  }, [tenant, activeId, chats]);

  const linkedOrder = orders.find((order) => order.conversationId === selected?.id) ?? null;
  const canSend = selected != null && selected.mode !== "ai_on";

  async function send() {
    if (!tenant || !selected || !canSend) return;
    setSending(true);
    setError(null);
    try {
      await sendHumanReply(tenant.id, selected, draft);
      setDraft("");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function changeMode(mode: ConversationMode) {
    if (!tenant || !selected) return;
    try {
      await setConversationMode(tenant.id, selected.id, mode);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    }
  }

  async function clearChat() {
    if (!tenant || !selected) return;
    if (!window.confirm("Clear all messages in this chat? This cannot be undone.")) return;
    setClearing(true);
    setError(null);
    try {
      await clearConversation(tenant.id, selected.id);
      setMessages([]);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      <PageTitle
        title="Inbox"
        lede="Every customer chat. You can type when a chat is paused. While AI is on, the agent replies."
      />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
        <div className="flex min-h-0 flex-col border-b border-white/10 lg:border-r lg:border-b-0">
          <div className="space-y-2 border-b border-white/10 p-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none focus:border-brand"
            />
            <div className="flex gap-1">
              {(
                [
                  ["all", "All"],
                  ["needs", "Needs you"],
                  ["ai", "AI on"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`rounded-md px-2 py-1 text-[12px] font-medium ${
                    filter === id ? "bg-brand/10 text-brand" : "text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {visible.length === 0 ? (
              <li className="px-4 py-8 text-[13px] text-zinc-500">No chats in this view.</li>
            ) : (
              visible.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(chat.id)}
                    className={`w-full px-4 py-3 text-left ${
                      selected?.id === chat.id ? "bg-brand/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[14px] font-medium">
                        {chat.customerName || "Customer"}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {formatWhen(chat.lastMessageAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-zinc-500">
                      {channelLabel(chat.channel)} · {chat.lastMessagePreview}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex min-h-0 flex-col">
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-white">{selected.customerName || "Customer"}</p>
                  <p className="text-[12px] text-zinc-500">
                    {channelLabel(selected.channel)} · {modeLabel(selected.mode)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={clearing}
                    onClick={() => void clearChat()}
                    className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[12px] font-medium text-zinc-300 hover:bg-white/5 disabled:opacity-50"
                  >
                    {clearing ? "Clearing…" : "Clear chat"}
                  </button>
                  <select
                    value={selected.mode}
                    onChange={(event) => changeMode(event.target.value as ConversationMode)}
                    className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[12px] text-white"
                  >
                    <option value="ai_on">AI on</option>
                    <option value="paused">Paused</option>
                    <option value="human_takeover">You are replying</option>
                  </select>
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((message) => (
                  <Bubble key={message.id} message={message} />
                ))}
              </div>
              <form
                className="flex gap-2 border-t border-white/10 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  disabled={!canSend || sending}
                  placeholder={
                    canSend ? "Write a reply" : "AI is replying. Pause the chat to type."
                  }
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white outline-none focus:border-brand disabled:bg-white/5 disabled:text-zinc-500"
                />
                <button type="submit" disabled={!canSend || sending} className="btn-primary px-3 text-[13px]">
                  Send
                </button>
              </form>
            </>
          ) : (
            <p className="px-4 py-10 text-[14px] text-zinc-500">Pick a chat, or connect a channel.</p>
          )}
        </div>

        <aside className="hidden min-h-0 overflow-y-auto border-l border-white/10 lg:block">
          {selected ? (
            <div className="space-y-4 p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-400">
                Customer
              </h2>
              <Field label="Name" value={selected.customerName || "Unknown"} />
              <Field label="Phone" value={selected.customerPhone || "Not shared"} />
              <Field label="Handle" value={selected.customerHandle || "—"} />
              <Field label="Channel" value={channelLabel(selected.channel)} />
              <h2 className="pt-2 text-[13px] font-semibold uppercase tracking-wide text-zinc-400">
                Order
              </h2>
              {linkedOrder ? (
                <>
                  <Field label="Status" value={linkedOrder.status.replaceAll("_", " ")} />
                  <Field label="Location" value={linkedOrder.location || "—"} />
                </>
              ) : (
                <p className="text-[13px] text-zinc-500">No order is tied to this chat yet.</p>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "human" || message.role === "ai";
  const tone =
    message.role === "ai"
      ? "bg-brand/10 text-brand"
      : message.role === "human"
        ? "bg-zinc-800 text-white"
        : message.role === "system"
          ? "bg-amber-500/10 text-amber-100/90"
          : "border border-white/10 bg-black/40 text-zinc-100";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p className={`max-w-[80%] rounded-2xl px-3 py-2 text-[14px] leading-relaxed ${tone}`}>
        {message.text}
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-0.5 text-[14px]">{value}</p>
    </div>
  );
}
