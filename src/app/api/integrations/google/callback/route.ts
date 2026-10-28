import { connection } from "next/server";
import { finishOAuth } from "@/lib/server/oauth-callback";
import { readState } from "@/lib/server/oauth";

async function googleAccountEmail(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { email?: string };
    const email = body.email?.trim();
    return email || null;
  } catch {
    return null;
  }
}

async function exchange(code: string, origin: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: `${origin}/api/integrations/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const body = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || "Google did not return a token.");
  }
  const email = await googleAccountEmail(body.access_token);
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? null,
    expiresAt: body.expires_in ? Date.now() + body.expires_in * 1000 : null,
    displayName: email ?? "Google",
  };
}

export async function GET(request: Request) {
  await connection();
  const state = readState(new URL(request.url).searchParams.get("state"));
  const provider = state?.provider === "google_sheets" ? "google_sheets" : "gmail";
  return finishOAuth({ requestUrl: request.url, provider, exchange });
}
