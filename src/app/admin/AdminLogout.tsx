"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
      >
        Выйти из админки
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !busy && setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-zinc-900">Выйти из админки?</h3>
            <p className="mt-2 text-sm text-zinc-500">Чтобы вернуться, нужно будет снова ввести пароль.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={busy}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                Отмена
              </button>
              <button
                onClick={logout}
                disabled={busy}
                className="rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-60"
              >
                {busy ? "Выходим…" : "Выйти"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
