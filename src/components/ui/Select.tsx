"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/components/icons";

export default function Select({
  className = "",
  wrapperClassName = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        {...props}
        className={`w-full appearance-none rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-2.5 pr-10 text-zinc-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 ${className}`}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}
