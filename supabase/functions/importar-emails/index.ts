// Copia para o painel (página Contatos) os e-mails que chegam direto em contato@danimoscatelli.com.br.
// Chamada pelo agendamento do banco a cada 5 minutos. Lê a caixa de entrada da Hostinger por IMAP (só leitura:
// não apaga nem marca nada como lido) e guarda cada e-mail novo:
//   - remetente que ainda não tem conversa no painel: novo contato com origem "email";
//   - remetente que já tem conversa: a mensagem entra no histórico dessa conversa e ela volta a ficar não lida.
// Na primeira vez, só anota onde a caixa está: entram apenas os e-mails que chegarem daqui pra frente.
// Ignora os e-mails enviados pelo próprio site (endereços @danimoscatelli.com.br), como os avisos do formulário.
// A cada e-mail novo, manda um aviso (Resend) para o endereço guardado em caixa_email_estado.notificar_para,
// com remetente, assunto, começo da mensagem e o link do painel (o endereço fica só no banco, fora do código).
// Senha da caixa: segredo CONTATO_IMAP_SENHA (cadastrado pela administradora no Supabase; nunca no código).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import PostalMime from "npm:postal-mime@2.3.2";

const CAIXA = "contato@danimoscatelli.com.br";
const HOST = "imap.hostinger.com";
const DOMINIO_PROPRIO = /@danimoscatelli\.com\.br$/i;
const POR_VEZ = 20;                 // e-mails por execução (o restante entra na próxima)
const MAX_BYTES = 5 * 1024 * 1024;  // lê até 5 MB de cada e-mail (anexos grandes ficam só na caixa)
const REMETENTE = "Site Dani Moscatelli <site@danimoscatelli.com.br>";
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// ---------- IMAP mínimo (LOGIN, SELECT, UID SEARCH, UID FETCH) ----------
const binStr = (b: Uint8Array) => { let s = ""; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192)); return s; };
class Imap {
  // Os bytes viram texto "binário" (1 caractere = 1 byte), para os tamanhos dos literais IMAP baterem com o texto.
  // Cada leitura procura a linha final só no trecho novo (mais um pedaço do anterior), para não reler 5 MB a cada bloco.
  private partes: string[] = []; private total = 0; private n = 0;
  constructor(private c: Deno.TlsConn) {}
  private async ler(): Promise<string> {
    const tmp = new Uint8Array(65536); const r = await this.c.read(tmp);
    if (r === null) throw new Error("conexão encerrada pelo servidor");
    const t = binStr(tmp.subarray(0, r)); this.partes.push(t); this.total += t.length;
    if (this.total > MAX_BYTES * 2) throw new Error("resposta grande demais");
    return t;
  }
  private tudo() { const s = this.partes.join(""); this.partes = s ? [s] : []; return s; }
  // devolve a resposta até (e incluindo) a linha com a etiqueta do comando
  async ate(tag: string) {
    const alvo = new RegExp(`(?:^|\\r\\n)(${tag} [^\\r\\n]*)\\r\\n`);
    let cauda = this.tudo(); let base = 0; // cauda = texto a examinar; base = posição dela no total
    for (;;) {
      const m = alvo.exec(cauda);
      if (m) {
        const s = this.tudo(); const fim = base + m.index + m[0].length;
        const resp = s.slice(0, fim); const rest = s.slice(fim);
        this.partes = rest ? [rest] : []; this.total = rest.length;
        if (!new RegExp(`^${tag} OK`).test(m[1])) throw new Error("IMAP: " + m[1].slice(tag.length + 1, 200));
        return resp;
      }
      const manter = Math.min(cauda.length, 512);
      base += cauda.length - manter;
      cauda = cauda.slice(cauda.length - manter) + await this.ler();
    }
  }
  async cmd(c: string) { const tag = "A" + (++this.n); await this.c.write(new TextEncoder().encode(`${tag} ${c}\r\n`)); return this.ate(tag); }
  async saudacao() { for (;;) { const s = this.tudo(); const i = s.indexOf("\r\n"); if (i >= 0) { const r = s.slice(i + 2); this.partes = r ? [r] : []; this.total = r.length; return; } await this.ler(); } }
}
const q = (s: string) => '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
const bytesDe = (s: string) => Uint8Array.from(s, (ch) => ch.charCodeAt(0));

const semHtml = (h: string) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|tr)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n").trim();

async function importar() {
  const senha = Deno.env.get("CONTATO_IMAP_SENHA")?.replace(/[\s\u200b]+$/, "").replace(/^[\s\u200b]+/, ""); // tira espaço ou quebra de linha colados por engano
  if (!senha) return { ok: false, motivo: "senha não configurada" };
  const { data: est } = await db.from("caixa_email_estado").select("*").eq("caixa", CAIXA).maybeSingle();
  const conn = await Deno.connectTls({ hostname: HOST, port: 993 });
  const im = new Imap(conn);
  let novos = 0;
  try {
    await im.saudacao();
    await im.cmd(`LOGIN ${q(CAIXA)} ${q(senha)}`);
    const sel = await im.cmd("EXAMINE INBOX"); // só leitura
    const validade = Number(/UIDVALIDITY (\d+)/.exec(sel)?.[1] ?? 0);
    const proximo = Number(/UIDNEXT (\d+)/.exec(sel)?.[1] ?? 0);
    if (!est || Number(est.uidvalidity) !== validade) {
      // primeira vez (ou a caixa foi recriada): começa a partir de agora
      await db.from("caixa_email_estado").upsert({ caixa: CAIXA, uidvalidity: validade, ultimo_uid: Math.max(proximo - 1, 0), atualizado_em: new Date().toISOString(), ultimo_erro: null });
      return { ok: true, iniciado: true };
    }
    let ultimo = Number(est.ultimo_uid);
    const busca = await im.cmd(`UID SEARCH UID ${ultimo + 1}:*`);
    const uids = (/\* SEARCH([\d ]*)/.exec(busca)?.[1] ?? "").trim().split(/\s+/).filter(Boolean).map(Number).filter((u) => u > ultimo).sort((a, b) => a - b).slice(0, POR_VEZ);
    for (const uid of uids) {
      const r = await im.cmd(`UID FETCH ${uid} (BODY.PEEK[]<0.${MAX_BYTES}>)`);
      const m = /BODY\[\](?:<0>)? \{(\d+)\}\r\n/.exec(r);
      if (m) {
        const ini = m.index + m[0].length;
        await guardar(uid, validade, bytesDe(r.slice(ini, ini + Number(m[1]))), est.notificar_para);
        novos++;
      }
      ultimo = uid;
      await db.from("caixa_email_estado").update({ ultimo_uid: ultimo, atualizado_em: new Date().toISOString(), ultimo_erro: null }).eq("caixa", CAIXA);
    }
    await im.cmd("LOGOUT").catch(() => {});
    return { ok: true, novos };
  } finally { try { conn.close(); } catch { /* já fechada */ } }
}

