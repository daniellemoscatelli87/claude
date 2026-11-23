// Envia, pela área restrita, e-mails da administradora: a resposta a uma mensagem de contato ou um e-mail novo.
// Resposta:   { contato_id, mensagem, anexos? }
// E-mail novo: { novo: { id, para, nome?, assunto }, mensagem, anexos? }  ("Novo e-mail" da página de contatos)
//   O e-mail novo vira uma conversa em `contatos` (origem "enviado", com o id gerado na página), para que as
//   respostas da pessoa apareçam no histórico como nas demais mensagens.
// Só aceita a conta de administradora (token da sessão).
// `anexos` são arquivos de qualquer tipo já enviados ao bucket privado `anexos` em respostas/<contato_id>/...
// Envia pelo Resend com a assinatura (foto e dados em texto), grava em `respostas` e marca a conversa como respondida.
// O "responder" do e-mail vai para conversa-<contato_id>@resposta.danimoscatelli.com.br, que a função
// receber-email recebe e guarda no histórico.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

const REMETENTE = "Dani Moscatelli <contato@danimoscatelli.com.br>";
const DOMINIO_RESPOSTA = "resposta.danimoscatelli.com.br";
const FOTO = "https://www.danimoscatelli.com.br/email/dani-foto.jpg";
// Assinatura em texto (legível e clicável no celular), com a foto da Dani.
const ASSINATURA_HTML = `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
<td valign="top" style="padding:0 16px 0 0"><img src="${FOTO}" width="80" height="80" alt="Dani Moscatelli" style="display:block;width:80px;height:80px;border-radius:50%;border:0"></td>
<td valign="top" style="font-family:Arial,Helvetica,sans-serif">
<p style="margin:0;font-size:18px;line-height:1.3;font-weight:bold;color:#0f172a">Dani Moscatelli</p>
<p style="margin:2px 0 10px;font-size:14px;line-height:1.4;color:#64748b">CEO | Experience Design <span style="color:#d44d4d;font-weight:bold">Studio</span></p>
<p style="margin:0;font-size:15px;line-height:1.8"><a href="https://www.danimoscatelli.com.br" style="color:#0f172a;text-decoration:none">www.danimoscatelli.com.br</a><br><a href="tel:+5541997485414" style="color:#0f172a;text-decoration:none">+55 (41) 99748-5414</a><br><a href="https://www.instagram.com/danimoscatellistudio/" style="color:#0f172a;text-decoration:none">@danimoscatellistudio</a></p>
</td></tr></table>`;
const ASSINATURA_TXT = "Dani Moscatelli\nCEO | Experience Design Studio\nwww.danimoscatelli.com.br\n+55 (41) 99748-5414\nInstagram: @danimoscatellistudio";
const MAX_ANEXOS = 10;
const MAX_BYTES = 20 * 1024 * 1024;
const EMAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

