// Autorização de exibição do perfil na Galeria de profissionais (pública; o token pessoal do e-mail identifica o parceiro).
// { acao: "ver", t }  devolve só o que aparece na galeria (nome, cargo, áreas, segmentos, LinkedIn) e a decisão atual.
// { acao: "decidir", t, decisao: "autorizado" | "recusado", cargo, linkedin }
//     grava a decisão no cadastro e no histórico imutável (texto exibido + versão + dados + navegador).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// Versão e texto exatos apresentados na página de autorização. Ao mudar o texto, mude a versão.
const TEXTO_VERSAO = "galeria-v1-2026-11-14";
const TEXTO = "Autorizo a Dani Moscatelli | Experience Design Studio a exibir, na Galeria de profissionais do site danimoscatelli.com.br, " +
  "o meu nome, cargo, áreas de atuação, segmentos, link do LinkedIn e a foto do meu perfil do LinkedIn, conforme a prévia apresentada. " +
  "E-mail, telefone e cidade não serão exibidos. Posso retirar esta autorização a qualquer momento pelo mesmo link ou pelo e-mail " +
  "contato@danimoscatelli.com.br, e também solicitar a troca ou a exclusão da foto por esse e-mail.";

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
const linkedinOk = (u: string) => !u || /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(u);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const p = await req.json().catch(() => ({}));
  const t = String(p.t ?? "");
  if (!UUID.test(t)) return json({ error: "Link inválido. Use o link que está no e-mail recebido." }, 400);
  const { data: r, error } = await admin.from("cadastros")
    .select("id, nome, principal_especializacao, areas_experiencia, segmentos, linkedin, galeria_status, galeria_cargo, galeria_linkedin")
    .eq("galeria_token", t).maybeSingle();
  if (error) { console.error(error.message); return json({ error: "Não foi possível carregar agora. Tente novamente." }, 500); }
  if (!r) return json({ error: "Link inválido. Use o link que está no e-mail recebido." }, 404);

  const esp = limpa(r.principal_especializacao);
  const dados = {
    nome: r.nome,
    cargo: r.galeria_cargo ?? (esp.length <= 60 ? esp : ""),
    areas: (r.areas_experiencia ?? []).map(limpa),
    segmentos: (r.segmentos ?? []).map(limpa),
    linkedin: r.galeria_linkedin ?? (linkedinOk(String(r.linkedin ?? "").trim()) ? String(r.linkedin ?? "").trim() : ""),
  };
  if (p.acao === "ver") return json({ ...dados, status: r.galeria_status, texto: TEXTO, texto_versao: TEXTO_VERSAO });
  if (p.acao !== "decidir") return json({ error: "Ação inválida" }, 400);

  const decisao = p.decisao === "autorizado" ? "autorizado" : p.decisao === "recusado" ? "recusado" : "";
  if (!decisao) return json({ error: "Escolha uma opção." }, 400);
  const cargo = String(p.cargo ?? "").trim().slice(0, 60);
  const linkedin = String(p.linkedin ?? "").trim().slice(0, 300);
  if (decisao === "autorizado" && !cargo) return json({ error: "Informe o cargo que vai aparecer no seu perfil." }, 400);
  if (!linkedinOk(linkedin)) return json({ error: "Informe um link do LinkedIn começando com https://www.linkedin.com/" }, 400);

  const agora = new Date().toISOString();
  const exibidos = { ...dados, cargo, linkedin };
  const { error: e1 } = await admin.from("galeria_autorizacoes").insert({
    cadastro_id: r.id, decisao, texto_versao: TEXTO_VERSAO, texto: TEXTO,
    dados_exibidos: decisao === "autorizado" ? exibidos : {},
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
  });
  if (e1) { console.error(e1.message); return json({ error: "Não foi possível registrar agora. Tente novamente." }, 500); }
  const { error: e2 } = await admin.from("cadastros").update({
    galeria_status: decisao, galeria_decidido_em: agora,
    galeria_cargo: decisao === "autorizado" ? cargo : r.galeria_cargo,
    galeria_linkedin: decisao === "autorizado" ? (linkedin || null) : r.galeria_linkedin,
  }).eq("id", r.id);
  if (e2) { console.error(e2.message); return json({ error: "Não foi possível registrar agora. Tente novamente." }, 500); }
  return json({ ok: true, status: decisao });
});
