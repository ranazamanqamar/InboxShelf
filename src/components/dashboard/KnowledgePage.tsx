"use client";

import { useEffect, useState } from "react";
import { addFaq, removeKnowledge, uploadKnowledgePdf, watchKnowledge } from "@/lib/dashboard/data";
import { firebaseErrorMessage, formatWhen } from "@/lib/dashboard/format";
import type { KnowledgeDoc } from "@/lib/dashboard/types";
import { useDashboard } from "./dashboard-context";
import { Empty, PageTitle, Panel } from "./ui";

export function KnowledgePage() {
  const { tenant } = useDashboard();
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    return watchKnowledge(tenant.id, setDocs, setError);
  }, [tenant]);

  async function saveFaq(event: React.FormEvent) {
    event.preventDefault();
    if (!tenant) return;
    setPending(true);
    setError(null);
    try {
      await addFaq(tenant.id, title, text);
      setTitle("");
      setText("");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function onPdf(file: File | undefined) {
    if (!tenant || !file) return;
    setPending(true);
    setError(null);
    try {
      await uploadKnowledgePdf(tenant.id, file);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageTitle
        title="Knowledge"
        lede="FAQs and PDFs the agent is allowed to use. It will not invent stock, prices, or specs."
      />
      {error ? <p className="mb-3 text-[13px] text-red-300">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-[15px] font-semibold text-white">Add an FAQ</h2>
          <form className="mt-4 space-y-3" onSubmit={saveFaq}>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Question or title"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white outline-none focus:border-brand"
            />
            <textarea
              required
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="The answer the agent can use"
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white outline-none focus:border-brand"
            />
            <button type="submit" disabled={pending} className="btn-primary px-4 py-2 text-[13px]">
              Save FAQ
            </button>
          </form>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-[15px] font-semibold text-white">Upload a PDF</h2>
          <p className="mt-2 text-[13px] text-zinc-500">10 MB maximum. The file is stored for this store only.</p>
          <label className="btn-quiet mt-4 cursor-pointer px-4 py-2 text-[13px]">
            Choose PDF
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => onPdf(event.target.files?.[0])}
            />
          </label>
        </Panel>
      </div>
      <Panel className="mt-4">
        {docs.length === 0 ? (
          <Empty title="Nothing on the shelf yet" body="Add an FAQ or a PDF and the agent can use it." />
        ) : (
          <ul className="divide-y divide-white/10">
            {docs.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-[14px] font-medium">{item.title}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    {item.type === "pdf" ? "PDF" : "FAQ"} · {item.status} · {formatWhen(item.createdAt)}
                  </p>
                  {item.text ? <p className="mt-2 text-[13px] text-zinc-400">{item.text}</p> : null}
                </div>
                <button
                  type="button"
                  className="text-[12px] font-semibold text-zinc-500 hover:text-red-300"
                  onClick={() => tenant && removeKnowledge(tenant.id, item).catch((err) => setError(firebaseErrorMessage(err)))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
