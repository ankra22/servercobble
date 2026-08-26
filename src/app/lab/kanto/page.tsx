import type { Metadata } from "next";
import { KantoLab } from "@/components/lab/KantoLab";

export const metadata: Metadata = {
  title: "Lab · Cenário de Kanto",
  description: "Teste de viabilidade — landing em cenários voxel navegáveis no scroll.",
  robots: { index: false, follow: false },
};

export default function KantoLabPage() {
  return <KantoLab />;
}
