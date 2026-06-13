"use client";

import type { ReactNode } from "react";
import { CheckIcon } from "@/components/icons";

export default function Checkbox({
  checked,
  onChange,
  required,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
      <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          required={required}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span className="h-5 w-5 rounded-md border border-violet-300 bg-white transition peer-checked:border-violet-500 peer-checked:bg-violet-500 dark:bg-white/5" />
        <CheckIcon className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition peer-checked:opacity-100" />
      </span>
      <span>{children}</span>
    </label>
  );
}
