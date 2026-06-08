import type { Metadata } from "next";
import AnketaForm from "./AnketaForm";

export const metadata: Metadata = {
  title: "Анкета — подбор программы",
  description: "Заполни анкету, чтобы подобрать программу тренировок и питания под тебя",
};

export default function AnketaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white px-4 py-12 font-sans">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Анкета для подбора программы
          </h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            Чем подробнее ответишь — тем точнее я подберу тренировки и питание именно
            под тебя. Отвечай свободно, обязательны только имя и контакт. 🌸
          </p>
        </header>
        <AnketaForm />
      </div>
    </main>
  );
}
