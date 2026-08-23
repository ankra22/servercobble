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
 * Treinadores atualmente "presentes" numa região (série atual no rctmod,
 * sincronizada a cada ~60s pelo coletor via `trainers.current_series`),
 * junto com os ginásios que cada um já venceu ali — o mais recente é o
 * "atual" (ginásio mais avançado que ele já bateu nessa região).
 */
export async function getRegionProgress(
  supabase: SupabaseClient<Database>,
  seriesId: string,
): Promise<RegionTrainerProgress[]> {
  const [trainersRes, eventsRes] = await Promise.all([
    supabase
      .from("trainers")
      .select("id, username, display_name, skin_url")
      .eq("current_series", seriesId)
      .order("badges_count", { ascending: false }),
    supabase
      .from("feed_events")
      .select("trainer_id, gym_leader_name, created_at")
      .eq("type", "gym_defeat")
      .eq("series", seriesId)
      .order("created_at", { ascending: true }),
  ]);

  if (trainersRes.error) {
    console.error("Erro ao buscar treinadores presentes na região:", trainersRes.error.message);
    return [];
  }
  if (eventsRes.error) {
    console.error("Erro ao buscar ginásios vencidos na região:", eventsRes.error.message);
  }

  const badgesByTrainer = new Map<string, RegionGymBadge[]>();
  for (const row of eventsRes.data ?? []) {
    if (!row.trainer_id || !row.gym_leader_name) continue;
    const list = badgesByTrainer.get(row.trainer_id) ?? [];
    list.push({ gymLeaderName: row.gym_leader_name, defeatedAt: row.created_at });
    badgesByTrainer.set(row.trainer_id, list);
  }

  return (trainersRes.data ?? []).map((trainer) => ({
    trainer,
    badges: badgesByTrainer.get(trainer.id) ?? [],
  }));
}
