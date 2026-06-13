"use client";

import { useEffect, useState } from "react";
import { buildTrainingPrompt, buildNutritionPrompt } from "@/lib/clientPrompts";
import { CheckIcon } from "@/components/icons";

export default function ClientPromptBuilder({ lead }: { lead: Record<string, unknown> }) {
  const [tab, setTab] = useState<"training" | "nutrition">("training");
  const [text, setText] = useState(() => buildTrainingPrompt(lead));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(tab === "training" ? buildTrainingPrompt(lead) : buildNutritionPrompt(lead));
    setCopied(false);
  }, [tab, lead]);

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
    <div className="rounded-2xl border-2 border-violet-300 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">✨ Промпт для нейросети под этого клиента</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Данные анкеты уже подставлены. Скопируй → вставь в DeepSeek или ChatGPT → готовую программу перенеси в конструктор PDF.
      </p>

      <div className="mt-4 flex gap-2">
        {(["training", "nutrition"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-violet-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {t === "training" ? "Тренировки" : "Питание"}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className="mt-3 w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-3 font-sans text-sm leading-6 text-zinc-900 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200"
      />

      <button
        onClick={copy}
        className={`mt-3 rounded-full px-6 py-2.5 text-sm font-medium text-white transition ${
          copied ? "bg-emerald-500" : "bg-violet-500 hover:bg-violet-600"
        }`}
      >
        {copied ? (
          <span className="inline-flex items-center gap-1.5">
            <CheckIcon className="h-4 w-4" /> Скопировано
          </span>
        ) : (
          "Скопировать промпт"
        )}
      </button>
    </div>
  );
}
