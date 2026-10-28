import type { Metadata } from "next";
import { AlertsPage } from "@/components/dashboard/AlertsPage";

export const metadata: Metadata = { title: "Alerts" };

export default function Page() {
  return <AlertsPage />;
}
