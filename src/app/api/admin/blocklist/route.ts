import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const value = String(b.value ?? "").trim();
  const kind = String(b.kind ?? "contact") === "ip" ? "ip" : "contact";
  const note = String(b.note ?? "").trim() || null;

  if (!value) {
    return NextResponse.json({ error: "Укажи значение" }, { status: 400 });
  }

  const { error } = await supabaseAdmin().from("blocklist").insert({ value, kind, note });
  if (error) {
    console.error("Блок-лист:", error);
    return NextResponse.json({ error: "Не удалось добавить" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
