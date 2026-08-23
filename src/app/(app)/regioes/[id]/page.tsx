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
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const progress = await getRegionProgress(supabase, region.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/regioes"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-faint transition-colors hover:text-ink"
      >
        <ChevronMark className="h-4 w-4 rotate-90" />
        Voltar pras regiões
      </Link>

      <section
        className="mb-8 overflow-hidden rounded-3xl border border-border bg-panel/60 bg-cover bg-center px-6 py-10 sm:px-8 sm:py-14"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(6,0,16,0.35), rgba(6,0,16,0.85)), url(${region.image})` }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{region.name}</h1>
        <p className="mt-1.5 max-w-md text-sm text-white/80">{region.description}</p>
      </section>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-dim">
        Treinadores em {region.name}
      </h2>

      {progress.length === 0 ? (
        <p className="rounded-2xl border border-border bg-panel/60 p-6 text-sm text-ink-faint">
          Ninguém venceu um ginásio dessa região ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {progress.map(({ trainer, badges }) => {
            const current = badges[badges.length - 1];
            return (
              <Link
                key={trainer.id}
                href={`/trainers/${trainer.username}`}
                className="group rounded-2xl border border-border bg-panel/60 p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-panel-hover"
              >
                <div className="flex items-center gap-3.5">
                  <TrainerAvatar displayName={trainer.display_name} skinUrl={trainer.skin_url} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink transition-colors group-hover:text-brand">
                      {trainer.display_name}
                    </p>
                    <p className="text-xs text-ink-faint">
                      Ginásio atual: <span className="text-battle">{current.gymLeaderName}</span>
                      <span className="ml-1 text-ink-faint">· {formatDate(current.defeatedAt)}</span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-battle-dim/40 px-2.5 py-1 text-xs font-medium text-battle">
                    {badges.length} insígnia{badges.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 pl-[59px]">
                  {badges.map((badge) => (
                    <span
                      key={badge.gymLeaderName}
                      className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs text-ink-dim"
                    >
                      {badge.gymLeaderName}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
