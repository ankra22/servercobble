import { speciesSlug } from "@/lib/format";

/**
 * Sprite animado (Pokémon Showdown) para a espécie. Não é 100% garantido pra
 * todas as formas regionais/customizadas do Cobblemon, mas cobre a
 * esmagadora maioria das espécies base — e é uma forma leve de ilustrar o
 * feed sem precisar hospedar os próprios sprites do Cobblemon.
 */
export function pokemonSpriteUrl(species: string, isShiny: boolean): string {
  const slug = speciesSlug(species);
  const folder = isShiny ? "ani-shiny" : "ani";
  return `https://play.pokemonshowdown.com/sprites/${folder}/${slug}.gif`;
}

export function pokemonIconUrl(species: string): string {
  const slug = speciesSlug(species);
  return `https://play.pokemonshowdown.com/sprites/dex/${slug}.png`;
}
