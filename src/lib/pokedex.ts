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
  /** Stats base + total. `null` só se o arquivo da espécie não tiver `baseStats`. */
  baseStats: BaseStats | null;
  evolution: EvolutionChain;
}

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  total: number;
}

export interface EvolutionStep {
  /** Número nacional do Pokémon resultante. */
  number: number;
  /** Método em pt-BR: "Nível 16", "Pedra do Trovão", "Amizade alta, à noite"… */
  method: string;
}

export interface EvolutionChain {
  /** Número da pré-evolução, ou `null` se é o início da linha. */
  from: number | null;
  /** Evoluções diretas (pode ramificar, ex.: Eevee). */
  to: EvolutionStep[];
}

export const STAT_LABELS: Array<{ key: keyof Omit<BaseStats, "total">; label: string }> = [
  { key: "hp", label: "PV" },
  { key: "atk", label: "Ataque" },
  { key: "def", label: "Defesa" },
  { key: "spa", label: "Atq. Esp." },
  { key: "spd", label: "Def. Esp." },
  { key: "spe", label: "Velocidade" },
];

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
