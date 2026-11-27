// Pesquisas (A8): os dados, as consultas e as regras de public/admin/pesquisas/index.html, sem interface.
// Os resultados e a inteligência são montados aqui como "modelos" (título, leitura, gráfico e números), que a tela
// desenha com os componentes do DS e a exportação (Excel e PDF) usa sem depender do que está na tela.
import { sb } from "@/lib/supabase";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Valor = any;

export const SITE = "https://www.danimoscatelli.com.br";
export const API = "https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/pesquisa";
/** Pesquisas conhecidas pelo site: endereço público de cada uma. */
const PAGINAS: Record<string, string> = { "moda-curitiba": "/pesquisa/moda-curitiba/" };
export const urlDaPesquisa = (slug: string) => SITE + (PAGINAS[slug] || "/pesquisa/" + slug + "/");

export type Opcao = { id: string; texto: string; exclusiva?: boolean; encerra?: boolean; outro?: boolean; anula?: boolean; regional?: string };
export type PerguntaDaPesquisa = {
  id: string; texto: string; tipo: "unica" | "multipla" | "ranking" | "escala" | "escalas" | "matriz"; rotulo?: string; max?: number; min?: number;
  rotulo_min?: string; rotulo_max?: string; opcoes?: Opcao[]; linhas?: { id: string; texto: string }[]; colunas?: { id: string; texto: string }[];
  condicao?: { pergunta: string; opcoes: string[] };
};
export type CampoDoPerfil = { id: string; texto: string; opcoes: Opcao[]; condicao?: { campo: string; opcoes: string[] } };
export type Questionario = { perguntas: PerguntaDaPesquisa[]; perfil?: CampoDoPerfil[] };
export type Pesquisa = { slug: string; titulo: string; ativa: boolean; criada_em: string; atualizado_em?: string | null };
export type Resposta = {
  id: string; envio_id: string | null; nome: string | null; email: string | null; whatsapp: string | null; created_at: string; situacao: "completa" | "fora_de_curitiba" | "sem_compras" | "parcial" | string;
  respostas: Record<string, Valor>; relato: string | null; quer_novidades: boolean | null; visualizado_em: string | null; parou_em: string | null; atualizado_em: string | null;
};
export type Interessado = { id: string; envio_id: string | null; created_at: string; nome: string | null; email: string | null; whatsapp: string | null; consentimento_em: string; consentimento_versao: string };
export type DadosDoPainel = { P: Pesquisa; Q: Questionario; R: Resposta[]; RP: Resposta[]; I: Interessado[] };

