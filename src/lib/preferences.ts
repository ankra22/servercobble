"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Lista de espécies que o usuário logado marcou como "de olho" — vazia se deslogado. */
export async function getWatchedSpeciesList(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("watched_species")
    .select("species")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar espécies observadas:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.species);
}

/** Adiciona uma espécie à lista do usuário logado (sem duplicar). */
export async function addWatchedSpecies(species: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Você precisa estar logado pra salvar isso." };
  }

  const normalized = species.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, error: "Digite uma espécie primeiro." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("watched_species")
    .upsert({ clerk_user_id: userId, species: normalized }, { onConflict: "clerk_user_id,species", ignoreDuplicates: true });

  if (error) {
    console.error("Erro ao adicionar espécie observada:", error.message);
    return { ok: false, error: "Não deu pra salvar agora, tenta de novo." };
  }

  return { ok: true };
}

/** Remove uma espécie da lista do usuário logado. */
export async function removeWatchedSpecies(species: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Você precisa estar logado." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("watched_species")
    .delete()
    .eq("clerk_user_id", userId)
    .eq("species", species.trim().toLowerCase());

  if (error) {
    console.error("Erro ao remover espécie observada:", error.message);
    return { ok: false, error: "Não deu pra remover agora, tenta de novo." };
  }

  return { ok: true };
}
