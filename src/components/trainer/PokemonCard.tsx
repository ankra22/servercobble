"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Pokemon } from "@/lib/database.types";
import { toTitleCase, formatDate } from "@/lib/format";
import { PokemonSprite } from "@/components/PokemonSprite";

const IV_LABELS: Array<[key: string, label: string]> = [
  ["hp", "HP"],
  ["atk", "ATK"],
  ["def", "DEF"],
  ["spa", "SPA"],
  ["spd", "SPD"],
  ["spe", "SPE"],
];

const MAX_IV = 31;

export function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const [open, setOpen] = useState(false);
  const hasIvs = pokemon.ivs && Object.keys(pokemon.ivs).length > 0;
  const hasDetails = hasIvs || pokemon.nature || pokemon.ability || pokemon.held_item || pokemon.caught_location;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-panel/60 transition-colors ${
        pokemon.is_shiny ? "border-shiny/30" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 p-3.5 text-left ${hasDetails ? "cursor-pointer hover:bg-panel-hover" : "cursor-default"}`}
      >
        <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${pokemon.is_shiny ? "bg-shiny-dim/40" : "bg-bg-elevated"}`}>
          <PokemonSprite species={pokemon.species} isShiny={pokemon.is_shiny} variant="animated" size={40} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {pokemon.nickname ? pokemon.nickname : toTitleCase(pokemon.species)}
          </p>
          <p className="truncate text-xs text-ink-faint">
            {pokemon.nickname && <span className="font-data">{toTitleCase(pokemon.species)} · </span>}
            Nv. {pokemon.level}
          </p>
        </div>

        {hasDetails && (
          <ChevronDown className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && hasDetails && (
        <div className="space-y-3 border-t border-border p-3.5 pt-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-dim">
            {pokemon.nature && (
              <span>
                Natureza <span className="text-ink">{toTitleCase(pokemon.nature)}</span>
              </span>
            )}
            {pokemon.ability && (
              <span>
                Habilidade <span className="text-ink">{toTitleCase(pokemon.ability)}</span>
              </span>
            )}
            {pokemon.held_item && (
              <span>
                Item <span className="text-ink">{toTitleCase(pokemon.held_item)}</span>
              </span>
            )}
          </div>

          {hasIvs && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {IV_LABELS.map(([key, label]) => {
                const value = pokemon.ivs[key];
                if (value === undefined) return null;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-8 font-data text-[10px] text-ink-faint">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated">
                      <div
                        className={`h-full rounded-full ${value >= 31 ? "bg-shiny" : "bg-brand"}`}
                        style={{ width: `${Math.min(100, (value / MAX_IV) * 100)}%` }}
                      />
                    </div>
                    <span className="w-5 text-right font-data text-[10px] text-ink-dim">{value}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-1 font-data text-[10px] text-ink-faint">
            {pokemon.caught_location && <span>Capturado em {pokemon.caught_location}</span>}
            <span>{formatDate(pokemon.caught_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
