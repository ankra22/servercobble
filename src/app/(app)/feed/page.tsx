import { createClient } from "@/lib/supabase/server";
import { fetchFeedEvents } from "@/lib/queries/feed";
import { getServerStats } from "@/lib/queries/stats";
import { isSupabaseConfigured } from "@/lib/env";
import { getWatchedSpeciesList } from "@/lib/preferences";
import { LiveFeed } from "@/components/feed/LiveFeed";
import { StatTile } from "@/components/StatTile";
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <section className="mb-8 rounded-3xl border border-border px-6 py-10 sm:px-8 sm:py-14">
        <h1 className="font-pixel text-base text-ink sm:text-lg">Feed do servidor</h1>
        <p className="mt-1.5 max-w-md text-sm text-ink-dim">
          Capturas, shinies, evoluções e batalhas de ginásio, direto dos logs — sem atualizar a página.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Treinadores" value={stats.trainerCount} tone="brand" />
          <StatTile label="Capturas hoje" value={stats.capturesToday} tone="capture" />
          <StatTile label="Shinies no servidor" value={stats.shinyCount} tone="shiny" />
          <StatTile label="Ginásios vencidos" value={stats.gymDefeats} tone="battle" />
        </div>
      </section>

      <LiveFeed initialEvents={events} initialWatchedSpecies={watchedSpecies} />
    </div>
  );
}
