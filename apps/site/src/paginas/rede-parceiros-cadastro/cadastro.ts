// Regras do cadastro na Rede de Parceiros, as mesmas do script da página de HTML: valor de cada pergunta, perguntas que
// dependem de outra, validação (com as mesmas mensagens), o que vai para a tabela "cadastros" e o rascunho guardado no
// navegador (a mesma chave e o mesmo formato, então um rascunho começado na página de HTML continua aqui).
// Só funções puras: a página (CadastroDeParceiro.tsx) guarda as respostas e chama estas funções.
import { AUT_DADOS, AUT_GALERIA, SECTIONS, type Pergunta } from "./conteudo";

/** Respostas no formato do rascunho da página de HTML: texto, opção marcada, lista de opções marcadas, itens da lista,
 *  idiomas, estado e cidade e, em `<id>__outro`, o texto da opção "Outro". */
export type Idioma = { idioma: string; nivel: string };
export type UfCidade = { uf: string; cidade: string };
export type Resposta = string | string[] | Idioma[] | UfCidade;
export type Respostas = Record<string, Resposta | undefined>;

export const PERGUNTAS: Pergunta[] = SECTIONS.flatMap((s) => s.questions);
export const TOTAL_DE_ETAPAS = SECTIONS.length;
export const RASCUNHO = "dm-parceiros-rascunho";
export const EMAIL_DUP_MSG = "Este e-mail já está cadastrado na Rede de Parceiros. Para atualizar seus dados, escreva para contato@danimoscatelli.com.br.";
export const FALHA_DE_ENVIO = "Não foi possível enviar seu cadastro. Verifique sua conexão e tente novamente.";
export const OUTRO_SEM_TEXTO = "Escreva qual é a opção “Outro”.";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Opções "Outro", "Outra especialidade", "Outros segmentos": ao marcar, abre um campo para a pessoa escrever. */
export const isOther = (o: string) => /^Outr[oa]s?\b/.test(o);
export const opcoesDe = (q: Pergunta) => q.options ?? q.groups?.flatMap((g) => g.options) ?? [];

const texto = (r: Respostas, id: string) => (typeof r[id] === "string" ? (r[id] as string) : "");
const lista = <T,>(r: Respostas, id: string) => (Array.isArray(r[id]) ? (r[id] as T[]) : []);
export const linhasDeIdioma = (r: Respostas, id: string) => lista<Idioma>(r, id).map((x) => ({ idioma: String(x?.idioma ?? "").trim(), nivel: String(x?.nivel ?? "") }));
export const ufCidade = (r: Respostas, id: string): UfCidade => {
  const v = r[id] as UfCidade | undefined;
  return { uf: v?.uf ?? "", cidade: v?.cidade ?? "" };
};

/** Link: o "https://" (ou "http://") do começo sai do que a pessoa digita e volta no valor gravado. */
export const semScheme = (v: string) => String(v || "").replace(/\s+/g, "").replace(/^(?:https?:\/\/)+/i, "").replace(/^\/+/, "");
export const withScheme = (v: string) => (semScheme(v) ? "https://" + semScheme(v) : "");
export function validUrl(v: string, host?: string) {
  try {
    const u = new URL(v);
    return /^https?:$/.test(u.protocol) && u.hostname.includes(".") && (!host || u.hostname === host || u.hostname.endsWith("." + host));
  } catch {
    return false;
  }
}

/** O valor de uma pergunta, como o value() da página de HTML (marcadas na ordem das opções). */
export function value(q: Pergunta, r: Respostas): string | string[] {
  if (q.type === "checkbox") {
    const m = lista<string>(r, q.id);
    return opcoesDe(q).filter((o) => m.includes(o));
  }
  if (q.type === "radio") return texto(r, q.id);
  if (q.type === "list") return lista<string>(r, q.id).map((i) => String(i).trim()).filter(Boolean).join("\n");
  if (q.type === "idiomas") return linhasDeIdioma(r, q.id).filter((x) => x.idioma && x.nivel).map((x) => x.idioma + ": " + x.nivel).join("\n");
  if (q.type === "url") return withScheme(texto(r, q.id));
  if (q.type === "uf_cidade") {
    const { uf, cidade } = ufCidade(r, q.id);
    return uf && cidade.trim() ? `${cidade.trim()} - ${uf}` : "";
  }
  if (q.nomeCompleto) return texto(r, q.id).trim().replace(/\s+/g, " ");
  return texto(r, q.id).trim();
}

const porId = (id: string) => PERGUNTAS.find((x) => x.id === id)!;
/** Perguntas que dependem de outra (showIf): só aparecem e só contam quando a condição vale. */
export const visible = (q: Pergunta, r: Respostas) => !q.showIf || q.showIf.test(value(porId(q.showIf.id), r) as string);
/** Conteúdo que só aparece depois de certa resposta (o link do grupo do WhatsApp). */
export const mostrarDepois = (q: Pergunta, r: Respostas) => !q.afterIf || q.afterIf(value(q, r) as string);

export const otherText = (q: Pergunta, r: Respostas) => texto(r, q.id + "__outro").trim();
export const otherChecked = (q: Pergunta, r: Respostas) => {
  const v = value(q, r);
  return (Array.isArray(v) ? v : [v]).some((o) => o && isOther(o));
};

