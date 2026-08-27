"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { PokedexEntry } from "@/lib/pokedex";
import { pokemonIconUrl } from "@/lib/pokemon-sprite";
import { SearchMark } from "@/components/icons/Search";

/**
 * Índice da Dex — identidade 01 ("Pokédex de bolso"). Colunas de texto densas
 * em vez de grade de cards: número, ponto do tipo, nome. O sprite não fica na
 * lista o tempo todo (1025 gifs animados era o que pesava antes) — aparece só
 * no hover, como fundo, e no toque a linha já leva pra página do bicho.
 * Raridade não entra na Dex de propósito (decisão do usuário).
 */

const TYPE_DOT: Record<string, string> = {
  normal: "#9a9a82",
  fire: "#e07a3c",
  water: "#4a90d9",
  grass: "#5b9e3f",
  electric: "#e0b93c",
  ice: "#6fc7c7",
  fighting: "#c85a4a",
  poison: "#9a5bbf",
  ground: "#cfa94f",
  flying: "#8aa0c8",
  psychic: "#e06a92",
  bug: "#8f9e3a",
  rock: "#b0a068",
  ghost: "#7566b0",
  dragon: "#6f63d9",
  dark: "#7a6a5a",
  steel: "#8fa0b0",
  fairy: "#e08fb8",
};

export function PokedexIndex({ entries }: { entries: PokedexEntry[] }) {
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
      <div className="relative mb-5">
        <SearchMark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lcd-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou número"
          className="w-full border-2 border-lcd-edge bg-lcd-sunken py-2 pl-9 pr-3 font-body text-sm text-lcd-ink placeholder:text-lcd-faint focus:outline-none focus:ring-2 focus:ring-ball/50"
        />
      </div>

      <div className="mb-2 flex items-baseline justify-between border-b border-lcd-edge/30 pb-1.5">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-lcd-dim">Dex &middot; Índice</span>
        <span className="font-body text-xs tabular-nums text-lcd-faint">
          {filtered.length === entries.length
            ? `${entries.length} registros`
            : `${filtered.length} de ${entries.length}`}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center font-body text-sm text-lcd-dim">
          Nada com &ldquo;{query}&rdquo;. Confere o nome ou o número da dex.
        </p>
      ) : (
        <ul className="columns-2 gap-x-6 [column-rule:1px_solid_rgb(12_18_54/0.14)] sm:columns-3 lg:columns-4">
          {filtered.map((entry) => (
            <li key={entry.number} className="break-inside-avoid">
              <Link
                href={`/dex/${entry.number}`}
                className="group relative flex items-center gap-2 py-1 font-body text-[13px] leading-5 text-lcd-dim hover:text-lcd-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ball"
              >
                <span
                  aria-hidden="true"
                  className="w-2 shrink-0 text-ball opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none"
                >
                  &#9656;
                </span>
                <span className="shrink-0 tabular-nums text-lcd-faint">
                  {String(entry.number).padStart(4, "0")}
                </span>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0"
                  style={{ background: TYPE_DOT[entry.types[0] ?? ""] ?? "currentColor" }}
                />
                <span className="truncate">{entry.name}</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full left-5 z-10 h-16 w-16 border border-lcd-edge/50 bg-lcd bg-contain bg-center bg-no-repeat opacity-0 shadow-[3px_3px_0_rgb(12_18_54/0.25)] transition-opacity [image-rendering:pixelated] group-hover:opacity-100 motion-reduce:transition-none"
                  style={{ backgroundImage: `var(--spr)`, "--spr": `url(${pokemonIconUrl(entry.id)})` } as CSSProperties}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
