// Cliente Supabase do navegador. Usa a chave publicável (pública por definição); a segurança vem das
// regras de acesso (RLS) e das funções do banco, nunca de segredo no navegador.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lipfvnerohkaajegqvwr.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(URL, KEY, {
      // Sessão própria do produto, separada da área restrita do site.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "dm-ei-auth" },
    });
  }
  return client;
}
