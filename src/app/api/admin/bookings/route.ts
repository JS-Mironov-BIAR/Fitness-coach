import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseTimesList, localToUtcISO } from "@/lib/booking";

const MAX = 600;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sb = supabaseAdmin();

  // ───── Вести клиента на период: создаём занятые слоты + записи ─────
  if (body.mode === "recurring") {
    const name = String(body.name ?? "").trim();
    const contactMethod = String(body.contact_method ?? "").trim() || null;
    const contactValue = String(body.contact_value ?? "").trim() || null;
    const comment = String(body.comment ?? "").trim() || null;
    const format = String(body.format ?? "offline");
    const duration = Number(body.duration_min ?? 60);
    const weekdays: number[] = Array.isArray(body.weekdays) ? body.weekdays.map(Number) : [];
    const times = parseTimesList(String(body.times ?? ""));
    const fromStr = String(body.from ?? "");
    const toStr = String(body.to ?? "");

    if (!name || !fromStr || !toStr || weekdays.length === 0 || times.length === 0) {
      return NextResponse.json({ error: "Заполни имя, период, дни недели и время" }, { status: 400 });
    }

    const from = new Date(`${fromStr}T00:00:00`);
    const to = new Date(`${toStr}T00:00:00`);
    if (from > to) return NextResponse.json({ error: "Дата начала позже конца" }, { status: 400 });

    const nowMs = Date.now();
    const wanted: string[] = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (!weekdays.includes(d.getDay())) continue;
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      for (const t of times) {
        const iso = localToUtcISO(ds, t);
        if (new Date(iso).getTime() >= nowMs) wanted.push(iso);
      }
      if (wanted.length > MAX) break;
    }

    if (wanted.length === 0) {
      return NextResponse.json({ error: "В этом периоде нет подходящих дат" }, { status: 400 });
    }
    if (wanted.length > MAX) {
      return NextResponse.json({ error: "Слишком большой период — сократи диапазон" }, { status: 400 });
    }

    const { data: existing } = await sb
      .from("slots")
      .select("id, starts_at, status")
      .gte("starts_at", new Date(from.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .lte("starts_at", new Date(to.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString());
    const exMap = new Map<string, { id: string; status: string }>();
    for (const e of existing ?? []) exMap.set(new Date(e.starts_at).toISOString(), { id: e.id, status: e.status });

    const toCreate: Record<string, unknown>[] = [];
    const reuseIds: string[] = [];
    let skipped = 0;
    for (const iso of wanted) {
      const ex = exMap.get(iso);
      if (ex) {
        if (ex.status === "booked") {
          skipped++;
          continue;
        }
        reuseIds.push(ex.id);
      } else {
        toCreate.push({ starts_at: iso, duration_min: duration > 0 ? duration : 60, format, status: "booked" });
      }
    }

    let createdIds: string[] = [];
    if (toCreate.length) {
      const { data, error } = await sb.from("slots").insert(toCreate).select("id");
      if (error) {
        console.error("recurring create slots:", error);
        return NextResponse.json({ error: "Не удалось создать слоты" }, { status: 500 });
      }
      createdIds = (data ?? []).map((d) => d.id as string);
    }
    if (reuseIds.length) {
      const { error } = await sb.from("slots").update({ status: "booked" }).in("id", reuseIds);
      if (error) {
        console.error("recurring reuse slots:", error);
        return NextResponse.json({ error: "Не удалось занять слоты" }, { status: 500 });
      }
    }

    const allIds = [...createdIds, ...reuseIds];
    if (allIds.length) {
      const rows = allIds.map((id) => ({
        slot_id: id,
        name,
        contact_method: contactMethod,
        contact_value: contactValue,
        comment,
        format,
      }));
      const { error } = await sb.from("bookings").insert(rows);
      if (error) {
        console.error("recurring bookings:", error);
        return NextResponse.json({ error: "Не удалось записать клиента" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, count: allIds.length, skipped });
  }

  // ───── Закрепить один слот за человеком ─────
  const slotId = String(body.slot_id ?? "");
  const name = String(body.name ?? "").trim();
  const contactMethod = String(body.contact_method ?? "").trim() || null;
  const contactValue = String(body.contact_value ?? "").trim() || null;
  const comment = String(body.comment ?? "").trim() || null;

  if (!slotId || !name) {
    return NextResponse.json({ error: "Укажи имя" }, { status: 400 });
  }

  const { data: slot, error: slotErr } = await sb.from("slots").select("id, format").eq("id", slotId).single();
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
