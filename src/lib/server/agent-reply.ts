import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import { createPendingChatOrder } from "./orders";

export type AgentResult =
  | { status: "replied"; text: string }
  | { status: "paused"; reason: string }
  | { status: "skipped"; reason: string };

const UNSURE_MARKER = "UNSURE";
const ORDER_LINK_MARKER = "SEND_ORDER_LINK";
const ORDER_JSON_MARKER = "CREATE_ORDER:";

async function loadKnowledgeText(tenantId: string): Promise<string> {
  const snap = await adminDb()
    .collection(`tenants/${tenantId}/knowledge`)
    .where("status", "==", "ready")
    .limit(40)
    .get();
  const chunks: string[] = [];
  for (const doc of snap.docs) {
    const title = String(doc.get("title") ?? "Untitled");
    const text = doc.get("text");
    if (typeof text === "string" && text.trim()) {
      chunks.push(`## ${title}\n${text.trim()}`);
    }
  }
  return chunks.join("\n\n");
}

async function pauseConversation(
  tenantId: string,
  conversationId: string,
  reason: string,
): Promise<void> {
  const db = adminDb();
  const conversation = db.doc(`tenants/${tenantId}/conversations/${conversationId}`);
  await conversation.set(
    {
      mode: "paused",
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessagePreview: reason.slice(0, 120),
    },
    { merge: true },
  );
  await conversation.collection("messages").add({
    role: "system",
    text: reason,
    channelMessageId: null,
    deliveryStatus: null,
    mediaRef: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  await db.collection(`tenants/${tenantId}/alerts`).add({
    type: "stuck",
    conversationId,
    reason,
    channelsNotified: ["dashboard"],
    createdAt: FieldValue.serverTimestamp(),
    ackedAt: null,
  });
}

async function saveAiMessage(
  tenantId: string,
  conversationId: string,
  text: string,
): Promise<void> {
  const conversation = adminDb().doc(`tenants/${tenantId}/conversations/${conversationId}`);
  await conversation.collection("messages").add({
    role: "ai",
    text,
    channelMessageId: null,
    deliveryStatus: "queued",
    mediaRef: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  await conversation.set(
    {
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessagePreview: text.slice(0, 120),
    },
    { merge: true },
  );
}

async function callOpenRouter(input: {
  knowledge: string;
  customerText: string;
  orderLink: string | null;
  customerPhone: string | null;
  currency: string;
}): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("MISSING_OPENAI");
  }
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const isOpenRouter = baseUrl.includes("openrouter.ai");
  const model =
    process.env.OPENAI_MODEL || (isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (isOpenRouter) {
    headers["HTTP-Referer"] = process.env.OPENAI_HTTP_REFERER || "http://localhost:3000";
    headers["X-Title"] = process.env.OPENAI_APP_TITLE || "InboxShelf";
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: [
            "You are the store's customer-facing agent for InboxShelf.",
            "Answer product/policy questions ONLY using the knowledge base below.",
            "Never invent prices, stock, shipping times, policies, or product specs.",
            "Ask short clarifying questions when needed to complete an order (name, WhatsApp phone, location/city, items).",
            "If the knowledge base does not clearly answer a product question, reply with exactly:",
            UNSURE_MARKER,
            "",
            "When the customer wants to buy and you do not yet have full order details:",
            input.orderLink
              ? `Reply with exactly ${ORDER_LINK_MARKER} on the first line, then one short friendly sentence. The app will attach this order link: ${input.orderLink}`
              : "Ask them to share name, WhatsApp number, city/location, and items. Do not invent an order link.",
            "",
            "When you have enough to place a chat order (name, phone, location, at least one item), reply with ONLY:",
            `${ORDER_JSON_MARKER}{"customerName":"...","customerPhone":"${input.customerPhone || "+countrycode..."}","location":"...","address":null,"items":[{"name":"...","qty":1,"unitPrice":0}],"total":0,"currency":"${input.currency}"}`,
            "unitPrice and total are integers in the smallest currency unit (e.g. cents). Use 0 if unknown from knowledge.",
            "Keep normal FAQ answers short and friendly with no markers.",
            "",
            "Knowledge base:",
            input.knowledge || "(empty)",
          ].join("\n"),
        },
        { role: "user", content: input.customerText },
      ],
    }),
  });
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!response.ok || !answer) {
    const upstream = payload.error?.message || `HTTP ${response.status}`;
    throw new Error(upstream);
  }
  return answer;
}

