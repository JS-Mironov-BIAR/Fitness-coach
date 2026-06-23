import type { Metadata } from "next";
import AnketaForm from "./AnketaForm";
import SiteHeader from "@/components/SiteHeader";
import ScrollTopButton from "@/components/ScrollTopButton";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Анкета — подбор программы",
  description: "Заполни анкету, чтобы подобрать программу тренировок и питания под тебя",
};

export const revalidate = 300;

export default async function AnketaPage() {
  const s = await getSiteSettings();
  const headerSocials = [
    s.instagram_url ? { href: s.instagram_url, type: "instagram" as const, label: "Instagram" } : null,
    s.telegram_url ? { href: s.telegram_url, type: "telegram" as const, label: "Telegram" } : null,
    s.vk_url ? { href: s.vk_url, type: "vk" as const, label: "ВКонтакте" } : null,
    s.phone ? { href: `tel:${s.phone.replace(/[^\d+]/g, "")}`, type: "phone" as const, label: s.phone } : null,
  ].filter(Boolean) as { href: string; type: "instagram" | "telegram" | "vk" | "phone"; label: string }[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white font-sans dark:from-zinc-950 dark:to-black">
      <SiteHeader back socials={headerSocials} />
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
