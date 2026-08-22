"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FEED_SELECT } from "@/lib/queries/feed";
import type { FeedEvent, FeedEventType, FeedEventWithTrainer, SpawnRarity, Trainer } from "@/lib/database.types";
import { FeedEventCard } from "@/components/feed/FeedEventCard";
import { FeedFilters } from "@/components/feed/FeedFilters";
import { SpeciesFilter } from "@/components/feed/SpeciesFilter";
import { LiveDot } from "@/components/LiveDot";

const PAGE_SIZE = 30;

interface LiveFeedProps {
  initialEvents: FeedEventWithTrainer[];
  /** Quando definido, o feed mostra só os eventos deste treinador (perfil). */
  trainerId?: string;
  /** Esconde os botões de filtro por tipo — usado na versão compacta do perfil e em abas de um tipo só. */
  showFilters?: boolean;
  /** Esconde a busca por espécie — independente de `showFilters` (ex.: some no perfil, mas fica na aba de raros). */
  showSpeciesFilter?: boolean;
  emptyMessage?: string;
  /** Só mostra eventos desses tipos (ex.: ["rare_spawn"] na aba de spawns raros). */
  onlyTypes?: FeedEventType[];
  /** Esconde `rare_spawn` dessa raridade (ex.: "rare" no feed principal). */
  excludeRareSpawnRarity?: SpawnRarity;
  /** Lista de espécies salvas do usuário logado (Clerk) — cada uma destaca o card em vermelho. */
  initialWatchedSpecies?: string[];
}

export function LiveFeed({
  initialEvents,
  trainerId,
  showFilters = true,
  showSpeciesFilter = showFilters,
  emptyMessage = "Nenhum evento por aqui ainda. Assim que algo acontecer no servidor, aparece automaticamente.",
  onlyTypes,
  excludeRareSpawnRarity,
  initialWatchedSpecies = [],
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

  const belongsToThisFeed = useCallback(
    (event: FeedEvent) => {
      if (onlyTypes && !onlyTypes.includes(event.type)) return false;
      if (excludeRareSpawnRarity && event.type === "rare_spawn" && event.rarity === excludeRareSpawnRarity) {
        return false;
      }
      return true;
    },
    [onlyTypes, excludeRareSpawnRarity],
  );

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
          if (!belongsToThisFeed(row)) return;

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
    if (onlyTypes && onlyTypes.length > 0) query = query.in("type", onlyTypes);
    if (excludeRareSpawnRarity) {
      query = query.or(`type.neq.rare_spawn,rarity.neq.${excludeRareSpawnRarity}`);
    }

    const { data } = await query;
    const page = (data ?? []) as unknown as FeedEventWithTrainer[];

    setEvents((prev) => [...prev, ...page.filter((e) => !knownIds.current.has(e.id))]);
    page.forEach((e) => knownIds.current.add(e.id));
    setHasMore(page.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [supabase, events.length, trainerId, onlyTypes, excludeRareSpawnRarity]);

  const typeFiltered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const normalizedQuery = speciesQuery.trim().toLowerCase();
  const visibleEvents = normalizedQuery
    ? typeFiltered.filter((e) => e.species?.toLowerCase().includes(normalizedQuery))
    : typeFiltered;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showFilters ? <FeedFilters active={filter} onChange={setFilter} /> : <span />}
        <span className="flex items-center gap-2">
          {connected ? (
            <LiveDot />
          ) : (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-ink-faint">conectando…</span>
          )}
        </span>
      </div>

      {showSpeciesFilter && (
        <SpeciesFilter
          value={speciesQuery}
          onChange={setSpeciesQuery}
          watchedSpecies={watchedSpecies}
          onWatchedSpeciesChange={setWatchedSpecies}
        />
      )}

      {visibleEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-faint">
          {emptyMessage}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleEvents.map((event) => (
            <FeedEventCard
              key={event.id}
              event={event}
              isNew={newIds.has(event.id)}
              isWatched={Boolean(event.species) && watchedSpecies.includes(event.species!.toLowerCase())}
            />
          ))}
        </div>
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
