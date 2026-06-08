import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatLabel } from "@/lib/booking";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
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

  // Помечаем занятым атомарно: апдейт только если ещё open (защита от гонки)
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
  });

  if (insErr) {
    // откатываем слот обратно в open
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
