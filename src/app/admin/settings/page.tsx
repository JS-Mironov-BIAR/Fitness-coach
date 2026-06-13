import AdminNav from "@/components/AdminNav";
import LogoutButton from "@/app/admin/LogoutButton";
import { getSiteSettings } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SettingsForm from "./SettingsForm";
import BlocklistManager, { type BlockEntry } from "./BlocklistManager";
import RevalidateButton from "./RevalidateButton";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  let blocklist: BlockEntry[] = [];
  try {
    const { data } = await supabaseAdmin()
      .from("blocklist")
      .select("id, value, kind, note")
      .order("created_at", { ascending: false });
    blocklist = (data ?? []) as BlockEntry[];
  } catch {
    blocklist = [];
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900">Настройки</h1>
        <div className="space-y-4">
          <SettingsForm initial={settings} />
          <BlocklistManager initial={blocklist} />
          <RevalidateButton />
        </div>
      </div>
    </main>
  );
}
