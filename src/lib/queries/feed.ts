import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, FeedEventWithTrainer } from "@/lib/database.types";

export const FEED_SELECT = "*, trainer:trainers(id, username, display_name, skin_url)";

interface FeedEventsOptions {
  trainerId?: string;
  limit?: number;
  offset?: number;
}

export async function fetchFeedEvents(
  supabase: SupabaseClient<Database>,
  { trainerId, limit = 30, offset = 0 }: FeedEventsOptions = {},
): Promise<FeedEventWithTrainer[]> {
  let query = supabase
    .from("feed_events")
    .select(FEED_SELECT)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (trainerId) {
    query = query.eq("trainer_id", trainerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar feed_events:", error.message);
    return [];
  }

  return (data ?? []) as unknown as FeedEventWithTrainer[];
}
