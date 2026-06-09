import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Лог генерации PDF (сам файл не храним) — только пометка «сгенерировано + дата»
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const type = String(b.type ?? "training") === "nutrition" ? "nutrition" : "training";
  const title = String(b.title ?? "").trim() || null;
  const leadId = b.lead_id ? String(b.lead_id) : null;
  const sent = Boolean(b.sent_to_telegram);

  const { error } = await supabaseAdmin().from("programs").insert({
    lead_id: leadId,
    type,
    title,
    sent_to_telegram: sent,
  });
  if (error) {
    console.error("Лог программы:", error);
    return NextResponse.json({ error: "Не удалось записать лог" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
