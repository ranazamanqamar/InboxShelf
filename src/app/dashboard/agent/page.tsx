import type { Metadata } from "next";
import { AgentPage } from "@/components/dashboard/AgentPage";

export const metadata: Metadata = { title: "Agent" };

export default function Page() {
  return <AgentPage />;
}
