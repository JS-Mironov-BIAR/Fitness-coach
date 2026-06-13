import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Принудительно сбросить кэш публичных страниц (применить свежие настройки/тексты сразу)
export async function POST() {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("revalidate:", e);
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
