import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Сменить статус слота (open <-> blocked). booked не меняем.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");

  if (status !== "open" && status !== "blocked") {
    return NextResponse.json({ error: "Неверный статус" }, { status: 400 });
  }

  const { error } = await supabaseAdmin()
    .from("slots")
    .update({ status })
    .eq("id", id)
    .neq("status", "booked");

  if (error) {
    console.error("Обновление слота:", error);
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// Удалить слот
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseAdmin().from("slots").delete().eq("id", id);
  if (error) {
    console.error("Удаление слота:", error);
    return NextResponse.json({ error: "Не удалось удалить" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
