import Link from "next/link";
import type { FeedEventWithTrainer } from "@/lib/database.types";
import { FEED_EVENT_CONFIG, type FeedTier } from "@/lib/feed-events";
import { fallbackMessage } from "@/lib/feed-message";
import { formatClock, formatCoordinates, toTitleCase } from "@/lib/format";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { PokemonSprite } from "@/components/PokemonSprite";

interface FeedEventRowProps {
  event: FeedEventWithTrainer;
  tier: FeedTier;
  watched: boolean;
}

/**
 * Substitui o antigo FeedEventCard.
 *
 * Duas mudanças de fundo em relação a ele:
 *
 * 1. SEM SILHUETA. A versão anterior renderizava `rare_spawn` como massa
 *    chapada. Como `rare_spawn` domina o feed, a maior parte das linhas virava
 *    borrão — e o próprio texto da linha já diz o nome da espécie, então a
 *    silhueta escondia um dado que a linha entrega de graça. Sprite normal.
 *
 * 2. LINHA, NÃO CARD. Sem caixa, sem raio, sem sombra. A separação é o fio de
 *    1px do trilho. Cabe ~3x mais evento na mesma tela, que é o que um log de
 *    servidor pede.
 */
export function FeedEventRow({ event, tier, watched }: FeedEventRowProps) {
  const config = FEED_EVENT_CONFIG[event.type];
  const coords = formatCoordinates(event.coordinates);
  const message = event.message?.trim() || fallbackMessage(event);

  const sizes = { highlight: 44, standard: 28, ambient: 0 } as const;
  const spriteSize = sizes[tier];

  return (
    <div className="flex min-w-0 gap-3">
      {spriteSize > 0 && event.species && (
        <span
          className="flex shrink-0 items-center justify-center"
          style={{
            width: spriteSize,
            height: spriteSize,
            marginTop: tier === "highlight" ? 2 : 0,
          }}
        >
          <PokemonSprite
            species={event.species}
            isShiny={event.is_shiny}
            variant="animated"
            size={spriteSize}
          />
        </span>
      )}

      <div className="min-w-0 flex-1">
        {/* Eyebrow só no destaque. Nas linhas padrão e ambiente a cor do nó e a
            própria frase já dizem o tipo — repetir seria acessório. */}
        {tier === "highlight" && (
          <p className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="fd-pixel" style={{ color: "var(--fd-rare)" }}>
              {config.label}
            </span>
            {event.is_shiny && (
              <span
                className="fd-pixel px-1 py-0.5"
                style={{ color: "var(--fd-bg)", background: "var(--fd-rare)" }}
              >
                Shiny
              </span>
            )}
            {event.type === "rare_spawn" && event.rarity === "ultra-rare" && (
              <span className="fd-pixel" style={{ color: "var(--fd-ink-3)" }}>
                Ultra-raro
              </span>
            )}
            {watched && (
              <span
                className="fd-pixel px-1 py-0.5"
                style={{ color: "var(--fd-bg)", background: "var(--fd-watch)" }}
              >
                Você quer esse
              </span>
            )}
          </p>
        )}

        <Message
          text={message}
          species={event.species}
          emphasis={tier === "highlight" ? "var(--fd-ink)" : "var(--fd-ink)"}
          className={
            tier === "highlight"
              ? "text-[15px] leading-5"
              : tier === "ambient"
                ? "text-[12px] leading-5"
                : "text-[13px] leading-5"
          }
          tone={tier === "ambient" ? "var(--fd-ink-3)" : "var(--fd-ink-2)"}
        />

        <Meta iso={event.created_at} coords={coords} trainer={event.trainer} tier={tier} />
      </div>
    </div>
  );
}

/**
 * A espécie sai da pílula e vira ênfase tipográfica dentro da frase.
 * `message` chega pronta do collector e sempre contém a espécie em title case
 * (confere `process_*` no ingest.py e todos os ramos de fallbackMessage), mas
 * se não casar é no-op silencioso — nunca quebra o texto.
 */
function Message({
  text,
  species,
  className,
  tone,
  emphasis,
}: {
  text: string;
  species: string | null;
  className: string;
  tone: string;
  emphasis: string;
}) {
  const needle = species ? toTitleCase(species) : null;
  const at = needle ? text.indexOf(needle) : -1;

  if (at < 0 || !needle) {
    return (
      <p className={className} style={{ color: tone }}>
        {text}
      </p>
    );
  }

  return (
    <p className={className} style={{ color: tone }}>
      {text.slice(0, at)}
      <span style={{ color: emphasis, fontWeight: 600 }}>{needle}</span>
      {text.slice(at + needle.length)}
    </p>
  );
}

/**
 * Disciplina de acessórios: o treinador continua sendo um alvo navegável
 * (é entidade, é link), mas perde a pílula — vira só avatar + nome sublinhável.
 * Coordenada é mono discreta, sem borda nem fundo. No estreito, o horário
 * reaparece aqui, já que a coluna dele some.
 */
function Meta({
  iso,
  coords,
  trainer,
  tier,
}: {
  iso: string;
  coords: string | null;
  trainer: FeedEventWithTrainer["trainer"];
  tier: FeedTier;
}) {
  if (tier === "ambient" && !trainer) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <time
        dateTime={iso}
        className="fd-mono text-[10px] @[26rem]:hidden"
        style={{ color: "var(--fd-ink-3)" }}
      >
        {formatClock(iso)}
      </time>

      {trainer && tier !== "ambient" && (
        <Link
          href={`/trainers/${trainer.username}`}
          className="group inline-flex items-center gap-1.5 text-[11px] font-medium"
          style={{ color: "var(--fd-ink-2)" }}
        >
          <TrainerAvatar displayName={trainer.display_name} skinUrl={trainer.skin_url} size={14} />
          <span className="group-hover:underline">{trainer.display_name}</span>
        </Link>
      )}

      {coords && tier !== "ambient" && (
        <span className="fd-mono text-[10px]" style={{ color: "var(--fd-ink-3)" }}>
          {coords}
        </span>
      )}
    </div>
  );
}
