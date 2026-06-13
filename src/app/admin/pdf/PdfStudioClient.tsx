"use client";

import dynamic from "next/dynamic";

type LeadFull = Record<string, unknown> & { id: string };

const PdfStudio = dynamic(() => import("./PdfStudio"), {
  ssr: false,
  loading: () => <div className="py-16 text-center text-zinc-400">Загрузка редактора…</div>,
});

export default function PdfStudioClient({ leads, contacts }: { leads: LeadFull[]; contacts: string }) {
  return <PdfStudio leads={leads} contacts={contacts} />;
}
