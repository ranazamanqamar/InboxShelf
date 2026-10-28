import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./admin";

const SHEET_TITLE = "InboxShelf Orders";
const HEADERS = [
  "Order ID",
  "Date",
  "Source",
  "External ID",
  "Customer",
  "Phone",
  "Location",
  "Address",
  "Items",
  "Total",
  "Currency",
  "Status",
  "Rating",
];

type OrderRow = {
  id: string;
  source: string;
  externalId: string | null;
  customerName: string;
  customerPhone: string;
  location: string;
  address: string | null;
  items: { name: string; qty: number; unitPrice: number }[];
  total: number;
  currency: string;
  status: string;
  rating: number | null;
  createdAt?: Date | null;
};

async function refreshAccessToken(tenantId: string): Promise<string> {
  const db = adminDb();
  const secretRef = db.doc(`tenantSecrets/${tenantId}/tokens/google_sheets`);
  const secret = await secretRef.get();
  if (!secret.exists) throw new Error("Google Sheets is not connected.");

  const accessToken = secret.get("accessToken") as string | undefined;
  const refreshToken = secret.get("refreshToken") as string | null | undefined;
  const expiresAt = secret.get("expiresAt") as number | null | undefined;
  if (accessToken && expiresAt && Date.now() < expiresAt - 60_000) {
    return accessToken;
  }
  if (!refreshToken) {
    if (!accessToken) throw new Error("Google Sheets tokens are missing.");
    return accessToken;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const body = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || "Could not refresh Google Sheets token.");
  }
  await secretRef.set(
    {
      accessToken: body.access_token,
      expiresAt: body.expires_in ? Date.now() + body.expires_in * 1000 : null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return body.access_token;
}

async function ensureSpreadsheet(tenantId: string, accessToken: string): Promise<string> {
  const db = adminDb();
  const integration = db.doc(`tenants/${tenantId}/integrations/google_sheets`);
  const snap = await integration.get();
  const existing = (snap.get("config") as Record<string, string> | undefined)?.spreadsheetId;
  if (existing) return existing;

  const create = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title: SHEET_TITLE },
      sheets: [{ properties: { title: "Orders" } }],
    }),
  });
  const created = (await create.json()) as {
    spreadsheetId?: string;
    error?: { message?: string };
  };
  if (!create.ok || !created.spreadsheetId) {
    throw new Error(created.error?.message || "Could not create the Orders spreadsheet.");
  }

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values/Orders!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [HEADERS] }),
    },
  );

  const config = {
    ...((snap.get("config") as Record<string, string> | undefined) ?? {}),
    spreadsheetId: created.spreadsheetId,
  };
  await integration.set({ config, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return created.spreadsheetId;
}

function formatItems(items: OrderRow["items"]): string {
  return items.map((item) => `${item.name} x${item.qty}`).join("; ");
}

function formatMoney(total: number, currency: string): string {
  return `${(total / 100).toFixed(2)} ${currency}`;
}

/** Append (or update by Order ID column) after customer confirms. */
export async function syncOrderToSheets(
  tenantId: string,
  order: OrderRow,
): Promise<{ sheetsRowRef: string }> {
  const accessToken = await refreshAccessToken(tenantId);
  const spreadsheetId = await ensureSpreadsheet(tenantId, accessToken);

  const row = [
    order.id,
    (order.createdAt ?? new Date()).toISOString().slice(0, 10),
    order.source,
    order.externalId ?? "",
    order.customerName,
    order.customerPhone,
    order.location,
    order.address ?? "",
    formatItems(order.items),
    formatMoney(order.total, order.currency),
    order.currency,
    order.status,
    order.rating == null ? "" : String(order.rating),
  ];

  const append = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Orders!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    },
  );
  const body = (await append.json()) as {
    updates?: { updatedRange?: string };
    error?: { message?: string };
  };
  if (!append.ok) {
    throw new Error(body.error?.message || "Google Sheets append failed.");
  }
  return { sheetsRowRef: body.updates?.updatedRange ?? "Orders" };
}
