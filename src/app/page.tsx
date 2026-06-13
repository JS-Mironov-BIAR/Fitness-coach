import type { Metadata } from "next";
import Link from "next/link";
import BookingCalendar from "@/components/BookingCalendar";
import SiteHeader from "@/components/SiteHeader";
import ScrollTopButton from "@/components/ScrollTopButton";
import InstagramFeed from "@/components/InstagramFeed";
import { getSiteSettings, SITE_DEFAULTS, SITE_URL } from "@/lib/settings";
import {
  TargetIcon,
  LeafIcon,
  HeartIcon,
  ArrowRightIcon,
  InstagramIcon,
  TelegramIcon,
  PhoneIcon,
} from "@/components/icons";

export const revalidate = 300;

const FEATURES = [
  { Icon: TargetIcon, title: "Программа под цель", text: "Занятия с учётом уровня, графика и инвентаря" },
  { Icon: LeafIcon, title: "Питание без крайностей", text: "Рацион под твои предпочтения и бюджет" },
  { Icon: HeartIcon, title: "Сопровождение", text: "Понимаю цикл, усталость и страхи — без криков и стыда" },
];

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.seo_title || SITE_DEFAULTS.seo_title;
  const description = s.seo_description || SITE_DEFAULTS.seo_description;
  const keywords = s.seo_keywords || SITE_DEFAULTS.seo_keywords;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "halvafit",
      locale: "ru_RU",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    other: { "geo.region": "BY", "geo.placename": "Гомель", "geo.position": "52.4345;30.9754" },
  };
}

export default async function Home() {
  const s = await getSiteSettings();
  const year = new Date().getFullYear();

  const heroBadge = s.hero_badge || SITE_DEFAULTS.hero_badge;
  const heroTitle = s.hero_title || SITE_DEFAULTS.hero_title;
  const heroSubtitle = s.hero_subtitle || SITE_DEFAULTS.hero_subtitle;
  const seoDescription = s.seo_description || SITE_DEFAULTS.seo_description;

  const headerSocials = [
    s.instagram_url ? { href: s.instagram_url, type: "instagram" as const, label: "Instagram" } : null,
    s.telegram_url ? { href: s.telegram_url, type: "telegram" as const, label: "Telegram" } : null,
    s.phone ? { href: `tel:${s.phone.replace(/[^\d+]/g, "")}`, type: "phone" as const, label: s.phone } : null,
  ].filter(Boolean) as { href: string; type: "instagram" | "telegram" | "phone"; label: string }[];

  const igPosts = (s.instagram_posts || "")
    .split(/\n+/)
    .map((x) => x.trim())
    .filter((x) => x.includes("instagram.com"))
    .slice(0, 12);

  const socials = [
    s.instagram_url && { href: s.instagram_url, Icon: InstagramIcon, label: "Instagram", external: true },
    s.telegram_url && { href: s.telegram_url, Icon: TelegramIcon, label: "Telegram", external: true },
    s.phone && { href: `tel:${s.phone.replace(/[^\d+]/g, "")}`, Icon: PhoneIcon, label: s.phone, external: false },
  ].filter(Boolean) as { href: string; Icon: typeof PhoneIcon; label: string; external: boolean }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: "halvafit",
    description: seoDescription,
    url: SITE_URL,
    areaServed: ["Гомель", "Минск", "Беларусь"],
    address: { "@type": "PostalAddress", addressLocality: "Гомель", addressCountry: "BY" },
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(socials.length ? { sameAs: socials.filter((x) => x.external).map((x) => x.href) } : {}),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white font-sans dark:from-zinc-950 dark:via-zinc-950 dark:to-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteHeader anketaLink socials={headerSocials} />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-16">
        <div>
          <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            {heroBadge}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">{heroSubtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/anketa"
              className="brand-gradient inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-lg font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            >
              Заполнить анкету
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            {s.telegram_url && (
              <a
                href={s.telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 py-3.5 text-lg font-medium text-zinc-700 transition hover:bg-white sm:w-auto dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                <TelegramIcon className="h-5 w-5" /> Написать
              </a>
            )}
          </div>
        </div>

        <div className="lg:pl-4">
          <BookingCalendar />
        </div>
      </section>

      {/* Преимущества */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="brand-gradient flex h-11 w-11 items-center justify-center rounded-xl text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram */}
      {igPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Я в Instagram</h2>
            {s.instagram_url && (
              <a
                href={s.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <InstagramIcon className="h-4 w-4" /> Подписаться
              </a>
            )}
          </div>
          <InstagramFeed posts={igPosts} />
        </section>
      )}

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400 dark:border-white/10">
        {socials.length > 0 && (
          <div className="mb-4 flex justify-center gap-3">
            {socials.map((soc) => (
              <a
                key={soc.label}
                href={soc.href}
                target={soc.external ? "_blank" : undefined}
                rel={soc.external ? "noopener noreferrer" : undefined}
                aria-label={soc.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:text-zinc-300"
              >
                <soc.Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        )}
        <div className="mb-3 flex justify-center gap-4 text-xs">
          <Link href="/privacy" className="transition hover:text-violet-600 dark:hover:text-violet-300">
            Политика данных
          </Link>
          <Link href="/terms" className="transition hover:text-violet-600 dark:hover:text-violet-300">
            Условия
          </Link>
        </div>
        © {year} · halvafit · Гомель
      </footer>

      <ScrollTopButton />
    </main>
  );
}
