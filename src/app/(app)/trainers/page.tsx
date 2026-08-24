import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listTrainers } from "@/lib/queries/trainers";
import { isSupabaseConfigured } from "@/lib/env";
import { TrainerDirectory } from "@/components/trainer/TrainerDirectory";
import { SetupNotice } from "@/components/SetupNotice";

export const metadata: Metadata = { title: "Treinadores" };
export const revalidate = 0;

export default async function TrainersPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const trainers = await listTrainers(supabase);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-pixel text-lg text-ink sm:text-xl">Treinadores</h1>
      <p className="mt-1.5 text-sm text-ink-dim">{trainers.length} treinador(es) registrados no servidor.</p>

      <div className="mt-6">
        <TrainerDirectory trainers={trainers} />
      </div>
    </div>
  );
}
