"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Trainer } from "@/lib/database.types";
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
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar treinador por nome ou username…"
          className="w-full rounded-xl border border-border bg-panel/60 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-brand/40 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-faint">
          Nenhum treinador encontrado.
        </div>
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
