import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function clean(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const { error } = await supabaseAdmin()
    .from("site_settings")
    .update({
      instagram_url: clean(b.instagram_url),
      telegram_url: clean(b.telegram_url),
      phone: clean(b.phone),
      hero_title: clean(b.hero_title),
      hero_subtitle: clean(b.hero_subtitle),
      hero_badge: clean(b.hero_badge),
      seo_title: clean(b.seo_title),
      seo_description: clean(b.seo_description),
      seo_keywords: clean(b.seo_keywords),
      accent_theme: clean(b.accent_theme) ?? "violet",
    })
    .eq("id", 1);

  if (error) {
    console.error("Настройки:", error);
    return NextResponse.json({ error: "Не удалось сохранить" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
