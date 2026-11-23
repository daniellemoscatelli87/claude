// Pesquisas públicas do Studio (página /pesquisa/<slug>/). Sem login: valida tudo aqui antes de gravar.
// { acao: "status", pesquisa }      devolve { ativa, questionario } (o questionário também serve ao painel).
// { acao: "verificar", pesquisa, email, whatsapp }   devolve { ja_respondeu } (checado na identificação, antes das perguntas).
// { acao: "enviar", pesquisa, envio_id, identificacao, respostas, relato?, novidades? }
//     identificacao: { nome, email, whatsapp, ciente: true }, obrigatória. Uma participação por e-mail e uma por WhatsApp.
//     Grava a participação uma única vez por envio_id (reenvio ou atualização da página não duplica).
//     situacao vem das próprias respostas: Q1 = "Não" encerra (fora_de_curitiba); Q2 = "Não comprei" encerra (sem_compras).
//     Perguntas com condicao (ex.: 2.1) só são exigidas e gravadas para quem escolheu uma das opções indicadas.
//     perfil: { genero, genero_outro?, faixa_etaria }, obrigatório nas participações completas; gravado em respostas.perfil.
//     novidades: { quer: boolean } só para participações completas; "sim" é a autorização para receber avisos.
//     Quem quer novidades também entra em pesquisa_interessados (lista do painel), com o texto da autorização.
//     O relato (pergunta aberta) é guardado exatamente como foi enviado.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import modaCuritiba from "./questionario.json" with { type: "json" };

type Opcao = { id: string; texto: string; encerra?: string; exclusiva?: boolean; outro?: boolean; anula?: boolean };
type Pergunta = {
  id: string; tipo: "unica" | "multipla" | "ranking" | "escala" | "escalas" | "matriz"; texto: string; max?: number; min?: number;
  condicao?: { pergunta: string; opcoes: string[] };
  opcoes?: Opcao[]; linhas?: { id: string }[]; colunas?: { id: string }[];
};
type Questionario = {
  slug: string; versao: string; identificacao: { versao: string; texto: string }; consentimento: { versao: string; texto: string }; perguntas: Pergunta[];
  perfil?: { id: string; opcoes: Opcao[] }[]; // perguntas de perfil (gênero e faixa etária), fora da contagem
};
const QUESTIONARIOS: Record<string, Questionario> = { [modaCuritiba.slug]: modaCuritiba as Questionario };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OUTRO_MAX = 200;
const WHATS = /^[1-9][1-9](9\d{8}|[2-5]\d{7})$/;
const JA = "Este e-mail ou WhatsApp já participou da pesquisa. Cada pessoa participa uma vez. Obrigada!";

// já existe participação com este e-mail ou WhatsApp (fora o próprio envio, para reenvios não serem barrados)
async function jaRespondeu(slug: string, email: string, whats: string, envioId?: string) {
  for (const [col, val] of [["email", email], ["whatsapp", whats]]) {
    let qy = db.from("pesquisa_respostas").select("id", { count: "exact", head: true }).eq("pesquisa", slug).eq(col, val);
    if (envioId) qy = qy.neq("envio_id", envioId);
    const { count, error } = await qy;
    if (error) throw error;
    if ((count ?? 0) > 0) return true;
  }
  return false;
}

// valores escolhidos numa resposta (escolha única, classificação ou múltipla escolha)
const valores = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : v && typeof v === "object" && Array.isArray((v as { opcoes?: unknown }).opcoes) ? (v as { opcoes: unknown[] }).opcoes.map(String) : v == null ? [] : [String(v)];

class Invalido extends Error {}
const falha = (msg: string): never => { throw new Invalido(msg); };

