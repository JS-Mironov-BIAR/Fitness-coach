import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const SITE_URL = "https://fitness-coach-three-livid.vercel.app";

export type SiteSettings = {
  instagram_url: string | null;
  telegram_url: string | null;
  phone: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_badge: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  accent_theme: string | null;
  instagram_posts: string | null;
};

const EMPTY: SiteSettings = {
  instagram_url: null,
  telegram_url: null,
  phone: null,
  hero_title: null,
  hero_subtitle: null,
  hero_badge: null,
  seo_title: null,
  seo_description: null,
  seo_keywords: null,
  accent_theme: null,
  instagram_posts: null,
};

export const ACCENT_THEMES = [
  { key: "violet", name: "Лиловый", sample: "#7c3aed" },
  { key: "insta", name: "Инстаграм", sample: "#d62976" },
  { key: "emerald", name: "Изумруд", sample: "#10b981" },
  { key: "ocean", name: "Океан", sample: "#0ea5e9" },
] as const;

// Дефолтные тексты — используются, пока не заданы в админке
export const SITE_DEFAULTS = {
  hero_title: "Веду к форме мечты — мягко и под тебя",
  hero_subtitle:
    "Корректирую технику, помогаю с питанием без жёстких диет и сопровождаю на каждом шаге — очно в Гомеле или онлайн. Без криков и стыда.",
  hero_badge: "Гомель · онлайн и очно",
  seo_title: "halvafit — занятия и питание для девушек | Гомель и онлайн",
  seo_description:
    "Помогаю девушкам с фигурой и техникой: занятия в зале в Гомеле и онлайн по всей Беларуси. Питание без жёстких диет, сопровождение и поддержка — мягко, без криков и стыда.",
  seo_keywords:
    "фитнес Гомель, занятия фитнесом Гомель, фитнес для девушек, похудение Гомель, фитнес онлайн Беларусь, фитнес Минск, тренировки и питание, halvafit",
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const { data } = await supabaseAdmin()
      .from("site_settings")
      .select(
        "instagram_url, telegram_url, phone, hero_title, hero_subtitle, hero_badge, seo_title, seo_description, seo_keywords, accent_theme, instagram_posts",
      )
      .eq("id", 1)
      .single();
    if (!data) return EMPTY;
    return { ...EMPTY, ...data };
  } catch {
    return EMPTY;
  }
});
