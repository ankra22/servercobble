"use client";

import { useState } from "react";
import type { Pokemon } from "@/lib/database.types";
import { PokemonCard } from "@/components/trainer/PokemonCard";

export function TeamPCTabs({ team, pc }: { team: Pokemon[]; pc: Pokemon[] }) {
  const [tab, setTab] = useState<"team" | "pc">("team");
  const active = tab === "team" ? team : pc;

  return (
    <div>
      <div className="flex gap-1 border border-lcd-edge bg-lcd-sunken p-1">
        <TabButton active={tab === "team"} onClick={() => setTab("team")} label="Time atual" count={team.length} />
        <TabButton active={tab === "pc"} onClick={() => setTab("pc")} label="PC" count={pc.length} />
      </div>

      {active.length === 0 ? (
        <p className="font-data mt-4 px-1 py-8 text-center text-[13px] text-lcd-dim">
          <span className="text-lcd-faint">&gt;</span>{" "}
          {tab === "team" ? "nenhum Pokémon no time no momento" : "PC vazio"}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2">
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
      className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 font-body text-sm font-medium transition-colors ${
        active ? "bg-lcd text-lcd-ink shadow-[inset_0_-2px_0_var(--color-route)]" : "text-lcd-dim hover:text-lcd-ink"
      }`}
    >
      {label}
      <span className="font-data text-xs opacity-70">{count}</span>
    </button>
  );
}
