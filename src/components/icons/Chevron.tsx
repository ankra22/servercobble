/** Seta minimalista traçada à mão pro site — não é ícone de biblioteca. */
export function ChevronMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 9l8 7 8-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
