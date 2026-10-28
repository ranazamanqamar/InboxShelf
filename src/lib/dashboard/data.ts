import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { getClientAuth, getClientDb, getClientStorage } from "@/lib/firebase/client";
import { firebaseErrorMessage, nextOrderStatus } from "./format";
import {
  CHANNELS,
  type AlertItem,
  type AssistantMessage,
  type Channel,
  type ChatMessage,
  type Conversation,
  type ConversationMode,
  type Integration,
  type KnowledgeDoc,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OwnerProfile,
  type Provider,
  type Tenant,
} from "./types";

function iso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "object" && value && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toISOString();
  }
  if (typeof value === "string") return value;
  return null;
}

function asString(value: unknown, fallback: string | null = null): string | null {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

export function watchAuth(onChange: (user: User | null) => void): () => void {
  return onAuthStateChanged(getClientAuth(), onChange);
}

const FIRESTORE_TIMEOUT =
  "This Firebase project has no Firestore database named (default). Create it in the Firebase console, then deploy firestore.rules so the owner can save their store.";

function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(FIRESTORE_TIMEOUT)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function signUpWithEmail(input: {
  storeName: string;
  email: string;
  password: string;
}): Promise<void> {
  const auth = getClientAuth();
  await auth.authStateReady();
  if (auth.currentUser) {
    await signOut(auth);
  }
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password,
  );
  await updateProfile(credential.user, { displayName: input.storeName.trim() });
  await withTimeout(createFirstStore(credential.user, input.storeName.trim(), "password"));
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getClientAuth(), email.trim(), password);
}

const GOOGLE_STORE_KEY = "inboxshelf.googleStoreName";
const GOOGLE_REDIRECT_KEY = "inboxshelf.googleRedirect";
/** Survives Strict Mode remount after GOOGLE_REDIRECT_KEY is cleared. */
const GOOGLE_REDIRECT_DONE_KEY = "inboxshelf.googleRedirectDone";

/** In-memory twin of DONE — survives React remounts in the same JS context. */
let googleRedirectJustCompleted = false;

async function finishGoogleUser(user: User, storeName?: string): Promise<void> {
  const existing = await readProfile(user.uid);
  if (!existing) {
    const name = storeName?.trim() || user.displayName || "My store";
    await withTimeout(createFirstStore(user, name, "google"));
  } else {
    await updateDoc(doc(getClientDb(), "users", user.uid), {
      lastLoginAt: serverTimestamp(),
    });
  }
}

function rememberGoogleStoreName(storeName?: string) {
  const trimmed = storeName?.trim();
  if (typeof window === "undefined") return trimmed;
  if (trimmed) window.sessionStorage.setItem(GOOGLE_STORE_KEY, trimmed);
  else window.sessionStorage.removeItem(GOOGLE_STORE_KEY);
  return trimmed;
}

function takeGoogleStoreName(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const value = window.sessionStorage.getItem(GOOGLE_STORE_KEY) ?? undefined;
  window.sessionStorage.removeItem(GOOGLE_STORE_KEY);
  return value;
}

function markGoogleRedirectDone() {
  googleRedirectJustCompleted = true;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(GOOGLE_REDIRECT_DONE_KEY, "1");
  }
}

/** Call once the user has landed on the dashboard (or a fresh Google attempt starts). */
export function clearGoogleRedirectMarkers() {
  googleRedirectJustCompleted = false;
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GOOGLE_REDIRECT_DONE_KEY);
}

function hadGoogleRedirectInProgress(): boolean {
  if (googleRedirectJustCompleted) return true;
  if (typeof window === "undefined") return false;
  return (
    window.sessionStorage.getItem(GOOGLE_REDIRECT_KEY) === "1" ||
    window.sessionStorage.getItem(GOOGLE_REDIRECT_DONE_KEY) === "1"
  );
}

function googleProvider(mode: "login" | "signup") {
  const provider = new GoogleAuthProvider();
  if (mode === "signup") {
    provider.setCustomParameters({ prompt: "select_account" });
  }
  return provider;
}

/**
 * Google sign-in via popup. Redirect is unreliable on localhost (getRedirectResult
 * returns null / no session), which bounced users back to login/signup.
 * Signup forces the account picker; login reuses the last Google account.
 */
