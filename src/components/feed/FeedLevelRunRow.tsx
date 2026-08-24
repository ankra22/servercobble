"use client";

import { ChevronDown } from "lucide-react";
import type { FeedEventWithTrainer } from "@/lib/database.types";
import { fallbackMessage } from "@/lib/feed-message";
import { formatClock, toTitleCase } from "@/lib/format";

interface FeedLevelRunRowProps {
  /** Corrida de level ups consecutivos, do mais novo pro mais velho. */
  events: FeedEventWithTrainer[];
  from: number | null;
  to: number | null;
  expanded: boolean;
  onToggle: () => void;
  panelId: string;
}

/**
 * Uma corrida inteira de level up numa linha só — é isso que impede 14 level
 * ups seguidos de enterrarem uma captura shiny. Clicar expande os eventos
 * individuais.
 */
export function FeedLevelRunRow({ events, from, to, expanded, onToggle, panelId }: FeedLevelRunRowProps) {
  const newest = events[0];
  const species = newest.species ? toTitleCase(newest.species) : "Um Pokémon";
  const trainer = newest.trainer?.display_name ?? "um treinador";
  // Sem intervalo o texto degrada pro genérico — o parse do nível depende do
  // formato de mensagem do ingest.py (ver parseLevelRange).
  const range = from !== null && to !== null ? `subiu do nível ${from} ao ${to}` : "subiu de nível";

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-baseline gap-2 text-left text-xs leading-5 text-ink-faint transition-colors hover:text-ink-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="min-w-0 flex-1">
          <span className="font-medium text-ink-dim">{species}</span> de {trainer} {range}
        </span>
        <span className="shrink-0 font-data text-[10px] text-ink-faint">×{events.length}</span>
        <ChevronDown
          aria-hidden
          className={`h-3.5 w-3.5 shrink-0 self-center transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <ul id={panelId} className="mt-1.5 space-y-1 border-l border-border pl-3">
          {events.map((event) => (
            <li key={event.id} className="flex items-baseline gap-2 text-[11px] leading-5 text-ink-faint">
              <time dateTime={event.created_at} className="shrink-0 font-data">
                {formatClock(event.created_at)}
              </time>
              <span className="min-w-0 flex-1">{event.message?.trim() || fallbackMessage(event)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
