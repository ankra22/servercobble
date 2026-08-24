import Link from "next/link";
import type { FeedEventWithTrainer } from "@/lib/database.types";
import { FEED_EVENT_CONFIG } from "@/lib/feed-events";
import { fallbackMessage } from "@/lib/feed-message";
import { formatCoordinates, timeAgo, toTitleCase } from "@/lib/format";
import { TONE_CLASSES } from "@/lib/tone-classes";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { PokemonSprite } from "@/components/PokemonSprite";

interface FeedEventCardProps {
  event: FeedEventWithTrainer;
  isNew?: boolean;
  /** Espécie deste evento é a que o usuário logado marcou como preferida — destaque forte. */
  isWatched?: boolean;
}

export function FeedEventCard({ event, isNew = false, isWatched = false }: FeedEventCardProps) {
  const config = FEED_EVENT_CONFIG[event.type];
  const tone = TONE_CLASSES[config.tone];
  const coords = formatCoordinates(event.coordinates);
  const message = event.message?.trim() || fallbackMessage(event);

  return (
    <article
      className={`group relative rounded-2xl border p-4 transition-colors sm:p-5 ${isNew ? "animate-slide-in" : ""} ${
        isWatched
          ? "animate-pulse-watch border-watch bg-watch-dim/70"
          : `${tone.softBorder} bg-panel/70 hover:bg-panel-hover`
      }`}
    >
      {event.is_shiny && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgb(250_204_21/0.25)]" />
      )}

      <div className="flex gap-3">
        {event.species && (
          <span
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${event.is_shiny ? "bg-shiny-dim/40" : "bg-bg-elevated"}`}
          >
            <PokemonSprite species={event.species} isShiny={event.is_shiny} variant="animated" size={40} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {isWatched && (
              <span className="inline-flex items-center rounded-full bg-watch px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Você quer esse!
              </span>
            )}
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${tone.text}`}>
              {config.label}
            </span>
            {event.is_shiny && (
              <span className="inline-flex items-center rounded-full bg-shiny-dim/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-shiny">
                Shiny
              </span>
            )}
            {event.type === "rare_spawn" && event.rarity && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone.softBg} ${tone.text}`}>
                {event.rarity === "ultra-rare" ? "Ultra-raro" : "Raro"}
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
              <span className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs font-medium text-ink-dim">
                {toTitleCase(event.species)}
              </span>
            )}

            {coords && (
              <span className="flex items-center rounded-full border border-border bg-bg-elevated px-2.5 py-1 font-data text-[11px] text-ink-faint">
                {coords}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
