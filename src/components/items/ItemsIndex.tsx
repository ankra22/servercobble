"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ITEM_CATEGORY_ORDER, type Item } from "@/lib/items";
import { SearchMark } from "@/components/icons/Search";

/**
 * Índice da aba ITENS — identidade 01. Grade de ícones agrupada por categoria
 * (Evolução, Itens segurados, Bagas…), com busca por nome ou efeito.
 */
export function ItemsIndex({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.effect.some((line) => line.toLowerCase().includes(q)),
        )
      : items;

    const map = new Map<string, Item[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return ITEM_CATEGORY_ORDER.filter((category) => map.has(category)).map((category) => ({
      category,
      items: map.get(category)!,
    }));
  }, [items, query]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div>
      <div className="relative mb-5">
        <SearchMark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lcd-faint" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome ou efeito"
          className="w-full border-2 border-lcd-edge bg-lcd-sunken py-2 pl-9 pr-3 font-body text-sm text-lcd-ink placeholder:text-lcd-faint focus:outline-none focus:ring-2 focus:ring-ball/50"
        />
      </div>

      {total === 0 ? (
        <p className="py-10 text-center font-body text-sm text-lcd-dim">
          Nada com &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.category}>
              <div className="mb-2.5 flex items-baseline justify-between border-b border-lcd-edge/30 pb-1.5">
                <h2 className="font-pixel text-[9px] uppercase tracking-wider text-lcd-dim">
                  {group.category}
                </h2>
                <span className="font-body text-xs tabular-nums text-lcd-faint">
                  {group.items.length}
                </span>
              </div>

              <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/itens/${item.id}`}
                      className="group flex h-full items-center gap-2.5 border border-lcd-edge/30 bg-lcd-sunken p-2 transition-colors hover:border-ball/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ball"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-lcd-edge/40 bg-lcd">
                        {item.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.icon}
                            alt=""
                            width={24}
                            height={24}
                            className="h-6 w-6 [image-rendering:pixelated]"
                          />
                        ) : (
                          <span className="font-pixel text-[8px] text-lcd-faint">?</span>
                        )}
                      </span>
                      <span className="min-w-0 font-body text-[13px] leading-tight text-lcd-dim group-hover:text-lcd-ink">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
