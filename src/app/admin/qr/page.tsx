import AdminNav from "@/components/AdminNav";
import LogoutButton from "@/app/admin/LogoutButton";
import { SITE_URL } from "@/lib/settings";
import QrCodes from "./QrCodes";

export const dynamic = "force-dynamic";

export default function AdminQrPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 font-sans">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <AdminNav />
          <LogoutButton />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">QR-коды</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Скачай и добавь на визитки, в сторис или посты — по коду сразу откроется сайт или анкета.
        </p>
        <div className="mt-6">
          <QrCodes baseUrl={SITE_URL} />
        </div>
      </div>
    </main>
  );
}
