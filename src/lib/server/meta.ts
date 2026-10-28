type GraphError = { error?: { message?: string } };

async function graphGet<T>(path: string, accessToken: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${path}${separator}access_token=${encodeURIComponent(accessToken)}`,
  );
  const body = (await response.json()) as T & GraphError;
  if (!response.ok) {
    throw new Error(body.error?.message || `Meta Graph request failed (${response.status}).`);
  }
  return body;
}

async function graphPost(path: string, accessToken: string, payload: unknown): Promise<void> {
  const response = await fetch(`https://graph.facebook.com/v21.0/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as GraphError;
  if (!response.ok) {
    throw new Error(body.error?.message || `Meta send failed (${response.status}).`);
  }
}

export async function fetchMetaChannelConfig(
  provider: "whatsapp" | "instagram" | "messenger",
  userAccessToken: string,
): Promise<{
  accessToken: string;
  displayName: string | null;
  config: Record<string, string>;
}> {
  if (provider === "whatsapp") {
    type Phone = { id: string; display_phone_number?: string; verified_name?: string };
    type Waba = {
      id: string;
      phone_numbers?: { data?: Phone[] };
    };

    const fromWabas = (wabas: Waba[] | undefined) => {
      for (const waba of wabas ?? []) {
        const phone = waba.phone_numbers?.data?.[0];
        if (phone?.id) {
          return {
            accessToken: userAccessToken,
            displayName: phone.verified_name || phone.display_phone_number || "WhatsApp",
            config: {
              phoneNumberId: phone.id,
              wabaId: waba.id,
              displayPhone: phone.display_phone_number ?? "",
            },
          };
        }
      }
      return null;
    };

    try {
      const direct = await graphGet<{ data?: Waba[] }>(
        "me/whatsapp_business_accounts?fields=id,phone_numbers{id,display_phone_number,verified_name}",
        userAccessToken,
      );
      const hit = fromWabas(direct.data);
      if (hit) return hit;
    } catch {
      // Fall through to business portfolio lookup.
    }

    try {
      const businesses = await graphGet<{
        data?: { id: string; owned_whatsapp_business_accounts?: { data?: Waba[] } }[];
      }>(
        "me/businesses?fields=owned_whatsapp_business_accounts{id,phone_numbers{id,display_phone_number,verified_name}}",
        userAccessToken,
      );
      for (const business of businesses.data ?? []) {
        const hit = fromWabas(business.owned_whatsapp_business_accounts?.data);
        if (hit) return hit;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Missing Permission";
      throw new Error(
        `${message}. Reconnect WhatsApp and approve Business + WhatsApp permissions. If you have no WABA phone yet, add one in Meta WhatsApp → API setup.`,
      );
    }

    throw new Error(
      "No WhatsApp Business phone number was found on this Meta account. Add a phone in Meta WhatsApp → API setup (test number is fine), then reconnect.",
    );
  }

  type Page = {
    id: string;
    name?: string;
    access_token?: string;
    instagram_business_account?: { id: string; username?: string };
  };

  const pageFields =
    "id,name,access_token,instagram_business_account{id,username}";

  async function listPages(): Promise<Page[]> {
    const found: Page[] = [];
    const seen = new Set<string>();
    const push = (items: Page[] | undefined) => {
      for (const item of items ?? []) {
        if (!item.id || seen.has(item.id)) continue;
        seen.add(item.id);
        found.push(item);
      }
    };

    try {
      const direct = await graphGet<{ data?: Page[] }>(
        `me/accounts?fields=${pageFields}`,
        userAccessToken,
      );
      push(direct.data);
    } catch {
      // Fall through to business portfolio lookup.
    }

    try {
      const businesses = await graphGet<{
        data?: {
          id: string;
          owned_pages?: { data?: Page[] };
          client_pages?: { data?: Page[] };
        }[];
      }>(
        `me/businesses?fields=owned_pages{${pageFields}},client_pages{${pageFields}}`,
        userAccessToken,
      );
      for (const business of businesses.data ?? []) {
        push(business.owned_pages?.data);
        push(business.client_pages?.data);
      }
    } catch {
      // Keep whatever we already found from me/accounts.
    }

    return found;
  }

  const pages = await listPages();

  if (provider === "instagram") {
    const page = pages.find((item) => item.instagram_business_account?.id);
    if (!page?.access_token || !page.instagram_business_account?.id) {
      throw new Error(
        "No Instagram Business account linked to a Facebook Page was found. Link IG in Meta Business Suite, then reconnect.",
      );
    }
    return {
      accessToken: page.access_token,
      displayName: page.instagram_business_account.username || page.name || "Instagram",
      config: {
        pageId: page.id,
        igUserId: page.instagram_business_account.id,
      },
    };
  }

  const page = pages[0];
  if (!page?.id || !page.access_token) {
    throw new Error(
      "No Facebook Page was found for Messenger. Create or claim a Page, then reconnect.",
    );
  }
  return {
    accessToken: page.access_token,
    displayName: page.name || "Messenger",
    config: {
      pageId: page.id,
    },
  };
}

export async function sendMetaReply(input: {
  provider: "whatsapp" | "instagram" | "messenger";
  accessToken: string;
  config: Record<string, string>;
  recipientId: string;
  text: string;
}): Promise<void> {
  if (input.provider === "whatsapp") {
    const phoneNumberId = input.config.phoneNumberId;
    if (!phoneNumberId) throw new Error("WhatsApp phone number id is missing.");
    await graphPost(`${phoneNumberId}/messages`, input.accessToken, {
      messaging_product: "whatsapp",
      to: input.recipientId,
      type: "text",
      text: { body: input.text },
    });
    return;
  }

  const pageId = input.config.pageId;
  if (!pageId) throw new Error("Facebook Page id is missing.");
  await graphPost(`${pageId}/messages`, input.accessToken, {
    recipient: { id: input.recipientId },
    messaging_type: "RESPONSE",
    message: { text: input.text },
  });
}
