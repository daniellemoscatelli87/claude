// Dados da Início: as mesmas consultas de public/admin/index.html.
import { sb } from "@/lib/supabase";

export const LIMITE = 15;

export type Contato = { id: string; created_at: string; nome: string | null; empresa: string | null; cargo: string | null; assunto: string | null; visualizado_em: string | null; respondido_em: string | null; reuniao_em: string | null };
export type Candidatura = { id: string; created_at: string; nome: string | null; empresa: string | null; principal_especializacao: string | null; segmentos: string[] | null; visualizado_em: string | null };
export type Lancamento = { id: string; created_at: string; email: string };

/** Totais dos cards. null = a contagem falhou (o card mostra "-", como hoje). */
export type Totais = { novas: number | null; pendentes: number | null; reunioes: number | null; parceiros7d: number | null; lancamento: number | null };

export type DadosDaInicio = {
  contatos: { linhas: Contato[]; total: number };
  candidaturas: { linhas: Candidatura[]; total: number };
  lancamento: { linhas: Lancamento[]; total: number };
  totais: Totais;
};

/** Linha de apoio de cada lista: "12 mensagens recebidas · últimas 15". */
export function resumoDaLista(total: number, um: string, varios: string, limite = LIMITE) {
  return `${total} ${total === 1 ? um : varios}` + (total > limite ? ` · últimas ${limite}` : "");
}

/** O card de mensagens leva às não respondidas quando há alguma; senão, à caixa de entrada. */
export function linkDasMensagens(pendentes: number | null) {
  return pendentes && pendentes > 0 ? "/admin/contatos/?situacao=pendentes" : "/admin/contatos/";
}

export async function carregarInicio(agora = Date.now()): Promise<DadosDaInicio> {
  const [c, p, l] = await Promise.all([
    sb.from("contatos").select("id, created_at, nome, empresa, cargo, assunto, visualizado_em, respondido_em, reuniao_em", { count: "exact" }).order("created_at", { ascending: false }).limit(LIMITE),
    sb.from("cadastros").select("id, created_at, nome, empresa, principal_especializacao, segmentos, visualizado_em", { count: "exact" }).order("created_at", { ascending: false }).limit(LIMITE),
    sb.from("notificacoes_lancamento").select("id, created_at, email", { count: "exact" }).order("created_at", { ascending: false }).limit(LIMITE),
  ]);
  const erro = c.error || p.error || l.error;
  if (erro) throw new Error(erro.message);
  const desde = new Date(agora - 7 * 864e5).toISOString();
  const contar = async (q: PromiseLike<{ error: unknown; count: number | null }>) => {
    const r = await q;
    return r.error ? null : (r.count ?? 0);
  };
  const cabeca = (t: string) => sb.from(t).select("id", { count: "exact", head: true });
  const [novas, pendentes, reunioes, parceiros7d, lancamento] = await Promise.all([
    contar(cabeca("contatos").gte("created_at", desde)),
    contar(cabeca("contatos").is("respondido_em", null)),
    contar(cabeca("contatos").not("reuniao_em", "is", null)),
    contar(cabeca("cadastros").gte("created_at", desde)),
    contar(cabeca("notificacoes_lancamento").is("avisado_em", null)),
  ]);
  return {
    contatos: { linhas: (c.data || []) as Contato[], total: c.count || 0 },
    candidaturas: { linhas: (p.data || []) as Candidatura[], total: p.count || 0 },
    lancamento: { linhas: (l.data || []) as Lancamento[], total: l.count || 0 },
    totais: { novas, pendentes, reunioes, parceiros7d, lancamento },
  };
}
