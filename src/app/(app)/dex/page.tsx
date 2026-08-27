import type { Metadata } from "next";
import { POKEDEX } from "@/lib/pokedex";
import { PokedexIndex } from "@/components/pokedex/PokedexIndex";

export const metadata: Metadata = {
  title: "Dex",
  description: "Todos os Pokémon do servidor — descrição, raridade e onde encontrar cada um.",
};

/**
 * Primeira tela na identidade 01 ("Pokédex de bolso"). Carcaça marinho +
 * "tela" LCD (.t01-screen) com o índice denso dentro. Header e Footer do site
 * ainda estão no tema antigo — a migração é página a página.
 */
export default function DexPage() {
  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6">
          <h1 className="font-pixel text-lg text-route">Dex</h1>
          <p className="mt-2 max-w-md font-body text-sm text-lcd/70">
            {POKEDEX.length} Pokémon catalogados no servidor. Toca em qualquer um pra ver
            raridade, tipo e onde encontrar.
          </p>
        </header>

        <div className="t01-screen p-4 sm:p-5">
          <PokedexIndex entries={POKEDEX} />
        </div>
      </div>
    </div>
  );
}
