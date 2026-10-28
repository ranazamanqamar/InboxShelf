import { createHmac, timingSafeEqual } from "crypto";
import { connection } from "next/server";
import { adminConfigured, adminDb } from "@/lib/server/admin";
import { jsonError, jsonOk } from "@/lib/server/http";
import { requestOrderConfirmation } from "@/lib/server/orders";

export async function POST(request: Request) {
  await connection();
  const raw = await request.text();
  const secret = process.env.SHOPIFY_API_SECRET;
  const header = request.headers.get("x-shopify-hmac-sha256");
  if (!secret || !header) {
    return jsonError(401, "UNAUTHENTICATED", "Shopify signature is missing.");
  }
  const expected = createHmac("sha256", secret).update(raw).digest("base64");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return jsonError(401, "UNAUTHENTICATED", "Shopify signature did not match.");
  }
  if (!adminConfigured()) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Firebase Admin is required before Shopify orders can be saved.",
    );
  }

  const shop = request.headers.get("x-shopify-shop-domain");
  const order = JSON.parse(raw) as {
    id?: number;
    name?: string;
    total_price?: string;
    currency?: string;
    shipping_address?: { city?: string; address1?: string; phone?: string };
    customer?: { first_name?: string; last_name?: string; phone?: string };
    line_items?: { title?: string; quantity?: number; price?: string }[];
  };
  if (!shop) return jsonError(400, "VALIDATION_ERROR", "Missing shop domain.");

  const db = adminDb();
  const matches = await db
    .collectionGroup("integrations")
    .where("config.shop", "==", shop)
    .limit(1)
    .get();
  const tenantId = matches.docs[0]?.ref.parent.parent?.id;
  if (!tenantId) return jsonOk({ stored: false, reason: "No store is connected to this shop." });

  const phone = order.shipping_address?.phone || order.customer?.phone || "";
  const externalId = order.name || String(order.id ?? "");
  const dedupeKey = `${phone}:shopify:${externalId}`;
  const existing = await db
    .collection(`tenants/${tenantId}/orders`)
    .where("dedupeKey", "==", dedupeKey)
    .limit(1)
    .get();
  const items = (order.line_items ?? []).map((item) => ({
    name: item.title ?? "Item",
    qty: item.quantity ?? 1,
    unitPrice: Math.round(Number(item.price ?? 0) * 100),
  }));
  const payload = {
    source: "shopify",
    externalId,
    conversationId: null,
    customerName:
      [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") ||
      "Shopify customer",
    customerPhone: phone,
    location: order.shipping_address?.city ?? "",
    address: order.shipping_address?.address1 ?? null,
    items,
    total: Math.round(Number(order.total_price ?? 0) * 100),
    currency: order.currency ?? "USD",
    status: "pending_confirm",
    confirmedAt: null,
    sheetsRowRef: null,
    sheetsSyncedAt: null,
    rating: null,
    reviewLinkSentAt: null,
    dedupeKey,
    updatedAt: new Date(),
  };
  let orderId: string;
  if (existing.empty) {
    const ref = await db.collection(`tenants/${tenantId}/orders`).add({
      ...payload,
      createdAt: new Date(),
    });
    orderId = ref.id;
  } else {
    orderId = existing.docs[0]!.id;
    await existing.docs[0]!.ref.set(payload, { merge: true });
  }
  if (phone) {
    await requestOrderConfirmation(tenantId, orderId).catch(() => undefined);
  }
  return jsonOk({ stored: true });
}
