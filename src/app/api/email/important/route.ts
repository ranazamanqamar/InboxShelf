import { connection } from "next/server";
import { adminConfigured, adminDb, verifyBearer } from "@/lib/server/admin";
import { jsonError, jsonOk } from "@/lib/server/http";

type MailItem = { id: string; from: string; subject: string; date: string; provider: string };

export async function GET(request: Request) {
  await connection();
  try {
    await verifyBearer(request);
  } catch {
    return jsonError(401, "UNAUTHENTICATED", "Log in again.");
  }
  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) return jsonError(400, "VALIDATION_ERROR", "Choose a store first.");
  if (!adminConfigured()) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Add Firebase Admin credentials before Gmail or Outlook mail can be read.",
    );
  }

  const db = adminDb();
  const messages: MailItem[] = [];
  const gmail = await db.doc(`tenantSecrets/${tenantId}/tokens/gmail`).get();
  const gmailToken = gmail.get("accessToken");
  if (typeof gmailToken === "string" && gmailToken) {
    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:important&maxResults=15",
      { headers: { Authorization: `Bearer ${gmailToken}` } },
    );
    if (!response.ok) {
      return jsonError(502, "UPSTREAM_ERROR", "Gmail refused the connected account.");
    }
    const list = (await response.json()) as { messages?: { id: string }[] };
    for (const item of list.messages ?? []) {
      const detail = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${gmailToken}` } },
      );
      const mail = (await detail.json()) as {
        payload?: { headers?: { name: string; value: string }[] };
      };
      const headers = mail.payload?.headers ?? [];
      const header = (name: string) =>
        headers.find((entry) => entry.name.toLowerCase() === name.toLowerCase())?.value ?? "";
      messages.push({
        id: item.id,
        from: header("From"),
        subject: header("Subject") || "(no subject)",
        date: header("Date"),
        provider: "gmail",
      });
    }
  }

  const outlook = await db.doc(`tenantSecrets/${tenantId}/tokens/outlook`).get();
  const outlookToken = outlook.get("accessToken");
  if (typeof outlookToken === "string" && outlookToken) {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/messages?$top=15&$select=id,subject,from,receivedDateTime,importance&$filter=importance eq 'high'",
      { headers: { Authorization: `Bearer ${outlookToken}` } },
    );
    if (!response.ok) {
      return jsonError(502, "UPSTREAM_ERROR", "Outlook refused the connected account.");
    }
    const list = (await response.json()) as {
      value?: {
        id: string;
        subject?: string;
        receivedDateTime?: string;
        from?: { emailAddress?: { name?: string; address?: string } };
      }[];
    };
    for (const item of list.value ?? []) {
      const from = item.from?.emailAddress;
      messages.push({
        id: item.id,
        from: from?.name || from?.address || "Outlook",
        subject: item.subject || "(no subject)",
        date: item.receivedDateTime || "",
        provider: "outlook",
      });
    }
  }

  return jsonOk({ messages });
}
