import type { Channel, ConversationMode, OrderStatus, Provider } from "./types";

export function channelLabel(channel: Channel): string {
  switch (channel) {
    case "whatsapp":
      return "WhatsApp";
    case "instagram":
      return "Instagram";
    case "messenger":
      return "Messenger";
  }
}

export function providerLabel(provider: Provider): string {
  switch (provider) {
    case "whatsapp":
      return "WhatsApp";
    case "instagram":
      return "Instagram";
    case "messenger":
      return "Messenger";
    case "shopify":
      return "Shopify";
    case "google_sheets":
      return "Google Sheets";
    case "gmail":
      return "Gmail";
    case "outlook":
      return "Outlook";
  }
}

export function providerBlurb(provider: Provider): string {
  switch (provider) {
    case "whatsapp":
      return "Click Connect → Meta opens → add or confirm your business number → enter the code Meta texts you → return here Connected.";
    case "instagram":
      return "Click Connect → Meta opens → pick the Facebook Page that already has your Instagram Business account linked.";
    case "messenger":
      return "Click Connect → Meta opens → pick the Facebook Page that receives Messenger chats.";
    case "shopify":
      return "Enter your myshopify.com domain, then approve on Shopify (store owner login).";
    case "google_sheets":
      return "Click Connect → pick which Google account owns the Orders sheet (same as Gmail or a different one). Rows land after a customer confirms on WhatsApp.";
    case "gmail":
      return "Click Connect → pick which Google account’s important mail to list on the Email page.";
    case "outlook":
      return "Important Outlook mail, listed on the Email page.";
  }
}

export function modeLabel(mode: ConversationMode): string {
  switch (mode) {
    case "ai_on":
      return "AI on";
    case "paused":
      return "Paused";
    case "human_takeover":
      return "You are replying";
  }
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending_confirm":
      return "Waiting for confirm";
    case "confirmed":
      return "Confirmed";
    case "to_deliver":
      return "To deliver";
    case "on_the_way":
      return "On the way";
    case "delivered":
      return "Delivered";
    case "rated":
      return "Rated";
  }
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending_confirm: "confirmed",
  confirmed: "to_deliver",
  to_deliver: "on_the_way",
  on_the_way: "delivered",
  delivered: "rated",
};

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[status] ?? null;
}

export function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return `${currency} ${(amount / 100).toFixed(0)}`;
  }
}

export function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt).getTime();
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

export function isStoreLocked(input: {
  plan: "starter" | "pro";
  subscriptionStatus: string;
  trialEndsAt: string | null;
}): boolean {
  if (input.plan === "pro" && input.subscriptionStatus === "active") return false;
  if (input.subscriptionStatus === "active") return false;
  if (input.subscriptionStatus === "trialing" && input.trialEndsAt) {
    return Date.now() >= new Date(input.trialEndsAt).getTime();
  }
  return input.subscriptionStatus !== "trialing";
}

export function firebaseErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: string }).code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an InboxShelf account. Log in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is wrong.";
    case "auth/weak-password":
      return "Use at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email.";
    case "auth/popup-blocked":
      return "Google sign-in was blocked. Allow popups, or try again (we will use a full-page login).";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/operation-not-allowed":
      return "This sign-in method is turned off in Firebase Authentication.";
    case "auth/unauthorized-domain":
      return "This domain is not allowed for Google sign-in. Add it in Firebase Authentication settings.";
    case "permission-denied":
      return "Firebase blocked this save. Allow the signed-in owner to read and write their own store in Firestore rules.";
    case "storage/unauthorized":
      return "Firebase Storage blocked this PDF. Allow the owner to write files under their store.";
    default:
      return error instanceof Error
        ? error.message
        : "Something went wrong. Try again.";
  }
}
