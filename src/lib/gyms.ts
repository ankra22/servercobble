import gymsData from "@/data/gyms.json";

export interface GymSlot {
  id: string;
  name: string;
  order: number;
  bonus: boolean;
}

export const GYMS: Record<string, GymSlot[]> = gymsData;

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

export function colorForSlot(order: number): string {
  return GYM_SLOT_COLORS[(order - 1) % GYM_SLOT_COLORS.length];
}
