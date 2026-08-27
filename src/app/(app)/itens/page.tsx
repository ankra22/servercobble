import type { Metadata } from "next";
import { ITEMS } from "@/lib/items";
import { ItemsIndex } from "@/components/items/ItemsIndex";

export const metadata: Metadata = {
  title: "Itens",
  description:
    "Itens do Cobblemon ligados a Pokémon — pedras de evolução, bagas, itens segurados: o que fazem, quem dropa e o que destravam.",
};

/**
 * Aba ITENS — identidade 01 ("Pokédex de bolso"). Só itens do Cobblemon
 * ligados a Pokémon (drop, evolução, item segurado). Gerada por
 * scripts/build-items.mjs a partir dos dados do próprio mod.
 */
export default function ItensPage() {
  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6">
          <h1 className="font-pixel text-lg text-route">Itens</h1>
          <p className="mt-2 max-w-md font-body text-sm text-lcd/70">
            {ITEMS.length} itens ligados a Pokémon. Toca num pra ver o efeito, quais Pokémon dropam e
            que evoluções ele destrava.
          </p>
        </header>

        <div className="t01-screen p-4 sm:p-5">
          <ItemsIndex items={ITEMS} />
        </div>
      </div>
    </div>
  );
}
