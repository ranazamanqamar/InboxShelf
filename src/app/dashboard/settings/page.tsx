import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/SettingsPage";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsPage />;
}
