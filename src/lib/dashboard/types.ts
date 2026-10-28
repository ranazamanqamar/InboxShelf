export const CHANNELS = ["whatsapp", "instagram", "messenger"] as const;

export type Channel = (typeof CHANNELS)[number];

export const PROVIDERS = [
  "whatsapp",
  "instagram",
  "messenger",
  "shopify",
  "google_sheets",
  "gmail",
  "outlook",
] as const;

export type Provider = (typeof PROVIDERS)[number];

export type ConversationMode = "ai_on" | "paused" | "human_takeover";

export type OrderStatus =
  | "pending_confirm"
  | "confirmed"
  | "to_deliver"
  | "on_the_way"
  | "delivered"
  | "rated";

export type OrderSource = "shopify" | "website" | "chat";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "locked";

export type OwnerProfile = {
  uid: string;
  email: string;
  displayName: string | null;
  tenantIds: string[];
  activeTenantId: string;
  trialUsedAt: string | null;
  role: "owner";
  authProvider: "password" | "google";
};

export type Tenant = {
  id: string;
  name: string;
  ownerUid: string;
  plan: "starter" | "pro";
  trialEndsAt: string | null;
  subscriptionStatus: SubscriptionStatus;
  billingRef: string | null;
  proSince: string | null;
  shopUrl: string | null;
  orderLink: string | null;
  storePlatform: "shopify" | "website" | null;
  logoPath: string | null;
  currency: string;
  timezone: string;
};

export type Conversation = {
  id: string;
  channel: Channel;
  externalThreadId: string;
  customerName: string | null;
  customerPhone: string | null;
  customerHandle: string | null;
  mode: ConversationMode;
  language: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  role: "customer" | "ai" | "human" | "system";
  text: string;
  channelMessageId: string | null;
  deliveryStatus: "queued" | "sent" | "delivered" | "read" | "failed" | null;
  createdAt: string | null;
};

export type OrderItem = {
  name: string;
  qty: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  source: OrderSource;
  externalId: string | null;
  conversationId: string | null;
  customerName: string;
  customerPhone: string;
  location: string;
  address: string | null;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  rating: number | null;
  sheetsSyncedAt: string | null;
  createdAt: string | null;
};

export type KnowledgeDoc = {
  id: string;
  type: "faq" | "pdf";
  title: string;
  text: string | null;
  storagePath: string | null;
  sizeBytes: number | null;
  status: "processing" | "ready" | "failed";
  createdAt: string | null;
};

export type AlertItem = {
  id: string;
  type: "handover" | "stuck";
  conversationId: string;
  reason: string;
  createdAt: string | null;
  ackedAt: string | null;
};

export type Integration = {
  id: Provider;
  status: "disconnected" | "connected" | "mock" | "error";
  displayName: string | null;
  config: Record<string, string>;
  lastError: string | null;
  connectedAt: string | null;
};

export type AssistantMessage = {
  id: string;
  role: "owner" | "bot";
  text: string;
  intent: string | null;
  createdAt: string | null;
};

export type CredentialFlags = {
  firebaseAdmin: boolean;
  meta: boolean;
  metaVerifyToken: boolean;
  metaEmbeddedSignup: boolean;
  google: boolean;
  microsoft: boolean;
  shopify: boolean;
  openai: boolean;
  paddle: boolean;
  resend: boolean;
};