async function guardar(uid: number, validade: number, bruto: Uint8Array, notificarPara?: string | null) {
  const ref = `imap:${validade}:${uid}`;
  // já guardado (execução repetida ou interrompida): não duplica nem avisa de novo
  const [{ data: j1 }, { data: j2 }] = await Promise.all([
    db.from("contatos").select("id").eq("email_ref", ref).maybeSingle(),
    db.from("mensagens_recebidas").select("id").eq("resend_email_id", ref).maybeSingle(),
  ]);
  if (j1 || j2) return;
  const e = await PostalMime.parse(bruto);
  const de = (e.from?.address ?? "").trim().toLowerCase();
  if (!de || DOMINIO_PROPRIO.test(de)) return; // avisos do próprio site e cópias de respostas
  const nome = (e.from?.name ?? "").trim() || de;
  const assunto = (e.subject ?? "").trim() || "(sem assunto)";
  const anexos = (e.attachments ?? []).filter((a) => a.disposition !== "inline").length;
  let texto = ((e.text ?? "").trim() || semHtml(e.html ?? "")).slice(0, 20000);
  if (anexos) texto += `\n\n[Este e-mail tem ${anexos} ${anexos === 1 ? "anexo" : "anexos"}. Veja na caixa de entrada.]`;
  const quando = e.date ? new Date(e.date) : new Date();
  const criado = isNaN(quando.getTime()) ? new Date().toISOString() : quando.toISOString();

  const { data: c } = await db.from("contatos").select("id").ilike("email", de).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (c) {
    const { error } = await db.from("mensagens_recebidas").insert({ contato_id: c.id, de: e.from?.name ? `${e.from.name} <${de}>` : de, assunto, texto, texto_completo: texto, anexos: [], resend_email_id: ref });
    if (error && !/duplicate/i.test(error.message)) throw new Error(error.message);
    if (!error) { await db.from("contatos").update({ visualizado_em: null }).eq("id", c.id); await avisar(notificarPara, nome, de, assunto, texto, c.id); }
    return;
  }
  const { data: novo, error } = await db.from("contatos").insert({
    origem: "email", email_ref: ref, created_at: criado, nome: nome.slice(0, 200), email: de, assunto: assunto.slice(0, 300), mensagem: texto,
    telefone: "", empresa: "", cargo: "", tipo_negocio: "", periodo: "", dias_preferidos: [],
  }).select("id").maybeSingle();
  if (error && !/duplicate/i.test(error.message)) throw new Error(error.message);
  if (novo) await avisar(notificarPara, nome, de, assunto, texto, novo.id);
}

// Aviso de e-mail novo (falha no aviso não impede a cópia para o painel)
async function avisar(para: string | null | undefined, nome: string, de: string, assunto: string, texto: string, id: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!para || !key) return;
  const link = `https://www.danimoscatelli.com.br/admin/contatos/?id=${id}`;
  const trecho = texto.length > 600 ? texto.slice(0, 600) + "…" : texto;
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: REMETENTE, to: [para], reply_to: de,
      subject: `Novo e-mail em contato@: ${nome} — ${assunto}`.slice(0, 250),
      text: `De: ${nome} <${de}>\nAssunto: ${assunto}\n\n${trecho}\n\nVer no painel: ${link}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0f172a"><p style="margin:0 0 4px;color:#64748b;font-size:13px">Novo e-mail recebido em contato@danimoscatelli.com.br (já está no painel)</p><p style="margin:0 0 4px"><strong>${esc(nome)}</strong> &lt;${esc(de)}&gt;</p><p style="margin:0 0 12px"><strong>${esc(assunto)}</strong></p><p style="white-space:pre-wrap;margin:0 0 16px">${esc(trecho)}</p><a href="${link}" style="color:#d44d4d;font-weight:bold">Ver no painel</a></div>`,
    }),
  }).then(async (r) => { if (!r.ok) console.error("aviso", r.status, (await r.text()).slice(0, 200)); }).catch((e) => console.error("aviso", e));
}

Deno.serve(async () => {
  try {
    return Response.json(await importar());
  } catch (err) {
    const msg = String((err as Error)?.message ?? err).slice(0, 300);
    console.error("importar-emails", msg);
    await db.from("caixa_email_estado").update({ ultimo_erro: msg, atualizado_em: new Date().toISOString() }).eq("caixa", CAIXA);
    return Response.json({ ok: false, erro: msg }, { status: 500 });
  }
});
