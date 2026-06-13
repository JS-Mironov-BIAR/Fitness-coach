"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { ChevronLeftIcon, InstagramIcon, TelegramIcon, PhoneIcon } from "@/components/icons";

export type HeaderSocial = { href: string; type: "instagram" | "telegram" | "phone"; label: string };

const ICONS = { instagram: InstagramIcon, telegram: TelegramIcon, phone: PhoneIcon };

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3.5">
        {back ? (
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:text-violet-600 dark:text-zinc-300 dark:hover:text-violet-300"
          >
            <ChevronLeftIcon className="h-5 w-5" /> Назад
          </Link>
        ) : (
          <Link href="/" aria-label="halvafit">
            <Logo />
          </Link>
        )}

        <div className="flex items-center gap-1.5">
          {socials.map((s) => {
            const Icon = ICONS[s.type];
            return (
              <a
                key={s.label}
                href={s.href}
                target={s.type === "phone" ? undefined : "_blank"}
                rel={s.type === "phone" ? undefined : "noopener noreferrer"}
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:text-zinc-300"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
          {anketaLink && !back && (
            <Link
              href="/anketa"
              className="rounded-full border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              Анкета
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
