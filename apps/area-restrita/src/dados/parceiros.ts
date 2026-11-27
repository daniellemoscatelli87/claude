// Parceiros: as mesmas regras, textos e consultas de public/admin/parceiros/index.html (A7), sem interface.
// O formulário (seções, perguntas e opções) vem de form-parceiros.json, gerado de public/admin/form-parceiros.js.
import FORM from "./form-parceiros.json";
import { plural } from "@/lib/formatar";

export type Pergunta = { id: string; n: number; label: string; type: string; options?: string[]; groups?: { title: string; options: string[] }[] };
export type Secao = { title: string; questions: Pergunta[] };
export const FORM_PARCEIROS = FORM as Secao[];

/** Uma candidatura (tabela cadastros): os campos que a página usa; o resto vem junto e aparece na candidatura. */
export type Parceiro = {
  id: string; created_at: string; nome: string | null; email: string | null; empresa: string | null; telefone?: string | null;
  cidade_estado?: string | null; principal_especializacao?: string | null; tempo_especialidade?: string | null; lideranca?: string | null;
  nivel_formacao?: string | null; areas_experiencia?: string[] | null; segmentos?: string[] | null; formatos_atuacao?: string[] | null;
  formatos_contratacao?: string[] | null; precificacao?: string | null; etapas_projeto?: string[] | null; disponibilidade_colaborar?: string | null;
  horas_semanais?: string | null; viagens?: string | null; presencial_curitiba?: string | null; idiomas?: string | null; link_portfolio?: string | null;
  linkedin?: string | null; visualizado_em?: string | null; comunicados_descadastro_em?: string | null;
  galeria_status?: "autorizado" | "recusado" | null; galeria_convite_em?: string | null; galeria_oculto?: boolean | null; galeria_foto_url?: string | null;
  galeria_cargo?: string | null; galeria_tags?: string[] | null; galeria_linkedin?: string | null; galeria_decidido_em?: string | null;
  galeria_aceite_cadastro?: boolean | null; consentimento_em?: string | null; consentimento_texto?: string | null; autoriza_dados?: boolean | null;
  certificacoes?: string | null; formacao?: string | null; outros?: Record<string, string> | null;
  [campo: string]: unknown;
};

