// Autorização de exibição do perfil na Galeria de profissionais (pública; o token pessoal do e-mail identifica o parceiro).
// { acao: "ver", t }  devolve só o que aparece na galeria (nome, cargo, áreas, segmentos, LinkedIn) e a decisão atual.
// { acao: "decidir", t, decisao: "autorizado" | "recusado", especialidade?, linkedin, foto?, remover_foto? }
//     Especialidade: sugerida por IA (Gemini) a partir do campo 13 do cadastro: um termo curto. Só o texto do campo 13
//     vai para a IA (sem nome, e-mail ou contato). A sugestão fica guardada em especialidade_ia; se a IA não responder,
//     usa o rótulo curto por regra. O parceiro pode alterar.
//     Vazia ou igual ao rótulo do campo 13, volta a usar o rótulo do campo 13.
//     Tags: a IA escolhe e resume as áreas e segmentos marcados no cadastro (sem inventar competências), até caber em
//     2 linhas no card; vai para a IA só o perfil profissional (sem nome, e-mail ou contato). Fica em galeria_tags_ia;
//     ao autorizar, as tags da prévia ficam em galeria_tags. Sem resposta da IA, valem as áreas e segmentos.
//     grava a decisão no cadastro e no histórico imutável (texto exibido + versão + dados + navegador).
//     foto: imagem JPEG em base64 (a página já recorta em quadrado e reduz; aqui só JPEG de até 1,5 MB).
//     Ao não autorizar, a foto enviada é apagada.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// Versão e texto exatos apresentados na página de autorização. Ao mudar o texto, mude a versão.
const TEXTO_VERSAO = "galeria-v3-2026-11-15";
const TEXTO = "Autorizo a Dani Moscatelli | Experience Design Studio a exibir, na Galeria de profissionais do site danimoscatelli.com.br, " +
  "o meu nome, especialidade, senioridade, áreas de atuação, segmentos, link do LinkedIn e foto, conforme a prévia apresentada. " +
  "E-mail, telefone e cidade não serão exibidos. Posso solicitar a exclusão do meu perfil da galeria a qualquer momento pelo e-mail " +
  "contato@danimoscatelli.com.br, e também a troca ou a exclusão da foto por esse e-mail.";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const limpa = (s: unknown) => String(s ?? "").replace(/\.\s*$/, "").trim();
