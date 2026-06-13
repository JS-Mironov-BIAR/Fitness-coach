"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SLOT_FORMATS, CONTACT_METHODS, formatLabel, TZ, type Slot } from "@/lib/booking";
import {
  PlusIcon,
  TrashIcon,
  LockIcon,
  ClockIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  HeartIcon,
  ChevronDownIcon,
} from "@/components/icons";

export type AdminBooking = {
  id: string;
  slot_id: string | null;
  name: string | null;
  contact_method: string | null;
  contact_value: string | null;
  comment: string | null;
};

export type LeadOption = {
  id: string;
  name: string | null;
  contact_method: string | null;
  contact_value: string | null;
};

const WEEKDAYS = [
  { d: 1, label: "Пн" },
  { d: 2, label: "Вт" },
  { d: 3, label: "Ср" },
  { d: 4, label: "Чт" },
  { d: 5, label: "Пт" },
  { d: 6, label: "Сб" },
  { d: 0, label: "Вс" },
];

const inputCls =
  "mt-1.5 w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200";

function dayDate(iso: string) {
  // YYYY-MM-DD по календарю Беларуси (независимо от пояса устройства)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}
function dayTitle(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}
function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
      >
        <span className="font-semibold text-zinc-900">{title}</span>
        <ChevronDownIcon className={`h-5 w-5 shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-zinc-100 px-5 py-5">{children}</div>}
    </div>
  );
}

export default function AdminCalendar({
  initialSlots,
  initialBookings,
  leads,
}: {
  initialSlots: Slot[];
  initialBookings: AdminBooking[];
  leads: LeadOption[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [assignSlot, setAssignSlot] = useState<Slot | null>(null);

  // выбор дней
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);

  // точечное добавление
  const [date, setDate] = useState("");
  const [times, setTimes] = useState("");
  const [format, setFormat] = useState<string>(SLOT_FORMATS[0].value);
  const [duration, setDuration] = useState("60");

  // генерация свободных слотов
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeFrom, setTimeFrom] = useState("10:00");
  const [timeTo, setTimeTo] = useState("19:00");
  const [step, setStep] = useState("60");
  const [genFormat, setGenFormat] = useState<string>(SLOT_FORMATS[0].value);
  const [genDuration, setGenDuration] = useState("60");

  // вести клиента на период
  const [rcName, setRcName] = useState("");
  const [rcMethod, setRcMethod] = useState<string>(CONTACT_METHODS[0]);
  const [rcValue, setRcValue] = useState("");
  const [rcComment, setRcComment] = useState("");
  const [rcFormat, setRcFormat] = useState<string>(SLOT_FORMATS[0].value);
  const [rcWeekdays, setRcWeekdays] = useState<number[]>([1]);
  const [rcTimes, setRcTimes] = useState("18:00");
  const [rcFrom, setRcFrom] = useState("");
  const [rcTo, setRcTo] = useState("");
  const [rcDuration, setRcDuration] = useState("60");

  const bookingBySlot = new Map<string, AdminBooking>();
  for (const b of initialBookings) if (b.slot_id) bookingBySlot.set(b.slot_id, b);

  async function call(input: RequestInfo, init: RequestInit): Promise<{ ok: boolean; count?: number }> {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(input, init);
      const data = (await res.json().catch(() => ({}))) as { error?: string; count?: number };
      if (!res.ok) throw new Error(data.error || "Ошибка");
      router.refresh();
      return { ok: true, count: data.count };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }

  async function addSlots(e: React.FormEvent) {
    e.preventDefault();
    const r = await call("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, times, format, duration_min: Number(duration) }),
    });
    if (r.ok) {
      setTimes("");
      setInfo(`Добавлено слотов: ${r.count ?? 0}`);
    }
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    const r = await call("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "generate",
        from,
        to,
        weekdays,
        time_from: timeFrom,
        time_to: timeTo,
        step_min: Number(step),
        format: genFormat,
        duration_min: Number(genDuration),
      }),
    });
    if (r.ok) setInfo(`Создано свободных слотов: ${r.count ?? 0}`);
  }

  async function leadClient(e: React.FormEvent) {
    e.preventDefault();
    const r = await call("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "recurring",
        name: rcName,
        contact_method: rcMethod,
        contact_value: rcValue,
        comment: rcComment,
        format: rcFormat,
        weekdays: rcWeekdays,
        times: rcTimes,
        from: rcFrom,
        to: rcTo,
        duration_min: Number(rcDuration),
      }),
    });
    if (r.ok) setInfo(`Закреплено занятий за клиентом: ${r.count ?? 0}`);
  }

  function setStatus(id: string, status: "open" | "blocked") {
    return call(`/api/admin/slots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }
  function remove(id: string) {
    return call(`/api/admin/slots/${id}`, { method: "DELETE" });
  }
  function blockDay(d: string, blocked: boolean) {
    return call("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "blockDay", date: d, blocked }),
    });
  }
  function cancelBooking(slotId: string) {
    return call(`/api/admin/bookings/${slotId}`, { method: "DELETE" });
  }

  async function bulkDays(action: "delete" | "block" | "open") {
    const dates = Array.from(selected);
    if (dates.length === 0) return;
    const r = await call("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "bulkDays", action, dates }),
    });
    if (r.ok) {
      setSelected(new Set());
      setSelectMode(false);
    }
  }

  async function clearAll() {
    const r = await call("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "clearAll" }),
    });
    setConfirmClear(false);
    if (r.ok) setInfo("Расписание очищено");
  }

  function toggleDay(d: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
  }

  const groups: { date: string; title: string; slots: Slot[] }[] = [];
  for (const s of initialSlots) {
    const d = dayDate(s.starts_at);
    let g = groups.find((x) => x.date === d);
    if (!g) {
      g = { date: d, title: dayTitle(s.starts_at), slots: [] };
      groups.push(g);
    }
    g.slots.push(s);
  }

  const WD = (
    sel: number[],
    setter: (d: number) => void,
  ) => (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {WEEKDAYS.map((w) => {
        const on = sel.includes(w.d);
        return (
          <button
            key={w.d}
            type="button"
            onClick={() => setter(w.d)}
            className={`h-9 w-10 rounded-lg text-sm font-medium transition ${
              on ? "bg-violet-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {w.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4 pb-24">
      {(error || info) && (
        <p className={`rounded-xl px-4 py-3 text-sm ${error ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-700"}`}>
          {error || info}
        </p>
      )}

      {/* Подсказка */}
      <Section title="Как вести график">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
          <li>Создай свободные окна — разом на период или точечно.</li>
          <li>Клиенты записываются сами с сайта, либо закрепи кого-то вручную.</li>
          <li>Чтобы вести клиента месяцами — «Вести клиента на период».</li>
          <li>Режим «Выбрать дни» — массово закрыть/открыть/удалить дни.</li>
        </ol>
      </Section>

      {/* Формы (свёрнуты) */}
      <Section title="🗓 Свободные окна на период">
        <form onSubmit={generate}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-700">
              С даты
              <input type="date" value={from} required onChange={(e) => setFrom(e.target.value)} className={inputCls} />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              По дату
              <input type="date" value={to} required onChange={(e) => setTo(e.target.value)} className={inputCls} />
            </label>
          </div>
          <div className="mt-3 text-sm font-medium text-zinc-700">Дни недели{WD(weekdays, (d) => setWeekdays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d])))}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="text-sm font-medium text-zinc-700">Часы с<input value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} placeholder="10:00" className={inputCls} /></label>
            <label className="text-sm font-medium text-zinc-700">Часы по<input value={timeTo} onChange={(e) => setTimeTo(e.target.value)} placeholder="19:00" className={inputCls} /></label>
            <label className="text-sm font-medium text-zinc-700">Шаг, мин<input type="number" value={step} min={15} step={15} onChange={(e) => setStep(e.target.value)} className={inputCls} /></label>
            <label className="text-sm font-medium text-zinc-700">Длит., мин<input type="number" value={genDuration} min={15} step={15} onChange={(e) => setGenDuration(e.target.value)} className={inputCls} /></label>
          </div>
          <label className="mt-3 block text-sm font-medium text-zinc-700">Формат<select value={genFormat} onChange={(e) => setGenFormat(e.target.value)} className={inputCls}>{SLOT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}</select></label>
          <button type="submit" disabled={busy} className="mt-4 w-full rounded-full bg-violet-500 px-6 py-2.5 font-medium text-white transition hover:bg-violet-600 disabled:opacity-60 sm:w-auto">{busy ? "Создаём…" : "Создать окна"}</button>
        </form>
      </Section>

      <Section title="👤 Вести клиента на период">
        <form onSubmit={leadClient}>
          <label className="block text-sm font-medium text-zinc-700">
            Из заявки
            <select
              onChange={(e) => {
                const l = leads.find((x) => x.id === e.target.value);
                if (l) {
                  setRcName(l.name ?? "");
                  setRcMethod(l.contact_method || CONTACT_METHODS[0]);
                  setRcValue(l.contact_value ?? "");
                }
              }}
              className={inputCls}
            >
              <option value="">— вручную —</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.name || "Без имени"} {l.contact_value ? `· ${l.contact_value}` : ""}</option>)}
            </select>
          </label>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-700">Имя<input value={rcName} required onChange={(e) => setRcName(e.target.value)} className={inputCls} placeholder="Имя" /></label>
            <label className="text-sm font-medium text-zinc-700">Контакт<input value={rcValue} onChange={(e) => setRcValue(e.target.value)} className={inputCls} placeholder="@ник / телефон" /></label>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-700">С даты<input type="date" value={rcFrom} required onChange={(e) => setRcFrom(e.target.value)} className={inputCls} /></label>
            <label className="text-sm font-medium text-zinc-700">По дату<input type="date" value={rcTo} required onChange={(e) => setRcTo(e.target.value)} className={inputCls} /></label>
          </div>
          <div className="mt-3 text-sm font-medium text-zinc-700">Дни недели{WD(rcWeekdays, (d) => setRcWeekdays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d])))}</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium text-zinc-700">Время<input value={rcTimes} onChange={(e) => setRcTimes(e.target.value)} className={inputCls} placeholder="18:00" /></label>
            <label className="text-sm font-medium text-zinc-700">Формат<select value={rcFormat} onChange={(e) => setRcFormat(e.target.value)} className={inputCls}>{SLOT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}</select></label>
            <label className="text-sm font-medium text-zinc-700">Длит., мин<input type="number" value={rcDuration} min={15} step={15} onChange={(e) => setRcDuration(e.target.value)} className={inputCls} /></label>
          </div>
          <input value={rcComment} onChange={(e) => setRcComment(e.target.value)} className={inputCls} placeholder="Заметка (по желанию)" />
          <button type="submit" disabled={busy} className="mt-4 w-full rounded-full bg-violet-500 px-6 py-2.5 font-medium text-white transition hover:bg-violet-600 disabled:opacity-60 sm:w-auto">{busy ? "Записываем…" : "Закрепить за клиентом"}</button>
        </form>
      </Section>

      <Section title="➕ Отдельные окна">
        <form onSubmit={addSlots}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-700">Дата<input type="date" value={date} required onChange={(e) => setDate(e.target.value)} className={inputCls} /></label>
            <label className="text-sm font-medium text-zinc-700">Время (через запятую)<input type="text" value={times} required placeholder="10, 11, 12:30, 18" onChange={(e) => setTimes(e.target.value)} className={inputCls} /></label>
            <label className="text-sm font-medium text-zinc-700">Формат<select value={format} onChange={(e) => setFormat(e.target.value)} className={inputCls}>{SLOT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}</select></label>
            <label className="text-sm font-medium text-zinc-700">Длит., мин<input type="number" value={duration} min={15} step={15} onChange={(e) => setDuration(e.target.value)} className={inputCls} /></label>
          </div>
          <p className="mt-2 text-xs text-zinc-400">Можно «10», «10:30», «10.30».</p>
          <button type="submit" disabled={busy} className="mt-4 w-full rounded-full border border-zinc-300 px-6 py-2.5 font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 sm:w-auto">{busy ? "Сохраняем…" : "Добавить"}</button>
        </form>
      </Section>

      {/* Тулбар над списком дней */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            setSelectMode((v) => !v);
            setSelected(new Set());
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selectMode ? "bg-violet-500 text-white" : "border border-zinc-300 text-zinc-700 hover:bg-white"
          }`}
        >
          {selectMode ? "Выйти из выбора" : "Выбрать дни"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="ml-auto rounded-full border border-violet-200 px-4 py-2 text-sm font-medium text-violet-600 transition hover:bg-violet-50"
        >
          Очистить расписание
        </button>
      </div>

      {/* Дни */}
      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-500">
          Окон пока нет — создай выше.
        </p>
      ) : (
        groups.map((g) => {
          const hasOpen = g.slots.some((s) => s.status === "open");
          const hasBlocked = g.slots.some((s) => s.status === "blocked");
          const isSel = selected.has(g.date);
          return (
            <div key={g.date} className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${isSel ? "border-violet-400 ring-1 ring-violet-300" : "border-zinc-200"}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectMode && (
                    <button
                      type="button"
                      onClick={() => toggleDay(g.date)}
                      className={`flex h-6 w-6 items-center justify-center rounded-md border ${isSel ? "border-violet-500 bg-violet-500 text-white" : "border-zinc-300"}`}
                    >
                      {isSel && <CheckIcon className="h-4 w-4" />}
                    </button>
                  )}
                  <h3 className="font-semibold capitalize text-zinc-900">{g.title}</h3>
                </div>
                {!selectMode &&
                  (hasOpen ? (
                    <button onClick={() => blockDay(g.date, true)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60">
                      <LockIcon className="h-3.5 w-3.5" /> Закрыть день
                    </button>
                  ) : hasBlocked ? (
                    <button onClick={() => blockDay(g.date, false)} disabled={busy} className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60">
                      Открыть день
                    </button>
                  ) : null)}
              </div>

              <div className="space-y-2">
                {g.slots.map((s) => {
                  const booking = bookingBySlot.get(s.id);
                  const isBooked = s.status === "booked";
                  return (
                    <div key={s.id} className={`rounded-xl px-3 py-2.5 ${isBooked ? "bg-violet-50 ring-1 ring-violet-200" : s.status === "blocked" ? "bg-zinc-100" : "bg-zinc-50"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-800">
                          <ClockIcon className="h-4 w-4 text-zinc-400" />
                          <span className="font-semibold">{timeLabel(s.starts_at)}</span>
                          <span className="text-xs text-zinc-400">{formatLabel(s.format)} · {s.duration_min}м</span>
                          {s.status === "blocked" && <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600">закрыто</span>}
                          {s.status === "open" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">свободно</span>}
                        </div>
                        {!selectMode && (
                          <div className="flex shrink-0 items-center gap-1">
                            {s.status === "open" && (
                              <>
                                <button onClick={() => setAssignSlot(s)} disabled={busy} className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-600 disabled:opacity-60">Записать</button>
                                <button onClick={() => setStatus(s.id, "blocked")} disabled={busy} title="Закрыть" className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-200 disabled:opacity-60"><LockIcon className="h-4 w-4" /></button>
                              </>
                            )}
                            {s.status === "blocked" && <button onClick={() => setStatus(s.id, "open")} disabled={busy} className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-60">Открыть</button>}
                            {isBooked && <button onClick={() => cancelBooking(s.id)} disabled={busy} className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-60">Отменить</button>}
                            <button onClick={() => remove(s.id)} disabled={busy} title="Удалить" className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-violet-100 hover:text-violet-600 disabled:opacity-60"><TrashIcon className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                      {isBooked && (
                        <div className="mt-2 border-t border-violet-200/60 pt-2 text-sm">
                          <p className="font-medium text-violet-800">{booking?.name ?? "Запись"}</p>
                          {(booking?.contact_method || booking?.contact_value) && <p className="text-zinc-600">{[booking?.contact_method, booking?.contact_value].filter(Boolean).join(": ")}</p>}
                          {booking?.comment && <p className="text-zinc-500">{booking.comment}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Нижняя панель групповых действий */}
      {selectMode && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-zinc-700">Выбрано: {selected.size}</span>
            <button onClick={() => bulkDays("block")} disabled={busy} className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60">Закрыть</button>
            <button onClick={() => bulkDays("open")} disabled={busy} className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60">Открыть</button>
            <button onClick={() => bulkDays("delete")} disabled={busy} className="rounded-full bg-violet-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-60">Удалить</button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-sm text-zinc-500 hover:text-zinc-800">Снять</button>
          </div>
        </div>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && setConfirmClear(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-zinc-900">Очистить расписание?</h3>
            <p className="mt-2 text-sm text-zinc-500">Удалятся все будущие окна (и свободные, и записи). Это необратимо.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button onClick={() => setConfirmClear(false)} disabled={busy} className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60">Отмена</button>
              <button onClick={clearAll} disabled={busy} className="rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-60">{busy ? "Чистим…" : "Очистить"}</button>
            </div>
          </div>
        </div>
      )}

      {assignSlot && (
        <AssignModal
          slot={assignSlot}
          busy={busy}
          leads={leads}
          onClose={() => setAssignSlot(null)}
          onDone={() => setAssignSlot(null)}
          submit={async (payload) => {
            const r = await call("/api/admin/bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slot_id: assignSlot.id, ...payload }),
            });
            return r.ok;
          }}
        />
      )}
    </div>
  );
}

function AssignModal({
  slot,
  busy,
  leads,
  onClose,
  onDone,
  submit,
}: {
  slot: Slot;
  busy: boolean;
  leads: LeadOption[];
  onClose: () => void;
  onDone: () => void;
  submit: (payload: { name: string; contact_method: string; contact_value: string; comment: string }) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState<string>(CONTACT_METHODS[0]);
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");

  const when = new Date(slot.starts_at).toLocaleString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });

  const modalInput =
    "w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200";

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit({ name, contact_method: method, contact_value: value, comment });
    if (ok) onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 text-zinc-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Закрепить за человеком</h3>
            <p className="mt-1 text-sm capitalize text-violet-600">{when}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700" aria-label="Закрыть">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handle} className="mt-4 space-y-3">
          <select
            onChange={(e) => {
              const l = leads.find((x) => x.id === e.target.value);
              if (l) {
                setName(l.name ?? "");
                setMethod(l.contact_method || CONTACT_METHODS[0]);
                setValue(l.contact_value ?? "");
              }
            }}
            className={modalInput}
          >
            <option value="">— выбрать из заявок —</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.name || "Без имени"} {l.contact_value ? `· ${l.contact_value}` : ""}</option>)}
          </select>
          <input className={modalInput} placeholder="Имя *" value={name} required onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <select className={`${modalInput} max-w-[10rem]`} value={method} onChange={(e) => setMethod(e.target.value)}>{CONTACT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
            <input className={modalInput} placeholder="@ник или телефон" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <textarea className={modalInput} placeholder="Заметка (по желанию)" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-500 px-6 py-2.5 font-medium text-white transition hover:bg-violet-600 disabled:opacity-60">
            <CheckIcon className="h-4 w-4" /> {busy ? "Сохраняем…" : "Записать"}
          </button>
        </form>
      </div>
    </div>
  );
}
