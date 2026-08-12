import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/tone-classes";
import { TONE_CLASSES } from "@/lib/tone-classes";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: Tone;
}

export function StatTile({ icon: Icon, label, value, tone = "brand" }: StatTileProps) {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-panel/60 p-4">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses.softBg} ${toneClasses.text}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-data text-xl font-semibold leading-none text-ink">{value}</p>
        <p className="mt-1 truncate text-xs text-ink-faint">{label}</p>
      </div>
    </div>
  );
}