export async function runCustomerAgent(input: {
  tenantId: string;
  conversationId: string;
  customerText: string;
  mode?: string | null;
  customerPhone?: string | null;
}): Promise<AgentResult> {
  if (input.mode && input.mode !== "ai_on") {
    return { status: "skipped", reason: "Conversation is not on AI." };
  }

  const tenant = await adminDb().doc(`tenants/${input.tenantId}`).get();
  const orderLink = (tenant.get("orderLink") as string | null) ?? null;
  const currency = (tenant.get("currency") as string | null) ?? "USD";

  const knowledge = await loadKnowledgeText(input.tenantId);
  if (!knowledge) {
    const reason =
      "No FAQ or PDF text is on the knowledge shelf, so this chat is paused for you.";
    await pauseConversation(input.tenantId, input.conversationId, reason);
    return { status: "paused", reason };
  }

  let raw: string;
  try {
    raw = await callOpenRouter({
      knowledge,
      customerText: input.customerText,
      orderLink,
      customerPhone: input.customerPhone ?? null,
      currency,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    const reason =
      detail === "MISSING_OPENAI"
        ? "No AI API key is configured on the server, so this chat is paused for you."
        : detail.includes("401") || /unauthorized/i.test(detail)
          ? "The AI provider rejected the API key (401). Check OPENAI_API_KEY and restart."
          : "The agent could not reach the model, so this chat is paused for you.";
    await pauseConversation(input.tenantId, input.conversationId, reason);
    return { status: "paused", reason };
  }

  if (raw === UNSURE_MARKER || raw.toUpperCase().startsWith(UNSURE_MARKER)) {
    const reason =
      "The agent could not answer from your knowledge, so this chat is paused for you.";
    await pauseConversation(input.tenantId, input.conversationId, reason);
    return { status: "paused", reason };
  }

  if (raw.includes(ORDER_LINK_MARKER)) {
    const blurb = raw
      .split("\n")
      .filter((line) => !line.includes(ORDER_LINK_MARKER))
      .join("\n")
      .trim();
    const text = orderLink
      ? `${blurb || "You can place your order here:"}\n${orderLink}`
      : blurb || "Tell me your name, WhatsApp number, city, and what you want to order.";
    await saveAiMessage(input.tenantId, input.conversationId, text);
    return { status: "replied", text };
  }

  const orderLine = raw
    .split("\n")
    .find((line) => line.trim().startsWith(ORDER_JSON_MARKER));
  if (orderLine) {
    try {
      const json = orderLine.trim().slice(ORDER_JSON_MARKER.length);
      const draft = JSON.parse(json) as {
        customerName?: string;
        customerPhone?: string;
        location?: string;
        address?: string | null;
        items?: { name: string; qty: number; unitPrice: number }[];
        total?: number;
        currency?: string;
      };
      const phone = draft.customerPhone || input.customerPhone;
      if (!draft.customerName || !phone || !draft.location || !draft.items?.length) {
        const text =
          "I still need your name, WhatsApp number, city/location, and the items to place the order.";
        await saveAiMessage(input.tenantId, input.conversationId, text);
        return { status: "replied", text };
      }
      const { confirmText } = await createPendingChatOrder({
        tenantId: input.tenantId,
        conversationId: input.conversationId,
        customerName: draft.customerName,
        customerPhone: phone,
        location: draft.location,
        address: draft.address ?? null,
        items: draft.items,
        total: draft.total ?? draft.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0),
        currency: draft.currency || currency,
      });
      await saveAiMessage(input.tenantId, input.conversationId, confirmText);
      return { status: "replied", text: confirmText };
    } catch {
      const text =
        "I could not save that order yet. Please send name, WhatsApp number, city, and items again.";
      await saveAiMessage(input.tenantId, input.conversationId, text);
      return { status: "replied", text };
    }
  }

  await saveAiMessage(input.tenantId, input.conversationId, raw);
  return { status: "replied", text: raw };
}
