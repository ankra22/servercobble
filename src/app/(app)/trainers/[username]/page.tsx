import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTrainerByUsername, getTrainerCounters, getTrainerPokemons } from "@/lib/queries/trainers";
import { fetchFeedEvents } from "@/lib/queries/feed";
import { getTrainerGymProgress } from "@/lib/queries/regions";
import { REGIONS } from "@/lib/regions";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { RegionBadgeCase } from "@/components/trainer/RegionBadgeCase";
import { TeamPCTabs } from "@/components/trainer/TeamPCTabs";
import { StatTile } from "@/components/StatTile";
import { LiveFeed } from "@/components/feed/LiveFeed";
import { SetupNotice } from "@/components/SetupNotice";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isSupabaseConfigured) return { title: "Treinador" };
  const { username } = await params;
  const supabase = await createClient();
  const trainer = await getTrainerByUsername(supabase, username);
  return { title: trainer ? trainer.display_name : "Treinador não encontrado" };
}

export default async function TrainerProfilePage({ params }: PageProps) {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const { username } = await params;
  const supabase = await createClient();
  const trainer = await getTrainerByUsername(supabase, username);

  if (!trainer) notFound();

  const [pokemons, counters, recentEvents, gymProgress] = await Promise.all([
    getTrainerPokemons(supabase, trainer.id),
    getTrainerCounters(supabase, trainer.id),
    fetchFeedEvents(supabase, { trainerId: trainer.id, limit: 15 }),
    getTrainerGymProgress(supabase, trainer.id),
  ]);

  const team = pokemons.filter((p) => p.location === "team");
  const pc = pokemons.filter((p) => p.location === "pc");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-panel/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <TrainerAvatar displayName={trainer.display_name} skinUrl={trainer.skin_url} size={72} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{trainer.display_name}</h1>
            <p className="font-data text-sm text-ink-faint">@{trainer.username}</p>
            <p className="mt-1.5 text-xs text-ink-faint">treinador desde {formatDate(trainer.created_at)}</p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
            {trainer.badges_count} insígnia{trainer.badges_count === 1 ? "" : "s"}
          </p>
          {trainer.current_series && (
            <p className="text-xs text-ink-faint">
              Presente em{" "}
              <span className="text-brand">
                {REGIONS.find((r) => r.id === trainer.current_series)?.name ?? trainer.current_series}
              </span>
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Pokémon capturados" value={counters.totalCaptured} tone="capture" />
        <StatTile label="Shinies" value={counters.shinyCount} tone="shiny" />
        <StatTile label="Evoluções" value={counters.evolutions} tone="evolution" />
        <StatTile label="Ginásios vencidos" value={counters.gymDefeats} tone="battle" />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-dim">Insígnias</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REGIONS.map((region) => (
            <RegionBadgeCase
              key={region.id}
              region={region}
              earnedNames={gymProgress[region.id] ?? []}
              isCurrent={trainer.current_series === region.id}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-dim">Pokémon</h2>
          <TeamPCTabs team={team} pc={pc} />
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-dim">Atividade recente</h2>
          <LiveFeed
            key={trainer.id}
            initialEvents={recentEvents}
            trainerId={trainer.id}
            showFilters={false}
            emptyMessage="Sem atividade registrada ainda."
          />
        </section>
      </div>
    </div>
  );
}
