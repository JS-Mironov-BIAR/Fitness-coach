// Общие хелперы для записи на занятия.

export const SLOT_FORMATS = [
  { value: "offline", label: "Очно · Гомель" },
  { value: "online", label: "Онлайн" },
] as const;

export type SlotFormat = (typeof SLOT_FORMATS)[number]["value"];

export function formatLabel(value: string): string {
  return SLOT_FORMATS.find((f) => f.value === value)?.label ?? value;
}

export const CONTACT_METHODS = ["Telegram", "Instagram", "Телефон"] as const;

export type Slot = {
  id: string;
  starts_at: string;
  duration_min: number;
  format: string;
  status: string; // open | booked | blocked
  title: string | null;
};

// ───────── работа со временем (гибкий ввод админа) ─────────

// "10" -> "10:00", "9" -> "09:00", "10:30"/"10.30"/"10 30" -> "10:30"
export function normalizeTime(raw: string): string | null {
  const s = String(raw).trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})(?:[:.\s]+(\d{1,2}))?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = m[2] != null ? parseInt(m[2], 10) : 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

// "10, 11, 12:30" -> ["10:00","11:00","12:30"] (запятая/; /перенос строки)
export function parseTimesList(input: string): string[] {
  const out: string[] = [];
  for (const part of String(input).split(/[,;\n]+/)) {
    const t = normalizeTime(part);
    if (t && !out.includes(t)) out.push(t);
  }
  out.sort();
  return out;
}

function hmToMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function minToHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Список времён от from до to с шагом stepMin: ("10:00","18:00",60)
export function buildTimeRange(from: string, to: string, stepMin: number): string[] {
  const a = normalizeTime(from);
  const b = normalizeTime(to);
  if (!a || !b || stepMin <= 0) return [];
  let cur = hmToMin(a);
  const end = hmToMin(b);
  const out: string[] = [];
  let guard = 0;
  while (cur <= end && guard < 200) {
    out.push(minToHm(cur));
    cur += stepMin;
    guard++;
  }
  return out;
}
