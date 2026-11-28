// Regras da pesquisa "Moda em Curitiba" (/pesquisa/moda-curitiba/), as mesmas do script da página de HTML
// (tests/referencia/pesquisa-moda.ts): perguntas do mesmo questionario.json que a função `pesquisa` usa para validar,
// condicionais, opções que encerram, rascunho, mensagens de erro e os corpos das chamadas status, verificar, parcial e
// enviar. Sem nada de tela: a página (PesquisaModa.tsx) só desenha o estado.
import Q from "../../../../../supabase/functions/pesquisa/questionario.json";

export type Opcao = { id: string; texto: string; encerra?: string; exclusiva?: boolean; outro?: boolean; regional?: string };
export type Pergunta = {
  id: string; tipo: "unica" | "multipla" | "ranking" | "escala" | "escalas" | "matriz"; texto: string; apoio?: string; max?: number; min?: number;
  opcoes?: Opcao[]; linhas?: { id: string; texto: string; apoio?: string }[]; colunas?: { id: string; texto: string }[];
  rotulo_min?: string; rotulo_max?: string; rotulo?: string; condicao?: { pergunta: string; opcoes: string[] };
  destaque?: string | string[]; apoio_negrito?: string;
};
export type Multi = { opcoes: string[]; outro?: string };
export type Perfil = Record<string, string>;
export type Estado = {
  envio: string; etapa: number; r: Record<string, unknown>; relato: string;
  nov: "" | "sim" | "nao"; nome: string; email: string; whats: string; ciente: boolean;
};
export type CampoPerfil = {
  id: string; texto: string; opcoes: Opcao[]; tipo?: "lista"; destaque?: string; condicao?: { campo: string; opcoes: string[] };
  inicio?: boolean; texto_inicio?: string; destaque_inicio?: string;
};
export type Final = "obrigada" | "encerrada" | "semcompras" | "fora" | "ja";

export const SLUG = Q.slug;
export const TEXTO_DO_ACEITE = (Q as { identificacao: { texto: string } }).identificacao.texto;
export const PERGUNTAS = Q.perguntas as Pergunta[];
export const PERFIL = ((Q as { perfil?: CampoPerfil[] }).perfil ?? []);
export const TOTAL = PERGUNTAS.length;
export const PRINCIPAIS = PERGUNTAS.filter((p) => !p.condicao).length;
export const ETAPA_RELATO = TOTAL, ETAPA_PERFIL = TOTAL + 1, ETAPA_NOV = TOTAL + 2, ETAPA_ID = TOTAL + 3;
export const API = "https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/pesquisa";
export const CHAVE_RASCUNHO = "pq-moda-rascunho-v5", CHAVE_FIM = "pq-moda-concluida";
export const RELATO_MAX = 2000;
export const RASCUNHO_DIAS = 30;
export const FALTA_MSG = "Preencha os campos em vermelho para prosseguir.";
export const LINK_PESQUISA = "https://www.danimoscatelli.com.br/pesquisa/moda-curitiba/";
export const MSG_INDICAR = "Conhece a pesquisa sobre como é procurar e comprar roupas, calçados e acessórios em Curitiba e Região Metropolitana? Leva de 5 a 8 minutos e ajuda um projeto de inovação. Participe:";

