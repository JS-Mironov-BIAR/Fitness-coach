import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTelegramMessage } from "@/lib/telegram";
import { FIELD_NAMES, NUMERIC_FIELDS, buildLeadMessage } from "@/lib/anketa";
import { getClientIp, isBlocked, verifyTurnstile } from "@/lib/security";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  // Ханипот: скрытое поле заполняют только боты — тихо "успех" без записи
  if (String(body.hp ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const contact = String(body.contact_value ?? "").trim();
  if (!name || !contact) {
    return NextResponse.json({ error: "Заполни имя и контакт для связи" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const ip = getClientIp(req);

  // Капча Cloudflare Turnstile (если включена)
  if (!(await verifyTurnstile(String(body.turnstile_token ?? ""), ip))) {
    return NextResponse.json({ error: "Подтверди, что ты не робот, и попробуй снова" }, { status: 400 });
  }

  // Чёрный список — тихо игнорируем
  if (await isBlocked(sb, contact, ip)) {
    return NextResponse.json({ ok: true });
  }

  // Дедуп: та же анкета (тот же контакт) за последние 24 ч
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: dup } = await sb
    .from("leads")
    .select("id")
    .eq("contact_value", contact)
    .gte("created_at", since24h)
    .limit(1);
  if (dup && dup.length > 0) {
    return NextResponse.json(
      { error: "Ты недавно уже оставляла заявку — я скоро свяжусь с тобой 💜" },
      { status: 429 },
    );
  }

  // Лимит по IP: не больше 5 анкет в час
  if (ip) {
    const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await sb
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since1h);
    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Слишком много заявок. Попробуй позже." }, { status: 429 });
    }
  }

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

  const { data, error } = await sb
    .from("leads")
    .insert({ ...row, ip })
    .select("id")
    .single();

  if (error) {
    console.error("Ошибка записи заявки:", error);
    return NextResponse.json({ error: "Не удалось сохранить заявку, попробуй ещё раз" }, { status: 500 });
  }

  try {
    await sendTelegramMessage(buildLeadMessage(body));
  } catch (e) {
    console.error("Не удалось отправить уведомление в Telegram:", e);
  }

  return NextResponse.json({ ok: true, id: data.id });
}
