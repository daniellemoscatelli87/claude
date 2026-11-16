// Convite para o parceiro autorizar (ou não) a exibição do perfil na Galeria de profissionais do site.
// { acao: "novo", id }          Chamada pelo gatilho do banco a cada novo cadastro. Envia uma única vez o
//                               e-mail de boas-vindas com a galeria. Não exige login: o pior que alguém consegue
//                               é disparar o e-mail que já seria enviado.
//                               E-mails em galeria_convite_excecoes não recebem o convite automático.
// { acao: "preview" }           (administradora) devolve { assunto, html } do e-mail (o mesmo dos novos cadastros).
// { acao: "um", id }            (administradora) envia ou reenvia o convite para um parceiro que ainda não decidiu.
// { acao: "pendentes", reenviar } (administradora) envia para quem ainda não decidiu e ainda não foi
//                               convidado; com reenviar: true, também para quem foi convidado e não respondeu.
//                               Quem se descadastrou dos comunicados fica de fora do envio em massa.
// { acao: "agendados", chave } Chamada pelo relógio do banco (pg_cron) quando há envio agendado vencido. A chave é
//                               conferida com public.agendador_chave. Envia cada agendamento uma única vez (todos que
//                               ainda não decidiram, ou só os escolhidos que ainda não decidiram) e grava o resultado.
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
function primeiroNome(nome: string) { return (nome || "").trim().split(/\s+/)[0] || ""; }

// Assinatura deste e-mail: foto, nome, cargo e site (sem telefone e Instagram), como no texto aprovado.
const ASSINATURA_CONVITE_HTML = `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
<td valign="top" style="padding:0 16px 0 0"><img src="${FOTO}" width="72" height="72" alt="Dani Moscatelli" style="display:block;width:72px;height:72px;border-radius:50%;border:0"></td>
<td valign="middle" style="font-family:Arial,Helvetica,sans-serif">
<p style="margin:0;font-size:17px;line-height:1.3;font-weight:bold;color:#0f172a">Dani Moscatelli</p>
<p style="margin:2px 0 6px;font-size:14px;line-height:1.4;color:#64748b">CEO | Experience Design <span style="color:#d44d4d;font-weight:bold">Studio</span></p>
<p style="margin:0;font-size:14px;line-height:1.5"><a href="${SITE}" style="color:#0f172a;text-decoration:none">www.danimoscatelli.com.br</a></p>
</td></tr></table>`;
const RODAPE_BV = "Você recebeu este e-mail porque se cadastrou na Rede de Parceiros da Dani Moscatelli | Experience Design Studio. Seu perfil só aparece na galeria do site mediante sua autorização.";
const RODAPE = "Você recebeu este e-mail porque faz parte da Rede de Parceiros da Dani Moscatelli | Experience Design Studio. Seu perfil só será publicado mediante sua autorização.";

