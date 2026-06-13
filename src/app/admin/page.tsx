import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { statusMeta } from "@/lib/leads";
import LogoutButton from "./LogoutButton";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  created_at: string;
  name: string | null;
  contact_method: string | null;
  contact_value: string | null;
  city: string | null;
  goal: string | null;
  service_interest: string | null;
  status: string;
};

export default async function AdminLeadsPage() {
  const { data, error } = await supabaseAdmin()
    .from("leads")
    .select("id, created_at, name, contact_method, contact_value, city, goal, service_interest, status")
    .order("created_at", { ascending: false });

  const leads = (data ?? []) as LeadRow[];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <AdminNav />
          <LogoutButton />
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Заявки</h1>
          <p className="text-sm text-zinc-500">Всего: {leads.length}</p>
        </div>

        {error && (
          <p className="rounded-xl bg-violet-50 px-4 py-3 text-violet-600">
            Ошибка загрузки: {error.message}
          </p>
        )}

        {leads.length === 0 && !error && (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-500">
            Пока заявок нет.
          </p>
        )}

        <div className="space-y-3">
          {leads.map((lead) => {
            const s = statusMeta(lead.status);
            return (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900">{lead.name || "Без имени"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>{s.label}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-zinc-600">
                      {[lead.contact_method, lead.contact_value].filter(Boolean).join(": ") || "—"}
                      {lead.city ? ` · ${lead.city}` : ""}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-zinc-500">
                      {[lead.goal, lead.service_interest].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-zinc-400">
                    {new Date(lead.created_at).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
