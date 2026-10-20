// DM | Experience Intelligence · interpretação do desafio pela IA (Corte 2, C2-03; limites em D-015).
// Recebe { challenge_id } com o token da pessoa. Antes de chamar a IA, reserva o uso no banco (ei_ai_begin):
// confere membro, acesso de teste, limites e se a IA está ligada; se já existe sugestão guardada para o
// desafio, devolve essa e não chama a IA de novo. Não grava nada no desafio: a pessoa revisa, edita e
// confirma na tela. Ao final, ei_ai_finish guarda a sugestão e registra modelo e versão do prompt.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { z } from "npm:zod@4.6.7";

const PROMPT_VERSION = "interpretacao_desafio_v1";
const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-flash-latest";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
// Respostas de ei_ai_begin que impedem a chamada, traduzidas para a tela.
const STATUS: Record<string, string> = { disabled: "desativado", limit: "limite", busy: "ocupado", no_access: "sem_acesso", confirmed: "confirmado" };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SISTEMA = `Você organiza o primeiro registro de um desafio de melhoria de um serviço. Uma pessoa descreveu, com as próprias palavras, algo que quer melhorar. Sua tarefa é propor uma estrutura inicial que ela vai revisar e corrigir.
Regras obrigatórias:
- Escreva em português do Brasil, com acentuação e ortografia corretas, em linguagem simples, sem termos técnicos de design, pesquisa ou metodologia.
- Use somente o que o texto diz. Não invente fatos, números, locais, causas, fontes nem pessoas.
- Não diga qual é a causa do problema e não proponha soluções (nem contratar pessoas, nem sistemas, aplicativos, totens ou qualquer outra mudança). Não presuma que a solução seja digital.
- title: nome curto (até 80 caracteres) que descreva o que se quer melhorar, sem apontar causa.
- affected_people: grupos de pessoas citados ou claramente implicados no texto (quem vive e quem entrega a experiência). Se não estiver claro, devolva lista vazia.
- context: preencha industry (segmento), department (área), channels (canais, ex.: presencial, telefone, site) e site (local ou unidade) apenas se o texto indicar. Omita o que não estiver no texto.
- desired_outcome: o que melhoraria para as pessoas, redigido como proposta a confirmar, apoiado no texto. Se não houver base, devolva texto vazio.
- known_information: o que o texto informa, como declaração de quem escreveu (ex.: "há relatos de demora"), sem transformar em fato medido.
- unknown_information: informações importantes que ainda não se sabe para entender a situação (ex.: quanto tempo as pessoas esperam). Não liste causas.
- Não reproduza nomes de pessoas, documentos, dados de contato nem dados de saúde que permitam identificar alguém.
- Nunca use travessão (—) nem meia-risca (–).
- Responda somente com JSON válido, sem texto antes ou depois, no formato:
{"title":"","affected_people":[],"context":{"industry":"","department":"","channels":[],"site":""},"desired_outcome":"","known_information":[],"unknown_information":[]}`;

const limpa = (s: unknown) => String(s ?? "").replace(/\s*[—–]\s*/g, ", ").trim();
const lista = (max: number, len: number) =>
  z.array(z.unknown()).default([]).transform((v) => [...new Set(v.map(limpa).filter(Boolean).map((t) => t.slice(0, len)))].slice(0, max));
const opcional = (len: number) => z.unknown().optional().transform((v) => limpa(v).slice(0, len) || undefined);
const Proposta = z.object({
  title: z.unknown().transform((v) => limpa(v).slice(0, 120)).pipe(z.string().min(3)),
  affected_people: lista(10, 120),
  context: z.object({ industry: opcional(80), department: opcional(120), channels: lista(8, 60), site: opcional(200) }).default({ channels: [] }),
  desired_outcome: z.unknown().optional().transform((v) => limpa(v).slice(0, 600)),
  known_information: lista(15, 300),
  unknown_information: lista(15, 300),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const authorization = req.headers.get("Authorization") ?? "";
  // Cliente com o token da pessoa: o banco só devolve o desafio se ela for membro da organização.
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { challenge_id } = await req.json().catch(() => ({}));
  if (typeof challenge_id !== "string") return json({ error: "Desafio inválido." }, 400);

  const { data: r, error } = await sb.rpc("ei_ai_begin", { p_challenge: challenge_id });
  if (error || !r) return json({ error: "Desafio não encontrado." }, 404);
  if (r.status === "cached") return json({ proposal: r.proposal, meta: r.meta, cached: true });
  if (r.status !== "go") return json({ error: STATUS[r.status as string] ?? "falha" }, 409);
  const usage = r.usage_id as string;
  const falhou = async (code: string, status = 502) => {
    await sb.rpc("ei_ai_finish", { p_usage: usage, p_proposal: null, p_meta: {} });
    return json({ error: code }, status);
  };

  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return falhou("sem_chave", 503);
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SISTEMA }] },
    contents: [{ role: "user", parts: [{ text: `Texto escrito pela pessoa:\n"""\n${r.statement}\n"""` }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 8192 },
  });
  // No máximo duas chamadas: o modelo configurado e, se ele estiver ocupado ou indisponível, um mais leve.
  const modelos = [...new Set([MODEL, "gemini-flash-lite-latest"])];
  let res: Response | null = null, out: any = {}, usado = "";
  for (const m of modelos) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body,
    }).catch(() => null);
    if (!res) continue;
    out = await res.json().catch(() => ({}));
    if (res.ok) { usado = m; break; }
    console.error("Gemini", m, res.status, JSON.stringify(out?.error ?? out).slice(0, 300));
    if (![429, 500, 503, 404].includes(res.status)) break;
  }
  if (!res || !res.ok) return falhou(res && [429, 503].includes(res.status) ? "ocupado" : "falha");

  const texto = (out.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
  let bruto: unknown;
  try { bruto = JSON.parse(texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1)); } catch { return falhou("formato"); }
  const proposta = Proposta.safeParse(bruto);
  if (!proposta.success) { console.error("Proposta inválida", JSON.stringify(bruto).slice(0, 400)); return falhou("formato"); }

  const meta = { model: usado, prompt_version: PROMPT_VERSION };
  await sb.rpc("ei_ai_finish", { p_usage: usage, p_proposal: proposta.data, p_meta: meta });
  return json({ proposal: proposta.data, meta });
});
