import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import type { FeedEventWithTrainer } from "@/lib/database.types";
import { FEED_EVENT_CONFIG } from "@/lib/feed-events";
import { fallbackMessage } from "@/lib/feed-message";
import { formatCoordinates, timeAgo, toTitleCase } from "@/lib/format";
import { TONE_CLASSES } from "@/lib/tone-classes";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { PokemonSprite } from "@/components/PokemonSprite";

export function FeedEventCard({ event, isNew = false }: { event: FeedEventWithTrainer; isNew?: boolean }) {
  const config = FEED_EVENT_CONFIG[event.type];
  const tone = TONE_CLASSES[config.tone];
  const Icon = config.icon;
  const coords = formatCoordinates(event.coordinates);
  const message = event.message?.trim() || fallbackMessage(event);

  return (
    <article
      className={`group relative flex gap-3 rounded-2xl border ${tone.softBorder} bg-panel/70 p-4 transition-colors hover:bg-panel-hover sm:gap-4 sm:p-5 ${isNew ? "animate-slide-in" : ""}`}
    >
      {event.is_shiny && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgb(250_204_21/0.25)]" />
      )}

      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.softBg} ${tone.text}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${tone.text}`}>
            {config.label}
          </span>
          {event.is_shiny && (
            <span className="inline-flex items-center gap-1 rounded-full bg-shiny-dim/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-shiny">
              <Sparkles className="h-3 w-3" /> Shiny
            </span>
          )}
          <span className="ml-auto shrink-0 font-data text-xs text-ink-faint">{timeAgo(event.created_at)}</span>
        </div>

        <p className="mt-1.5 text-[15px] leading-snug text-ink">{message}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {event.trainer && (
            <Link
              href={`/trainers/${event.trainer.username}`}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated py-1 pl-1 pr-2.5 text-xs font-medium text-ink-dim transition-colors hover:border-border-strong hover:text-ink"
            >
              <TrainerAvatar displayName={event.trainer.display_name} skinUrl={event.trainer.skin_url} size={18} />
              {event.trainer.display_name}
            </Link>
          )}

          {event.species && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated py-1 pl-1 pr-2.5 text-xs font-medium text-ink-dim">
              <PokemonSprite species={event.species} size={18} />
              {toTitleCase(event.species)}
            </span>
          )}

          {coords && (
            <span className="flex items-center gap-1 rounded-full border border-border bg-bg-elevated px-2.5 py-1 font-data text-[11px] text-ink-faint">
              <MapPin className="h-3 w-3" />
              {coords}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
