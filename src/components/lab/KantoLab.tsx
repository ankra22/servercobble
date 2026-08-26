"use client";

import dynamic from "next/dynamic";

// Carrega o three.js só nesta página, fora do bundle inicial do site.
const KantoDiorama = dynamic(
  () => import("@/components/lab/KantoDiorama").then((m) => m.KantoDiorama),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#8ec7ea] font-data text-sm text-black/60">
        carregando cenário…
      </div>
    ),
  },
);

export function KantoLab() {
  return <KantoDiorama />;
}
