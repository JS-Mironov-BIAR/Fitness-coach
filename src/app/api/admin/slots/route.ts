import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseTimesList, buildTimeRange } from "@/lib/booking";

const FORMATS = new Set(["offline", "online"]);
const MAX_INSERT = 1000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sb = supabaseAdmin();

  // ───── Блокировка / разблокировка всего дня (booked не трогаем) ─────
  if (body.mode === "blockDay") {
    const date = String(body.date ?? "");
    const blocked = Boolean(body.blocked);
    if (!date) return NextResponse.json({ error: "Не задана дата" }, { status: 400 });

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);
    const from = blocked ? "open" : "blocked";
    const to = blocked ? "blocked" : "open";

    const { error } = await sb
      .from("slots")
      .update({ status: to })
      .gte("starts_at", start.toISOString())
      .lte("starts_at", end.toISOString())
      .eq("status", from);

    if (error) {
      console.error("blockDay error:", error);
      return NextResponse.json({ error: "Не удалось изменить день" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // ───── Генерация расписания на период ─────
  if (body.mode === "generate") {
    const fromStr = String(body.from ?? "");
    const toStr = String(body.to ?? "");
    const weekdays: number[] = Array.isArray(body.weekdays) ? body.weekdays.map(Number) : [];
    const format = String(body.format ?? "offline");
    const duration = Number(body.duration_min ?? 60);
    const step = Number(body.step_min ?? duration ?? 60);

    const times = buildTimeRange(String(body.time_from ?? ""), String(body.time_to ?? ""), step);

    if (!fromStr || !toStr || weekdays.length === 0 || times.length === 0 || !FORMATS.has(format)) {
      return NextResponse.json(
        { error: "Заполни период, дни недели и рабочие часы" },
        { status: 400 },
      );
    }

    const from = new Date(`${fromStr}T00:00:00`);
    const to = new Date(`${toStr}T00:00:00`);
    if (from > to) {
      return NextResponse.json({ error: "Дата начала позже даты конца" }, { status: 400 });
    }

    const now = new Date();
    const wanted: string[] = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (!weekdays.includes(d.getDay())) continue;
      for (const t of times) {
        const [h, m] = t.split(":").map(Number);
        const dt = new Date(d);
        dt.setHours(h, m, 0, 0);
        if (dt < now) continue;
        wanted.push(dt.toISOString());
      }
      if (wanted.length > MAX_INSERT) break;
    }

    if (wanted.length === 0) {
      return NextResponse.json({ error: "В этом периоде нет подходящих дней" }, { status: 400 });
    }
    if (wanted.length > MAX_INSERT) {
      return NextResponse.json(
        { error: "Слишком большой период — сократи диапазон или шаг" },
        { status: 400 },
      );
    }

    // Не плодим дубли: пропускаем уже существующие слоты на те же даты-время
    const { data: existing } = await sb
      .from("slots")
      .select("starts_at")
      .gte("starts_at", from.toISOString())
      .lte("starts_at", new Date(to.getTime() + 24 * 60 * 60 * 1000).toISOString());
    const existingSet = new Set((existing ?? []).map((e) => new Date(e.starts_at).toISOString()));

    const rows = wanted
      .filter((iso) => !existingSet.has(iso))
      .map((iso) => ({
        starts_at: iso,
        duration_min: Number.isFinite(duration) && duration > 0 ? duration : 60,
        format,
        status: "open",
      }));

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const { error } = await sb.from("slots").insert(rows);
    if (error) {
      console.error("Генерация слотов:", error);
      return NextResponse.json({ error: "Не удалось создать слоты" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, count: rows.length });
  }

  // ───── Точечное создание слотов на одну дату ─────
  const date = String(body.date ?? "");
  const format = String(body.format ?? "offline");
  const duration = Number(body.duration_min ?? 60);
  const cleanTimes = parseTimesList(String(body.times ?? ""));

  if (!date || cleanTimes.length === 0 || !FORMATS.has(format)) {
    return NextResponse.json({ error: "Укажи дату, время и формат" }, { status: 400 });
  }

  const rows = cleanTimes.map((t) => ({
    starts_at: new Date(`${date}T${t}:00`).toISOString(),
    duration_min: Number.isFinite(duration) && duration > 0 ? duration : 60,
    format,
    status: "open",
  }));

  const { error } = await sb.from("slots").insert(rows);
  if (error) {
    console.error("Создание слотов:", error);
    return NextResponse.json({ error: "Не удалось создать слоты" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
