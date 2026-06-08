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
    <button
      onClick={logout}
      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
    >
      Выйти
    </button>
  );
}
