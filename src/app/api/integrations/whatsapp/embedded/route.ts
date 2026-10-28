import { connection } from "next/server";
import { adminConfigured, verifyBearer } from "@/lib/server/admin";
import { jsonError, jsonOk } from "@/lib/server/http";
import { saveConnection } from "@/lib/server/integrations";
import { fetchMetaChannelConfig } from "@/lib/server/meta";

export async function GET() {
  await connection();
  const appId = process.env.META_APP_ID ?? "";
  const configId = process.env.META_EMBEDDED_SIGNUP_CONFIG_ID ?? "";
  return jsonOk({
    appId,
    configId,
    ready: Boolean(appId && configId),
  });
}

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
      "Firebase Admin is required to store WhatsApp.",
    );
  }
  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return jsonError(400, "VALIDATION_ERROR", "Choose a store first.");
  }
  if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) {
    return jsonError(503, "MISSING_CREDENTIALS", "Add META_APP_ID and META_APP_SECRET.");
  }

  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    phoneNumberId?: string;
    wabaId?: string;
  };
  if (!body.code?.trim()) {
    return jsonError(400, "VALIDATION_ERROR", "Missing Embedded Signup code.");
  }

  // Embedded Signup codes are exchanged without redirect_uri.
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    code: body.code.trim(),
  });
  const tokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${params}`,
  );
  const tokenBody = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!tokenRes.ok || !tokenBody.access_token) {
    return jsonError(
      502,
      "UPSTREAM_ERROR",
      tokenBody.error?.message || "Meta did not return a token from Embedded Signup.",
    );
  }

  try {
    let displayName: string | null = "WhatsApp";
    let config: Record<string, string> = {};

    if (body.phoneNumberId) {
      config = {
        phoneNumberId: body.phoneNumberId,
        wabaId: body.wabaId ?? "",
        displayPhone: "",
      };
      displayName = "WhatsApp";
    } else {
      const channel = await fetchMetaChannelConfig("whatsapp", tokenBody.access_token);
      displayName = channel.displayName;
      config = channel.config;
    }

    await saveConnection({
      tenantId,
      provider: "whatsapp",
      displayName,
      config,
      accessToken: tokenBody.access_token,
      refreshToken: null,
      expiresAt: tokenBody.expires_in ? Date.now() + tokenBody.expires_in * 1000 : null,
    });

    return jsonOk({ connected: true, displayName, config });
  } catch (error) {
    return jsonError(
      502,
      "UPSTREAM_ERROR",
      error instanceof Error ? error.message : "Could not finish WhatsApp Embedded Signup.",
    );
  }
}