export const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
export const plural = (n: number, um: string, varios: string) => `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;
export const fmtDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
export const media = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
export const fmt1 = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
export const semOutro = (t: unknown) => String(t || "").replace(/ \(especifique\)$/, "");
export const juntar = (l: string[]) => (l.length < 2 ? l.join("") : l.slice(0, -1).join(", ") + " e " + l[l.length - 1]);

/* ---------- Carregar ---------- */
export async function carregarLista() {
  const [{ data: ps, error }, { data: novas }] = await Promise.all([
    sb.from("pesquisas").select("slug, titulo, ativa, criada_em").order("criada_em", { ascending: false }),
    sb.from("pesquisa_respostas").select("pesquisa").is("visualizado_em", null).neq("situacao", "parcial").limit(5000),
  ]);
  if (error) return { erro: "Não foi possível carregar as pesquisas: " + error.message };
  const contagem: Record<string, number> = {};
  ((novas || []) as { pesquisa: string }[]).forEach((r) => { contagem[r.pesquisa] = (contagem[r.pesquisa] || 0) + 1; });
  return { pesquisas: (ps || []) as Pesquisa[], contagem };
}
export const separar = (todas: Resposta[]) => ({ R: todas.filter((x) => x.situacao !== "parcial"), RP: todas.filter((x) => x.situacao === "parcial") });
export async function carregarPainel(s: string): Promise<{ erro: string } | DadosDoPainel> {
  const [p, r, i, q] = await Promise.all([
    sb.from("pesquisas").select("slug, titulo, ativa, criada_em, atualizado_em").eq("slug", s).maybeSingle(),
    sb.from("pesquisa_respostas").select("id, envio_id, nome, email, whatsapp, created_at, situacao, respostas, relato, quer_novidades, visualizado_em, parou_em, atualizado_em").eq("pesquisa", s).order("created_at", { ascending: false }).limit(10000),
    sb.from("pesquisa_interessados").select("id, envio_id, created_at, nome, email, whatsapp, consentimento_em, consentimento_versao").eq("pesquisa", s).order("created_at", { ascending: false }).limit(10000),
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "status", pesquisa: s }) }).then((x) => x.json()).catch(() => null),
  ]);
  if (p.error || !p.data) return { erro: p.error ? "Não foi possível carregar a pesquisa: " + p.error.message : "Pesquisa não encontrada." };
  if (r.error) return { erro: "Não foi possível carregar as respostas: " + r.error.message };
  if (!q || !q.questionario) return { erro: "Não foi possível carregar as perguntas da pesquisa. Atualize a página para tentar de novo." };
  return { P: p.data as Pesquisa, Q: q.questionario as Questionario, I: (i.data || []) as Interessado[], ...separar((r.data || []) as Resposta[]) };
}
export const todasR = (d: Pick<DadosDoPainel, "R" | "RP">) => [...d.R, ...d.RP].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

/* ---------- Regras das respostas ---------- */
/** Valores escolhidos numa resposta (escolha única, classificação ou múltipla escolha). */
export const valores = (v: Valor): string[] => (Array.isArray(v) ? v : v && Array.isArray(v.opcoes) ? v.opcoes : v == null ? [] : [v]);
/** Pergunta 4: nota geral = média dos aspectos (Qualidade, Estética, Correspondência); respostas antigas tinham uma nota só. */
export const notaGeral = (x: Resposta): number | null => { const v = x.respostas && x.respostas.q4; if (typeof v === "number") return v; if (!v || typeof v !== "object") return null; const ns = Object.values(v).filter((n): n is number => typeof n === "number"); return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null; };
export const notas = (lista: Resposta[], f: (x: Resposta) => number | null) => lista.map(f).filter((v): v is number => typeof v === "number");
export const naCondicao = (p: PerguntaDaPesquisa, x: Resposta) => valores(x.respostas[p.condicao!.pergunta]).some((v) => p.condicao!.opcoes.includes(v));
export const completas = (R: Resposta[]) => R.filter((x) => x.situacao === "completa");
export const relatosDe = (R: Resposta[]) => R.filter((x) => x.relato && x.relato.trim());
/** Quem quer os avisos e tem o contato guardado (base da aba Interessados). */
export const interessados = (R: Resposta[], I: Interessado[]) => completas(R).filter((x) => x.quer_novidades && (!x.envio_id || I.some((y) => y.envio_id === x.envio_id)));
export function contar(p: PerguntaDaPesquisa, base: Resposta[]) {
  const n: Record<string, number> = {};
  (p.opcoes || []).forEach((o) => { n[o.id] = 0; });
  base.forEach((x) => {
    const v = x.respostas[p.id];
    if (p.tipo === "unica" && v != null) n[v] = (n[v] || 0) + 1;
    if (p.tipo === "multipla" && v) (v.opcoes || []).forEach((o: string) => { n[o] = (n[o] || 0) + 1; });
    // classificação (1º, 2º, 3º): conta o 1º lugar; respostas antigas de escolha única também valem como 1º
    if (p.tipo === "ranking" && v != null) { const f = valores(v)[0]; if (f) n[f] = (n[f] || 0) + 1; }
  });
  return n;
}
export type Item = { rotulo: string; v: number; v2?: number; fixo?: boolean; curto?: string };
export const itensDe = (p: PerguntaDaPesquisa, base: Resposta[]): Item[] => { const n = contar(p, base); return (p.opcoes || []).map((o) => ({ rotulo: o.texto, v: n[o.id] || 0, fixo: !!o.exclusiva || o.id === "nao_informar" })); };
export const maisEscolhida = (itens: Item[]) => [...itens].filter((i) => !i.fixo).sort((a, b) => b.v - a.v)[0];

/* ---------- Respostas individuais ---------- */
export const SIT_CURTA: Record<string, string> = { completa: "Completa", fora_de_curitiba: "Fora de Curitiba e RMC", sem_compras: "Não comprou este ano", parcial: "Incompleta" };
export const SITUACAO_LONGA: Record<string, string> = { completa: "Completas", fora_de_curitiba: "Fora de Curitiba e Região Metropolitana", sem_compras: "Não compraram este ano" };
export const ROTULO: Record<string, string> = {
  q1: "Onde mora", q1_1: "Compra em Curitiba", q2: "Onde mais comprou este ano", q2_1: "Por que compra fora", q3: "Segunda mão (brechós)",
  q4: "Nota de 1 a 10 para cada aspecto", q5: "Onde começa a procura", q_foto: "Foto de referência", q6: "Como descobre lojas", q_disponibilidade: "Pergunta antes se tem a peça",
  q7: "Dificuldade para encontrar", q8: "Facilidade para conseguir peças", q_categorias: "Mais difícil de encontrar", q9: "Quando não encontrou",
};
export const BLOCOS: [string, string[]][] = [["Onde compra", ["q1", "q1_1", "q2", "q2_1", "q3"]], ["Notas das compras", ["q4"]], ["Como procura", ["q5", "q_foto", "q6", "q_disponibilidade"]], ["Dificuldades", ["q7", "q8", "q_categorias", "q9"]]];
export const FILTROS_DAS_RESPOSTAS: [string, string][] = [["todas", "Todas"], ["completa", "Completas"], ["parcial", "Incompletas"], ["fora_de_curitiba", "Fora de Curitiba e RMC"], ["sem_compras", "Não comprou"]];
export const ROTULO_PF: Record<string, string> = { cidade: "Cidade", bairro: "Bairro", genero: "Gênero", faixa_etaria: "Faixa etária", estado_civil: "Estado civil" };
export const nomeDe = (x: Resposta) => (x.nome && x.nome.trim()) || "Sem nome";
export const numeroDe = (x: Resposta, todas: Resposta[]) => todas.length - todas.indexOf(x);
export function textoResposta(p: PerguntaDaPesquisa, v: Valor): string {
  if (v == null) return "—";
  const op = (id: string) => ((p.opcoes || []).find((o) => o.id === id) || ({} as Opcao)).texto?.replace(/ \(especifique\)$/, "") || id;
  if (p.tipo === "unica") return op(v);
  if (p.tipo === "ranking") return valores(v).map((id, k) => `${k + 1}º ${op(id)}`).join(" · ");
  if (p.tipo === "escala") return String(v);
  if (p.tipo === "escalas") return typeof v === "number" ? String(v) : (p.linhas || []).map((l) => `${l.texto}: ${v[l.id] ?? "—"}`).join("\n");
  if (p.tipo === "matriz") return (p.linhas || []).map((l) => `${l.texto}: ${((p.colunas || []).find((c) => c.id === v[l.id]) || ({} as { texto?: string })).texto || "—"}`).join("\n");
  return (v.opcoes || []).map((id: string) => op(id) + ((p.opcoes || []).find((o) => o.id === id)?.outro && v.outro ? ` (${v.outro})` : "")).join(" · ");
}
export function perfilDe(Q: Questionario, x: Resposta): [CampoDoPerfil, string][] {
  const pf = (x.respostas && x.respostas.perfil) || {};
  return (Q.perfil || []).map((c) => [c, pf[c.id] ? ((c.opcoes.find((o) => o.id === pf[c.id]) || ({} as Opcao)).texto || pf[c.id]).replace(/ \(especifique\)$/, "") + (pf[c.id + "_outro"] ? ` (${pf[c.id + "_outro"]})` : "") : null] as [CampoDoPerfil, string | null])
    .filter((p): p is [CampoDoPerfil, string] => !!p[1]);
}
/** Onde a pessoa parou (incompletas): "na pergunta 5", "na etapa Sobre você", "no relato (opcional)" ou "na última etapa". */
export function ondeParou(Q: Questionario, x: Resposta) {
  const e = x.parou_em;
  if (e === "perfil") return "na etapa Sobre você";
  if (e === "relato") return "no relato (opcional)";
  if (e === "novidades") return "na última etapa";
  let num = 0; let rot: string | null = null;
  Q.perguntas.forEach((p) => { if (!p.condicao) num++; if (p.id === e) rot = p.rotulo || String(num); });
  return rot ? `na pergunta ${rot}` : "no começo";
}
export function resumoDe(Q: Questionario, x: Resposta) {
  if (x.situacao === "parcial") return `Parou ${ondeParou(Q, x)} · última atividade em ${fmtDate(x.atualizado_em || x.created_at)}`;
  const q2 = Q.perguntas.find((p) => p.id === "q2");
  const prim = q2 && valores(x.respostas.q2)[0];
  const pf = perfilDe(Q, x).map(([, v]) => v).filter((t) => t !== "Prefiro não informar").join(" · ");
  return [pf, prim && x.situacao === "completa" ? "Mais comprou: " + textoResposta({ ...q2!, tipo: "unica" }, prim) : ""].filter(Boolean).join(" · ");
}
/** Número de cada pergunta como a pesquisa mostra (as condicionais têm rótulo próprio, como "2.1"). */
export function numerosDasPerguntas(Q: Questionario) {
  let num = 0; const nums: Record<string, string> = {};
  Q.perguntas.forEach((p) => { if (!p.condicao) num++; nums[p.id] = p.rotulo || String(num); });
  return nums;
}
export const telefone = (w: unknown) => { const d = String(w || "").replace(/\D/g, ""); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d; };

/* ---------- Planilhas (Excel) ---------- */
export function dadosRespostas(d: DadosDoPainel): (string | number)[][] {
  let num = 0;
  const cols = d.Q.perguntas.map((p) => { if (!p.condicao) num++; return [p, `${p.rotulo || num}. ${p.texto}`] as const; });
  const cab = ["#", "Data", "Situação", ...cols.map((c) => c[1]), ...(d.Q.perfil || []).map((c) => c.texto), "Relato", "Quer novidades"];
  const T = todasR(d);
  const linhas = T.map((x, k) => {
    const pf = x.respostas.perfil || {};
    return [T.length - k, fmtDate(x.created_at), x.situacao === "parcial" ? `Incompleta (parou ${ondeParou(d.Q, x)})` : SIT_CURTA[x.situacao] || x.situacao,
      ...cols.map(([p]) => (x.respostas[p.id] === undefined ? "" : textoResposta(p, x.respostas[p.id]))),
      ...(d.Q.perfil || []).map((c) => (pf[c.id] ? ((c.opcoes.find((o) => o.id === pf[c.id]) || ({} as Opcao)).texto || pf[c.id]).replace(/ \(especifique\)$/, "") + (pf[c.id + "_outro"] ? ` (${pf[c.id + "_outro"]})` : "") : "")),
      x.relato || "", x.situacao === "completa" ? (x.quer_novidades ? "Sim" : "Não") : ""];
  });
  return [cab, ...linhas];
}
export function resumoLinhas(d: DadosDoPainel): (string | number)[][] {
  const c = completas(d.R).length;
  return [[d.P.titulo], ["Relatório gerado em " + fmtDate(new Date().toISOString())], [],
    ["Participações", d.R.length], ["Respostas completas", c], ["Fora do público", d.R.length - c],
    ["Querem novidades", d.R.filter((x) => x.quer_novidades).length], ["Contatos guardados", d.I.length],
    ["Situação", d.P.ativa ? "No ar, recebendo respostas" : "Fora do ar"]];
}
type Xlsx = { utils: { book_new: () => unknown; aoa_to_sheet: (r: unknown[][]) => Record<string, unknown>; book_append_sheet: (wb: unknown, ws: unknown, nome: string) => void }; writeFile: (wb: unknown, nome: string) => void };
let XLSX_P: Promise<Xlsx> | null = null;
/** A mesma biblioteca da página de HTML (xlsx 0.18.5), carregada só quando alguém exporta. */
export const carregarXlsx = () => XLSX_P || (XLSX_P = new Promise<Xlsx>((ok, falha) => {
  const w = window as unknown as { XLSX?: Xlsx };
  if (w.XLSX) return ok(w.XLSX);
  const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  sc.onload = () => ok(w.XLSX!); sc.onerror = () => { XLSX_P = null; falha(new Error("xlsx")); }; document.head.appendChild(sc);
}));
export async function baixarPlanilha(nomeDoArquivo: string, abas: { nome: string; linhas: (string | number)[][]; larguras: number[] }[]) {
  const X = await carregarXlsx();
  const wb = X.utils.book_new();
  for (const a of abas) { const ws = X.utils.aoa_to_sheet(a.linhas.length ? a.linhas : [["Sem dados"]]); ws["!cols"] = a.larguras.map((wch) => ({ wch })); X.utils.book_append_sheet(wb, ws, a.nome); }
  X.writeFile(wb, nomeDoArquivo);
}
export const nomeArquivo = (slug: string, tipo: "relatorio" | "respostas", ext = "xlsx") => `${slug}-${tipo}-${new Date().toISOString().slice(0, 10)}.${ext}`;

/* ---------- QR Code ---------- */
type QrLib = (tipo: number, nivel: string) => { addData: (s: string) => void; make: () => void; createSvgTag: (o: { cellSize: number; margin: number; scalable: boolean }) => string };
let qrLib: Promise<QrLib> | null = null;
/** O código é gerado no próprio navegador (qrcode-generator 1.4.4, a mesma da página de HTML), carregado só quando a janela abre. */
export const carregarQr = () => qrLib || (qrLib = new Promise<QrLib>((ok, falhou) => {
  const w = window as unknown as { qrcode?: QrLib };
  if (w.qrcode) return ok(w.qrcode);
  const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
  sc.onload = () => (w.qrcode ? ok(w.qrcode) : falhou(new Error("qr"))); sc.onerror = () => { qrLib = null; falhou(new Error("qr")); };
  document.head.appendChild(sc);
}));
