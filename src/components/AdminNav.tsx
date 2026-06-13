"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  return (
    <nav className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1">
      {TABS.map((t) => {
        const active = t.match(path);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              active ? "bg-violet-500 text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
