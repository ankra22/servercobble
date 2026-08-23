export interface RegionInfo {
  /** Bate com o id de série do rctmod (ver feed_events.series). */
  id: string;
  name: string;
  description: string;
  image: string;
}

/**
 * As 4 regiões com progressão real no datapack RCT do Cobbleverse
 * (`COBBLEVERSE-RCT-DP`) — kanto → johto → hoenn → sinnoh, cada uma exigindo
 * a anterior completa (`requiredSeries`). Ordem aqui é a ordem de progressão.
 */
export const REGIONS: RegionInfo[] = [
  {
    id: "kanto",
    name: "Kanto",
    description: "Onde tudo começa — a primeira jornada do servidor.",
    image: "/regions/kanto.jpg",
  },
  {
    id: "johto",
    name: "Johto",
    description: "A aventura continua pelo coração de Johto.",
    image: "/regions/johto.jpg",
  },
  {
    id: "hoenn",
    name: "Hoenn",
    description: "Uma jornada épica pela vibrante região de Hoenn.",
    image: "/regions/hoenn.jpg",
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    description: "Uma aventura lendária começa em Sinnoh.",
    image: "/regions/sinnoh.jpg",
  },
];

export function getRegion(id: string): RegionInfo | undefined {
  return REGIONS.find((region) => region.id === id);
}
