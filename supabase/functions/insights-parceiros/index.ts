// Gera, com o Google Gemini (plano gratuito), conclusões para o dashboard da Rede de Parceiros.
// Chamada com o token da sessão; só aceita a conta de administradora. Analisa a base inteira e
// devolve { analise: {resumo, forcas, lacunas, recomendacoes}, perfis: { <id>: "como pode contribuir" } }.
// Com { desafio: "texto" }, devolve { ranking: [{ id, aderencia (0 a 100), motivo }] } para aquele desafio.
// Envia ao Gemini apenas respostas de múltipla escolha, a especialização declarada, as atividades/entregáveis
// e o conhecimento de segmento, sem nome, e-mail, telefone, empresa, links ou cidade.
// O resultado fica em cache (tabela insights_parceiros) e só é gerado de novo quando os dados mudam.
// Com { somente_cache: true }, não chama a IA: devolve a análise da base atual, a última análise
// guardada com desatualizada: true (os cadastros mudaram desde então) ou { vazio: true }.
// Com { acao: "novo_cadastro", id } (chamada pelo gatilho do banco a cada novo cadastro, sem login): gera a análise
// da base atual em segundo plano. Só vale para um cadastro criado há menos de 10 minutos (o id vem do banco).
// Quando um modelo está ocupado (503/429) ou devolve uma resposta que não é JSON válido (por exemplo,
// cortada no meio), tenta o próximo modelo gratuito da lista.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-flash-latest";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// Campos enviados à IA (nenhum identifica a pessoa).
const CAMPOS = [
  "atuacao_pj", "modelo_atuacao", "formas_colaboracao", "disponibilidade_colaborar", "areas_experiencia",
  "principal_especializacao", "etapas_projeto", "segmentos", "colaboracao_multidisciplinar", "nivel_formacao",
  "idiomas", "tempo_especialidade", "tempo_independente", "lideranca", "possui_portfolio",
  "servicos_especialista_externo", "ferramentas", "formatos_atuacao", "viagens", "presencial_curitiba",
  "horas_semanais", "formatos_contratacao", "precificacao", "equipe_propria", "interesse_parceria",
  "como_conheceu", "interesse_whatsapp",
];

const SISTEMA = `Você é analista de talentos da Dani Moscatelli | Experience Design Studio. A Rede de Parceiros reúne profissionais independentes que se cadastraram para colaborar em projetos de Design, Experiência, Negócios, Tecnologia e Inovação. Seu trabalho é ajudar a Dani a escolher os parceiros certos para cada projeto.
Regras:
- Escreva em português do Brasil, com acentuação e ortografia corretas, frases curtas e diretas, em tom profissional.
- Não repita as perguntas do formulário: traga conclusões que ajudem a decidir, com números (percentual sobre o total de parceiros ou quantidade).
- Cruze informações (ex.: liderança x segmento, senioridade x área, disponibilidade x formato), como em "Mais de 50% dos parceiros podem liderar projetos em Saúde".
- Use apenas os dados recebidos. Não invente números, nomes, tendências ou causas. Se a base for pequena (menos de 10 parceiros), seja cauteloso e cite a quantidade.
- Nunca use travessão (—) nem meia-risca (–). Use vírgula, ponto ou dois-pontos.
- O campo precificacao é uma resposta antiga sobre forma de cobrança: considere junto com formatos_contratacao.
- Para cada parceiro (campo id), escreva em "perfis" uma visão estratégica de 25 a 40 palavras sobre como ele pode contribuir com os projetos do estúdio: o papel que pode assumir, os tipos de problema que ajuda a resolver, as entregas em que agrega mais valor e o diferencial ao combinar especialidade, áreas, segmentos, etapas de projeto, atividades e entregáveis e conhecimento de segmento. Não repita tempo de carreira, tempo na especialidade, senioridade, horas semanais nem disponibilidade, que já aparecem no card. Não use o nome da pessoa.
- Responda somente com JSON válido, sem texto antes ou depois, no formato:
{"analise": {"resumo": "2 a 3 frases sobre o perfil geral da rede", "forcas": ["2 a 4 pontos fortes"], "lacunas": ["2 a 4 lacunas de competência, segmento ou disponibilidade"], "recomendacoes": ["2 a 4 recomendações práticas para montar equipes e atrair parceiros"]}, "perfis": {"<id>": "frase"}}`;

