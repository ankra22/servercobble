export type Tone = "brand" | "rare" | "capture" | "battle" | "evolution" | "levelup" | "shiny" | "watch";

/**
 * Classes Tailwind escritas por extenso para cada tom, indexadas por chave.
 * Necessário porque o Tailwind só reconhece classes literais no código-fonte
 * — `text-${tone}` interpolado dinamicamente não seria incluído no build.
 */
export const TONE_CLASSES: Record<Tone, { text: string; softBg: string; softBorder: string; dot: string; ring: string; edge: string }> = {
  brand: {
    text: "text-brand",
    softBg: "bg-brand-dim/40",
    softBorder: "border-brand/25",
    dot: "bg-brand",
    ring: "ring-brand/30",
    edge: "bg-brand/45",
  },
  rare: {
    text: "text-rare",
    softBg: "bg-rare-dim/40",
    softBorder: "border-rare/25",
    dot: "bg-rare",
    ring: "ring-rare/30",
    edge: "bg-rare/45",
  },
  capture: {
    text: "text-capture",
    softBg: "bg-capture-dim/40",
    softBorder: "border-capture/25",
    dot: "bg-capture",
    ring: "ring-capture/30",
    edge: "bg-capture/45",
  },
  battle: {
    text: "text-battle",
    softBg: "bg-battle-dim/40",
    softBorder: "border-battle/25",
    dot: "bg-battle",
    ring: "ring-battle/30",
    edge: "bg-battle/45",
  },
  evolution: {
    text: "text-evolution",
    softBg: "bg-evolution-dim/40",
    softBorder: "border-evolution/25",
    dot: "bg-evolution",
    ring: "ring-evolution/30",
    edge: "bg-evolution/45",
  },
  levelup: {
    text: "text-levelup",
    softBg: "bg-levelup-dim/40",
    softBorder: "border-levelup/25",
    dot: "bg-levelup",
    ring: "ring-levelup/30",
    edge: "bg-levelup/45",
  },
  shiny: {
    text: "text-shiny",
    softBg: "bg-shiny-dim/40",
    softBorder: "border-shiny/25",
    dot: "bg-shiny",
    ring: "ring-shiny/30",
    edge: "bg-shiny/45",
  },
  watch: {
    text: "text-watch",
    softBg: "bg-watch-dim/40",
    softBorder: "border-watch/25",
    dot: "bg-watch",
    ring: "ring-watch/30",
    edge: "bg-watch/45",
  },
};
