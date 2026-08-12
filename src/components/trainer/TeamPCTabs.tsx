"use client";

import { useState } from "react";
import type { Pokemon } from "@/lib/database.types";
import { PokemonCard } from "@/components/trainer/PokemonCard";

export function TeamPCTabs({ team, pc }: { team: Pokemon[]; pc: Pokemon[] }) {
  const [tab, setTab] = useState<"team" | "pc">("team");
  const active = tab === "team" ? team : pc;

  return (
    <div>
      <div className="flex gap-1 rounded-xl border border-border bg-panel/50 p-1">
        <TabButton active={tab === "team"} onClick={() => setTab("team")} label={`Time atual`} count={team.length} />
        <TabButton active={tab === "pc"} onClick={() => setTab("pc")} label="PC" count={pc.length} />
      </div>

      {active.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-ink-faint">
          {tab === "team" ? "Nenhum Pokémon no time no momento." : "PC vazio."}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {active.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-brand-dim/50 text-brand" : "text-ink-dim hover:text-ink"
      }`}
    >
      {label}
      <span className="font-data text-xs opacity-70">{count}</span>
    </button>
  );
}
