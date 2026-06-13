"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDownIcon,
  InboxIcon,
  CalendarIcon,
  FileTextIcon,
  MessageSquareIcon,
  QrIcon,
  SettingsIcon,
  BookOpenIcon,
  SparklesIcon,
} from "@/components/icons";

type Tab = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  match: (p: string) => boolean;
};

const TABS: Tab[] = [
  { href: "/admin", label: "Заявки", Icon: InboxIcon, match: (p) => p === "/admin" || p.startsWith("/admin/leads") },
  { href: "/admin/calendar", label: "Расписание", Icon: CalendarIcon, match: (p) => p.startsWith("/admin/calendar") },
  { href: "/admin/pdf", label: "PDF", Icon: FileTextIcon, match: (p) => p.startsWith("/admin/pdf") },
  { href: "/admin/prompts", label: "Промпты", Icon: MessageSquareIcon, match: (p) => p.startsWith("/admin/prompts") },
  { href: "/admin/qr", label: "QR", Icon: QrIcon, match: (p) => p.startsWith("/admin/qr") },
  { href: "/admin/settings", label: "Настройки", Icon: SettingsIcon, match: (p) => p.startsWith("/admin/settings") },
  { href: "/admin/guide", label: "Гайд", Icon: BookOpenIcon, match: (p) => p.startsWith("/admin/guide") },
  { href: "/admin/updates", label: "Обновления", Icon: SparklesIcon, match: (p) => p.startsWith("/admin/updates") },
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
          <span className="flex items-center gap-2">
            <current.Icon className="h-4 w-4 text-violet-500" />
            {current.label}
          </span>
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
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                      active ? "bg-violet-50 font-medium text-violet-700" : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <t.Icon className="h-4 w-4 shrink-0" />
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active ? "bg-violet-500 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
