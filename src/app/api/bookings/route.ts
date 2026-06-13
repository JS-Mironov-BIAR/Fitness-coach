import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatLabel } from "@/lib/booking";
import { getClientIp, isBlocked, verifyTurnstile } from "@/lib/security";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  // Ханипот
  if (String(body.hp ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const slotId = String(body.slot_id ?? "");
  const name = String(body.name ?? "").trim();
  const contactValue = String(body.contact_value ?? "").trim();
  const contactMethod = String(body.contact_method ?? "").trim() || null;
  const comment = String(body.comment ?? "").trim() || null;

  if (!slotId || !name || !contactValue) {
    return NextResponse.json({ error: "Заполни имя и контакт" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const ip = getClientIp(req);

  // Капча Cloudflare Turnstile (если включена)
  if (!(await verifyTurnstile(String(body.turnstile_token ?? ""), ip))) {
    return NextResponse.json({ error: "Подтверди, что ты не робот, и попробуй снова" }, { status: 400 });
  }

  // Чёрный список — тихо игнорируем
  if (await isBlocked(sb, contactValue, ip)) {
    return NextResponse.json({ ok: true });
  }

  // Лимит по IP: не больше 8 записей в час
  if (ip) {
    const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since1h);
    if ((count ?? 0) >= 8) {
      return NextResponse.json({ error: "Слишком много записей. Попробуй позже." }, { status: 429 });
    }
  }

  const { data: slot, error: slotErr } = await sb
    .from("slots")
    .select("id, starts_at, format, status")
    .eq("id", slotId)
    .single();

  if (slotErr || !slot) {
    return NextResponse.json({ error: "Слот не найден" }, { status: 404 });
  }
  if (slot.status !== "open") {
    return NextResponse.json({ error: "Это время уже занято" }, { status: 409 });
  }

  const { data: locked, error: lockErr } = await sb
    .from("slots")
    .update({ status: "booked" })
    .eq("id", slotId)
    .eq("status", "open")
    .select("id")
    .maybeSingle();

  if (lockErr || !locked) {
    return NextResponse.json({ error: "Это время уже занято" }, { status: 409 });
  }

  const { error: insErr } = await sb.from("bookings").insert({
    slot_id: slotId,
    name,
    contact_method: contactMethod,
    contact_value: contactValue,
    format: slot.format,
    comment,
    ip,
  });

  if (insErr) {
    await sb.from("slots").update({ status: "open" }).eq("id", slotId);
    console.error("Ошибка записи брони:", insErr);
    return NextResponse.json({ error: "Не удалось записать, попробуй ещё раз" }, { status: 500 });
  }

  try {
    const when = new Date(slot.starts_at).toLocaleString("ru-RU", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const contact = [contactMethod, contactValue].filter(Boolean).join(": ");
    await sendTelegramMessage(
      `📅 Новая запись на занятие\n\n• Когда: ${when}\n• Формат: ${formatLabel(slot.format)}\n• Имя: ${name}\n• Контакт: ${contact}${comment ? `\n• Комментарий: ${comment}` : ""}`,
    );
  } catch (e) {
    console.error("Telegram (booking):", e);
  }

  return NextResponse.json({ ok: true });
}
