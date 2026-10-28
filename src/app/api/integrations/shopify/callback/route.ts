import { connection } from "next/server";
import { finishOAuth } from "@/lib/server/oauth-callback";

async function exchange(code: string, _origin: string, shop?: string) {
  if (!shop) throw new Error("Missing Shopify shop domain.");
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  const body = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || "Shopify did not return a token.");
  }
  return {
    accessToken: body.access_token,
    refreshToken: null,
    expiresAt: null,
    displayName: shop,
    config: { shop },
  };
}

export async function GET(request: Request) {
  await connection();
  return finishOAuth({ requestUrl: request.url, provider: "shopify", exchange });
}
