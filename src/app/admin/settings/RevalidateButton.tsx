"use client";

import { useState } from "react";

export default function RevalidateButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function go() {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/revalidate", { method: "POST" });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <section className="max-w-2xl rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Обновить сайт</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Если изменения не видны сразу — нажми, чтобы сразу применить свежие тексты, тему и контакты на сайте.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={go}
          disabled={status === "loading"}
          className="w-full rounded-full bg-violet-500 px-6 py-2.5 font-medium text-white transition hover:bg-violet-600 disabled:opacity-60 sm:w-auto"
        >
          {status === "loading" ? "Обновляем…" : "Обновить сайт сейчас"}
        </button>
        {status === "done" && (
          <span className="text-sm text-emerald-600">Готово ✓ Обнови страницу на телефоне (потяни вниз).</span>
        )}
        {status === "error" && <span className="text-sm text-violet-600">Не получилось, попробуй ещё раз.</span>}
      </div>
    </section>
  );
}
