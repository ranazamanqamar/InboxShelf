import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import { sendMetaReply } from "./meta";
import { syncOrderToSheets } from "./sheets";
import { nextOrderStatus } from "@/lib/dashboard/format";
import type { OrderStatus } from "@/lib/dashboard/types";

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function isYes(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(yes|y|yeah|yep|confirm|confirmed|ok|okay|sure|haan|ji)$/i.test(t);
}

function parseRating(text: string): number | null {
  const match = text.trim().match(/^[1-5]$/);
  return match ? Number(match[0]) : null;
}

async function sendWhatsAppText(tenantId: string, phone: string, text: string): Promise<boolean> {
  const db = adminDb();
  const [secrets, integration] = await Promise.all([
    db.doc(`tenantSecrets/${tenantId}/tokens/whatsapp`).get(),
    db.doc(`tenants/${tenantId}/integrations/whatsapp`).get(),
  ]);
  const accessToken = secrets.get("accessToken");
  const config = (integration.get("config") ?? {}) as Record<string, string>;
  if (typeof accessToken !== "string" || !accessToken || !config.phoneNumberId) {
    return false;
  }
  const to = phone.replace(/^\+/, "");
  await sendMetaReply({
    provider: "whatsapp",
    accessToken,
    config,
    recipientId: to,
    text,
  });
  return true;
}

