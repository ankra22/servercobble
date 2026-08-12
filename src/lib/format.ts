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
