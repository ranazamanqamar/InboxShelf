"use client";

import type { ReactNode } from "react";
import { FileSpreadsheet, Sparkles } from "lucide-react";

export const WORKFLOW_SCENES = [
  {
    header: "Inbox · Instagram DM",
    outcome: "AI answers only from your uploaded FAQ & PDFs — no invented prices.",
    live: "Step 1: Customer asks about a product. AI replies from knowledge.",
  },
  {
    header: "Unified inbox · Website chat",
    outcome: "When they want to buy, AI sends your site order link.",
    live: "Step 2: Customer ready to order. AI sends order link and asks for delivery area.",
  },
  {
    header: "WhatsApp · order phone +92 300 555 0192",
    outcome: "Confirm goes to the WhatsApp number on the order — not another thread.",
    live: "Step 3: Order summary on the customer's order phone with confirm question.",
  },
  {
    header: "Google Sheet · Orders",
    outcome: 'On "Yes", InboxShelf writes a deduped row with location and status.',
    live: "Step 4: Sheet row updated with name, phone, location, confirmed status.",
  },
  {
    header: "You in Sheets → customer WhatsApp",
    outcome: "Your delivery tick triggers the on-the-way message automatically.",
    live: "Step 5: Owner marks on the way; customer receives WhatsApp update.",
  },
  {
    header: "WhatsApp · order phone +92 300 555 0192",
    outcome: "After they receive it, AI asks for an in-chat rating 1–5.",
    live: "Step 6: Customer received order. AI asks for rating and optional review link.",
  },
] as const;

function CustomerBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-white/10 bg-zinc-800/90 px-3.5 py-2.5 text-[13px] leading-relaxed text-zinc-100 sm:max-w-[85%]">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        Customer
      </p>
      {children}
    </div>
  );
}

function AiBubble({ children }: { children: ReactNode }) {
  return (
    <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md border border-brand/25 bg-zinc-950 px-3.5 py-2.5 text-[13px] leading-relaxed text-zinc-100 sm:max-w-[85%]">
      <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
        <Sparkles size={10} aria-hidden />
        InboxShelf AI
      </p>
      {children}
    </div>
  );
}

function SceneChrome({
  header,
  outcome,
  badge,
  footer,
  live,
  children,
}: {
  header: string;
  outcome: string;
  badge?: string;
  footer?: ReactNode;
  live: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-zinc-400">{header}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-brand sm:text-[15px]">
            {outcome}
          </p>
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold text-brand">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="sr-only">{live}</p>
      <div className="flex flex-1 flex-col justify-center gap-3 py-4 sm:py-5">
        {children}
      </div>
      {footer ? (
        <div className="mt-auto border-t border-white/10 pt-3 text-center text-[11px] text-zinc-400 sm:text-xs">
          {footer}
        </div>
      ) : null}
    </>
  );
}

function SceneKnowledge() {
  return (
    <SceneChrome
      header={WORKFLOW_SCENES[0].header}
      outcome={WORKFLOW_SCENES[0].outcome}
      badge="Knowledge only"
      live={WORKFLOW_SCENES[0].live}
    >
      <CustomerBubble>
        Is the linen shirt still available in size M? What&apos;s the fabric
        blend?
      </CustomerBubble>
      <AiBubble>
        From your FAQ: 100% organic linen, sizes S–XL. M is in stock on the
        site — I won&apos;t quote a price that isn&apos;t in your docs.
      </AiBubble>
    </SceneChrome>
  );
}

function SceneOrderLink() {
  return (
    <SceneChrome
      header={WORKFLOW_SCENES[1].header}
      outcome={WORKFLOW_SCENES[1].outcome}
      live={WORKFLOW_SCENES[1].live}
    >
      <CustomerBubble>Great — I&apos;m ready to order the linen shirt in M.</CustomerBubble>
      <AiBubble>
        <span>
          Here&apos;s your store checkout — add your{" "}
          <span className="font-medium text-brand">delivery city/area</span> on
          the form:
        </span>
        <span className="mt-2 block rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-[12px] font-semibold text-brand">
          inboxshelf.demo/order/linen-shirt-m
        </span>
      </AiBubble>
    </SceneChrome>
  );
}

function SceneWhatsAppConfirm() {
  return (
    <SceneChrome
      header={WORKFLOW_SCENES[2].header}
      outcome={WORKFLOW_SCENES[2].outcome}
      live={WORKFLOW_SCENES[2].live}
      footer={
        <>
          Not the Instagram thread — messages the{" "}
          <span className="text-zinc-300">phone on the order</span>.
        </>
      }
    >
      <AiBubble>
        <span className="text-zinc-300">Order summary · #1048</span>
        <span className="mt-2 block text-white">
          1× Linen shirt (M) · Karachi · PKR 4,200
        </span>
        <span className="mt-2 block font-medium text-white">
          Do you confirm your order? Reply YES to confirm.
        </span>
      </AiBubble>
      <CustomerBubble>YES — confirm please.</CustomerBubble>
    </SceneChrome>
  );
}

