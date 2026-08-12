export function FeedSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-2xl border border-border bg-panel/40 p-5">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-bg-elevated" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-bg-elevated" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-bg-elevated" />
          </div>
        </div>
      ))}
    </div>
  );
}
