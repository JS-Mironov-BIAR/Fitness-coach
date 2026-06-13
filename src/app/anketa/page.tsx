import type { Metadata } from "next";
import AnketaForm from "./AnketaForm";
import SiteHeader from "@/components/SiteHeader";
import ScrollTopButton from "@/components/ScrollTopButton";

export const metadata: Metadata = {
  title: "Анкета — подбор программы",
  description: "Заполни анкету, чтобы подобрать программу тренировок и питания под тебя",
};

export default function AnketaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white font-sans dark:from-zinc-950 dark:to-black">
      <SiteHeader back />
      <div className="mx-auto max-w-2xl px-4 pb-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Анкета для подбора программы
          </h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
            Чем подробнее ответишь — тем точнее я подберу тренировки и питание именно под
            тебя. Отвечай свободно, обязательны только имя и контакт.
          </p>
        </header>
        <AnketaForm />
      </div>
      <ScrollTopButton />
    </main>
  );
}
