import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { SUPABASE_URL } from "@/lib/env";

/**
 * Cliente Supabase com a service_role key — ignora RLS. Só pode ser usado
 * em código server-only (Server Actions, route handlers), nunca importado
 * por um Client Component (o import "server-only" quebra o build se isso
 * acontecer). Hoje usado só pra gravar as preferências do usuário logado
 * (Clerk) — o resto do site continua somente leitura via anon key.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  return createSupabaseClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
