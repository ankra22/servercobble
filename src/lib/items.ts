import itemsData from "@/data/items.json";

export interface ItemDrop {
  /** Número nacional do Pokémon que dropa. */
  number: number;
  name: string;
  /** "5%", "2.5%" ou "garantido". */
  chance: string;
}

export interface ItemEvolution {
  /** Número do Pokémon que evolui. */
  from: number;
  /** Número do resultado. */
  into: number;
  /** Método em pt-BR ("Troca, segurando Pedra Rei"). */
  method: string;
}

export interface Item {
  /** id sem namespace, ex.: "thunder_stone". */
  id: string;
  name: string;
  /** "Evolução" | "Itens segurados" | "Bagas" | … */
  category: string;
  /** Linhas de tooltip do jogo (pt-BR). Pode ser vazio. */
  effect: string[];
  /** Caminho do ícone em /public, ou null se o Cobblemon não tem textura. */
  icon: string | null;
  droppedBy: ItemDrop[];
  evolves: ItemEvolution[];
}

export const ITEMS: Item[] = itemsData as Item[];

export function getItem(id: string): Item | undefined {
  return ITEMS.find((item) => item.id === id);
}

/** Ordem em que as categorias aparecem na aba. */
export const ITEM_CATEGORY_ORDER = [
  "Evolução",
  "Itens segurados",
  "Bagas",
  "Gemas de tipo",
  "Itens de batalha",
  "Hortelãs",
  "Remédios",
  "Outros",
];

export function itemsByCategory(): Array<{ category: string; items: Item[] }> {
  const map = new Map<string, Item[]>();
  for (const item of ITEMS) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return ITEM_CATEGORY_ORDER.filter((category) => map.has(category)).map((category) => ({
    category,
    items: map.get(category)!,
  }));
}
