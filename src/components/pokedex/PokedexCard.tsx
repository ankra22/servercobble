import Link from "next/link";
import type { PokedexEntry } from "@/lib/pokedex";
import { PokemonSprite } from "@/components/PokemonSprite";

export function PokedexCard({ entry }: { entry: PokedexEntry }) {
  return (
    <Link
      href={`/dex/${entry.number}`}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-panel/60 p-3 text-center transition-colors hover:border-border-strong hover:bg-panel-hover"
    >
      <span className="font-data text-[10px] text-ink-faint">#{String(entry.number).padStart(4, "0")}</span>
      <span className="flex h-14 w-14 items-center justify-center">
        <PokemonSprite species={entry.id} variant="animated" size={48} />
      </span>
      <span className="line-clamp-1 text-xs font-medium text-ink">{entry.name}</span>
    </Link>
  );
}
