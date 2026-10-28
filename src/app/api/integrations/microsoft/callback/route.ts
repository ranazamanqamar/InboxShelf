import { connection } from "next/server";
import { finishOAuth } from "@/lib/server/oauth-callback";

async function exchange(code: string, origin: string) {
  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
        redirect_uri: `${origin}/api/integrations/microsoft/callback`,
        grant_type: "authorization_code",
      }),
    },
  );
  const body = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || "Microsoft did not return a token.");
  }
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? null,
    expiresAt: body.expires_in ? Date.now() + body.expires_in * 1000 : null,
    displayName: "Outlook",
  };
}

export async function GET(request: Request) {
  await connection();
  return finishOAuth({ requestUrl: request.url, provider: "outlook", exchange });
}
