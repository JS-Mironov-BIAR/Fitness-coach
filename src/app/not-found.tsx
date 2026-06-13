import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-violet-50 to-white px-4 text-center font-sans dark:from-zinc-950 dark:to-black">
      <Logo />
      <h1 className="brand-gradient-text text-6xl font-bold">404</h1>
      <p className="max-w-sm text-zinc-600 dark:text-zinc-400">
        Такой страницы нет. Давай вернёмся на главную?
      </p>
      <Link
        href="/"
        className="brand-gradient rounded-full px-6 py-3 font-medium text-white transition hover:opacity-90"
      >
        На главную
      </Link>
    </main>
  );
}
