export function LiveDot({ label = "AO VIVO" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-dim/40 px-3 py-1 text-xs font-medium tracking-wide text-brand">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-brand animate-pulse-live" />
      </span>
      {label}
    </span>
  );
}
