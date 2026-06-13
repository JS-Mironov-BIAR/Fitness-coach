"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";

export type BlockEntry = {
  id: string;
  value: string;
  kind: string;
  note: string | null;
};

const inputCls =
  "w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200";

export default function BlocklistManager({ initial }: { initial: BlockEntry[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [kind, setKind] = useState("contact");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/blocklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, kind, note }),
    });
    setBusy(false);
    if (res.ok) {
      setValue("");
      setNote("");
      router.refresh();
    } else {
      setErr("Не удалось добавить");
    }
  }

  async function remove(id: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/blocklist/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <section className="max-w-2xl rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Блокировки</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Контакт (@ник, телефон, e-mail) или IP — их анкеты и записи будут молча игнорироваться.
      </p>

      <form onSubmit={add} className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${inputCls} sm:max-w-[8rem]`}>
          <option value="contact">Контакт</option>
          <option value="ip">IP</option>
        </select>
        <input value={value} onChange={(e) => setValue(e.target.value)} required placeholder="@spammer / 1.2.3.4" className={`${inputCls} sm:flex-1`} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Заметка" className={`${inputCls} sm:flex-1`} />
        <button type="submit" disabled={busy} className="w-full rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-60 sm:w-auto">
          Добавить
        </button>
      </form>
      {err && <p className="mt-2 text-sm text-violet-600">{err}</p>}

      <div className="mt-4 space-y-2">
        {initial.length === 0 ? (
          <p className="text-sm text-zinc-400">Список пуст.</p>
        ) : (
          initial.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2">
              <div className="min-w-0 text-sm">
                <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {b.kind === "ip" ? "IP" : "Контакт"}
                </span>{" "}
                <span className="font-medium text-zinc-900">{b.value}</span>
                {b.note && <span className="text-zinc-500"> — {b.note}</span>}
              </div>
              <button
                onClick={() => remove(b.id)}
                disabled={busy}
                title="Удалить"
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-violet-100 hover:text-violet-600 disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
