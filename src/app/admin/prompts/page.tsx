import AdminNav from "@/components/AdminNav";
import LogoutButton from "@/app/admin/LogoutButton";
import PromptsList from "./PromptsList";

export const dynamic = "force-dynamic";

export default function AdminPromptsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900">Промпты</h1>
        <PromptsList />
      </div>
    </main>
  );
}
