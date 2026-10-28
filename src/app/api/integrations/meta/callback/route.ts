import { connection } from "next/server";
import { finishOAuth } from "@/lib/server/oauth-callback";
import { readState } from "@/lib/server/oauth";
import { fetchMetaChannelConfig } from "@/lib/server/meta";

export async function GET(request: Request) {
  await connection();
  const state = readState(new URL(request.url).searchParams.get("state"));
  const provider =
    state?.provider === "instagram" || state?.provider === "messenger"
      ? state.provider
      : "whatsapp";

  async function exchange(code: string, origin: string) {
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID ?? "",
      client_secret: process.env.META_APP_SECRET ?? "",
      redirect_uri: `${origin}/api/integrations/meta/callback`,
      code,
    });
    const response = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?${params}`,
    );
    const body = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: { message?: string };
    };
    if (!response.ok || !body.access_token) {
      throw new Error(body.error?.message || "Meta did not return a token.");
    }

    const channel = await fetchMetaChannelConfig(provider, body.access_token);
    return {
      accessToken: channel.accessToken,
      refreshToken: null,
      expiresAt: body.expires_in ? Date.now() + body.expires_in * 1000 : null,
      displayName: channel.displayName,
      config: channel.config,
    };
  }

  return finishOAuth({ requestUrl: request.url, provider, exchange });
}
