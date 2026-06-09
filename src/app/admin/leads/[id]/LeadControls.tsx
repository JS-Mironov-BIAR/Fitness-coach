"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STATUSES } from "@/lib/leads";

const fieldCls =
  "mt-1.5 w-full rounded-xl border border-rose-200 bg-rose-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-200";

export default function LeadControls({
  id,
  initialStatus,
  initialNotes,
}: {
  id: string;
  initialStatus: string;
  initialNotes: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Работа с заявкой</h2>

      <label className="mt-4 block text-sm font-medium text-zinc-700">Статус</label>
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setSaved(false);
        }}
        className={fieldCls}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-sm font-medium text-zinc-700">Заметки (видны только тебе)</label>
      <textarea
        value={notes}
        rows={4}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        placeholder="Договорённости, что отправлено, дата оплаты…"
        className={fieldCls}
      />

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-rose-500 px-6 py-2.5 font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Сохранено ✓</span>}
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-4">
        <button
          onClick={() => setConfirmOpen(true)}
          className="text-sm font-medium text-zinc-500 transition hover:text-rose-600"
        >
          Удалить заявку
        </button>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900">Удалить заявку?</h3>
            <p className="mt-2 text-sm text-zinc-500">Действие необратимо — заявка исчезнет навсегда.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                {deleting ? "Удаляем…" : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