export async function signInWithGoogle(
  storeNameOrOptions?: string | { storeName?: string; mode?: "login" | "signup" },
  maybeMode?: "login" | "signup",
): Promise<"signed-in" | "redirecting"> {
  const options =
    typeof storeNameOrOptions === "object" && storeNameOrOptions !== null
      ? storeNameOrOptions
      : { storeName: storeNameOrOptions, mode: maybeMode };
  const mode = options.mode ?? (options.storeName ? "signup" : "login");
  rememberGoogleStoreName(options.storeName);
  clearGoogleRedirectMarkers();

  const auth = getClientAuth();
  const provider = googleProvider(mode);
  const credential = await signInWithPopup(auth, provider);
  takeGoogleStoreName();
  await finishGoogleUser(credential.user, options.storeName);
  return "signed-in";
}

/**
 * Finish auth when returning from a Google redirect.
 * Always calls getRedirectResult (once per return). Ambient sessions are
 * handled by resolveAuthPageBoot.
 */
export async function completeGoogleRedirect(): Promise<boolean> {
  const auth = getClientAuth();
  await auth.authStateReady();

  const expectingRedirect =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(GOOGLE_REDIRECT_KEY) === "1";

  // Already finished this page load (Strict Mode remount) — keep markers for boot.
  if (googleRedirectJustCompleted && auth.currentUser) {
    return true;
  }

  let redirectUser: User | null = null;
  try {
    const result = await getRedirectResult(auth);
    redirectUser = result?.user ?? null;
  } catch (error) {
    if (typeof window !== "undefined" && expectingRedirect) {
      window.sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
    }
    throw error;
  }

  // Success: redirect result user, or flag was set and session already restored.
  const user = redirectUser ?? (expectingRedirect ? auth.currentUser : null);

  if (typeof window !== "undefined" && expectingRedirect) {
    window.sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
  }

  if (!user) {
    // Redirect returned to the app but Firebase never established a session
    // (common on localhost without a same-origin auth handler proxy).
    if (expectingRedirect) {
      takeGoogleStoreName();
      throw new Error(
        "Google sign-in did not finish after redirect. Allow popups for this site and try again, or use email instead.",
      );
    }
    return false;
  }

  // Set DONE before finishing so a Strict Mode remount never treats this as ambient.
  markGoogleRedirectDone();

  const storeName = takeGoogleStoreName();
  await finishGoogleUser(user, storeName);
  return true;
}

/**
 * Login reuses a session. Signup clears an ambient session so new credentials
 * can be collected — but never signs out a just-completed Google redirect.
 */
export async function resolveAuthPageBoot(
  mode: "login" | "signup",
): Promise<"go-dashboard" | "show-form"> {
  const wasGoogleRedirect = hadGoogleRedirectInProgress();

  if (await completeGoogleRedirect()) return "go-dashboard";

  const auth = getClientAuth();
  await auth.authStateReady();
  const user = auth.currentUser;

  if (!user) return "show-form";

  if (mode === "login") return "go-dashboard";

  // Signup after Google redirect (including Strict Mode remount where the
  // redirect key was already cleared) — never sign out.
  if (wasGoogleRedirect || hadGoogleRedirectInProgress()) {
    await finishGoogleUser(user, takeGoogleStoreName());
    return "go-dashboard";
  }

  // Ambient session: opened /signup while already logged in.
  await signOut(auth);
  return "show-form";
}

export async function logOut(): Promise<void> {
  await signOut(getClientAuth());
}

async function readProfile(uid: string): Promise<OwnerProfile | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(
      doc(getClientDb(), "users", uid),
      (snap) => {
        unsubscribe();
        resolve(snap.exists() ? mapProfile(uid, snap.data()) : null);
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );
  });
}

