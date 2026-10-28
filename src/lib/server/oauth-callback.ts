import { NextResponse } from "next/server";
import { readState } from "./oauth";
import { saveConnection } from "./integrations";

export function integrationRedirect(origin: string, provider: string, error?: string) {
  const params = new URLSearchParams(
    error ? { error } : { connected: provider },
  );
  return NextResponse.redirect(`${origin}/dashboard/integrations?${params}`);
}

export async function finishOAuth(input: {
  requestUrl: string;
  provider: string;
  exchange: (code: string, origin: string, shop?: string) => Promise<{
    accessToken: string;
    refreshToken: string | null;
    expiresAt: number | null;
    displayName: string | null;
    config?: Record<string, string>;
  }>;
}) {
  const url = new URL(input.requestUrl);
  const state = readState(url.searchParams.get("state"));
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (oauthError) return integrationRedirect(url.origin, input.provider, oauthError);
  if (!state || state.provider !== input.provider || !code) {
    return integrationRedirect(url.origin, input.provider, "The connection link expired. Try again.");
  }
  try {
    const tokens = await input.exchange(code, url.origin, state.shop);
    await saveConnection({
      tenantId: state.tenantId,
      provider: input.provider,
      displayName: tokens.displayName,
      config: tokens.config ?? {},
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    });
    return integrationRedirect(url.origin, input.provider);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed.";
    return integrationRedirect(url.origin, input.provider, message);
  }
}