// confirmado: o parceiro já autorizou no formulário de cadastro; o e-mail confirma e pede a foto.
const ASSUNTO_CONFIRMADO = "Seu perfil na Galeria de profissionais: envie sua foto";
// Novo cadastro (envio automático): um único e-mail, com foco na galeria, que vale tanto para quem autorizou
// no formulário quanto para quem não autorizou (a página de autorização trata os dois casos).
type Modo = "convite" | "confirmado" | "bv";
const assuntoBV = (nome: string) => (primeiroNome(nome) ? primeiroNome(nome) + ", seu" : "Seu") + " perfil está a um passo da nossa galeria";
const assuntoDe = (m: Modo, nome = "") => m === "confirmado" ? ASSUNTO_CONFIRMADO : m === "bv" ? assuntoBV(nome) : ASSUNTO;
function montar(nome: string, token: string, modo: Modo = "convite") {
  const confirmado = modo === "confirmado", bv = modo === "bv";
  const link = PAGINA + encodeURIComponent(token);
  const ola = primeiroNome(nome) ? `Olá, ${primeiroNome(nome)}!` : "Olá!";
  const P = "margin:0 0 16px;font-size:16px;line-height:1.65;color:#334155";
  const p = (t: string) => `<p style="${P}">${t}</p>`;
  const b = (t: string) => `<strong style="color:#0f172a">${t}</strong>`;
  const corpoConfirmado = [
    p(esc(ola)),
    p("Obrigada por autorizar, no seu cadastro, a exibição do seu perfil profissional na Galeria de Profissionais do nosso site."),
    p(`Para completar o seu perfil, ${b("envie a foto que vai aparecer na galeria")}. Se não enviar, usaremos a foto do seu perfil do LinkedIn.`),
    p("No mesmo link você pode revisar como o seu perfil vai aparecer e ajustar o cargo e o LinkedIn."),
    p(b("A decisão é sua, e você pode alterá-la a qualquer momento pelo mesmo link.")),
  ].join("");
  // benefícios com check vermelho
  const beneficio = (t: string, d: string) => `<tr><td valign="top" style="padding:2px 12px 12px 0;width:22px"><span style="display:inline-block;width:20px;height:20px;line-height:20px;border-radius:50%;background:#d44d4d;color:#ffffff;font-size:12px;font-weight:bold;text-align:center">&#10003;</span></td><td style="padding:0 0 12px;font-size:15px;line-height:1.55;color:#334155"><strong style="color:#0f172a">${t}</strong> ${d}</td></tr>`;
  // passos numerados, em destaque
  const passo = (n: string, t: string) => `<tr><td valign="top" style="padding:0 14px 14px 0;width:36px"><span style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background:#d44d4d;color:#ffffff;font-weight:bold;font-size:15px;text-align:center">${n}</span></td><td valign="middle" style="padding:0 0 14px;font-size:16px;line-height:1.5;color:#0f172a">${t}</td></tr>`;
  const corpoBV = [
    p(esc(ola)),
    p(`Agora que você faz parte da nossa rede, queremos apresentar você na ${b("Galeria de Profissionais")} do nosso site: a vitrine dos especialistas da rede para empresas em busca de novos talentos.`),
    `<h2 style="margin:24px 0 12px;font-size:18px;line-height:1.3;color:#0f172a">Por que exibir o seu perfil?</h2>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 8px">${beneficio("Vitrine profissional.", "Seu perfil e suas especialidades ficam visíveis para empresas que procuram especialistas.")}${beneficio("Novas oportunidades.", "O perfil pode gerar convites para desafios do Studio e de empresas parceiras.")}${beneficio("Ecossistema mais forte.", "A galeria mostra a diversidade de competências da rede e aproxima os profissionais, ampliando as colaborações para todos.")}</table>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:8px 0 12px;padding:20px 20px 6px;background:#fdf2f2;border-radius:16px"><tr><td>
      <p style="margin:0 0 14px;font-size:13px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#d44d4d">Falta pouco</p>
      <table role="presentation" cellpadding="0" cellspacing="0">${passo("1", "Confira como o seu perfil vai aparecer.")}${passo("2", "Envie a sua foto. Se preferir, usamos a do seu LinkedIn.")}${passo("3", "Confirme e pronto: você faz parte da galeria.")}</table>
    </td></tr></table>`,
    p("Seus dados de contato e sua cidade não são exibidos, e o seu perfil só aparece com a sua autorização."),
    p(`Se depois quiser remover o seu perfil da galeria, é só solicitar a exclusão pelo e-mail <a href="mailto:contato@danimoscatelli.com.br" style="color:#d44d4d;font-weight:bold">contato@danimoscatelli.com.br</a>.`),
  ].join("");
  const corpo = bv ? corpoBV : confirmado ? corpoConfirmado : [
    p(esc(ola)),
    p("É um prazer contar com você na Rede de Parceiros da Dani Moscatelli | Experience Design Studio."),
    p(`Estamos preparando uma ${b("Galeria de Profissionais")} em nosso site, um espaço dedicado a apresentar os especialistas independentes que fazem parte da nossa rede.`),
    p(b("Queremos que seu talento também esteja lá.")),
    p("A galeria foi pensada para ampliar a visibilidade dos profissionais, valorizar suas competências e facilitar conexões com empresas em busca de especialistas para novos desafios."),
    `<h2 style="margin:28px 0 12px;font-size:19px;line-height:1.3;color:#0f172a">Você decide como quer aparecer.</h2>`,
    p("Antes de publicar qualquer informação, queremos sua autorização."),
    p("No link abaixo, você poderá revisar os dados que serão apresentados — nome, cargo, áreas de atuação, segmentos, LinkedIn e foto — e decidir se deseja participar."),
    p("Seus dados de contato, como e-mail e telefone, e sua cidade não serão exibidos."),
    p(b("A decisão é sua, e você pode alterá-la a qualquer momento pelo mesmo link.")),
  ].join("");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${esc(assuntoDe(modo, nome))}</title>
<style>:root { color-scheme: light only; supported-color-schemes: light only; }
@media (max-width: 600px) { .px { padding-left: 20px !important; padding-right: 20px !important; } }</style></head>
<body style="margin:0;padding:0;background:#f4f5f8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
    <tr><td style="padding:0;font-size:0;line-height:0"><a href="${SITE}"><img src="${CABECALHO}" width="600" alt="Dani Moscatelli | Experience Design Studio" style="display:block;width:100%;max-width:600px;height:auto;border:0"></a></td></tr>
    <tr><td class="px" style="padding:16px 32px 0">
      <p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#d44d4d">Galeria de profissionais</p>
      <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:#0f172a">${bv ? "Seu perfil está a um passo da nossa galeria." : confirmado ? "Seu perfil vai fazer parte da nossa galeria." : "Seu trabalho merece ser visto. Podemos apresentar você na nossa galeria?"}</h1>
      ${corpo}
    </td></tr>
    <tr><td class="px" style="padding:4px 32px 28px">
      <a href="${link}" style="display:inline-block;background:#d44d4d;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">${bv ? "Completar meu perfil" : confirmado ? "Revisar meu perfil e enviar foto" : "Revisar meu perfil e autorizar"}</a>
    </td></tr>
    <tr><td class="px" style="padding:0 32px 8px">${p("Obrigada por fazer parte dessa rede. Seguimos conectando competências, perspectivas e oportunidades para criar experiências de valor.")}</td></tr>
    <tr><td class="px" style="padding:8px 32px 32px">${ASSINATURA_CONVITE_HTML}</td></tr>
  </table>
  <p style="max-width:600px;margin:16px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8">${esc(bv ? RODAPE_BV : RODAPE)}</p>
</td></tr></table>
</body></html>`;
  const textoBV = [
    "GALERIA DE PROFISSIONAIS", "Seu perfil está a um passo da nossa galeria.", ola,
    "Agora que você faz parte da nossa rede, queremos apresentar você na Galeria de Profissionais do nosso site: a vitrine dos especialistas da rede para empresas em busca de novos talentos.",
    "POR QUE EXIBIR O SEU PERFIL?\n- Vitrine profissional. Seu perfil e suas especialidades ficam visíveis para empresas que procuram especialistas.\n- Novas oportunidades. O perfil pode gerar convites para desafios do Studio e de empresas parceiras.\n- Ecossistema mais forte. A galeria mostra a diversidade de competências da rede e aproxima os profissionais, ampliando as colaborações para todos.",
    "FALTA POUCO\n1. Confira como o seu perfil vai aparecer.\n2. Envie a sua foto. Se preferir, usamos a do seu LinkedIn.\n3. Confirme e pronto: você faz parte da galeria.",
    "Seus dados de contato e sua cidade não são exibidos, e o seu perfil só aparece com a sua autorização.",
    "Se depois quiser remover o seu perfil da galeria, é só solicitar a exclusão pelo e-mail contato@danimoscatelli.com.br.",
    "Completar meu perfil: " + link,
    "Obrigada por fazer parte dessa rede. Seguimos conectando competências, perspectivas e oportunidades para criar experiências de valor.",
    "Dani Moscatelli\nCEO | Experience Design Studio\nwww.danimoscatelli.com.br",
    "---\n" + RODAPE_BV,
  ].join("\n\n");
  const text = bv ? textoBV : confirmado ? [
    "GALERIA DE PROFISSIONAIS",
    "Seu perfil vai fazer parte da nossa galeria.",
    ola,
    "Obrigada por autorizar, no seu cadastro, a exibição do seu perfil profissional na Galeria de Profissionais do nosso site.",
    "Para completar o seu perfil, envie a foto que vai aparecer na galeria. Se não enviar, usaremos a foto do seu perfil do LinkedIn.",
    "No mesmo link você pode revisar como o seu perfil vai aparecer e ajustar o cargo e o LinkedIn.",
    "A decisão é sua, e você pode alterá-la a qualquer momento pelo mesmo link.",
    "Revisar meu perfil e enviar foto: " + link,
    "Obrigada por fazer parte dessa rede. Seguimos conectando competências, perspectivas e oportunidades para criar experiências de valor.",
    "Dani Moscatelli\nCEO | Experience Design Studio\nwww.danimoscatelli.com.br",
    "---\n" + RODAPE,
  ].join("\n\n") : [
    "GALERIA DE PROFISSIONAIS",
    "Seu trabalho merece ser visto. Podemos apresentar você na nossa galeria?",
    ola,
    "É um prazer contar com você na Rede de Parceiros da Dani Moscatelli | Experience Design Studio.",
    "Estamos preparando uma Galeria de Profissionais em nosso site, um espaço dedicado a apresentar os especialistas independentes que fazem parte da nossa rede.",
    "Queremos que seu talento também esteja lá.",
    "A galeria foi pensada para ampliar a visibilidade dos profissionais, valorizar suas competências e facilitar conexões com empresas em busca de especialistas para novos desafios.",
    "Você decide como quer aparecer.",
    "Antes de publicar qualquer informação, queremos sua autorização.",
    "No link abaixo, você poderá revisar os dados que serão apresentados — nome, cargo, áreas de atuação, segmentos, LinkedIn e foto — e decidir se deseja participar.",
    "Seus dados de contato, como e-mail e telefone, e sua cidade não serão exibidos.",
    "A decisão é sua, e você pode alterá-la a qualquer momento pelo mesmo link.",
    "Revisar meu perfil e autorizar: " + link,
    "Obrigada por fazer parte dessa rede. Seguimos conectando competências, perspectivas e oportunidades para criar experiências de valor.",
    "Dani Moscatelli\nCEO | Experience Design Studio\nwww.danimoscatelli.com.br",
    "---\n" + RODAPE,
  ].join("\n\n");
  return { html, text };
}

type Linha = { id: string; nome: string; email: string; galeria_token: string };
// Rastreamento (entrega, abertura e clique): cada e-mail aceito pelo Resend fica associado ao cadastro.
// A resposta do envio em lote traz os ids na mesma ordem dos e-mails enviados.
async function registrarEnvios<T extends { id: string }>(lote: T[], dados: unknown, origem: string, assunto: (r: T) => string) {
  const ids = Array.isArray(dados) ? dados.map((d) => (d && typeof d === "object" ? String((d as { id?: string }).id ?? "") : "")) : [];
  const linhas = lote.map((r, i) => ({ resend_id: ids[i], cadastro_id: r.id, origem, assunto: assunto(r) })).filter((l) => l.resend_id);
  if (!linhas.length) return [] as string[];
  const { error } = await admin.from("email_envios").insert(linhas);
  if (error) console.error("email_envios", error.message);
  return linhas.map((l) => l.resend_id);
}
async function enviar(lista: Linha[], modo: Modo = "convite") {
  let enviados = 0, falhas = 0;
  for (let i = 0; i < lista.length; i += 100) {
    const lote = lista.slice(i, i + 100);
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify(lote.map((r) => ({ from: REMETENTE, to: [r.email], reply_to: RESPONDER_PARA, subject: assuntoDe(modo, r.nome), ...montar(r.nome, r.galeria_token, modo) }))),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { console.error("Resend", res.status, JSON.stringify(out).slice(0, 300)); falhas += lote.length; continue; }
    const ok = Array.isArray(out.data) ? out.data.length : lote.length;
    const ids = lote.slice(0, ok).map((r) => r.id);
    if (ids.length) await admin.from("cadastros").update({ galeria_convite_em: new Date().toISOString() }).in("id", ids);
    await registrarEnvios(lote.slice(0, ok), out.data, "galeria-convite", (r) => assuntoDe(modo, r.nome));
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
    // Já recebeu: nada. Cada novo cadastro recebe o e-mail da galeria (o mesmo para quem autorizou ou não no formulário).
    if (!r || !r.email || r.galeria_convite_em) return json({ ok: true });
    const { data: exc } = await admin.from("galeria_convite_excecoes").select("email").eq("email", String(r.email).trim().toLowerCase()).maybeSingle();
    if (exc) return json({ ok: true });
    await enviar([r], "bv");
    return json({ ok: true });
  }

  if (p.acao === "agendados") {
    const { data: k } = await admin.from("agendador_chave").select("chave").eq("id", 1).maybeSingle();
    if (!k || typeof p.chave !== "string" || p.chave !== k.chave) return json({ error: "Sem permissão" }, 403);
    // reserva os envios vencidos (cada um sai uma única vez, mesmo com chamadas repetidas)
    const { data: fila, error: eFila } = await admin.from("galeria_agendamentos")
      .update({ situacao: "enviando", atualizado_em: new Date().toISOString() })
      .eq("situacao", "agendado").lte("agendado_para", new Date().toISOString())
      .select("id, modo, destinatarios");
    if (eFila) { console.error("agendados", eFila.message); return json({ error: "Erro ao ler a fila" }, 500); }
    const feitos = [];
    for (const ag of fila ?? []) {
      try {
        let q = admin.from("cadastros").select("id, nome, email, galeria_token")
          .is("galeria_status", null).is("comunicados_descadastro_em", null).not("email", "is", null);
        if (ag.modo === "selecionados") q = q.in("id", ag.destinatarios ?? []);
        const { data: lista, error: eLista } = await q;
        if (eLista) throw new Error(eLista.message);
        const r = lista?.length ? await enviar(lista, "bv") : { enviados: 0, falhas: 0 };
        const ignorados = ag.modo === "selecionados" ? Math.max(0, (ag.destinatarios ?? []).length - (lista?.length ?? 0)) : 0;
        await admin.from("galeria_agendamentos").update({ situacao: "enviado", executado_em: new Date().toISOString(), enviados: r.enviados, falhas: r.falhas, ignorados }).eq("id", ag.id);
        feitos.push({ id: ag.id, ...r, ignorados });
      } catch (e) {
        console.error("agendamento", ag.id, String(e).slice(0, 200));
        await admin.from("galeria_agendamentos").update({ situacao: "falhou", executado_em: new Date().toISOString(), erro: String(e).slice(0, 300) }).eq("id", ag.id);
      }
    }
    return json({ ok: true, feitos });
  }

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  if (auth.user?.app_metadata?.role !== "admin") return json({ error: "Sem permissão" }, 403);

  // O painel ("Ver o e-mail", "Enviar convite", envios em massa) usa o mesmo e-mail dos novos cadastros.
  if (p.acao === "preview") { const m: Modo = ["confirmado", "convite"].includes(p.modo) ? p.modo : "bv"; return json({ assunto: assuntoDe(m, "Nome"), html: montar("Nome", "exemplo", m).html }); }
  if (p.acao === "um") {
    const id = String(p.id ?? "");
    if (!UUID.test(id)) return json({ error: "Dados inválidos" }, 400);
    const { data: r } = await admin.from("cadastros").select("id, nome, email, galeria_token, galeria_status").eq("id", id).maybeSingle();
    if (!r || !r.email) return json({ error: "Parceiro sem e-mail." }, 400);
    if (r.galeria_status) return json({ error: "Este parceiro já decidiu. O link de decisão continua o mesmo." }, 400);
    return json(await enviar([r], "bv"));
  }
  if (p.acao !== "pendentes") return json({ error: "Ação inválida" }, 400);
  let q = admin.from("cadastros").select("id, nome, email, galeria_token")
    .is("galeria_status", null).is("comunicados_descadastro_em", null).not("email", "is", null);
  if (!p.reenviar) q = q.is("galeria_convite_em", null);
  const { data: lista, error } = await q;
  if (error) return json({ error: error.message }, 500);
  if (!lista?.length) return json({ enviados: 0, falhas: 0 });
  return json(await enviar(lista, "bv"));
});
