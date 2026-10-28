import type { Metadata } from "next";
import { OrdersPage } from "@/components/dashboard/OrdersPage";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return <OrdersPage />;
}
