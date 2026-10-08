import { Reveal } from "./Reveal";

const highlights = [
  {
    title: "Private Owner Assistant",
    body: "Ask “List my important emails today” in a separate owner↔bot thread—never mixed into customer DMs.",
  },
  {
    title: "Smart human handover",
    body: "When the AI is stuck, that chat pauses and you’re notified on WhatsApp, Gmail, and the dashboard—other chats keep running.",
  },
  {
    title: "Instant WhatsApp alerts",
    body: "Escalations and delivery ticks reach the right people fast, so nothing sits unread in a tab graveyard.",
  },
];

export function AssistantSection() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Owner ops
              </p>
              <h2
                className="mt-3 text-[clamp(1.75rem,3vw,2.35rem)] font-normal tracking-tight text-slate-900"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                Your shelf has a private assistant, too.
              </h2>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-slate-600">
                Run the shop from one command center—customer inbox on one side,
                owner Assistant and alerts on the other.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-4">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delayMs={i * 70}>
                <article className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-8 shadow-sm transition-all hover:bg-white hover:shadow-md">
                  <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">
                    {h.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                    {h.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
