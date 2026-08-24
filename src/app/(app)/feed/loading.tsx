import { FeedSkeleton } from "@/components/feed/FeedSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-56 animate-pulse rounded bg-bg-elevated" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-bg-elevated" />
      </div>
      <FeedSkeleton />
    </div>
  );
}
