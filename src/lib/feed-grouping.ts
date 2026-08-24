import type { FeedEventWithTrainer } from "@/lib/database.types";
import { parseLevelRange } from "@/lib/feed-events";

/**
 * Uma linha do trilho: ou um evento solto, ou uma corrida de level ups
 * consecutivos do mesmo pokémon colapsada numa linha só.
 */
export type FeedRow =
  | { kind: "event"; key: string; event: FeedEventWithTrainer }
  | {
      kind: "levelup-run";
      key: string;
      events: FeedEventWithTrainer[];
      from: number | null;
      to: number | null;
    };

/**
 * Chave de agrupamento. `feed_events` não guarda o `game_uuid` do pokémon,
 * só `trainer_id` + `species` — então dois Persians do mesmo treinador
 * subindo de nível na mesma sequência caem no mesmo grupo. É a granularidade
 * máxima disponível sem migração.
 */
function runKey(event: FeedEventWithTrainer): string | null {
  if (event.type !== "level_up" || !event.trainer_id || !event.species) return null;
  return `${event.trainer_id}|${event.species.toLowerCase()}`;
}

/**
 * Colapsa corridas **consecutivas** de level up — nunca eventos separados por
 * outro tipo no meio, senão a cronologia do trilho quebra. Função pura: o
 * agrupamento é derivado da lista a cada render (useMemo), então um level up
 * chegando pelo Realtime é reabsorvido pelo grupo do topo sozinho.
 *
 * Espera `events` já ordenada do mais novo pro mais velho.
 */
export function groupFeedEvents(events: FeedEventWithTrainer[]): FeedRow[] {
  const rows: FeedRow[] = [];

  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    const key = runKey(event);

    if (!key) {
      rows.push({ kind: "event", key: event.id, event });
      continue;
    }

    let end = i + 1;
    while (end < events.length && runKey(events[end]) === key) end += 1;

    const run = events.slice(i, end);
    i = end - 1;

    // Corrida de um level up só não vira grupo — é uma linha de ambiente comum.
    if (run.length < 2) {
      rows.push({ kind: "event", key: event.id, event });
      continue;
    }

    const levels = run.map((e) => parseLevelRange(e.message)).filter((l) => l !== null);

    rows.push({
      kind: "levelup-run",
      // O evento mais velho da corrida (a lista é do mais novo pro mais
      // velho, então é o último). O mais novo mudaria toda vez que um level
      // up chega ao vivo, fechando o grupo debaixo do dedo do usuário.
      key: run[run.length - 1].id,
      events: run,
      from: levels.length ? Math.min(...levels.map((l) => l.from)) : null,
      to: levels.length ? Math.max(...levels.map((l) => l.to)) : null,
    });
  }

  return rows;
}
