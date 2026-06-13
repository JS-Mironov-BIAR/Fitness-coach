"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="hidden text-xs font-medium uppercase tracking-wide text-zinc-400 sm:inline">админка</span>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-zinc-300 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white"
      >
        Смотреть сайт
      </a>
      <button
        onClick={logout}
        title="Выйти из админки"
        className="px-1 text-xs text-zinc-400 transition hover:text-zinc-600"
      >
        Выйти
      </button>
    </div>
  );
}
