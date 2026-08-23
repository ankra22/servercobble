import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Trainer } from "@/lib/database.types";

export interface RegionGymBadge {
  gymLeaderName: string;
  defeatedAt: string;
}

export interface RegionTrainerProgress {
  trainer: Pick<Trainer, "id" | "username" | "display_name" | "skin_url">;
  badges: RegionGymBadge[];
}

/**
 * Treinadores com pelo menos um ginásio vencido numa região (série do
 * rctmod), com a lista de ginásios vencidos em ordem — o mais recente é o
 * "atual" (ginásio mais avançado que ele já bateu nessa região).
 */
export async function getRegionProgress(
  supabase: SupabaseClient<Database>,
  seriesId: string,
): Promise<RegionTrainerProgress[]> {
  const { data, error } = await supabase
    .from("feed_events")
    .select("gym_leader_name, created_at, trainer:trainers(id, username, display_name, skin_url)")
    .eq("type", "gym_defeat")
    .eq("series", seriesId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar progresso da região:", error.message);
    return [];
  }

  const byTrainer = new Map<string, RegionTrainerProgress>();
  for (const row of data ?? []) {
    const trainer = row.trainer as unknown as RegionTrainerProgress["trainer"] | null;
    if (!trainer || !row.gym_leader_name) continue;

    const entry = byTrainer.get(trainer.id) ?? { trainer, badges: [] };
    entry.badges.push({ gymLeaderName: row.gym_leader_name, defeatedAt: row.created_at });
    byTrainer.set(trainer.id, entry);
  }

  return Array.from(byTrainer.values()).sort((a, b) => b.badges.length - a.badges.length);
}
