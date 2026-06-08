import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Slot } from "@/lib/booking";
import AdminCalendar, { type AdminBooking } from "./AdminCalendar";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sb = supabaseAdmin();

  const { data: slotData, error } = await sb
    .from("slots")
    .select("id, starts_at, duration_min, format, status, title")
    .gte("starts_at", since.toISOString())
    .order("starts_at", { ascending: true });

  const slots = (slotData ?? []) as Slot[];

  let bookings: AdminBooking[] = [];
  if (slots.length > 0) {
    const { data: bookingData } = await sb
      .from("bookings")
      .select("id, slot_id, name, contact_method, contact_value, comment")
      .in(
        "slot_id",
        slots.map((s) => s.id),
      );
    bookings = (bookingData ?? []) as AdminBooking[];
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Дневник записей</h1>
            <p className="text-sm text-zinc-500">Слотов впереди: {slots.length}</p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white"
          >
            ← Заявки
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-rose-600">Ошибка загрузки: {error.message}</p>
        )}

        <AdminCalendar initialSlots={slots} initialBookings={bookings} />
      </div>
    </main>
  );
}
