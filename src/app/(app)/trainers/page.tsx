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
      <div className="min-h-full bg-nv">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const trainers = await listTrainers(supabase);

  return (
    <div className="min-h-full bg-nv">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6">
          <h1 className="font-pixel text-lg text-route">Treinadores</h1>
          <p className="mt-2 font-body text-sm text-lcd/70">
            {trainers.length} treinador(es) registrados no servidor.
          </p>
        </header>

        <div className="t01-screen p-4 sm:p-5">
          <TrainerDirectory trainers={trainers} />
        </div>
      </div>
    </div>
  );
}
