import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { ChevronLeftIcon } from "@/components/icons";

export default function SiteHeader({ back = false }: { back?: boolean }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
      {back ? (
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-300"
        >
          <ChevronLeftIcon className="h-5 w-5" /> Назад
        </Link>
      ) : (
        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Fitness<span className="text-rose-500">Coach</span>
        </span>
      )}
      <ThemeToggle />
    </header>
  );
}
