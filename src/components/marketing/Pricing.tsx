import Link from "next/link";
import { Reveal } from "./Reveal";

const plans = [
  {
    name: "Starter",
    price: "$10",
    blurb: "Everything you need to run DMs and orders from one shelf.",
    features: [
      "Core omnichannel inbox",
      "FAQ + PDF knowledge base",
      "Google Sheets orders + location",
      "Email triage (Gmail + Outlook)",
      "Human handover & alerts",
      "Owner Assistant",
      "14-day free trial",
    ],
    featured: true,
  },
  {
    name: "Pro",
    price: "$20",
    blurb: "Higher limits and advanced features when volume grows.",
    features: [
      "Everything in Starter",
      "Higher AI & chat limits",
      "Advanced analytics (coming)",
      "Priority support",
      "14-day free trial",
    ],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-slate-50/80 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-[clamp(1.75rem,3vw,2.35rem)] font-normal tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Transparent pricing
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              14-day free trial on all plans. No enterprise theater for early shops.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {plans.map((p, i) => (
            <Reveal key={p.name} delayMs={i * 80}>
              <article
                className={`h-full rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md md:p-10 ${
                  p.featured ? "border-slate-900" : "border-slate-200/90"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">
                    {p.name}
                  </h3>
                  <p className="text-[28px] font-semibold tracking-tight text-slate-900">
                    {p.price}
                    <span className="text-[14px] font-medium text-slate-500">
                      /mo
                    </span>
                  </p>
                </div>
                <p className="mt-3 text-[15px] text-slate-600">{p.blurb}</p>
                <ul className="mt-8 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="text-[14px] text-slate-700">
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-[14px] font-semibold tracking-tight transition ${
                    p.featured
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "border border-slate-200/90 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Start free trial
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
