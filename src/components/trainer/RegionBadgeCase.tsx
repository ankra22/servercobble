import type { RegionInfo } from "@/lib/regions";
import { getGyms, colorForSlot } from "@/lib/gyms";
import { GymBadgeIcon } from "@/components/trainer/GymBadgeIcon";

export function RegionBadgeCase({
  region,
  earnedNames,
  isCurrent,
}: {
  region: RegionInfo;
  earnedNames: string[];
  isCurrent: boolean;
}) {
  const gyms = getGyms(region.id);
  const earned = new Set(earnedNames);
  const earnedCount = gyms.filter((gym) => earned.has(gym.name)).length;

  return (
    <div className="rounded-2xl border border-border bg-panel/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-ink">{region.name}</h3>
          {isCurrent && (
            <span className="rounded-full bg-brand-dim/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              Atual
            </span>
          )}
        </div>
        <span className="text-xs text-ink-faint">
          {earnedCount}/{gyms.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {gyms.map((gym) => {
          const isEarned = earned.has(gym.name);
          return (
            <div
              key={gym.id}
              title={gym.bonus ? `${gym.name} (pós-liga)` : gym.name}
              className="flex flex-col items-center gap-1"
            >
              <GymBadgeIcon
                color={colorForSlot(gym.order)}
                locked={!isEarned}
                className={isEarned ? "" : "text-ink-faint"}
              />
              <span className={`max-w-[3.5rem] truncate text-[10px] ${isEarned ? "text-ink-dim" : "text-ink-faint"}`}>
                {gym.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