export async function createFirstStore(
  user: User,
  storeName: string,
  authProvider: "password" | "google",
): Promise<string> {
  const db = getClientDb();
  const tenantRef = doc(collection(db, "tenants"));
  const trialEnds = Timestamp.fromDate(new Date(Date.now() + 14 * 86_400_000));
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  await setDoc(tenantRef, {
    name: storeName,
    ownerUid: user.uid,
    plan: "starter",
    trialEndsAt: trialEnds,
    subscriptionStatus: "trialing",
    billingRef: null,
    proSince: null,
    shopUrl: null,
    orderLink: null,
    storePlatform: null,
    logoPath: null,
    currency: "USD",
    timezone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, "users", user.uid), {
    tenantIds: [tenantRef.id],
    activeTenantId: tenantRef.id,
    trialUsedAt: serverTimestamp(),
    email: user.email ?? "",
    displayName: user.displayName ?? storeName,
    role: "owner",
    authProvider,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return tenantRef.id;
}

function mapProfile(uid: string, data: DocumentData): OwnerProfile {
  return {
    uid,
    email: asString(data.email, "") ?? "",
    displayName: asString(data.displayName),
    tenantIds: Array.isArray(data.tenantIds) ? data.tenantIds.map(String) : [],
    activeTenantId: asString(data.activeTenantId, "") ?? "",
    trialUsedAt: iso(data.trialUsedAt),
    role: "owner",
    authProvider: data.authProvider === "google" ? "google" : "password",
  };
}

function mapTenant(id: string, data: DocumentData): Tenant {
  return {
    id,
    name: asString(data.name, "Store") ?? "Store",
    ownerUid: asString(data.ownerUid, "") ?? "",
    plan: data.plan === "pro" ? "pro" : "starter",
    trialEndsAt: iso(data.trialEndsAt),
    subscriptionStatus: data.subscriptionStatus ?? "trialing",
    billingRef: asString(data.billingRef),
    proSince: iso(data.proSince),
    shopUrl: asString(data.shopUrl),
    orderLink: asString(data.orderLink),
    storePlatform:
      data.storePlatform === "shopify" || data.storePlatform === "website"
        ? data.storePlatform
        : null,
    logoPath: asString(data.logoPath),
    currency: asString(data.currency, "USD") ?? "USD",
    timezone: asString(data.timezone, "UTC") ?? "UTC",
  };
}

export function watchProfile(
  uid: string,
  onData: (profile: OwnerProfile | null) => void,
  onError: (message: string) => void,
): () => void {
  return onSnapshot(
    doc(getClientDb(), "users", uid),
    (snap) => onData(snap.exists() ? mapProfile(uid, snap.data()) : null),
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchTenant(
  tenantId: string,
  onData: (tenant: Tenant | null) => void,
  onError: (message: string) => void,
): () => void {
  return onSnapshot(
    doc(getClientDb(), "tenants", tenantId),
    (snap) => onData(snap.exists() ? mapTenant(tenantId, snap.data()) : null),
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchConversations(
  tenantId: string,
  onData: (rows: Conversation[]) => void,
  onError: (message: string) => void,
): () => void {
  const q = query(
    collection(getClientDb(), "tenants", tenantId, "conversations"),
    orderBy("lastMessageAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            channel: ((CHANNELS as readonly string[]).includes(data.channel)
              ? data.channel
              : "whatsapp") as Channel,
            externalThreadId: asString(data.externalThreadId, "") ?? "",
            customerName: asString(data.customerName),
            customerPhone: asString(data.customerPhone),
            customerHandle: asString(data.customerHandle),
            mode: (data.mode ?? "ai_on") as ConversationMode,
            language: asString(data.language),
            lastMessageAt: iso(data.lastMessageAt),
            lastMessagePreview: asString(data.lastMessagePreview, "") ?? "",
            unreadCount: asNumber(data.unreadCount),
          };
        }),
      );
    },
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchMessages(
  tenantId: string,
  conversationId: string,
  onData: (rows: ChatMessage[]) => void,
  onError: (message: string) => void,
): () => void {
  const q = query(
    collection(
      getClientDb(),
      "tenants",
      tenantId,
      "conversations",
      conversationId,
      "messages",
    ),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            role: data.role ?? "customer",
            text: asString(data.text, "") ?? "",
            channelMessageId: asString(data.channelMessageId),
            deliveryStatus: data.deliveryStatus ?? null,
            createdAt: iso(data.createdAt),
          };
        }),
      );
    },
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchOrders(
  tenantId: string,
  onData: (rows: Order[]) => void,
  onError: (message: string) => void,
): () => void {
  const q = query(
    collection(getClientDb(), "tenants", tenantId, "orders"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          const items = Array.isArray(data.items) ? (data.items as OrderItem[]) : [];
          return {
            id: item.id,
            source: data.source ?? "chat",
            externalId: asString(data.externalId),
            conversationId: asString(data.conversationId),
            customerName: asString(data.customerName, "Customer") ?? "Customer",
            customerPhone: asString(data.customerPhone, "") ?? "",
            location: asString(data.location, "") ?? "",
            address: asString(data.address),
            items,
            total: asNumber(data.total),
            currency: asString(data.currency, "USD") ?? "USD",
            status: (data.status ?? "pending_confirm") as OrderStatus,
            rating: typeof data.rating === "number" ? data.rating : null,
            sheetsSyncedAt: iso(data.sheetsSyncedAt),
            createdAt: iso(data.createdAt),
          };
        }),
      );
    },
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchKnowledge(
  tenantId: string,
  onData: (rows: KnowledgeDoc[]) => void,
  onError: (message: string) => void,
): () => void {
  const q = query(
    collection(getClientDb(), "tenants", tenantId, "knowledge"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            type: data.type === "pdf" ? "pdf" : "faq",
            title: asString(data.title, "Untitled") ?? "Untitled",
            text: asString(data.text),
            storagePath: asString(data.storagePath),
            sizeBytes: typeof data.sizeBytes === "number" ? data.sizeBytes : null,
            status: data.status ?? "ready",
            createdAt: iso(data.createdAt),
          };
        }),
      );
    },
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchAlerts(
  tenantId: string,
  onData: (rows: AlertItem[]) => void,
  onError: (message: string) => void,
): () => void {
  const q = query(
    collection(getClientDb(), "tenants", tenantId, "alerts"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            type: data.type === "handover" ? "handover" : "stuck",
            conversationId: asString(data.conversationId, "") ?? "",
            reason: asString(data.reason, "") ?? "",
            createdAt: iso(data.createdAt),
            ackedAt: iso(data.ackedAt),
          };
        }),
      );
    },
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchIntegrations(
  tenantId: string,
  onData: (rows: Integration[]) => void,
  onError: (message: string) => void,
): () => void {
  return onSnapshot(
    collection(getClientDb(), "tenants", tenantId, "integrations"),
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          const config =
            data.config && typeof data.config === "object"
              ? Object.fromEntries(
                  Object.entries(data.config as Record<string, unknown>).map(
                    ([key, value]) => [key, String(value ?? "")],
                  ),
                )
              : {};
          return {
            id: item.id as Provider,
            status: data.status ?? "disconnected",
            displayName: asString(data.displayName),
            config,
            lastError: asString(data.lastError),
            connectedAt: iso(data.connectedAt),
          };
        }),
      );
    },
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export function watchAssistant(
  tenantId: string,
  onData: (rows: AssistantMessage[]) => void,
  onError: (message: string) => void,
): () => void {
  const q = query(
    collection(
      getClientDb(),
      "tenants",
      tenantId,
      "assistantThreads",
      "default",
      "messages",
    ),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            role: data.role === "bot" ? "bot" : "owner",
            text: asString(data.text, "") ?? "",
            intent: asString(data.intent),
            createdAt: iso(data.createdAt),
          };
        }),
      );
    },
    (error) => onError(firebaseErrorMessage(error)),
  );
}

