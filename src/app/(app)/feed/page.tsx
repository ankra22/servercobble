import { createClient } from "@/lib/supabase/server";
import { fetchFeedEvents } from "@/lib/queries/feed";
import { getServerStats } from "@/lib/queries/stats";
import { isSupabaseConfigured } from "@/lib/env";
import { getWatchedSpeciesList } from "@/lib/preferences";
import { LiveFeed } from "@/components/feed/LiveFeed";
import { FeedRadarBackground } from "@/components/feed/FeedRadarBackground";
import { SetupNotice } from "@/components/SetupNotice";

export const revalidate = 0;

export default async function HomePage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const [events, stats, watchedSpecies] = await Promise.all([
    fetchFeedEvents(supabase, { limit: 30 }),
    getServerStats(supabase),
    getWatchedSpeciesList(),
  ]);

  return (
    <>
      <FeedRadarBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Sem herói: a faixa de status (com o h1 e os contadores) é renderizada
            dentro do LiveFeed, que é quem sabe se o Realtime está conectado. */}
        <LiveFeed initialEvents={events} initialWatchedSpecies={watchedSpecies} stats={stats} />
      </div>
    </>
  );
}
