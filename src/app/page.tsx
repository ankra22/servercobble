import { Backpack, Sparkles, Swords, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchFeedEvents } from "@/lib/queries/feed";
import { getServerStats } from "@/lib/queries/stats";
import { isSupabaseConfigured } from "@/lib/env";
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
  const [events, stats] = await Promise.all([fetchFeedEvents(supabase, { limit: 30 }), getServerStats(supabase)]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <section className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Feed do servidor</h1>
        <p className="mt-1.5 text-sm text-ink-dim">
          Capturas, shinies, evoluções e batalhas de ginásio, direto dos logs — sem atualizar a página.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Users} label="Treinadores" value={stats.trainerCount} tone="brand" />
          <StatTile icon={Backpack} label="Capturas hoje" value={stats.capturesToday} tone="capture" />
          <StatTile icon={Sparkles} label="Shinies no servidor" value={stats.shinyCount} tone="shiny" />
          <StatTile icon={Swords} label="Ginásios vencidos" value={stats.gymDefeats} tone="battle" />
        </div>
      </section>

      <LiveFeed initialEvents={events} />
    </div>
  );
}