export async function setConversationMode(
  tenantId: string,
  conversationId: string,
  mode: ConversationMode,
): Promise<void> {
  await updateDoc(
    doc(getClientDb(), "tenants", tenantId, "conversations", conversationId),
    { mode },
  );
}

export async function markConversationRead(
  tenantId: string,
  conversationId: string,
): Promise<void> {
  await updateDoc(
    doc(getClientDb(), "tenants", tenantId, "conversations", conversationId),
    { unreadCount: 0 },
  );
}

export async function sendHumanReply(
  tenantId: string,
  conversation: Conversation,
  text: string,
): Promise<void> {
  if (conversation.mode === "ai_on") {
    throw new Error("Pause this chat before you reply. The agent owns it while AI is on.");
  }
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(
    collection(
      getClientDb(),
      "tenants",
      tenantId,
      "conversations",
      conversation.id,
      "messages",
    ),
    {
      role: "human",
      text: trimmed,
      channelMessageId: null,
      deliveryStatus: "queued",
      mediaRef: null,
      createdAt: serverTimestamp(),
    },
  );
  await updateDoc(
    doc(getClientDb(), "tenants", tenantId, "conversations", conversation.id),
    {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: trimmed.slice(0, 120),
      unreadCount: 0,
      mode: "human_takeover",
    },
  );
}

export async function addFaq(
  tenantId: string,
  title: string,
  text: string,
): Promise<void> {
  await addDoc(collection(getClientDb(), "tenants", tenantId, "knowledge"), {
    type: "faq",
    title: title.trim(),
    text: text.trim(),
    storagePath: null,
    sizeBytes: null,
    contentType: null,
    status: "ready",
    createdAt: serverTimestamp(),
  });
}

