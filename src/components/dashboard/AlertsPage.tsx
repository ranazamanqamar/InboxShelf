"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { acknowledgeAlert, watchAlerts } from "@/lib/dashboard/data";
import { firebaseErrorMessage, formatWhen } from "@/lib/dashboard/format";
import type { AlertItem } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { Empty, PageTitle, Panel } from "./ui";

export function AlertsPage() {
  const { tenant } = useDashboard();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    return watchAlerts(tenant.id, setAlerts, setError);
  }, [tenant]);

  return (
    <div>
      <PageTitle
        title="Alerts"
        lede="Stuck chats pause only that thread. Other conversations keep running."
      />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      <Panel>
        {alerts.length === 0 ? (
          <Empty title="No alerts" body="When the agent cannot answer from your knowledge, you will see it here." />
        ) : (
          <ul className="divide-y divide-white/10">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-[14px] font-medium">{alert.reason}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    {alert.type} · {formatWhen(alert.createdAt)}
                    {alert.ackedAt ? " · acknowledged" : ""}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/inbox" className="text-[12px] font-semibold text-brand">
                    Open inbox
                  </Link>
                  {!alert.ackedAt ? (
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-zinc-500"
                      onClick={() =>
                        tenant &&
                        acknowledgeAlert(tenant.id, alert.id).catch((err) =>
                          setError(firebaseErrorMessage(err)),
                        )
                      }
                    >
                      Acknowledge
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