const SISTEMA_DESAFIO = `Você é analista de talentos da Dani Moscatelli | Experience Design Studio. Recebe o desafio de um projeto e os perfis da Rede de Parceiros (profissionais independentes). Avalie o quanto cada perfil atende ao desafio.
Regras:
- Considere especialidade, áreas de experiência, segmentos, etapas de projeto, atividades e entregáveis, conhecimento de segmento, senioridade, liderança, disponibilidade, horas, formato (remoto, presencial, viagens) e idiomas, conforme o desafio pedir.
- aderencia é um número de 0 a 100: 80 ou mais atende muito bem, 50 a 79 atende em parte, abaixo de 50 atende pouco.
- motivo: de 20 a 35 palavras em português do Brasil, com acentuação e ortografia corretas. Cruze o desafio com o perfil: diga como a pessoa contribuiria neste desafio específico (que parte assumiria, quais entregas e por que a experiência dela ajuda) e, se houver, o que falta. Não repita tempo de carreira, senioridade, horas semanais nem disponibilidade, a não ser que o desafio peça isso. Não use o nome da pessoa.
- Use apenas os dados recebidos. Não invente informações.
- Nunca use travessão (—) nem meia-risca (–).
- Inclua todos os perfis, do mais aderente para o menos aderente.
- Responda somente com JSON válido no formato: {"ranking": [{"id": "<id>", "aderencia": 0, "motivo": "frase"}]}`;

async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const pedido = await req.json().catch(() => ({}));

  // novo cadastro: dispara a análise da base em segundo plano e responde na hora
  if (pedido?.acao === "novo_cadastro") {
    const id = String(pedido.id ?? "");
    if (!UUID.test(id)) return json({ error: "id inválido" }, 400);
    const { data: c } = await admin.from("cadastros").select("created_at").eq("id", id).maybeSingle();
    if (!c || Date.now() - new Date(c.created_at).getTime() > 10 * 60 * 1000) return json({ error: "Sem permissão" }, 403);
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil(analisar({}).then((r) => console.log("Análise automática", r.status)));
    return json({ ok: true }, 202);
  }

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  if (auth.user?.app_metadata?.role !== "admin") return json({ error: "Sem permissão" }, 403);
  return analisar(pedido);
});

