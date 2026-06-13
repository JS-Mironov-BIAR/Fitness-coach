"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  ListIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { CONTACT_METHODS, formatLabel, TZ, type Slot } from "@/lib/booking";
import Turnstile from "@/components/Turnstile";
import Select from "@/components/ui/Select";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function keyOf(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function isoKey(iso: string) {
  return keyOf(new Date(iso));
}
function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}
function dayTitle(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}

function monthMatrix(y: number, m: number): Date[] {
  const first = new Date(y, m, 1);
  const startIdx = (first.getDay() + 6) % 7;
  const cur = new Date(y, m, 1 - startIdx);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export default function BookingCalendar() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<"month" | "list">("month");
  const [active, setActive] = useState<Slot | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const aligned = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/slots", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { slots: Slot[] };
      setSlots(data.slots ?? []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Опрос только когда вкладка активна (экономим запросы/трафик)
  useEffect(() => {
    load();
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id == null) id = setInterval(load, 60000);
    };
    const stop = () => {
      if (id != null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVis = () => {
      if (document.visibilityState === "visible") {
        load();
        start();
      } else {
        stop();
      }
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  useEffect(() => {
    if (aligned.current || slots.length === 0) return;
    const firstOpen = slots.find((s) => s.status === "open");
    if (firstOpen) {
      const d = new Date(firstOpen.starts_at);
      setCursor({ y: d.getFullYear(), m: d.getMonth() });
      setSelectedKey(isoKey(firstOpen.starts_at));
      aligned.current = true;
    }
  }, [slots]);

  const byDay = new Map<string, Slot[]>();
  for (const s of slots) {
    const k = isoKey(s.starts_at);
    const arr = byDay.get(k);
    if (arr) arr.push(s);
    else byDay.set(k, [s]);
  }

  const maxDate = new Date(today.getTime() + 21 * 86400000);
  const minMonthIdx = today.getFullYear() * 12 + today.getMonth();
  const maxMonthIdx = maxDate.getFullYear() * 12 + maxDate.getMonth();
  const curMonthIdx = cursor.y * 12 + cursor.m;

  function shiftMonth(delta: number) {
    const idx = curMonthIdx + delta;
    if (idx < minMonthIdx || idx > maxMonthIdx) return;
    setCursor({ y: Math.floor(idx / 12), m: idx % 12 });
  }

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
  const selectedSlots = selectedKey ? (byDay.get(selectedKey) ?? []) : [];
  const selectedHasOpen = selectedSlots.some((s) => s.status === "open");

  const groups: { key: string; slots: Slot[] }[] = [];
  for (const s of slots) {
    const key = dayTitle(s.starts_at);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, slots: [] };
      groups.push(g);
    }
    g.slots.push(s);
  }

  return (
    <div className="flex h-[38rem] flex-col rounded-3xl border border-violet-100 bg-white/80 p-5 shadow-xl shadow-violet-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
      {/* шапка */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Запись на занятие</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Шаг 1 — день, шаг 2 — время</p>
          </div>
        </div>
        <div className="flex items-center rounded-full bg-zinc-100 p-0.5 dark:bg-white/10">
          {([
            ["month", GridIcon, "Календарь"],
            ["list", ListIcon, "Список"],
          ] as const).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-label={label}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                view === v ? "bg-white text-violet-600 shadow dark:bg-zinc-800 dark:text-violet-300" : "text-zinc-500"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4 flex-1 min-h-0">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">Загружаем расписание…</div>
        ) : loadError ? (
          <div className="flex h-full items-center justify-center text-sm text-violet-500">
            Не удалось загрузить. Обнови страницу.
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {view === "month" ? (
              <motion.div
                key="month"
                className="flex h-full flex-col"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex shrink-0 items-center justify-between">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    disabled={curMonthIdx <= minMonthIdx}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-white/10"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-semibold capitalize text-zinc-800 dark:text-zinc-100">{monthLabel}</span>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    disabled={curMonthIdx >= maxMonthIdx}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-white/10"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-1 grid shrink-0 grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-400">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="py-1">
                      {w}
                    </div>
                  ))}
                </div>

                <div className="mt-1 grid shrink-0 grid-cols-7 gap-1">
                  {monthMatrix(cursor.y, cursor.m).map((d) => {
                    const inMonth = d.getMonth() === cursor.m;
                    const k = keyOf(d);
                    const daySlots = byDay.get(k) ?? [];
                    const openCount = daySlots.filter((s) => s.status === "open").length;
                    const hasBusy = daySlots.some((s) => s.status !== "open");
                    const isPast = d < today;
                    const selectable = inMonth && !isPast && openCount > 0;
                    const isSelected = k === selectedKey;

                    let cls = "relative flex h-9 flex-col items-center justify-center rounded-xl text-sm transition ";
                    if (!inMonth) cls += "text-zinc-300 dark:text-zinc-700";
                    else if (selectable)
                      cls += isSelected
                        ? "bg-violet-500 font-semibold text-white shadow-md shadow-violet-300/50"
                        : "bg-violet-50 font-medium text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-500/30 dark:hover:bg-violet-500/20";
                    else if (inMonth && hasBusy && !isPast)
                      cls += "bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500";
                    else cls += "text-zinc-400 dark:text-zinc-600";

                    return (
                      <motion.button
                        key={k}
                        type="button"
                        disabled={!selectable}
                        onClick={() => selectable && setSelectedKey(k)}
                        whileTap={selectable ? { scale: 0.88 } : undefined}
                        className={cls}
                      >
                        {d.getDate()}
                        {inMonth && openCount > 0 && (
                          <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-violet-500"}`} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* легенда */}
                <div className="mt-2 flex shrink-0 items-center justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> есть свободное
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-zinc-300 dark:bg-white/15" /> занято
                  </span>
                </div>

                {/* времена выбранного дня */}
                <div className="mt-2 flex-1 min-h-0 overflow-y-auto rounded-2xl border border-violet-100 bg-violet-50/40 p-3 dark:border-white/10 dark:bg-white/5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedKey ?? "none"}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="h-full"
                    >
                      {selectedSlots.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                          <ArrowRightIcon className="h-6 w-6 rotate-[-90deg] text-violet-300" />
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Нажми на <span className="font-semibold text-violet-500">розовый день</span> в календаре
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="mb-1 text-sm font-semibold capitalize text-zinc-800 dark:text-zinc-100">
                            {dayTitle(selectedSlots[0].starts_at)}
                          </p>
                          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                            {selectedHasOpen ? "Нажми на время, чтобы записаться 👇" : "На этот день всё занято"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedSlots.map((s) => (
                              <TimeChip key={s.id} slot={s} onPick={() => setActive(s)} />
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="h-full space-y-5 overflow-y-auto pr-1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22 }}
              >
                {groups.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Свободных слотов пока нет. Заполни{" "}
                    <a href="/anketa" className="font-medium text-violet-500 hover:underline">
                      анкету
                    </a>
                    .
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Нажми на время, чтобы записаться</p>
                )}
                {groups.map((g) => (
                  <div key={g.key}>
                    <p className="mb-2 text-sm font-medium capitalize text-zinc-700 dark:text-zinc-300">{g.key}</p>
                    <div className="flex flex-wrap gap-2">
                      {g.slots.map((s) => (
                        <TimeChip key={s.id} slot={s} onPick={() => setActive(s)} />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <BookingModal
            slot={active}
            onClose={() => setActive(null)}
            onBooked={() => {
              setActive(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TimeChip({ slot, onPick }: { slot: Slot; onPick: () => void }) {
  const open = slot.status === "open";
  return (
    <motion.button
      type="button"
      disabled={!open}
      onClick={onPick}
      whileTap={open ? { scale: 0.94 } : undefined}
      className={
        open
          ? "flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600"
          : "flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-400 line-through dark:border-white/10 dark:bg-white/5 dark:text-zinc-500"
      }
    >
      <ClockIcon className="h-4 w-4" />
      {timeLabel(slot.starts_at)}
      <span className="text-xs font-normal opacity-80">· {formatLabel(slot.format)}</span>
    </motion.button>
  );
}

function BookingModal({
  slot,
  onClose,
  onBooked,
}: {
  slot: Slot;
  onClose: () => void;
  onBooked: () => void;
}) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState<string>(CONTACT_METHODS[0]);
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");
  const [hp, setHp] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_id: slot.id, name, contact_method: method, contact_value: value, comment, hp, turnstile_token: token }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || "Не удалось записаться");
      }
      setStatus("done");
      setTimeout(onBooked, 1500);
    } catch (e) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Ошибка");
    }
  }

  const when = new Date(slot.starts_at).toLocaleString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });

  const inputClass =
    "w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder-zinc-500";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {status === "done" ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckIcon className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Запись принята!</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Скоро свяжусь для подтверждения 💜</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Запись на занятие</h3>
                <p className="mt-1 text-sm capitalize text-violet-600 dark:text-violet-300">{when}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatLabel(slot.format)}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <input className={inputClass} placeholder="Имя *" value={name} required onChange={(e) => setName(e.target.value)} />
              <div className="flex gap-2">
                <Select
                  wrapperClassName="w-36 shrink-0"
                  value={method}
                  onChange={setMethod}
                  options={CONTACT_METHODS.map((m) => ({ value: m, label: m }))}
                />
                <input
                  className={`${inputClass} flex-1`}
                  placeholder="@ник или телефон *"
                  value={value}
                  required
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <textarea
                className={inputClass}
                placeholder="Комментарий (по желанию)"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {status === "error" && <p className="text-sm text-violet-500">{err}</p>}
              <Turnstile onToken={setToken} />
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-full bg-violet-500 px-6 py-3 font-medium text-white transition hover:bg-violet-600 disabled:opacity-60"
              >
                {status === "sending" ? "Записываем…" : "Записаться"}
              </button>
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                Записываясь, ты соглашаешься на{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                  обработку данных
                </a>
                .
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
