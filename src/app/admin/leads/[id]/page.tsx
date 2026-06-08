import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ANKETA_GROUPS } from "@/lib/anketa";
import { statusMeta } from "@/lib/leads";
import LeadControls from "./LeadControls";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: lead } = await supabaseAdmin().from("leads").select("*").eq("id", id).single();
  if (!lead) notFound();

  const row = lead as Record<string, unknown>;
  const s = statusMeta(String(row.status ?? "new"));

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm text-rose-600 hover:underline">
          ← Ко всем заявкам
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">{String(row.name || "Без имени")}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>{s.label}</span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Заявка от{" "}
          {new Date(String(row.created_at)).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <div className="mt-6">
          <LeadControls
            id={id}
            initialStatus={String(row.status ?? "new")}
            initialNotes={String(row.notes ?? "")}
          />
        </div>

        <div className="mt-6 space-y-4">
          {ANKETA_GROUPS.map((group) => {
            const filled = group.fields.filter((f) => {
              const v = row[f.name];
              return v !== undefined && v !== null && String(v).trim() !== "";
            });
            if (filled.length === 0) return null;
            return (
              <section key={group.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-rose-700">
                  {group.emoji} {group.title}
                </h2>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  {filled.map((f) => (
                    <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                      <dt className="text-xs uppercase tracking-wide text-zinc-400">{f.label}</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800">{String(row[f.name])}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
