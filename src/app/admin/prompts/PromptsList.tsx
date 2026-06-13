"use client";

import { useState } from "react";
import { PROMPTS, CATEGORY_ORDER } from "@/lib/prompts";
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
        copied ? "bg-emerald-500 text-white" : "bg-violet-500 text-white hover:bg-violet-600"
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
    <div className="space-y-8">
      <p className="text-sm text-zinc-500">
        Готовые промпты под бесплатные модели (DeepSeek, ChatGPT). Скопируй, подставь данные клиента в [скобках] и
        отправь нейросети. Промпт под конкретного клиента можно собрать автоматически на карточке заявки.
      </p>

      {CATEGORY_ORDER.map((cat) => {
        const items = PROMPTS.filter((p) => p.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">{cat}</h2>
            <div className="space-y-4">
              {items.map((p) => (
                <div key={p.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-zinc-900">{p.title}</h3>
                    <CopyButton text={p.text} />
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-700">{p.text}</pre>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
