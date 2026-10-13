import Link from "next/link";

type Tone = "onDark" | "onLight";

type BrandLogoProps = {
  href?: string;
  tone?: Tone;
  size?: "sm" | "md";
  showWordmark?: boolean;
  className?: string;
};

const PALETTE: Record<
  Tone,
  { shelf: string; card: string; cardBar: string; active: string; activeBar: string }
> = {
  onDark: {
    shelf: "#ffffff",
    card: "#d4d4d8",
    cardBar: "#71717a",
    active: "#00e676",
    activeBar: "#052e16",
  },
  onLight: {
    shelf: "#18181b",
    card: "#71717a",
    cardBar: "#e4e4e7",
    active: "#00c853",
    activeBar: "#052e16",
  },
};

function Mark({ sizePx, tone }: { sizePx: number; tone: Tone }) {
  const c = PALETTE[tone];
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
      className="shrink-0"
    >
      <rect x="7" y="3" width="18" height="9.5" rx="2.25" fill={c.active} />
      <rect x="10" y="6.25" width="9.5" height="1.75" rx="0.875" fill={c.activeBar} />
      <rect x="10" y="9" width="6" height="1.75" rx="0.875" fill={c.activeBar} opacity="0.55" />
      <rect x="3" y="14" width="26" height="3" rx="1.5" fill={c.shelf} />

      <rect x="5.5" y="19" width="9.5" height="7" rx="1.75" fill={c.card} />
      <rect x="7.75" y="21.75" width="5" height="1.5" rx="0.75" fill={c.cardBar} />
      <rect x="17" y="19" width="9.5" height="7" rx="1.75" fill={c.card} />
      <rect x="19.25" y="21.75" width="5" height="1.5" rx="0.75" fill={c.cardBar} />
      <rect x="3" y="27.5" width="26" height="3" rx="1.5" fill={c.shelf} />
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
  const sizePx = size === "sm" ? 24 : 30;
  const wordSize = size === "sm" ? "text-[15px]" : "text-[18px]";
  const inboxClass = tone === "onDark" ? "text-white" : "text-zinc-900";
  const shelfClass = tone === "onDark" ? "text-brand" : "text-brand-ink";

  const content = (
    <>
      <Mark sizePx={sizePx} tone={tone} />
      {showWordmark ? (
        <span className={`${wordSize} font-bold tracking-tight`}>
          <span className={inboxClass}>Inbox</span>
          <span className={shelfClass}>Shelf</span>
        </span>
      ) : null}
    </>
  );

  const sharedClass = `inline-flex items-center gap-2.5 ${className}`;
  const label = showWordmark ? undefined : "InboxShelf";

  if (href) {
    return (
      <Link href={href} className={sharedClass} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <span className={sharedClass} aria-label={label}>
      {content}
    </span>
  );
}
