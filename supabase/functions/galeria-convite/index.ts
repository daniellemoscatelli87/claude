// Convite para o parceiro autorizar (ou não) a exibição do perfil na Galeria de profissionais do site.
// { acao: "novo", id }          Chamada pelo gatilho do banco a cada novo cadastro. Envia uma única vez
//                               (só se o parceiro ainda não foi convidado nem decidiu). Não exige login:
//                               o pior que alguém consegue é disparar o convite que já seria enviado.
// { acao: "preview" }           (administradora) devolve { assunto, html } do e-mail.
// { acao: "pendentes", reenviar } (administradora) envia para quem ainda não decidiu e ainda não foi
//                               convidado; com reenviar: true, também para quem foi convidado e não respondeu.
//                               Quem se descadastrou dos comunicados fica de fora do envio em massa.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const REMETENTE = "Dani Moscatelli <contato@danimoscatelli.com.br>";
const RESPONDER_PARA = "contato@danimoscatelli.com.br";
const SITE = "https://www.danimoscatelli.com.br";
const CABECALHO = SITE + "/email/cabecalho-lancamento.png";
const FOTO = SITE + "/email/dani-foto.jpg";
const PAGINA = SITE + "/rede-parceiros/galeria/autorizar/?t=";
const ASSUNTO = "Seu perfil na Galeria de profissionais da Rede de Parceiros";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ASSINATURA_HTML = `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
<td valign="top" style="padding:0 16px 0 0"><img src="${FOTO}" width="80" height="80" alt="Dani Moscatelli" style="display:block;width:80px;height:80px;border-radius:50%;border:0"></td>
<td valign="top" style="font-family:Arial,Helvetica,sans-serif">
<p style="margin:0;font-size:18px;line-height:1.3;font-weight:bold;color:#0f172a">Dani Moscatelli</p>
<p style="margin:2px 0 10px;font-size:14px;line-height:1.4;color:#64748b">CEO | Experience Design <span style="color:#d44d4d;font-weight:bold">Studio</span></p>
<p style="margin:0;font-size:15px;line-height:1.8"><a href="https://www.danimoscatelli.com.br" style="color:#0f172a;text-decoration:none">www.danimoscatelli.com.br</a><br><a href="tel:+5541997485414" style="color:#0f172a;text-decoration:none">+55 (41) 99748-5414</a><br><a href="https://www.instagram.com/danimoscatellistudio/" style="color:#0f172a;text-decoration:none">@danimoscatellistudio</a></p>
</td></tr></table>`;
const ASSINATURA_TXT = "Dani Moscatelli\nCEO | Experience Design Studio\nwww.danimoscatelli.com.br\n+55 (41) 99748-5414\nInstagram: @danimoscatellistudio";

function primeiroNome(nome: string) { return (nome || "").trim().split(/\s+/)[0] || ""; }

