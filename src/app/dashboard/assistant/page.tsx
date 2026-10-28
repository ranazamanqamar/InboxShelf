import type { Metadata } from "next";
import { AssistantPage } from "@/components/dashboard/AssistantPage";

export const metadata: Metadata = { title: "Assistant" };

export default function Page() {
  return <AssistantPage />;
}
