"use client";

import { useEffect, useState } from "react";
import { advanceOrder, watchOrders } from "@/lib/dashboard/data";
import {
  firebaseErrorMessage,
  formatMoney,
  formatWhen,
  nextOrderStatus,
  orderStatusLabel,
} from "@/lib/dashboard/format";
import type { Order } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { Empty, PageTitle, Panel } from "./ui";

export function OrdersPage() {
  const { tenant } = useDashboard();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!tenant) return;
    return watchOrders(tenant.id, setOrders, setError);
  }, [tenant]);

  async function tick(order: Order) {
    if (!tenant) return;
    setError(null);
    setNote(null);
    try {
      const message = await advanceOrder(tenant.id, order, rating);
      setNote(message);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    }
  }

  return (
    <div>
      <PageTitle
        title="Orders"
        lede="Shopify, your site, and chat orders. A sheet row is written only after the customer confirms, and only when Sheets is connected."
      />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      {note ? <p className="mb-3 text-[13px] text-brand">{note}</p> : null}
      <Panel>
        {orders.length === 0 ? (
          <Empty title="No orders yet" body="They appear when Shopify, your site, or a chat order is confirmed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[12px] uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Source</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const next = nextOrderStatus(order.status);
                  return (
                    <tr key={order.id} className="border-t border-white/10">
                      <td className="px-5 py-3">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-[12px] text-zinc-500">
                          {order.customerPhone || "No phone"} · {formatWhen(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-3 py-3 capitalize">{order.source}</td>
                      <td className="px-3 py-3">{order.location || "—"}</td>
                      <td className="px-3 py-3">{formatMoney(order.total, order.currency)}</td>
                      <td className="px-3 py-3">{orderStatusLabel(order.status)}</td>
                      <td className="px-5 py-3 text-right">
                        {next === "rated" ? (
                          <select
                            value={rating}
                            onChange={(event) => setRating(Number(event.target.value))}
                            className="mr-2 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[12px] text-white"
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {next ? (
                          <button type="button" onClick={() => tick(order)} className="btn-quiet px-3 py-1.5 text-[12px]">
                            Mark {orderStatusLabel(next).toLowerCase()}
                          </button>
                        ) : (
                          <span className="text-[12px] text-zinc-400">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