// deno-lint-ignore no-explicit-any
async function analisar(pedido: any): Promise<Response> {
  const desafio = typeof pedido?.desafio === "string" ? pedido.desafio.trim().slice(0, 3000) : "";

  // A análise considera sempre a base inteira de parceiros.
  const extras = ["atividades_entregaveis", "conhecimento_segmento"];
  const { data: rows, error } = await admin.from("cadastros").select(["id", "cidade_estado", ...CAMPOS, ...extras].join(",")).order("id");
  if (error) return json({ error: error.message }, 500);
  if (!rows?.length) return json(desafio ? { ranking: [] } : { analise: {}, perfis: {} });

  // Só o estado (sigla) entra; a cidade fica de fora.
  const base = rows.map((r: Record<string, unknown>) => {
    const o: Record<string, unknown> = { id: r.id };
    for (const k of [...CAMPOS, ...extras]) if (r[k] !== null && r[k] !== "" && !(Array.isArray(r[k]) && !(r[k] as unknown[]).length)) o[k] = r[k];
    const uf = String(r.cidade_estado ?? "").match(/\b([A-Z]{2})\s*$/);
    if (uf) o.estado = uf[1];
    return o;
  });
  const hash = await sha256(MODEL + (desafio ? "|desafio2|" + desafio : "|v3|") + JSON.stringify(base));
  const { data: cached } = await admin.from("insights_parceiros").select("conteudo, gerado_em").eq("hash", hash).maybeSingle();
  if (cached) return json({ ...cached.conteudo, gerado_em: cached.gerado_em, base: base.length });
  if (!desafio && pedido?.somente_cache) {
    const { data: ultimas } = await admin.from("insights_parceiros").select("conteudo, gerado_em, base").order("gerado_em", { ascending: false }).limit(30);
    const ultima = (ultimas ?? []).find((x: { conteudo?: { analise?: unknown } }) => x.conteudo?.analise);
    return json(ultima ? { ...ultima.conteudo, gerado_em: ultima.gerado_em, base: ultima.base, desatualizada: true } : { vazio: true });
  }

  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return json({ error: "sem_chave" }, 503);

  // No plano gratuito o modelo às vezes fica ocupado (503) ou no limite (429): tenta de novo e,
  // se continuar, passa para outro modelo gratuito. Uma resposta que não é JSON válido também passa para o próximo.
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: desafio ? SISTEMA_DESAFIO : SISTEMA }] },
    contents: [{
      role: "user",
      parts: [{ text: (desafio ? `Desafio do projeto:\n${desafio}\n\n` : "") + `Total de parceiros na base: ${base.length}.\nRespostas (uma por parceiro, sem dados pessoais):\n${JSON.stringify(base)}` }],
    }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 16384 },
  });
  const modelos = [...new Set([MODEL, "gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"])];
  // deno-lint-ignore no-explicit-any
  let conteudo: any = null, ultimoStatus = 0;
  tentativas: for (const m of modelos) {
    for (let i = 0; i < 2; i++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body,
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok) {
        const cand = out.candidates?.[0];
        const text = (cand?.content?.parts ?? []).filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text ?? "").join("");
        try { conteudo = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); break tentativas; }
        catch {
          // só o tamanho e o motivo de término vão para o log (sem o conteúdo)
          console.error("Gemini", m, "resposta inválida", cand?.finishReason ?? "?", text.length);
          ultimoStatus = 422;
          break; // próximo modelo
        }
      }
      ultimoStatus = res.status;
      console.error("Gemini", m, res.status, JSON.stringify(out?.error ?? out).slice(0, 300));
      if (![429, 500, 503, 404].includes(res.status)) break tentativas;
      if (res.status === 404) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  if (!conteudo) return json({ error: [429, 503].includes(ultimoStatus) ? "ocupado" : `Falha ao gerar a análise (${ultimoStatus}).` }, 502);
  const limpa = (s: unknown) => String(s ?? "").replace(/\s*[—–]\s*/g, ", ").trim();
  const lista = (v: unknown) => (Array.isArray(v) ? v : []).map(limpa).filter(Boolean).slice(0, 5);
  const ids = new Set(base.map((b) => b.id as string));
  let final: Record<string, unknown>;
  if (desafio) {
    final = { ranking: (Array.isArray(conteudo.ranking) ? conteudo.ranking : [])
      .filter((x: { id?: string }) => x && ids.has(String(x.id)))
      .map((x: { id: string; aderencia?: unknown; motivo?: unknown }) => ({ id: x.id, aderencia: Math.max(0, Math.min(100, Math.round(Number(x.aderencia) || 0))), motivo: limpa(x.motivo) })) };
  } else {
    const a = conteudo.analise ?? {};
    final = {
      analise: { resumo: limpa(a.resumo), forcas: lista(a.forcas), lacunas: lista(a.lacunas), recomendacoes: lista(a.recomendacoes) },
      perfis: Object.fromEntries(Object.entries(conteudo.perfis ?? {}).filter(([id]) => ids.has(id)).map(([id, t]) => [id, limpa(t)]).filter(([, t]) => t)),
    };
  }
  const { data: saved } = await admin.from("insights_parceiros").upsert({ hash, conteudo: final, base: base.length }).select("gerado_em").single();
  return json({ ...final, gerado_em: saved?.gerado_em ?? new Date().toISOString(), base: base.length });
}
