import type { Metadata } from "next";
import { InboxPage } from "@/components/dashboard/InboxPage";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return <InboxPage />;
}
