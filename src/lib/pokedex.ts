import pokedexData from "@/data/pokedex.json";
import type { SpawnRarity } from "@/lib/database.types";

export interface PokedexEntry {
  number: number;
  id: string;
  name: string;
  types: string[];
  description: string | null;
  labels: string[];
  rarity: SpawnRarity | "common" | "uncommon" | null;
  biomes: string[];
  /** Existe monumento lendário — o local exato não é exposto de propósito. */
  hasMonument: boolean;
  /**
   * Horário/clima exigido pra spawnar, quando vale pra todo spawn natural da
   * espécie (ex.: ["Noite"], ["Chuva"], ["Dia", "Tempo limpo"]). Lista vazia
   * = spawna a qualquer hora / com qualquer clima.
   */
  spawnConditions: string[];
}

export const POKEDEX: PokedexEntry[] = pokedexData as PokedexEntry[];

export function getPokedexEntry(number: number): PokedexEntry | undefined {
  return POKEDEX.find((entry) => entry.number === number);
}

/**
 * Labels do Cobblemon que marcam um Pokémon como "especial" — pra esses o
 * local de spawn NUNCA é exposto na Dex (só um "?"), independente de terem
 * monumento ou spawnarem num bioma comum. Decisão do usuário: todo lendário
 * fica com a interrogação.
 */
const HIDDEN_LOCATION_LABELS = ["legendary", "mythical", "ultra_beast"];

/** O local de spawn desse Pokémon é mantido em segredo de propósito. */
export function isLocationHidden(entry: PokedexEntry): boolean {
  return entry.hasMonument || entry.labels.some((label) => HIDDEN_LOCATION_LABELS.includes(label));
}

export const TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  electric: "Elétrico",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
};

export const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  "ultra-rare": "Ultra-raro",
};
