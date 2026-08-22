import { createClient } from "@/lib/supabase/server";
import { fetchFeedEvents } from "@/lib/queries/feed";
import { isSupabaseConfigured } from "@/lib/env";
import { getWatchedSpeciesList } from "@/lib/preferences";
import { LiveFeed } from "@/components/feed/LiveFeed";
import { SetupNotice } from "@/components/SetupNotice";

export const revalidate = 0;

export default async function RareSpawnsPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const [events, watchedSpecies] = await Promise.all([
    fetchFeedEvents(supabase, { limit: 30, types: ["rare_spawn"] }),
    getWatchedSpeciesList(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <section className="mb-8 rounded-3xl border border-border px-6 py-10 sm:px-8 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Spawns raros</h1>
        <p className="mt-1.5 max-w-md text-sm text-ink-dim">
          Todo Pokémon selvagem raro ou ultra-raro que apareceu no servidor — o feed principal só mostra os
          ultra-raros, aqui tem os dois.
        </p>
      </section>

      <LiveFeed
        initialEvents={events}
        onlyTypes={["rare_spawn"]}
        showFilters={false}
        showSpeciesFilter
        initialWatchedSpecies={watchedSpecies}
        emptyMessage="Nenhum spawn raro registrado ainda."
      />
    </div>
  );
}
