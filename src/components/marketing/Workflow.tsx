import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Product Q&A & Site Link",
    body: "AI answers questions accurately from your knowledge base, then sends your site order link when the customer is ready to buy.",
  },
  {
    n: "02",
    title: "WhatsApp Confirmation",
    body: "Auto-messages the customer’s provided WhatsApp number to confirm order details and delivery location before the row is locked in.",
  },
  {
    n: "03",
    title: "Google Sheets & Delivery Tick",
    body: "Owner marks “on the way” in Sheets—triggering automated delivery updates to that customer on WhatsApp.",
  },
  {
    n: "04",
    title: "In-Chat Rating",
    body: "After they confirm receipt, collect a 1–5 rating right inside the chat, then optionally send a site review link.",
  },
];

export function Workflow() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-slate-50/80 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-[clamp(1.75rem,3vw,2.35rem)] font-normal tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              From First Question to 5-Star Review, Fully Automated
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              The order messaging lifecycle your PRD specifies—confirm, ship,
              receive, rate.
            </p>
          </div>
        </Reveal>
        <ol className="mx-auto mt-12 grid max-w-3xl gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delayMs={i * 60}>
              <li className="flex gap-5 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <span className="shrink-0 text-[13px] font-semibold tracking-wide text-slate-400">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                    {s.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
