import type { Metadata } from "next";
import { POKEDEX } from "@/lib/pokedex";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";

export const metadata: Metadata = {
  title: "Dex",
  description: "Todos os Pokémon do servidor — descrição, raridade e onde encontrar cada um.",
};

export default function DexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-8 rounded-3xl border border-border px-6 py-10 sm:px-8 sm:py-14">
        <h1 className="font-pixel text-xl text-ink sm:text-2xl">Dex</h1>
        <p className="mt-1.5 max-w-md text-sm text-ink-dim">
          {POKEDEX.length} Pokémon catalogados. Clica em qualquer um pra ver descrição, raridade e onde
          encontrar.
        </p>
      </section>

      <PokedexGrid entries={POKEDEX} />
    </div>
  );
}
