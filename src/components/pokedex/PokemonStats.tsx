import { STAT_LABELS, type BaseStats } from "@/lib/pokedex";

/**
 * Barras de stats base — identidade 01. Escala fixa (0–180) pra as barras
 * ficarem comparáveis entre Pokémon; o número real fica sempre à mostra pra
 * quem passa dos 180 (Blissey, lendários). Cor em 3 faixas só pra leitura.
 */
const BAR_MAX = 180;

function tone(value: number): string {
  if (value >= 100) return "bg-route";
  if (value >= 60) return "bg-lcd-dim";
  return "bg-lcd-faint";
}

export function PokemonStats({ stats }: { stats: BaseStats }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-pixel text-[9px] uppercase tracking-wider text-lcd-faint">Stats base</p>
        <p className="font-body text-xs tabular-nums text-lcd-dim">
          Total <span className="font-semibold text-lcd-ink">{stats.total}</span>
        </p>
      </div>

      <dl className="mt-2 space-y-1.5">
        {STAT_LABELS.map(({ key, label }) => {
          const value = stats[key];
          return (
            <div key={key} className="flex items-center gap-2.5">
              <dt className="w-20 shrink-0 font-body text-xs text-lcd-dim">{label}</dt>
              <dd className="flex min-w-0 flex-1 items-center gap-2">
                <span className="w-8 shrink-0 text-right font-body text-xs tabular-nums text-lcd-ink">
                  {value}
                </span>
                <span className="h-2 min-w-0 flex-1 bg-lcd-sunken">
                  <span
                    className={`block h-full ${tone(value)}`}
                    style={{ width: `${Math.min(100, (value / BAR_MAX) * 100)}%` }}
                  />
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
