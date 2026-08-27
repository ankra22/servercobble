import Link from "next/link";
import { getPokedexEntry, type PokedexEntry } from "@/lib/pokedex";
import { PokemonSprite } from "@/components/PokemonSprite";
import { ChevronMark } from "@/components/icons/Chevron";

/**
 * Linha de evolução da ficha da Dex — também é a "paginação": cada Pokémon da
 * linha (menos o atual) é um link pra ficha dele, então dá pra andar
 * pré-evolução ← atual → evolução sem voltar pro índice. Ramifica quando a
 * espécie evolui pra mais de uma coisa (Eevee, Wurmple…).
 */

function Node({ entry, current = false }: { entry: PokedexEntry; current?: boolean }) {
  const inner = (
    <>
      <span
        className={`flex h-14 w-14 items-center justify-center border-2 ${
          current ? "border-ball bg-lcd" : "border-lcd-edge bg-lcd-sunken"
        }`}
      >
        <PokemonSprite species={entry.id} variant="icon" size={44} />
      </span>
      <span className="font-body text-[10px] tabular-nums text-lcd-faint">
        #{String(entry.number).padStart(4, "0")}
      </span>
      <span
        className={`max-w-[5.5rem] truncate font-body text-xs ${
          current ? "font-semibold text-lcd-ink" : "text-lcd-dim"
        }`}
      >
        {entry.name}
      </span>
    </>
  );

  const className = "flex w-20 shrink-0 flex-col items-center gap-1 text-center";

  if (current) {
    return (
      <div className={className} aria-current="page">
        {inner}
      </div>
    );
  }
  return (
    <Link
      href={`/dex/${entry.number}`}
      className={`${className} transition-colors hover:[&_span:last-child]:text-lcd-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ball`}
    >
      {inner}
    </Link>
  );
}

function Arrow({ method }: { method: string }) {
  return (
    <span className="flex w-16 shrink-0 flex-col items-center gap-0.5 pt-4 text-center">
      <ChevronMark className="h-4 w-4 -rotate-90 text-lcd-edge" />
      <span className="font-body text-[10px] leading-tight text-lcd-faint">{method}</span>
    </span>
  );
}

export function EvolutionLine({ entry }: { entry: PokedexEntry }) {
  const prev = entry.evolution.from != null ? getPokedexEntry(entry.evolution.from) : undefined;
  const prevMethod = prev?.evolution.to.find((step) => step.number === entry.number)?.method;

  const nexts = entry.evolution.to
    .map((step) => ({ step, target: getPokedexEntry(step.number) }))
    .filter((item): item is { step: (typeof item)["step"]; target: PokedexEntry } =>
      Boolean(item.target),
    );

  if (!prev && nexts.length === 0) return null;

  return (
    <nav aria-label="Linha de evolução" className="mt-6 border-t border-lcd-edge/25 pt-5">
      <p className="mb-3 font-pixel text-[9px] uppercase tracking-wider text-lcd-faint">Evolução</p>

      <div className="flex items-start gap-1 overflow-x-auto pb-1">
        {prev && (
          <>
            <Node entry={prev} />
            {prevMethod && <Arrow method={prevMethod} />}
          </>
        )}

        <Node entry={entry} current />

        {nexts.length === 1 && (
          <>
            <Arrow method={nexts[0].step.method} />
            <Node entry={nexts[0].target} />
          </>
        )}

        {nexts.length > 1 && (
          <div className="flex flex-col gap-2">
            {nexts.map(({ step, target }) => (
              <div key={target.number} className="flex items-start gap-1">
                <Arrow method={step.method} />
                <Node entry={target} />
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
