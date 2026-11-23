// Pesquisas públicas do Studio (página /pesquisa/<slug>/). Sem login: valida tudo aqui antes de gravar.
// { acao: "status", pesquisa }      devolve { ativa, questionario } (o questionário também serve ao painel).
// { acao: "enviar", pesquisa, envio_id, respostas, relato?, novidades? }
//     Grava a participação uma única vez por envio_id (reenvio ou atualização da página não duplica).
//     situacao vem das próprias respostas: Q1 = "Não" encerra (fora_de_curitiba); Q2 = "Não comprei" encerra (sem_compras).
//     novidades: { quer: boolean, id, nome, email, whatsapp, consentimento: true } só para participações completas.
//     O contato vai para outra tabela, com outro identificador, sem ligação com as respostas.
//     O relato (pergunta aberta) é guardado exatamente como foi enviado.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import modaCuritiba from "./questionario.json" with { type: "json" };

type Opcao = { id: string; texto: string; encerra?: string; exclusiva?: boolean; outro?: boolean };
type Pergunta = {
  id: string; tipo: "unica" | "multipla" | "escala" | "matriz"; texto: string; max?: number; min?: number;
  opcoes?: Opcao[]; linhas?: { id: string }[]; colunas?: { id: string }[];
};
type Questionario = { slug: string; versao: string; consentimento: { versao: string; texto: string }; perguntas: Pergunta[] };
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
  // múltipla escolha: { opcoes: string[], outro?: string }
  const o = v as { opcoes?: unknown; outro?: unknown };
  const sel = Array.isArray(o?.opcoes) ? [...new Set(o.opcoes.map(String))] : [];
  if (!sel.length) falha(`Escolha pelo menos uma opção na pergunta ${p.id}.`);
  if (sel.some((s) => !ids.has(s))) falha(`Opção inválida na pergunta ${p.id}.`);
  if (p.max && sel.length > p.max) falha(`Escolha no máximo ${p.max} opções na pergunta ${p.id}.`);
  const exclusivas = (p.opcoes ?? []).filter((x) => x.exclusiva).map((x) => x.id);
  if (sel.some((s) => exclusivas.includes(s)) && sel.length > 1) falha(`A opção escolhida na pergunta ${p.id} não pode ser combinada com outras.`);
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
  if (p.acao !== "enviar") return json({ error: "Ação inválida." }, 400);
  if (!ativa) return json({ error: "Esta pesquisa foi encerrada.", encerrada: true }, 410);
  if (String(p.site ?? "")) return json({ ok: true }); // campo invisível preenchido: robô

  const envioId = String(p.envio_id ?? "");
  if (!UUID.test(envioId)) return json({ error: "Envio inválido." }, 400);

  try {
    // respostas, na ordem do questionário, até a pergunta que encerra (se houver)
    const r = (p.respostas && typeof p.respostas === "object" ? p.respostas : {}) as Record<string, unknown>;
    const respostas: Record<string, unknown> = {};
    let situacao = "completa";
    for (const per of q.perguntas) {
      respostas[per.id] = validar(per, r[per.id]);
      const enc = per.opcoes?.find((o) => o.id === respostas[per.id])?.encerra;
      if (enc) { situacao = enc; break; }
    }
    const completa = situacao === "completa";

    // pergunta aberta (opcional), exatamente como enviada
    let relato: string | null = null;
    if (completa && typeof p.relato === "string" && p.relato.trim()) {
      if (p.relato.length > 2000) falha("O relato pode ter até 2.000 caracteres.");
      relato = p.relato;
    }

    // interesse no lançamento (opcional e independente das respostas)
    const nov = (p.novidades && typeof p.novidades === "object" ? p.novidades : null) as Record<string, unknown> | null;
    const quer = completa && nov ? nov.quer === true : null;
    let contato: Record<string, unknown> | null = null;
    if (quer) {
      const nome = String(nov!.nome ?? "").trim().replace(/\s+/g, " ");
      const email = String(nov!.email ?? "").trim().toLowerCase();
      const whats = String(nov!.whatsapp ?? "").replace(/\D/g, "");
      const contatoId = String(nov!.id ?? "");
      if (!UUID.test(contatoId) || contatoId === envioId) falha("Envio inválido.");
      if (!nome || nome.length > 120) falha("Informe o seu nome.");
      if (!EMAIL.test(email) || email.length > 254) falha("Informe um e-mail válido.");
      if (!/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(whats)) falha("Informe um WhatsApp válido, com DDD.");
      if (nov!.consentimento !== true) falha("Para receber novidades, confirme a autorização.");
      contato = {
        pesquisa: q.slug, envio_id: contatoId, nome, email, whatsapp: whats,
        consentimento_em: new Date().toISOString(), consentimento_versao: q.consentimento.versao, consentimento_texto: q.consentimento.texto,
      };
    }

    const { error } = await db.from("pesquisa_respostas").upsert({
      pesquisa: q.slug, envio_id: envioId, situacao, versao_questionario: q.versao, respostas, relato, quer_novidades: quer,
    }, { onConflict: "envio_id", ignoreDuplicates: true });
    if (error) { console.error("pesquisa_respostas", error.message); return json({ error: "Não foi possível salvar agora. Tente de novo em instantes." }, 500); }
    if (contato) {
      const { error: e2 } = await db.from("pesquisa_interessados").upsert(contato, { onConflict: "envio_id", ignoreDuplicates: true });
      if (e2) { console.error("pesquisa_interessados", e2.message); return json({ error: "Suas respostas foram salvas, mas não foi possível guardar seu contato. Tente de novo.", respostas_salvas: true }, 500); }
    }
    return json({ ok: true, situacao, contato_salvo: !!contato });
  } catch (e) {
    if (e instanceof Invalido) return json({ error: e.message }, 400);
    console.error(e);
    return json({ error: "Não foi possível salvar agora. Tente de novo em instantes." }, 500);
  }
});
