"use client";

import type { FeedEventType } from "@/lib/database.types";
import { FEED_EVENT_CONFIG, FEED_EVENT_ORDER } from "@/lib/feed-events";

/**
 * Chips quadrados, aresta dura, sem pílula — a pílula arredondada era parte do
 * vocabulário genérico. O ativo inverte (tinta vira fundo) em vez de ganhar
 * uma cor de marca: assim nenhum filtro compete com o ouro, que no feed
 * significa raridade.
 */
export function FeedFilters({
  active,
  onChange,
}: {
  active: FeedEventType | "all";
  onChange: (value: FeedEventType | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por tipo de evento">
      <Chip label="Tudo" pressed={active === "all"} onClick={() => onChange("all")} />
      {FEED_EVENT_ORDER.map((type) => (
        <Chip
          key={type}
          label={FEED_EVENT_CONFIG[type].label}
          pressed={active === type}
          onClick={() => onChange(type)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className="fd-chip px-2.5 py-1.5">
      <span className="fd-pixel">{label}</span>
    </button>
  );
}
