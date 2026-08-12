import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Pokemon, Trainer } from "@/lib/database.types";

export async function listTrainers(supabase: SupabaseClient<Database>): Promise<Trainer[]> {
  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .order("badges_count", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar trainers:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getTrainerByUsername(
  supabase: SupabaseClient<Database>,
  username: string,
): Promise<Trainer | null> {
  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar trainer:", error.message);
    return null;
  }
  return data;
}

export async function getTrainerPokemons(
  supabase: SupabaseClient<Database>,
  trainerId: string,
): Promise<Pokemon[]> {
  const { data, error } = await supabase
    .from("pokemons")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("caught_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar pokemons:", error.message);
    return [];
  }
  return data ?? [];
}

export interface TrainerCounters {
  totalCaptured: number;
  shinyCount: number;
  evolutions: number;
  gymDefeats: number;
}

export async function getTrainerCounters(
  supabase: SupabaseClient<Database>,
  trainerId: string,
): Promise<TrainerCounters> {
  const [totalCaptured, shinyCount, evolutions, gymDefeats] = await Promise.all([
    supabase.from("pokemons").select("*", { count: "exact", head: true }).eq("trainer_id", trainerId),
    supabase
      .from("pokemons")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", trainerId)
      .eq("is_shiny", true),
    supabase
      .from("feed_events")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", trainerId)
      .eq("type", "evolution"),
    supabase
      .from("feed_events")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", trainerId)
      .eq("type", "gym_defeat"),
  ]);

  return {
    totalCaptured: totalCaptured.count ?? 0,
    shinyCount: shinyCount.count ?? 0,
    evolutions: evolutions.count ?? 0,
    gymDefeats: gymDefeats.count ?? 0,
  };
}
