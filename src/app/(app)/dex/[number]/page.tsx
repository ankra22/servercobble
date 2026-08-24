import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPokedexEntry, POKEDEX, RARITY_LABELS, TYPE_LABELS } from "@/lib/pokedex";
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

export default async function DexEntryPage({ params }: PageProps) {
  const { number } = await params;
  const entry = getPokedexEntry(Number(number));
  if (!entry) notFound();

  const rarityLabel = entry.rarity ? RARITY_LABELS[entry.rarity] : null;
  const foundInWild = entry.biomes.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/dex"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-faint transition-colors hover:text-ink"
      >
        <ChevronMark className="h-4 w-4 rotate-90" />
        Voltar pra Dex
      </Link>

      <div className="rounded-3xl border border-border bg-panel/60 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-bg-elevated">
            <PokemonSprite species={entry.id} variant="animated" size={96} />
          </span>

          <div>
            <p className="font-data text-xs text-ink-faint">#{String(entry.number).padStart(4, "0")}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{entry.name}</h1>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {entry.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs font-medium text-ink-dim"
                >
                  {TYPE_LABELS[type] ?? type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {entry.description && (
          <p className="mt-6 text-[15px] leading-relaxed text-ink-dim">{entry.description}</p>
        )}

        <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 font-pixel text-[9px] uppercase tracking-wide text-ink-faint">Raridade</p>
            {rarityLabel ? (
              <span className="inline-flex items-center rounded-full bg-rare-dim/40 px-2.5 py-1 text-xs font-semibold text-rare">
                {rarityLabel}
              </span>
            ) : (
              <p className="text-sm text-ink-faint">Não encontrado no mundo selvagem.</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 font-pixel text-[9px] uppercase tracking-wide text-ink-faint">
              Onde encontrar
            </p>
            {foundInWild || entry.hasMonument ? (
              <div className="flex flex-wrap gap-1.5">
                {entry.biomes.map((biome) => (
                  <span
                    key={biome}
                    className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs text-ink-dim"
                  >
                    {biome}
                  </span>
                ))}
                {entry.hasMonument && (
                  <span
                    title="Explore o mundo pra descobrir."
                    className="rounded-full border border-watch/25 bg-watch-dim/30 px-2.5 py-1 text-xs font-semibold text-watch"
                  >
                    ?
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-faint">Sem local de spawn registrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
