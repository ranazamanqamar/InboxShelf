"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "channels",
    q: "Which channels does InboxShelf support?",
    a: "WhatsApp Business, Instagram DM, Messenger, and a website chat widget. TikTok and native apps are planned for later Pro modules.",
  },
  {
    id: "knowledge",
    q: "Will the AI make up prices or stock?",
    a: "No. Replies come from your uploaded FAQs and PDFs only. If the bot is unsure, it escalates instead of inventing product details.",
  },
  {
    id: "order-flow",
    q: "How does ordering work in chat?",
    a: "The AI answers product questions, sends your site order link when the customer is ready, captures delivery location, confirms on the WhatsApp number on the order, then logs a deduped row in Google Sheets.",
  },
  {
    id: "whatsapp-confirm",
    q: "Why WhatsApp confirm on a specific number?",
    a: "Confirm and delivery messages go to the phone number provided on the order — not a random DM thread — so status updates reach the right person.",
  },
  {
    id: "sheets",
    q: "What gets written to Google Sheets?",
    a: "Order id, customer name, phone, location, items, channel, price, and status (pending confirm through delivered and rated). Duplicates across channels are merged into one row.",
  },
  {
    id: "delivery",
    q: "Who triggers “on the way” messages?",
    a: "You control it. When you tick delivery status in Sheets or Orders (e.g. on the way), InboxShelf sends the WhatsApp update and asks the customer to notify when received.",
  },
  {
    id: "handover",
    q: "What happens when the AI gets stuck?",
    a: "That chat pauses auto-reply only. You get alerts on WhatsApp, email, and the dashboard, then reply from the inbox composer while other conversations keep running.",
  },
  {
    id: "email-assistant",
    q: "What about email and the Assistant?",
    a: "Connect Gmail and Outlook to surface important mail. The Assistant is a private owner↔bot chat for ops (e.g. list today’s important emails) — it does not message your customers in MVP.",
  },
  {
    id: "pricing",
    q: "How much does it cost?",
    a: "Starter is a free 14-day trial of the full product. After that, Pro is $10/mo — the Most Popular paid plan.",
  },
] as const;

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  return (
    <section
      id="faq"
      className="scroll-mt-28 border-t border-zinc-100 bg-zinc-50 px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-brand">Questions</span>
          <br />
          <span className="text-zinc-900">before you start trial</span>
        </h2>
        <p className="mt-4 text-center text-base text-zinc-600">
          Straight answers on channels, orders, Sheets, and handover.
        </p>

        <ul className="mt-10 space-y-2">
          {FAQ_ITEMS.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  id={`faq-${item.id}`}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className={`group flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 ${
                    open
                      ? "border-brand bg-white"
                      : "border-zinc-200 bg-white/80 hover:border-brand focus-visible:border-brand"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold sm:text-[15px] ${
                      open
                        ? "text-brand"
                        : "text-zinc-900 group-hover:text-brand group-focus-visible:text-brand"
                    }`}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`mt-0.5 shrink-0 transition-transform ${
                      open
                        ? "rotate-180 text-brand"
                        : "text-zinc-500 group-hover:text-brand group-focus-visible:text-brand"
                    }`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-${item.id}`}
                  hidden={!open}
                  className={open ? "px-1 pb-2 pt-1" : ""}
                >
                  {open ? (
                    <p className="rounded-lg bg-white px-4 py-3 text-sm leading-relaxed text-zinc-600">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
