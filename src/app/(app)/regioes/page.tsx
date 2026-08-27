import type { Metadata } from "next";
import { REGIONS } from "@/lib/regions";
import { AccordionGallery } from "@/components/regions/AccordionGallery";

export const metadata: Metadata = {
  title: "Regiões",
  description: "As regiões do servidor e o progresso de cada treinador nos ginásios.",
};

export default function RegioesPage() {
  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6">
          <h1 className="font-pixel text-lg text-route">Regiões</h1>
          <p className="mt-2 max-w-md font-body text-sm text-lcd/70">
            {REGIONS.length} regiões liberadas pra progressão de treinadores no servidor. Clica numa
            pra ver quem já pegou quais insígnias.
          </p>
        </header>

        <AccordionGallery
          items={REGIONS.map((region) => ({
            image: region.image,
            label: region.name,
            link: `/regioes/${region.id}`,
          }))}
          defaultIndex={0}
          accentColor="#f2c12e"
          overlayColor="#10143a"
          textColor="#dbe0cd"
          height={480}
          radius={0}
        />
      </div>
    </div>
  );
}
