import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseAdmin().from("blocklist").delete().eq("id", id);
  if (error) {
    console.error("Удаление из блок-листа:", error);
    return NextResponse.json({ error: "Не удалось удалить" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
