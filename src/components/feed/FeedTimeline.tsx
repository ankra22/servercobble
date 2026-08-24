"use client";

import { useCallback, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { FeedEventWithTrainer } from "@/lib/database.types";
import type { FeedTier } from "@/lib/feed-events";
import { FEED_EVENT_CONFIG, feedTier } from "@/lib/feed-events";
import { groupFeedEvents } from "@/lib/feed-grouping";
import { dayKey, formatClock, formatDayLabel } from "@/lib/format";
import { TONE_CLASSES } from "@/lib/tone-classes";
import { FeedEventCard } from "@/components/feed/FeedEventCard";
import { FeedLevelRunRow } from "@/components/feed/FeedLevelRunRow";

interface FeedTimelineProps {
  /** Já filtrada e ordenada do mais novo pro mais velho. */
  events: FeedEventWithTrainer[];
  newIds: Set<string>;
  watchedSpecies: string[];
}

/**
 * Trilho vertical: cada evento é um nó, e o tamanho/brilho do nó codifica a
 * raridade. As colunas são `[horário] [nó] [conteúdo]`, e a troca pra versão
 * compacta usa container query (`@md`) em vez de breakpoint de viewport —
 * o mesmo componente serve o feed largo e a coluna estreita do perfil do
 * treinador, que continua sendo desktop.
 */
export function FeedTimeline({ events, newIds, watchedSpecies }: FeedTimelineProps) {
  const rows = useMemo(() => groupFeedEvents(events), [events]);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set<string>());
  const panelPrefix = useId();

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const items: ReactNode[] = [];
  let lastDay = "";

  for (const row of rows) {
    const anchor = row.kind === "event" ? row.event : row.events[0];
    const day = dayKey(anchor.created_at);

    if (day !== lastDay) {
      lastDay = day;
      items.push(<DaySeparator key={`day-${day}`} iso={anchor.created_at} />);
    }

    if (row.kind === "levelup-run") {
      items.push(
        <TimelineRow
          key={row.key}
          iso={anchor.created_at}
          tier="ambient"
          tone="levelup"
          isNew={row.events.some((e) => newIds.has(e.id))}
        >
          <FeedLevelRunRow
            events={row.events}
            from={row.from}
            to={row.to}
            expanded={expanded.has(row.key)}
            onToggle={() => toggle(row.key)}
            panelId={`${panelPrefix}-${row.key}`}
          />
        </TimelineRow>,
      );
      continue;
    }

    const event = row.event;
    const isWatched = Boolean(event.species) && watchedSpecies.includes(event.species!.toLowerCase());
    const tier = feedTier(event, isWatched);

    items.push(
      <TimelineRow
        key={row.key}
        iso={event.created_at}
        tier={tier}
        tone={isWatched ? "watch" : FEED_EVENT_CONFIG[event.type].tone}
        isNew={newIds.has(event.id)}
      >
        <FeedEventCard event={event} tier={tier} isWatched={isWatched} />
      </TimelineRow>,
    );
  }

  return (
    <ol className="@container">{items}</ol>
  );
}

/** Altura do nó a partir do topo da linha, medida pra cair no meio da
 *  primeira linha de conteúdo: nos cards é o padding (1rem) + meia linha de
 *  texto; no ambiente, que não tem caixa, é só meia linha. */
const NODE_Y: Record<FeedTier, string> = {
  highlight: "1.4rem",
  standard: "1.4rem",
  ambient: "0.65rem",
};

const NODE_SHAPE: Record<FeedTier, string> = {
  highlight: "h-3 w-3 ring-2",
  standard: "h-2 w-2",
  ambient: "h-2 w-2 border border-border-strong",
};

/**
 * Sem `gap` vertical na lista: o espaçamento vive no padding da linha, então
 * o segmento de trilho de cada linha encosta no da seguinte e a linha sai
 * contínua por construção, sem número mágico de offset.
 */
const ROW_GRID =
  "grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 @md:grid-cols-[3.5rem_1.25rem_minmax(0,1fr)]";

function TimelineRow({
  iso,
  tier,
  tone,
  isNew,
  children,
}: {
  iso: string;
  tier: FeedTier;
  tone: keyof typeof TONE_CLASSES;
  isNew: boolean;
  children: ReactNode;
}) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <li
      className={`${ROW_GRID} py-1.5 ${isNew ? "animate-slide-in" : ""}`}
      style={{ "--node-y": NODE_Y[tier] } as CSSProperties}
    >
      <time
        dateTime={iso}
        className="hidden -translate-y-1/2 pt-[var(--node-y)] text-right font-data text-[11px] leading-none text-ink-faint @md:block"
      >
        {formatClock(iso)}
      </time>

      <span aria-hidden className="relative">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
        <span
          className={`absolute left-1/2 top-[var(--node-y)] -translate-x-1/2 -translate-y-1/2 rounded-full ${NODE_SHAPE[tier]} ${
            tier === "ambient" ? "bg-bg" : `${toneClasses.dot} ${toneClasses.ring}`
          }`}
        />
      </span>

      <div className="min-w-0">{children}</div>
    </li>
  );
}

function DaySeparator({ iso }: { iso: string }) {
  return (
    <li className={ROW_GRID}>
      <span className="hidden @md:block" />
      <span aria-hidden className="relative">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      </span>
      <h2 className="flex items-center gap-3 py-3 font-data text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {formatDayLabel(iso)}
        <span aria-hidden className="h-px flex-1 bg-border" />
      </h2>
    </li>
  );
}
