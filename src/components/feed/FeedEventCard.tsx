import type { ReactNode } from "react";
import Link from "next/link";
import type { FeedEventWithTrainer } from "@/lib/database.types";
import type { FeedTier } from "@/lib/feed-events";
import { FEED_EVENT_CONFIG } from "@/lib/feed-events";
import { fallbackMessage, splitOnSpecies } from "@/lib/feed-message";
import { formatClock, formatCoordinates } from "@/lib/format";
import { TONE_CLASSES } from "@/lib/tone-classes";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { PokemonSprite } from "@/components/PokemonSprite";

interface FeedEventCardProps {
  event: FeedEventWithTrainer;
  /** Peso visual — ver feedTier() em lib/feed-events.ts. */
  tier: FeedTier;
  /** Espécie deste evento é a que o usuário logado marcou como preferida. */
  isWatched?: boolean;
}

/**
 * Só o conteúdo do evento. O horário e o nó do trilho são responsabilidade do
 * FeedTimeline, que é quem conhece a posição da linha na coluna.
 */
export function FeedEventCard({ event, tier, isWatched = false }: FeedEventCardProps) {
  const config = FEED_EVENT_CONFIG[event.type];
  const tone = TONE_CLASSES[isWatched ? "watch" : config.tone];
  const coords = formatCoordinates(event.coordinates);
  const message = event.message?.trim() || fallbackMessage(event);

  // Ambiente: level up solto. Sem caixa, sem raio, sem sprite — é ruído de
  // fundo e só precisa ser legível o bastante pra quem procurar.
  if (tier === "ambient") {
    return (
      <p className="flex items-baseline gap-2 text-xs leading-5 text-ink-faint">
        <span className="min-w-0 flex-1">
          <Sentence message={message} species={event.species} muted />
        </span>
        <InlineClock iso={event.created_at} />
      </p>
    );
  }

  const isHighlight = tier === "highlight";
  const sprite = event.species && (
    <SpriteTile species={event.species} isShiny={event.is_shiny} type={event.type} tier={tier} />
  );

  const body = (
    <div className="flex gap-3">
      {sprite}
      <div className="min-w-0 flex-1">
        {isHighlight && (
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={`font-data text-[10px] font-semibold uppercase tracking-[0.18em] ${tone.text}`}>
              {config.label}
            </span>
            {event.is_shiny && <Badge className="bg-shiny-dim/60 text-shiny">Shiny</Badge>}
            {event.type === "rare_spawn" && event.rarity === "ultra-rare" && (
              <Badge className={`${tone.softBg} ${tone.text}`}>Ultra-raro</Badge>
            )}
          </div>
        )}

        {isWatched && (
          <Badge className="mb-1.5 bg-watch text-white">Você quer esse!</Badge>
        )}

        <p className={isHighlight ? "text-[15px] leading-snug text-ink-dim" : "text-sm leading-snug text-ink-dim"}>
          <Sentence message={message} species={event.species} />
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {event.trainer && (
            <Link
              href={`/trainers/${event.trainer.username}`}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-ink-dim transition-colors hover:border-border-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <TrainerAvatar displayName={event.trainer.display_name} skinUrl={event.trainer.skin_url} size={18} />
              {event.trainer.display_name}
            </Link>
          )}

          {coords && <span className="font-data text-[11px] text-ink-faint">{coords}</span>}

          <InlineClock iso={event.created_at} className="ml-auto" />
        </div>
      </div>
    </div>
  );

  // Destaque: moldura chanfrada. O corte a 45° em dois cantos opostos é a
  // aresta no tom do evento — `clip-path` recortaria um `ring`, então a cor
  // vem do elemento de fora e a face fica no de dentro.
  if (isHighlight) {
    return (
      <article className={`chamfer p-px ${tone.edge}`}>
        <div className="chamfer bg-panel/80 p-4">{body}</div>
      </article>
    );
  }

  return (
    <article
      className={`rounded-md border p-3 transition-colors ${
        isWatched ? "animate-pulse-watch border-watch bg-watch-dim/70" : "border-border bg-panel/50 hover:bg-panel-hover"
      }`}
    >
      {body}
    </article>
  );
}

/** A espécie sai da pílula e vira ênfase dentro da própria frase. */
function Sentence({ message, species, muted = false }: { message: string; species: string | null; muted?: boolean }) {
  const parts = splitOnSpecies(message, species);
  if (!parts) return <>{message}</>;

  const [before, name, after] = parts;
  return (
    <>
      {before}
      <span className={muted ? "font-medium text-ink-dim" : "font-medium text-ink"}>{name}</span>
      {after}
    </>
  );
}

/** No container estreito o trilho não tem coluna de horário — ele vem aqui. */
function InlineClock({ iso, className = "" }: { iso: string; className?: string }) {
  return (
    <time dateTime={iso} className={`shrink-0 font-data text-[11px] text-ink-faint @md:hidden ${className}`}>
      {formatClock(iso)}
    </time>
  );
}

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}>
      {children}
    </span>
  );
}

function SpriteTile({
  species,
  isShiny,
  type,
  tier,
}: {
  species: string;
  isShiny: boolean;
  type: FeedEventWithTrainer["type"];
  tier: FeedTier;
}) {
  const size = tier === "highlight" ? 56 : 40;
  // Spawn = pokémon que apareceu e ainda não é de ninguém. A silhueta é a
  // forma codificando esse fato; quando alguém captura, o evento é outro e o
  // sprite aparece colorido.
  const unknown = type === "rare_spawn";
  const silhouette = unknown
    ? tier === "highlight"
      ? "sprite-unknown sprite-unknown-highlight"
      : "sprite-unknown"
    : "";

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md ${isShiny && !unknown ? "bg-shiny-dim/40" : "bg-bg-elevated"}`}
      style={{ width: size + 12, height: size + 12 }}
    >
      <PokemonSprite
        species={species}
        isShiny={isShiny}
        variant="animated"
        size={size}
        className={silhouette}
      />
    </span>
  );
}
