import { connection } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminConfigured, adminDb, verifyBearer } from "@/lib/server/admin";
import { runCustomerAgent } from "@/lib/server/agent-reply";
import { jsonError, jsonOk } from "@/lib/server/http";

const TEST_CONVERSATION_ID = "agent-test";

export async function POST(request: Request) {
  await connection();
  try {
    await verifyBearer(request);
  } catch {
    return jsonError(401, "UNAUTHENTICATED", "Log in again.");
  }
  if (!adminConfigured()) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Firebase Admin is required to test the agent.",
    );
  }

  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return jsonError(400, "VALIDATION_ERROR", "Choose a store first.");
  }

  const body = (await request.json().catch(() => ({}))) as { text?: string };
  const text = body.text?.trim();
  if (!text) {
    return jsonError(400, "VALIDATION_ERROR", "Type a customer-style question first.");
  }

  const db = adminDb();
  const conversation = db.doc(`tenants/${tenantId}/conversations/${TEST_CONVERSATION_ID}`);
  await conversation.set(
    {
      channel: "whatsapp",
      externalThreadId: "agent-test",
      customerName: "FAQ test customer",
      customerPhone: null,
      customerHandle: null,
      mode: "ai_on",
      language: null,
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessagePreview: text.slice(0, 120),
      unreadCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  await conversation.collection("messages").add({
    role: "customer",
    text,
    channelMessageId: null,
    deliveryStatus: null,
    mediaRef: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  const result = await runCustomerAgent({
    tenantId,
    conversationId: TEST_CONVERSATION_ID,
    customerText: text,
    mode: "ai_on",
    customerPhone: null,
  });

  // Keep the test thread usable for the next question.
  await conversation.set({ mode: "ai_on" }, { merge: true });

  if (result.status === "replied") {
    return jsonOk({ status: "replied", text: result.text });
  }
  if (result.status === "paused") {
    return jsonOk({ status: "paused", text: result.reason });
  }
  return jsonOk({ status: "skipped", text: result.reason });
}
