export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm">
        h
      </span>
      <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        halva<span className="brand-gradient-text">fit</span>
      </span>
    </span>
  );
}
