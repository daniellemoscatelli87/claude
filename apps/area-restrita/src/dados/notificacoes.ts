// Notificações do sino e contadores do menu: as mesmas consultas e regras de public/admin/admin.js.
// Não lidas: mensagens de contato não abertas (novas ou com resposta nova do contato), candidaturas não vistas,
// e-mails da Rede de Parceiros abertos ou clicados ainda não vistos e respostas novas das pesquisas.
// Já visualizadas: as dos últimos 30 dias, abaixo das novas.
import { sb } from "@/lib/supabase";

export type TipoDeAviso = "contato" | "parceiro" | "email-aberto" | "email-clicado" | "pesquisa";
export type Aviso = { href: string; quando: string; texto: string; detalhe?: string | null; tipo: TipoDeAviso };
export type Contadores = { contatos: number; parceiros: number; emails: number; projetos: number };
export type Notificacoes = { contadores: Contadores; novas: Aviso[]; vistas: Aviso[]; total: number };

export const SEM_NOTIFICACOES: Notificacoes = { contadores: { contatos: 0, parceiros: 0, emails: 0, projetos: 0 }, novas: [], vistas: [], total: 0 };

type Linha = Record<string, unknown> & { id?: string; nome?: string | null; created_at: string };
type Email = { id: string; cadastro_id: string; assunto?: string | null; aberto_em?: string | null; clicado_em?: string | null; cadastros?: { nome?: string | null } | null };
type Resposta = { pesquisa: string; nome?: string | null; created_at: string; atualizado_em?: string | null };

export type Brutos = {
  contatos: Linha[]; contatosCount: number;
  parceiros: Linha[]; parceirosCount: number;
  contatosVistos: Linha[]; parceirosVistos: Linha[];
  emails: Email[]; emailsCount: number; emailsVistos: Email[];
  respostas: Resposta[]; respostasCount: number; respostasVistas: Resposta[];
  pesquisas: { slug: string; titulo: string }[];
  /** Resposta mais recente recebida de cada contato não lido (contato_id → data). */
  ultimaResposta: Map<string, string>;
};

const ordem = (a: Aviso, b: Aviso) => new Date(b.quando).getTime() - new Date(a.quando).getTime();

/** Monta a lista do sino a partir das consultas (função pura, testada em tests/notificacoes.test.ts). */
export function montarNotificacoes(b: Brutos): Notificacoes {
  const titulo = Object.fromEntries(b.pesquisas.map((x) => [x.slug, x.titulo]));
  const pesquisa = (x: Resposta): Aviso => ({
    href: "/admin/pesquisas/?p=" + encodeURIComponent(x.pesquisa),
    quando: x.atualizado_em || x.created_at,
    texto: (x.nome || "Alguém") + " respondeu a pesquisa",
    detalhe: titulo[x.pesquisa] || x.pesquisa,
    tipo: "pesquisa",
  });
  const email = (x: Email): Aviso => {
    const nome = x.cadastros?.nome || "Parceiro";
    const clicou = !!x.clicado_em;
    return {
      href: "/admin/parceiros/?id=" + x.cadastro_id + "#emails",
      quando: (clicou ? x.clicado_em : x.aberto_em) as string,
      texto: nome + (clicou ? " clicou no link do e-mail" : " abriu o e-mail"),
      detalhe: x.assunto,
      tipo: clicou ? "email-clicado" : "email-aberto",
    };
  };
  const contadores: Contadores = { contatos: b.contatosCount, parceiros: b.parceirosCount, emails: b.emailsCount, projetos: b.respostasCount };
  const novas = [
    ...b.contatos.map((x): Aviso => {
      const resposta = b.ultimaResposta.get(String(x.id));
      return { href: "/admin/contatos/?id=" + x.id, quando: resposta || x.created_at, texto: (resposta ? "Nova resposta de " : "Nova mensagem de ") + (x.nome || "contato"), detalhe: x.assunto as string, tipo: "contato" };
    }),
    ...b.parceiros.map((x): Aviso => ({ href: "/admin/parceiros/?id=" + x.id, quando: x.created_at, texto: "Nova candidatura de " + (x.nome || "parceiro"), detalhe: x.principal_especializacao as string, tipo: "parceiro" })),
    ...b.emails.map(email),
    ...b.respostas.map(pesquisa),
  ].sort(ordem);
  const vistas = [
    ...b.contatosVistos.map((x): Aviso => ({ href: "/admin/contatos/?id=" + x.id, quando: x.created_at, texto: "Mensagem de " + (x.nome || "contato"), detalhe: x.assunto as string, tipo: "contato" })),
    ...b.parceirosVistos.map((x): Aviso => ({ href: "/admin/parceiros/?id=" + x.id, quando: x.created_at, texto: "Candidatura de " + (x.nome || "parceiro"), detalhe: x.principal_especializacao as string, tipo: "parceiro" })),
    ...b.emailsVistos.filter((x) => x.aberto_em || x.clicado_em).map(email),
    ...b.respostasVistas.map(pesquisa),
  ].sort(ordem).slice(0, 30);
  const total = contadores.contatos + contadores.parceiros + contadores.emails + contadores.projetos;
  return { contadores, novas, vistas, total };
}