export const numero = (i: number) => PERGUNTAS.slice(0, i + 1).filter((p) => !p.condicao).length;
export const rotulo = (i: number) => PERGUNTAS[i].rotulo ?? String(numero(i));
export const etiqueta = (i: number) => (PERGUNTAS[i].condicao ? `Pergunta ${rotulo(i)}` : `Pergunta ${numero(i)} de ${PRINCIPAIS}`);
export const valores = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : v && typeof v === "object" && Array.isArray((v as Multi).opcoes) ? (v as Multi).opcoes : v == null ? [] : [String(v)];
export const opcaoQueEncerra = (E: Estado, p: Pergunta | undefined) => (p ? p.opcoes?.find((o) => o.encerra && valores(E.r[p.id]).includes(o.id)) : undefined);
export const aplica = (E: Estado, p: Pergunta) => !p.condicao || valores(E.r[p.condicao.pergunta]).some((x) => p.condicao!.opcoes.includes(x));
export const proxima = (E: Estado, i: number) => { let j = i + 1; while (j < TOTAL && !aplica(E, PERGUNTAS[j])) j++; return j; };
export const anterior = (E: Estado, i: number) => { let j = i - 1; while (j >= 0 && j < TOTAL && !aplica(E, PERGUNTAS[j])) j--; return j; };
export const encerraEm = (E: Estado) => { for (const p of PERGUNTAS) { if (aplica(E, p) && opcaoQueEncerra(E, p)) return p.id; } return null; };
export const perfilDe = (E: Estado): Perfil => (E.r.perfil as Perfil) ?? {};
export const perfilAplica = (E: Estado, c: CampoPerfil) => !c.condicao || c.condicao.opcoes.includes(perfilDe(E)[c.condicao.campo] ?? "");

export const whatsValido = (v: string) => /^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(v.replace(/\D/g, ""));
export const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const identificado = (E: Estado) => !!(E.nome.trim() && (!E.email.trim() || emailValido(E.email)) && whatsValido(E.whats) && E.ciente);

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 3) | 8).toString(16); }));
export const novo = (): Estado => ({ envio: uuid(), etapa: -1, r: {}, relato: "", nov: "", nome: "", email: "", whats: "", ciente: false });

