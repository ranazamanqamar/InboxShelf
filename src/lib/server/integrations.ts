import { FieldValue } from "firebase-admin/firestore";
import { adminConfigured, adminDb } from "./admin";

export async function saveConnection(input: {
  tenantId: string;
  provider: string;
  displayName: string | null;
  config: Record<string, string>;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
}): Promise<void> {
  if (!adminConfigured()) {
    throw new Error("Firebase Admin credentials are required to store this connection.");
  }
  const db = adminDb();
  await db.doc(`tenantSecrets/${input.tenantId}/tokens/${input.provider}`).set({
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    webhookSecret: null,
    expiresAt: input.expiresAt,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await db.doc(`tenants/${input.tenantId}/integrations/${input.provider}`).set(
    {
      provider: input.provider,
      status: "connected",
      displayName: input.displayName,
      config: input.config,
      lastError: null,
      connectedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export function credentialFlags() {
  return {
    firebaseAdmin: adminConfigured(),
    meta: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
    metaVerifyToken: Boolean(process.env.META_VERIFY_TOKEN),
    metaEmbeddedSignup: Boolean(
      process.env.META_APP_ID && process.env.META_EMBEDDED_SIGNUP_CONFIG_ID,
    ),
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    microsoft: Boolean(
      process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET,
    ),
    shopify: Boolean(process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET),
    openai: Boolean(process.env.OPENAI_API_KEY),
    paddle: Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_PRICE_ID_PRO),
    resend: Boolean(process.env.RESEND_API_KEY),
  };
}
