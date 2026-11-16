// Recebe os avisos do Resend (webhook) sobre os e-mails da Rede de Parceiros: entrega, abertura e clique.
// Só aceita avisos assinados pelo Resend (assinatura Svix com o segredo RESEND_WEBHOOK_SECRET_RASTREIO, que fica nos
// segredos do Supabase). Cada aviso é gravado uma única vez e associado ao cadastro do parceiro pela
// função registrar_email_evento. E-mails que não são da Rede de Parceiros são ignorados.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const TIPOS: Record<string, string> = { "email.delivered": "entregue", "email.opened": "aberto", "email.clicked": "clicado" };
const TOLERANCIA_S = 5 * 60;
const resp = (status: number, txt = "ok") => new Response(txt, { status });

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// Verificação da assinatura (formato Svix usado pelo Resend): HMAC-SHA256 de "id.timestamp.corpo" com o segredo.
async function assinaturaValida(req: Request, corpo: string, segredo: string) {
  const id = req.headers.get("svix-id"), ts = req.headers.get("svix-timestamp"), sig = req.headers.get("svix-signature");
  if (!id || !ts || !sig) return false;
  const agora = Math.floor(Date.now() / 1000);
  if (!/^\d+$/.test(ts) || Math.abs(agora - Number(ts)) > TOLERANCIA_S) return false;
  let chave: Uint8Array;
  try { chave = Uint8Array.from(atob(segredo.replace(/^whsec_/, "")), (c) => c.charCodeAt(0)); } catch { return false; }
  const k = await crypto.subtle.importKey("raw", chave, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`${id}.${ts}.${corpo}`)));
  const esperado = btoa(String.fromCharCode(...mac));
  return sig.split(" ").some((parte) => { const [v, s] = parte.split(","); return v === "v1" && !!s && iguais(s, esperado); });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return resp(405, "Método não permitido");
  const segredo = Deno.env.get("RESEND_WEBHOOK_SECRET_RASTREIO");
  if (!segredo) { console.error("RESEND_WEBHOOK_SECRET_RASTREIO ausente"); return resp(500, "Não configurado"); }
  const corpo = await req.text();
  if (!(await assinaturaValida(req, corpo, segredo))) return resp(401, "Assinatura inválida");

  let ev: { type?: string; created_at?: string; data?: { email_id?: string; click?: { link?: string; timestamp?: string } } };
  try { ev = JSON.parse(corpo); } catch { return resp(400, "Corpo inválido"); }
  const tipo = TIPOS[ev.type ?? ""];
  const resendId = ev.data?.email_id;
  if (!tipo || !resendId) return resp(200, "ignorado"); // outros tipos de aviso não interessam
  const quando = (tipo === "clicado" && ev.data?.click?.timestamp) || ev.created_at || new Date().toISOString();
  const { data, error } = await admin.rpc("registrar_email_evento", {
    p_svix_id: req.headers.get("svix-id")!, p_resend_id: resendId, p_tipo: tipo,
    p_link: tipo === "clicado" ? (ev.data?.click?.link ?? null) : null, p_quando: quando,
  });
  // Erro: devolve 500 para o Resend tentar de novo mais tarde.
  if (error) { console.error("registrar_email_evento", error.message); return resp(500, "Erro ao registrar"); }
  return resp(200, String(data ?? "ok"));
});
