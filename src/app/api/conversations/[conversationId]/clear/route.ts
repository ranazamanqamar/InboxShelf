import { connection } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminConfigured, adminDb, verifyBearer } from "@/lib/server/admin";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ conversationId: string }> },
) {
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
      "Firebase Admin is required to clear chats.",
    );
  }

  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return jsonError(400, "VALIDATION_ERROR", "Choose a store first.");
  }

  const { conversationId } = await context.params;
  const db = adminDb();
  const conversation = db.doc(`tenants/${tenantId}/conversations/${conversationId}`);
  const existing = await conversation.get();
  if (!existing.exists) {
    return jsonError(400, "VALIDATION_ERROR", "That chat was not found.");
  }

  const messages = await conversation.collection("messages").get();
  const batchSize = 400;
  for (let i = 0; i < messages.docs.length; i += batchSize) {
    const batch = db.batch();
    for (const doc of messages.docs.slice(i, i + batchSize)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }

  await conversation.set(
    {
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessagePreview: "Chat cleared.",
      unreadCount: 0,
      mode: "ai_on",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return jsonOk({ cleared: true });
}
