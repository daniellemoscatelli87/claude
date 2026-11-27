// Programa Projeto Piloto em React (lote S2) e a casca do site (lote S1), no navegador, com o Supabase e o Google
// simulados na rede. 390, 768, 1024 e 1280 px: sem erros no console (inclusive de hidratação), sem rolagem horizontal,
// axe (WCAG A/AA) e alvos de toque. Comportamento: menu do celular, gaveta de contato (validação e envio), gaveta do
// cadastro (abre pelos botões, por link #inscricao e pelo endereço; validação, envio e sucesso), guia em acordeão,
// pílula de ação e botão subir.
//
// Uso, na raiz do repositório, depois de "npm run build":
//   node apps/site/tests/navegador/servidor.cjs dist 4320 &
//   PORTA=4320 CAMINHO=/site/previa/projeto-piloto/ CAPTURAS=/pasta AXE=/caminho/axe.min.js node apps/site/tests/navegador/projeto-piloto.cjs
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const path = require("path");
const S = process.env.CAPTURAS || require("os").tmpdir();
const BASE = "http://localhost:" + (process.env.PORTA || 4320);
const CAMINHO = process.env.CAMINHO || "/site/previa/projeto-piloto/";
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };

async function abrir(b, largura, { movimento = "reduce" } = {}) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: movimento });
  await ctx.addInitScript(() => { try { localStorage.setItem("dm-cookies", "recusado"); } catch {} });
  const gravados = [];
  await ctx.route(/googletagmanager|google-analytics/, (r) => r.fulfill({ status: 200, body: "" }));
  await ctx.route(/supabase\.co\/rest\/v1\/(contatos|parceiro_piloto)/, (r) => { gravados.push({ url: r.request().url(), corpo: JSON.parse(r.request().postData() || "{}") }); return r.fulfill({ status: 201, body: "" }); });
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push("pageerror: " + e.message.slice(0, 200)));
  p.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text())) erros.push("console: " + m.text().slice(0, 200)); });
  await p.goto(BASE + CAMINHO, { waitUntil: "networkidle" });
  return { ctx, p, erros, gravados };
}

