import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Sprites animados dos Pokémon (Pokémon Showdown)
      { protocol: "https", hostname: "play.pokemonshowdown.com" },
      // Skins de jogadores Minecraft (Crafatar, MineSkin, NameMC etc.)
      { protocol: "https", hostname: "crafatar.com" },
      { protocol: "https", hostname: "mineskin.eu" },
      { protocol: "https", hostname: "textures.minecraft.net" },
      { protocol: "https", hostname: "mc-heads.net" },
    ],
  },
};

export default nextConfig;