/** Busca no banco e monta as notificações. Em caso de erro, devolve tudo zerado (como as páginas de HTML). */
export async function carregarNotificacoes(): Promise<Notificacoes> {
  try {
    const desde = new Date(Date.now() - 30 * 864e5).toISOString();
    const emailsSel = "id, cadastro_id, assunto, aberto_em, clicado_em, cadastros(nome)";
    const [c, p, cv, pv, ev, evv, pr, prv, ps] = await Promise.all([
      sb.from("contatos").select("id, nome, assunto, created_at", { count: "exact" }).is("visualizado_em", null).order("created_at", { ascending: false }).limit(200),
      sb.from("cadastros").select("id, nome, principal_especializacao, created_at", { count: "exact" }).is("visualizado_em", null).order("created_at", { ascending: false }).limit(200),
      sb.from("contatos").select("id, nome, assunto, created_at").not("visualizado_em", "is", null).gte("created_at", desde).order("created_at", { ascending: false }).limit(30),
      sb.from("cadastros").select("id, nome, principal_especializacao, created_at").not("visualizado_em", "is", null).gte("created_at", desde).order("created_at", { ascending: false }).limit(30),
      sb.from("email_envios").select(emailsSel, { count: "exact" }).is("visualizado_em", null).or("aberto_em.not.is.null,clicado_em.not.is.null").order("created_at", { ascending: false }).limit(200),
      sb.from("email_envios").select(emailsSel).not("visualizado_em", "is", null).gte("visualizado_em", desde).order("visualizado_em", { ascending: false }).limit(30),
      sb.from("pesquisa_respostas").select("pesquisa, nome, created_at, atualizado_em", { count: "exact" }).is("visualizado_em", null).neq("situacao", "parcial").order("created_at", { ascending: false }).limit(200),
      sb.from("pesquisa_respostas").select("pesquisa, nome, created_at, atualizado_em").not("visualizado_em", "is", null).neq("situacao", "parcial").gte("created_at", desde).order("created_at", { ascending: false }).limit(30),
      sb.from("pesquisas").select("slug, titulo"),
    ]);
    const contatos = (c.data || []) as Linha[];
    const ultimaResposta = new Map<string, string>();
    const ids = contatos.map((x) => x.id).filter(Boolean) as string[];
    if (ids.length) {
      const { data } = await sb.from("mensagens_recebidas").select("contato_id, created_at").in("contato_id", ids).order("created_at", { ascending: false });
      for (const m of (data || []) as { contato_id: string; created_at: string }[]) if (!ultimaResposta.has(m.contato_id)) ultimaResposta.set(m.contato_id, m.created_at);
    }
    return montarNotificacoes({
      contatos, contatosCount: c.count || 0,
      parceiros: (p.data || []) as Linha[], parceirosCount: p.count || 0,
      contatosVistos: (cv.data || []) as Linha[], parceirosVistos: (pv.data || []) as Linha[],
      emails: (ev.data || []) as unknown as Email[], emailsCount: ev.count || 0, emailsVistos: (evv.data || []) as unknown as Email[],
      respostas: (pr.data || []) as Resposta[], respostasCount: pr.count || 0, respostasVistas: (prv.data || []) as Resposta[],
      pesquisas: (ps.data || []) as { slug: string; titulo: string }[],
      ultimaResposta,
    });
  } catch {
    return SEM_NOTIFICACOES;
  }
}
