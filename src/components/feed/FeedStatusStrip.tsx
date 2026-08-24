"use client";

import type { ServerStats } from "@/lib/queries/stats";

/**
 * A faixa de status. Substitui o herói + 4 stat tiles.
 *
 * Uma linha, densa, em mono. O número vem antes do rótulo porque o número é a
 * informação e o rótulo é a legenda — na versão anterior os quatro tiles
 * tinham o mesmo peso visual, então nenhum liderava. Só shinies leva cor, e a
 * cor é a de raridade: é o único contador que fala de algo raro.
 */
export function FeedStatusStrip({ stats, connected }: { stats: ServerStats; connected: boolean }) {
  return (
    <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2 pb-1">
      <h1 className="fd-pixel shrink-0" style={{ color: "var(--fd-ink)", fontSize: 11 }}>
        Feed do servidor
      </h1>

      <span className="flex shrink-0 items-center gap-1.5">
        <span
          aria-hidden="true"
          className="block h-1.5 w-1.5"
          style={{
            background: connected ? "var(--fd-note)" : "var(--fd-ink-3)",
          }}
        />
        <span className="fd-pixel" style={{ color: connected ? "var(--fd-note)" : "var(--fd-ink-3)" }}>
          {connected ? "Ao vivo" : "Conectando"}
        </span>
      </span>

      <dl className="fd-mono flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px]">
        <Stat value={`~${format(stats.eventCount)}`} label="eventos" />
        <Stat value={format(stats.trainerCount)} label="treinadores" />
        <Stat value={format(stats.capturesToday)} label="capturas hoje" />
        <Stat value={format(stats.shinyCount)} label="shinies" tone="var(--fd-rare)" />
        <Stat value={format(stats.gymDefeats)} label="ginásios" />
      </dl>
    </header>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="contents">
        <span style={{ color: tone ?? "var(--fd-ink)", fontWeight: 600 }}>{value}</span>
        <span aria-hidden="true" style={{ color: "var(--fd-ink-3)" }}>
          {label}
        </span>
      </dd>
    </div>
  );
}

function format(n: number): string {
  return n.toLocaleString("pt-BR");
}
