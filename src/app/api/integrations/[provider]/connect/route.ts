import { connection } from "next/server";
import { adminConfigured, verifyBearer } from "@/lib/server/admin";
import { jsonError, jsonOk } from "@/lib/server/http";
import {
  googleAuthUrl,
  metaAuthUrl,
  microsoftAuthUrl,
  requiredEnv,
  shopifyAuthUrl,
  signState,
} from "@/lib/server/oauth";

const META = new Set(["whatsapp", "instagram", "messenger"]);
const GOOGLE = new Set(["gmail", "google_sheets"]);

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  await connection();
  const { provider } = await context.params;

  let uid: string;
  try {
    uid = await verifyBearer(request);
  } catch {
    return jsonError(401, "UNAUTHENTICATED", "Log in again.");
  }

  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return jsonError(400, "VALIDATION_ERROR", "Choose a store first.");
  }

  if (!adminConfigured()) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY so InboxShelf can store this connection.",
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    shop?: string;
    loginHint?: string;
  };
  const origin = new URL(request.url).origin;
  const state = signState({
    tenantId,
    provider,
    uid,
    shop: body.shop,
  });
  if (!state) {
    return jsonError(
      503,
      "MISSING_CREDENTIALS",
      "Add OAUTH_STATE_SECRET or FIREBASE_PRIVATE_KEY before starting a connection.",
    );
  }

  if (META.has(provider)) {
    const missing = requiredEnv(["META_APP_ID", "META_APP_SECRET"]);
    if (missing) return jsonError(503, "MISSING_CREDENTIALS", missing);
    return jsonOk({
      url: metaAuthUrl({
        origin,
        provider: provider as "whatsapp" | "instagram" | "messenger",
        state,
      }),
    });
  }

  if (GOOGLE.has(provider)) {
    const missing = requiredEnv(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]);
    if (missing) return jsonError(503, "MISSING_CREDENTIALS", missing);
    const loginHint = body.loginHint?.trim();
    return jsonOk({
      url: googleAuthUrl({
        origin,
        provider: provider as "gmail" | "google_sheets",
        state,
        loginHint,
        forceAccountPicker: !loginHint,
      }),
    });
  }

  if (provider === "outlook") {
    const missing = requiredEnv(["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"]);
    if (missing) return jsonError(503, "MISSING_CREDENTIALS", missing);
    return jsonOk({ url: microsoftAuthUrl({ origin, state }) });
  }

  if (provider === "shopify") {
    const missing = requiredEnv(["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET"]);
    if (missing) return jsonError(503, "MISSING_CREDENTIALS", missing);
    const shop = (body.shop ?? "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (!shop.endsWith(".myshopify.com")) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        "Enter the shop domain, like north-co.myshopify.com.",
      );
    }
    return jsonOk({ url: shopifyAuthUrl({ shop, origin, state }) });
  }

  return jsonError(400, "VALIDATION_ERROR", "Unknown integration.");
}
