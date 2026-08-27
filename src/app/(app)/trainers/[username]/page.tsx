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
import { ChevronMark } from "@/components/icons/Chevron";
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
      <div className="min-h-full bg-nv">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SetupNotice />
        </div>
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
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="t01-screen flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <TrainerAvatar displayName={trainer.display_name} skinUrl={trainer.skin_url} size={72} />
            <div>
              <h1 className="font-body text-xl font-semibold text-lcd-ink sm:text-2xl">{trainer.display_name}</h1>
              <p className="font-data text-sm text-lcd-faint">@{trainer.username}</p>
              <p className="mt-1.5 font-body text-xs text-lcd-faint">
                treinador desde {formatDate(trainer.created_at)}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="mb-1.5 font-pixel text-[9px] uppercase tracking-wide text-lcd-faint">
              {trainer.badges_count} insígnia{trainer.badges_count === 1 ? "" : "s"}
            </p>
            {trainer.current_series && (
              <p className="font-body text-xs text-lcd-faint">
                Presente em{" "}
                <span className="font-medium text-[#9a6b12]">
                  {REGIONS.find((r) => r.id === trainer.current_series)?.name ?? trainer.current_series}
                </span>
              </p>
            )}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatTile label="Pokémon capturados" value={counters.totalCaptured} />
          <StatTile label="Shinies" value={counters.shinyCount} gold />
          <StatTile label="Evoluções" value={counters.evolutions} />
          <StatTile label="Ginásios vencidos" value={counters.gymDefeats} />
        </section>

        <details className="group t01-screen mt-6">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 [&::-webkit-details-marker]:hidden">
            <h2 className="font-pixel text-[10px] uppercase tracking-wide text-lcd-dim">Insígnias</h2>
            <span className="flex items-center gap-2 font-body text-xs text-lcd-faint">
              {trainer.badges_count} conquistada{trainer.badges_count === 1 ? "" : "s"}
              <ChevronMark className="h-4 w-4 [color:var(--color-lcd-faint)] transition-transform duration-200 group-open:rotate-180" />
            </span>
          </summary>
          <div className="grid grid-cols-1 gap-3 p-4 pt-0 sm:grid-cols-2">
            {REGIONS.map((region) => (
              <RegionBadgeCase
                key={region.id}
                region={region}
                earnedNames={gymProgress[region.id] ?? []}
                isCurrent={trainer.current_series === region.id}
              />
            ))}
          </div>
        </details>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <h2 className="mb-3 font-pixel text-[10px] uppercase tracking-wide text-lcd/60">Pokémon</h2>
            <TeamPCTabs team={team} pc={pc} />
          </section>

          <section className="lg:col-span-2">
            <h2 className="mb-3 font-pixel text-[10px] uppercase tracking-wide text-lcd/60">Atividade recente</h2>
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
    </div>
  );
}
