import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, FeedEventType, FeedEventWithTrainer, SpawnRarity } from "@/lib/database.types";

export const FEED_SELECT = "*, trainer:trainers(id, username, display_name, skin_url)";

interface FeedEventsOptions {
  trainerId?: string;
  limit?: number;
  offset?: number;
  /** Só traz eventos desses tipos (ex.: ["rare_spawn"] na aba de spawns raros). */
  types?: FeedEventType[];
  /**
   * Exclui `rare_spawn` dessa raridade — usado no feed principal pra esconder
   * spawns "rare" e deixar só "ultra-rare" (evita poluir a home).
   */
  excludeRareSpawnRarity?: SpawnRarity;
}

export async function fetchFeedEvents(
  supabase: SupabaseClient<Database>,
  { trainerId, limit = 30, offset = 0, types, excludeRareSpawnRarity }: FeedEventsOptions = {},
): Promise<FeedEventWithTrainer[]> {
  let query = supabase
    .from("feed_events")
    .select(FEED_SELECT)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (trainerId) {
    query = query.eq("trainer_id", trainerId);
  }

  if (types && types.length > 0) {
    query = query.in("type", types);
  }

  if (excludeRareSpawnRarity) {
    // Precisa do "or" (em vez de um simples .neq) pra não acabar excluindo
    // também todo mundo que não é rare_spawn (rarity vem null pra eles, e
    // NULL != valor não bate como verdadeiro sozinho no Postgres).
    query = query.or(`type.neq.rare_spawn,rarity.neq.${excludeRareSpawnRarity}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar feed_events:", error.message);
    return [];
  }

  return (data ?? []) as unknown as FeedEventWithTrainer[];
}
