// Gravação dos formulários do site no Supabase (a mesma URL e a mesma chave publicável das páginas de HTML).
// As tabelas só aceitam inserção pelo site (RLS); a leitura é da área restrita.
export const SUPABASE_URL = "https://lipfvnerohkaajegqvwr.supabase.co";
export const SUPABASE_CHAVE = "sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Insere uma linha. `aceitarRepetido`: o 409 (linha com o mesmo identificador de envio já gravada, num reenvio depois
 * de falha de rede) conta como sucesso. `tempoLimite` em ms (0 = sem limite).
 */
export async function inserir(tabela: string, linha: Record<string, unknown>, { aceitarRepetido = false, tempoLimite = 0, buscar = fetch } = {}) {
  const controle = new AbortController();
  const timer = tempoLimite ? setTimeout(() => controle.abort(), tempoLimite) : undefined;
  try {
    const res = await buscar(`${SUPABASE_URL}/rest/v1/${tabela}`, {
      method: "POST",
      headers: { apikey: SUPABASE_CHAVE, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(linha),
      signal: controle.signal,
    });
    if (res.ok || (aceitarRepetido && res.status === 409)) return;
    throw new Error(`HTTP ${res.status}`);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
