import { Suspense } from "react";
import type { Metadata } from "next";
import { IntegrationsPage } from "@/components/dashboard/IntegrationsPage";

export const metadata: Metadata = { title: "Integrations" };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[14px] text-zinc-500">Loading connections…</p>}>
      <IntegrationsPage />
    </Suspense>
  );
}
