/** Espelha o trilho do FeedTimeline pro loading não piscar outro layout. */
export function FeedSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="@container">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 py-1.5 @md:grid-cols-[3.5rem_1.25rem_minmax(0,1fr)]"
        >
          <div className="hidden h-3 animate-pulse rounded bg-bg-elevated @md:block" />
          <span className="relative">
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
            <span className="absolute left-1/2 top-[1.4rem] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-strong" />
          </span>
          <div className="flex gap-3 rounded-md border border-border bg-panel/40 p-3">
            <div className="h-[52px] w-[52px] shrink-0 animate-pulse rounded-md bg-bg-elevated" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-bg-elevated" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
