"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SLOT_FORMATS, CONTACT_METHODS, formatLabel, type Slot } from "@/lib/booking";
import { PlusIcon, TrashIcon, LockIcon, ClockIcon, CalendarIcon, CheckIcon, CloseIcon } from "@/components/icons";

export type AdminBooking = {
  id: string;
  slot_id: string | null;
  name: string | null;
  contact_method: string | null;
  contact_value: string | null;
  comment: string | null;
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
  "mt-1.5 w-full rounded-xl border border-rose-200 bg-rose-50/40 px-4 py-2.5 outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-200";

function dayDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayTitle(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
}
function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminCalendar({
  initialSlots,
  initialBookings,
}: {
  initialSlots: Slot[];
  initialBookings: AdminBooking[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [assignSlot, setAssignSlot] = useState<Slot | null>(null);

  // точечное добавление
  const [date, setDate] = useState("");
  const [times, setTimes] = useState("");
  const [format, setFormat] = useState<string>(SLOT_FORMATS[0].value);
  const [duration, setDuration] = useState("60");

  // генерация на период
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeFrom, setTimeFrom] = useState("10:00");
  const [timeTo, setTimeTo] = useState("19:00");
  const [step, setStep] = useState("60");
  const [genFormat, setGenFormat] = useState<string>(SLOT_FORMATS[0].value);
  const [genDuration, setGenDuration] = useState("60");

  const bookingBySlot = new Map<string, AdminBooking>();
  for (const b of initialBookings) {
    if (b.slot_id) bookingBySlot.set(b.slot_id, b);
  }

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
    if (r.ok) setInfo(`Создано слотов: ${r.count ?? 0}`);
  }

  function toggleWeekday(d: number) {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
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

  return (
    <div className="space-y-6">
      {(error || info) && (
        <p className={`rounded-xl px-4 py-3 text-sm ${error ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>
          {error || info}
        </p>
      )}

      {/* Генерация на период */}
      <form onSubmit={generate} className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <CalendarIcon className="h-5 w-5 text-rose-500" /> Расписание на период
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Рабочие часы и дни недели — слоты создадутся на весь период.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            С даты
            <input type="date" value={from} required onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            По дату
            <input type="date" value={to} required onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </label>
        </div>

        <div className="mt-3">
          <span className="text-sm font-medium text-zinc-700">Дни недели</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {WEEKDAYS.map((w) => {
              const on = weekdays.includes(w.d);
              return (
                <button
                  key={w.d}
                  type="button"
                  onClick={() => toggleWeekday(w.d)}
                  className={`h-9 w-11 rounded-lg text-sm font-medium transition ${
                    on ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="text-sm font-medium text-zinc-700">
            Часы с
            <input value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} placeholder="10:00" className={inputCls} />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Часы по
            <input value={timeTo} onChange={(e) => setTimeTo(e.target.value)} placeholder="19:00" className={inputCls} />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Шаг, мин
            <input type="number" value={step} min={15} step={15} onChange={(e) => setStep(e.target.value)} className={inputCls} />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Длит., мин
            <input type="number" value={genDuration} min={15} step={15} onChange={(e) => setGenDuration(e.target.value)} className={inputCls} />
          </label>
        </div>

        <label className="mt-3 block text-sm font-medium text-zinc-700">
          Формат
          <select value={genFormat} onChange={(e) => setGenFormat(e.target.value)} className={inputCls}>
            {SLOT_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-full bg-rose-500 px-6 py-2.5 font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {busy ? "Создаём…" : "Сгенерировать расписание"}
        </button>
      </form>

      {/* Точечное добавление */}
      <form onSubmit={addSlots} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <PlusIcon className="h-5 w-5 text-rose-500" /> Добавить отдельные слоты
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Дата
            <input type="date" value={date} required onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Время (через запятую)
            <input
              type="text"
              value={times}
              required
              placeholder="10, 11, 12:30, 18"
              onChange={(e) => setTimes(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Формат
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputCls}>
              {SLOT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Длительность, мин
            <input type="number" value={duration} min={15} step={15} onChange={(e) => setDuration(e.target.value)} className={inputCls} />
          </label>
        </div>
        <p className="mt-2 text-xs text-zinc-400">Можно писать «10», «10:30», «10.30» — приведём к нужному виду.</p>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-full border border-rose-300 px-6 py-2.5 font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
        >
          {busy ? "Сохраняем…" : "Добавить"}
        </button>
      </form>

      {/* Дневник по дням */}
      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-500">
          Слотов пока нет — создай расписание выше.
        </p>
      ) : (
        groups.map((g) => {
          const hasOpen = g.slots.some((s) => s.status === "open");
          const hasBlocked = g.slots.some((s) => s.status === "blocked");
          return (
            <div key={g.date} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold capitalize text-zinc-900">{g.title}</h3>
                {hasOpen ? (
                  <button
                    onClick={() => blockDay(g.date, true)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60"
                  >
                    <LockIcon className="h-3.5 w-3.5" /> Закрыть день
                  </button>
                ) : hasBlocked ? (
                  <button
                    onClick={() => blockDay(g.date, false)}
                    disabled={busy}
                    className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60"
                  >
                    Открыть день
                  </button>
                ) : null}
              </div>

              <div className="space-y-2">
                {g.slots.map((s) => {
                  const booking = bookingBySlot.get(s.id);
                  const isBooked = s.status === "booked";
                  return (
                    <div
                      key={s.id}
                      className={`rounded-xl px-3 py-2.5 ${
                        isBooked ? "bg-rose-50 ring-1 ring-rose-200" : s.status === "blocked" ? "bg-zinc-100" : "bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-800">
                          <ClockIcon className="h-4 w-4 text-zinc-400" />
                          <span className="font-semibold">{timeLabel(s.starts_at)}</span>
                          <span className="text-zinc-400">
                            · {formatLabel(s.format)} · {s.duration_min} мин
                          </span>
                          {s.status === "blocked" && (
                            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600">
                              закрыто
                            </span>
                          )}
                          {s.status === "open" && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              свободно
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {s.status === "open" && (
                            <>
                              <button
                                onClick={() => setAssignSlot(s)}
                                disabled={busy}
                                className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
                              >
                                Записать
                              </button>
                              <button
                                onClick={() => setStatus(s.id, "blocked")}
                                disabled={busy}
                                title="Закрыть слот"
                                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-200 disabled:opacity-60"
                              >
                                <LockIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {s.status === "blocked" && (
                            <button
                              onClick={() => setStatus(s.id, "open")}
                              disabled={busy}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-60"
                            >
                              Открыть
                            </button>
                          )}
                          {isBooked && (
                            <button
                              onClick={() => cancelBooking(s.id)}
                              disabled={busy}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-60"
                            >
                              Отменить
                            </button>
                          )}
                          <button
                            onClick={() => remove(s.id)}
                            disabled={busy}
                            title="Удалить слот"
                            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-rose-100 hover:text-rose-600 disabled:opacity-60"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {isBooked && (
                        <div className="mt-2 border-t border-rose-200/60 pt-2 text-sm">
                          <p className="font-medium text-rose-800">{booking?.name ?? "Запись"}</p>
                          {(booking?.contact_method || booking?.contact_value) && (
                            <p className="text-zinc-600">
                              {[booking?.contact_method, booking?.contact_value].filter(Boolean).join(": ")}
                            </p>
                          )}
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

      {assignSlot && (
        <AssignModal
          slot={assignSlot}
          busy={busy}
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
  onClose,
  onDone,
  submit,
}: {
  slot: Slot;
  busy: boolean;
  onClose: () => void;
  onDone: () => void;
  submit: (payload: {
    name: string;
    contact_method: string;
    contact_value: string;
    comment: string;
  }) => Promise<boolean>;
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
  });

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit({ name, contact_method: method, contact_value: value, comment });
    if (ok) onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Закрепить за человеком</h3>
            <p className="mt-1 text-sm capitalize text-rose-600">{when}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700" aria-label="Закрыть">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handle} className="mt-4 space-y-3">
          <input className={inputCls} placeholder="Имя *" value={name} required onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <select className={`${inputCls} max-w-[10rem]`} value={method} onChange={(e) => setMethod(e.target.value)}>
              {CONTACT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input className={inputCls} placeholder="@ник или телефон" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <textarea
            className={inputCls}
            placeholder="Заметка (по желанию)"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-2.5 font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            <CheckIcon className="h-4 w-4" /> {busy ? "Сохраняем…" : "Записать"}
          </button>
        </form>
      </div>
    </div>
  );
}
