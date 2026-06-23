import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSiteSettings } from "@/lib/settings";
import AdminNav from "@/components/AdminNav";
import LogoutButton from "@/app/admin/LogoutButton";
import PdfStudioClient from "./PdfStudioClient";

export const dynamic = "force-dynamic";

type LeadFull = Record<string, unknown> & { id: string };

type ProgramRow = {
  id: string;
  type: string;
  title: string | null;
  created_at: string;
  sent_to_telegram: boolean;
  leads: { name: string | null } | { name: string | null }[] | null;
};

function leadName(p: ProgramRow): string {
  if (!p.leads) return "—";
  const l = Array.isArray(p.leads) ? p.leads[0] : p.leads;
  return l?.name ?? "—";
}

export default async function AdminPdfPage() {
  const sb = supabaseAdmin();

  const { data: leadData } = await sb.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  const leads = (leadData ?? []) as LeadFull[];

  const { data: programData } = await sb
    .from("programs")
    .select("id, type, title, created_at, sent_to_telegram, leads(name)")
    .order("created_at", { ascending: false })
    .limit(20);
  const programs = (programData ?? []) as unknown as ProgramRow[];

  const settings = await getSiteSettings();
  const contacts = [
    settings.instagram_url ? `Instagram: ${settings.instagram_url}` : null,
    settings.telegram_url ? `Telegram: ${settings.telegram_url}` : null,
    settings.vk_url ? `VK: ${settings.vk_url}` : null,
    settings.phone || null,
  ]
    .filter(Boolean)
    .join("    ·    ");

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Конструктор PDF</h1>
        <p className="mb-5 text-sm text-zinc-500">
          Выбери клиента, собери программу из блоков — справа живое превью. Скачай или отправь в Telegram. Файлы не
          хранятся, фиксируется только факт генерации.
        </p>

        <PdfStudioClient leads={leads} contacts={contacts} />

        {/* История генераций */}
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">История генераций</h2>
          {programs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-6 text-center text-zinc-500">
              Пока ничего не генерировалось.
            </p>
          ) : (
            <div className="space-y-2">
              {programs.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">
                      {p.title || (p.type === "nutrition" ? "План питания" : "Программа тренировок")}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {leadName(p)} · {p.type === "nutrition" ? "питание" : "тренировки"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {p.sent_to_telegram && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        отправлено
                      </span>
                    )}
                    <time className="text-xs text-zinc-400">
                      {new Date(p.created_at).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
