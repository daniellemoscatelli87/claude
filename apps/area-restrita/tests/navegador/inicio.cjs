// Login -> Início da área restrita em React (/admin/app/), com o Supabase simulado na rede (as páginas usam o cliente
// real, que conversa com respostas falsas, com dados fictícios). Compara com a Início de HTML (/admin/), que reaproveita
// a mesma sessão. 1280 e 390 px: sem erros no console, sem rolagem horizontal e axe sem violações WCAG A/AA na Início.
//
// Uso, na raiz do repositório, depois de "npm run build":
//   node apps/area-restrita/tests/navegador/servidor.cjs dist 4310 &
//   PORTA=4310 CAPTURAS=/pasta/das/capturas AXE=/caminho/axe.min.js node apps/area-restrita/tests/navegador/inicio.cjs
// Precisa do Playwright instalado (require("playwright")); o axe-core é opcional (variável AXE).
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const path = require("path");
const S = process.env.CAPTURAS || require("os").tmpdir();
const BASE = "http://localhost:" + (process.env.PORTA || 4310);
const UMD = fs.readFileSync(path.join(__dirname, "../../node_modules/@supabase/supabase-js/dist/umd/supabase.js"), "utf8");
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const agora = Math.floor(Date.now() / 1000);
const usuario = { id: "u1", aud: "authenticated", role: "authenticated", email: "admin@exemplo.com", app_metadata: { role: "admin", provider: "email" }, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const token = [b64({ alg: "ES256", typ: "JWT", kid: "k" }), b64({ sub: "u1", aud: "authenticated", role: "authenticated", exp: agora + 3600, iat: agora, email: usuario.email, app_metadata: usuario.app_metadata, user_metadata: {}, iss: "https://lipfvnerohkaajegqvwr.supabase.co/auth/v1" }), "assinatura"].join(".");
const sessao = { access_token: token, token_type: "bearer", expires_in: 3600, expires_at: agora + 3600, refresh_token: "r1", user: usuario };

const h = (d) => new Date(Date.now() - d * 36e5).toISOString();
const DADOS = {
  contatos: [
    { id: "c1", created_at: h(2), nome: "Ana Ribeiro", empresa: "Clínica Bem Viver", cargo: "Diretora de operações", assunto: "Projeto de experiência do paciente", visualizado_em: null, respondido_em: null, reuniao_em: null },
    { id: "c2", created_at: h(30), nome: "Bruno Lima", empresa: "Varejo Sul", cargo: "Gerente", assunto: "Pesquisa com clientes", visualizado_em: h(29), respondido_em: h(28), reuniao_em: null },
    { id: "c3", created_at: h(80), nome: "Carla Mendes", empresa: null, cargo: "Coordenadora", assunto: "Workshop de jornada", visualizado_em: h(79), respondido_em: h(78), reuniao_em: h(-48) },
    { id: "c4", created_at: h(100), nome: "Davi Rocha", empresa: "Rede Saúde Mais", cargo: "Gerente de qualidade", assunto: "Diagnóstico da recepção", visualizado_em: h(99), respondido_em: null, reuniao_em: null },
    { id: "c5", created_at: h(130), nome: "Eva Martins", empresa: "Escola Horizonte", cargo: "Diretora", assunto: "Pesquisa com famílias", visualizado_em: h(120), respondido_em: h(110), reuniao_em: null },
    { id: "c6", created_at: h(170), nome: "Fábio Teixeira", empresa: "Loja Central", cargo: null, assunto: "Atendimento no balcão", visualizado_em: null, respondido_em: null, reuniao_em: null },
  ],
  cadastros: [
    { id: "p1", created_at: h(5), nome: "Diego Souza", empresa: "Estúdio DS", principal_especializacao: "Pesquisa com usuários", segmentos: ["Saúde.", "Varejo", "Educação"], visualizado_em: null },
    { id: "p2", created_at: h(50), nome: "Elisa Prado", empresa: "", principal_especializacao: "UX writing", segmentos: ["Serviços"], visualizado_em: h(40) },
  ],
  notificacoes_lancamento: [{ id: "l1", created_at: h(3), email: "pessoa@exemplo.com" }, { id: "l2", created_at: h(70), email: "outra.pessoa@exemplo.com" }],
  email_envios: [{ id: "e1", cadastro_id: "p2", assunto: "Boas-vindas à Rede", aberto_em: h(6), clicado_em: null, cadastros: { nome: "Elisa Prado" } }],
  pesquisa_respostas: [{ pesquisa: "moda-curitiba", nome: "Fernanda", created_at: h(8), atualizado_em: h(7) }],
  pesquisas: [{ slug: "moda-curitiba", titulo: "Moda em Curitiba" }],
  mensagens_recebidas: [],
};

async function simularSupabase(page) {
  await page.route(/cdn\.jsdelivr\.net\/npm\/@supabase/, (r) => r.fulfill({ contentType: "application/javascript", body: UMD }));
  await page.route(/lipfvnerohkaajegqvwr\.supabase\.co\/auth\/v1\/(token|user|logout)/, (r) =>
    r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(/\/user/.test(r.request().url()) ? usuario : sessao) }));
  await page.route(/lipfvnerohkaajegqvwr\.supabase\.co\/rest\/v1\/([a-z_]+)/, (r) => {
    const tabela = /rest\/v1\/([a-z_]+)/.exec(r.request().url())[1];
    const req = r.request();
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-expose-headers": "content-range" };
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: { ...cors, "access-control-allow-methods": "*" } });
    if (req.method() === "POST") return r.fulfill({ status: 201, headers: cors, body: "" });
    const d = DADOS[tabela] || [];
    r.fulfill({ status: 200, contentType: "application/json", headers: { ...cors, "content-range": `0-${Math.max(d.length - 1, 0)}/${d.length}` }, body: req.method() === "HEAD" ? "" : JSON.stringify(d) });
  });
}

