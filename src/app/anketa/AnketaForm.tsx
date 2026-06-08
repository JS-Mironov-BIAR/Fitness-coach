"use client";

import { useState } from "react";
import Link from "next/link";
import { ANKETA_GROUPS, type AnketaField } from "@/lib/anketa";

type Values = Record<string, string>;
type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-rose-200 bg-rose-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder-zinc-500";

function Field({
  field,
  value,
  onChange,
}: {
  field: AnketaField;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className={field.full ? "sm:col-span-2" : ""}>
      <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {field.label}
        {field.required && <span className="text-rose-500"> *</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={field.name}
          name={field.name}
          rows={3}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={inputClass}
        />
      ) : field.type === "select" ? (
        <select
          id={field.name}
          name={field.name}
          value={value}
          required={field.required}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={inputClass}
        >
          <option value="">—</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.name}
          name={field.name}
          type={field.type === "number" ? "number" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function AnketaForm() {
  const [values, setValues] = useState<Values>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Не удалось отправить анкету");
      }
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Что-то пошло не так");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="text-4xl">💜</div>
        <h2 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Спасибо! Анкета отправлена</h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Я посмотрю твои ответы и свяжусь с тобой в ближайшее время. Без спешки и без
          навязывания — обсудим, как тебе помочь.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-rose-500 px-6 py-2.5 font-medium text-white transition hover:bg-rose-600"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {ANKETA_GROUPS.map((group) => (
        <fieldset
          key={group.title}
          className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
        >
          <legend className="px-1 text-lg font-semibold text-rose-700 dark:text-rose-300">
            {group.emoji} {group.title}
          </legend>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <Field key={field.name} field={field} value={values[field.name] ?? ""} onChange={update} />
            ))}
          </div>
        </fieldset>
      ))}

      {status === "error" && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-center text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-rose-500 px-6 py-3.5 text-lg font-medium text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Отправляем…" : "Отправить анкету"}
      </button>

      <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">Поля со звёздочкой * — обязательные</p>
    </form>
  );
}
