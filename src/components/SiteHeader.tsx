"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { ChevronLeftIcon, InstagramIcon, TelegramIcon, VkIcon, PhoneIcon, MenuIcon, CloseIcon } from "@/components/icons";

export type HeaderSocial = { href: string; type: "instagram" | "telegram" | "vk" | "phone"; label: string };

const ICONS = { instagram: InstagramIcon, telegram: TelegramIcon, vk: VkIcon, phone: PhoneIcon };

function SocialIcon({ s, size = "h-[18px] w-[18px]" }: { s: HeaderSocial; size?: string }) {
  const Icon = ICONS[s.type];
  return (
    <a
      href={s.href}
      target={s.type === "phone" ? undefined : "_blank"}
      rel={s.type === "phone" ? undefined : "noopener noreferrer"}
      aria-label={s.label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-violet-600 dark:text-zinc-300 dark:hover:bg-white/10"
    >
      <Icon className={size} strokeWidth={1.75} />
    </a>
  );
}

export default function SiteHeader({
  back = false,
  anketaLink = false,
  socials = [],
}: {
  back?: boolean;
  anketaLink?: boolean;
  socials?: HeaderSocial[];
}) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > last && y > 90);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"} ${
        scrolled
          ? "border-b border-zinc-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        {back ? (
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full px-2 py-2 text-sm font-medium text-zinc-700 transition hover:text-violet-600 dark:text-zinc-300 dark:hover:text-violet-300"
          >
            <ChevronLeftIcon className="h-5 w-5" /> Назад
          </Link>
        ) : (
          <Link href="/" aria-label="halvafit">
            <Logo />
          </Link>
        )}

        {/* Компактный ряд: 360px и шире */}
        <div className="hidden items-center gap-0.5 min-[360px]:flex">
          {socials.map((s) => (
            <SocialIcon key={s.label} s={s} />
          ))}
          {anketaLink && !back && (
            <Link
              href="/anketa"
              className="ml-1 rounded-full border border-violet-200 px-3 py-1.5 text-sm font-medium text-violet-700 transition hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              Анкета
            </Link>
          )}
          <ThemeToggle />
        </div>

        {/* Бургер: 359px и уже */}
        <div className="relative min-[360px]:hidden">
          <button
            type="button"
            onClick={() => setMenu((o) => !o)}
            aria-label="Меню"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            {menu ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
              <div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-zinc-900">
                {anketaLink && !back && (
                  <Link
                    href="/anketa"
                    onClick={() => setMenu(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-white/5"
                  >
                    Заполнить анкету
                  </Link>
                )}
                {socials.length > 0 && (
                  <div className="flex gap-1 px-2 py-2">
                    {socials.map((s) => (
                      <SocialIcon key={s.label} s={s} />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Тема <ThemeToggle />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
