import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Политика обработки персональных данных — halvafit" };

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  const contacts =
    [
      s.telegram_url ? `Telegram: ${s.telegram_url}` : null,
      s.instagram_url ? `Instagram: ${s.instagram_url}` : null,
      s.phone ? `тел.: ${s.phone}` : null,
    ]
      .filter(Boolean)
      .join(", ") || "через контакты, указанные на сайте";

  const sections: { title: string; p?: string[]; ul?: string[] }[] = [
    {
      title: "1. Общие положения",
      p: [
        "Эта политика описывает, как обрабатываются персональные данные посетителей сайта halvafit (далее — «Сайт»). Оператор данных — Аня (halvafit). Отправляя формы на Сайте, вы соглашаетесь с настоящей политикой.",
      ],
    },
    {
      title: "2. Какие данные мы собираем",
      ul: [
        "Из анкеты: имя, способ и контакт для связи, город/формат, пол, возраст, рост и вес, цели, уровень подготовки, условия занятий, сведения о здоровье и ограничениях, предпочтения в питании, образ жизни, ссылку на видео (по желанию).",
        "Из формы записи: имя, контакт, выбранные дату и время, комментарий.",
        "Технические данные: IP-адрес — только для защиты от спама и злоупотреблений.",
      ],
    },
    {
      title: "3. Цели обработки",
      ul: [
        "подбор программ занятий и питания;",
        "связь с вами и согласование занятий;",
        "ведение расписания и записей;",
        "защита Сайта от спама и злоупотреблений.",
      ],
    },
    {
      title: "4. Основание обработки",
      p: ["Обработка осуществляется на основании вашего согласия, которое вы даёте при отправке анкеты или записи."],
    },
    {
      title: "5. Хранение и защита",
      p: [
        "Данные хранятся в защищённой базе данных с ограниченным доступом. Уведомления о новых заявках и записях направляются оператору в Telegram. Принимаются разумные меры защиты данных от несанкционированного доступа.",
      ],
    },
    {
      title: "6. Передача третьим лицам",
      p: [
        "Мы не продаём ваши данные. Для работы Сайта используются сторонние сервисы: хостинг и база данных (Supabase, Vercel), уведомления (Telegram), защита от спама (Cloudflare). Данные обрабатываются только в указанных целях.",
      ],
    },
    {
      title: "7. Срок хранения",
      p: ["Данные хранятся, пока это необходимо для указанных целей или до отзыва вашего согласия."],
    },
    {
      title: "8. Ваши права",
      p: [
        "Вы можете запросить доступ к своим данным, их исправление или удаление, а также отозвать согласие — обратившись по контактам ниже.",
      ],
    },
    {
      title: "9. Файлы и локальное хранилище",
      p: ["Сайт сохраняет в браузере только выбор темы оформления (светлая/тёмная). Рекламного трекинга нет."],
    },
    {
      title: "10. Контакты",
      p: [`По вопросам обработки данных: ${contacts}.`],
    },
    {
      title: "11. Изменения",
      p: ["Политика может обновляться; актуальная версия всегда доступна на этой странице."],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white font-sans dark:from-zinc-950 dark:to-black">
      <SiteHeader back />
      <div className="mx-auto max-w-2xl px-4 pb-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Политика обработки персональных данных
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Действует с июня 2026 г. · halvafit</p>
        {sections.map((sec) => (
          <section key={sec.title} className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{sec.title}</h2>
            {sec.p?.map((t, i) => (
              <p key={i} className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">{t}</p>
            ))}
            {sec.ul && (
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-zinc-600 dark:text-zinc-400">
                {sec.ul.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
