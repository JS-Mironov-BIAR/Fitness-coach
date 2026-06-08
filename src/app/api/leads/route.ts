import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTelegramMessage } from "@/lib/telegram";
import { FIELD_NAMES, NUMERIC_FIELDS, buildLeadMessage } from "@/lib/anketa";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const contact = String(body.contact_value ?? "").trim();
  if (!name || !contact) {
    return NextResponse.json(
      { error: "Заполни имя и контакт для связи" },
      { status: 400 },
    );
  }

  // Готовим строку строго по известным столбцам; пустые → null,
  // числовые поля приводим к числу.
  const row: Record<string, string | number | null> = {};
  for (const field of FIELD_NAMES) {
    const raw = body[field];
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      row[field] = null;
      continue;
    }
    if (NUMERIC_FIELDS.has(field)) {
      const n = Number(String(raw).replace(",", "."));
      row[field] = Number.isFinite(n) ? n : null;
    } else {
      row[field] = String(raw).trim();
    }
  }

  const { data, error } = await supabaseAdmin()
    .from("leads")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("Ошибка записи заявки:", error);
    return NextResponse.json(
      { error: "Не удалось сохранить заявку, попробуй ещё раз" },
      { status: 500 },
    );
  }

  // Уведомление в Telegram — не блокирует успех заявки
  try {
    await sendTelegramMessage(buildLeadMessage(body));
  } catch (e) {
    console.error("Не удалось отправить уведомление в Telegram:", e);
  }

  return NextResponse.json({ ok: true, id: data.id });
}
