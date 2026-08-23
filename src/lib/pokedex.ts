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
  monuments: string[];
}

export const POKEDEX: PokedexEntry[] = pokedexData as PokedexEntry[];

export function getPokedexEntry(number: number): PokedexEntry | undefined {
  return POKEDEX.find((entry) => entry.number === number);
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
