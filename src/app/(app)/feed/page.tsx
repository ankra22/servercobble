import { createClient } from "@/lib/supabase/server";
import { fetchFeedEvents } from "@/lib/queries/feed";
import { getServerStats } from "@/lib/queries/stats";
import { isSupabaseConfigured } from "@/lib/env";
import { LiveFeed } from "@/components/feed/LiveFeed";
import { SetupNotice } from "@/components/SetupNotice";

export const revalidate = 0;

export default async function HomePage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-full bg-nv">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const [events, stats] = await Promise.all([
    fetchFeedEvents(supabase, { limit: 30 }),
    getServerStats(supabase),
  ]);

  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Sem herói: a faixa de status (com o h1 e os contadores) é renderizada
            dentro do LiveFeed, que é quem sabe se o Realtime está conectado. */}
        <LiveFeed initialEvents={events} stats={stats} />
      </div>
    </div>
  );
}
