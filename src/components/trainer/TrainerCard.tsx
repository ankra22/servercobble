import Link from "next/link";
import type { Trainer } from "@/lib/database.types";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { formatDate } from "@/lib/format";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <Link
      href={`/trainers/${trainer.username}`}
      className="group flex items-center gap-3.5 border border-lcd-edge bg-lcd-sunken p-3.5 transition-colors hover:bg-lcd"
    >
      <TrainerAvatar displayName={trainer.display_name} skinUrl={trainer.skin_url} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-body font-medium text-lcd-ink transition-colors group-hover:text-[#9a6b12]">
          {trainer.display_name}
        </p>
        <p className="truncate font-data text-xs text-lcd-faint">@{trainer.username}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="bg-route px-1.5 py-0.5 font-pixel text-[8px] uppercase text-route-ink">
          {trainer.badges_count} badge{trainer.badges_count === 1 ? "" : "s"}
        </span>
        <span className="font-body text-[10px] text-lcd-faint">desde {formatDate(trainer.created_at)}</span>
      </div>
    </Link>
  );
}