(async () => {
  const b = await chromium.launch();

  // 1) Larguras: erros, rolagem horizontal, axe, alvos de toque
  for (const w of [390, 768, 1024, 1280]) {
    const { ctx, p, erros } = await abrir(b, w);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    const rolagem = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(rolagem <= 0, `${w}px: sem rolagem horizontal (${rolagem})`);
    ok(erros.length === 0, `${w}px: sem erros no console${erros.length ? " -> " + erros.join(" / ") : ""}`);
    if (AXE && (w === 390 || w === 1280)) {
      await p.addScriptTag({ content: AXE });
      const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
      ok(v.length === 0, `${w}px: axe sem violações${v.length ? " -> " + v.join(" ; ") : ""}`);
    }
    if (w === 390) {
      const pequenos = await p.evaluate(() => [...document.querySelectorAll("main a, main button, header a, header button, footer a, footer button")]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest("p, li, .sr-only"); })
        .map((el) => ({ t: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40), h: Math.round(el.getBoundingClientRect().height) }))
        .filter((x) => x.h < 44));
      ok(pequenos.length === 0, `390px: alvos de toque de 44 px${pequenos.length ? " -> " + JSON.stringify(pequenos) : ""}`);
      // alinhamento: título, texto e pilares do "sobre" e cards dos dois lados na mesma coluna
      const bordas = await p.evaluate(() => ["#sobre-o-programa [data-slot=card]", "#sobre-o-programa ol", "#guia [data-orientation]", "#inscricao [data-slot]"].map((s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().left) : null; }));
      ok(new Set(bordas).size === 1, "390px: cards, pilares, guia e convite na mesma borda esquerda " + JSON.stringify(bordas));
    }
    await ctx.close();
  }

  // 2) Celular: menu em folha inferior e Contato pelo menu
  {
    const { ctx, p, erros, gravados } = await abrir(b, 390);
    await p.getByRole("button", { name: "Abrir menu" }).click();
    const menu = p.getByRole("dialog", { name: "Menu" });
    await menu.waitFor();
    ok(await menu.getByRole("link", { name: "Projeto Piloto" }).getAttribute("aria-current") === "page", "menu do celular: Projeto Piloto marcado como página atual");
    await p.keyboard.press("Escape");
    ok(await menu.waitFor({ state: "hidden", timeout: 3000 }).then(() => true, () => false), "menu do celular: Esc fecha");
    // Contato (gaveta) pelo botão do menu
    await p.getByRole("button", { name: "Abrir menu" }).click();
    await p.getByRole("dialog", { name: "Menu" }).getByRole("button", { name: "Contato" }).click();
    const gaveta = p.getByRole("dialog", { name: "Inicie uma conversa" });
    await gaveta.waitFor();
    ok(true, "contato: a gaveta abre pelo menu do celular");
    await p.screenshot({ path: path.join(S, "contato-390-aberto.png") });
    await gaveta.getByRole("button", { name: /Solicitar reunião/ }).click();
    ok(await gaveta.getByText("Preencha os campos obrigatórios (*) e confira o e-mail e o telefone.").isVisible(), "contato: enviar vazio mostra a mensagem de sempre");
    const invalidos = await gaveta.locator('[aria-invalid="true"]').count();
    ok(invalidos >= 6, `contato: campos marcados com erro (${invalidos})`);
    await p.screenshot({ path: path.join(S, "contato-390-erros.png"), fullPage: false });
    await gaveta.getByLabel("Nome completo").fill("Ana Teste");
    await gaveta.getByLabel("E-mail corporativo").fill("ana@gm");
    ok(await gaveta.getByRole("button", { name: "ana@gmail.com" }).isVisible(), "contato: sugestão de domínio do e-mail");
    await gaveta.getByRole("button", { name: "ana@gmail.com" }).click();
    await gaveta.getByLabel("Telefone / WhatsApp").fill("41999998888");
    ok((await gaveta.getByLabel("Telefone / WhatsApp").inputValue()) === "(41) 99999-8888", "contato: máscara do telefone");
    await gaveta.getByLabel("Nome da Empresa").fill("Empresa X");
    await gaveta.getByLabel("Cargo / Função").fill("Gerente");
    await gaveta.getByText("Um Negócio Físico", { exact: true }).click();
    await gaveta.getByRole("combobox", { name: "Assunto" }).click();
    await p.getByRole("option", { name: "Parceria ou colaboração" }).click();
    await gaveta.getByLabel("Conte um pouco sobre seu desafio").fill("Melhorar o atendimento.");
    await gaveta.getByLabel("Seg").check();
    await gaveta.getByLabel("Qua").check();
    await gaveta.getByRole("combobox", { name: "Período (preferência)" }).click();
    await p.getByRole("option", { name: "Tarde" }).click();
    await gaveta.getByRole("button", { name: /Solicitar reunião/ }).click();
    await p.getByRole("heading", { name: "Mensagem enviada com sucesso!" }).last().waitFor();
    const linha = gravados.find((g) => g.url.includes("/contatos"));
    ok(!!linha && linha.corpo.email === "ana@gmail.com" && linha.corpo.tipo_negocio === "Um Negócio Físico" && JSON.stringify(linha.corpo.dias_preferidos) === '["Seg","Qua"]' && linha.corpo.periodo === "Tarde" && linha.corpo.tipo_negocio_outro === null, "contato: grava as mesmas colunas em contatos " + JSON.stringify(linha && linha.corpo));
    ok((await p.evaluate(() => localStorage.getItem("dm-contato-rascunho"))) === null, "contato: o rascunho some depois do envio");
    await p.screenshot({ path: path.join(S, "contato-390-enviado.png") });
    ok(erros.length === 0, "celular: sem erros no console " + erros.join(" / "));
    await ctx.close();
  }

  // 3) Rascunho do contato volta ao reabrir a página
  {
    const { ctx, p } = await abrir(b, 1280);
    await p.getByRole("button", { name: "Contato" }).first().click();
    const g = p.getByRole("dialog", { name: "Inicie uma conversa" });
    await g.getByLabel("Nome completo").fill("Rascunho Guardado");
    await p.reload({ waitUntil: "networkidle" });
    await p.getByRole("button", { name: "Contato" }).first().click();
    ok((await p.getByRole("dialog", { name: "Inicie uma conversa" }).getByLabel("Nome completo").inputValue()) === "Rascunho Guardado", "contato: rascunho guardado neste navegador");
    await ctx.close();
  }

  // 4) Cadastro do Projeto Piloto
  {
    const { ctx, p, erros, gravados } = await abrir(b, 1280);
    await p.locator("#sobre-o-programa").getByRole("link", { name: "Cadastrar empresa" }).click();
    const g = p.getByRole("dialog", { name: "Cadastre sua empresa" });
    await g.waitFor();
    ok(true, "cadastro: abre pelo botão Cadastrar empresa");
    await g.getByRole("button", { name: /Enviar cadastro/ }).click();
    ok(await g.getByText("Corrija os 7 campos destacados para continuar.").isVisible(), "cadastro: enviar vazio mostra quantos campos corrigir");
    ok(await g.getByText("Para continuar, aceite a Política de Privacidade.").isVisible(), "cadastro: erro do consentimento");
    await p.screenshot({ path: path.join(S, "cadastro-1280-erros.png") });
    await g.getByLabel("Nome do responsável").fill("Ana");
    await g.getByLabel("E-mail corporativo").fill("ana@empresa.com.br");
    await g.getByLabel("WhatsApp / Telefone").fill("41999998888");
    await g.getByLabel("Nome da empresa / negócio").fill("Clínica X");
    await g.getByRole("combobox", { name: "Segmento de atuação" }).click();
    await p.getByRole("option", { name: "Saúde e bem-estar" }).click();
    await g.getByLabel("Cidade / Estado").fill("Curitiba / PR");
    await g.getByRole("checkbox").check();
    await g.getByRole("button", { name: /Enviar cadastro/ }).click();
    await g.getByText("Cadastro recebido").waitFor();
    const linha = gravados.find((x) => x.url.includes("/parceiro_piloto"));
    ok(!!linha && linha.corpo.segmento === "Saúde e bem-estar" && linha.corpo.cidade_estado === "Curitiba / PR" && linha.corpo.consentimento === true && /^[0-9a-f-]{36}$/.test(linha.corpo.envio_id), "cadastro: grava as mesmas colunas em parceiro_piloto " + JSON.stringify(linha && linha.corpo));
    await p.screenshot({ path: path.join(S, "cadastro-1280-recebido.png") });
    await p.keyboard.press("Escape");
    // pelo link "Cadastrar minha empresa" do convite e pelo endereço
    await p.locator("#inscricao").getByRole("button", { name: "Cadastrar minha empresa" }).click();
    ok(await p.getByRole("dialog", { name: "Cadastre sua empresa" }).isVisible(), "cadastro: abre pelo convite");
    await p.keyboard.press("Escape");
    const p2 = await ctx.newPage();
    await p2.goto(BASE + CAMINHO + "#inscricao", { waitUntil: "networkidle" });
    ok(await p2.getByRole("dialog", { name: "Cadastre sua empresa" }).waitFor({ timeout: 3000 }).then(() => true, () => false), "cadastro: o endereço com #inscricao abre a gaveta");
    ok(erros.length === 0, "cadastro: sem erros no console " + erros.join(" / "));
    await ctx.close();
  }

  // 5) Guia em acordeão, pílula de ação e botão subir
  {
    const { ctx, p } = await abrir(b, 390);
    const q = p.getByRole("button", { name: /Existe algum custo para participar/ });
    await q.scrollIntoViewIfNeeded();
    await q.click();
    ok(await p.getByText("pelo trabalho previsto no escopo do piloto.").isVisible(), "guia: a pergunta abre a resposta");
    await q.click();
    ok(await p.getByText("pelo trabalho previsto no escopo do piloto.").waitFor({ state: "hidden", timeout: 3000 }).then(() => true, () => false), "guia: fecha de novo");
    await p.evaluate(() => window.scrollTo(0, 1600));
    await p.waitForTimeout(500);
    const pilula = p.locator("[data-slot=pilula-de-acao]");
    ok(await pilula.count() > 0 && await pilula.first().isVisible(), "pílula Cadastrar empresa aparece depois do hero");
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(600);
    const subir = p.getByRole("button", { name: "Voltar ao topo da página" });
    ok(await subir.isVisible(), "botão subir aparece no fim da página");
    await ctx.close();
  }

  await b.close();
  console.log(falhas ? `\n${falhas} conferência(s) falharam.` : "\nTodas as conferências passaram.");
  process.exit(falhas ? 1 : 0);
})();
