import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Публичный список ближайших слотов (на 21 день вперёд).
// Отдаём open / booked / blocked — booked и blocked на фронте
// показываем как «занято» (без личных данных, в слотах их нет).
export async function GET() {
  const now = new Date();
  const to = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabaseAdmin()
    .from("slots")
    .select("id, starts_at, duration_min, format, status, title")
    .gte("starts_at", now.toISOString())
    .lte("starts_at", to.toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Ошибка загрузки слотов:", error);
    return NextResponse.json({ error: "Не удалось загрузить расписание" }, { status: 500 });
  }

  return NextResponse.json({ slots: data ?? [] });
}
