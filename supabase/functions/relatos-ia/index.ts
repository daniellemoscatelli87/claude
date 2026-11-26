// Agrupa por temas, com o Google Gemini (plano gratuito), os relatos da pergunta aberta de uma pesquisa do Studio.
// Chamada com o token da sessão; só aceita a conta de administradora.
// { pesquisa } devolve { temas: [{ nome, resumo, ids }], sintese, base, gerado_em }.
// { pesquisa, somente_cache: true } não chama a IA: devolve a última análise guardada (com desatualizada: true se os
// relatos mudaram depois) ou { vazio: true }.
// Envia ao Gemini só o texto de cada relato, com um número no lugar do identificador. Nome, e-mail, WhatsApp e as
// outras respostas não vão. E-mails e números de telefone escritos dentro do relato são trocados por "[contato]".
// O resultado fica em cache (tabela pesquisa_relatos_ia) e só é gerado de novo quando os relatos mudam.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// Modelos rápidos primeiro (o agrupamento não precisa de raciocínio longo); cada tentativa tem tempo máximo
// e a chamada toda tem um prazo, para a administradora não ficar esperando.
const MODEL = Deno.env.get("GEMINI_MODEL_RELATOS") || "gemini-2.5-flash-lite";
const TEMPO_TENTATIVA = 20000, PRAZO_TOTAL = 55000;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const SISTEMA = `Você é pesquisadora de experiência do cliente da Dani Moscatelli | Experience Design Studio. Recebe relatos de uma pesquisa sobre como as pessoas procuram e compram roupas, calçados e acessórios em Curitiba e Região Metropolitana. Cada relato responde: "Você já teve alguma experiência frustrante ao procurar ou comprar roupas e acessórios?".
Tarefa: agrupar os relatos por tema, para mostrar o que mais frustra as pessoas.
Regras:
- Crie de 2 a 7 temas curtos (2 a 5 palavras), específicos e úteis para decidir (ex.: "Falta de numeração grande", "Peça diferente da foto"). Evite temas genéricos como "Outros" ou "Experiência ruim".
- Para cada tema, escreva um resumo de 1 a 2 frases sobre o que os relatos dizem, citando quantos relatos entram nele.
- Cada relato pode entrar em mais de um tema. Inclua em "ids" os números dos relatos de cada tema. Um relato que não diz nada sobre a experiência pode ficar sem tema.
- Em "sintese", escreva de 2 a 3 frases com o que os relatos mostram em conjunto e o que vale investigar. Deixe claro que é uma leitura de relatos, não uma conclusão.
- Use apenas o que está escrito nos relatos. Não invente causas, números, lojas ou pessoas. Não cite nomes.
- Escreva em português do Brasil, sempre com acentos e cedilha (ex.: frustrações, peças, padronização, calçados), ortografia correta e frases curtas e diretas.
- Nunca use travessão (—) nem meia-risca (–).
- Responda somente com JSON válido, sem texto antes ou depois, no formato:
{"temas": [{"nome": "tema", "resumo": "frase", "ids": [1, 2]}], "sintese": "frases"}`;

