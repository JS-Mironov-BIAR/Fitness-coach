"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pdf, usePDF } from "@react-pdf/renderer";
import { ProgramDocument, type ProgramData } from "@/components/pdf/ProgramDocument";
import { ANKETA_GROUPS } from "@/lib/anketa";
import { PlusIcon, TrashIcon, CheckIcon } from "@/components/icons";

type LeadFull = Record<string, unknown> & { id: string };

const uid = () => crypto.randomUUID();

const inputCls =
  "w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-200";

function todayLabel() {
  return new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function emptyData(): ProgramData {
  return {
    type: "training",
    title: "Программа тренировок",
    clientName: "",
    dateLabel: todayLabel(),
    intro: "",
    blocks: [{ id: uid(), title: "День 1", rows: [{ id: uid(), main: "", secondary: "", note: "" }] }],
    footer: "Составлено индивидуально • Аня · FitnessCoach",
  };
}

function trainingTemplate() {
  return [
    {
      id: uid(),
      title: "День 1 — Низ тела",
      rows: [
        { id: uid(), main: "Приседания со штангой", secondary: "4 × 10", note: "Спина прямая, колени по носкам" },
        { id: uid(), main: "Румынская тяга", secondary: "3 × 12", note: "" },
        { id: uid(), main: "Выпады с гантелями", secondary: "3 × 12 на ногу", note: "" },
      ],
    },
    {
      id: uid(),
      title: "День 2 — Верх тела",
      rows: [
        { id: uid(), main: "Жим гантелей лёжа", secondary: "4 × 10", note: "" },
        { id: uid(), main: "Тяга к поясу", secondary: "4 × 12", note: "" },
      ],
    },
  ];
}

function nutritionTemplate() {
  return [
    { id: uid(), title: "Завтрак", rows: [{ id: uid(), main: "Овсянка на воде + ягоды", secondary: "350 ккал", note: "" }] },
    { id: uid(), title: "Обед", rows: [{ id: uid(), main: "Курица + гречка + овощи", secondary: "550 ккал", note: "" }] },
    { id: uid(), title: "Ужин", rows: [{ id: uid(), main: "Рыба + салат", secondary: "450 ккал", note: "" }] },
    { id: uid(), title: "Перекус", rows: [{ id: uid(), main: "Творог 5%", secondary: "180 ккал", note: "" }] },
  ];
}

export default function PdfStudio({ leads }: { leads: LeadFull[] }) {
  const router = useRouter();
  const [data, setData] = useState<ProgramData>(emptyData);
  const [previewData, setPreviewData] = useState<ProgramData>(data);
  const [leadId, setLeadId] = useState("");
  const [showRef, setShowRef] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // живое превью с дебаунсом
  useEffect(() => {
    const t = setTimeout(() => setPreviewData(data), 700);
    return () => clearTimeout(t);
  }, [data]);

  const [instance, updateInstance] = usePDF({ document: <ProgramDocument data={previewData} /> });
  useEffect(() => {
    updateInstance(<ProgramDocument data={previewData} />);
  }, [previewData, updateInstance]);

  const labels =
    data.type === "training"
      ? { main: "Упражнение", secondary: "Подходы × повторы", note: "Примечание" }
      : { main: "Блюдо / продукт", secondary: "Ккал / порция", note: "Комментарий" };

  const selectedLead = leads.find((l) => l.id === leadId);

  function patch(p: Partial<ProgramData>) {
    setData((d) => ({ ...d, ...p }));
  }
  function setType(t: "training" | "nutrition") {
    setData((d) => {
      const isDefault = d.title === "" || d.title === "Программа тренировок" || d.title === "План питания";
      return { ...d, type: t, title: isDefault ? (t === "training" ? "Программа тренировок" : "План питания") : d.title };
    });
  }
  function loadTemplate() {
    setData((d) => ({ ...d, blocks: d.type === "training" ? trainingTemplate() : nutritionTemplate() }));
  }
  function addBlock() {
    setData((d) => ({ ...d, blocks: [...d.blocks, { id: uid(), title: "", rows: [{ id: uid(), main: "", secondary: "", note: "" }] }] }));
  }
  function removeBlock(bid: string) {
    setData((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== bid) }));
  }
  function setBlockTitle(bid: string, title: string) {
    setData((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === bid ? { ...b, title } : b)) }));
  }
  function addRow(bid: string) {
    setData((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === bid ? { ...b, rows: [...b.rows, { id: uid(), main: "", secondary: "", note: "" }] } : b)),
    }));
  }
  function removeRow(bid: string, rid: string) {
    setData((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === bid ? { ...b, rows: b.rows.filter((r) => r.id !== rid) } : b)),
    }));
  }
  function setRow(bid: string, rid: string, p: Partial<{ main: string; secondary: string; note: string }>) {
    setData((d) => ({
      ...d,
      blocks: d.blocks.map((b) =>
        b.id === bid ? { ...b, rows: b.rows.map((r) => (r.id === rid ? { ...r, ...p } : r)) } : b,
      ),
    }));
  }

  function fileName() {
    const base = `${data.type === "training" ? "Тренировки" : "Питание"}_${data.clientName || "клиент"}`;
    return `${base.replace(/[^\p{L}\p{N}\-_ ]/gu, "").trim() || "programma"}.pdf`;
  }

  async function handleDownload() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const blob = await pdf(<ProgramDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName();
      a.click();
      URL.revokeObjectURL(url);
      await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId || null, type: data.type, title: data.title }),
      });
      router.refresh();
      setMsg("PDF скачан и отмечен в истории");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось создать PDF");
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const blob = await pdf(<ProgramDocument data={data} />).toBlob();
      const fd = new FormData();
      fd.append("file", blob, fileName());
      fd.append("type", data.type);
      fd.append("title", data.title);
      if (leadId) fd.append("lead_id", leadId);
      fd.append("caption", `${data.title}${data.clientName ? ` — ${data.clientName}` : ""}`);
      const res = await fetch("/api/admin/pdf/send", { method: "POST", body: fd });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || "Не удалось отправить");
      }
      router.refresh();
      setMsg("PDF отправлен в Telegram");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Редактор */}
      <div className="space-y-4">
        {/* Клиент и тип */}
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700">
            Клиент из заявок
            <select
              value={leadId}
              onChange={(e) => {
                setLeadId(e.target.value);
                const l = leads.find((x) => x.id === e.target.value);
                if (l) patch({ clientName: String(l.name ?? "") });
              }}
              className={`mt-1.5 ${inputCls}`}
            >
              <option value="">— выбрать (или вписать имя вручную) —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {String(l.name ?? "Без имени")} {l.contact_value ? `· ${String(l.contact_value)}` : ""}
                </option>
              ))}
            </select>
          </label>

          {selectedLead && (
            <button
              type="button"
              onClick={() => setShowRef((v) => !v)}
              className="mt-2 text-sm font-medium text-rose-600 hover:underline"
            >
              {showRef ? "Скрыть анкету клиента" : "Показать анкету клиента"}
            </button>
          )}
          {showRef && selectedLead && (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl bg-zinc-50 p-3 text-sm">
              {ANKETA_GROUPS.map((g) => {
                const filled = g.fields.filter((f) => {
                  const v = selectedLead[f.name];
                  return v !== undefined && v !== null && String(v).trim() !== "";
                });
                if (filled.length === 0) return null;
                return (
                  <div key={g.title} className="mb-2">
                    <p className="font-semibold text-rose-700">{g.title}</p>
                    {filled.map((f) => (
                      <p key={f.name} className="text-zinc-700">
                        <span className="text-zinc-400">{f.label}:</span> {String(selectedLead[f.name])}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {(["training", "nutrition"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  data.type === t ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {t === "training" ? "Тренировки" : "Питание"}
              </button>
            ))}
          </div>
        </div>

        {/* Шапка документа */}
        <div className="space-y-3 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700">
            Заголовок
            <input value={data.title} onChange={(e) => patch({ title: e.target.value })} className={`mt-1.5 ${inputCls}`} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-zinc-700">
              Имя клиента
              <input value={data.clientName} onChange={(e) => patch({ clientName: e.target.value })} className={`mt-1.5 ${inputCls}`} />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Дата
              <input value={data.dateLabel} onChange={(e) => patch({ dateLabel: e.target.value })} className={`mt-1.5 ${inputCls}`} />
            </label>
          </div>
          <label className="block text-sm font-medium text-zinc-700">
            Вступление (по желанию)
            <textarea
              value={data.intro}
              rows={2}
              onChange={(e) => patch({ intro: e.target.value })}
              placeholder="Пара слов клиенту: цель, как заниматься…"
              className={`mt-1.5 ${inputCls}`}
            />
          </label>
        </div>

        {/* Блоки */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Содержание</h3>
          <button onClick={loadTemplate} type="button" className="text-sm font-medium text-rose-600 hover:underline">
            Вставить шаблон
          </button>
        </div>

        {data.blocks.map((block) => (
          <div key={block.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <input
                value={block.title}
                onChange={(e) => setBlockTitle(block.id, e.target.value)}
                placeholder={data.type === "training" ? "День / блок" : "Приём пищи"}
                className={`${inputCls} font-semibold`}
              />
              <button
                onClick={() => removeBlock(block.id)}
                type="button"
                title="Удалить блок"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {block.rows.map((r) => (
                <div key={r.id} className="rounded-xl bg-zinc-50 p-2">
                  <div className="flex gap-2">
                    <input
                      value={r.main}
                      onChange={(e) => setRow(block.id, r.id, { main: e.target.value })}
                      placeholder={labels.main}
                      className={`${inputCls} flex-1`}
                    />
                    <input
                      value={r.secondary}
                      onChange={(e) => setRow(block.id, r.id, { secondary: e.target.value })}
                      placeholder={labels.secondary}
                      className={`${inputCls} w-36`}
                    />
                    <button
                      onClick={() => removeRow(block.id, r.id)}
                      type="button"
                      title="Удалить строку"
                      className="rounded-lg p-2 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={r.note}
                    onChange={(e) => setRow(block.id, r.id, { note: e.target.value })}
                    placeholder={labels.note}
                    className={`mt-2 ${inputCls}`}
                  />
                </div>
              ))}
              <button
                onClick={() => addRow(block.id)}
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:underline"
              >
                <PlusIcon className="h-4 w-4" /> Добавить строку
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addBlock}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 px-5 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          <PlusIcon className="h-4 w-4" /> Добавить блок
        </button>

        <label className="block text-sm font-medium text-zinc-700">
          Подпись внизу страницы
          <input value={data.footer} onChange={(e) => patch({ footer: e.target.value })} className={`mt-1.5 ${inputCls}`} />
        </label>
      </div>

      {/* Превью + действия */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={busy}
            className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {busy ? "…" : "Скачать PDF"}
          </button>
          <button
            onClick={handleSend}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 px-5 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            <CheckIcon className="h-4 w-4" /> Отправить в Telegram
          </button>
        </div>
        {(msg || err) && (
          <p className={`mb-3 rounded-xl px-4 py-2.5 text-sm ${err ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>
            {err || msg}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm">
          {instance.url ? (
            <iframe src={instance.url} title="Превью PDF" className="h-[760px] w-full" />
          ) : (
            <div className="flex h-[760px] items-center justify-center text-sm text-zinc-400">
              {instance.error ? "Ошибка превью" : "Готовим превью…"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
