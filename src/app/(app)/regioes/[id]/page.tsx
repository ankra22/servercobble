import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRegion, REGIONS } from "@/lib/regions";
import { getRegionProgress } from "@/lib/queries/regions";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { SetupNotice } from "@/components/SetupNotice";
import { ChevronMark } from "@/components/icons/Chevron";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return REGIONS.map((region) => ({ id: region.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const region = getRegion(id);
  return { title: region ? region.name : "Região não encontrada" };
}

export default async function RegionPage({ params }: PageProps) {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) notFound();

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-full bg-nv">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const progress = await getRegionProgress(supabase, region.id);

  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/regioes"
          className="mb-6 inline-flex items-center gap-1.5 font-body text-sm text-lcd/60 transition-colors hover:text-lcd"
        >
          <ChevronMark className="h-4 w-4 rotate-90" />
          Voltar pras regiões
        </Link>

        <section
          className="mb-6 overflow-hidden border-2 border-lcd-edge bg-cover bg-center px-6 py-10 sm:px-8 sm:py-14"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(16,20,58,0.4), rgba(16,20,58,0.88)), url(${region.image})` }}
        >
          <h1 className="font-pixel text-lg text-route sm:text-xl">{region.name}</h1>
          <p className="mt-2 max-w-md font-body text-sm text-white/85">{region.description}</p>
        </section>

        <h2 className="mb-3 font-pixel text-[10px] uppercase tracking-wide text-lcd/60">
          Treinadores em {region.name}
        </h2>

        {progress.length === 0 ? (
          <p className="font-data px-1 py-8 text-center text-[13px] text-lcd/70">
            <span className="text-lcd/45">&gt;</span> ninguém está presente nessa região agora
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {progress.map(({ trainer, badges }) => {
              const current = badges[badges.length - 1];
              return (
                <Link
                  key={trainer.id}
                  href={`/trainers/${trainer.username}`}
                  className="group border border-lcd-edge bg-lcd-sunken p-3.5 transition-colors hover:bg-lcd"
                >
                  <div className="flex items-center gap-3.5">
                    <TrainerAvatar displayName={trainer.display_name} skinUrl={trainer.skin_url} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body font-medium text-lcd-ink transition-colors group-hover:text-[#9a6b12]">
                        {trainer.display_name}
                      </p>
                      <p className="font-body text-xs text-lcd-faint">
                        {current ? (
                          <>
                            Ginásio atual: <span className="text-[#cc3f28]">{current.gymLeaderName}</span>
                            <span className="ml-1">&middot; {formatDate(current.defeatedAt)}</span>
                          </>
                        ) : (
                          "Ainda não venceu nenhum ginásio aqui."
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 bg-route px-1.5 py-0.5 font-pixel text-[8px] uppercase text-route-ink">
                      {badges.length} insígnia{badges.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pl-[59px]">
                      {badges.map((badge) => (
                        <span
                          key={badge.gymLeaderName}
                          className="border border-lcd-edge bg-lcd px-2 py-0.5 font-body text-xs text-lcd-dim"
                        >
                          {badge.gymLeaderName}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
