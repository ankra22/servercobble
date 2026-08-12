/**
 * Checagem central das variáveis de ambiente do Supabase.
 *
 * As páginas usam `isSupabaseConfigured` para mostrar uma tela de
 * instruções amigável em vez de quebrar quando o projeto ainda não foi
 * conectado (útil no primeiro `npm run dev` ou num preview da Vercel sem
 * env vars configuradas).
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
