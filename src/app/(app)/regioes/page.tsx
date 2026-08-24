import type { Metadata } from "next";
import { REGIONS } from "@/lib/regions";
import { AccordionGallery } from "@/components/regions/AccordionGallery";
import { RegionsWavesBackground } from "@/components/regions/RegionsWavesBackground";

export const metadata: Metadata = {
  title: "Regiões",
  description: "As regiões do servidor e o progresso de cada treinador nos ginásios.",
};

export default function RegioesPage() {
  return (
    <>
      <RegionsWavesBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-8 rounded-3xl border border-border bg-bg/60 px-6 py-10 backdrop-blur-sm sm:px-8 sm:py-14">
          <h1 className="font-pixel text-lg text-ink sm:text-xl">Regiões</h1>
          <p className="mt-1.5 max-w-md text-sm text-ink-dim">
            {REGIONS.length} regiões liberadas pra progressão de treinadores no servidor. Clica numa pra ver
            quem já pegou quais insígnias.
          </p>
        </section>

        <AccordionGallery
          items={REGIONS.map((region) => ({
            image: region.image,
            label: region.name,
            link: `/regioes/${region.id}`,
          }))}
          defaultIndex={0}
          accentColor="#7bffb0"
          height={480}
          radius={20}
        />
      </div>
    </>
  );
}
