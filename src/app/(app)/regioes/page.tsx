import type { Metadata } from "next";
import { REGIONS } from "@/lib/regions";
import { AccordionGallery } from "@/components/regions/AccordionGallery";

export const metadata: Metadata = {
  title: "Regiões",
  description: "As regiões do servidor e o progresso de cada treinador nos ginásios.",
};

export default function RegioesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-8 rounded-3xl border border-border px-6 py-10 sm:px-8 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Regiões</h1>
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
        accentColor="#2dd4bf"
        height={480}
        radius={20}
      />
    </div>
  );
}
