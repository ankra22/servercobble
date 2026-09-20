"use client";

import { SearchMark } from "@/components/icons/Search";
import { toTitleCase } from "@/lib/format";

interface SpeciesFilterProps {
  value: string;
  onChange: (value: string) => void;
  /** Espécies salvas neste navegador (lowercase) — controladas pelo pai. */
  watchedSpecies: string[];
  onAddSpecies: (species: string) => void;
  onRemoveSpecies: (species: string) => void;
}

/**
 * Busca por espécie (filtra o que já está carregado no feed) + gerenciamento
 * da lista de espécies que o jogador quer acompanhar (destacadas em
 * vermelho no feed — ver FeedEventRow).
 */
export function SpeciesFilter({
  value,
  onChange,
  watchedSpecies,
  onAddSpecies,
  onRemoveSpecies,
}: SpeciesFilterProps) {
  const alreadyWatched = watchedSpecies.includes(value.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchMark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 [color:var(--fd-ink-3)]" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar por espécie…"
            className="fd-input w-full py-2 pl-9 pr-3 font-body text-sm focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => onAddSpecies(value)}
          disabled={!value.trim() || alreadyWatched}
          title="Adicionar essa espécie à sua lista — destaca em vermelho quando aparecer no feed"
          className="fd-chip shrink-0 px-3 py-2 text-xs font-medium disabled:opacity-50"
        >
          {alreadyWatched ? "Na lista ✓" : "+ Adicionar"}
        </button>
      </div>

      {watchedSpecies.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="fd-pixel" style={{ color: "var(--fd-ink-3)" }}>De olho em</span>
          {watchedSpecies.map((species) => (
            <span
              key={species}
              className="fd-watch-tag inline-flex items-center gap-1 py-0.5 pl-2 pr-1 font-body text-xs font-medium"
            >
              {toTitleCase(species)}
              <button
                type="button"
                onClick={() => onRemoveSpecies(species)}
                aria-label={`Remover ${toTitleCase(species)} da lista`}
                className="px-1 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
