import { connection } from "next/server";
import { verifyBearer } from "@/lib/server/admin";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function POST(request: Request) {
  await connection();
  try {
    await verifyBearer(request);
  } catch {
    return jsonError(401, "UNAUTHENTICATED", "Log in again.");
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Add OPENAI_API_KEY for open-ended Assistant replies. Order and mail questions still work from your store data.",
    );
  }
  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) return jsonError(400, "VALIDATION_ERROR", "Ask something first.");

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const isOpenRouter = baseUrl.includes("openrouter.ai");
  const model = process.env.OPENAI_MODEL || (isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini");
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
      messages: [
        {
          role: "system",
          content:
            "You are the InboxShelf owner assistant. You never message end customers. Answer only about the owner's store operations. If you do not have the data in the user message, say what page to open. Keep it short.",
        },
        { role: "user", content: text },
      ],
    }),
  });
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!response.ok || !answer) {
    return jsonError(502, "UPSTREAM_ERROR", payload.error?.message || "Assistant did not reply.");
  }
  return jsonOk({ text: answer, intent: "openai" });
}