export const guardar = (k: string, v: unknown, local = false) => { try { (local ? localStorage : sessionStorage).setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };
export const ler = <T,>(k: string, local = false): T | null => { try { const v = (local ? localStorage : sessionStorage).getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } };

/** Rascunho: respostas no aparelho (localStorage, 30 dias); a identificação só nesta sessão do navegador. */
export const lerRascunho = (): Partial<Estado> => {
  const r = ler<Partial<Estado> & { salvoEm?: number }>(CHAVE_RASCUNHO, true);
  if (!r || !r.salvoEm || Date.now() - r.salvoEm > RASCUNHO_DIAS * 864e5) return {};
  const contato = ler<Partial<Estado>>(CHAVE_RASCUNHO + "-contato") ?? {};
  return { ...r, ...contato };
};
export const salvar = (E: Estado) => {
  const { nome, email, whats, ciente, ...resto } = E;
  guardar(CHAVE_RASCUNHO, { ...resto, salvoEm: Date.now() }, true);
  guardar(CHAVE_RASCUNHO + "-contato", { nome, email, whats, ciente });
};
export const apagarRascunho = () => { try { localStorage.removeItem(CHAVE_RASCUNHO); sessionStorage.removeItem(CHAVE_RASCUNHO + "-contato"); } catch { /* sem armazenamento */ } };

/** Cidade e bairro seguem a pergunta 1: Curitiba fixa a cidade e pede o bairro; Região Metropolitana pede a cidade. */
export function perfilDaPergunta1(E: Estado): Perfil {
  const pf = { ...perfilDe(E) };
  const q1 = E.r.q1;
  if (q1 === "sim") pf.cidade = "curitiba";
  else if (pf.cidade === "curitiba" || q1 !== "rmc") delete pf.cidade;
  if (q1 !== "sim") delete pf.bairro;
  return pf;
}

/** Barra de progresso: as perguntas principais enchem a barra; as etapas extras mostram a barra cheia. */
export const progresso = (i: number) => (i === ETAPA_ID ? 0 : i < TOTAL ? Math.round(((PERGUNTAS[i].condicao ? numero(i) : numero(i) - 1) / PRINCIPAIS) * 100) : 100);
export const nomeDaEtapa = (i: number) =>
  i < TOTAL ? etiqueta(i) : i === ETAPA_ID ? "Antes de começar" : i === ETAPA_PERFIL ? "Quase lá · sobre você" : i === ETAPA_RELATO ? "Quase lá · etapa opcional" : "Última etapa";
export const textoDoBotao = (E: Estado, enviando: boolean) => {
  const i = E.etapa;
  return enviando ? (i === ETAPA_ID ? "Conferindo…" : "Enviando…") : opcaoQueEncerra(E, PERGUNTAS[i]) ? "Concluir" : i === ETAPA_NOV ? "Concluir participação" : i === ETAPA_ID ? "Começar as perguntas" : i === ETAPA_RELATO && !E.relato.trim() ? "Pular" : "Continuar";
};

/** Erros de uma etapa, com as mensagens de antes. `geral` vai embaixo da pergunta; `campos`, junto de cada campo. */
export type ErrosDaEtapa = { geral?: string; campos: Record<string, string>; faltando: string[]; avisoProprio?: boolean; primeiro?: string };
const PERFIL_FALTA: Record<string, string> = {
  cidade: "Escolha a cidade onde você mora.",
  bairro: 'Escolha o seu bairro. Se preferir, marque "Prefiro não informar" no fim da lista.',
  genero: 'Escolha uma opção. Se preferir, marque "Prefiro não informar".',
  faixa_etaria: 'Escolha sua faixa etária. Se preferir, marque "Prefiro não informar".',
  estado_civil: 'Escolha seu estado civil. Se preferir, marque "Prefiro não informar".',
};
export function errosDaEtapa(E: Estado, i: number): ErrosDaEtapa | null {
  const e: ErrosDaEtapa = { campos: {}, faltando: [] };
  if (i < TOTAL) {
    const p = PERGUNTAS[i], v = E.r[p.id];
    if (p.tipo === "unica" && typeof v !== "string") return { ...e, geral: "Escolha uma opção para continuar." };
    if (p.id === "q1") {
      const pf = perfilDe(E);
      if (v === "rmc" && !pf.cidade) return { ...e, campos: { cidade: PERFIL_FALTA.cidade }, primeiro: "cidade" };
      if (v === "sim" && !pf.bairro) return { ...e, campos: { bairro: PERFIL_FALTA.bairro }, primeiro: "bairro" };
    }
    if (p.tipo === "ranking" && !(Array.isArray(v) && v.length))
      return { ...e, geral: p.id === "q2" ? `Escolha pelo menos uma opção, na ordem de onde você mais comprou (até ${p.max}).` : `Escolha pelo menos uma opção, na ordem do que vem primeiro para você (até ${p.max}).` };
    if (p.tipo === "escala" && typeof v !== "number") return { ...e, geral: "Escolha uma nota de 0 a 10 para continuar." };
    if (p.tipo === "escalas") {
      const r = (v as Record<string, number>) ?? {};
      const faltam = p.linhas!.filter((l) => typeof r[l.id] !== "number");
      if (faltam.length) return { ...e, faltando: faltam.map((l) => l.id), geral: faltam.length === 1 ? `Falta dar nota para: ${faltam[0].texto}.` : `Faltam notas para ${faltam.length} aspectos.` };
    }
    if (p.tipo === "matriz") {
      const r = (v as Record<string, string>) ?? {};
      const faltam = p.linhas!.filter((l) => !r[l.id]);
      if (faltam.length) return { ...e, faltando: faltam.map((l) => l.id), geral: faltam.length === 1 ? `Falta responder: ${faltam[0].texto}.` : `Faltam ${faltam.length} itens para responder.` };
    }
    if (p.tipo === "multipla") {
      const m = (v as Multi) ?? { opcoes: [] };
      if (!m.opcoes.length) return { ...e, geral: "Escolha pelo menos uma opção para continuar." };
      const outro = p.opcoes!.find((o) => o.outro);
      if (outro && m.opcoes.includes(outro.id) && !(m.outro ?? "").trim())
        return { ...e, geral: 'Conte qual é a outra opção ou desmarque "' + outro.texto.replace(/ \(especifique\)/, "") + '".', primeiro: "outro" };
    }
    return null;
  }
  if (i === ETAPA_RELATO) return null;
  if (i === ETAPA_PERFIL) {
    const pf = perfilDe(E);
    for (const c of PERFIL) {
      if (c.inicio || !perfilAplica(E, c)) continue;
      const outro = c.opcoes.find((o) => o.outro);
      const msg = !pf[c.id] ? PERFIL_FALTA[c.id] ?? "Responda esta pergunta."
        : outro && pf[c.id] === outro.id && !(pf[c.id + "_outro"] ?? "").trim() ? "Conte como você se identifica ou escolha outra opção." : "";
      if (msg) { e.campos[c.id] = msg; e.primeiro ??= c.id; }
    }
    return e.primeiro ? e : null;
  }
  if (i === ETAPA_ID) {
    const checks: [string, string][] = [
      ["nome", E.nome.trim() ? "" : "Informe como podemos chamar você."],
      ["whats", !E.whats.trim() ? "Informe o seu WhatsApp com DDD." : whatsValido(E.whats) ? "" : "Confira o número. Use o DDD e o número, como (41) 99999-9999."],
      ["email", !E.email.trim() || emailValido(E.email) ? "" : "Confira o e-mail ou deixe em branco. Exemplo: seuemail@exemplo.com"],
      ["ciente", E.ciente ? "" : "Para participar, marque que você leu e concorda."],
    ];
    for (const [id, msg] of checks) if (msg) { e.campos[id] = msg; e.primeiro ??= id; }
    return e.primeiro ? e : null;
  }
  if (!E.nov) return { ...e, geral: "Escolha uma das opções para concluir." };
  return null;
}

/* ---------- Corpos das chamadas à função `pesquisa` (os mesmos da página de HTML) ---------- */
export const corpoStatus = () => JSON.stringify({ acao: "status", pesquisa: SLUG });
export const corpoVerificar = (E: Estado) => JSON.stringify({ acao: "verificar", pesquisa: SLUG, email: E.email, whatsapp: E.whats });
export function corpoParcial(E: Estado, site: string) {
  const etapa = E.etapa < TOTAL ? PERGUNTAS[E.etapa].id : E.etapa === ETAPA_PERFIL ? "perfil" : E.etapa === ETAPA_RELATO ? "relato" : "novidades";
  const respostas: Record<string, unknown> = {};
  for (const p of PERGUNTAS) if (aplica(E, p) && E.r[p.id] != null) respostas[p.id] = E.r[p.id];
  return JSON.stringify({
    acao: "parcial", pesquisa: SLUG, envio_id: E.envio, etapa, respostas, perfil: perfilDe(E), relato: E.relato,
    identificacao: { nome: E.nome, email: E.email, whatsapp: E.whats, ciente: E.ciente }, site,
  });
}
export function corpoEnviar(E: Estado, site: string, final: boolean) {
  const enc = encerraEm(E);
  const respostas: Record<string, unknown> = {};
  for (const p of PERGUNTAS) { if (aplica(E, p)) respostas[p.id] = E.r[p.id]; if (p.id === enc) break; }
  const corpo: Record<string, unknown> = {
    acao: "enviar", pesquisa: SLUG, envio_id: E.envio, respostas, site,
    identificacao: { nome: E.nome, email: E.email, whatsapp: E.whats, ciente: E.ciente },
  };
  if (final) { corpo.perfil = perfilDe(E); corpo.relato = E.relato; corpo.novidades = { quer: E.nov === "sim" }; }
  return JSON.stringify(corpo);
}
/** Tela final depois de um envio que deu certo. */
export const finalDoEnvio = (E: Estado): Final => { const enc = encerraEm(E); return enc === "q2" ? "semcompras" : enc ? "encerrada" : "obrigada"; };

/** Trechos do título em destaque (a primeira ocorrência de cada um, na ordem do texto), como `realcar` de antes. */
export function realcar(texto: string, trechos?: string | string[]): { t: string; destaque: boolean }[] {
  const lista = (Array.isArray(trechos) ? trechos : trechos ? [trechos] : []).map((x) => ({ x, k: texto.indexOf(x) })).filter((p) => p.k >= 0).sort((a, b) => a.k - b.k);
  const out: { t: string; destaque: boolean }[] = []; let pos = 0;
  for (const { x, k } of lista) { if (k < pos) continue; out.push({ t: texto.slice(pos, k), destaque: false }, { t: x, destaque: true }); pos = k + x.length; }
  out.push({ t: texto.slice(pos), destaque: false });
  return out.filter((p) => p.t !== "");
}
export const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
