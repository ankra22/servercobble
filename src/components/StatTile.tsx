import type { Tone } from "@/lib/tone-classes";
import { TONE_CLASSES } from "@/lib/tone-classes";

interface StatTileProps {
  label: string;
  value: string | number;
  tone?: Tone;
}

export function StatTile({ label, value, tone = "brand" }: StatTileProps) {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <div className="rounded-2xl border border-border bg-panel/60 p-4">
      <p className={`font-data text-xl font-semibold leading-none ${toneClasses.text}`}>{value}</p>
      <p className="mt-1.5 truncate text-xs text-ink-faint">{label}</p>
    </div>
  );
}