export function formatOrderSummary(order: {
  customerName: string;
  items: { name: string; qty: number }[];
  total: number;
  currency: string;
  location: string;
}): string {
  const items = order.items.map((i) => `${i.name} x${i.qty}`).join(", ");
  const total = (order.total / 100).toFixed(2);
  return [
    `Hi ${order.customerName}, here is your order summary:`,
    items || "(items)",
    `Total: ${total} ${order.currency}`,
    order.location ? `Location: ${order.location}` : null,
    "",
    "Do you confirm your order? Reply YES to confirm.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export async function findPendingOrderForPhone(tenantId: string, phone: string) {
  const normalized = normalizePhone(phone);
  const snap = await adminDb()
    .collection(`tenants/${tenantId}/orders`)
    .where("status", "==", "pending_confirm")
    .limit(20)
    .get();
  return (
    snap.docs.find((doc) => normalizePhone(String(doc.get("customerPhone") ?? "")) === normalized) ??
    null
  );
}

export async function findDeliveredAwaitingRating(tenantId: string, phone: string) {
  const normalized = normalizePhone(phone);
  const snap = await adminDb()
    .collection(`tenants/${tenantId}/orders`)
    .where("status", "==", "delivered")
    .limit(20)
    .get();
  return (
    snap.docs.find((doc) => normalizePhone(String(doc.get("customerPhone") ?? "")) === normalized) ??
    null
  );
}

export async function confirmOrder(tenantId: string, orderId: string): Promise<string> {
  const db = adminDb();
  const ref = db.doc(`tenants/${tenantId}/orders/${orderId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Order not found.");
  if (snap.get("status") !== "pending_confirm") {
    throw new Error("This order is not waiting for confirm.");
  }

  const order = {
    id: orderId,
    source: String(snap.get("source") ?? "chat"),
    externalId: (snap.get("externalId") as string | null) ?? null,
    customerName: String(snap.get("customerName") ?? "Customer"),
    customerPhone: String(snap.get("customerPhone") ?? ""),
    location: String(snap.get("location") ?? ""),
    address: (snap.get("address") as string | null) ?? null,
    items: (snap.get("items") as { name: string; qty: number; unitPrice: number }[]) ?? [],
    total: Number(snap.get("total") ?? 0),
    currency: String(snap.get("currency") ?? "USD"),
    status: "confirmed",
    rating: null as number | null,
    createdAt: snap.get("createdAt")?.toDate?.() ?? new Date(),
  };

  let sheetsRowRef: string | null = null;
  let sheetsError: string | null = null;
  try {
    const synced = await syncOrderToSheets(tenantId, order);
    sheetsRowRef = synced.sheetsRowRef;
  } catch (error) {
    sheetsError = error instanceof Error ? error.message : "Sheets sync failed.";
  }

  await ref.set(
    {
      status: "confirmed",
      confirmedAt: FieldValue.serverTimestamp(),
      sheetsRowRef,
      sheetsSyncedAt: sheetsRowRef ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await sendWhatsAppText(
    tenantId,
    order.customerPhone,
    sheetsRowRef
      ? "Thanks — your order is confirmed."
      : `Thanks — your order is confirmed.${sheetsError ? ` (Sheet sync later: ${sheetsError})` : ""}`,
  );

  return sheetsRowRef
    ? "Order confirmed and written to Google Sheets."
    : `Order confirmed.${sheetsError ? ` Sheets: ${sheetsError}` : ""}`;
}

export async function createPendingChatOrder(input: {
  tenantId: string;
  conversationId: string;
  customerName: string;
  customerPhone: string;
  location: string;
  address?: string | null;
  items: { name: string; qty: number; unitPrice: number }[];
  total: number;
  currency: string;
}): Promise<{ orderId: string; confirmText: string }> {
  const db = adminDb();
  const day = new Date().toISOString().slice(0, 10);
  const itemsKey = input.items.map((i) => `${i.name}:${i.qty}`).join("|");
  const dedupeKey = `${normalizePhone(input.customerPhone)}:chat:${day}:${itemsKey}`;

  const existing = await db
    .collection(`tenants/${input.tenantId}/orders`)
    .where("dedupeKey", "==", dedupeKey)
    .limit(1)
    .get();

  const payload = {
    source: "chat" as const,
    externalId: null,
    conversationId: input.conversationId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    location: input.location,
    address: input.address ?? null,
    items: input.items,
    total: input.total,
    currency: input.currency,
    status: "pending_confirm",
    confirmedAt: null,
    sheetsRowRef: null,
    sheetsSyncedAt: null,
    rating: null,
    reviewLinkSentAt: null,
    dedupeKey,
    updatedAt: FieldValue.serverTimestamp(),
  };

  let orderId: string;
  if (existing.empty) {
    const ref = await db.collection(`tenants/${input.tenantId}/orders`).add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
    });
    orderId = ref.id;
  } else {
    orderId = existing.docs[0]!.id;
    await existing.docs[0]!.ref.set(payload, { merge: true });
  }

  const confirmText = formatOrderSummary({
    customerName: input.customerName,
    items: input.items,
    total: input.total,
    currency: input.currency,
    location: input.location,
  });

  await sendWhatsAppText(input.tenantId, input.customerPhone, confirmText);
  return { orderId, confirmText };
}

export async function handleInboundOrderSignals(input: {
  tenantId: string;
  phone: string | null;
  text: string;
}): Promise<{ handled: true; reply: string } | { handled: false }> {
  if (!input.phone) return { handled: false };
  const phone = input.phone;

  if (isYes(input.text)) {
    const pending = await findPendingOrderForPhone(input.tenantId, phone);
    if (pending) {
      const message = await confirmOrder(input.tenantId, pending.id);
      return { handled: true, reply: message.includes("Sheets") ? "Thanks — your order is confirmed." : "Thanks — your order is confirmed." };
    }
  }

  const rating = parseRating(input.text);
  if (rating != null) {
    const delivered = await findDeliveredAwaitingRating(input.tenantId, phone);
    if (delivered) {
      await delivered.ref.set(
        {
          status: "rated",
          rating,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      const tenant = await adminDb().doc(`tenants/${input.tenantId}`).get();
      const reviewLink = tenant.get("shopUrl") as string | null;
      const thanks = reviewLink
        ? `Thanks for rating us ${rating}/5. Optional review: ${reviewLink}`
        : `Thanks for rating us ${rating}/5.`;
      await sendWhatsAppText(input.tenantId, phone, thanks);
      return { handled: true, reply: thanks };
    }
  }

  return { handled: false };
}

export async function advanceOrderServer(input: {
  tenantId: string;
  orderId: string;
  rating?: number;
}): Promise<string> {
  const db = adminDb();
  const ref = db.doc(`tenants/${input.tenantId}/orders/${input.orderId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Order not found.");

  const status = String(snap.get("status") ?? "pending_confirm") as OrderStatus;
  if (status === "pending_confirm") {
    return confirmOrder(input.tenantId, input.orderId);
  }

  const next = nextOrderStatus(status);
  if (!next) throw new Error("This order is already finished.");
  if (next === "rated" && (input.rating == null || input.rating < 1 || input.rating > 5)) {
    throw new Error("Pick a rating from 1 to 5.");
  }

  await ref.set(
    {
      status: next,
      rating: next === "rated" ? (input.rating ?? null) : snap.get("rating") ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const phone = String(snap.get("customerPhone") ?? "");
  if (next === "on_the_way" && phone) {
    await sendWhatsAppText(
      input.tenantId,
      phone,
      "Your order is on the way. Please reply when you receive it.",
    );
    return "Marked on the way. WhatsApp notified the customer.";
  }
  if (next === "delivered" && phone) {
    await sendWhatsAppText(
      input.tenantId,
      phone,
      "Glad it arrived! Please rate your experience from 1 to 5.",
    );
    return "Marked delivered. Asked the customer for a 1–5 rating.";
  }
  return `Marked ${next.replaceAll("_", " ")}.`;
}

/** Call after Shopify (or other) creates pending_confirm — ask customer to confirm on WhatsApp. */
export async function requestOrderConfirmation(
  tenantId: string,
  orderId: string,
): Promise<void> {
  const snap = await adminDb().doc(`tenants/${tenantId}/orders/${orderId}`).get();
  if (!snap.exists || snap.get("status") !== "pending_confirm") return;
  const phone = String(snap.get("customerPhone") ?? "");
  if (!phone) return;
  await sendWhatsAppText(
    tenantId,
    phone,
    formatOrderSummary({
      customerName: String(snap.get("customerName") ?? "there"),
      items: (snap.get("items") as { name: string; qty: number }[]) ?? [],
      total: Number(snap.get("total") ?? 0),
      currency: String(snap.get("currency") ?? "USD"),
      location: String(snap.get("location") ?? ""),
    }),
  );
}
