import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Cliente Supabase para uso em Server Components / route handlers.
 * Somente leitura (anon key) — não há autenticação de usuário neste site,
 * então os cookies só existem por causa da assinatura do @supabase/ssr.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado a partir de um Server Component sem permissão de escrita
          // em cookies — inofensivo aqui, pois não usamos sessão.
        }
      },
    },
  });
}
