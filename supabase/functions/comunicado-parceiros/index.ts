// Comunicados em massa para a Rede de Parceiros (tabela cadastros).
// Chamada com o token da sessão; só aceita a conta de administradora.
// { acao: "preview", assunto, titulo, mensagem } devolve { assunto, html } para conferir antes de enviar.
// { acao: "enviar", assunto, titulo, mensagem, ids, filtros } envia um e-mail por parceiro (pelo Resend),
//   só para os ids escolhidos que não se descadastraram, e grava o envio em comunicados.
// Cada e-mail leva o link pessoal "deixar de receber" e o cabeçalho List-Unsubscribe (descadastro em um clique).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const REMETENTE = "Dani Moscatelli <contato@danimoscatelli.com.br>";
const RESPONDER_PARA = "contato@danimoscatelli.com.br";
const SITE = "https://www.danimoscatelli.com.br";
const CABECALHO = SITE + "/email/cabecalho-lancamento.png";
const FOTO = SITE + "/email/dani-foto.jpg";
const DESCADASTRO_PAGINA = SITE + "/comunicados/descadastro/?t=";
const DESCADASTRO_API = Deno.env.get("SUPABASE_URL") + "/functions/v1/descadastro-comunicados?t=";
const ASSINATURA_HTML = `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
<td valign="top" style="padding:0 16px 0 0"><img src="${FOTO}" width="80" height="80" alt="Dani Moscatelli" style="display:block;width:80px;height:80px;border-radius:50%;border:0"></td>
<td valign="top" style="font-family:Arial,Helvetica,sans-serif">
<p style="margin:0;font-size:18px;line-height:1.3;font-weight:bold;color:#0f172a">Dani Moscatelli</p>
<p style="margin:2px 0 10px;font-size:14px;line-height:1.4;color:#64748b">CEO | Experience Design <span style="color:#d44d4d;font-weight:bold">Studio</span></p>
<p style="margin:0;font-size:15px;line-height:1.8"><a href="https://www.danimoscatelli.com.br" style="color:#0f172a;text-decoration:none">www.danimoscatelli.com.br</a><br><a href="tel:+5541997485414" style="color:#0f172a;text-decoration:none">+55 (41) 99748-5414</a><br><a href="https://www.instagram.com/danimoscatellistudio/" style="color:#0f172a;text-decoration:none">@danimoscatellistudio</a></p>
</td></tr></table>`;
const ASSINATURA_TXT = "Dani Moscatelli\nCEO | Experience Design Studio\nwww.danimoscatelli.com.br\n+55 (41) 99748-5414\nInstagram: @danimoscatellistudio";
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

// Mesmo visual do e-mail de lançamento; o rodapé explica por que a pessoa recebeu e traz o link de descadastro.
function montar(assunto: string, titulo: string, mensagem: string, token: string) {
  const paragrafos = mensagem.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#334155">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const sair = DESCADASTRO_PAGINA + encodeURIComponent(token);
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${esc(assunto)}</title>
<style>:root { color-scheme: light only; supported-color-schemes: light only; }
@media (max-width: 600px) { .px { padding-left: 20px !important; padding-right: 20px !important; } }</style></head>
<body style="margin:0;padding:0;background:#f4f5f8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
    <tr><td style="padding:0;font-size:0;line-height:0"><a href="${SITE}"><img src="${CABECALHO}" width="600" alt="Dani Moscatelli | Experience Design Studio" style="display:block;width:100%;max-width:600px;height:auto;border:0"></a></td></tr>
    <tr><td class="px" style="padding:16px 32px 8px">
      <p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#d44d4d">Rede de Parceiros</p>
      <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:#0f172a">${esc(titulo)}</h1>
      ${paragrafos}
    </td></tr>
    <tr><td class="px" style="padding:8px 32px 32px">${ASSINATURA_HTML}</td></tr>
  </table>
  <p style="max-width:600px;margin:16px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8">Você recebeu este e-mail porque faz parte da Rede de Parceiros da Dani Moscatelli | Experience Design Studio. Não quer mais receber estes comunicados? <a href="${sair}" style="color:#64748b">Deixar de receber</a>. Você continua na rede.</p>
</td></tr></table>
</body></html>`;
  const text = `${titulo}\n\n${mensagem}\n\n${ASSINATURA_TXT}\n\nVocê recebeu este e-mail porque faz parte da Rede de Parceiros da Dani Moscatelli | Experience Design Studio. Para deixar de receber estes comunicados: ${sair}`;
  return { html, text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  if (auth.user?.app_metadata?.role !== "admin") return json({ error: "Sem permissão" }, 403);

  const p = await req.json().catch(() => ({}));
  const assunto = String(p.assunto ?? "").trim().slice(0, 200);
  const titulo = String(p.titulo ?? "").trim().slice(0, 200);
  const mensagem = String(p.mensagem ?? "").trim().slice(0, 10000);
  if (!assunto || !titulo || !mensagem) return json({ error: "Preencha o assunto, o título e a mensagem." }, 400);
  if (p.acao === "preview") return json({ assunto, html: montar(assunto, titulo, mensagem, "exemplo").html });
  if (p.acao !== "enviar") return json({ error: "Ação inválida" }, 400);

  const ids = [...new Set((Array.isArray(p.ids) ? p.ids : []).map(String).filter((x: string) => UUID.test(x)))].slice(0, 2000);
  if (!ids.length) return json({ error: "Escolha pelo menos um parceiro." }, 400);
  const { data: lista, error } = await admin.from("cadastros")
    .select("id, email, comunicados_token, comunicados_descadastro_em").in("id", ids);
  if (error) return json({ error: error.message }, 500);
  const validos = (lista ?? []).filter((r) => r.email && !r.comunicados_descadastro_em);
  const ignorados = ids.length - validos.length;
  if (!validos.length) return json({ enviados: 0, falhas: 0, ignorados });

  // Um e-mail por pessoa (ninguém vê o endereço dos outros), em lotes de até 100 pelo envio em lote do Resend.
  let enviados = 0, falhas = 0;
  const entregues: string[] = [];
  for (let i = 0; i < validos.length; i += 100) {
    const lote = validos.slice(i, i + 100);
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify(lote.map((r) => {
        const { html, text } = montar(assunto, titulo, mensagem, r.comunicados_token);
        return {
          from: REMETENTE, to: [r.email], reply_to: RESPONDER_PARA, subject: assunto, html, text,
          headers: {
            "List-Unsubscribe": `<${DESCADASTRO_API}${encodeURIComponent(r.comunicados_token)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        };
      })),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { console.error("Resend", res.status, JSON.stringify(out).slice(0, 300)); falhas += lote.length; continue; }
    const ok = Array.isArray(out.data) ? out.data.length : lote.length;
    entregues.push(...lote.slice(0, ok).map((r) => r.id));
    enviados += ok; falhas += lote.length - ok;
  }
  const filtros = p.filtros && typeof p.filtros === "object" ? p.filtros : {};
  const { error: errHist } = await admin.from("comunicados").insert({
    enviado_por: auth.user!.id, assunto, titulo, mensagem, filtros, destinatarios: entregues, enviados, falhas,
  });
  if (errHist) console.error("comunicados", errHist.message);
  return json({ enviados, falhas, ignorados });
});
