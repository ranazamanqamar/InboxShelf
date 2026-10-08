import { Reveal } from "./Reveal";

const features = [
  {
    title: "Omnichannel Inbox",
    body: "WhatsApp Cloud API, Instagram DM, Messenger, and Website Chat under one roof—so your team stops hopping tabs.",
  },
  {
    title: "Zero-Error AI Knowledge",
    body: "RAG-powered agent answers FAQs and product questions using only your uploaded PDFs and FAQs—no invented pricing or stock.",
  },
  {
    title: "Automated Google Sheets Sync",
    body: "Direct webhook ingest from Shopify and chat orders, capturing full details, items, quantities, and delivery locations automatically.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-24 bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-[clamp(1.75rem,3vw,2.35rem)] font-normal tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Built for Store Owners Drowning in Tabs
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              One calm shelf for every channel, every answer, every order row.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delayMs={i * 70}>
              <article className="h-full rounded-2xl border border-slate-200/90 bg-slate-50/80 p-8 shadow-sm transition-all hover:bg-white hover:shadow-md">
                <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                  {f.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
