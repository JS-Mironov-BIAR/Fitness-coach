import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Ежедневный пинг базы, чтобы free-проект Supabase не вставал на паузу.
export async function GET() {
  try {
    await supabaseAdmin().from("site_settings").select("id").limit(1);
  } catch {
    // не критично
  }
  return NextResponse.json({ ok: true });
}
