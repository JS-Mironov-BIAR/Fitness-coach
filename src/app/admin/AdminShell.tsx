"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AdminLogout from "@/app/admin/AdminLogout";
import { ArrowRightIcon } from "@/components/icons";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <p className="px-4 pt-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Админка halvafit
      </p>
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-zinc-50/90 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <AdminNav />
          <Link
            href="/"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-300 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white dark:border-white/15 dark:text-zinc-200"
          >
            Сайт <ArrowRightIcon className="h-4 w-4 -rotate-45" />
          </Link>
        </div>
      </header>

      {children}

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center">
        <AdminLogout />
      </footer>
    </div>
  );
}
