import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Backpack, Sparkles, Swords, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTrainerByUsername, getTrainerCounters, getTrainerPokemons } from "@/lib/queries/trainers";
import { fetchFeedEvents } from "@/lib/queries/feed";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { BadgeShelf } from "@/components/trainer/BadgeShelf";
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

  const [pokemons, counters, recentEvents] = await Promise.all([
    getTrainerPokemons(supabase, trainer.id),
    getTrainerCounters(supabase, trainer.id),
    fetchFeedEvents(supabase, { trainerId: trainer.id, limit: 15 }),
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
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-faint">
              <CalendarDays className="h-3.5 w-3.5" />
              treinador desde {formatDate(trainer.created_at)}
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
            {trainer.badges_count} badge(s)
          </p>
          <BadgeShelf count={trainer.badges_count} />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Backpack} label="Pokémon capturados" value={counters.totalCaptured} tone="capture" />
        <StatTile icon={Sparkles} label="Shinies" value={counters.shinyCount} tone="shiny" />
        <StatTile icon={Wand2} label="Evoluções" value={counters.evolutions} tone="evolution" />
        <StatTile icon={Swords} label="Ginásios vencidos" value={counters.gymDefeats} tone="battle" />
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
