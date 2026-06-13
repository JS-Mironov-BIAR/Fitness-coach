"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type SiteSettings, SITE_DEFAULTS, ACCENT_THEMES } from "@/lib/settings";

const inputCls =
  "mt-1.5 w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200";

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [f, setF] = useState({
    instagram_url: initial.instagram_url ?? "",
    telegram_url: initial.telegram_url ?? "",
    phone: initial.phone ?? "",
    hero_title: initial.hero_title ?? "",
    hero_subtitle: initial.hero_subtitle ?? "",
    hero_badge: initial.hero_badge ?? "",
    seo_title: initial.seo_title ?? "",
    seo_description: initial.seo_description ?? "",
    seo_keywords: initial.seo_keywords ?? "",
    accent_theme: initial.accent_theme ?? "violet",
    instagram_posts: initial.instagram_posts ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set(key: keyof typeof f, value: string) {
    setF((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErr("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setErr("Не удалось сохранить");
    }
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      {/* Тема оформления */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Тема оформления сайта</h2>
        <p className="mt-1 text-sm text-zinc-500">Меняет цвета всего сайта и админки. На сайте обновится в течение 5 минут.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ACCENT_THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => set("accent_theme", t.key)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                f.accent_theme === t.key ? "border-violet-400 text-zinc-900 ring-1 ring-violet-300" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: t.sample }} />
              {t.name}
            </button>
          ))}
        </div>
      </section>

      {/* Контакты */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Контакты и соцсети</h2>
        <p className="mt-1 text-sm text-zinc-500">Появятся на сайте и в подвале PDF-программ.</p>
        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Instagram (ссылка)
          <input value={f.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/halvafit" className={inputCls} />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700">
          Telegram (ссылка)
          <input value={f.telegram_url} onChange={(e) => set("telegram_url", e.target.value)} placeholder="https://t.me/halvafit" className={inputCls} />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700">
          Телефон
          <input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+375 ..." className={inputCls} />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700">
          Лента Instagram на главной — ссылки на посты (по одной на строку)
          <textarea
            value={f.instagram_posts}
            onChange={(e) => set("instagram_posts", e.target.value)}
            rows={4}
            placeholder={"https://www.instagram.com/p/XXXX/\nhttps://www.instagram.com/reel/YYYY/"}
            className={inputCls}
          />
          <span className="mt-1 block text-xs text-zinc-400">
            Открой пост в Instagram → «...» → «Копировать ссылку». Покажем последние до 12 постов.
          </span>
        </label>
      </section>

      {/* Тексты главной */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Тексты главной</h2>
        <p className="mt-1 text-sm text-zinc-500">Пусто = используется текст по умолчанию.</p>
        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Плашка над заголовком
          <input value={f.hero_badge} onChange={(e) => set("hero_badge", e.target.value)} placeholder={SITE_DEFAULTS.hero_badge} className={inputCls} />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700">
          Заголовок
          <input value={f.hero_title} onChange={(e) => set("hero_title", e.target.value)} placeholder={SITE_DEFAULTS.hero_title} className={inputCls} />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700">
          Подзаголовок
          <textarea value={f.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} rows={3} placeholder={SITE_DEFAULTS.hero_subtitle} className={inputCls} />
        </label>
      </section>

      {/* SEO */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">SEO (поиск Google/Яндекс)</h2>
        <p className="mt-1 text-sm text-zinc-500">Заголовок и описание для поиска и при отправке ссылки в соцсети.</p>
        <label className="mt-4 block text-sm font-medium text-zinc-700">
          SEO-заголовок (title)
          <input value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={SITE_DEFAULTS.seo_title} className={inputCls} />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700">
          SEO-описание (description)
          <textarea value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} rows={3} placeholder={SITE_DEFAULTS.seo_description} className={inputCls} />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700">
          Ключевые слова (через запятую)
          <textarea value={f.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)} rows={2} placeholder={SITE_DEFAULTS.seo_keywords} className={inputCls} />
        </label>
      </section>

      {err && <p className="text-sm text-violet-600">{err}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="w-full rounded-full bg-violet-500 px-6 py-2.5 font-medium text-white transition hover:bg-violet-600 disabled:opacity-60 sm:w-auto">
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Сохранено ✓ (на сайте обновится в течение 5 минут)</span>}
      </div>
    </form>
  );
}
