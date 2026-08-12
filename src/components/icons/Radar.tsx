/** Marca própria do site — um radar/dex estilizado, não é um ícone de biblioteca. */
export function RadarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      <path d="M16 2v6M16 24v6M30 16h-6M8 16H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
