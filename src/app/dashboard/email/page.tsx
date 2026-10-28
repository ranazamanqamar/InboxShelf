import type { Metadata } from "next";
import { EmailPage } from "@/components/dashboard/EmailPage";

export const metadata: Metadata = { title: "Email" };

export default function Page() {
  return <EmailPage />;
}
