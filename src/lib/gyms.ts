import gymsData from "@/data/gyms.json";

export interface GymSlot {
  id: string;
  name: string;
  order: number;
  bonus: boolean;
  rank: "gym" | "elite_four" | "champion";
}

export const GYMS: Record<string, GymSlot[]> = gymsData as Record<string, GymSlot[]>;

export function getGyms(regionId: string): GymSlot[] {
  return GYMS[regionId] ?? [];
}

/**
 * Uma cor por posição de ginásio (1ª insígnia de qualquer região sempre usa
 * a mesma cor, e assim por diante) — dá uma progressão visual consistente
 * no estojo, parecido com os jogos. Ciclo de 10 cores (cobre até as regiões
 * com ginásios bônus).
 */
export const GYM_SLOT_COLORS = [
  "#a8a29e", // pedra
  "#38bdf8", // água
  "#facc15", // elétrico
  "#4ade80", // planta
  "#a78bfa", // veneno/psíquico
  "#f472b6", // psíquico/fada
  "#fb923c", // fogo
  "#78716c", // terra
  "#2dd4bf", // bônus 1
  "#f87171", // bônus 2
];

export const ELITE_FOUR_COLOR = "#818cf8";
export const CHAMPION_COLOR = "#eab308";

export function colorForGym(slot: GymSlot): string {
  if (slot.rank === "champion") return CHAMPION_COLOR;
  if (slot.rank === "elite_four") return ELITE_FOUR_COLOR;
  return GYM_SLOT_COLORS[(slot.order - 1) % GYM_SLOT_COLORS.length];
}
