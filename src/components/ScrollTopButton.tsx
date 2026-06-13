"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

export default function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="brand-gradient fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90"
    >
      <ChevronDownIcon className="h-5 w-5 rotate-180" />
    </button>
  );
}
