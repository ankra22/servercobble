import type { RegionInfo } from "@/lib/regions";
import { getGyms, colorForGym, type GymSlot } from "@/lib/gyms";
import { BADGE_IMAGES } from "@/lib/badge-images";
import { GymBadgeIcon } from "@/components/trainer/GymBadgeIcon";

function BadgeMedal({ gym, isEarned }: { gym: GymSlot; isEarned: boolean }) {
  const image = BADGE_IMAGES[gym.id];
  const color = colorForGym(gym);
  const size = gym.rank === "champion" ? 44 : 36;

  if (!image) {
    return (
      <GymBadgeIcon
        color={color}
        order={gym.order}
        shape={gym.rank === "champion" ? "star" : "badge"}
        size={size}
        locked={!isEarned}
        className={isEarned ? "" : "text-ink-faint"}
      />
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full p-1.5"
      style={{
        width: size,
        height: size,
        boxShadow: isEarned ? `0 0 0 2px ${color}, 0 0 10px -2px ${color}` : "0 0 0 1.25px currentColor",
        opacity: isEarned ? 1 : 0.85,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        draggable="false"
        className="h-full w-full object-contain"
        style={{ filter: isEarned ? "none" : "grayscale(1) brightness(0.6) opacity(0.4)" }}
      />
    </span>
  );
}

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

  const badgeSlots = gyms.filter((g) => g.rank === "gym");
  const eliteFourSlots = gyms.filter((g) => g.rank === "elite_four");
  const championSlots = gyms.filter((g) => g.rank === "champion");
  const earnedCount = badgeSlots.filter((g) => earned.has(g.name)).length;

  const Row = ({ label, slots }: { label: string; slots: GymSlot[] }) => {
    if (slots.length === 0) return null;
    return (
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {slots.map((gym) => {
            const isEarned = earned.has(gym.name);
            const suffix = gym.bonus ? " (pós-liga)" : "";
            return (
              <div key={gym.id} title={`${gym.name}${suffix}`} className="flex flex-col items-center gap-1">
                <div className="text-ink-faint">
                  <BadgeMedal gym={gym} isEarned={isEarned} />
                </div>
                <span className={`max-w-[3.5rem] truncate text-[10px] ${isEarned ? "text-ink-dim" : "text-ink-faint"}`}>
                  {gym.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
          {earnedCount}/{badgeSlots.length} insígnias
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <Row label="Ginásios" slots={badgeSlots} />
        <Row label="Elite Four" slots={eliteFourSlots} />
        <Row label="Campeão" slots={championSlots} />
      </div>
    </div>
  );
}
