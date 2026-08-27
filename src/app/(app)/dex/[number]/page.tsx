import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPokedexEntry, POKEDEX, TYPE_LABELS } from "@/lib/pokedex";
import { PokemonSprite } from "@/components/PokemonSprite";
import { ChevronMark } from "@/components/icons/Chevron";

interface PageProps {
  params: Promise<{ number: string }>;
}

export function generateStaticParams() {
  return POKEDEX.map((entry) => ({ number: String(entry.number) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { number } = await params;
  const entry = getPokedexEntry(Number(number));
  return { title: entry ? entry.name : "Pokémon não encontrado" };
}

/**
 * Ficha de um Pokémon — identidade 01. Sprite, descrição e onde encontrar.
 * Raridade não entra na Dex de propósito (decisão do usuário).
 */
export default async function DexEntryPage({ params }: PageProps) {
  const { number } = await params;
  const entry = getPokedexEntry(Number(number));
  if (!entry) notFound();

  const foundInWild = entry.biomes.length > 0;

  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/dex"
          className="mb-6 inline-flex items-center gap-1.5 font-body text-sm text-lcd/60 transition-colors hover:text-lcd"
        >
          <ChevronMark className="h-4 w-4 rotate-90" />
          Voltar pra Dex
        </Link>

        <div className="t01-screen p-5 sm:p-7">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <span className="flex h-28 w-28 shrink-0 items-center justify-center border-2 border-lcd-edge bg-lcd-sunken">
              <PokemonSprite species={entry.id} variant="animated" size={96} />
            </span>

            <div>
              <p className="font-body text-xs tabular-nums text-lcd-faint">
                #{String(entry.number).padStart(4, "0")}
              </p>
              <h1 className="font-body text-2xl font-semibold text-lcd-ink">{entry.name}</h1>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {entry.types.map((type) => (
                  <span
                    key={type}
                    className="border border-lcd-edge/35 bg-lcd-sunken px-2 py-0.5 font-body text-xs text-lcd-dim"
                  >
                    {TYPE_LABELS[type] ?? type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {entry.description && (
            <p className="mt-6 font-body text-[15px] leading-relaxed text-lcd-dim">
              {entry.description}
            </p>
          )}

          <div className="mt-6 border-t border-lcd-edge/25 pt-5">
            <p className="mb-2 font-pixel text-[9px] uppercase tracking-wider text-lcd-faint">
              Onde encontrar
            </p>
            {foundInWild || entry.hasMonument ? (
              <div className="flex flex-wrap gap-1.5">
                {entry.biomes.map((biome) => (
                  <span
                    key={biome}
                    className="border border-lcd-edge/30 bg-lcd-sunken px-2 py-0.5 font-body text-xs text-lcd-dim"
                  >
                    {biome}
                  </span>
                ))}
                {entry.hasMonument && (
                  <span
                    title="Existe um monumento lendário. Explora o mundo pra descobrir onde."
                    className="border border-ball/35 bg-ball/10 px-2 py-0.5 font-body text-xs font-semibold text-ball"
                  >
                    ?
                  </span>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-lcd-faint">Sem local de spawn registrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
