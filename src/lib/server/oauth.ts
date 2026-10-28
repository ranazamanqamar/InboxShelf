import { createHmac, timingSafeEqual } from "crypto";

type StatePayload = {
  tenantId: string;
  provider: string;
  uid: string;
  shop?: string;
  exp: number;
};

function stateSecret(): string | null {
  return process.env.OAUTH_STATE_SECRET || process.env.FIREBASE_PRIVATE_KEY || null;
}

export function signState(payload: Omit<StatePayload, "exp">): string | null {
  const secret = stateSecret();
  if (!secret) return null;
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 10 * 60_000 }),
  ).toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readState(state: string | null): StatePayload | null {
  const secret = stateSecret();
  if (!secret || !state || !state.includes(".")) return null;
  const [body, mac] = state.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as StatePayload;
  if (!payload.exp || payload.exp < Date.now()) return null;
  return payload;
}

export function requiredEnv(names: string[]): string | null {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length === 0) return null;
  return `Add ${missing.join(", ")} on the server before this channel can connect.`;
}

export function googleAuthUrl(input: {
  origin: string;
  provider: "gmail" | "google_sheets";
  state: string;
  loginHint?: string;
  forceAccountPicker?: boolean;
}): string {
  const baseScope =
    input.provider === "gmail"
      ? "https://www.googleapis.com/auth/gmail.readonly"
      : "https://www.googleapis.com/auth/spreadsheets";
  // userinfo.email so Connect can store and show which Google account was chosen
  const scope = `${baseScope} https://www.googleapis.com/auth/userinfo.email openid`;
  const loginHint = input.loginHint?.trim();
  const forcePicker = Boolean(input.forceAccountPicker) || !loginHint;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${input.origin}/api/integrations/google/callback`,
    response_type: "code",
    scope,
    access_type: "offline",
    // First connect: account picker. Reconnect: reuse linked email via login_hint.
    prompt: forcePicker ? "select_account consent" : "consent",
    state: input.state,
  });
  if (loginHint) params.set("login_hint", loginHint);
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function microsoftAuthUrl(input: { origin: string; state: string }): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
    redirect_uri: `${input.origin}/api/integrations/microsoft/callback`,
    response_type: "code",
    scope: "offline_access Mail.Read",
    state: input.state,
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
}

export function metaAuthUrl(input: {
  origin: string;
  provider: "whatsapp" | "instagram" | "messenger";
  state: string;
}): string {
  const scopes: Record<typeof input.provider, string> = {
    whatsapp:
      "whatsapp_business_management,whatsapp_business_messaging,business_management",
    instagram:
      "instagram_basic,instagram_manage_messages,pages_show_list,pages_messaging,business_management",
    messenger: "pages_messaging,pages_manage_metadata,pages_show_list,business_management",
  };
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID ?? "",
    redirect_uri: `${input.origin}/api/integrations/meta/callback`,
    state: input.state,
    scope: scopes[input.provider],
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
}

export function shopifyAuthUrl(input: {
  shop: string;
  origin: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY ?? "",
    scope: "read_orders,write_orders",
    redirect_uri: `${input.origin}/api/integrations/shopify/callback`,
    state: input.state,
  });
  return `https://${input.shop}/admin/oauth/authorize?${params}`;
}
