import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white px-4 py-20 font-sans">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700">
          Гомель · онлайн и очно
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Тренировки и питание — мягко и под тебя
        </h1>

        <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600">
          Разбор техники, план питания без жёстких диет и программа под твою цель и
          ритм жизни. Без криков и стыда — с поддержкой на каждом шаге.
        </p>

        <Link
          href="/anketa"
          className="mt-8 rounded-full bg-rose-500 px-8 py-3.5 text-lg font-medium text-white shadow-sm transition hover:bg-rose-600"
        >
          Заполнить анкету
        </Link>

        <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { emoji: "🎯", title: "Программа под цель", text: "Тренировки с учётом уровня, графика и инвентаря" },
            { emoji: "🥗", title: "Питание без крайностей", text: "Рацион под твои предпочтения и бюджет" },
            { emoji: "💜", title: "Поддержка", text: "Понимаю цикл, усталость и страхи" },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-rose-100 bg-white p-5 text-left shadow-sm">
              <div className="text-2xl">{c.emoji}</div>
              <h3 className="mt-2 font-semibold text-zinc-900">{c.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
