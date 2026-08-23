"use client";

import { useMemo, useState } from "react";
import type { PokedexEntry } from "@/lib/pokedex";
import { PokedexCard } from "@/components/pokedex/PokedexCard";
import { SearchMark } from "@/components/icons/Search";

export function PokedexGrid({ entries }: { entries: PokedexEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) => entry.name.toLowerCase().includes(q) || String(entry.number).includes(q),
    );
  }, [entries, query]);

  return (
    <div>
      <div className="relative mb-6">
        <SearchMark className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou número da dex…"
          className="w-full rounded-xl border border-border bg-panel/60 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-brand/40 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-faint">
          Nenhum Pokémon encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {filtered.map((entry) => (
            <PokedexCard key={entry.number} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
