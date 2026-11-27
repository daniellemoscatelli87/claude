import { createClient } from "@supabase/supabase-js";
import { CHAVE_SESSAO, criarArmazenamento } from "./armazenamento";

// Mesmo projeto e mesma chave pública das páginas de HTML (public/admin/admin.js). A segurança dos dados vem das
// regras de acesso do banco (RLS, papel "admin" no app_metadata), não do navegador.
export const SUPABASE_URL = "https://lipfvnerohkaajegqvwr.supabase.co";
export const SUPABASE_CHAVE_PUBLICA = "sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej";

const vazio = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const local = (() => { try { return window.localStorage; } catch { return vazio; } })();
const sessao = (() => { try { return window.sessionStorage; } catch { return vazio; } })();
export const armazenamento = criarArmazenamento(local, sessao);

export const sb = createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: CHAVE_SESSAO, storage: armazenamento },
});

/** Log da plataforma: registra uma ação da administradora (visível em Configurações). Nunca interrompe a tela. */
export async function registrar(acao: string, detalhe?: string) {
  try {
    await sb.from("admin_log").insert({ acao: acao.slice(0, 200), detalhe: detalhe ? detalhe.slice(0, 1000) : null });
  } catch {
    /* o log nunca bloqueia a tela */
  }
}
