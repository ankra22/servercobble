import { FEED_EVENT_CONFIG, FEED_EVENT_ORDER } from "@/lib/feed-events";
import { TONE_CLASSES } from "@/lib/tone-classes";
import type { FeedEventType } from "@/lib/database.types";

interface FeedFiltersProps {
  active: FeedEventType | "all";
  onChange: (value: FeedEventType | "all") => void;
}

export function FeedFilters({ active, onChange }: FeedFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          active === "all"
            ? "border-brand/30 bg-brand-dim/40 text-brand"
            : "border-border text-ink-dim hover:border-border-strong hover:text-ink"
        }`}
      >
        Tudo
      </button>
      {FEED_EVENT_ORDER.map((type) => {
        const config = FEED_EVENT_CONFIG[type];
        const tone = TONE_CLASSES[config.tone];
        const isActive = active === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? `${tone.softBorder} ${tone.softBg} ${tone.text}` : "border-border text-ink-dim hover:border-border-strong hover:text-ink"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
