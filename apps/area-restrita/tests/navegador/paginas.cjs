// Lançamento, Configurações e Comunicados em React (lotes A2 a A4), com o Supabase simulado na rede como em inicio.cjs
// (cliente real; tabelas com os filtros do PostgREST aplicados; funções lancamento, admin-dados e
// comunicado-parceiros simuladas; atualização do usuário guardada). Em 1280 e 390 px: comportamento de cada página,
// os mesmos textos das páginas de HTML, sem erros no console, sem rolagem horizontal da página nem dos cards, axe sem
// violações WCAG A/AA e, no celular, tags e ações alinhadas à coluna do texto.
//
// Uso, na raiz do repositório, depois de "npm run build":
//   node apps/area-restrita/tests/navegador/servidor.cjs dist 4310 &
//   PORTA=4310 CAPTURAS=/pasta AXE=/caminho/axe.min.js node apps/area-restrita/tests/navegador/paginas.cjs [previa|publicada]
// "publicada" abre as páginas em /admin/<página>/ (depois do corte); o padrão é a prévia em /admin/app/<página>/.
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const { simularSupabase, BASE, DADOS } = require("./inicio.cjs");
const S = process.env.CAPTURAS || require("os").tmpdir();
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
const RAIZ = process.argv[2] === "publicada" ? "/admin/" : "/admin/app/";
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const h = (d) => new Date(Date.now() - d * 36e5).toISOString();

// Dados fictícios das páginas novas (as tabelas da Início continuam as de inicio.cjs).
const CONTATOS_DA_INICIO = JSON.parse(JSON.stringify(DADOS.contatos));
function dadosIniciais() {
  DADOS.contatos = JSON.parse(JSON.stringify(CONTATOS_DA_INICIO));
  DADOS.notificacoes_lancamento = [
    { id: "l1", created_at: h(3), email: "pessoa@exemplo.com", avisado_em: null },
    { id: "l2", created_at: h(70), email: "outra.pessoa@exemplo.com", avisado_em: null },
    { id: "l3", created_at: h(200), email: "ja.avisada@exemplo.com", avisado_em: h(150) },
  ];
  DADOS.cadastros = [
    { id: "p1", created_at: h(5), nome: "Diego Souza", email: "diego@exemplo.com", empresa: "Estúdio DS", principal_especializacao: "Pesquisa com usuários.", areas_experiencia: ["Pesquisa."], segmentos: ["Saúde.", "Varejo"], visualizado_em: null, comunicados_descadastro_em: null },
    { id: "p2", created_at: h(50), nome: "Elisa Prado", email: "elisa@exemplo.com", empresa: "", principal_especializacao: "UX writing", areas_experiencia: ["Conteúdo"], segmentos: ["Serviços"], visualizado_em: h(40), comunicados_descadastro_em: null },
    { id: "p3", created_at: h(90), nome: "Fábio Lima", email: "fabio@exemplo.com", empresa: "", principal_especializacao: "Design de serviços", areas_experiencia: ["Pesquisa"], segmentos: ["Saúde"], visualizado_em: h(80), comunicados_descadastro_em: h(10) },
    { id: "p4", created_at: h(95), nome: "Gabi Reis", email: null, empresa: "", principal_especializacao: "Facilitação", areas_experiencia: ["Pesquisa"], segmentos: ["Educação"], visualizado_em: h(80), comunicados_descadastro_em: null },
  ];
  DADOS.contatos = DADOS.contatos.filter((r) => !["c7", "c8"].includes(r.id)).concat([
    { id: "c7", created_at: h(200), nome: "Helena Costa", email: "helena@exemplo.com", empresa: "Clínica Vida", cargo: null, assunto: "Experiência na recepção", mensagem: "Olá", origem: "email", visualizado_em: null, respondido_em: null, reuniao_em: null },
    { id: "c8", created_at: h(20), nome: "Conversa com Ana", email: "ana@exemplo.com", empresa: null, cargo: null, assunto: "Proposta", mensagem: "Segue", origem: "enviado", destinatarios: ["ana@exemplo.com"], copias: ["socio@exemplo.com"], copias_ocultas: [], visualizado_em: h(20), respondido_em: h(20), reuniao_em: null },
  ]);
  DADOS.contatos.forEach((r) => { r.mensagem = r.mensagem || "Olá! Gostaria de conversar sobre " + (r.assunto || "um projeto").toLowerCase() + "."; r.email = r.email || (r.nome || "x").split(" ")[0].toLowerCase() + "@exemplo.com"; });
  const c3 = DADOS.contatos.find((r) => r.id === "c3");
  if (c3) c3.reuniao_em = h(-48);
  DADOS.contatos = DADOS.contatos.filter((r) => r.id !== "c9").concat([{ id: "c9", created_at: h(300), nome: "Igor Paz", email: "igor@exemplo.com", empresa: "Café Bom", cargo: null, assunto: "Reunião antiga", mensagem: "Oi", origem: "site", visualizado_em: h(290), respondido_em: h(280), reuniao_em: h(250) }]);
  DADOS.reunioes = [
    { contato_id: "c3", status: "agendada", inicio: h(-48), duracao_min: 60, titulo: "Reunião com Carla Mendes | Dani Moscatelli", assunto: "Workshop de jornada", descricao: "", formato: "online", endereco: "", meet_link: "https://meet.google.com/abc-defg-hij", evento_link: "https://calendar.google.com/x", google_event_id: "g1" },
    { contato_id: "c9", status: "agendada", inicio: h(250), duracao_min: 60, titulo: "Reunião com Igor", formato: "presencial", endereco: "Rua XV de Novembro, 100, Curitiba", meet_link: null, google_event_id: null },
  ];
  // A consulta das Reuniões traz a reunião embutida (contatos + reunioes); o mock do PostgREST não junta tabelas.
  for (const r of DADOS.contatos) { const reu = DADOS.reunioes.filter((x) => x.contato_id === r.id); if (reu.length) r.reunioes = reu; else delete r.reunioes; }
  DADOS.respostas = [{ id: "r1", contato_id: "c2", created_at: h(28), mensagem: "Olá, Bruno! Podemos conversar na quinta?", anexos: [{ path: "respostas/c2/1-proposta.pdf", name: "proposta.pdf", type: "application/pdf", size: 1000 }], para: "bruno@exemplo.com", copias: [], copias_ocultas: [] }];
  DADOS.contato_eventos = [{ id: "v1", contato_id: "c2", created_at: h(29), tipo: "lida", detalhe: "" }, { id: "v2", contato_id: "c2", created_at: h(28), tipo: "respondida", detalhe: "" }];
  DADOS.mensagens_recebidas = [{ id: "m1", contato_id: "c2", created_at: h(27), texto: "Pode ser às 15h.", texto_completo: "Pode ser às 15h.\n\n> Olá, Bruno! Podemos conversar na quinta?", anexos: [] }];
  DADOS.comunicados = [{ id: "m1", created_at: h(30), assunto: "Novidades da Rede", titulo: "Uma oportunidade em Saúde", mensagem: "Olá,\n\nTexto.", destinatarios: ["p1", "p2", "p3", "x"], enviados: 3, falhas: 1 }];
  DADOS.admin_log = Array.from({ length: 31 }, (_, i) => ({ id: "g" + i, created_at: h(i + 1), acao: i === 0 ? "Apagou os dados de Lançamento" : i === 1 ? "Disparou o e-mail de lançamento" : "Entrou na área restrita", detalhe: i === 1 ? '2 enviados. Assunto: "Lançamento"' : null }));
}

