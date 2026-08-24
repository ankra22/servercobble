import { FeedSkeleton } from "@/components/feed/FeedSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="feed fd-grid flex flex-col gap-4 px-1">
        {/* Mesma altura da faixa de status, pra não empurrar o trilho na troca. */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 pb-1">
          <span className="block h-3 w-32 animate-pulse" style={{ background: "var(--fd-surface-2)" }} />
          <span className="block h-3 w-16 animate-pulse" style={{ background: "var(--fd-surface)" }} />
          <span className="block h-3 w-56 max-w-full animate-pulse" style={{ background: "var(--fd-surface)" }} />
        </div>

        <FeedSkeleton />
      </div>
    </div>
  );
}
