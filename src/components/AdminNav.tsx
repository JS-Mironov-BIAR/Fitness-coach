"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "@/components/icons";

const TABS = [
  { href: "/admin", label: "Заявки", match: (p: string) => p === "/admin" || p.startsWith("/admin/leads") },
  { href: "/admin/calendar", label: "Расписание", match: (p: string) => p.startsWith("/admin/calendar") },
  { href: "/admin/pdf", label: "PDF", match: (p: string) => p.startsWith("/admin/pdf") },
  { href: "/admin/prompts", label: "Промпты", match: (p: string) => p.startsWith("/admin/prompts") },
  { href: "/admin/qr", label: "QR", match: (p: string) => p.startsWith("/admin/qr") },
  { href: "/admin/settings", label: "Настройки", match: (p: string) => p.startsWith("/admin/settings") },
  { href: "/admin/guide", label: "Гайд", match: (p: string) => p.startsWith("/admin/guide") },
  { href: "/admin/updates", label: "Обновления", match: (p: string) => p.startsWith("/admin/updates") },
];

export default function AdminNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const current = TABS.find((t) => t.match(path)) ?? TABS[0];

  return (
    <div className="min-w-0 flex-1 sm:flex-none">
      {/* Мобильный: выпадающее меню */}
      <div className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900"
        >
          <span>{current.label}</span>
          <ChevronDownIcon className={`h-4 w-4 shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
              {TABS.map((t) => {
                const active = t.match(path);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition ${
                      active ? "bg-violet-50 font-medium text-violet-700" : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Десктоп: вкладки */}
      <nav className="hidden w-fit flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1 sm:flex">
        {TABS.map((t) => {
          const active = t.match(path);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                active ? "bg-violet-500 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
