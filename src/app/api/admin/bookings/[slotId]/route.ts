import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Отменить запись на слот: удалить бронь и снова открыть слот
export async function DELETE(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = await params;
  const sb = supabaseAdmin();

  const { error: delErr } = await sb.from("bookings").delete().eq("slot_id", slotId);
  if (delErr) {
    console.error("Отмена записи:", delErr);
    return NextResponse.json({ error: "Не удалось отменить" }, { status: 500 });
  }

  await sb.from("slots").update({ status: "open" }).eq("id", slotId).eq("status", "booked");
  return NextResponse.json({ ok: true });
}
