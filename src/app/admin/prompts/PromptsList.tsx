"use client";

import { useState } from "react";
import { PROMPTS } from "@/lib/prompts";
import { CheckIcon } from "@/components/icons";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }
  return (
    <button
      onClick={copy}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
        copied ? "bg-emerald-500 text-white" : "bg-rose-500 text-white hover:bg-rose-600"
      }`}
    >
      {copied ? (
        <span className="inline-flex items-center gap-1.5">
          <CheckIcon className="h-4 w-4" /> Скопировано
        </span>
      ) : (
        "Скопировать"
      )}
    </button>
  );
}

export default function PromptsList() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Готовые промпты для ChatGPT/Claude. Скопируй, подставь данные клиента в [скобках] и отправь нейросети.
      </p>
      {PROMPTS.map((p) => (
        <div key={p.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-zinc-900">{p.title}</h2>
            <CopyButton text={p.text} />
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-700">{p.text}</pre>
        </div>
      ))}
    </div>
  );
}