type Anexo = { path: string; name: string; type: string; size: number };
type Contato = { id: string; nome: string; email: string; assunto: string; mensagem: string; created_at: string; respondido_em: string | null; origem: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  if (auth.user?.app_metadata?.role !== "admin") return json({ error: "Sem permissão" }, 403);

  const { contato_id, novo, mensagem, anexos } = await req.json().catch(() => ({}));
  const texto = typeof mensagem === "string" ? mensagem.trim() : "";
  const lista: Anexo[] = Array.isArray(anexos) ? anexos : [];
  if (texto.length > 20000) return json({ error: "Mensagem muito longa." }, 400);
  if (lista.length > MAX_ANEXOS) return json({ error: `Envie no máximo ${MAX_ANEXOS} arquivos.` }, 400);

  let c: Contato | null = null;
  let criado = false; // conversa criada agora (e-mail novo): é desfeita se o envio falhar
  if (novo && typeof novo === "object") {
    // E-mail novo: valida e cria a conversa (com o id gerado na página, que também nomeia a pasta dos anexos)
    const id = String(novo.id ?? ""), para = String(novo.para ?? "").trim().toLowerCase();
    const nome = String(novo.nome ?? "").trim().replace(/\s+/g, " "), assunto = String(novo.assunto ?? "").trim().replace(/\s+/g, " ");
    if (!UUID.test(id)) return json({ error: "Envio inválido." }, 400);
    if (!EMAIL.test(para) || para.length > 254) return json({ error: "Informe um e-mail válido para o destinatário." }, 400);
    if (!assunto) return json({ error: "Informe o assunto." }, 400);
    if (!texto) return json({ error: "Escreva a mensagem." }, 400);
    const { data: ja } = await admin.from("contatos").select("id, nome, email, assunto, mensagem, created_at, respondido_em, origem").eq("id", id).maybeSingle();
    if (ja) {
      // mesmo envio repetido (ex.: duas vezes no botão): não cria outra conversa nem envia de novo
      const { data: r } = await admin.from("respostas").select("*").eq("contato_id", id).limit(1).maybeSingle();
      if (r) return json({ resposta: r, respondido_em: ja.respondido_em, contato_id: id });
      c = ja as Contato;
    } else {
      const agora = new Date().toISOString();
      const { data: ins, error: insErr } = await admin.from("contatos").insert({
        id, origem: "enviado", nome: (nome || para).slice(0, 200), email: para, assunto: assunto.slice(0, 300), mensagem: "",
        telefone: "", empresa: "", cargo: "", tipo_negocio: "", periodo: "", dias_preferidos: [],
        respondido_em: agora, visualizado_em: agora,
      }).select("id, nome, email, assunto, mensagem, created_at, respondido_em, origem").single();
      if (insErr) return json({ error: "Não foi possível criar a conversa: " + insErr.message }, 500);
      c = ins as Contato; criado = true;
    }
  } else {
    if (typeof contato_id !== "string" || (!texto && !lista.length)) return json({ error: "Escreva a mensagem ou anexe um arquivo." }, 400);
    const { data, error } = await admin.from("contatos").select("id, nome, email, assunto, mensagem, created_at, respondido_em, origem").eq("id", contato_id).maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!data) return json({ error: "Mensagem não encontrada." }, 404);
    if (!data.email) return json({ error: "Este contato não tem e-mail." }, 400);
    c = data as Contato;
  }
  const desfaz = async () => { if (criado) await admin.from("contatos").delete().eq("id", c!.id); };
  const erro = async (msg: string, status = 400, extra: Record<string, unknown> = {}) => { await desfaz(); return json({ error: msg, ...extra }, status); };

  // Baixa os anexos do bucket privado (só da pasta desta conversa) e prepara para o Resend.
  const attachments: { filename: string; content: string }[] = [];
  const salvos: Anexo[] = [];
  let total = 0;
  for (const a of lista) {
    if (typeof a?.path !== "string" || !a.path.startsWith(`respostas/${c.id}/`) || a.path.includes("..")) return erro("Anexo inválido.");
    const { data: blob, error: dlErr } = await admin.storage.from("anexos").download(a.path);
    if (dlErr || !blob) return erro("Não foi possível ler o anexo " + (a.name ?? ""));
    total += blob.size;
    if (total > MAX_BYTES) return erro("Os anexos passam de 20 MB.");
    const filename = String(a.name || a.path.split("/").pop()).replace(/[\r\n"]/g, "").slice(0, 120);
    attachments.push({ filename, content: encodeBase64(new Uint8Array(await blob.arrayBuffer())) });
    salvos.push({ path: a.path, name: filename, type: blob.type || String(a.type || "application/octet-stream"), size: blob.size });
  }

  const enviado = c.origem === "enviado";
  // E-mail novo: o assunto é o escrito; nas respostas seguintes da mesma conversa, "Re:" como nas demais.
  const assunto = enviado && criado ? c.assunto : `Re: ${c.assunto || "Seu contato pelo site"}`;
  // A citação da mensagem original só existe quando a conversa começou com uma mensagem da pessoa.
  const citar = !enviado && !!c.mensagem;
  const recebida = new Date(c.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
  const text = `${texto}\n\n${ASSINATURA_TXT}` + (citar ? `\n\n---\nEm ${recebida}, ${c.nome} escreveu:\n${c.mensagem}` : "");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0f172a">
    ${texto ? `<p style="white-space:pre-wrap;margin:0 0 24px">${esc(texto)}</p>` : ""}
    <div style="margin:0 0 28px">${ASSINATURA_HTML}</div>
    ${citar ? `<div style="border-left:3px solid #e2e8f0;padding-left:12px;color:#64748b;font-size:13px">
      <p style="margin:0 0 6px">Em ${esc(recebida)}, ${esc(c.nome)} escreveu:</p>
      <p style="white-space:pre-wrap;margin:0">${esc(c.mensagem)}</p>
    </div>` : ""}
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: REMETENTE, to: [c.email], reply_to: `Dani Moscatelli <conversa-${c.id}@${DOMINIO_RESPOSTA}>`,
      subject: assunto, html, text, ...(attachments.length ? { attachments } : {}),
    }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) return erro(`Não foi possível enviar o e-mail (${res.status}).`, 502, { detalhe: out });

  const { data: resposta, error: insErr } = await admin.from("respostas")
    .insert({ contato_id: c.id, para: c.email, assunto, mensagem: texto, anexos: salvos, resend_id: out.id ?? null })
    .select().single();
  if (insErr) return json({ error: "E-mail enviado, mas não foi possível salvar no histórico: " + insErr.message, contato_id: c.id }, 500);
  const respondido_em = c.respondido_em ?? resposta.created_at;
  if (!c.respondido_em) await admin.from("contatos").update({ respondido_em }).eq("id", c.id);

  return json({ resposta, respondido_em, contato_id: c.id });
});
