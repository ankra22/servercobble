"use client";

import { ChevronDown } from "lucide-react";
import type { FeedRow } from "@/lib/feed-grouping";
import { toTitleCase } from "@/lib/format";

type LevelRun = Extract<FeedRow, { kind: "levelup-run" }>;

/**
 * A corrida de level ups colapsada. Esta é a linha que resolve o problema real
 * do feed: 14 level ups seguidos do mesmo Persian enterravam uma captura
 * shiny. Agora é uma linha de ambiente só, expansível.
 *
 * A contagem vive em mono e é o único número da linha — o "×14" é a
 * informação, não o texto.
 */
export function FeedLevelRunRow({
  run,
  expanded,
  onToggle,
}: {
  run: LevelRun;
  expanded: boolean;
  onToggle: () => void;
}) {
  const lead = run.events[0];
  const count = run.events.length;
  const species = lead.species ? toTitleCase(lead.species) : "Pokémon";
  const trainer = lead.trainer?.display_name;
  const hasRange = run.from !== null && run.to !== null;

  const panelId = `run-${run.key}`;

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full min-w-0 items-center gap-2 text-left"
      >
        <span className="min-w-0 flex-1 truncate text-[12px] leading-5" style={{ color: "var(--fd-ink-3)" }}>
          <span style={{ color: "var(--fd-ink-2)", fontWeight: 600 }}>{species}</span>
          {trainer ? ` de ${trainer}` : ""}
          {hasRange ? ` subiu do nível ${run.from} ao ${run.to}` : " subiu de nível"}
        </span>

        <span className="fd-mono shrink-0 text-[11px]" style={{ color: "var(--fd-ink-2)" }}>
          &times;{count}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          style={{ color: "var(--fd-ink-3)" }}
        />
      </button>

      <span id={panelId} className="sr-only">
        {expanded ? `${count} eventos de level up expandidos` : ""}
      </span>
    </div>
  );
}
