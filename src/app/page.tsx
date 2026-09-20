import type { Metadata } from "next";
import { LandingExperience } from "@/components/landing/LandingExperience";

export const metadata: Metadata = {
  title: "Cobblemon do Rafaum",
  description:
    "Servidor privado de Cobblemon. Um site para acompanhar em conjunto os progressos de Pokémon, status e insígnias, e construir uma comunidade juntos.",
};

export default function LandingPage() {
  return <LandingExperience />;
}
