"use client";

import { useState } from "react";
import Image from "next/image";
import { pokemonIconUrl, pokemonSpriteUrl } from "@/lib/pokemon-sprite";

interface PokemonSpriteProps {
  species: string;
  isShiny?: boolean;
  /** "icon" = miniatura pra chips/listas · "animated" = sprite animado maior */
  variant?: "icon" | "animated";
  size?: number;
  className?: string;
}

/**
 * Sprite vindo do Pokémon Showdown. Como nem toda espécie/forma tem sprite
 * disponível lá (formas regionais custom do Cobblemon, por ex.), o
 * componente some silenciosamente em caso de erro em vez de mostrar um
 * ícone de imagem quebrada.
 */
export function PokemonSprite({ species, isShiny = false, variant = "icon", size = 24, className = "" }: PokemonSpriteProps) {
  const [errored, setErrored] = useState(false);

  if (errored) return null;

  const src = variant === "icon" ? pokemonIconUrl(species) : pokemonSpriteUrl(species, isShiny);

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={`pixelated object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
    />
  );
}
