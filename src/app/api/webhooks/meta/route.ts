import { createHmac, timingSafeEqual } from "crypto";
import { connection } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminConfigured, adminDb } from "@/lib/server/admin";
import { runCustomerAgent } from "@/lib/server/agent-reply";
import { jsonError, jsonOk } from "@/lib/server/http";
import { sendMetaReply } from "@/lib/server/meta";
import { handleInboundOrderSignals } from "@/lib/server/orders";

function signed(raw: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type InboundMessage = {
  provider: "whatsapp" | "instagram" | "messenger";
  lookupField: "phoneNumberId" | "pageId";
  lookupValue: string;
  conversationId: string;
  customerId: string;
  customerName: string;
  text: string;
  channelMessageId: string;
};

function parseInbound(payload: {
  object?: string;
  entry?: {
    id?: string;
    changes?: {
      value?: {
        messages?: {
          from: string;
          id: string;
          text?: { body?: string };
        }[];
        metadata?: { phone_number_id?: string };
        contacts?: { profile?: { name?: string } }[];
      };
    }[];
    messaging?: {
      sender?: { id?: string };
      recipient?: { id?: string };
      message?: { mid?: string; text?: string };
    }[];
  }[];
}): InboundMessage | null {
  const entry = payload.entry?.[0];
  if (!entry) return null;

  const change = entry.changes?.[0]?.value;
  const wa = change?.messages?.[0];
  const phoneNumberId = change?.metadata?.phone_number_id;
  if (wa && phoneNumberId) {
    return {
      provider: "whatsapp",
      lookupField: "phoneNumberId",
      lookupValue: phoneNumberId,
      conversationId: `wa-${wa.from}`,
      customerId: wa.from,
      customerName: change?.contacts?.[0]?.profile?.name || wa.from,
      text: wa.text?.body ?? "",
      channelMessageId: wa.id,
    };
  }

  const messaging = entry.messaging?.[0];
  const pageId = messaging?.recipient?.id || entry.id;
  const senderId = messaging?.sender?.id;
  const text = messaging?.message?.text;
  const mid = messaging?.message?.mid;
  if (!pageId || !senderId || !text || !mid) return null;

  const provider = payload.object === "instagram" ? "instagram" : "messenger";
  const prefix = provider === "instagram" ? "ig" : "ms";
  return {
    provider,
    lookupField: "pageId",
    lookupValue: pageId,
    conversationId: `${prefix}-${senderId}`,
    customerId: senderId,
    customerName: senderId,
    text,
    channelMessageId: mid,
  };
}

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (
    mode === "subscribe" &&
    token &&
    token === process.env.META_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, { status: 200 });
  }
  return jsonError(403, "FORBIDDEN", "Meta verify token did not match.");
}

export async function POST(request: Request) {
  await connection();
  const raw = await request.text();
  if (!signed(raw, request.headers.get("x-hub-signature-256"))) {
    return jsonError(401, "UNAUTHENTICATED", "Meta signature did not match.");
  }
  if (!adminConfigured()) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Firebase Admin is required before inbound Meta messages can be saved.",
    );
  }

  const payload = JSON.parse(raw) as Parameters<typeof parseInbound>[0];
  const inbound = parseInbound(payload);
  if (!inbound) return jsonOk({ stored: false });

  const db = adminDb();
  const matches = await db
    .collectionGroup("integrations")
    .where(`config.${inbound.lookupField}`, "==", inbound.lookupValue)
    .limit(1)
    .get();
  if (matches.empty) {
    return jsonOk({ stored: false, reason: "No store owns this Meta channel." });
  }

  const integrationDoc = matches.docs[0]!;
  const tenantId = integrationDoc.ref.parent.parent?.id;
  if (!tenantId) return jsonOk({ stored: false });

  const conversation = db.doc(
    `tenants/${tenantId}/conversations/${inbound.conversationId}`,
  );
  const existing = await conversation.get();
  const mode = (existing.get("mode") as string | undefined) ?? "ai_on";

  await conversation.set(
    {
      channel: inbound.provider,
      externalThreadId: inbound.customerId,
      customerName: inbound.customerName,
      customerPhone: inbound.provider === "whatsapp" ? inbound.customerId : null,
      customerHandle: inbound.provider === "whatsapp" ? null : inbound.customerId,
      mode: existing.exists ? mode : "ai_on",
      language: null,
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessagePreview: inbound.text.slice(0, 120),
      unreadCount: FieldValue.increment(1),
      createdAt: existing.exists ? existing.get("createdAt") : FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  await conversation.collection("messages").add({
    role: "customer",
    text: inbound.text,
    channelMessageId: inbound.channelMessageId,
    deliveryStatus: null,
    mediaRef: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  const phone =
    inbound.provider === "whatsapp" ? inbound.customerId : null;
  const orderSignal = await handleInboundOrderSignals({
    tenantId,
    phone,
    text: inbound.text,
  });
  if (orderSignal.handled) {
    await conversation.collection("messages").add({
      role: "ai",
      text: orderSignal.reply,
      channelMessageId: null,
      deliveryStatus: "queued",
      mediaRef: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return jsonOk({ stored: true, orderSignal: true });
  }

  const agent = await runCustomerAgent({
    tenantId,
    conversationId: inbound.conversationId,
    customerText: inbound.text,
    mode: existing.exists ? mode : "ai_on",
    customerPhone: phone,
  });

  if (agent.status === "replied") {
    try {
      const secrets = await db
        .doc(`tenantSecrets/${tenantId}/tokens/${inbound.provider}`)
        .get();
      const accessToken = secrets.get("accessToken");
      const config = (integrationDoc.get("config") ?? {}) as Record<string, string>;
      if (typeof accessToken === "string" && accessToken) {
        await sendMetaReply({
          provider: inbound.provider,
          accessToken,
          config,
          recipientId: inbound.customerId,
          text: agent.text,
        });
        await conversation.collection("messages").add({
          role: "system",
          text: "AI reply sent on Meta.",
          channelMessageId: null,
          deliveryStatus: "sent",
          mediaRef: null,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    } catch {
      // Reply stays in Inbox even if Meta send fails.
    }
  }

  return jsonOk({ stored: true, agent: agent.status });
}