// Valida as respostas de uma pergunta e devolve o valor limpo que será gravado.
function validar(p: Pergunta, v: unknown): unknown {
  const ids = new Set((p.opcoes ?? []).map((o) => o.id));
  if (p.tipo === "unica") {
    if (typeof v !== "string" || !ids.has(v)) falha(`Resposta inválida na pergunta ${p.id}.`);
    return v;
  }
  if (p.tipo === "escala") {
    if (typeof v !== "number" || !Number.isInteger(v) || v < (p.min ?? 0) || v > (p.max ?? 10)) falha(`Nota inválida na pergunta ${p.id}.`);
    return v;
  }
  if (p.tipo === "escalas") {
    // várias notas (uma por aspecto), todas inteiras entre min e max
    if (!v || typeof v !== "object" || Array.isArray(v)) falha(`Dê uma nota para cada aspecto da pergunta ${p.id}.`);
    const out: Record<string, number> = {};
    for (const l of p.linhas ?? []) {
      const n = (v as Record<string, unknown>)[l.id];
      if (typeof n !== "number" || !Number.isInteger(n) || n < (p.min ?? 0) || n > (p.max ?? 10)) falha(`Dê uma nota para cada aspecto da pergunta ${p.id}.`);
      out[l.id] = n as number;
    }
    return out;
  }
  if (p.tipo === "matriz") {
    if (!v || typeof v !== "object" || Array.isArray(v)) falha(`Responda todas as linhas da pergunta ${p.id}.`);
    const cols = new Set((p.colunas ?? []).map((c) => c.id));
    const out: Record<string, string> = {};
    for (const l of p.linhas ?? []) {
      const r = (v as Record<string, unknown>)[l.id];
      if (typeof r !== "string" || !cols.has(r)) falha(`Responda todas as linhas da pergunta ${p.id}.`);
      out[l.id] = r as string;
    }
    return out;
  }
  if (p.tipo === "ranking") {
    // classificação: lista de opções na ordem escolhida (1º, 2º, 3º); a exclusiva ("Não comprei") fica sozinha
    const lista = Array.isArray(v) ? v.map(String) : [];
    if (!lista.length) falha(`Escolha pelo menos uma opção na pergunta ${p.id}.`);
    if (new Set(lista).size !== lista.length || lista.some((s) => !ids.has(s))) falha(`Opção inválida na pergunta ${p.id}.`);
    if (p.max && lista.length > p.max) falha(`Escolha no máximo ${p.max} opções na pergunta ${p.id}.`);
    if (lista.some((s) => p.opcoes!.find((x) => x.id === s)?.exclusiva) && lista.length > 1) falha(`A opção escolhida na pergunta ${p.id} não pode ser combinada com outras.`);
    return lista;
  }
  // múltipla escolha: { opcoes: string[], outro?: string }
  const o = v as { opcoes?: unknown; outro?: unknown };
  const sel = Array.isArray(o?.opcoes) ? [...new Set(o.opcoes.map(String))] : [];
  if (!sel.length) falha(`Escolha pelo menos uma opção na pergunta ${p.id}.`);
  if (sel.some((s) => !ids.has(s))) falha(`Opção inválida na pergunta ${p.id}.`);
  if (p.max && sel.length > p.max) falha(`Escolha no máximo ${p.max} opções na pergunta ${p.id}.`);
  const exclusivas = (p.opcoes ?? []).filter((x) => x.exclusiva).map((x) => x.id);
  if (sel.some((s) => exclusivas.includes(s)) && sel.length > 1) falha(`A opção escolhida na pergunta ${p.id} não pode ser combinada com outras.`);
  // respostas negativas (anula): a pessoa pode marcar junto com outras, mas no banco ficam só as negativas
  const anulam = (p.opcoes ?? []).filter((x) => x.anula).map((x) => x.id);
  if (sel.some((s) => anulam.includes(s))) return { opcoes: sel.filter((s) => anulam.includes(s)) };
  const opOutro = (p.opcoes ?? []).find((x) => x.outro);
  const res: { opcoes: string[]; outro?: string } = { opcoes: sel };
  if (opOutro && sel.includes(opOutro.id)) {
    const t = String(o.outro ?? "").trim();
    if (!t) falha(`Conte qual é a outra opção na pergunta ${p.id}.`);
    res.outro = t.slice(0, OUTRO_MAX);
  }
  return res;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const corpo = await req.text();
  if (corpo.length > 30000) return json({ error: "Envio grande demais." }, 413);
  let p: Record<string, unknown>;
  try { p = JSON.parse(corpo); } catch { return json({ error: "Envio inválido." }, 400); }

  const q = QUESTIONARIOS[String(p.pesquisa ?? "")];
  if (!q) return json({ error: "Pesquisa não encontrada." }, 404);
  const { data: pesq } = await db.from("pesquisas").select("ativa").eq("slug", q.slug).maybeSingle();
  const ativa = !!pesq?.ativa;

  if (p.acao === "status") return json({ ativa, questionario: q });
  if (p.acao === "verificar") {
    const email = String(p.email ?? "").trim().toLowerCase(), whats = String(p.whatsapp ?? "").replace(/\D/g, "");
    if (!EMAIL.test(email) || !WHATS.test(whats)) return json({ error: "Dados inválidos." }, 400);
    try { return json({ ja_respondeu: await jaRespondeu(q.slug, email, whats) }); }
    catch (e) { console.error(e); return json({ error: "Não foi possível conferir agora. Tente de novo em instantes." }, 500); }
  }
  if (p.acao !== "enviar") return json({ error: "Ação inválida." }, 400);
  if (!ativa) return json({ error: "Esta pesquisa foi encerrada.", encerrada: true }, 410);
  if (String(p.site ?? "")) return json({ ok: true }); // campo invisível preenchido: robô

  const envioId = String(p.envio_id ?? "");
  if (!UUID.test(envioId)) return json({ error: "Envio inválido." }, 400);

  try {
    // identificação (início da pesquisa): nome, e-mail e WhatsApp, com ciência do uso dos dados
    const id = (p.identificacao && typeof p.identificacao === "object" ? p.identificacao : {}) as Record<string, unknown>;
    const nome = String(id.nome ?? "").trim().replace(/\s+/g, " ");
    const email = String(id.email ?? "").trim().toLowerCase();
    const whats = String(id.whatsapp ?? "").replace(/\D/g, "");
    if (!nome || nome.length > 120) falha("Informe o seu nome.");
    if (!EMAIL.test(email) || email.length > 254) falha("Informe um e-mail válido.");
    if (!WHATS.test(whats)) falha("Informe um WhatsApp válido, com DDD.");
    if (id.ciente !== true) falha("Para participar, confirme que leu e concorda com o uso dos dados.");
    if (await jaRespondeu(q.slug, email, whats, envioId)) return json({ error: JA, ja_respondeu: true }, 409);

    // respostas, na ordem do questionário, até a pergunta que encerra (se houver)
    const r = (p.respostas && typeof p.respostas === "object" ? p.respostas : {}) as Record<string, unknown>;
    const respostas: Record<string, unknown> = {};
    let situacao = "completa";
    for (const per of q.perguntas) {
      // pergunta condicional (ex.: 2.1): só vale para quem escolheu uma das opções indicadas; para os demais, é ignorada
      if (per.condicao && !valores(respostas[per.condicao.pergunta]).some((x) => per.condicao!.opcoes.includes(x))) continue;
      respostas[per.id] = validar(per, r[per.id]);
      const escolhidas = valores(respostas[per.id]);
      const enc = per.opcoes?.find((o) => o.encerra && escolhidas.includes(o.id))?.encerra;
      if (enc) { situacao = enc; break; }
    }
    const completa = situacao === "completa";

    // perfil (gênero e faixa etária): obrigatório para quem completou; cada um tem "Prefiro não informar"
    if (completa && q.perfil?.length) {
      const pf = (p.perfil && typeof p.perfil === "object" ? p.perfil : {}) as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const per of q.perfil) {
        const v = String(pf[per.id] ?? "");
        const op = per.opcoes.find((o) => o.id === v);
        if (!op) falha(per.id === "genero" ? "Escolha uma opção de gênero." : "Escolha uma faixa etária.");
        out[per.id] = v;
        if (op!.outro) {
          const t = String(pf[per.id + "_outro"] ?? "").trim();
          if (!t) falha("Conte com qual gênero você se identifica ou escolha outra opção.");
          out[per.id + "_outro"] = t.slice(0, 100);
        }
      }
      respostas.perfil = out;
    }

    // pergunta aberta (opcional), exatamente como enviada
    let relato: string | null = null;
    if (completa && typeof p.relato === "string" && p.relato.trim()) {
      if (p.relato.length > 2000) falha("O relato pode ter até 2.000 caracteres.");
      relato = p.relato;
    }

    // novidades (opcional): "sim" é a autorização para receber avisos do lançamento e das vantagens de quem participou
    const nov = (p.novidades && typeof p.novidades === "object" ? p.novidades : null) as Record<string, unknown> | null;
    const quer = completa && nov ? nov.quer === true : null;
    const agora = new Date().toISOString();

    const { error } = await db.from("pesquisa_respostas").upsert({
      pesquisa: q.slug, envio_id: envioId, situacao, versao_questionario: q.versao, respostas, relato, quer_novidades: quer,
      nome, email, whatsapp: whats, identificacao_em: agora, identificacao_versao: q.identificacao.versao, identificacao_texto: q.identificacao.texto,
    }, { onConflict: "envio_id", ignoreDuplicates: true });
    if (error?.code === "23505") return json({ error: JA, ja_respondeu: true }, 409); // corrida entre dois envios da mesma pessoa
    if (error) { console.error("pesquisa_respostas", error.message); return json({ error: "Não foi possível salvar agora. Tente de novo em instantes." }, 500); }
    if (quer) {
      const contato = {
        pesquisa: q.slug, envio_id: envioId, nome, email, whatsapp: whats,
        consentimento_em: agora, consentimento_versao: q.consentimento.versao, consentimento_texto: q.consentimento.texto,
      };
      const { error: e2 } = await db.from("pesquisa_interessados").upsert(contato, { onConflict: "envio_id", ignoreDuplicates: true });
      if (e2) { console.error("pesquisa_interessados", e2.message); return json({ error: "Suas respostas foram salvas, mas não foi possível guardar seu contato. Tente de novo.", respostas_salvas: true }, 500); }
    }
    return json({ ok: true, situacao, contato_salvo: !!quer });
  } catch (e) {
    if (e instanceof Invalido) return json({ error: e.message }, 400);
    console.error(e);
    return json({ error: "Não foi possível salvar agora. Tente de novo em instantes." }, 500);
  }
});
