"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { TrainerAvatar } from "@/components/TrainerAvatar";

interface Owner {
  username: string;
  displayName: string;
  skinUrl: string | null;
  count: number;
  shinyCount: number;
  topLevel: number;
}

interface OwnerRow {
  is_shiny: boolean;
  level: number;
  trainer: { username: string; display_name: string; skin_url: string | null } | null;
}

/**
 * Quem tem esta espécie hoje, agrupado por treinador (time + PC). Busca no
 * navegador em vez de no build: a ficha da Dex é estática e os donos mudam
 * a cada captura.
 */
export function PokemonOwners({ species }: { species: string }) {
  // `null` = carregando; `"error"` = a consulta falhou.
  const [owners, setOwners] = useState<Owner[] | "error" | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    createClient()
      .from("pokemons")
      .select("is_shiny, level, trainer:trainers(username, display_name, skin_url)")
      .eq("species", species)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Erro ao buscar donos do Pokémon:", error.message);
          setOwners("error");
          return;
        }

        const byTrainer = new Map<string, Owner>();
        for (const row of (data ?? []) as unknown as OwnerRow[]) {
          if (!row.trainer) continue;
          const owner = byTrainer.get(row.trainer.username) ?? {
            username: row.trainer.username,
            displayName: row.trainer.display_name,
            skinUrl: row.trainer.skin_url,
            count: 0,
            shinyCount: 0,
            topLevel: 0,
          };
          owner.count += 1;
          if (row.is_shiny) owner.shinyCount += 1;
          owner.topLevel = Math.max(owner.topLevel, row.level);
          byTrainer.set(row.trainer.username, owner);
        }

        setOwners(
          [...byTrainer.values()].sort(
            (a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName),
          ),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [species]);

  return (
    <div className="mt-6 border-t border-lcd-edge/25 pt-5">
      <p className="mb-2 font-pixel text-[9px] uppercase tracking-wider text-lcd-faint">
        Quem tem
      </p>

      {owners === null ? (
        <p className="font-body text-sm text-lcd-faint">Carregando…</p>
      ) : owners === "error" ? (
        <p className="font-body text-sm text-lcd-faint">Não deu pra carregar agora.</p>
      ) : owners.length === 0 ? (
        <p className="font-body text-sm text-lcd-faint">Ninguém tem esse Pokémon ainda.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {owners.map((owner) => (
            <li key={owner.username}>
              <Link
                href={`/trainers/${owner.username}`}
                className="flex items-center gap-3 border border-lcd-edge bg-lcd-sunken p-2.5 transition-colors hover:bg-lcd"
              >
                <TrainerAvatar displayName={owner.displayName} skinUrl={owner.skinUrl} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-sm font-medium text-lcd-ink">
                    {owner.displayName}
                  </span>
                  <span className="block truncate font-body text-xs text-lcd-faint">
                    Nv. {owner.topLevel}
                    {owner.count > 1 && ` · ${owner.count} deles`}
                  </span>
                </span>
                {owner.shinyCount > 0 && (
                  <span className="shrink-0 border border-[#9a6b12]/50 bg-[#9a6b12]/15 px-1.5 py-0.5 font-body text-[11px] font-semibold text-[#9a6b12]">
                    shiny
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
