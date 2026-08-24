import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export interface ServerStats {
  trainerCount: number;
  capturesToday: number;
  shinyCount: number;
  gymDefeats: number;
}

export async function getServerStats(supabase: SupabaseClient<Database>): Promise<ServerStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [trainers, capturesToday, shinies, gymDefeats] = await Promise.all([
    supabase.from("trainers").select("*", { count: "exact", head: true }),
    supabase
      .from("feed_events")
      .select("*", { count: "exact", head: true })
      .eq("type", "capture")
      .gte("created_at", startOfDay.toISOString()),
    supabase.from("pokemons").select("*", { count: "exact", head: true }).eq("is_shiny", true),
    supabase.from("feed_events").select("*", { count: "exact", head: true }).eq("type", "gym_defeat"),
  ]);

  return {
    trainerCount: trainers.count ?? 0,
    capturesToday: capturesToday.count ?? 0,
    shinyCount: shinies.count ?? 0,
    gymDefeats: gymDefeats.count ?? 0,
  };
}
