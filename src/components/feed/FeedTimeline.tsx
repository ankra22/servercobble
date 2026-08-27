"use client";

import { useMemo, useState } from "react";
import type { FeedEventWithTrainer } from "@/lib/database.types";
import { feedTier, isLegendaryAlert, type FeedTier } from "@/lib/feed-events";
import { groupFeedEvents, type FeedRow } from "@/lib/feed-grouping";
import { dayKey, formatClock, formatDayLabel } from "@/lib/format";
import { FeedEventRow } from "@/components/feed/FeedEventRow";
import { FeedLevelRunRow } from "@/components/feed/FeedLevelRunRow";

interface FeedTimelineProps {
  events: FeedEventWithTrainer[];
  newIds: Set<string>;
  watchedSpecies: string[];
}

/**
 * O trilho.
 *
 * ALINHAMENTO: a célula do horário e a do nó têm altura fixa `h-5` — a mesma
 * altura de linha do texto — com `items-center`. Elas se centram sozinhas na
 * primeira linha do conteúdo, em qualquer tier e com qualquer tamanho de nó.
 * A versão anterior calculava um offset (`--node-y`) no papel e errava na
 * tela; aqui o alinhamento é estrutural, não aritmético.
 *
 * LARGURA: container query, não media query. O perfil do treinador usa este
 * mesmo componente numa coluna estreita em desktop — `sm:` já estaria ativo lá
 * e espremeria a coluna de horário. `@container` responde à largura do próprio
 * trilho, então o mesmo componente serve os dois contextos sem prop de
 * densidade.
 */
export function FeedTimeline({ events, newIds, watchedSpecies }: FeedTimelineProps) {
  const rows = useMemo(() => groupFeedEvents(events), [events]);
  const watched = useMemo(
    () => new Set(watchedSpecies.map((s) => s.toLowerCase())),
    [watchedSpecies],
  );

  const isWatched = (species: string | null) => !!species && watched.has(species.toLowerCase());

  // Divisor de dia resolvido antes do JSX, comparando cada linha com a
  // anterior em vez de carregar um acumulador mutável: reatribuir durante o
  // render é o que o react-hooks/immutability recusa (e o que quebraria sob
  // React Compiler). Em i = 0, `keys[-1]` é undefined, então a primeira linha
  // sempre abre um divisor.
  const days = useMemo(() => {
    const leads = rows.map((row) => (row.kind === "event" ? row.event : row.events[0]));
    const keys = leads.map((lead) => dayKey(lead.created_at));

    return rows.map((row, i) => ({ row, lead: leads[i], showDay: keys[i] !== keys[i - 1] }));
  }, [rows]);

  return (
    <div className="@container">
      <div className="relative">
        {/* Trilho: fio contínuo atrás da coluna dos nós. Fica absoluto pra
            não deixar furo entre linhas nem depender do espaçamento delas.
            O `left` é o centro da coluna dos nós e precisa acompanhar a grade
            da linha: no estreito, metade de 1.25rem; no largo, 3.5rem da
            coluna do horário + 0.75rem de gap-x-3 + 0.625rem. */}
        <span
          aria-hidden="true"
          className="fd-rail absolute bottom-2 top-2 w-px left-[0.625rem] @[26rem]:left-[4.875rem]"
        />

        <ol className="relative">
          {days.map(({ row, lead, showDay }) => (
            <li key={row.key}>
              {showDay && <DayDivider iso={lead.created_at} />}
              <TimelineRow row={row} newIds={newIds} isWatched={isWatched} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function DayDivider({ iso }: { iso: string }) {
  return (
    <div className="grid grid-cols-[1.25rem_1fr] @[26rem]:grid-cols-[3.5rem_1.25rem_1fr] items-center gap-x-3 pb-2 pt-6 first:pt-0">
      <span className="hidden @[26rem]:block" />
      <span className="h-5" />
      <h3 className="fd-pixel" style={{ color: "var(--fd-ink-3)" }}>
        {formatDayLabel(iso)}
      </h3>
    </div>
  );
}

function TimelineRow({
  row,
  newIds,
  isWatched,
}: {
  row: FeedRow;
  newIds: Set<string>;
  isWatched: (species: string | null) => boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (row.kind === "levelup-run") {
    const lead = row.events[0];
    const watched = isWatched(lead.species);
    const tier: FeedTier = watched ? "standard" : "ambient";

    return (
      <>
        <RowShell
          iso={lead.created_at}
          tier={tier}
          watched={watched}
          isNew={newIds.has(lead.id)}
          hit
        >
          <FeedLevelRunRow
            run={row}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
        </RowShell>

        {expanded &&
          row.events.map((event) => (
            <RowShell key={event.id} iso={event.created_at} tier="ambient" watched={false} nested>
              <FeedEventRow event={event} tier="ambient" watched={false} />
            </RowShell>
          ))}
      </>
    );
  }

  const { event } = row;
  const watched = isWatched(event.species);
  const tier = feedTier(event, watched);
  const alert = isLegendaryAlert(event);

  return (
    <RowShell
      iso={event.created_at}
      tier={tier}
      watched={watched}
      alert={alert}
      isNew={newIds.has(event.id)}
    >
      <FeedEventRow event={event} tier={tier} watched={watched} alert={alert} />
    </RowShell>
  );
}

/**
 * A casca de uma linha: horário · nó · conteúdo.
 * Não sabe nada sobre o evento — só sobre posição e raridade.
 */
function RowShell({
  iso,
  tier,
  watched,
  alert = false,
  isNew = false,
  hit = false,
  nested = false,
  children,
}: {
  iso: string;
  tier: FeedTier;
  watched: boolean;
  alert?: boolean;
  isNew?: boolean;
  hit?: boolean;
  nested?: boolean;
  children: React.ReactNode;
}) {
  const rowTone = alert
    ? "fd-row--alert"
    : tier === "highlight" && watched
      ? "fd-row--watch"
      : tier === "highlight"
        ? "fd-row--highlight"
        : watched
          ? "fd-row--watch"
          : "";

  return (
    <div
      className={[
        "fd-row grid grid-cols-[1.25rem_1fr] @[26rem]:grid-cols-[3.5rem_1.25rem_1fr]",
        "items-start gap-x-3 py-2.5 pr-1",
        rowTone,
        hit ? "fd-row-hit" : "",
        isNew ? "fd-enter" : "",
        nested ? "opacity-70" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Horário — some no estreito e reaparece inline no conteúdo. */}
      <time
        dateTime={iso}
        className="fd-mono hidden h-5 items-center justify-end text-[11px] @[26rem]:flex"
        style={{ color: "var(--fd-ink-3)" }}
      >
        {formatClock(iso)}
      </time>

      {/* Nó. h-5 + items-center = centra na primeira linha de texto. */}
      <span className="flex h-5 items-center justify-center">
        <span
          aria-hidden="true"
          className={[
            "fd-node",
            `fd-node--${tier}`,
            alert ? "fd-node--alert" : "",
            watched ? "fd-node--watch" : "",
            nested ? "opacity-60" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </span>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
