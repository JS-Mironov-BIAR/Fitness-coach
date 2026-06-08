"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Неверный пароль");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 font-sans">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-zinc-900">Вход в админку</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoFocus
          className="mt-6 w-full rounded-xl border border-rose-200 bg-rose-50/40 px-4 py-2.5 text-zinc-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-200"
        />
        {error && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-rose-500 px-6 py-3 font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
