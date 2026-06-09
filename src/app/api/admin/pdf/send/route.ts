import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTelegramDocument } from "@/lib/telegram";

function safeName(s: string) {
  const cleaned = s.replace(/[^\p{L}\p{N}\-_ ]/gu, "").trim();
  return cleaned || "programma";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Нет файла" }, { status: 400 });
  }

  const type = String(form.get("type") ?? "training") === "nutrition" ? "nutrition" : "training";
  const title = String(form.get("title") ?? "Программа");
  const leadId = form.get("lead_id") ? String(form.get("lead_id")) : null;
  const caption = (String(form.get("caption") ?? "").trim() || undefined) as string | undefined;

  const bytes = await file.arrayBuffer();

  try {
    await sendTelegramDocument(`${safeName(title)}.pdf`, bytes, caption);
  } catch (e) {
    console.error("PDF в Telegram:", e);
    return NextResponse.json({ error: "Не удалось отправить в Telegram" }, { status: 500 });
  }

  await supabaseAdmin().from("programs").insert({
    lead_id: leadId,
    type,
    title,
    sent_to_telegram: true,
  });

  return NextResponse.json({ ok: true });
}
