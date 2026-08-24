import type { ServerStats } from "@/lib/queries/stats";
import { LiveDot } from "@/components/LiveDot";

const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * Faixa densa de uma linha no lugar do herói com quatro caixas de número.
 * Os contadores vivem em texto corrido monoespaçado — hierarquia por peso e
 * cor, não por quatro molduras iguais.
 */
export function FeedStatusStrip({ stats, connected }: { stats: ServerStats; connected: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-3">
      <h1 className="text-sm font-semibold tracking-tight text-ink">Feed do servidor</h1>

      {connected ? (
        <LiveDot />
      ) : (
        <span className="font-data text-[11px] text-ink-faint">conectando…</span>
      )}

      <p className="flex flex-wrap items-center gap-x-2 font-data text-[11px] leading-5 text-ink-faint">
        {/* ~ porque o total de eventos é contagem estimada — ver getServerStats. */}
        <Stat value={`~${numberFormatter.format(stats.eventCount)}`} label="eventos" />
        <Sep />
        <Stat value={numberFormatter.format(stats.trainerCount)} label="treinadores" />
        <Sep />
        <Stat value={numberFormatter.format(stats.capturesToday)} label="capturas hoje" />
        <Sep />
        <Stat value={numberFormatter.format(stats.shinyCount)} label="shinies" tone="text-shiny" />
        <Sep />
        <Stat value={numberFormatter.format(stats.gymDefeats)} label="ginásios" />
      </p>
    </div>
  );
}

function Stat({ value, label, tone = "text-ink" }: { value: string; label: string; tone?: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className={`font-semibold ${tone}`}>{value}</span> {label}
    </span>
  );
}

function Sep() {
  return <span aria-hidden className="text-border-strong">·</span>;
}
