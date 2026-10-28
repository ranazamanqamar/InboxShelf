import { connection } from "next/server";
import { adminConfigured, verifyBearer } from "@/lib/server/admin";
import { jsonError, jsonOk } from "@/lib/server/http";
import { advanceOrderServer } from "@/lib/server/orders";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
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
      "Firebase Admin is required to advance orders.",
    );
  }

  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return jsonError(400, "VALIDATION_ERROR", "Choose a store first.");
  }

  const { orderId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { rating?: number };

  try {
    const message = await advanceOrderServer({
      tenantId,
      orderId,
      rating: body.rating,
    });
    return jsonOk({ message });
  } catch (error) {
    return jsonError(
      400,
      "VALIDATION_ERROR",
      error instanceof Error ? error.message : "Could not advance this order.",
    );
  }
}
