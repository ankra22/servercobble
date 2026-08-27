"use client";

import { useMemo, useState } from "react";
import type { Trainer } from "@/lib/database.types";
import { SearchMark } from "@/components/icons/Search";
import { TrainerCard } from "@/components/trainer/TrainerCard";

export function TrainerDirectory({ trainers }: { trainers: Trainer[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter(
      (t) => t.display_name.toLowerCase().includes(q) || t.username.toLowerCase().includes(q),
    );
  }, [trainers, query]);

  return (
    <div>
      <div className="relative mb-5">
        <SearchMark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lcd-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar treinador por nome ou username"
          className="t01-input w-full py-2 pl-9 pr-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-ball/50"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="font-data px-1 py-8 text-center text-[13px] text-lcd-dim">
          <span className="text-lcd-faint">&gt;</span> nenhum treinador com &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
