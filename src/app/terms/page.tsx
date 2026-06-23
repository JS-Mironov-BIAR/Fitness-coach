import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Условия использования — halvafit" };

export default async function TermsPage() {
  const s = await getSiteSettings();
  const contacts =
    [
      s.telegram_url ? `Telegram: ${s.telegram_url}` : null,
      s.instagram_url ? `Instagram: ${s.instagram_url}` : null,
      s.vk_url ? `VK: ${s.vk_url}` : null,
      s.phone ? `тел.: ${s.phone}` : null,
    ]
      .filter(Boolean)
      .join(", ") || "через контакты, указанные на сайте";

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white font-sans dark:from-zinc-950 dark:to-black">
      <SiteHeader back />
      <div className="mx-auto max-w-2xl px-4 pb-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Условия использования</h1>
        <p className="mt-2 text-sm text-zinc-500">Действует с июня 2026 г. · halvafit</p>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">1. О сервисе</h2>
          <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
            halvafit — сайт Ани (Гомель) для записи на занятия и консультации по фигуре, технике и питанию — очно и
            онлайн. Через сайт можно заполнить анкету и записаться на занятие.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">2. Характер материалов</h2>
          <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
            Программы и рекомендации по питанию и занятиям носят информационно-рекомендательный характер и не являются
            медицинской услугой или диагнозом. Перед началом занятий и изменением питания рекомендуется
            проконсультироваться с врачом — особенно при заболеваниях, травмах, беременности и грудном вскармливании.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3. Запись и связь</h2>
          <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
            После анкеты или записи оператор связывается с вами по указанным контактам. Стоимость, формат и условия
            занятий согласуются индивидуально.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">4. Ответственность</h2>
          <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
            Вы самостоятельно оцениваете своё состояние здоровья и возможности. Оператор не несёт ответственности за
            последствия самостоятельного выполнения упражнений или рекомендаций без согласования.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">5. Персональные данные</h2>
          <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
            Обработка данных описана в{" "}
            <Link href="/privacy" className="font-medium text-violet-600 hover:underline dark:text-violet-300">
              Политике обработки персональных данных
            </Link>
            .
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">6. Контакты</h2>
          <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">Связаться: {contacts}.</p>
        </section>
      </div>
    </main>
  );
}