/** Mensagem de erro padrão de cada pergunta (a mesma da página de HTML). */
export function mensagemBase(q: Pergunta) {
  if (q.errMsg) return q.errMsg;
  switch (q.type) {
    case "idiomas": return "Informe o idioma e o nível de fluência em cada linha.";
    case "list": return "Inclua ao menos um item.";
    case "url": return q.urlHost === "linkedin.com" ? "Informe o link do seu perfil no LinkedIn (ex.: https://www.linkedin.com/in/seu-perfil)." : "Informe um link válido (ex.: https://seusite.com.br).";
    case "uf_cidade": return "Selecione o estado e a cidade.";
    case "email": return "Informe um endereço de e-mail válido.";
    case "tel": return "Informe o telefone com DDD.";
    case "checkbox": return "Selecione ao menos uma opção.";
    case "radio": return "Selecione uma opção.";
    default: return "Esta pergunta é obrigatória.";
  }
}

/** Linhas de idioma com só o idioma ou só o nível (ficam marcadas com erro). */
export const idiomasIncompletos = (q: Pergunta, r: Respostas) =>
  linhasDeIdioma(r, q.id).map((x, i) => (!x.idioma !== !x.nivel ? i : -1)).filter((i) => i >= 0);

/**
 * Valida uma pergunta, na mesma ordem da página de HTML. Devolve a mensagem de erro ou null.
 * `emailJaCadastrado`: o e-mail (minúsculo) que o banco disse já estar na rede.
 */
export function validar(q: Pergunta, r: Respostas, emailJaCadastrado = ""): string | null {
  if (!visible(q, r)) return null;
  const v = value(q, r);
  let ok = true;
  if (q.required) ok = Array.isArray(v) ? v.length > 0 : v !== "";
  if (ok && q.mustInclude) ok = Array.isArray(v) && v.includes(q.mustInclude);
  if (ok && q.type === "email" && v) ok = EMAIL_RE.test(v as string);
  const emailDup = ok && q.id === "email" && !!v && !!emailJaCadastrado && emailJaCadastrado === (v as string).toLowerCase();
  if (emailDup) ok = false;
  if (ok && q.type === "idiomas") ok = idiomasIncompletos(q, r).length === 0;
  if (ok && q.type === "tel" && v) ok = (v as string).replace(/\D/g, "").length >= 10;
  const otherBad = ok && (q.type === "checkbox" || q.type === "radio") && otherChecked(q, r) && !otherText(q, r);
  if (otherBad) ok = false;
  if (ok && q.type === "url" && v) ok = validUrl(v as string, q.urlHost);
  // nome completo: pelo menos nome e sobrenome (duas palavras com duas letras ou mais)
  if (ok && q.nomeCompleto && v) ok = (v as string).split(/\s+/).filter((p) => (p.match(/\p{L}/gu) || []).length >= 2).length >= 2;
  if (ok) return null;
  return otherBad ? OUTRO_SEM_TEXTO : emailDup ? EMAIL_DUP_MSG : mensagemBase(q);
}

/** Erros de uma etapa (1 a 9): { id da pergunta: mensagem }. */
export function errosDaEtapa(etapa: number, r: Respostas, emailJaCadastrado = "") {
  const erros: Record<string, string> = {};
  for (const q of SECTIONS[etapa - 1]?.questions ?? []) {
    const e = validar(q, r, emailJaCadastrado);
    if (e) erros[q.id] = e;
  }
  return erros;
}

/** Texto a partir de um trecho em HTML, como o textContent do navegador. */
export function textoDoHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

/** LGPD: o texto exato que a pessoa viu (cada autorização com os detalhes e a nota de direitos) e o que marcou. */
export function textoDoConsentimento(marcadas: string[]) {
  const q = porId("autorizacoes");
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const html = (Object.entries(q.optionInfo ?? {}).map(([k, v]) => "<p>" + esc(k) + "</p>" + v).join("") + (q.afterHtml ?? "")).replace(/<\/(p|li)>/g, "</$1>\n");
  return q.label + "\n\n" + textoDoHtml(html).trim() + "\n\nMarcado:\n- " + marcadas.join("\n- ");
}

/** A linha gravada na tabela "cadastros" (o mesmo payload() da página de HTML). */
export function payload(r: Respostas) {
  const data: Record<string, unknown> = {};
  for (const q of PERGUNTAS) {
    const v = visible(q, r) ? value(q, r) : "";
    // store "lines": a coluna é texto; os itens marcados vão um por linha.
    if (q.store === "lines" && Array.isArray(v)) data[q.id] = v.length ? v.join("\n") : null;
    else data[q.id] = Array.isArray(v) ? v : v === "" ? null : v;
  }
  const aut = Array.isArray(data.autorizacoes) ? (data.autorizacoes as string[]) : [];
  data.autoriza_dados = aut.includes(AUT_DADOS);
  // Galeria: o banco marca a autorização quando galeria_aceite_cadastro = true (e registra o termo oficial).
  data.galeria_aceite_cadastro = aut.includes(AUT_GALERIA);
  delete data.autorizacoes;
  if (data.autoriza_dados) data.consentimento_texto = textoDoConsentimento(aut);
  const outros: Record<string, string> = {};
  for (const q of PERGUNTAS) if (otherChecked(q, r) && otherText(q, r)) outros[q.id] = otherText(q, r);
  data.outros = outros;
  return data;
}

/** Primeiro nome, com a inicial maiúscula (título "Boas-vindas, Nome!"). */
export function primeiroNome(r: Respostas) {
  const p = String(value(porId("nome"), r) || "").trim().split(/\s+/)[0];
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : "";
}

/** Rascunho guardado no navegador: { etapa, r, em }. */
export function lerRascunho(texto: string | null): { etapa: number; r: Respostas } | null {
  try {
    const d = JSON.parse(texto || "null");
    if (!d || !d.r || !d.etapa) return null;
    return { etapa: Math.min(Number(d.etapa) || 1, TOTAL_DE_ETAPAS), r: d.r };
  } catch {
    return null;
  }
}
export const gravarRascunho = (etapa: number, r: Respostas, agora = Date.now()) => JSON.stringify({ etapa, r, em: agora });
