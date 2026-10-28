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
  const tenantId = request.headers.get("x-tenant-id");
  const apiKey = process.env.PADDLE_API_KEY;
  const priceId = process.env.PADDLE_PRICE_ID_PRO;
  if (!tenantId || !apiKey || !priceId) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Add PADDLE_API_KEY and PADDLE_PRICE_ID_PRO before Pro checkout can open.",
    );
  }
  const response = await fetch("https://api.paddle.com/transactions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      custom_data: { tenantId },
    }),
  });
  const body = (await response.json()) as {
    data?: { checkout?: { url?: string } };
    error?: { detail?: string };
  };
  const url = body.data?.checkout?.url;
  if (!response.ok || !url) {
    return jsonError(
      502,
      "UPSTREAM_ERROR",
      body.error?.detail || "Paddle did not open a checkout.",
    );
  }
  return jsonOk({ url });
}
