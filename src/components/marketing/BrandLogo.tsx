import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  tone?: "onDark" | "onLight";
  size?: "sm" | "md";
  showWordmark?: boolean;
  className?: string;
};

function Mark({
  sizePx,
  glow,
  shelfStroke,
}: {
  sizePx: number;
  glow: boolean;
  shelfStroke: string;
}) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
      className={
        glow
          ? "shrink-0 drop-shadow-[0_0_10px_color-mix(in_srgb,var(--brand)_65%,transparent)]"
          : "shrink-0"
      }
    >
      {/* Back shelf rail */}
      <path
        d="M4 11.5h24"
        stroke={shelfStroke}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Front shelf rail */}
      <path
        d="M3 22h26"
        stroke={shelfStroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Side brackets */}
      <path
        d="M5 11.5V22M27 11.5V22"
        stroke={shelfStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Inbox tray on shelf */}
      <path
        d="M8 14.5h16l-1.6 6.2a1.6 1.6 0 0 1-1.55 1.2H11.15a1.6 1.6 0 0 1-1.55-1.2L8 14.5Z"
        fill="var(--brand)"
      />
      {/* Message fold / flap */}
      <path
        d="M8.4 14.8 16 19.2l7.6-4.4"
        stroke="#000"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      {/* Small chat notch on tray */}
      <circle cx="16" cy="12.2" r="1.35" fill="var(--brand)" />
    </svg>
  );
}

export function BrandLogo({
  href = "/",
  tone = "onDark",
  size = "md",
  showWordmark = true,
  className = "",
}: BrandLogoProps) {
  const sizePx = size === "sm" ? 20 : 24;
  const shelfStroke = tone === "onDark" ? "rgba(255,255,255,0.72)" : "#3f3f46";
  const wordClass =
    tone === "onDark"
      ? "text-white"
      : "text-zinc-900";
  const wordSize = size === "sm" ? "text-sm" : "text-[15px]";

  const content = (
    <>
      <Mark sizePx={sizePx} glow={tone === "onDark"} shelfStroke={shelfStroke} />
      {showWordmark ? (
        <span className={`${wordSize} font-semibold tracking-tight ${wordClass}`}>
          InboxShelf
        </span>
      ) : null}
    </>
  );

  const sharedClass = `inline-flex items-center gap-2.5 ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={sharedClass}
        aria-label={showWordmark ? undefined : "InboxShelf"}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      className={sharedClass}
      aria-label={showWordmark ? undefined : "InboxShelf"}
    >
      {content}
    </span>
  );
}
