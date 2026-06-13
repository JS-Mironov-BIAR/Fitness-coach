"use client";

import { useState } from "react";
import Link from "next/link";
import { ANKETA_GROUPS, type AnketaField } from "@/lib/anketa";
import Turnstile from "@/components/Turnstile";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import { ListIcon } from "@/components/icons";

type Values = Record<string, string>;
type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder-zinc-500";

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
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {field.label}
        {field.required && <span className="text-violet-500"> *</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={field.name}
          name={field.name}
          rows={2}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={inputClass}
        />
      ) : field.type === "select" ? (
        <Select
          value={value}
          required={field.required}
          placeholder="—"
          options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
          onChange={(v) => onChange(field.name, v)}
        />
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

function Toc() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Разделы анкеты"
        className="fixed bottom-5 left-5 z-40 inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-violet-700 shadow-lg ring-1 ring-violet-200 transition hover:bg-violet-50 dark:bg-zinc-900 dark:text-violet-300 dark:ring-white/10"
      >
        <ListIcon className="h-4 w-4" /> Разделы
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-20 left-5 max-h-[60vh] w-64 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {ANKETA_GROUPS.map((g, i) => (
              <a
                key={g.title}
                href={`#g-${i}`}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2 text-sm text-zinc-700 transition hover:bg-violet-50 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                {i + 1}. {g.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function AnketaForm() {
  const [values, setValues] = useState<Values>({});
  const [hp, setHp] = useState("");
  const [token, setToken] = useState("");
  const [consent, setConsent] = useState(false);
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
        body: JSON.stringify({ ...values, hp, turnstile_token: token }),
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
      <div className="rounded-2xl border border-violet-100 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="text-4xl">💜</div>
        <h2 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Спасибо! Анкета отправлена</h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Я посмотрю твои ответы и свяжусь с тобой в ближайшее время. Без спешки и без навязывания.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-violet-500 px-6 py-2.5 font-medium text-white transition hover:bg-violet-600"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <Toc />

      {ANKETA_GROUPS.map((group, gi) => (
        <fieldset
          key={group.title}
          id={`g-${gi}`}
          className="scroll-mt-28 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
        >
          <legend className="flex items-center gap-2.5 px-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
              {gi + 1}
            </span>
            {group.title}
          </legend>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.fields.map((field) => (
              <Field key={field.name} field={field} value={values[field.name] ?? ""} onChange={update} />
            ))}
          </div>
        </fieldset>
      ))}

      {status === "error" && (
        <p className="rounded-xl bg-violet-50 px-4 py-3 text-center text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
          {errorMsg}
        </p>
      )}

      <Checkbox checked={consent} onChange={setConsent} required>
        Я согласен(на) на{" "}
        <Link href="/privacy" target="_blank" className="text-violet-600 underline-offset-2 hover:underline dark:text-violet-300">
          обработку моих данных
        </Link>{" "}
        для подбора программы и связи со мной.
      </Checkbox>

      <Turnstile onToken={setToken} />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-violet-500 px-6 py-3.5 text-lg font-medium text-white shadow-sm transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Отправляем…" : "Отправить анкету"}
      </button>

      <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">Поля со звёздочкой * — обязательные</p>
    </form>
  );
}
