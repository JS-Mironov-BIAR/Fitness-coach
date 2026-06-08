// Статусы заявок для админки.
export const LEAD_STATUSES = [
  { value: "new", label: "Новая", badge: "bg-rose-100 text-rose-700" },
  { value: "contacted", label: "Связались", badge: "bg-amber-100 text-amber-700" },
  { value: "client", label: "Клиент", badge: "bg-emerald-100 text-emerald-700" },
  { value: "archived", label: "Архив", badge: "bg-zinc-100 text-zinc-600" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

export function statusMeta(value: string) {
  return LEAD_STATUSES.find((s) => s.value === value) ?? LEAD_STATUSES[0];
}
