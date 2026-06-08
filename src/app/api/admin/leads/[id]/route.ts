import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { LEAD_STATUSES } from "@/lib/leads";

const VALID_STATUSES = new Set(LEAD_STATUSES.map((s) => s.value));

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const update: Record<string, string> = {};
  if (typeof body.status === "string" && VALID_STATUSES.has(body.status)) {
    update.status = body.status;
  }
  if (typeof body.notes === "string") {
    update.notes = body.notes;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Нет изменений" }, { status: 400 });
  }

  const { error } = await supabaseAdmin().from("leads").update(update).eq("id", id);
  if (error) {
    console.error("Ошибка обновления заявки:", error);
    return NextResponse.json({ error: "Не удалось сохранить" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseAdmin().from("leads").delete().eq("id", id);
  if (error) {
    console.error("Ошибка удаления заявки:", error);
    return NextResponse.json({ error: "Не удалось удалить" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
