import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Закрепить слот за человеком (запись из админки)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slotId = String(body.slot_id ?? "");
  const name = String(body.name ?? "").trim();
  const contactMethod = String(body.contact_method ?? "").trim() || null;
  const contactValue = String(body.contact_value ?? "").trim() || null;
  const comment = String(body.comment ?? "").trim() || null;

  if (!slotId || !name) {
    return NextResponse.json({ error: "Укажи имя" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: slot, error: slotErr } = await sb
    .from("slots")
    .select("id, format")
    .eq("id", slotId)
    .single();
  if (slotErr || !slot) {
    return NextResponse.json({ error: "Слот не найден" }, { status: 404 });
  }

  const { error: insErr } = await sb.from("bookings").insert({
    slot_id: slotId,
    name,
    contact_method: contactMethod,
    contact_value: contactValue,
    comment,
    format: slot.format,
  });
  if (insErr) {
    console.error("Запись (админ):", insErr);
    return NextResponse.json({ error: "Не удалось записать" }, { status: 500 });
  }

  await sb.from("slots").update({ status: "booked" }).eq("id", slotId);
  return NextResponse.json({ ok: true });
}
