import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export interface ServerStats {
  /** Aproximado — ver a nota sobre `count: "estimated"` em getServerStats. */
  eventCount: number;
  trainerCount: number;
  capturesToday: number;
  shinyCount: number;
  gymDefeats: number;
}

export async function getServerStats(supabase: SupabaseClient<Database>): Promise<ServerStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [eventCount, trainers, capturesToday, shinies, gymDefeats] = await Promise.all([
    // `estimated` de propósito: feed_events só cresce e a página é
    // revalidate = 0, então um count exato viraria varredura sequencial da
    // tabela inteira a cada request. A faixa mostra o número com "~".
    supabase.from("feed_events").select("*", { count: "estimated", head: true }),
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
    eventCount: eventCount.count ?? 0,
    trainerCount: trainers.count ?? 0,
    capturesToday: capturesToday.count ?? 0,
    shinyCount: shinies.count ?? 0,
    gymDefeats: gymDefeats.count ?? 0,
  };
}