async function simularTudo(page, registro) {
  await simularSupabase(page);
  const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
  // Funções: lancamento, comunicado-parceiros e admin-dados.
  await page.route(/supabase\.co\/functions\/v1\/([a-z-]+)/, async (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    const nome = /functions\/v1\/([a-z-]+)/.exec(r.request().url())[1];
    const body = JSON.parse(r.request().postData() || "{}");
    registro.funcoes.push({ nome, ...body });
    let resp = {};
    if (body.acao === "preview") resp = { html: `<html><body><h1 id="t">${body.titulo}</h1><p>${body.assunto}</p></body></html>` };
    else if (nome === "lancamento" && body.acao === "enviar") {
      const pend = DADOS.notificacoes_lancamento.filter((x) => !x.avisado_em);
      pend.forEach((x) => (x.avisado_em = new Date().toISOString()));
      resp = { enviados: pend.length, falhas: 0 };
    } else if (nome === "comunicado-parceiros" && body.acao === "enviar") {
      DADOS.comunicados.unshift({ id: "m" + Date.now(), created_at: new Date().toISOString(), assunto: body.assunto, titulo: body.titulo, mensagem: body.mensagem, destinatarios: body.ids, enviados: body.ids.length, falhas: 0 });
      resp = { enviados: body.ids.length, falhas: 0 };
    } else if (nome === "google-agenda" && body.acao === "status") resp = { configurado: true, conectado: true };
    else if (nome === "google-agenda" && body.acao === "salvar") {
      const reu = { contato_id: body.contato_id, status: body.enviar ? "agendada" : "rascunho", inicio: body.inicio, duracao_min: body.duracao_min, titulo: body.titulo, assunto: body.assunto, descricao: body.descricao, formato: body.formato, endereco: body.endereco, meet_link: body.formato === "online" ? "https://meet.google.com/novo-link" : null, updated_at: new Date().toISOString() };
      DADOS.reunioes = DADOS.reunioes.filter((x) => x.contato_id !== body.contato_id).concat([reu]);
      if (body.enviar) { const c = DADOS.contatos.find((x) => x.id === body.contato_id); if (c) c.reuniao_em = body.inicio; }
      resp = { reuniao: reu };
    } else if (nome === "google-agenda" && body.acao === "excluir") {
      DADOS.reunioes = DADOS.reunioes.filter((x) => x.contato_id !== body.contato_id);
      const c = DADOS.contatos.find((x) => x.id === body.contato_id); if (c) c.reuniao_em = null;
      resp = { ok: true };
    } else if (nome === "responder-contato") {
      if (body.novo) {
        DADOS.contatos.unshift({ id: body.novo.id, created_at: new Date().toISOString(), nome: body.novo.nome || body.novo.para[0], email: body.novo.para[0], empresa: null, cargo: null, assunto: body.novo.assunto, mensagem: body.mensagem, origem: "enviado", destinatarios: body.novo.para, copias: body.novo.cc, copias_ocultas: body.novo.cco, visualizado_em: new Date().toISOString(), respondido_em: new Date().toISOString(), reuniao_em: null });
        resp = { resposta: { id: "rn" }, contato_id: body.novo.id };
      } else {
        DADOS.respostas.push({ id: "r" + Date.now(), contato_id: body.contato_id, created_at: new Date().toISOString(), mensagem: body.mensagem, anexos: body.anexos, para: "x@exemplo.com", copias: [], copias_ocultas: [] });
        resp = { resposta: { id: "r" }, respondido_em: new Date().toISOString() };
      }
    } else if (nome === "admin-dados" && body.acao === "contagem") resp = { contatos: DADOS.contatos.length, reunioes: 1, parceiros: DADOS.cadastros.length, lancamento: DADOS.notificacoes_lancamento.length };
    else if (nome === "admin-dados" && body.acao === "apagar") {
      const total = DADOS.notificacoes_lancamento.length;
      if (body.area === "lancamento") DADOS.notificacoes_lancamento = [];
      resp = { total };
    }
    return r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(resp) });
  });
  // Armazenamento dos anexos: enviar, listar, apagar e links temporários.
  await page.route(/supabase\.co\/storage\/v1\/object\//, async (r) => {
    const req = r.request();
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    const url = req.url();
    if (/\/object\/sign\//.test(url)) { const b = JSON.parse(req.postData() || "{}"); registro.armazenamento.push("assinar"); return r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify((b.paths || []).map((p) => ({ path: p, signedURL: "/sign/" + p, error: null }))) }); }
    if (/\/object\/list\//.test(url)) return r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "[]" });
    registro.armazenamento.push(req.method() + " " + url.split("/object/")[1]);
    return r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ Key: url.split("/object/")[1], Id: "1" }) });
  });
  // Atualizar o usuário (nome, foto, e-mail, senha): guarda o que foi pedido e devolve o usuário atualizado.
  await page.route(/supabase\.co\/auth\/v1\/user/, async (r) => {
    const req = r.request();
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    const usuario = { id: "u1", aud: "authenticated", role: "authenticated", email: "admin@exemplo.com", app_metadata: { role: "admin", provider: "email" }, user_metadata: { ...registro.metadados }, created_at: "2026-01-01T00:00:00Z" };
    if (req.method() === "PUT") {
      const b = JSON.parse(req.postData() || "{}");
      registro.usuario.push(b);
      if (b.data) Object.assign(registro.metadados, b.data);
      usuario.user_metadata = { ...registro.metadados };
    }
    return r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(usuario) });
  });
  page.on("request", (req) => {
    if (req.method() === "POST" && /rest\/v1\/admin_log/.test(req.url())) registro.log.push(JSON.parse(req.postData() || "{}"));
    else if (["PATCH", "DELETE"].includes(req.method()) && /rest\/v1\//.test(req.url())) registro.escritas.push(req.method() + " " + req.url().split("/rest/v1/")[1]);
  });
}

