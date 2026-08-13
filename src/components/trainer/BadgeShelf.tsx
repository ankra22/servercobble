export function BadgeShelf({ count }: { count: number }) {
  const visible = Math.min(count, 8);
  const overflow = count - visible;

  if (count === 0) {
    return <p className="text-xs text-ink-faint">Nenhuma badge conquistada ainda.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length: visible }).map((_, i) => (
        <span
          key={i}
          className="h-7 w-7 rounded-lg border border-rare/25 bg-rare-dim/40"
          title={`Badge ${i + 1}`}
        />
      ))}
      {overflow > 0 && (
        <span className="flex h-7 items-center rounded-lg border border-rare/25 bg-rare-dim/40 px-2 font-data text-xs text-rare">
          +{overflow}
        </span>
      )}
    </div>
  );
}
