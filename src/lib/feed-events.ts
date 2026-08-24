import type { FeedEventType, SpawnRarity } from "@/lib/database.types";

export interface FeedEventConfig {
  label: string;
  /** token de cor definido em globals.css (@theme) — vira text-{tone}/bg-{tone}/border-{tone} */
  tone: "rare" | "capture" | "battle" | "evolution" | "levelup" | "shiny";
  verb: string;
}

export const FEED_EVENT_CONFIG: Record<FeedEventType, FeedEventConfig> = {
  rare_spawn: {
    label: "Spawn raro",
    tone: "rare",
    verb: "apareceu",
  },
  capture: {
    label: "Captura",
    tone: "capture",
    verb: "capturou",
  },
  gym_defeat: {
    label: "Ginásio",
    tone: "battle",
    verb: "venceu o líder",
  },
  evolution: {
    label: "Evolução",
    tone: "evolution",
    verb: "evoluiu",
  },
  level_up: {
    label: "Level up",
    tone: "levelup",
    verb: "subiu de nível",
  },
  shiny_found: {
    label: "Shiny",
    tone: "shiny",
    verb: "encontrou um shiny",
  },
};

export const FEED_EVENT_ORDER: FeedEventType[] = [
  "shiny_found",
  "rare_spawn",
  "capture",
  "evolution",
  "gym_defeat",
  "level_up",
];

/* ==========================================================================
   Hierarquia visual — três pesos, pra um shiny não afundar no meio de uma
   sequência de level ups. Ver FeedTimeline/FeedEventCard.
   ========================================================================== */

export type FeedTier = "highlight" | "standard" | "ambient";

/**
 * Tipos em que `is_shiny` significa "shiny acontecendo agora". `level_up`
 * fica de fora de propósito: o collector propaga o `is_shiny` do pokémon em
 * todo level up (ver process_level_up em ingest.py), e um shiny treinando
 * viraria uma enxurrada de destaques. `capture` precisa estar aqui porque
 * capturar um shiny não gera evento `shiny_found` — o selo vem no próprio
 * evento de captura.
 */
const SHINY_WORTHY: readonly FeedEventType[] = ["capture", "rare_spawn", "evolution"];

export interface TierInput {
  type: FeedEventType;
  is_shiny: boolean;
  rarity: SpawnRarity | null;
}

/** `isWatched` promove level up de ambiente pra padrão: a espécie que o
 *  usuário marcou não deve virar ruído de fundo. */
export function feedTier(event: TierInput, isWatched = false): FeedTier {
  if (event.type === "shiny_found") return "highlight";
  if (event.is_shiny && SHINY_WORTHY.includes(event.type)) return "highlight";
  if (event.type === "rare_spawn" && event.rarity === "ultra-rare") return "highlight";
  if (event.type === "level_up") return isWatched ? "standard" : "ambient";
  return "standard";
}

/* ==========================================================================
   Intervalo de níveis — `feed_events` não tem coluna de nível; o número só
   existe dentro do texto que process_level_up() monta em ingest.py:
   "{Espécie} de {username} subiu do nível {old} para o nível {new}."
   Se aquele formato mudar, o parse falha em silêncio na UI — por isso o
   aviso em desenvolvimento.
   ========================================================================== */

const LEVEL_RANGE_RE = /n[íi]vel\s+(\d+)\s+para\s+o\s+n[íi]vel\s+(\d+)/i;

export interface LevelRange {
  from: number;
  to: number;
}

export function parseLevelRange(message: string | null | undefined): LevelRange | null {
  const text = message?.trim();
  if (!text) return null;

  const match = LEVEL_RANGE_RE.exec(text);
  if (!match) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[feed] level_up sem intervalo de nível reconhecível: ${JSON.stringify(text)} — o formato de ingest.py mudou?`,
      );
    }
    return null;
  }

  return { from: Number(match[1]), to: Number(match[2]) };
}
