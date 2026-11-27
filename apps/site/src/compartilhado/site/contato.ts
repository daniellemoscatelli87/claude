// Regras do formulário de contato (as mesmas de src/compartilhado/menu.ts), sem interface: validação, linha gravada
// em "contatos" e rascunho no navegador.
import { EMAIL_RE } from "./supabase";

export const TIPOS_DE_NEGOCIO = [
  { valor: "Um produto/serviço digital", titulo: "Um produto/serviço digital", descricao: "(SaaS, E-commerce, Marketplace, APP, Sistema, Software, etc.)" },
  { valor: "Um Negócio Físico", titulo: "Um Negócio Físico", descricao: "(Clínicas, Salões, Petshops, Hotéis, Restaurantes, Cafés e Bares, etc.)" },
  { valor: "Um Negócio Físico e Digital", titulo: "Um Negócio Físico e Digital" },
  { valor: "Outro", titulo: "Outro:" },
] as const;

export const ASSUNTOS = ["Diagnóstico ou orçamento de projeto", "Palestra, aula ou conteúdo", "Parceria ou colaboração", "Imprensa ou divulgação", "Outro"];
export const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
export const PERIODOS = ["Manhã", "Tarde", "Flexível"];

export type DadosDoContato = {
  nome: string; email: string; telefone: string; empresa: string; cargo: string;
  tipo_negocio: string; tipo_negocio_outro: string; assunto: string; mensagem: string; dias: string[]; periodo: string;
};

export const CONTATO_VAZIO: DadosDoContato = {
  nome: "", email: "", telefone: "", empresa: "", cargo: "", tipo_negocio: "", tipo_negocio_outro: "", assunto: "", mensagem: "", dias: [], periodo: "",
};

export const MENSAGEM_DE_ERRO = "Preencha os campos obrigatórios (*) e confira o e-mail e o telefone.";
export const MENSAGEM_DE_FALHA = "Não foi possível enviar sua mensagem. Verifique sua conexão e tente novamente.";

/** Campos com problema (a mesma regra da página de HTML: obrigatórios, e-mail e telefone com DDD). */
export function errosDoContato(d: DadosDoContato): (keyof DadosDoContato)[] {
  const e: (keyof DadosDoContato)[] = [];
  const t = (v: string) => v.trim();
  if (!t(d.nome)) e.push("nome");
  if (!t(d.email) || !EMAIL_RE.test(t(d.email))) e.push("email");
  if (d.telefone.replace(/\D/g, "").length < 10) e.push("telefone");
  if (!t(d.empresa)) e.push("empresa");
  if (!t(d.cargo)) e.push("cargo");
  if (!d.tipo_negocio) e.push("tipo_negocio");
  if (!d.assunto) e.push("assunto");
  if (!t(d.mensagem)) e.push("mensagem");
  if (!d.dias.length) e.push("dias");
  if (!d.periodo) e.push("periodo");
  return e;
}

/** A linha gravada na tabela "contatos" (as mesmas colunas da página de HTML). */
export function linhaDoContato(d: DadosDoContato) {
  const t = (v: string) => v.trim();
  return {
    nome: t(d.nome), email: t(d.email), telefone: t(d.telefone), empresa: t(d.empresa), cargo: t(d.cargo),
    tipo_negocio: d.tipo_negocio,
    tipo_negocio_outro: d.tipo_negocio === "Outro" ? t(d.tipo_negocio_outro) || null : null,
    assunto: d.assunto, mensagem: t(d.mensagem), dias_preferidos: d.dias, periodo: d.periodo,
  };
}

/** Rascunho no navegador (mesma chave da página de HTML; o formato antigo, com os nomes dos campos, também é lido). */
export const CHAVE_RASCUNHO = "dm-contato-rascunho";

export function lerRascunho(texto: string | null): DadosDoContato | null {
  if (!texto) return null;
  try {
    const r = JSON.parse(texto) as Record<string, unknown>;
    const s = (k: string) => (Array.isArray(r[k]) ? String((r[k] as unknown[])[0] ?? "") : typeof r[k] === "string" ? (r[k] as string) : "");
    return {
      ...CONTATO_VAZIO,
      nome: s("nome"), email: s("email"), telefone: s("telefone"), empresa: s("empresa"), cargo: s("cargo"),
      tipo_negocio: s("tipo_negocio"), tipo_negocio_outro: s("tipo_negocio_outro"), assunto: s("assunto"), mensagem: s("mensagem"),
      dias: Array.isArray(r.dias) ? (r.dias as unknown[]).map(String).filter((x) => DIAS.includes(x)) : [],
      periodo: s("periodo"),
    };
  } catch {
    return null;
  }
}