async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
// e-mails e telefones escritos no relato não vão para a IA
const mascarar = (t: string) => t
  .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[contato]")
  .replace(/\+?\d[\d\s().-]{7,}\d/g, (m) => (m.replace(/\D/g, "").length >= 8 ? "[contato]" : m));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  if (auth.user?.app_metadata?.role !== "admin") return json({ error: "Sem permissão" }, 403);
  const pedido = await req.json().catch(() => ({}));
  const pesquisa = String(pedido?.pesquisa ?? "");
  if (!/^[a-z0-9-]{1,60}$/.test(pesquisa)) return json({ error: "Pesquisa inválida." }, 400);

  const { data: rows, error } = await admin.from("pesquisa_respostas").select("id, relato").eq("pesquisa", pesquisa).eq("situacao", "completa").not("relato", "is", null).order("created_at");
  if (error) return json({ error: error.message }, 500);
  const relatos = (rows ?? []).filter((r: { relato: string | null }) => r.relato && r.relato.trim()) as { id: string; relato: string }[];
  if (!relatos.length) return json({ temas: [], sintese: "", base: 0 });

  const textos = relatos.map((r, i) => ({ n: i + 1, texto: mascarar(r.relato.trim()).slice(0, 2000) }));
  const hash = await sha256(MODEL + "|relatos-v1|" + pesquisa + "|" + JSON.stringify(relatos.map((r, i) => [r.id, textos[i].texto])));
  const { data: cached } = await admin.from("pesquisa_relatos_ia").select("conteudo, gerado_em, base").eq("hash", hash).maybeSingle();
  if (cached) return json({ ...cached.conteudo, base: cached.base, gerado_em: cached.gerado_em });
  if (pedido?.somente_cache) {
    const { data: ultima } = await admin.from("pesquisa_relatos_ia").select("conteudo, gerado_em, base").eq("pesquisa", pesquisa).order("gerado_em", { ascending: false }).limit(1).maybeSingle();
    return json(ultima ? { ...ultima.conteudo, base: ultima.base, gerado_em: ultima.gerado_em, desatualizada: true } : { vazio: true });
  }

  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return json({ error: "sem_chave" }, 503);
  // modelos 2.5 aceitam desligar o "raciocínio" (thinkingBudget 0), o que deixa a resposta bem mais rápida
  const corpoPara = (m: string) => JSON.stringify({
    systemInstruction: { parts: [{ text: SISTEMA }] },
    contents: [{ role: "user", parts: [{ text: `Total de relatos: ${textos.length}.\nRelatos (número e texto):\n${JSON.stringify(textos)}` }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 4096, ...(m.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
  });
  // No plano gratuito o modelo às vezes fica ocupado (503) ou no limite (429): tenta de novo e passa para outro modelo gratuito.
  const modelos = [...new Set([MODEL, "gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-flash-latest"])];
  const inicio = Date.now();
  // deno-lint-ignore no-explicit-any
  let conteudo: any = null, ultimoStatus = 0;
  tentativas: for (const m of modelos) {
    for (let i = 0; i < 2; i++) {
      const resta = PRAZO_TOTAL - (Date.now() - inicio);
      if (resta < 3000) break tentativas;
      let res: Response;
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
          method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body: corpoPara(m), signal: AbortSignal.timeout(Math.min(TEMPO_TENTATIVA, resta)),
        });
      } catch { console.error("Gemini", m, "demorou demais"); ultimoStatus = 504; break; } // próximo modelo
      const out = await res.json().catch(() => ({}));
      if (res.ok) {
        const cand = out.candidates?.[0];
        const text = (cand?.content?.parts ?? []).filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text ?? "").join("");
        try { conteudo = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); break tentativas; }
        catch { console.error("Gemini", m, "resposta inválida", cand?.finishReason ?? "?", text.length); ultimoStatus = 422; break; } // sem o conteúdo no log
      }
      ultimoStatus = res.status;
      console.error("Gemini", m, res.status, JSON.stringify(out?.error?.status ?? out?.error?.code ?? "").slice(0, 80));
      if (res.status === 400 && m.startsWith("gemini-2.5")) break; // configuração não aceita por este modelo: tenta o próximo
      if (![429, 500, 503, 404].includes(res.status)) break tentativas;
      if (res.status === 404) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  if (!conteudo) return json({ error: [429, 503, 504].includes(ultimoStatus) ? "ocupado" : `Falha ao agrupar os relatos (${ultimoStatus}).` }, 502);

  const limpa = (s: unknown) => String(s ?? "").replace(/\s*[—–]\s*/g, ", ").trim();
  // os números voltam a ser os identificadores das respostas; números inventados são descartados
  const temas = (Array.isArray(conteudo.temas) ? conteudo.temas : []).map((t: { nome?: unknown; resumo?: unknown; ids?: unknown }) => ({
    nome: limpa(t.nome).slice(0, 80), resumo: limpa(t.resumo).slice(0, 400),
    ids: [...new Set((Array.isArray(t.ids) ? t.ids : []).map((x) => Number(x)).filter((x) => Number.isInteger(x) && x >= 1 && x <= relatos.length))].map((x) => relatos[x - 1].id),
  })).filter((t: { nome: string; ids: string[] }) => t.nome && t.ids.length).sort((a: { ids: string[] }, b: { ids: string[] }) => b.ids.length - a.ids.length).slice(0, 7);
  const final = { temas, sintese: limpa(conteudo.sintese).slice(0, 800), modelo: "Google Gemini" };
  const { data: saved } = await admin.from("pesquisa_relatos_ia").upsert({ hash, pesquisa, conteudo: final, base: relatos.length }).select("gerado_em").single();
  return json({ ...final, base: relatos.length, gerado_em: saved?.gerado_em ?? new Date().toISOString() });
});