function montar(nome: string, token: string) {
  const link = PAGINA + encodeURIComponent(token);
  const ola = primeiroNome(nome) ? `Olá, ${primeiroNome(nome)}!` : "Olá!";
  const paragrafos = [
    ola,
    "Obrigada por fazer parte da Rede de Parceiros da Dani Moscatelli | Experience Design Studio.",
    "Vamos abrir no site uma Galeria de profissionais, para apresentar especialistas independentes que colaboram com desafios do Studio e de empresas parceiras. Gostaríamos de incluir o seu perfil profissional.",
    "Seu perfil só será exibido com a sua autorização. No link abaixo você vê exatamente como ele vai aparecer (nome, cargo, áreas de atuação, segmentos, LinkedIn e foto do perfil do LinkedIn) e decide se autoriza ou não. E-mail, telefone e cidade nunca são exibidos.",
    "Você pode mudar de ideia quando quiser pelo mesmo link.",
  ];
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${esc(ASSUNTO)}</title>
<style>:root { color-scheme: light only; supported-color-schemes: light only; }
@media (max-width: 600px) { .px { padding-left: 20px !important; padding-right: 20px !important; } }</style></head>
<body style="margin:0;padding:0;background:#f4f5f8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
    <tr><td style="padding:0;font-size:0;line-height:0"><a href="${SITE}"><img src="${CABECALHO}" width="600" alt="Dani Moscatelli | Experience Design Studio" style="display:block;width:100%;max-width:600px;height:auto;border:0"></a></td></tr>
    <tr><td class="px" style="padding:16px 32px 0">
      <p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#d44d4d">Galeria de profissionais</p>
      <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:#0f172a">Podemos exibir o seu perfil na galeria da rede?</h1>
      ${paragrafos.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#334155">${esc(p)}</p>`).join("")}
    </td></tr>
    <tr><td class="px" style="padding:8px 32px 32px">
      <a href="${link}" style="display:inline-block;background:#d44d4d;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">Revisar e decidir</a>
    </td></tr>
    <tr><td class="px" style="padding:8px 32px 32px">${ASSINATURA_HTML}</td></tr>
  </table>
  <p style="max-width:600px;margin:16px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8">Você recebeu este e-mail porque se cadastrou na Rede de Parceiros da Dani Moscatelli | Experience Design Studio. Se não responder, seu perfil não será exibido.</p>
</td></tr></table>
</body></html>`;
  const text = `${paragrafos.join("\n\n")}\n\nRevisar e decidir: ${link}\n\n${ASSINATURA_TXT}\n\nVocê recebeu este e-mail porque se cadastrou na Rede de Parceiros da Dani Moscatelli | Experience Design Studio. Se não responder, seu perfil não será exibido.`;
  return { html, text };
}

type Linha = { id: string; nome: string; email: string; galeria_token: string };
async function enviar(lista: Linha[]) {
  let enviados = 0, falhas = 0;
  for (let i = 0; i < lista.length; i += 100) {
    const lote = lista.slice(i, i + 100);
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify(lote.map((r) => ({ from: REMETENTE, to: [r.email], reply_to: RESPONDER_PARA, subject: ASSUNTO, ...montar(r.nome, r.galeria_token) }))),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { console.error("Resend", res.status, JSON.stringify(out).slice(0, 300)); falhas += lote.length; continue; }
    const ok = Array.isArray(out.data) ? out.data.length : lote.length;
    const ids = lote.slice(0, ok).map((r) => r.id);
    if (ids.length) await admin.from("cadastros").update({ galeria_convite_em: new Date().toISOString() }).in("id", ids);
    enviados += ok; falhas += lote.length - ok;
  }
  return { enviados, falhas };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const p = await req.json().catch(() => ({}));

  if (p.acao === "novo") {
    const id = String(p.id ?? "");
    if (!UUID.test(id)) return json({ error: "Dados inválidos" }, 400);
    const { data: r } = await admin.from("cadastros").select("id, nome, email, galeria_token, galeria_status, galeria_convite_em").eq("id", id).maybeSingle();
    if (!r || !r.email || r.galeria_status || r.galeria_convite_em) return json({ ok: true });
    await enviar([r]);
    return json({ ok: true });
  }

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  if (auth.user?.app_metadata?.role !== "admin") return json({ error: "Sem permissão" }, 403);

  if (p.acao === "preview") return json({ assunto: ASSUNTO, html: montar("Nome", "exemplo").html });
  if (p.acao !== "pendentes") return json({ error: "Ação inválida" }, 400);
  let q = admin.from("cadastros").select("id, nome, email, galeria_token")
    .is("galeria_status", null).is("comunicados_descadastro_em", null).not("email", "is", null);
  if (!p.reenviar) q = q.is("galeria_convite_em", null);
  const { data: lista, error } = await q;
  if (error) return json({ error: error.message }, 500);
  if (!lista?.length) return json({ enviados: 0, falhas: 0 });
  return json(await enviar(lista));
});
