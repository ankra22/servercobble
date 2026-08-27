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
        className={isEarned ? "" : "text-lcd-faint"}
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

function BadgeRow({ label, slots, earned }: { label: string; slots: GymSlot[]; earned: Set<string> }) {
  if (slots.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 font-pixel text-[9px] uppercase tracking-wide text-lcd-faint">{label}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {slots.map((gym) => {
          const isEarned = earned.has(gym.name);
          const suffix = gym.bonus ? " (pós-liga)" : "";
          return (
            <div key={gym.id} title={`${gym.name}${suffix}`} className="flex flex-col items-center gap-1">
              <div className="text-lcd-faint">
                <BadgeMedal gym={gym} isEarned={isEarned} />
              </div>
              <span className={`max-w-[3.5rem] truncate font-body text-[10px] ${isEarned ? "text-lcd-dim" : "text-lcd-faint"}`}>
                {gym.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
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

  return (
    <div className="border border-lcd-edge bg-lcd-sunken p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-body font-medium text-lcd-ink">{region.name}</h3>
          {isCurrent && (
            <span className="bg-route px-1.5 py-0.5 font-pixel text-[8px] uppercase text-route-ink">
              Atual
            </span>
          )}
        </div>
        <span className="font-body text-xs text-lcd-faint">
          {earnedCount}/{badgeSlots.length} insígnias
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <BadgeRow label="Ginásios" slots={badgeSlots} earned={earned} />
        <BadgeRow label="Elite Four" slots={eliteFourSlots} earned={earned} />
        <BadgeRow label="Campeão" slots={championSlots} earned={earned} />
      </div>
    </div>
  );
}
