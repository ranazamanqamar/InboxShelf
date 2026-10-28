"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { watchAlerts, watchConversations, watchOrders } from "@/lib/dashboard/data";
import { formatWhen, orderStatusLabel, trialDaysLeft } from "@/lib/dashboard/format";
import type { AlertItem, Conversation, Order } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { Empty, PageTitle, Panel } from "./ui";

export function OverviewPage() {
  const { tenant } = useDashboard();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    const stopChats = watchConversations(tenant.id, setChats, setError);
    const stopOrders = watchOrders(tenant.id, setOrders, setError);
    const stopAlerts = watchAlerts(tenant.id, setAlerts, setError);
    return () => {
      stopChats();
      stopOrders();
      stopAlerts();
    };
  }, [tenant]);

  const openChats = chats.filter((chat) => chat.mode !== "human_takeover").length;
  const waitingOrders = orders.filter(
    (order) => order.status === "confirmed" || order.status === "to_deliver",
  ).length;
  const stuck = alerts.filter((alert) => !alert.ackedAt).length;
  const days = tenant ? trialDaysLeft(tenant.trialEndsAt) : null;
  const [bars, setBars] = useState(() =>
    ["S", "M", "T", "W", "T", "F", "S"].map((label) => ({ label, height: 8 })),
  );

  useEffect(() => {
    setBars(weekBars(chats));
  }, [chats]);

  return (
    <div>
      <PageTitle
        title="Overview"
        lede="Chats, orders, and anything that needs you — for this store."
      />
      {error ? <p className="mb-4 text-[13px] text-red-300">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open chats" value={String(openChats)} note="Across every channel" />
        <Stat label="Orders to move" value={String(waitingOrders)} note="Confirmed or to deliver" />
        <Stat label="Needs you" value={String(stuck)} note="Stuck chats and handovers" />
        <Stat
          label="Trial"
          value={days == null ? "—" : String(days)}
          note={days == null ? "Pro or no trial" : "Days left"}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-[15px] font-semibold text-white">This week</h2>
            <span className="text-[12px] text-zinc-500">Chats touched</span>
          </div>
          <div className="flex h-36 items-end gap-2 px-5 pb-5 pt-4">
            {bars.map((bar, index) => (
              <div key={`${bar.label}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-md bg-white/10">
                  <div
                    className="w-full rounded-md bg-brand"
                    style={{ height: `${bar.height}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-zinc-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-[15px] font-semibold text-white">Recent chats</h2>
            <Link href="/dashboard/inbox" className="text-[13px] font-semibold text-brand">
              Inbox
            </Link>
          </div>
          {chats.length === 0 ? (
            <Empty title="No chats yet" body="Connect a channel and customer messages will land here." />
          ) : (
            <ul className="divide-y divide-white/10 px-2 py-2">
              {chats.slice(0, 5).map((chat) => (
                <li key={chat.id}>
                  <Link
                    href="/dashboard/inbox"
                    className="block rounded-lg px-3 py-2.5 hover:bg-white/5"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate text-[14px] font-medium">
                        {chat.customerName || "Customer"}
                      </span>
                      <span className="shrink-0 text-[12px] text-zinc-400">
                        {formatWhen(chat.lastMessageAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-zinc-500">
                      {chat.lastMessagePreview}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="px-5 pt-5 text-[15px] font-semibold text-white">Orders waiting</h2>
          {waitingOrders === 0 ? (
            <Empty title="Nothing to tick" body="Confirmed orders show up here when a customer says yes." />
          ) : (
            <ul className="divide-y divide-white/10 px-5 py-3">
              {orders
                .filter((order) => order.status === "confirmed" || order.status === "to_deliver")
                .slice(0, 5)
                .map((order) => (
                  <li key={order.id} className="flex items-center justify-between py-2.5 text-[14px]">
                    <span>{order.customerName}</span>
                    <span className="text-[12px] text-zinc-500">{orderStatusLabel(order.status)}</span>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
        <Panel>
          <h2 className="px-5 pt-5 text-[15px] font-semibold text-white">Alerts</h2>
          {stuck === 0 ? (
            <Empty title="All quiet" body="When the agent is stuck, that chat pauses and shows up here." />
          ) : (
            <ul className="divide-y divide-white/10 px-5 py-3">
              {alerts
                .filter((alert) => !alert.ackedAt)
                .slice(0, 5)
                .map((alert) => (
                  <li key={alert.id} className="py-2.5 text-[14px]">
                    {alert.reason}
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 px-5 py-4">
      <p className="text-[13px] font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[12px] text-zinc-400">{note}</p>
    </div>
  );
}

function weekBars(chats: Conversation[]) {
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  for (const chat of chats) {
    if (!chat.lastMessageAt) continue;
    const date = new Date(chat.lastMessageAt);
    const diff = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
    if (diff >= 0 && diff < 7) counts[diff] += 1;
  }
  const max = Math.max(1, ...counts);
  return counts.map((count, index) => ({
    label: labels[new Date(start.getTime() + index * 86_400_000).getDay()] ?? labels[index],
    height: Math.max(8, Math.round((count / max) * 100)),
  }));
}
