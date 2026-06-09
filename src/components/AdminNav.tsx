"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Заявки", match: (p: string) => p === "/admin" || p.startsWith("/admin/leads") },
  { href: "/admin/calendar", label: "Расписание", match: (p: string) => p.startsWith("/admin/calendar") },
  { href: "/admin/pdf", label: "PDF", match: (p: string) => p.startsWith("/admin/pdf") },
  { href: "/admin/prompts", label: "Промпты", match: (p: string) => p.startsWith("/admin/prompts") },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 rounded-full border border-zinc-200 bg-white p-1">
      {TABS.map((t) => {
        const active = t.match(path);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active ? "bg-rose-500 text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
