"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

function QrCard({ title, file, url }: { title: string; file: string; url: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 640, margin: 2, color: { dark: "#3b0764", light: "#ffffff" } })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, [url]);

  function download() {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `halvafit-qr-${file}.png`;
    a.click();
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
      <h2 className="font-semibold text-zinc-900">{title}</h2>
      <p className="mt-0.5 truncate text-xs text-zinc-400">{url}</p>
      <div className="mx-auto mt-4 flex aspect-square w-full max-w-[260px] items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-white">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`QR — ${title}`} className="h-full w-full object-contain" />
        ) : (
          <span className="text-sm text-zinc-400">Генерируем…</span>
        )}
      </div>
      <button
        onClick={download}
        disabled={!src}
        className="mt-4 w-full rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-60"
      >
        Скачать PNG
      </button>
    </div>
  );
}

export default function QrCodes({ baseUrl }: { baseUrl: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <QrCard title="Главная страница" file="main" url={baseUrl} />
      <QrCard title="Анкета" file="anketa" url={`${baseUrl}/anketa`} />
    </div>
  );
}
