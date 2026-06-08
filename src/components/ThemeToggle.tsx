"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Светлая тема" : "Тёмная тема"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 text-zinc-700 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
    >
      {mounted && dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
