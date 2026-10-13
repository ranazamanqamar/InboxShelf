import type { ReactNode } from "react";

type Integration = {
  name: string;
  nameClass: string;
  mark: (uid: string) => ReactNode;
};

const INTEGRATIONS: Integration[] = [
  {
    name: "WhatsApp",
    nameClass: "text-[#25D366]",
    mark: () => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path
          fill="#25D366"
          d="M12.04 2C6.58 2 2.15 6.43 2.15 11.89c0 1.94.57 3.76 1.56 5.3L2 22l4.96-1.64a9.86 9.86 0 0 0 5.08 1.37h.01c5.46 0 9.89-4.43 9.89-9.89C21.94 6.43 17.5 2 12.04 2zm5.77 14.02c-.24.67-1.4 1.23-1.93 1.31-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.45.27-.29.59-.36.79-.36h.57c.18 0 .42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.32.02.51-.1.2-.14.32-.28.49-.14.17-.3.38-.42.51-.14.14-.28.29-.12.56.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.17-.2.7-.81.89-1.09.18-.28.37-.23.62-.14.25.1 1.58.75 1.85.88.27.14.45.2.52.31.07.12.07.67-.17 1.34z"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    nameClass: "text-zinc-100",
    mark: (uid) => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <defs>
          <linearGradient id={uid} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F58529" />
            <stop offset="50%" stopColor="#DD2A7B" />
            <stop offset="100%" stopColor="#515BD4" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${uid})`}
          d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-2.28.1-3.34 1.19-3.44 3.44-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.1 2.24 1.16 3.33 3.44 3.44 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c2.27-.1 3.34-1.2 3.44-3.44.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.1-2.25-1.17-3.33-3.44-3.44-1.24-.06-1.61-.07-4.76-.07zm0 3.06a5.18 5.18 0 1 1 0 10.36 5.18 5.18 0 0 1 0-10.36zm0 1.8a3.38 3.38 0 1 0 0 6.76 3.38 3.38 0 0 0 0-6.76zm5.4-2.1a1.21 1.21 0 1 1 0 2.42 1.21 1.21 0 0 1 0-2.42z"
        />
      </svg>
    ),
  },
  {
    name: "Messenger",
    nameClass: "text-[#0084FF]",
    mark: () => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path
          fill="#0084FF"
          d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.42 3.14 7.17V22l3.05-1.67c1.15.32 2.37.49 3.81.49 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.01 13.08-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z"
        />
      </svg>
    ),
  },
  {
    name: "Website chat",
    nameClass: "text-zinc-300",
    mark: () => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path
          fill="#E4E4E7"
          d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4.2 3.15A.75.75 0 0 1 3.5 19.5V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3.25 5.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm4.75 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm4.75 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"
        />
      </svg>
    ),
  },
  {
    name: "Shopify",
    nameClass: "text-[#95BF47]",
    mark: () => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path
          fill="#95BF47"
          d="M15.34 3.2s-.2-.16-.5-.1l-1.56.48c-.1-.3-.28-.68-.6-.97-.4-.37-.93-.54-1.5-.48-.98.1-1.92.74-2.5 1.7-.44.74-.62 1.62-.62 2.3l-1.5.46s-.4.12-.38.58c.02.1.12.78.18 1.02l.18.74.02.08v.02c.06.28.56 2.3.66 2.68l.06.24.74 2.92.2.76.18.66c.04.14.08.26.1.36l.02.06.02.1.02.06c.04.14.06.24.06.24l.02.06.14.48.04.1.22.72.04.12c.02.04.04.08.06.1l.02.02.02.04.08.14.02.02.08.12.04.04.06.08.02.02.04.04.08.08.04.04.04.04.06.04.02.02.08.04.04.02.06.02h.02l.08.02h.04l4.68.9 3.32.64s.4.08.48-.22c.02-.06.16-.54.34-1.22.02-.08.02-.14.04-.22.06-.28.14-.62.22-1.02l.5-2.5.42-2.12.36-1.8c.02-.12.04-.24.06-.36.02-.14.06-.28.08-.42.02-.14.04-.28.06-.4.02-.14.04-.26.06-.38.02-.12.04-.22.04-.3.02-.1.04-.18.04-.24 0-.02 0-.04.02-.06.02-.14-.08-.22-.22-.26l-1.16-.34-1.5-.44V5.26l-.02-.18c0-.58-.08-1.4-.5-1.88z"
        />
        <path
          fill="#5E8E3E"
          d="M13.34 5.98c-.08.02-.18.06-.28.08l-.06 1.74s-.56-.2-1.16-.2c-1.72 0-2.56 1.08-2.56 2.18 0 .84.62 1.8 2.12 1.8.98 0 1.62-.34 1.62-.34l.06 1.9s-.72.26-1.72.26c-2.86 0-4.24-1.82-4.24-3.7 0-2.44 1.72-4.84 5.14-4.84.9 0 1.48.18 1.48.18l-.4.94z"
        />
      </svg>
    ),
  },
  {
    name: "Google Sheets",
    nameClass: "text-[#0F9D58]",
    mark: () => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path fill="#0F9D58" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        <path fill="#87CEAC" d="M14 2v6h6" />
        <path
          fill="#fff"
          d="M8 11h8v8H8zm1 1v2h2.5v-2H9zm3.5 0v2H15v-2h-2.5zM9 15v2h2.5v-2H9zm3.5 0v2H15v-2h-2.5z"
        />
      </svg>
    ),
  },
  {
    name: "Gmail",
    nameClass: "text-zinc-300",
    mark: () => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path fill="#EA4335" d="M3 6.5V18h3.5V10.8L12 15l5.5-4.2V18H21V6.5L12 13.2 3 6.5z" />
        <path fill="#C5221F" d="M3 6.5 12 13.2 3 6.5z" opacity=".3" />
        <path fill="#FBBC04" d="M21 6.5 12 13.2l9-6.7z" opacity=".35" />
        <path fill="#34A853" d="M21 6.5V18h-3.5V10.8L21 6.5z" />
        <path fill="#4285F4" d="M3 6.5V18h3.5V10.8L3 6.5z" />
      </svg>
    ),
  },
  {
    name: "Outlook",
    nameClass: "text-[#0078D4]",
    mark: () => (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path fill="#0078D4" d="M3 5.5A1.5 1.5 0 0 1 4.5 4H12v16H4.5A1.5 1.5 0 0 1 3 18.5v-13z" />
        <path
          fill="#28A8EA"
          d="M12 4h7.5A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5H12V4z"
        />
        <circle fill="#fff" cx="8" cy="12" r="2.6" />
      </svg>
    ),
  },
];

/** Light-sheet name colors when tone is onLight */
const LIGHT_NAME: Record<string, string> = {
  WhatsApp: "text-[#25D366]",
  Instagram: "text-zinc-900",
  Messenger: "text-[#0084FF]",
  "Website chat": "text-zinc-800",
  Shopify: "text-[#95BF47]",
  "Google Sheets": "text-[#0F9D58]",
  Gmail: "text-zinc-600",
  Outlook: "text-[#0078D4]",
};

function IntegrationItem({
  item,
  uid,
  tone,
}: {
  item: Integration;
  uid: string;
  tone: "onDark" | "onLight";
}) {
  const nameClass =
    tone === "onLight" ? (LIGHT_NAME[item.name] ?? item.nameClass) : item.nameClass;

  return (
    <li className="flex shrink-0 items-center gap-2.5 px-5 sm:px-7">
      <span className="flex size-9 items-center justify-center">{item.mark(uid)}</span>
      <span
        className={`whitespace-nowrap text-[15px] font-semibold tracking-tight sm:text-base ${nameClass}`}
      >
        {item.name}
      </span>
    </li>
  );
}

function IntegrationTrack({
  suffix,
  tone,
}: {
  suffix: string;
  tone: "onDark" | "onLight";
}) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {INTEGRATIONS.map((item) => (
        <IntegrationItem
          key={`${suffix}-${item.name}`}
          item={item}
          uid={`ig-${suffix}-${item.name.replace(/\s+/g, "")}`}
          tone={tone}
        />
      ))}
    </ul>
  );
}

export function IntegrationsStrip({
  tone = "onDark",
}: {
  tone?: "onDark" | "onLight";
}) {
  const onDark = tone === "onDark";

  return (
    <section
      id="integrations"
      aria-label="Integrations"
      className={
        onDark
          ? "w-full max-w-none bg-transparent px-0 pt-8 pb-0"
          : "scroll-mt-28 border-t border-zinc-100 bg-zinc-50 px-0 pb-14 pt-14 sm:pb-16 sm:pt-16"
      }
    >
      <div className="mx-auto flex max-w-6xl justify-center px-5 sm:px-8">
        <p
          className={
            onDark
              ? "inline-flex items-center rounded-full border border-white/15 bg-transparent px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-zinc-400"
              : "inline-flex items-center rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-zinc-500"
          }
        >
          INTEGRATIONS
        </p>
      </div>

      <p className="sr-only">
        Connects to WhatsApp, Instagram, Messenger, Website chat, Shopify, Google
        Sheets, Gmail, and Outlook.
      </p>

      <div
        className={`integrations-marquee relative mt-6 overflow-hidden sm:mt-7 ${
          onDark ? "integrations-marquee--on-dark" : ""
        }`}
      >
        <div className="integrations-marquee-track">
          <IntegrationTrack suffix="a" tone={tone} />
          <IntegrationTrack suffix="b" tone={tone} />
        </div>
        <ul
          className="integrations-marquee-static mx-auto hidden max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-5 px-5 sm:px-8"
          aria-hidden
        >
          {INTEGRATIONS.map((item) => (
            <IntegrationItem
              key={`static-${item.name}`}
              item={item}
              uid={`ig-static-${item.name.replace(/\s+/g, "")}`}
              tone={tone}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
