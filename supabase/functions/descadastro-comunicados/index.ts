// Descadastro dos comunicados em massa da Rede de Parceiros (público, sem login).
// POST ?t=<token>  (ou corpo { t }) marca comunicados_descadastro_em no cadastro dono do token.
//   Serve à página /comunicados/descadastro/ e ao descadastro em um clique dos apps de e-mail
//   (cabeçalho List-Unsubscribe-Post). O parceiro continua na rede; só deixa de receber os envios em massa.
// GET apenas redireciona para a página de confirmação (links abertos por robôs de e-mail não descadastram ninguém).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const PAGINA = "https://www.danimoscatelli.com.br/comunicados/descadastro/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  let t = url.searchParams.get("t") ?? "";
  if (req.method === "GET") {
    return new Response(null, { status: 302, headers: { Location: PAGINA + (UUID.test(t) ? "?t=" + t : "") } });
  }
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  if (!t && (req.headers.get("content-type") ?? "").includes("application/json")) {
    const b = await req.json().catch(() => ({}));
    t = String(b.t ?? "");
  }
  if (!UUID.test(t)) return json({ error: "Link inválido." }, 400);
  const { error } = await admin.from("cadastros")
    .update({ comunicados_descadastro_em: new Date().toISOString() })
    .eq("comunicados_token", t).is("comunicados_descadastro_em", null);
  if (error) { console.error(error.message); return json({ error: "Não foi possível concluir agora. Tente novamente." }, 500); }
  // Mesma resposta para token inexistente, já descadastrado ou descadastrado agora: não revela se o token existe.
  return json({ ok: true });
});