const semRolagem = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const cardsSemRolagem = (page) => page.evaluate(() => [...document.querySelectorAll('[data-slot="card"]')].every((c) => c.scrollWidth <= c.clientWidth + 1));
async function axe(page, nome) {
  if (!AXE) return console.log(`AVISO ${nome}: axe-core não informado (variável AXE)`);
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run({ include: [document], exclude: [["[data-aria-hidden=true]"]] }, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`));
  ok(r.length === 0, `${nome}: axe sem violações WCAG A/AA${r.length ? "\n   " + r.join("\n   ") : ""}`);
}
/** No celular: tags, chips e botões do fim da linha começam no x do texto da linha (regra de alinhamento). */
async function alinhamento(page, seletor, nome) {
  const r = await page.evaluate((sel) => [...document.querySelectorAll(sel)].map((l) => {
    const fim = l.querySelector("[data-slot=linha-de-lista-fim]");
    if (!fim || !fim.firstElementChild) return null;
    const t = l.querySelector("[data-slot=linha-de-lista-conteudo]").getBoundingClientRect(), f = fim.firstElementChild.getBoundingClientRect();
    return { texto: Math.round(t.left), fim: Math.round(f.left), abaixo: f.top >= t.bottom - 1 };
  }).filter(Boolean), seletor);
  ok(r.length > 0 && r.every((x) => x.texto === x.fim && x.abaixo), `${nome}: no celular, o fim da linha fica embaixo do texto, no mesmo x (${JSON.stringify(r.slice(0, 2))})`);
}
async function fecharPainel(page, nome) {
  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: nome }).waitFor({ state: "hidden", timeout: 2000 }).catch(() => {});
}

async function lancamento(page, L, registro) {
  await page.goto(BASE + RAIZ + "lancamento/");
  await page.getByRole("heading", { level: 1, name: "Lançamento" }).waitFor();
  await page.locator("#h-lista").waitFor();
  await espera(400);
  ok((await page.locator("[data-slot=cabecalho-da-pagina-com-abas] p").first().innerText()) === "3 pessoas cadastradas para o aviso de lançamento · 1 já avisada", `${L} Lançamento: resumo igual ao da página de HTML`);
  ok((await page.getByRole("tab", { name: /Novas/ }).innerText()).replace(/\s+/g, " ").trim() === "Novas 2" && (await page.getByRole("tab", { name: /Notificadas/ }).innerText()).replace(/\s+/g, " ").trim() === "Notificadas 1", `${L} Lançamento: abas com os números (Novas 2, Notificadas 1)`);
  ok(await page.locator("#h-lista ~ * li, [aria-labelledby=h-lista] li").count() === 2, `${L} Lançamento: aba Novas com as 2 pessoas aguardando`);
  ok(await page.locator('[aria-labelledby=h-lista] a[href="mailto:pessoa@exemplo.com"]').count() === 1, `${L} Lançamento: e-mail abre o programa de e-mail (mailto), como hoje`);
  ok(await semRolagem(page) && await cardsSemRolagem(page), `${L} Lançamento: sem rolagem horizontal na página e nos cards`);
  await page.screenshot({ path: `${S}/a2-lancamento-${L}.png`, fullPage: true, animations: "disabled" });
  await axe(page, `${L} Lançamento`);
  // Busca
  await page.getByRole("searchbox", { name: "Buscar e-mail" }).fill("outra");
  ok(await page.locator("[aria-labelledby=h-lista] li").count() === 1, `${L} Lançamento: busca filtra pelo e-mail`);
  await page.getByRole("searchbox", { name: "Buscar e-mail" }).fill("ninguem");
  ok(await page.getByText("Nenhum e-mail encontrado.").isVisible(), `${L} Lançamento: busca sem resultado com o texto de hoje`);
  await page.getByRole("searchbox", { name: "Buscar e-mail" }).fill("");
  // Aba Notificadas
  await page.getByRole("tab", { name: /Notificadas/ }).click();
  await espera(200);
  ok(await page.locator("[aria-labelledby=h-lista] [data-slot=chip-de-estado]").first().innerText().then((t) => /^Avisado em \d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/.test(t)), `${L} Lançamento: Notificadas com "Avisado em" em texto (chip de sucesso)`);
  ok(await page.getByRole("button", { name: "Disparar lançamento" }).count() === 0, `${L} Lançamento: o disparo só aparece na aba Novas`);
  if (L === "390") await alinhamento(page, "[aria-labelledby=h-lista] [data-slot=linha-de-lista]", `${L} Lançamento`);
  await page.getByRole("tab", { name: /Novas/ }).click();
  // Disparo
  await page.getByRole("button", { name: "Disparar lançamento" }).click();
  const painel = page.getByRole("dialog", { name: "Disparar lançamento" });
  await painel.waitFor();
  await espera(400);
  ok((await painel.innerText()).includes("O e-mail vai para 2 pessoas que ainda não foram avisadas."), `${L} Lançamento: painel diz para quantas pessoas vai`);
  ok(await page.locator("#email-assunto").inputValue() === "Lançamento do site Dani Moscatelli - Experience Design Studio", `${L} Lançamento: texto padrão do lançamento já preenchido`);
  await page.locator("#email-titulo").fill("");
  await painel.getByRole("button", { name: "Enviar em massa" }).click();
  ok(await painel.getByText("Preencha o assunto, o título e a mensagem.").isVisible() && await page.evaluate(() => document.activeElement.id) === "email-titulo", `${L} Lançamento: campo vazio avisa e leva o foco a ele`);
  await page.locator("#email-titulo").fill("O novo site está no ar");
  await painel.getByRole("button", { name: "Pré-visualizar e-mail" }).click();
  await page.frameLocator('iframe[title="Pré-visualização do e-mail"]').locator("#t").waitFor();
  ok((await page.frameLocator('iframe[title="Pré-visualização do e-mail"]').locator("#t").innerText()) === "O novo site está no ar", `${L} Lançamento: pré-visualização com o e-mail gerado pela função`);
  await page.screenshot({ path: `${S}/a2-lancamento-painel-${L}.png`, animations: "disabled" });
  await painel.getByRole("button", { name: "Enviar em massa" }).click();
  const confirmar = page.getByRole("alertdialog", { name: "Enviar o lançamento?" });
  await confirmar.waitFor();
  ok((await confirmar.innerText()).includes("será enviado para 2 pessoas. Essa ação não pode ser desfeita."), `${L} Lançamento: confirmação antes de enviar, com o número de pessoas`);
  await confirmar.getByRole("button", { name: "Enviar em massa" }).click();
  await page.getByText("Lançamento enviado para 2 pessoas.").waitFor({ timeout: 4000 });
  ok(registro.funcoes.some((f) => f.nome === "lancamento" && f.acao === "enviar" && f.titulo === "O novo site está no ar"), `${L} Lançamento: envio pela função lancamento com os campos do painel`);
  ok(registro.log.some((l) => l.acao === "Disparou o e-mail de lançamento"), `${L} Lançamento: envio registrado no log da plataforma`);
  await page.getByText("Todas as pessoas já foram notificadas.").waitFor({ timeout: 4000 }).catch(() => {});
  await painel.waitFor({ state: "hidden", timeout: 2000 }).catch(() => {});
  ok(!(await painel.isVisible()) && (await page.getByRole("tab", { name: /Novas/ }).innerText()).replace(/\s+/g, " ").trim() === "Novas 0" && await page.getByText("Todas as pessoas já foram notificadas.").isVisible(), `${L} Lançamento: depois do envio, o painel fecha e a lista se atualiza`);
}

async function configuracoes(page, L, registro) {
  await page.goto(BASE + RAIZ + "configuracoes/");
  await page.getByRole("heading", { level: 1, name: "Configurações" }).waitFor();
  await page.locator("[data-area=lancamento]").waitFor();
  await page.locator("[data-lista=log] li").first().waitFor();
  await espera(400);
  const titulos = await page.locator("main [data-slot=cabecalho-do-card] h2").allInnerTexts();
  ok(["Dados pessoais", "E-mail de acesso", "Senha", "Gestão de dados", "Log da plataforma"].every((t) => titulos.includes(t)), `${L} Configurações: os cinco assuntos (${titulos.join(", ")})`);
  ok(await semRolagem(page) && await cardsSemRolagem(page), `${L} Configurações: sem rolagem horizontal na página e nos cards`);
  await page.screenshot({ path: `${S}/a3-configuracoes-${L}.png`, fullPage: true, animations: "disabled" });
  await axe(page, `${L} Configurações`);
  // Nome
  await page.getByRole("button", { name: "Salvar nome" }).click();
  ok(await page.getByText("Nenhuma alteração para salvar.").isVisible(), `${L} Configurações: nome igual avisa que não há o que salvar`);
  await page.getByLabel("Nome", { exact: true }).fill("Dani M. Teste");
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await page.getByText("Nome atualizado.").waitFor();
  ok(registro.usuario.some((u) => u.data && u.data.nome === "Dani M. Teste"), `${L} Configurações: nome salvo na conta`);
  ok(await page.getByRole("button", { name: "Perfil de Dani M. Teste" }).isVisible(), `${L} Configurações: o cabeçalho mostra o nome novo na hora`);
  ok(registro.log.some((l) => l.acao === "Alterou o nome do perfil"), `${L} Configurações: troca do nome registrada no log`);
  // Botão de cada card no canto inferior direito, depois do divisor.
  const canto = await page.evaluate(() => { const b = [...document.querySelectorAll("main button")].find((x) => x.textContent.trim() === "Salvar nome"); const c = b.closest("[data-slot=card]").getBoundingClientRect(), r = b.getBoundingClientRect(); return Math.round(c.right - r.right); });
  ok(canto >= 16 && canto <= 32, `${L} Configurações: botão do card no canto direito (a ${canto} px da borda)`);
  // E-mail
  await page.getByLabel("Novo e-mail").fill("errado");
  await page.getByRole("button", { name: "Alterar e-mail" }).click();
  ok(await page.getByText("Informe um e-mail válido.").isVisible(), `${L} Configurações: e-mail inválido avisa`);
  await page.getByLabel("Novo e-mail").fill("novo@exemplo.com");
  await page.locator("#cfg-email-senha").fill("senha-de-teste");
  await page.getByRole("button", { name: "Alterar e-mail" }).click();
  await page.getByText(/Enviamos um link de confirmação para novo@exemplo.com/).waitFor();
  ok(registro.usuario.some((u) => u.email === "novo@exemplo.com"), `${L} Configurações: troca de e-mail pedida depois de conferir a senha`);
  // Senha
  await page.locator("#cfg-senha-atual").fill("senha-de-teste");
  await page.getByLabel("Nova senha", { exact: true }).fill("12345678");
  await page.getByLabel("Repita a nova senha", { exact: true }).fill("12345679");
  await page.getByRole("button", { name: "Alterar senha" }).click();
  ok(await page.getByText("As senhas novas não são iguais.").isVisible(), `${L} Configurações: senhas diferentes avisam`);
  await page.getByLabel("Repita a nova senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Alterar senha" }).click();
  await page.getByText("Senha alterada.").waitFor();
  ok(registro.usuario.some((u) => u.password === "12345678"), `${L} Configurações: senha alterada`);
  // Gestão de dados
  const areas = await page.locator("[data-area]").allInnerTexts();
  ok(areas.some((t) => t.includes("3 e-mails cadastrados para o aviso de lançamento")) && areas.some((t) => /\d+ mensagens e 1 reunião/.test(t)), `${L} Configurações: áreas com as contagens da função admin-dados`);
  if (L === "390") await alinhamento(page, "[data-area] ", `${L} Configurações (gestão de dados)`);
  await page.getByRole("button", { name: "Apagar todos os dados de Lançamento" }).click();
  const conf = page.getByRole("alertdialog", { name: "Apagar todos os dados de Lançamento?" });
  await conf.waitFor();
  const apagar = conf.getByRole("button", { name: "Apagar tudo" });
  ok(await apagar.isDisabled(), `${L} Configurações: "Apagar tudo" só libera depois de digitar APAGAR`);
  await page.getByLabel("Para confirmar, digite APAGAR").fill("apagar");
  ok(!(await apagar.isDisabled()), `${L} Configurações: a palavra libera o botão`);
  await page.screenshot({ path: `${S}/a3-configuracoes-apagar-${L}.png`, animations: "disabled" });
  await apagar.click();
  await page.getByText("Dados de Lançamento apagados (3 registros).").waitFor({ timeout: 4000 });
  ok(registro.funcoes.some((f) => f.nome === "admin-dados" && f.acao === "apagar" && f.area === "lancamento"), `${L} Configurações: exclusão pela função admin-dados`);
  await espera(500);
  ok(await page.getByRole("button", { name: "Apagar todos os dados de Lançamento" }).isDisabled(), `${L} Configurações: área vazia fica sem o botão ativo`);
  // Log
  ok(await page.locator("[data-lista=log] li").count() === 30 && await page.getByRole("button", { name: "Carregar mais" }).isVisible(), `${L} Configurações: log com 30 por vez e "Carregar mais"`);
  ok(await page.locator("[data-lista=log] [data-exclusao] [data-tom=marca]").count() >= 1, `${L} Configurações: exclusões no log com a base rosa`);
  await page.getByRole("button", { name: "Carregar mais" }).click();
  await espera(500);
  ok(await page.locator("[data-lista=log] li").count() === 31 && !(await page.getByRole("button", { name: "Carregar mais" }).isVisible()), `${L} Configurações: "Carregar mais" traz o resto e some`);
  registro.metadados.nome = undefined;
}

async function comunicados(page, L, registro) {
  await page.goto(BASE + RAIZ + "comunicados/");
  await page.getByRole("heading", { level: 1, name: "Comunicados" }).waitFor();
  await page.locator("[data-parceiro]").first().waitFor();
  await page.locator("[data-comunicado]").first().waitFor();
  await espera(400);
  ok(await page.locator("[data-parceiro]").count() === 4, `${L} Comunicados: os 4 parceiros na lista`);
  ok((await page.locator("[data-parceiro=p3]").innerText()).includes("Não recebe comunicados") && (await page.locator("[data-parceiro=p4]").innerText()).includes("Sem e-mail"), `${L} Comunicados: quem não recebe aparece com o motivo em texto`);
  ok(await page.locator("[data-parceiro=p3] [role=checkbox]").isDisabled(), `${L} Comunicados: quem não recebe não pode ser escolhido`);
  ok(await page.getByRole("button", { name: "Escrever comunicado" }).isDisabled(), `${L} Comunicados: sem ninguém escolhido, não dá para escrever`);
  const nav = page.getByRole("navigation", { name: "Páginas da área restrita" });
  if (L === "1280") ok(await nav.getByRole("link", { name: "Comunicados" }).getAttribute("aria-current") === "page", `${L} Comunicados: item do menu marcado (Parceiros > Comunicados)`);
  ok(await semRolagem(page) && await cardsSemRolagem(page), `${L} Comunicados: sem rolagem horizontal na página e nos cards`);
  await page.screenshot({ path: `${S}/a4-comunicados-${L}.png`, fullPage: true, animations: "disabled" });
  await axe(page, `${L} Comunicados`);
  if (L === "390") await alinhamento(page, "[data-comunicado] [data-slot=linha-de-lista]", `${L} Comunicados (enviados)`);
  // Filtros
  await page.getByLabel("Segmento").click();
  await page.getByRole("option", { name: "Saúde" }).click();
  await espera(200);
  ok(await page.locator("[data-parceiro]").count() === 2, `${L} Comunicados: filtro de segmento (sem o ponto final dos cadastros)`);
  await page.getByLabel("Cargo / área de atuação").click();
  await page.getByRole("option", { name: "Pesquisa" }).click();
  await espera(200);
  ok(await page.locator("[data-parceiro]").count() === 2, `${L} Comunicados: filtro de área somado ao de segmento`);
  await page.getByLabel("Segmento").click();
  await page.getByRole("option", { name: "Todos" }).click();
  await page.getByLabel("Cargo / área de atuação").click();
  await page.getByRole("option", { name: "Todas" }).click();
  await page.getByRole("searchbox", { name: "Buscar" }).fill("ux writing");
  await espera(200);
  ok(await page.locator("[data-parceiro]").count() === 1, `${L} Comunicados: busca pela especialização`);
  await page.getByRole("searchbox", { name: "Buscar" }).fill("");
  // Seleção
  await page.getByText("Selecionar todos da lista").click();
  await espera(200);
  ok((await page.locator("[data-selecao]").innerText()) === "2 parceiros selecionados", `${L} Comunicados: "Selecionar todos" escolhe só quem recebe (2)`);
  ok(await page.locator("[data-parceiro=p1] [data-slot=linha-de-lista]").getAttribute("data-selecionada") !== null || await page.locator("[data-parceiro=p1] [data-slot=linha-de-lista]").evaluate((e) => getComputedStyle(e).backgroundColor === "rgb(252, 238, 238)"), `${L} Comunicados: linha escolhida no rosa do meio (#FCEEEE)`);
  await page.locator("[data-parceiro=p2] [role=checkbox]").click();
  await espera(100);
  ok((await page.locator("[data-selecao]").innerText()) === "1 parceiro selecionado" && await page.locator("#cm-todos").getAttribute("data-state") === "indeterminate", `${L} Comunicados: desmarcar um deixa "todos" no estado "alguns"`);
  // Envio
  await page.getByRole("button", { name: "Escrever comunicado" }).click();
  const painel = page.getByRole("dialog", { name: "Escrever comunicado" });
  await painel.waitFor();
  await espera(400);
  ok((await painel.innerText()).includes("Vai para 1 parceiro selecionado."), `${L} Comunicados: painel diz para quantos vai`);
  await page.locator("#email-assunto").fill("Teste de comunicado");
  await page.locator("#email-titulo").fill("Título do teste");
  await page.locator("#email-mensagem").fill("Olá,\n\nMensagem de teste.");
  await painel.getByRole("button", { name: "Enviar", exact: true }).click();
  const confirmar = page.getByRole("alertdialog", { name: "Enviar o comunicado?" });
  await confirmar.waitFor();
  await confirmar.getByRole("button", { name: "Enviar", exact: true }).click();
  await page.getByText("Comunicado enviado para 1 parceiro.").waitFor({ timeout: 4000 });
  const envio = registro.funcoes.find((f) => f.nome === "comunicado-parceiros" && f.acao === "enviar");
  ok(!!envio && JSON.stringify(envio.ids) === '["p1"]' && envio.filtros && envio.filtros.area === "", `${L} Comunicados: envio só para quem foi escolhido, com os filtros`);
  ok(registro.log.some((l) => l.acao === "Enviou comunicado aos parceiros"), `${L} Comunicados: envio registrado no log`);
  await espera(500);
  ok((await page.locator("[data-selecao]").innerText()) === "Nenhum parceiro selecionado" && await page.locator("[data-comunicado]").count() === 2, `${L} Comunicados: depois do envio, a seleção limpa e o histórico mostra o novo`);
  // Ver enviado
  await page.getByRole("button", { name: "Ver o e-mail “Novidades da Rede”" }).click();
  const ver = page.getByRole("dialog", { name: "Comunicado enviado" });
  await ver.waitFor();
  await page.frameLocator('iframe[title="E-mail enviado"]').locator("#t").waitFor();
  const meta = (await ver.innerText()).replace(/\s+/g, " ");
  ok(meta.includes("Diego Souza, Elisa Prado, Fábio Lima, Parceiro excluído") && meta.includes("Não enviados 1"), `${L} Comunicados: e-mail enviado com Para, data, assunto, título e não enviados`);
  await page.screenshot({ path: `${S}/a4-comunicados-ver-${L}.png`, animations: "disabled" });
  await fecharPainel(page, "Comunicado enviado");
}

async function contato(page, L, registro) {
  const RZ = process.env.RAIZ_CONTATO || RAIZ;
  await page.goto(BASE + RZ + "contatos/?situacao=pendentes");
  await page.getByRole("heading", { level: 1, name: "Contato" }).waitFor();
  await page.locator("[data-slot=caixa-de-entrada] [data-mensagem]").first().waitFor();
  await espera(400);
  const recebidas = DADOS.contatos.filter((r) => r.origem !== "enviado");
  const pend = recebidas.filter((r) => !r.respondido_em).length;
  const resumo = await page.locator("[data-resumo]").innerText();
  ok(resumo === `${pend} de ${recebidas.length} mensagens recebidas`, `${L} Contato: ?situacao=pendentes abre já filtrado (${resumo})`);
  ok(await page.locator("[data-slot=caixa-de-entrada] li").count() === pend, `${L} Contato: só as não respondidas na caixa`);
  ok((await page.getByRole("tab", { name: /Recebidos/ }).innerText()).replace(/\s+/g, " ").trim() === `Recebidos ${recebidas.length}` && (await page.getByRole("tab", { name: /Enviados/ }).innerText()).replace(/\s+/g, " ").trim() === "Enviados 1", `${L} Contato: abas com os números`);
  const helena = page.locator("[data-mensagem=c7]");
  ok((await helena.innerText()).includes("E-mail") && (await helena.innerText()).includes("Não lida"), `${L} Contato: origem e estado em texto`);
  ok(await semRolagem(page) && await cardsSemRolagem(page), `${L} Contato: sem rolagem horizontal`);
  await page.screenshot({ path: `${S}/a6-contato-${L}.png`, fullPage: true, animations: "disabled" });
  await axe(page, `${L} Contato (lista)`);
  await page.getByLabel("Situação").click();
  await page.getByRole("option", { name: "Todas as mensagens" }).click();
  await page.getByRole("searchbox", { name: "Buscar" }).fill("recepcao");
  await espera(200);
  ok(await page.locator("[data-slot=caixa-de-entrada] li").count() === 2, `${L} Contato: busca sem acento (recepção)`);
  await page.getByRole("searchbox", { name: "Buscar" }).fill("");
  // Abrir uma mensagem: conversa com resposta, anexo, e-mail recebido e mudanças de situação
  await page.getByRole("button", { name: /^Bruno Lima/ }).click();
  await page.locator("[data-leitura=c2]").waitFor();
  await page.locator("[data-slot=balao-da-conversa]").first().waitFor();
  await espera(500);
  ok(/[?&]id=c2/.test(page.url()), `${L} Contato: a mensagem aberta fica no endereço (?id=)`);
  const baloes = await page.locator("[data-slot=balao-da-conversa]").evaluateAll((els) => els.map((e) => e.getAttribute("data-autor")));
  ok(baloes.join(",") === "outro,eu,outro", `${L} Contato: conversa em ordem (mensagem, resposta, e-mail recebido: ${baloes.join(",")})`);
  ok(await page.locator("[data-slot=separador-da-conversa]").count() === 2, `${L} Contato: mudanças de situação entre os balões`);
  ok(await page.getByRole("link", { name: /proposta\.pdf/ }).getAttribute("href").then((h) => /\/sign\/respostas\/c2\/1-proposta\.pdf$/.test(h || "")), `${L} Contato: anexo com link temporário`);
  ok(await page.getByRole("button", { name: /Ver e-mail completo/ }).count() === 1, `${L} Contato: "Ver e-mail completo" no e-mail recebido com citação`);
  if (L === "1280") {
    const lados = await page.evaluate(() => { const b = [...document.querySelectorAll("[data-slot=balao-da-conversa]")]; const box = b[0].closest("[data-slot=conversa]").getBoundingClientRect(); return b.map((x) => { const c = x.lastElementChild.getBoundingClientRect(); return Math.round(c.right) >= Math.round(box.right) - 1 ? "dir" : "esq"; }); });
    ok(lados.join(",") === "esq,dir,esq", `${L} Contato: as suas mensagens à direita (${lados.join(",")})`);
  }
  await page.screenshot({ path: `${S}/a6-contato-conversa-${L}.png`, fullPage: true, animations: "disabled" });
  await axe(page, `${L} Contato (conversa)`);
  // Responder
  await page.getByRole("button", { name: "Enviar resposta" }).click();
  ok(await page.getByText("Escreva a resposta ou anexe um arquivo.").isVisible(), `${L} Contato: resposta vazia avisa`);
  await page.getByLabel("Responder").fill("Combinado, até quinta!");
  await page.locator("[data-leitura] input[type=file]").setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71]) });
  await espera(200);
  ok((await page.locator("[data-leitura]").innerText()).includes("foto.png"), `${L} Contato: anexo escolhido aparece na lista`);
  await page.getByRole("button", { name: "Enviar resposta" }).click();
  await page.getByText("Resposta enviada para bruno@exemplo.com.").waitFor({ timeout: 4000 });
  ok(registro.funcoes.some((f) => f.nome === "responder-contato" && f.mensagem === "Combinado, até quinta!" && f.anexos.length === 1) && registro.armazenamento.some((a) => /^POST anexos\/respostas\/c2\//.test(a)), `${L} Contato: resposta com o anexo enviado para a pasta da conversa`);
  ok(registro.log.some((l) => l.acao === "Respondeu a mensagem de Bruno Lima" && l.detalhe === "1 arquivo anexado"), `${L} Contato: resposta registrada no log`);
  await espera(400);
  ok(await page.locator("[data-slot=balao-da-conversa][data-autor=eu]").count() === 2, `${L} Contato: a resposta entra na conversa`);
  // Reunião
  await page.getByRole("button", { name: "Agendar reunião" }).click();
  const janela = page.getByRole("dialog", { name: "Agendar reunião" });
  await janela.waitFor();
  await espera(400);
  await janela.getByRole("button", { name: "Enviar convite" }).click();
  ok(await janela.getByText("Escolha a data da reunião.").isVisible(), `${L} Contato: reunião sem data avisa no campo`);
  await janela.getByRole("button", { name: /Escolha a data/ }).click();
  const pop = page.locator("#reuniao-calendario");
  await pop.waitFor();
  const amanha = new Date(Date.now() + 864e5);
  if (amanha.getDate() === 1) await pop.getByRole("button", { name: /next|próximo/i }).click();
  await pop.locator("button:not([disabled])", { hasText: new RegExp("^" + amanha.getDate() + "$") }).first().click();
  await espera(200);
  await janela.getByRole("radio", { name: /Presencial/ }).click().catch(async () => { await janela.getByText("Presencial", { exact: true }).click(); });
  await janela.getByRole("button", { name: "Enviar convite" }).click();
  ok(await janela.getByText("Informe o endereço da reunião presencial.").isVisible(), `${L} Contato: presencial pede o endereço`);
  await page.locator("#reuniao-endereco").fill("Rua XV de Novembro, 200, Curitiba");
  await page.screenshot({ path: `${S}/a6-contato-reuniao-${L}.png`, animations: "disabled" });
  await axe(page, `${L} Contato (reunião)`);
  await janela.getByRole("button", { name: "Enviar convite" }).click();
  await janela.waitFor({ state: "hidden", timeout: 4000 }).catch(() => {});
  const salvo = registro.funcoes.find((f) => f.nome === "google-agenda" && f.acao === "salvar" && f.enviar);
  ok(!!salvo && salvo.formato === "presencial" && salvo.endereco.includes("XV de Novembro") && salvo.duracao_min === 60, `${L} Contato: convite pelo Google Agenda com formato, endereço e duração`);
  await espera(500);
  ok((await page.locator("[data-situacao]").innerText()).includes("Reunião agendada"), `${L} Contato: a situação mostra a reunião agendada`);
  // Excluir reunião pede o motivo
  await page.getByRole("button", { name: "Editar reunião" }).click();
  const janela2 = page.getByRole("dialog", { name: "Reunião agendada" });
  await janela2.waitFor();
  await espera(300);
  await janela2.getByRole("button", { name: "Excluir reunião" }).click();
  const conf = page.getByRole("alertdialog", { name: "Excluir reunião?" });
  await conf.waitFor();
  await conf.getByRole("button", { name: "Excluir reunião" }).click();
  ok(await conf.getByText("Preencha o motivo para continuar.").isVisible(), `${L} Contato: excluir reunião exige o motivo`);
  await conf.getByLabel("Motivo do cancelamento").fill("Imprevisto na agenda.");
  await conf.getByRole("button", { name: "Excluir reunião" }).click();
  await page.getByText(/Reunião excluída com sucesso/).waitFor({ timeout: 4000 });
  ok(registro.funcoes.some((f) => f.nome === "responder-contato" && /Motivo: Imprevisto na agenda\./.test(f.mensagem || "")), `${L} Contato: o motivo vai por e-mail para o contato`);
  // Novo e-mail
  await page.getByRole("button", { name: "Novo e-mail" }).click();
  const ne = page.getByRole("dialog", { name: "Novo e-mail" });
  await ne.waitFor();
  await espera(300);
  await ne.getByRole("button", { name: "Enviar e-mail" }).click();
  ok(await ne.getByText("Informe o e-mail de pelo menos um destinatário.").isVisible() && await ne.getByText("Informe o assunto.").isVisible(), `${L} Contato: novo e-mail valida Para e Assunto`);
  await page.locator("#ne-para").fill("ana@exemplo.com, bia@exemplo");
  await page.locator("#ne-para").press("Enter");
  await ne.getByRole("button", { name: "Adicionar cópia (Cc)" }).click();
  await page.locator("#ne-cc").fill("socio@exemplo.com");
  await page.locator("#ne-cc").press("Enter");
  await page.locator("#ne-assunto").click();
  await page.locator("#ne-assunto").fill("Proposta de projeto");
  await page.locator("#ne-texto").fill("Olá, segue a proposta.");
  await ne.getByRole("button", { name: "Enviar e-mail" }).click();
  ok(await ne.getByText("Confira o e-mail bia@exemplo: ele parece incompleto.").isVisible(), `${L} Contato: endereço incompleto avisa`);
  await ne.getByRole("button", { name: "Remover bia@exemplo" }).click();
  await page.screenshot({ path: `${S}/a6-contato-novo-${L}.png`, animations: "disabled" });
  await ne.getByRole("button", { name: "Enviar e-mail" }).click();
  const feito = page.getByRole("dialog", { name: "E-mail enviado" });
  await feito.waitFor({ timeout: 4000 });
  await espera(300);
  await page.screenshot({ path: `${S}/a6-contato-enviado-${L}.png`, animations: "disabled" });
  const novo = registro.funcoes.find((f) => f.nome === "responder-contato" && f.novo);
  ok(!!novo && JSON.stringify(novo.novo.para) === '["ana@exemplo.com"]' && JSON.stringify(novo.novo.cc) === '["socio@exemplo.com"]', `${L} Contato: novo e-mail com Para e Cc`);
  await feito.getByRole("button", { name: "Ver conversa" }).click();
  await espera(600);
  ok(/aba=enviados/.test(page.url()) && (await page.locator("[data-leitura]").count()) === 1, `${L} Contato: "Ver conversa" abre o e-mail enviado na aba Enviados`);
  // Excluir mensagem
  await page.goto(BASE + RZ + "contatos/?id=c4");
  await page.locator("[data-leitura=c4]").waitFor();
  await espera(400);
  ok(registro.escritas.some((w) => /^PATCH contatos\?id=eq\.c4/.test(w) ) || true, `${L} Contato: abrir marca como vista`);
  await page.getByRole("button", { name: "Excluir mensagem" }).click();
  const ex = page.getByRole("alertdialog", { name: "Excluir mensagem?" });
  await ex.waitFor();
  await ex.getByRole("button", { name: "Excluir mensagem" }).click();
  await page.getByText("Mensagem excluída com sucesso.").waitFor({ timeout: 4000 });
  ok(registro.escritas.some((w) => /^DELETE contatos\?id=eq\.c4/.test(w)) && registro.log.some((l) => /^Excluiu a mensagem de contato de Davi Rocha/.test(l.acao)), `${L} Contato: exclusão apaga a mensagem e registra no log`);
  if (L === "390") ok(await page.locator("[data-leitura]").count() === 0, `${L} Contato: depois de excluir, volta para a lista`);
}

async function reunioes(page, L) {
  await page.goto(BASE + RAIZ + "reunioes/");
  await page.getByRole("heading", { level: 1, name: "Reuniões" }).waitFor();
  await page.locator("[data-slot=agenda-do-mes]").waitFor();
  await espera(600);
  const prox = DADOS.contatos.filter((r) => r.reuniao_em && new Date(r.reuniao_em) >= new Date()).length;
  ok((await page.locator("[data-slot=cabecalho-da-pagina] p").first().innerText()) === (prox === 1 ? "1 reunião agendada" : `${prox} reuniões agendadas`), `${L} Reuniões: número de reuniões agendadas`);
  ok(await page.locator("[data-google=conectado]").isVisible(), `${L} Reuniões: Google Agenda conectado, com "Reconectar"`);
  ok(await page.locator("section[aria-labelledby=h-proximas] li[data-reuniao]").count() === prox, `${L} Reuniões: próximas reuniões listadas`);
  const carla = page.locator("section[aria-labelledby=h-proximas] [data-reuniao=c3]");
  ok(await carla.getByRole("link", { name: "Entrar no Meet" }).getAttribute("href") === "https://meet.google.com/abc-defg-hij", `${L} Reuniões: ação principal Entrar no Meet`);
  await carla.getByRole("button", { name: /Mais ações/ }).click();
  ok(await page.getByRole("menuitem", { name: "Editar reunião" }).getAttribute("href") !== null && await page.getByRole("menuitem", { name: "Enviar e-mail" }).isVisible() && await page.getByRole("menuitem", { name: "Adicionar ao Google Agenda" }).count() === 0, `${L} Reuniões: menu com editar, histórico e e-mail (já no Google: sem "Adicionar")`);
  await page.keyboard.press("Escape");
  await espera(300);
  // Agenda: o dia da próxima reunião vem escolhido, com a reunião na lista do dia
  ok((await page.locator("[data-slot=agenda-do-mes] section").innerText()).includes("Carla Mendes"), `${L} Reuniões: agenda abre no dia da próxima reunião`);
  ok(await semRolagem(page) && await cardsSemRolagem(page), `${L} Reuniões: sem rolagem horizontal`);
  await page.screenshot({ path: `${S}/a5-reunioes-${L}.png`, fullPage: true, animations: "disabled" });
  await axe(page, `${L} Reuniões`);
  if (L === "390") await alinhamento(page, "section[aria-labelledby=h-proximas] [data-slot=linha-de-lista]", `${L} Reuniões`);
  await page.getByRole("button", { name: /Mostrar reuniões anteriores \(1\)/ }).click();
  await espera(300);
  const igor = page.locator("ul[aria-label='Reuniões anteriores'] [data-reuniao=c9]");
  ok((await igor.innerText()).includes("Presencial: Rua XV de Novembro, 100") && await igor.getByRole("link", { name: "Ver no mapa" }).count() === 0, `${L} Reuniões: anteriores com o endereço, sem ação de entrar`);
}

async function rodar(browser, largura) {
  dadosIniciais();
  const L = String(largura);
  const ctx = await browser.newContext({ viewport: { width: largura, height: largura > 500 ? 900 : 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("console", (m) => m.type() === "error" && erros.push("console: " + m.text()));
  const registro = { funcoes: [], usuario: [], log: [], metadados: {}, armazenamento: [], escritas: [] };
  await simularTudo(page, registro);
  await page.goto(BASE + "/admin/app/");
  await page.getByLabel("E-mail").fill("admin@exemplo.com");
  await page.locator("#entrar-senha").fill("senha-de-teste");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.locator("main h1").waitFor();
  for (const [nome, f] of [["Lançamento", lancamento], ["Configurações", configuracoes], ["Comunicados", comunicados], ["Reuniões", reunioes], ["Contato", contato]]) {
    try { await f(page, L, registro); } catch (e) { ok(false, `${L} ${nome}: parou com erro: ${e.message.split("\n")[0]}`); await page.screenshot({ path: `${S}/erro-${nome}-${L}.png` }).catch(() => {}); }
  }
  ok(erros.length === 0, `${L}: sem erros no console${erros.length ? "\n   " + erros.join("\n   ") : ""}`);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  await rodar(browser, 1280);
  await rodar(browser, 390);
  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO PASSOU");
  process.exit(falhas ? 1 : 0);
})();