// Rótulo curto da especialidade (mesma regra de public.rotulo_especialidade no banco): de um texto longo,
// fica a parte de mais peso, até 40 caracteres.
function rotulo(t: unknown) {
  let s = limpa(t);
  const corta = (re: RegExp) => s.split(re)[0].trim();
  const tenta = (p: string) => { if (p) s = p; return s.length <= 40; };
  s = corta(/\s{2,}|\.\s|:\s|\s[-–—]\s/);
  if (s.length <= 40) return s;
  if (tenta(corta(/\s+(?:com|focad[oa]s?|voltad[oa]s?|especializad[oa]s?)\s/i))) return s;
  if (tenta(s.replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim())) return s;
  if (tenta(corta(/[,;]\s/))) return s;
  return s.slice(0, 40).replace(/\s+\S*$/, "") + "…";
}
// Termo curto sugerido pela IA a partir do texto do campo 13 (até 40 caracteres). Devolve "" se não conseguir.
async function termoIA(texto: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key || !texto) return "";
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: "Você recebe a descrição que um profissional escreveu sobre a própria especialidade. " +
      "Transforme em um rótulo curto de especialidade para um card de perfil: de 1 a 5 palavras, no máximo 40 caracteres, " +
      "com a inicial maiúscula nas palavras principais (preposições e artigos em minúscula). " +
      "Use as palavras da própria pessoa, no idioma em que ela escreveu: não traduza (ex.: \"atuo com pesquisa de usuários e design de serviços\" vira " +
      "\"Pesquisa de Usuários e Design de Serviços\"). Fique com a especialidade de mais peso. Não use verbos, frases, pontuação final, aspas nem markdown. " +
      'Responda somente com JSON: {"rotulo": "..."}' }] },
    contents: [{ role: "user", parts: [{ text: texto.slice(0, 1500) }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 256 },
  });
  const fim = Date.now() + 12000; // no máximo 12 s de espera para a página não demorar
  for (const m of ["gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"]) {
    if (Date.now() > fim - 1500) break;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body, signal: AbortSignal.timeout(Math.min(8000, fim - Date.now())),
      });
      if (!res.ok) { console.error("Gemini", m, res.status); continue; }
      const out = await res.json();
      const t = (out.candidates?.[0]?.content?.parts ?? []).filter((x: { thought?: boolean }) => !x.thought).map((x: { text?: string }) => x.text ?? "").join("");
      const r = String(JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)).rotulo ?? "")
        .replace(/[*_`"“”]/g, "").replace(/\s+/g, " ").replace(/[.;:,]\s*$/, "").trim();
      if (r && r.length <= 40) return r;
      console.error("Gemini", m, "rótulo fora do padrão", r.length);
    } catch (e) { console.error("Gemini", m, String(e).slice(0, 120)); }
  }
  return "";
}
// Tags do card sugeridas pela IA: escolhe e resume as áreas e segmentos marcados (até 6 tags curtas). [] se não conseguir.
async function tagsIA(perfil: { especialidade: string; areas: string[]; segmentos: string[]; atividades: string; conhecimento_segmento: string }): Promise<string[]> {
  const key = Deno.env.get("GEMINI_API_KEY");
  const opcoes = [...perfil.areas, ...perfil.segmentos];
  if (!key || !opcoes.length) return [];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: "Você recebe o perfil profissional de uma pessoa (sem dados pessoais) e a lista de áreas e segmentos que ela marcou. " +
      "Escolha as tags do card de perfil dela: de 3 a 6 tags, as mais relevantes para quem é a pessoa, considerando a especialidade, as atividades e o conhecimento de segmento. " +
      "Regras: cada tag deve vir de um item da lista de áreas e segmentos; você pode encurtar o nome do item (até 24 caracteres, ex.: \"Saúde e serviços hospitalares\" vira \"Saúde\"), " +
      "mas não crie competências, ferramentas ou segmentos que não estejam na lista. Sem repetir sentido entre tags. Inicial maiúscula, sem ponto final, sem aspas nem markdown. " +
      'Responda somente com JSON: {"tags": ["..."]}' }] },
    contents: [{ role: "user", parts: [{ text: JSON.stringify({ ...perfil, atividades: perfil.atividades.slice(0, 1500), conhecimento_segmento: perfil.conhecimento_segmento.slice(0, 1000) }) }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 512 },
  });
  // garantia de que a IA não inventou: toda palavra da tag precisa estar nas áreas e segmentos marcados
  const norm = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const base = norm(opcoes.join(" | "));
  const daLista = (tag: string) => { const ws = norm(tag).split(/[^a-z0-9/]+/).filter((w) => w.length >= 2 && !["de", "da", "do", "das", "dos", "e"].includes(w)); return ws.length > 0 && ws.every((w) => base.includes(w)); };
  const fim = Date.now() + 12000;
  for (const m of ["gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"]) {
    if (Date.now() > fim - 1500) break;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body, signal: AbortSignal.timeout(Math.min(8000, fim - Date.now())),
      });
      if (!res.ok) { console.error("Gemini tags", m, res.status); continue; }
      const out = await res.json();
      const t = (out.candidates?.[0]?.content?.parts ?? []).filter((x: { thought?: boolean }) => !x.thought).map((x: { text?: string }) => x.text ?? "").join("");
      const lista = (JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)).tags ?? []) as unknown[];
      const tags = [...new Set(lista.map((x) => String(x ?? "").replace(/[*_`"“”]/g, "").replace(/\s+/g, " ").replace(/[.;:,]\s*$/, "").trim())
        .filter((x) => x && x.length <= 24 && daLista(x)))].slice(0, 6);
      if (tags.length) return tags;
      console.error("Gemini tags", m, "sem tags válidas");
    } catch (e) { console.error("Gemini tags", m, String(e).slice(0, 120)); }
  }
  return [];
}
const linkedinOk = (u: string) => !u || /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(u);
// Link do LinkedIn informado no cadastro: aceita "linkedin.com/in/..." ou "www.linkedin.com/..." e completa com https://.
const normalizaLinkedin = (u: unknown) => { const v = String(u ?? "").trim(); return /^(www\.)?([a-z]{2,3}\.)?linkedin\.com\//i.test(v) ? "https://" + v.replace(/^https?:\/\//i, "") : v.replace(/^http:\/\//i, "https://"); };
const BUCKET = "galeria";
const caminhoDaUrl = (u: string | null) => { const m = (u ?? "").match(/\/object\/public\/galeria\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; };
async function apagarFoto(url: string | null) { const c = caminhoDaUrl(url); if (c) await admin.storage.from(BUCKET).remove([c]); }
function lerFoto(b64: unknown): Uint8Array | null {
  const s = String(b64 ?? "").replace(/^data:image\/jpeg;base64,/, "");
  if (!s || s.length > 2_100_000) return null;
  let bytes: Uint8Array;
  try { bytes = Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); } catch { return null; }
  return bytes.length > 100 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? bytes : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const p = await req.json().catch(() => ({}));
  const t = String(p.t ?? "");
  if (!UUID.test(t)) return json({ error: "Link inválido. Use o link que está no e-mail recebido." }, 400);
  const { data: r, error } = await admin.from("cadastros")
    .select("id, nome, principal_especializacao, especialidade_ia, especialidade_ia_de, galeria_tags_ia, galeria_tags_ia_de, atividades_entregaveis, conhecimento_segmento, tempo_especialidade, areas_experiencia, segmentos, linkedin, galeria_status, galeria_cargo, galeria_linkedin, galeria_foto_url")
    .eq("galeria_token", t).maybeSingle();
  if (error) { console.error(error.message); return json({ error: "Não foi possível carregar agora. Tente novamente." }, 500); }
  if (!r) return json({ error: "Link inválido. Use o link que está no e-mail recebido." }, 404);

  const esp = rotulo(r.principal_especializacao);
  // sugestões da IA (especialidade e tags), geradas em paralelo uma vez por versão do cadastro e guardadas;
  // sem resposta da IA, valem o rótulo por regra e as áreas e segmentos
  const campo13 = limpa(r.principal_especializacao);
  const perfil = { especialidade: campo13, areas: (r.areas_experiencia ?? []).map(limpa), segmentos: (r.segmentos ?? []).map(limpa),
    atividades: String(r.atividades_entregaveis ?? ""), conhecimento_segmento: String(r.conhecimento_segmento ?? "") };
  const origemTags = JSON.stringify(perfil);
  let sugestao = r.especialidade_ia_de === campo13 && r.especialidade_ia ? r.especialidade_ia : "";
  let tags: string[] = r.galeria_tags_ia_de === origemTags && r.galeria_tags_ia?.length ? r.galeria_tags_ia : [];
  if (p.acao === "ver") {
    const gerarTermo = !sugestao && !r.galeria_cargo && !!campo13;
    const [novoTermo, novasTags] = await Promise.all([gerarTermo ? termoIA(campo13) : Promise.resolve(""), tags.length ? Promise.resolve([]) : tagsIA(perfil)]);
    const salvar: Record<string, unknown> = {};
    if (novoTermo) { sugestao = novoTermo; salvar.especialidade_ia = novoTermo; salvar.especialidade_ia_de = campo13; }
    if (novasTags.length) { tags = novasTags; salvar.galeria_tags_ia = novasTags; salvar.galeria_tags_ia_de = origemTags; }
    if (Object.keys(salvar).length) await admin.from("cadastros").update(salvar).eq("id", r.id);
  }
  const dados = {
    nome: r.nome,
    cargo: r.galeria_cargo || sugestao || esp,
    tags,
    tempo: limpa(r.tempo_especialidade),
    areas: (r.areas_experiencia ?? []).map(limpa),
    segmentos: (r.segmentos ?? []).map(limpa),
    linkedin: r.galeria_linkedin ?? (linkedinOk(normalizaLinkedin(r.linkedin)) ? normalizaLinkedin(r.linkedin) : ""),
    foto_url: r.galeria_foto_url ?? "",
  };
  if (p.acao === "ver") return json({ ...dados, status: r.galeria_status, texto: TEXTO, texto_versao: TEXTO_VERSAO });
  if (p.acao !== "decidir") return json({ error: "Ação inválida" }, 400);

  const decisao = p.decisao === "autorizado" ? "autorizado" : p.decisao === "recusado" ? "recusado" : "";
  if (!decisao) return json({ error: "Escolha uma opção." }, 400);
  const linkedin = normalizaLinkedin(p.linkedin).slice(0, 300);
  const espIn = typeof p.especialidade === "string" ? limpa(p.especialidade).slice(0, 80) : null;
  const galeriaCargo = decisao === "autorizado" && espIn !== null ? (espIn && espIn !== esp ? espIn : null) : r.galeria_cargo;
  if (!linkedinOk(linkedin)) return json({ error: "Informe um link do LinkedIn começando com https://www.linkedin.com/" }, 400);

  // Foto: nova (substitui e apaga a anterior), removida a pedido, ou apagada quando não autoriza.
  let fotoUrl: string | null = r.galeria_foto_url;
  if (decisao === "recusado" || p.remover_foto) { await apagarFoto(fotoUrl); fotoUrl = null; }
  if (decisao === "autorizado" && p.foto) {
    const bytes = lerFoto(p.foto);
    if (!bytes) return json({ error: "Não foi possível usar esta imagem. Envie uma foto em JPG, PNG ou WEBP." }, 400);
    const caminho = `${r.id}/${crypto.randomUUID()}.jpg`;
    const { error: eUp } = await admin.storage.from(BUCKET).upload(caminho, bytes, { contentType: "image/jpeg", upsert: false, cacheControl: "300" });
    if (eUp) { console.error(eUp.message); return json({ error: "Não foi possível enviar a foto agora. Tente novamente." }, 500); }
    await apagarFoto(fotoUrl);
    fotoUrl = admin.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
  }

  const agora = new Date().toISOString();
  const exibidos = { ...dados, cargo: galeriaCargo || esp, linkedin, foto_url: fotoUrl ?? "" };
  const { error: e1 } = await admin.from("galeria_autorizacoes").insert({
    cadastro_id: r.id, decisao, texto_versao: TEXTO_VERSAO, texto: TEXTO,
    dados_exibidos: decisao === "autorizado" ? exibidos : {},
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
  });
  if (e1) { console.error(e1.message); return json({ error: "Não foi possível registrar agora. Tente novamente." }, 500); }
  const { error: e2 } = await admin.from("cadastros").update({
    galeria_status: decisao, galeria_decidido_em: agora,
    galeria_linkedin: decisao === "autorizado" ? (linkedin || null) : r.galeria_linkedin,
    galeria_foto_url: fotoUrl, galeria_cargo: galeriaCargo,
    // tags aprovadas na prévia (as da IA); sem tags da IA, o card usa as áreas e segmentos
    galeria_tags: decisao === "autorizado" && tags.length ? tags : null,
  }).eq("id", r.id);
  if (e2) { console.error(e2.message); return json({ error: "Não foi possível registrar agora. Tente novamente." }, 500); }
  return json({ ok: true, status: decisao, foto_url: fotoUrl ?? "" });
});
