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
function dadosIniciais() {
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
    } else if (nome === "admin-dados" && body.acao === "contagem") resp = { contatos: DADOS.contatos.length, reunioes: 1, parceiros: DADOS.cadastros.length, lancamento: DADOS.notificacoes_lancamento.length };
    else if (nome === "admin-dados" && body.acao === "apagar") {
      const total = DADOS.notificacoes_lancamento.length;
      if (body.area === "lancamento") DADOS.notificacoes_lancamento = [];
      resp = { total };
    }
    return r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(resp) });
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
  page.on("request", (req) => { if (req.method() === "POST" && /rest\/v1\/admin_log/.test(req.url())) registro.log.push(JSON.parse(req.postData() || "{}")); });
}

const semRolagem = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const cardsSemRolagem = (page) => page.evaluate(() => [...document.querySelectorAll('[data-slot="card"]')].every((c) => c.scrollWidth <= c.clientWidth + 1));
async function axe(page, nome) {
  if (!AXE) return console.log(`AVISO ${nome}: axe-core não informado (variável AXE)`);
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`));
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

async function contato(page, L) {
  // Só em prévia: a conversa de cada mensagem ainda é a página de HTML (ADMIN_REACT.md, 8.1).
  await page.goto(BASE + "/admin/app/contatos/?situacao=pendentes");
  await page.getByRole("heading", { level: 1, name: "Contato" }).waitFor();
  await page.locator("[data-mensagem]").first().waitFor();
  await espera(400);
  const recebidas = DADOS.contatos.filter((r) => r.origem !== "enviado");
  const pend = recebidas.filter((r) => !r.respondido_em).length;
  ok((await page.locator("[data-resumo]").innerText()) === `${pend} de ${recebidas.length} mensagens recebidas`, `${L} Contato: ?situacao=pendentes abre já filtrado (${await page.locator("[data-resumo]").innerText()})`);
  ok(await page.locator("[data-mensagem]").count() === pend, `${L} Contato: só as não respondidas`);
  ok((await page.getByRole("tab", { name: /Recebidos/ }).innerText()).replace(/\s+/g, " ").trim() === `Recebidos ${recebidas.length}` && (await page.getByRole("tab", { name: /Enviados/ }).innerText()).replace(/\s+/g, " ").trim() === "Enviados 1", `${L} Contato: abas com os números`);
  const helena = page.locator("[data-mensagem=c7]");
  ok((await helena.innerText()).includes("E-mail") && (await helena.innerText()).includes("Não lida") && await helena.locator("a, [href]").first().getAttribute("href") === "/admin/contatos/?id=c7" || await page.locator("[data-mensagem=c7] a").getAttribute("href") === "/admin/contatos/?id=c7", `${L} Contato: origem e estado em texto; a linha abre a conversa (página de HTML)`);
  ok(await semRolagem(page) && await cardsSemRolagem(page), `${L} Contato: sem rolagem horizontal na página e nos cards`);
  await page.screenshot({ path: `${S}/a6-contato-${L}.png`, fullPage: true, animations: "disabled" });
  await axe(page, `${L} Contato`);
  if (L === "390") await alinhamento(page, "[data-mensagem] [data-slot=linha-de-lista]", `${L} Contato`);
  await page.getByLabel("Situação").click();
  await page.getByRole("option", { name: "Todas as mensagens" }).click();
  await page.getByRole("searchbox", { name: "Buscar" }).fill("recepcao");
  await espera(200);
  ok(await page.locator("[data-mensagem]").count() === 2, `${L} Contato: busca sem acento (recepção)`);
  await page.getByRole("searchbox", { name: "Buscar" }).fill("");
  await page.getByRole("tab", { name: /Enviados/ }).click();
  await espera(200);
  ok(/aba=enviados/.test(page.url()) && (await page.locator("[data-mensagem=c8]").innerText()).includes("Para: ana@exemplo.com · Cc: socio@exemplo.com"), `${L} Contato: aba Enviados no endereço, com Para e Cc`);
}

async function rodar(browser, largura) {
  dadosIniciais();
  const L = String(largura);
  const ctx = await browser.newContext({ viewport: { width: largura, height: largura > 500 ? 900 : 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("console", (m) => m.type() === "error" && erros.push("console: " + m.text()));
  const registro = { funcoes: [], usuario: [], log: [], metadados: {} };
  await simularTudo(page, registro);
  await page.goto(BASE + "/admin/app/");
  await page.getByLabel("E-mail").fill("admin@exemplo.com");
  await page.locator("#entrar-senha").fill("senha-de-teste");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.locator("main h1").waitFor();
  for (const [nome, f] of [["Lançamento", lancamento], ["Configurações", configuracoes], ["Comunicados", comunicados], ["Contato", contato]]) {
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