export async function uploadKnowledgePdf(tenantId: string, file: File): Promise<void> {
  if (file.type !== "application/pdf") {
    throw new Error("Upload a PDF.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("PDFs must be 10 MB or smaller.");
  }
  const db = getClientDb();
  const knowledgeRef = doc(collection(db, "tenants", tenantId, "knowledge"));
  const storagePath = `tenants/${tenantId}/knowledge/${knowledgeRef.id}.pdf`;
  await setDoc(knowledgeRef, {
    type: "pdf",
    title: file.name.replace(/\.pdf$/i, ""),
    text: null,
    storagePath: null,
    sizeBytes: file.size,
    contentType: "application/pdf",
    status: "processing",
    createdAt: serverTimestamp(),
  });
  try {
    await uploadBytes(ref(getClientStorage(), storagePath), file, {
      contentType: "application/pdf",
    });
    await updateDoc(knowledgeRef, { storagePath, status: "ready" });
  } catch (error) {
    await updateDoc(knowledgeRef, { status: "failed" });
    throw error;
  }
}

export async function removeKnowledge(tenantId: string, item: KnowledgeDoc): Promise<void> {
  if (item.storagePath) {
    await deleteObject(ref(getClientStorage(), item.storagePath)).catch(() => undefined);
  }
  await deleteDoc(doc(getClientDb(), "tenants", tenantId, "knowledge", item.id));
}

export async function clearConversation(
  tenantId: string,
  conversationId: string,
): Promise<void> {
  const response = await authedFetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/clear`,
    tenantId,
    { method: "POST" },
  );
  const body = (await response.json()) as { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message || "Could not clear this chat.");
  }
}

export async function testAgentReply(
  tenantId: string,
  text: string,
): Promise<{ status: string; text: string }> {
  const response = await authedFetch("/api/agent/test", tenantId, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  const body = (await response.json()) as {
    status?: string;
    text?: string;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message || "Agent test failed.");
  }
  return { status: body.status ?? "replied", text: body.text ?? "" };
}

export async function advanceOrder(
  tenantId: string,
  order: Order,
  rating?: number,
): Promise<string> {
  const next = nextOrderStatus(order.status);
  if (!next) throw new Error("This order is already finished.");
  if (next === "rated" && (rating == null || rating < 1 || rating > 5)) {
    throw new Error("Pick a rating from 1 to 5.");
  }
  const response = await authedFetch(`/api/orders/${order.id}/advance`, tenantId, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });
  const body = (await response.json()) as {
    message?: string;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message || "Could not advance this order.");
  }
  return body.message || `Marked ${next.replaceAll("_", " ")}.`;
}

export async function acknowledgeAlert(tenantId: string, alertId: string): Promise<void> {
  await updateDoc(doc(getClientDb(), "tenants", tenantId, "alerts", alertId), {
    ackedAt: serverTimestamp(),
  });
}

export async function updateStore(
  tenantId: string,
  patch: Partial<
    Pick<Tenant, "name" | "shopUrl" | "orderLink" | "currency" | "timezone" | "storePlatform">
  >,
): Promise<void> {
  await updateDoc(doc(getClientDb(), "tenants", tenantId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}


export async function pauseForMissingKnowledge(
  tenantId: string,
  conversationId: string,
  reason: string,
): Promise<void> {
  await updateDoc(doc(getClientDb(), "tenants", tenantId, "conversations", conversationId), {
    mode: "paused",
  });
  await addDoc(collection(getClientDb(), "tenants", tenantId, "alerts"), {
    type: "stuck",
    conversationId,
    reason,
    channelsNotified: ["dashboard"],
    createdAt: serverTimestamp(),
    ackedAt: null,
  });
  await addDoc(
    collection(
      getClientDb(),
      "tenants",
      tenantId,
      "conversations",
      conversationId,
      "messages",
    ),
    {
      role: "system",
      text: reason,
      channelMessageId: null,
      deliveryStatus: null,
      mediaRef: null,
      createdAt: serverTimestamp(),
    },
  );
}

export async function postAssistantTurn(
  tenantId: string,
  ownerText: string,
  botText: string,
  intent: string | null,
): Promise<void> {
  const messages = collection(
    getClientDb(),
    "tenants",
    tenantId,
    "assistantThreads",
    "default",
    "messages",
  );
  await addDoc(messages, {
    role: "owner",
    text: ownerText,
    intent: null,
    result: null,
    createdAt: serverTimestamp(),
  });
  await addDoc(messages, {
    role: "bot",
    text: botText,
    intent,
    result: null,
    createdAt: serverTimestamp(),
  });
}

export async function authedFetch(
  path: string,
  tenantId: string,
  init?: RequestInit,
): Promise<Response> {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("Log in again.");
  const token = await user.getIdToken();
  return fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-Id": tenantId,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
}
