export function PageTitle({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-zinc-400">{lede}</p>
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-zinc-950 ${className}`}>
      {children}
    </section>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-5 py-8">
      <p className="text-[15px] font-semibold text-white">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{body}</p>
    </div>
  );
}
