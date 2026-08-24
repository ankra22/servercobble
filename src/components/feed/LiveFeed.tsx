"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FEED_SELECT } from "@/lib/queries/feed";
import type { FeedEvent, FeedEventType, FeedEventWithTrainer, Trainer } from "@/lib/database.types";
import type { ServerStats } from "@/lib/queries/stats";
import { FeedTimeline } from "@/components/feed/FeedTimeline";
import { FeedFilters } from "@/components/feed/FeedFilters";
import { FeedStatusStrip } from "@/components/feed/FeedStatusStrip";
import { SpeciesFilter } from "@/components/feed/SpeciesFilter";
import { LiveDot } from "@/components/LiveDot";

const PAGE_SIZE = 30;

interface LiveFeedProps {
  initialEvents: FeedEventWithTrainer[];
  /** Quando definido, o feed mostra só os eventos deste treinador (perfil). */
  trainerId?: string;
  /** Esconde os botões de filtro por tipo e a busca por espécie — usado na versão compacta do perfil. */
  showFilters?: boolean;
  emptyMessage?: string;
  /** Lista de espécies salvas do usuário logado (Clerk) — cada uma destaca o card em vermelho. */
  initialWatchedSpecies?: string[];
  /** Quando presente, o feed abre com a faixa de status. Só a /feed passa —
   *  o indicador ao vivo mora nela porque `connected` é estado daqui. */
  stats?: ServerStats;
}

export function LiveFeed({
  initialEvents,
  trainerId,
  showFilters = true,
  emptyMessage = "Nenhum evento por aqui ainda. Assim que algo acontecer no servidor, aparece automaticamente.",
  initialWatchedSpecies = [],
  stats,
}: LiveFeedProps) {
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<FeedEventType | "all">("all");
  const [speciesQuery, setSpeciesQuery] = useState("");
  // Separada da busca (`speciesQuery`, temporária) — é a lista de espécies
  // salva de verdade, usada só pra destacar o card em vermelho quando uma
  // delas aparecer no feed, mesmo que o usuário esteja buscando outra coisa.
  const [watchedSpecies, setWatchedSpecies] = useState(initialWatchedSpecies);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialEvents.length >= PAGE_SIZE);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const trainerCache = useRef<Map<string, Pick<Trainer, "id" | "username" | "display_name" | "skin_url">>>(
    new Map(initialEvents.filter((e) => e.trainer).map((e) => [e.trainer!.id, e.trainer!])),
  );
  const knownIds = useRef<Set<string>>(new Set(initialEvents.map((e) => e.id)));

  // Observação: se `initialEvents` mudar (ex.: navegação client-side entre
  // perfis de treinadores), o componente deve ser remontado com um `key`
  // diferente pelo pai — ver uso em app/trainers/[username]/page.tsx — em
  // vez de sincronizar via effect, o que causaria renders em cascata.

  useEffect(() => {
    const channel = supabase
      .channel(trainerId ? `feed_events:trainer:${trainerId}` : "feed_events:all")
      .on<FeedEvent>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "feed_events",
          ...(trainerId ? { filter: `trainer_id=eq.${trainerId}` } : {}),
        },
        async (payload) => {
          const row = payload.new;
          if (knownIds.current.has(row.id)) return;
          knownIds.current.add(row.id);

          let trainer = row.trainer_id ? trainerCache.current.get(row.trainer_id) ?? null : null;
          if (row.trainer_id && !trainer) {
            const { data } = await supabase
              .from("trainers")
              .select("id, username, display_name, skin_url")
              .eq("id", row.trainer_id)
              .single();
            if (data) {
              trainer = data;
              trainerCache.current.set(data.id, data);
            }
          }

          const enriched: FeedEventWithTrainer = { ...row, trainer };
          setEvents((prev) => [enriched, ...prev]);
          setNewIds((prev) => new Set(prev).add(row.id));
        },
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    let query = supabase
      .from("feed_events")
      .select(FEED_SELECT)
      .order("created_at", { ascending: false })
      .range(events.length, events.length + PAGE_SIZE - 1);

    if (trainerId) query = query.eq("trainer_id", trainerId);

    const { data } = await query;
    const page = (data ?? []) as unknown as FeedEventWithTrainer[];

    setEvents((prev) => [...prev, ...page.filter((e) => !knownIds.current.has(e.id))]);
    page.forEach((e) => knownIds.current.add(e.id));
    setHasMore(page.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [supabase, events.length, trainerId]);

  const typeFiltered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const normalizedQuery = speciesQuery.trim().toLowerCase();
  const visibleEvents = normalizedQuery
    ? typeFiltered.filter((e) => e.species?.toLowerCase().includes(normalizedQuery))
    : typeFiltered;

  return (
    <div className="flex flex-col gap-4">
      {stats && <FeedStatusStrip stats={stats} connected={connected} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {showFilters ? <FeedFilters active={filter} onChange={setFilter} /> : <span />}
        {!stats && (
          <span className="flex items-center gap-2">
            {connected ? (
              <LiveDot />
            ) : (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-ink-faint">conectando…</span>
            )}
          </span>
        )}
      </div>

      {showFilters && (
        <SpeciesFilter
          value={speciesQuery}
          onChange={setSpeciesQuery}
          watchedSpecies={watchedSpecies}
          onWatchedSpeciesChange={setWatchedSpecies}
        />
      )}

      {visibleEvents.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-ink-faint">
          {emptyMessage}
        </div>
      ) : (
        <FeedTimeline events={visibleEvents} newIds={newIds} watchedSpecies={watchedSpecies} />
      )}

      {hasMore && filter === "all" && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mx-auto mt-2 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-ink-dim transition-colors hover:border-border-strong hover:text-ink disabled:opacity-50"
        >
          {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Carregar mais eventos
        </button>
      )}
    </div>
  );
}