const semRolagem = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
async function axe(page, nome, soAviso = false) {
  if (!AXE) return console.log(`AVISO ${nome}: axe-core não informado (variável AXE); conferência de acessibilidade pulada`);
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`));
  if (soAviso) return console.log(`AVISO ${nome}: axe ${r.length ? "encontrou (peças do DS):\n   " + r.join("\n   ") : "sem violações"}`);
  ok(r.length === 0, `${nome}: axe sem violações WCAG A/AA${r.length ? "\n   " + r.join("\n   ") : ""}`);
}

async function rodar(browser, largura) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: largura > 500 ? 900 : 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("console", (m) => m.type() === "error" && erros.push("console: " + m.text()));
  await simularSupabase(page);
  const L = `${largura}`;

  // Login
  await page.goto(BASE + "/admin/app/");
  await page.getByRole("heading", { name: "Entrar" }).waitFor();
  ok(await page.getByText("Área restrita").isVisible(), `${L}: tela Entrar com o selo Área restrita`);
  ok(await semRolagem(page), `${L}: login sem rolagem horizontal`);
  await page.getByRole("button", { name: "Entrar" }).click();
  ok(await page.getByText("Informe o e-mail e a senha.").isVisible(), `${L}: validação sem e-mail e senha`);
  await page.getByLabel("E-mail").fill("admin@exemplo.com");
  await page.locator("#entrar-senha").fill("senha-de-teste");
  await page.getByRole("button", { name: "Mostrar senha" }).click();
  ok(await page.locator("#entrar-senha").getAttribute("type") === "text", `${L}: olho mostra a senha (PasswordInput do DS)`);
  await page.screenshot({ path: `${S}/admin-react-login-${L}.png` });
  await axe(page, `${L} Entrar`, true);
  await page.getByRole("button", { name: "Entrar" }).click();

  // Início
  await page.getByRole("heading", { level: 1, name: /(Bom dia|Boa tarde|Boa noite), Dani!/ }).waitFor();
  await page.locator('[data-kpi="mensagens"]').waitFor();
  await espera(600);
  ok(true, `${L}: login leva à Início com a saudação`);
  ok(await page.locator("[data-kpi]").count() === 4, `${L}: 4 cards de número`);
  const prioridade = page.locator("[data-prioridade]");
  ok(/\d+ mensagens esperam resposta/.test(await prioridade.innerText()), `${L}: o que pede ação vem primeiro (mensagens sem resposta)`);
  ok(await prioridade.getByRole("link", { name: "Responder mensagens" }).getAttribute("href") === "/admin/contatos/?situacao=pendentes", `${L}: com pendentes, a ação leva às não respondidas`);
  ok(await page.locator('[data-kpi="mensagens"] a').getAttribute("href") === "/admin/contatos/", `${L}: o card de mensagens inteiro leva à caixa de entrada`);
  ok((await page.locator('[data-kpi="mensagens"] a').innerText()).trim() === "Mensagens na semana", `${L}: o link do card é o rótulo, sem "Ver ..." repetido`);
  // Números lado a lado nunca apertados: 4 só com 14rem (224 px) por card; senão 2 × 2 ou 1 coluna.
  const larguras = await page.locator("[data-kpi]").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  const tops = await page.locator("[data-kpi]").evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size);
  ok(Math.min(...larguras) >= 224, `${L}: cards de número com pelo menos 224 px (${larguras.join(", ")}; ${tops} linha(s))`);
  // Contador do sino: redondo, vermelho (--primary), número branco, no canto do ícone.
  const sino = await page.evaluate(() => {
    const b = document.querySelector('[data-slot="notificacoes"]');
    const c = b.querySelector('[data-slot="contador-do-painel"]');
    const i = b.querySelector("svg").getBoundingClientRect(), r = c.getBoundingClientRect(), cs = getComputedStyle(c);
    return { alto: r.height, largo: r.width, raio: parseFloat(cs.borderRadius), fundo: cs.backgroundColor, cor: cs.color, dx: Math.round(r.left + r.height / 2 - i.right), dy: Math.round(r.top + r.height / 2 - i.top), botao: b.getBoundingClientRect().height };
  });
  ok(sino.alto === 20 && sino.largo >= 20 && sino.raio >= 10 && sino.fundo === "rgb(184, 40, 40)" && sino.cor === "rgb(255, 255, 255)" && Math.abs(sino.dx) <= 1 && Math.abs(sino.dy) <= 1 && sino.botao >= 44, `${L}: contador do sino redondo, vermelho (--primary-text, 6,2:1), no canto do ícone, botão de 44 px (${JSON.stringify(sino)})`);
  ok(await page.locator('section[aria-labelledby=h-contato] [role=img]').count() === 1, `${L}: barra com a situação das últimas mensagens`);
  ok(await page.locator("section[aria-labelledby=h-contato] [data-slot=linha-de-lista]").count() === 5, `${L}: lista Contato com as 5 mensagens mais recentes (das 6)`);
  ok(await page.locator("section[aria-labelledby=h-parceiros] [data-slot=linha-de-lista]").count() === 2, `${L}: lista Parceiros com 2 candidaturas`);
  ok(await page.locator("section[aria-labelledby=h-lancamento] [data-slot=linha-de-lista]").count() === 2, `${L}: lista Lançamento com 2 cadastros`);
  ok((await page.locator("section[aria-labelledby=h-parceiros]").innerText()).includes("Saúde, Varejo +1"), `${L}: segmentos resumidos como hoje`);
  ok(await page.locator("section[aria-labelledby=h-contato] a[data-slot=linha-de-lista]").first().getAttribute("href") === "/admin/contatos/?id=c1", `${L}: mensagem abre a página de HTML de Contato`);
  ok(await page.evaluate(() => getComputedStyle(document.body).backgroundColor) === "rgb(237, 240, 245)", `${L}: fundo cinza do DS (--background)`);
  ok(await page.evaluate(() => [...document.querySelectorAll('[data-slot="card"]')].every((c) => getComputedStyle(c).boxShadow === "none")), `${L}: cards só com borda, sem sombra parada`);
  ok(await semRolagem(page), `${L}: Início sem rolagem horizontal`);
  ok(await page.evaluate(() => [...document.querySelectorAll('[data-slot="card"]')].every((c) => c.scrollWidth <= c.clientWidth + 1)), `${L}: nenhum card com rolagem horizontal`);
  await page.screenshot({ path: `${S}/admin-react-inicio-${L}.png`, fullPage: true });

  // Menu
  if (largura >= 768) {
    const nav = page.getByRole("navigation", { name: "Páginas da área restrita" });
    ok((await nav.getByRole("link").allInnerTexts()).map((t) => t.trim().split("\n")[0]).slice(0, 4).join("|").startsWith("Início|Contato|Reuniões"), `${L}: menu com os itens de hoje`);
    ok(await nav.getByRole("link", { name: "Início" }).getAttribute("aria-current") === "page", `${L}: Início marcado como página atual`);
    ok(await nav.getByRole("link", { name: /Contato/ }).getAttribute("href") === "/admin/contatos/", `${L}: Contato abre a página de HTML`);
    await nav.getByRole("button", { name: /Parceiros/ }).click();
    ok(await nav.getByRole("link", { name: "Comunicados" }).isVisible(), `${L}: grupo Parceiros abre os subitens`);
    await page.getByRole("button", { name: "Recolher menu" }).click();
    await espera(400);
    ok(await page.evaluate(() => localStorage.getItem("dm-admin-menu-recolhido")) === "1", `${L}: menu recolhido e guardado na mesma chave das páginas de HTML`);
    await page.screenshot({ path: `${S}/admin-react-inicio-${L}-recolhido.png` });
    await page.getByRole("button", { name: "Expandir menu" }).click();
    await espera(400);
  } else {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("dialog").waitFor();
    await espera(400);
    ok(await page.getByRole("link", { name: /Lançamento/ }).isVisible(), `${L}: menu abre em painel no celular`);
    await page.screenshot({ path: `${S}/admin-react-inicio-${L}-menu.png` });
    await page.keyboard.press("Escape");
    await espera(500);
    ok(!(await page.getByRole("dialog").isVisible().catch(() => false)), `${L}: Esc fecha o menu do celular`);
  }

  // Notificações
  await page.getByRole("button", { name: /^Notificações, \d+ não lidas$/ }).click();
  const painel = page.getByRole("dialog", { name: "Notificações" });
  await painel.waitFor();
  await espera(400);
  ok((await painel.innerText()).includes("Nova mensagem de Ana Ribeiro") && (await painel.innerText()).includes("Fernanda respondeu a pesquisa"), `${L}: notificações com mensagens e respostas de pesquisa`);
  await page.screenshot({ path: `${S}/admin-react-notificacoes-${L}.png` });
  await page.keyboard.press("Escape");
  await espera(400);
  ok(!(await painel.isVisible()), `${L}: Esc fecha as notificações`);

  // Perfil
  await page.getByRole("button", { name: "Perfil de Dani Moscatelli" }).click();
  ok(await page.getByRole("menuitem", { name: "Configurações" }).isVisible() && await page.getByRole("menuitem", { name: "Sair" }).isVisible(), `${L}: perfil com Configurações e Sair`);
  await page.keyboard.press("Escape");
  await espera(400); // o menu da conta fecha com animação; só depois o resto da página volta a ser lido

  await axe(page, `${L} Início`);
  ok(erros.length === 0, `${L}: sem erros no console${erros.length ? "\n   " + erros.join("\n   ") : ""}`);

  // A mesma sessão abre a Início de HTML (corte página a página sem novo login)
  const antiga = await ctx.newPage();
  await simularSupabase(antiga);
  const errosAntiga = [];
  antiga.on("pageerror", (e) => errosAntiga.push(e.message));
  await antiga.goto(BASE + "/admin/");
  await antiga.waitForSelector("#app:not(.hidden)", { timeout: 8000 });
  await antiga.waitForFunction(() => document.getElementById("tot-novas").textContent !== "-");
  await espera(500);
  ok(true, `${L}: a página de HTML abre já logada com a sessão do React`);
  await antiga.screenshot({ path: `${S}/admin-html-inicio-${L}.png`, fullPage: true });
  ok(errosAntiga.length === 0, `${L}: página de HTML sem erros${errosAntiga.length ? ": " + errosAntiga.join("; ") : ""}`);
  await ctx.close();
}

module.exports = { simularSupabase, BASE };
if (require.main === module) (async () => {
  const browser = await chromium.launch();
  await rodar(browser, 1280);
  await rodar(browser, 390);
  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO PASSOU");
  process.exit(falhas ? 1 : 0);
})();
