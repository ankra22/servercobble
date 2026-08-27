import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem, ITEMS } from "@/lib/items";
import { getPokedexEntry } from "@/lib/pokedex";
import { PokemonSprite } from "@/components/PokemonSprite";
import { ChevronMark } from "@/components/icons/Chevron";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return ITEMS.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getItem(id);
  return { title: item ? item.name : "Item não encontrado" };
}

function PokemonRef({ number, trailing }: { number: number; trailing?: string }) {
  const entry = getPokedexEntry(number);
  if (!entry) return <span className="font-body text-sm text-lcd-dim">#{number}</span>;
  return (
    <Link
      href={`/dex/${entry.number}`}
      className="group inline-flex items-center gap-1.5 font-body text-sm text-lcd-dim transition-colors hover:text-lcd-ink"
    >
      <span className="flex h-6 w-6 items-center justify-center border border-lcd-edge/40 bg-lcd-sunken">
        <PokemonSprite species={entry.id} variant="icon" size={20} />
      </span>
      <span className="group-hover:underline">{entry.name}</span>
      {trailing && <span className="text-lcd-faint">{trailing}</span>}
    </Link>
  );
}

/**
 * Ficha de um item — identidade 01. Efeito do jogo, quais Pokémon dropam
 * (com chance) e que evoluções o item destrava.
 */
export default async function ItemEntryPage({ params }: PageProps) {
  const { id } = await params;
  const item = getItem(id);
  if (!item) notFound();

  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/itens"
          className="mb-6 inline-flex items-center gap-1.5 font-body text-sm text-lcd/60 transition-colors hover:text-lcd"
        >
          <ChevronMark className="h-4 w-4 rotate-90" />
          Voltar pros Itens
        </Link>

        <div className="t01-screen p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-lcd-edge bg-lcd-sunken">
              {item.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 [image-rendering:pixelated]"
                />
              ) : (
                <span className="font-pixel text-xs text-lcd-faint">?</span>
              )}
            </span>
            <div>
              <p className="font-pixel text-[9px] uppercase tracking-wider text-lcd-faint">
                {item.category}
              </p>
              <h1 className="mt-1 font-body text-2xl font-semibold text-lcd-ink">{item.name}</h1>
            </div>
          </div>

          {item.effect.length > 0 && (
            <ul className="mt-5 space-y-1.5">
              {item.effect.map((line) => (
                <li key={line} className="font-body text-[15px] leading-relaxed text-lcd-dim">
                  {line}
                </li>
              ))}
            </ul>
          )}

          {item.evolves.length > 0 && (
            <div className="mt-6 border-t border-lcd-edge/25 pt-5">
              <p className="mb-2.5 font-pixel text-[9px] uppercase tracking-wider text-lcd-faint">
                Serve pra evoluir
              </p>
              <ul className="space-y-2">
                {item.evolves.map((evo) => (
                  <li key={`${evo.from}-${evo.into}`} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <PokemonRef number={evo.from} />
                    <ChevronMark className="h-3.5 w-3.5 -rotate-90 text-lcd-edge" />
                    <PokemonRef number={evo.into} />
                    <span className="border border-route/40 bg-route/10 px-1.5 py-0.5 font-body text-[11px] text-route">
                      {evo.method}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 border-t border-lcd-edge/25 pt-5">
            <p className="mb-2.5 font-pixel text-[9px] uppercase tracking-wider text-lcd-faint">
              Onde conseguir
            </p>
            {item.droppedBy.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {item.droppedBy.map((drop) => (
                  <li key={drop.number}>
                    <PokemonRef
                      number={drop.number}
                      trailing={drop.chance === "garantido" ? "· sempre" : `· ${drop.chance}`}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body text-sm text-lcd-faint">
                Nenhum Pokémon dropa esse item — vem de plantio, loja ou baú.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
