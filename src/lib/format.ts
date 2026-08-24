import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventCoordinates } from "@/lib/database.types";

/** "há 3 minutos", "há 2 horas"... */
export function timeAgo(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ptBR });
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "(120, 64, -340) — overworld" */
export function formatCoordinates(coords: EventCoordinates | null): string | null {
  if (!coords || coords.x === undefined || coords.y === undefined || coords.z === undefined) {
    return null;
  }
  const base = `${Math.round(coords.x)}, ${Math.round(coords.y)}, ${Math.round(coords.z)}`;
  return coords.dimension ? `${base} · ${formatDimension(coords.dimension)}` : base;
}

export function formatDimension(dimension: string): string {
  const known: Record<string, string> = {
    overworld: "Overworld",
    the_nether: "Nether",
    nether: "Nether",
    the_end: "End",
    end: "End",
  };
  return known[dimension.toLowerCase()] ?? dimension;
}

/** capitaliza espécie/nature/ability vindos do jogo em snake_case ou lowercase. */
export function toTitleCase(value: string): string {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function speciesSlug(species: string): string {
  return species.trim().toLowerCase().replaceAll(" ", "-").replaceAll(".", "").replaceAll("'", "");
}

/* ==========================================================================
   Horário do trilho do feed. Fuso fixo de propósito: LiveFeed é client
   component mas ainda renderiza no servidor pro HTML inicial, e o servidor
   roda em UTC — sem fuso fixo o HTML sairia "22:14" e a hidratação
   reescreveria pra "19:14", com aviso de mismatch do React.
   ========================================================================== */

const FEED_TIME_ZONE = "America/Sao_Paulo";

const clockFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FEED_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

/** Chave civil "2026-08-23" no fuso do feed — pra comparar dias. */
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: FEED_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FEED_TIME_ZONE,
  day: "2-digit",
  month: "short",
});

/** "19:42" */
export function formatClock(iso: string): string {
  return clockFormatter.format(new Date(iso));
}

export function dayKey(iso: string): string {
  return dayKeyFormatter.format(new Date(iso));
}

/** "Hoje" · "Ontem" · "12 de ago" */
export function formatDayLabel(iso: string): string {
  const key = dayKey(iso);
  const now = Date.now();

  if (key === dayKeyFormatter.format(new Date(now))) return "Hoje";
  if (key === dayKeyFormatter.format(new Date(now - 86_400_000))) return "Ontem";

  return dayLabelFormatter.format(new Date(iso));
}