function SceneSheets() {
  return (
    <SceneChrome
      header={WORKFLOW_SCENES[3].header}
      outcome={WORKFLOW_SCENES[3].outcome}
      live={WORKFLOW_SCENES[3].live}
      footer={
        <>
          Same person on IG + WA →{" "}
          <span className="text-brand">one row</span>, duplicates skipped.
        </>
      }
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <FileSpreadsheet size={14} className="text-brand" aria-hidden />
          <span className="text-xs font-medium text-white">Orders</span>
        </div>
        <div className="overflow-x-auto px-3 py-2 text-[10px] text-zinc-500 sm:text-[11px]">
          <div className="grid min-w-[520px] grid-cols-6 gap-2 border-b border-white/5 pb-2 font-semibold uppercase tracking-wide">
            <span>Name</span>
            <span>Phone</span>
            <span>Location</span>
            <span>Items</span>
            <span>Channel</span>
            <span>Status</span>
          </div>
          <div className="grid min-w-[520px] grid-cols-6 gap-2 py-2.5 text-zinc-300">
            <span className="font-medium text-white">Ayesha Khan</span>
            <span>+92 300 555 0192</span>
            <span>Karachi</span>
            <span>Linen shirt M</span>
            <span>WA + site</span>
            <span>
              <span className="rounded bg-brand/15 px-1.5 py-0.5 font-medium text-brand">
                confirmed
              </span>
            </span>
          </div>
        </div>
      </div>
    </SceneChrome>
  );
}

function SceneDeliverySplit() {
  return (
    <SceneChrome
      header={WORKFLOW_SCENES[4].header}
      outcome={WORKFLOW_SCENES[4].outcome}
      live={WORKFLOW_SCENES[4].live}
      footer={
        <>
          You tick <span className="font-medium text-zinc-200">On the way</span>{" "}
          → customer gets this WhatsApp
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-[2fr_3fr] sm:gap-4">
        <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Your sheet / orders
          </p>
          <p className="mt-2 text-xs text-white">#1048 · Ayesha Khan</p>
          <label className="mt-3 flex cursor-default items-center gap-2 rounded-lg border border-brand/40 bg-brand/10 px-2.5 py-2">
            <span
              className="flex size-4 items-center justify-center rounded border border-brand bg-brand text-[10px] font-bold text-black"
              aria-hidden
            >
              ✓
            </span>
            <span className="text-[12px] font-medium text-brand">On the way</span>
          </label>
          <p className="mt-2 text-[10px] text-zinc-500">Status → on_the_way</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Customer WhatsApp
          </p>
          <div className="mt-3 space-y-2">
            <AiBubble>
              Your order #1048 is on the way to Karachi. Reply when you receive
              it so we can close the loop.
            </AiBubble>
          </div>
        </div>
      </div>
    </SceneChrome>
  );
}

function SceneRating() {
  return (
    <SceneChrome
      header={WORKFLOW_SCENES[5].header}
      outcome={WORKFLOW_SCENES[5].outcome}
      live={WORKFLOW_SCENES[5].live}
    >
      <CustomerBubble>Got it — package received, thanks!</CustomerBubble>
      <AiBubble>
        <span>Glad it arrived! How would you rate the linen shirt?</span>
        <div
          className="mt-3 flex flex-wrap gap-1.5"
          role="img"
          aria-label="Rating choices 1 through 5"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`flex size-8 items-center justify-center rounded-lg border text-[12px] font-semibold ${
                n === 5
                  ? "border-brand bg-brand/20 text-brand"
                  : "border-white/15 text-zinc-400"
              }`}
            >
              {n}
            </span>
          ))}
        </div>
        <span className="mt-3 block rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-400">
          Optional: leave a review on the site → inboxshelf.demo/review
        </span>
      </AiBubble>
    </SceneChrome>
  );
}

const SCENE_COMPONENTS = [
  SceneKnowledge,
  SceneOrderLink,
  SceneWhatsAppConfirm,
  SceneSheets,
  SceneDeliverySplit,
  SceneRating,
] as const;

type WorkflowStepPreviewProps = {
  activeStep: number;
  reducedMotion?: boolean;
};

export function WorkflowStepPreview({
  activeStep,
  reducedMotion = false,
}: WorkflowStepPreviewProps) {
  const index = Math.min(Math.max(activeStep, 0), SCENE_COMPONENTS.length - 1);
  const Scene = SCENE_COMPONENTS[index];

  return (
    <div className="relative mx-auto mt-10 min-h-[360px] max-w-3xl">
      <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#1a3d2a_0%,#09090b_55%,#000_100%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div
        key={index}
        className={`relative z-10 flex min-h-[360px] flex-col rounded-[1.75rem] border border-white/10 bg-zinc-950/40 p-5 backdrop-blur-sm sm:p-6 ${
          reducedMotion ? "" : "workflow-scene-enter"
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <Scene />
      </div>
    </div>
  );
}
