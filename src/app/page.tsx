import type { Metadata } from "next";
import { LandingExperience } from "@/components/landing/LandingExperience";

export const metadata: Metadata = {
  title: "Cobblemon do Rafaum",
  description:
    "Servidor privado de Cobblemon. Chegou dezembro, todo mundo de férias e online ao mesmo tempo — chegou a hora de tirar do papel aquele server de Pokémon.",
};

export default function LandingPage() {
  return <LandingExperience />;
}
