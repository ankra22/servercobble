import Link from "next/link";
import { Medal } from "lucide-react";
import type { Trainer } from "@/lib/database.types";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { formatDate } from "@/lib/format";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <Link
      href={`/trainers/${trainer.username}`}
      className="group flex items-center gap-3.5 rounded-2xl border border-border bg-panel/60 p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-panel-hover"
    >
      <TrainerAvatar displayName={trainer.display_name} skinUrl={trainer.skin_url} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink transition-colors group-hover:text-brand">{trainer.display_name}</p>
        <p className="truncate font-data text-xs text-ink-faint">@{trainer.username}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1 rounded-full bg-rare-dim/40 px-2 py-0.5 text-xs font-medium text-rare">
          <Medal className="h-3 w-3" />
          {trainer.badges_count}
        </span>
        <span className="text-[10px] text-ink-faint">desde {formatDate(trainer.created_at)}</span>
      </div>
    </Link>
  );
}
