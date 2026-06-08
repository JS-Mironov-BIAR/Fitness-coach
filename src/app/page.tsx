import Link from "next/link";
import BookingCalendar from "@/components/BookingCalendar";
import ThemeToggle from "@/components/ThemeToggle";
import { TargetIcon, LeafIcon, HeartIcon, ArrowRightIcon } from "@/components/icons";

const FEATURES = [
  { Icon: TargetIcon, title: "Программа под цель", text: "Тренировки с учётом уровня, графика и инвентаря" },
  { Icon: LeafIcon, title: "Питание без крайностей", text: "Рацион под твои предпочтения и бюджет" },
  { Icon: HeartIcon, title: "Поддержка", text: "Понимаю цикл, усталость и страхи — без криков и стыда" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white font-sans dark:from-zinc-950 dark:via-zinc-950 dark:to-black">
      {/* Шапка */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Fitness<span className="text-rose-500">Coach</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/anketa"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:text-rose-600 sm:inline dark:text-zinc-300 dark:hover:text-rose-300"
          >
            Анкета
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-16">
        <div>
          <span className="inline-block rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
            Гомель · онлайн и очно
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Тренировки и питание — <span className="text-rose-500">мягко и под тебя</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Разбор техники, план питания без жёстких диет и программа под твою цель и ритм
            жизни. С поддержкой на каждом шаге.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/anketa"
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-7 py-3.5 text-lg font-medium text-white shadow-sm transition hover:bg-rose-600"
            >
              Заполнить анкету
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Календарь в hero */}
        <div className="lg:pl-4">
          <BookingCalendar />
        </div>
      </section>

      {/* Преимущества */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400 dark:border-white/10">
        © {new Date().getFullYear()} · Гомель
      </footer>
    </main>
  );
}
