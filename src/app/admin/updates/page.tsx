import AdminNav from "@/components/AdminNav";
import LogoutButton from "@/app/admin/LogoutButton";
import { CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Бренд и дизайн",
    items: [
      "Логотип halvafit и фирменный фиолетово-лиловый стиль в духе Instagram.",
      "Выбор темы всего сайта: Лиловый, Инстаграм, Изумруд, Океан (в Настройках).",
      "Тёмная тема, липкий хедер (прячется при прокрутке), кнопка «наверх».",
    ],
  },
  {
    title: "Анкета и заявки",
    items: [
      "Анкета на одной странице, аккуратные разделы, нейтральные формулировки.",
      "Карточка заявки: статусы, заметки, удаление через подтверждение.",
      "Кнопка «Промпт под клиента» — собирает готовый запрос для DeepSeek/ChatGPT из анкеты.",
    ],
  },
  {
    title: "Расписание и дневник",
    items: [
      "Мобильная админка: свёрнутые формы, компактные дни.",
      "Свободные окна на период, отдельные окна, гибкий ввод времени.",
      "«Вести клиента на период», ручная запись, отмена, закрытие дней.",
      "Групповой выбор дней + массовые действия и «Очистить расписание».",
    ],
  },
  {
    title: "PDF-конструктор",
    items: [
      "Блочный редактор программ (тренировки/питание) с живым превью.",
      "5 тем оформления, логотип и контакты в PDF.",
      "Скачать или отправить в Telegram. Файлы не хранятся — только лог генераций.",
    ],
  },
  {
    title: "Продвижение и сервис",
    items: [
      "SEO под Гомель/Минск, OpenGraph/Twitter, микроразметка, robots и sitemap.",
      "Редактор текстов главной и SEO, соцсети на сайте.",
      "QR-коды на сайт и анкету, библиотека промптов, гайд с FAQ.",
    ],
  },
  {
    title: "Безопасность и анти-спам",
    items: [
      "Защита от дублей анкет и лимиты по IP, чёрный список спамеров.",
      "Блокировка известных ботов и security-заголовки.",
      "Cloudflare Turnstile — умная капча (включается ключами).",
    ],
  },
];

export default function AdminUpdatesPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <AdminNav />
          <LogoutButton />
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <span className="brand-gradient inline-block rounded-full px-3 py-1 text-xs font-semibold text-white">
            Обновление · готово к публикации
          </span>
          <h1 className="mt-3 text-2xl font-bold text-zinc-900">Что нового</h1>
          <p className="mt-1 text-sm text-zinc-500">Короткая сводка по работе за сегодня — всё это применится после деплоя.</p>
        </div>

        <div className="mt-4 space-y-4">
          {GROUPS.map((g) => (
            <div key={g.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-zinc-900">{g.title}</h2>
              <ul className="mt-3 space-y-2">
                {g.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-zinc-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