export const Q: Record<string, Pergunta> = Object.fromEntries(FORM_PARCEIROS.flatMap((s) => s.questions).map((q) => [q.id, q]));
export const opcoesDe = (id: string) => (Q[id].groups ? Q[id].groups!.flatMap((g) => g.options) : Q[id].options || []);
export const GRUPOS_DE_AREA = Q.areas_experiencia.groups || [];
export const SECOES = FORM_PARCEIROS.map((s) => ({ titulo: s.title, campos: s.questions.map((q) => [q.id, q.n + ". " + q.label] as [string, string]) }));
export const limpar = (s: unknown) => String(s ?? "").replace(/\.$/, "");
export const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);
export const norm = (s: unknown) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const UF_NOME: Record<string, string> = { AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins" };
export const uf = (s?: string | null) => ((s || "").toUpperCase().match(/\b([A-Z]{2})\s*\.?$/) || [])[1] || "-";
const MINUSC = new Set(["de", "da", "do", "das", "dos", "e"]);
/** Tira o estado do fim ("Curitiba - PR", "Curitiba/PR", "Curitiba, PR") sem cortar nomes com hífen ("Embu-Guaçu"). */
export const cidade = (s?: string | null) =>
  (s || "").replace(/\s*([—–/,]|\s-)\s*[A-Za-z]{2}\s*\.?$/, "").split(/\s[—–-]\s|[/,]/)[0].trim().replace(/\s+/g, " ").toLowerCase().split(" ")
    .map((w, i) => (i && MINUSC.has(w) ? w : w.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("-"))).join(" ") || "Não informado";
export const comecaComSim = (v: unknown) => typeof v === "string" && v.startsWith("Sim");

/* ---------- Filtros da aba Parceiros ---------- */
export const FILTROS = [
  { id: "areas_experiencia", rotulo: "Área de experiência" },
  { id: "segmentos", rotulo: "Segmento de mercado" },
  { id: "atuacao_pj", rotulo: "Situação PJ" },
  { id: "disponibilidade_colaborar", rotulo: "Disponibilidade" },
  { id: "horas_semanais", rotulo: "Horas semanais" },
  { id: "formatos_atuacao", rotulo: "Formato de atuação" },
  { id: "tempo_especialidade", rotulo: "Tempo na especialidade" },
  { id: "uf", rotulo: "Estado", derivado: true },
] as const;
export type Filtros = Record<(typeof FILTROS)[number]["id"], string>;
export const FILTROS_VAZIOS = Object.fromEntries(FILTROS.map((f) => [f.id, ""])) as Filtros;
const BUSCA = ["nome", "email", "cidade_estado", "apresentacao", "empresa", "principal_especializacao", "atividades_entregaveis", "conhecimento_segmento", "formacao", "certificacoes", "ferramentas", "projeto_relevante"];
export const opcoesDoFiltro = (id: string, todos: Parceiro[]) =>
  id === "uf" ? [...new Set(todos.map((r) => uf(r.cidade_estado)))].sort() : opcoesDe(id);
export function filtrar(todos: Parceiro[], busca: string, f: Filtros) {
  const q = norm(busca.trim());
  return todos.filter((r) => {
    for (const d of FILTROS) {
      const v = f[d.id];
      if (!v) continue;
      const rv = d.id === "uf" ? uf(r.cidade_estado) : r[d.id];
      if (Array.isArray(rv) ? !rv.includes(v) : rv !== v) return false;
    }
    return !q || BUSCA.some((k) => norm(r[k]).includes(q));
  });
}
export const filtrosAtivos = (busca: string, f: Filtros) => FILTROS.filter((d) => f[d.id]).length + (busca.trim() ? 1 : 0);

/* ---------- Áreas, senioridade e textos curtos ---------- */
export const temArea = (r: Parceiro, g: { options: string[] }) => (r.areas_experiencia || []).some((x) => g.options.includes(x));
export const NIVEL: Record<string, string> = { "Menos de 1 ano.": "Júnior", "Entre 1 e 2 anos.": "Júnior", "Entre 3 e 5 anos.": "Pleno", "Entre 6 e 10 anos.": "Sênior", "Entre 11 e 15 anos.": "Especialista", "Entre 16 e 20 anos.": "Especialista", "Mais de 20 anos.": "Especialista" };
/** Áreas de atuação: os grupos de áreas em que a pessoa mais marcou opções. */
export const areasAtuacao = (r: Parceiro) =>
  GRUPOS_DE_AREA.map((g) => [g.title, (r.areas_experiencia || []).filter((x) => g.options.includes(x)).length] as const)
    .filter(([, n]) => n).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
export const limpaTxt = (x: unknown) => String(x || "").replace(/\.\s*$/, "").trim();
/** Link do LinkedIn informado (aceita "linkedin.com/in/..." sem https). */
export const linkLinkedin = (u: unknown) => { const v = String(u || "").trim(); if (!/linkedin\.com\//i.test(v)) return ""; return /^https?:\/\//i.test(v) ? v.replace(/^http:/i, "https:") : "https://" + v; };
/** Rótulo curto da especialidade (mesma regra de public.rotulo_especialidade no banco): até 40 caracteres. */
export function rotuloEsp(t: unknown) {
  let s = limpaTxt(t);
  const corta = (re: RegExp) => s.split(re)[0].trim();
  const tenta = (p: string) => { if (p) s = p; return s.length <= 40; };
  s = corta(/\s{2,}|\.\s|:\s|\s[-–—]\s/);
  if (s.length <= 40) return s;
  if (tenta(corta(/\s+(?:com|focad[oa]s?|voltad[oa]s?|especializad[oa]s?)\s/i))) return s;
  if (tenta(s.replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim())) return s;
  if (tenta(corta(/[,;]\s/))) return s;
  return s.slice(0, 40).replace(/\s+\S*$/, "") + "…";
}
export const espGaleria = (r: Parceiro) => limpaTxt(r.galeria_cargo) || rotuloEsp(r.principal_especializacao);
export const tempoGaleria = (r: Parceiro) => NIVEL[r.tempo_especialidade || ""] || "";
export const tagsGaleria = (r: Parceiro) => [...new Set((r.galeria_tags?.length ? r.galeria_tags : [...(r.areas_experiencia || []), ...(r.segmentos || [])]).map(limpaTxt).filter(Boolean))];
export const fotoDe = (r: Parceiro) => (r.galeria_foto_url && /^https:\/\//.test(r.galeria_foto_url) ? r.galeria_foto_url : "");
export const publicado = (r: Parceiro) => r.galeria_status === "autorizado" && !r.galeria_oculto;
export function contribuicaoPadrao(r: Parceiro) {
  const p = r.principal_especializacao || "";
  const areas = (r.areas_experiencia || []).slice(0, 3).map(limpar).join(", ");
  return [p, comecaComSim(r.lideranca) ? "pode liderar" : "", areas && "atua com " + areas].filter(Boolean).join("; ") + ".";
}
const TEMPO_ORDEM = (v?: string | null) => opcoesDe("tempo_especialidade").indexOf(v || "");

/* ---------- Números do topo (Dashboard) ---------- */
function maisComum(rows: Parceiro[], get: (r: Parceiro) => string | string[] | null | undefined) {
  const m = new Map<string, number>();
  rows.forEach((r) => ([] as string[]).concat(get(r) || []).forEach((v) => m.set(v, (m.get(v) || 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0] || null;
}
export type Kpi = { chave: string; valor: number; total?: number; rotulo: string; apoio: string };
/**
 * Os cinco números do topo: os mesmos cálculos e textos da página de HTML. Os percentuais ("67% de especialistas em…")
 * viram "6 de 9" no número do card (o CardIndicador do DS só mostra números) e o percentual vai no apoio, sem perder nada.
 */
export function kpis(rows: Parceiro[], totalGeral: number): Kpi[] {
  const t = rows.length;
  const segs = new Set(rows.flatMap((r) => r.segmentos || []).filter((x) => !/^Outros segmentos/.test(x)));
  const totalSegs = opcoesDe("segmentos").filter((x) => !/^Outros segmentos/.test(x)).length;
  const area = maisComum(rows, (r) => GRUPOS_DE_AREA.filter((g) => temArea(r, g)).map((g) => g.title));
  const tempo = maisComum(rows, (r) => r.tempo_especialidade);
  const vis = rows.filter(publicado).length;
  const tempoTxt = tempo ? limpar(tempo[0]).replace(/^Mais de/, "mais de").replace(/^Entre/, "entre").replace(/^Menos de/, "menos de") : "";
  return [
    { chave: "total", valor: t, rotulo: "Parceiros na rede", apoio: t === totalGeral ? "Total recebido" : "de " + totalGeral + " no total" },
    { chave: "segmentos", valor: segs.size, total: totalSegs, rotulo: segs.size === 1 ? "Segmento atendido" : "Segmentos atendidos", apoio: "de " + totalSegs + " setores do formulário" },
    area
      ? { chave: "area", valor: area[1], total: t, rotulo: "Especialistas em " + area[0], apoio: pct(area[1], t) + "% dos parceiros (" + plural(area[1], "parceiro", "parceiros") + ")" }
      : { chave: "area", valor: 0, rotulo: "Especialistas por área", apoio: "Sem dados" },
    tempo
      ? { chave: "tempo", valor: tempo[1], total: t, rotulo: "Têm " + tempoTxt + " de carreira", apoio: pct(tempo[1], t) + "% dos parceiros, na principal especialidade" }
      : { chave: "tempo", valor: 0, rotulo: "Tempo de carreira", apoio: "Sem dados" },
    { chave: "galeria", valor: vis, rotulo: vis === 1 ? "Perfil visível na galeria" : "Perfis visíveis na galeria", apoio: vis >= 3 ? "Galeria no ar no site" : "A galeria aparece no site a partir de 3" },
  ];
}

/* ---------- Desafio do projeto (IA) ---------- */
export type Desafio = { texto: string; ranking: Map<string, { aderencia: number; motivo: string }> };
export const aderenciaDe = (d: Desafio | null, r: Parceiro) => (d ? d.ranking.get(r.id) || { aderencia: 0, motivo: "" } : null);
export const nivelAderencia = (n: number) => (n >= 75 ? "alta" : n >= 40 ? "media" : "baixa");
export function montarDesafio(texto: string, ranking: { id: string; aderencia?: unknown; motivo?: string }[]): Desafio {
  return { texto, ranking: new Map(ranking.map((x) => [x.id, { aderencia: Math.max(0, Math.min(100, Math.round(Number(x.aderencia) || 0))), motivo: x.motivo || "" }])) };
}
export const ERRO_DESAFIO = (code: string) =>
  code === "ocupado" ? "A IA gratuita está ocupada agora. Tente de novo em alguns minutos." : code === "sem_chave" ? "Falta salvar a chave do Gemini (GEMINI_API_KEY) no Supabase." : "Não foi possível analisar agora. Tente de novo.";

/** Perfis do Dashboard: a área escolhida e a ordem (aderência ao desafio, depois tempo na especialidade). */
export function perfis(rows: Parceiro[], area: string, desafio: Desafio | null) {
  const g = GRUPOS_DE_AREA.find((x) => x.title === area);
  const base = g ? rows.filter((r) => temArea(r, g)) : rows;
  const ad = (r: Parceiro) => (desafio ? aderenciaDe(desafio, r)!.aderencia : 0);
  return [...base].sort((a, b) => ad(b) - ad(a) || TEMPO_ORDEM(b.tempo_especialidade) - TEMPO_ORDEM(a.tempo_especialidade));
}

/* ---------- Tabela da aba Parceiros ---------- */
const DISP: Record<string, string> = { "Disponibilidade imediata.": "Imediata", "Disponibilidade mediante agendamento.": "Mediante agendamento", "Disponibilidade parcial, conciliando com outros projetos.": "Parcial", "Disponibilidade apenas para projetos pontuais.": "Projetos pontuais" };
export const disponibilidade = (r: Parceiro) => DISP[r.disponibilidade_colaborar || ""] || (r.disponibilidade_colaborar ? limpar(r.disponibilidade_colaborar) : "–");
export const horas = (h?: string | null) => (!h ? "" : /variável/i.test(h) ? "horas variáveis" : limpar(h).replace(/^Até /, "até ").replace(/^De /, "").replace(/^Mais de /, "+").replace(/ horas semanais$/, " h/semana"));
export type SituacaoDaGaleria = "autorizado" | "recusado" | "aguardando" | "nao-convidado";
export const situacaoDaGaleria = (r: Parceiro): SituacaoDaGaleria => (r.galeria_status === "autorizado" ? "autorizado" : r.galeria_status === "recusado" ? "recusado" : r.galeria_convite_em ? "aguardando" : "nao-convidado");
export const ROTULO_DA_GALERIA: Record<SituacaoDaGaleria, string> = { autorizado: "Autorizado", recusado: "Recusado", aguardando: "Aguardando resposta", "nao-convidado": "Não convidado" };

/* ---------- Autorização da galeria (em massa) e agendamento ---------- */
export function resumoDaGaleria(todos: Parceiro[]) {
  const n = (f: (r: Parceiro) => boolean) => todos.filter(f).length;
  return {
    autorizaram: n((r) => r.galeria_status === "autorizado"),
    recusaram: n((r) => r.galeria_status === "recusado"),
    aguardando: n((r) => !r.galeria_status && !!r.galeria_convite_em),
    naoConvidados: n((r) => !r.galeria_status && !r.galeria_convite_em),
  };
}
export const elegivel = (r: Parceiro) => !r.galeria_status && !r.comunicados_descadastro_em && !!r.email;
/** Quantos recebem o envio em massa: quem ainda não decidiu, não se descadastrou e tem e-mail (reenviar = já convidados). */
export const quantosRecebem = (todos: Parceiro[], reenviar: boolean) => todos.filter((r) => elegivel(r) && (reenviar ? !!r.galeria_convite_em : !r.galeria_convite_em)).length;
export const fmtQuando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
export type Agendamento = { id: string; agendado_para: string; modo: "todos" | "selecionados"; destinatarios: string[] | null; situacao: "agendado" | "enviando" | "enviado" | "falhou" | string; enviados?: number; falhas?: number; ignorados?: number; erro?: string | null };
const juntaNomes = (nomes: string[], max: number) => (!nomes.length ? "ninguém" : nomes.length > max ? nomes.slice(0, max).join(", ") + " e mais " + (nomes.length - max) : nomes.join(", "));
export const nomesElegiveis = (todos: Parceiro[]) => todos.filter(elegivel).map((r) => r.nome || r.email || "").sort((x, y) => x.localeCompare(y, "pt-BR"));
/** "Para: …" de um envio agendado. "Todos": quem ainda não decidiu agora (a lista é refeita na hora do envio). */
export function paraQuem(a: Agendamento, todos: Parceiro[], max = 3) {
  if (a.modo === "todos") {
    if (a.situacao && a.situacao !== "agendado") return "Todos que ainda não decidiram";
    const n = nomesElegiveis(todos);
    return "Todos que ainda não decidiram (" + n.length + "): " + juntaNomes(n, max);
  }
  const nomes = (a.destinatarios || []).map((id) => todos.find((r) => r.id === id)?.nome || "Parceiro excluído");
  return (nomes.length === 1 ? "1 pessoa: " : nomes.length + " pessoas: ") + juntaNomes(nomes, max);
}
export const SITUACAO_DO_AGENDAMENTO: Record<string, { rotulo: string; tom: "aviso" | "sucesso" | "erro" }> = {
  agendado: { rotulo: "Agendado", tom: "aviso" }, enviando: { rotulo: "Enviando", tom: "aviso" }, enviado: { rotulo: "Enviado", tom: "sucesso" }, falhou: { rotulo: "Não enviado", tom: "erro" },
};
export function detalheDoAgendamento(a: Agendamento): string[] {
  const l: string[] = [];
  if (a.modo === "todos" && a.situacao === "agendado") l.push("A lista de “todos” é atualizada na hora do envio.");
  if (a.situacao === "enviado") l.push(plural(a.enviados || 0, "enviado", "enviados") + (a.falhas ? " · " + plural(a.falhas, "não enviado", "não enviados") : "") + (a.ignorados ? " · " + plural(a.ignorados, "já tinha decidido", "já tinham decidido") : ""));
  if (a.situacao === "falhou") l.push("O envio não aconteceu" + (a.erro && /^Pausado/.test(a.erro) ? " (pausado antes da hora)" : "") + ". Agende de novo.");
  return l;
}
/** Confere a data do agendamento: devolve o erro (texto da página de HTML) ou nada. */
export function erroDoAgendamento(ids: string[], quando: Date | null, agora = Date.now()) {
  if (!ids.length) return "Marque pelo menos uma pessoa.";
  if (!quando) return "Informe a data e a hora do envio.";
  if (isNaN(quando.getTime()) || quando.getTime() < agora + 60000) return "Escolha uma data e hora a partir do próximo minuto.";
  return null;
}

/* ---------- Análise da rede (IA) ---------- */
export type Analise = { error?: string; vazio?: boolean; desatualizada?: boolean; gerado_em?: string; base?: number; perfis?: Record<string, string>; analise?: { resumo?: string; forcas?: string[]; lacunas?: string[]; recomendacoes?: string[] } };
export const ERRO_DA_ANALISE = (e: string) =>
  e === "sem_chave" ? "A análise por IA ainda não está ativa: falta salvar a chave do Google Gemini (GEMINI_API_KEY) nos secrets do Supabase."
    : e === "limite" || e === "ocupado" ? "A IA gratuita está ocupada ou no limite de uso agora. Tente de novo em alguns minutos." : "Não foi possível gerar a análise agora.";
/** Números do texto em negrito (100%, mais de 50%, 7 parceiros): partes pares são texto, ímpares são números. */
export const partesComNumeros = (t: string) => String(t).split(/((?:mais de |acima de )?\d+(?:[.,]\d+)?\s*%?)/i);

/* ---------- Respostas antigas do formulário ---------- */
const CONTRATACAO_LEGADO: Record<string, string> = {
  "Contratação por hora.": "Valor por hora.", "Contratação por diária.": "Valor por diária.",
  "Contratação por entregáveis.": "Valor por entregável.", "Contratação recorrente por período determinado.": "Contrato recorrente (mensal ou por período determinado).",
  "Formato negociável conforme a demanda.": "Negociável conforme escopo e complexidade.",
  "Valor por projeto.": "Projeto com escopo e valor fechado.", "Mensalidade / contrato recorrente.": "Contrato recorrente (mensal ou por período determinado).",
  "Depende do escopo e da complexidade.": "Negociável conforme escopo e complexidade.",
};
const ETAPAS_LEGADO: Record<string, string> = {
  "Descoberta e entendimento do problema.": "Diagnóstico e entendimento do problema.", "Pesquisa e diagnóstico.": "Pesquisa e levantamento de informações.",
  "Definição de estratégias.": "Planejamento e definição de estratégias.", "Ideação e cocriação.": "Ideação e cocriação de soluções.",
  "Prototipação e validação.": "Prototipação, testes e validação.", "Desenho de soluções.": "Ideação e cocriação de soluções.",
  "Desenvolvimento e implementação.": "Execução e desenvolvimento das entregas.", "Capacitação e gestão da mudança.": "Capacitação de equipes e gestão da mudança.",
  "Mensuração e acompanhamento de resultados.": "Mensuração de resultados e melhoria contínua.",
};
const LEGADO: Record<string, Record<string, string>> = {
  atuacao_pj: { "Sim, tenho CNPJ ativo.": "Sim, tenho CNPJ ativo (MEI, empresa ou consultoria própria).", "Sim, atuo por meio de uma empresa ou consultoria própria.": "Sim, tenho CNPJ ativo (MEI, empresa ou consultoria própria)." },
  como_conheceu: { "Já conhecia o trabalho da Dani Moscatelli.": "Indicação da Dani Moscatelli." },
};
const SEG_LEGADO: Record<string, string> = { "Saúde e serviços hospitalares.": "Saúde.", "Clínicas e consultórios.": "Saúde.", "Operadoras de planos de saúde.": "Saúde.", "Saúde digital e Healthtechs.": "Saúde.", "Turismo e hospitalidade.": "Hospitalidade e turismo.", "Hotelaria e meios de hospedagem.": "Hospitalidade e turismo.", "Gastronomia e alimentação.": "Hospitalidade e turismo.", "Varejo e comércio.": "Varejo.", "E-commerce e marketplaces.": "Varejo.", "Serviços financeiros e Fintechs.": "Serviços financeiros.", "Educação e Edtechs.": "Educação.", "Tecnologia e software.": "Tecnologia.", "Telecomunicações.": "Tecnologia.", "Indústria e manufatura.": "Indústria.", "Agronegócio.": "Indústria.", "Mobilidade e transportes.": "Mobilidade e logística.", "Logística e distribuição.": "Mobilidade e logística.", "Setor público e serviços governamentais.": "Setor público.", "Terceiro setor e organizações sociais.": "Terceiro setor.", "Mercado imobiliário.": "Outros segmentos.", "Construção civil e arquitetura.": "Outros segmentos.", "Entretenimento e eventos.": "Outros segmentos." };
export const etapasAtuais = (r: Parceiro) => [...new Set((r.etapas_projeto || []).map((v) => ETAPAS_LEGADO[v] || v))];
export const contratacaoAtual = (r: Parceiro) => [...new Set([...(r.formatos_contratacao || []), ...(r.precificacao ? [r.precificacao] : [])].map((v) => CONTRATACAO_LEGADO[v] || v))];
/** Lista: as respostas de versões antigas do formulário passam a contar na opção atual equivalente. */
export function normalizarParaLista(r: Parceiro): Parceiro {
  const x: Parceiro = { ...r, formatos_contratacao: contratacaoAtual(r), etapas_projeto: etapasAtuais(r) };
  for (const [k, mapa] of Object.entries(LEGADO)) if (typeof x[k] === "string" && mapa[x[k] as string]) x[k] = mapa[x[k] as string];
  if (Array.isArray(x.segmentos)) x.segmentos = [...new Set(x.segmentos.map((v) => SEG_LEGADO[v] || v))];
  return x;
}
/** Candidatura aberta: as respostas como a página de HTML mostra (opções atuais, autorizações e o texto de "Outro"). */
export function respostasParaMostrar(data: Parceiro): Record<string, unknown> {
  const shown: Record<string, unknown> = { ...data, formatos_contratacao: contratacaoAtual(data), etapas_projeto: etapasAtuais(data) };
  const galSt = data.galeria_status === "autorizado" ? "Autorizada" : data.galeria_status === "recusado" ? "Não autorizada" : "Não autorizada no cadastro";
  shown.autorizacoes = [
    "Uso dos dados profissionais pela rede de parceiros e contatos sobre oportunidades: " + (data.autoriza_dados ? "Autorizado" : "Não autorizado"),
    "Exibição do perfil na Galeria de Profissionais (nome, cargo, áreas, segmentos, LinkedIn e foto): " + galSt,
  ];
  if (data.certificacoes) shown.formacao = [data.formacao, data.certificacoes].filter(Boolean).join("\n");
  for (const [k, txt] of Object.entries(data.outros || {})) {
    const addTxt = (v: unknown) => (/^Outr[oa]s?\b/.test(String(v)) ? String(v).replace(/\.$/, "") + ": " + txt : v);
    shown[k] = Array.isArray(shown[k]) ? (shown[k] as unknown[]).map(addTxt) : addTxt(shown[k] || "");
  }
  return shown;
}
/** Valor de uma resposta como texto (Admin.detail): "-" vazio, Sim/Não, listas uma por linha; links ficam como link. */
export function valorDaResposta(v: unknown): { tipo: "vazio" | "texto" | "link"; texto: string; href?: string } {
  if (v == null || v === "" || (Array.isArray(v) && !v.length)) return { tipo: "vazio", texto: "-" };
  if (typeof v === "boolean") return { tipo: "texto", texto: v ? "Sim" : "Não" };
  const texto = Array.isArray(v) ? v.join("\n") : String(v);
  if (/^(https?:\/\/|www\.|linkedin\.com)/i.test(texto) && !texto.includes(" ")) return { tipo: "link", texto, href: /^https?:\/\//i.test(texto) ? texto : "https://" + texto };
  return { tipo: "texto", texto };
}
/** Caminho da foto da galeria no armazenamento (para apagar ao excluir o perfil da galeria). */
export const caminhoDaFoto = (url?: string | null) => { const m = String(url || "").match(/\/object\/public\/galeria\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; };
export const PERFIL_DA_GALERIA_LIMPO = { galeria_status: null, galeria_decidido_em: null, galeria_cargo: null, galeria_tags: null, galeria_linkedin: null, galeria_foto_url: null, galeria_oculto: false, galeria_aceite_cadastro: false };
