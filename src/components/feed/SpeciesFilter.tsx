"use client";

import { useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { SearchMark } from "@/components/icons/Search";
import { addWatchedSpecies, removeWatchedSpecies } from "@/lib/preferences";
import { toTitleCase } from "@/lib/format";

interface SpeciesFilterProps {
  value: string;
  onChange: (value: string) => void;
  /** Lista de espécies salvas do usuário logado (lowercase) — controlada pelo pai. */
  watchedSpecies: string[];
  onWatchedSpeciesChange: (species: string[]) => void;
}

/**
 * Busca por espécie (filtra o que já está carregado no feed) + gerenciamento
 * da lista de espécies que o usuário logado quer acompanhar (destacadas em
 * vermelho no feed — ver FeedEventCard).
 */
export function SpeciesFilter({ value, onChange, watchedSpecies, onWatchedSpeciesChange }: SpeciesFilterProps) {
  const { isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    const normalized = value.trim().toLowerCase();
    if (!normalized || watchedSpecies.includes(normalized)) return;

    startTransition(async () => {
      const result = await addWatchedSpecies(normalized);
      if (result.ok) {
        onWatchedSpeciesChange([...watchedSpecies, normalized]);
      }
    });
  }

  function handleRemove(species: string) {
    startTransition(async () => {
      const result = await removeWatchedSpecies(species);
      if (result.ok) {
        onWatchedSpeciesChange(watchedSpecies.filter((s) => s !== species));
      }
    });
  }

  const alreadyWatched = watchedSpecies.includes(value.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchMark className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar por espécie…"
            className="w-full rounded-xl border border-border bg-panel/60 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-brand/40 focus:outline-none"
          />
        </div>

        {isSignedIn && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !value.trim() || alreadyWatched}
            title="Adicionar essa espécie à sua lista — destaca em vermelho quando aparecer no feed"
            className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-ink-dim transition-colors hover:border-border-strong hover:text-ink disabled:opacity-50"
          >
            {alreadyWatched ? "Na lista ✓" : "+ Adicionar"}
          </button>
        )}
      </div>

      {isSignedIn && watchedSpecies.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ink-faint">De olho em:</span>
          {watchedSpecies.map((species) => (
            <span
              key={species}
              className="inline-flex items-center gap-1 rounded-full border border-watch/30 bg-watch-dim/40 py-1 pl-2.5 pr-1 text-xs font-medium text-watch"
            >
              {toTitleCase(species)}
              <button
                type="button"
                onClick={() => handleRemove(species)}
                disabled={isPending}
                aria-label={`Remover ${toTitleCase(species)} da lista`}
                className="rounded-full px-1 leading-none hover:bg-watch/20"
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
