// Página inicial em React (lote S3), no navegador, com o Supabase e o Google simulados na rede. 390, 768, 1024 e
// 1280 px: sem erros no console (inclusive de hidratação), sem rolagem horizontal, axe (WCAG A/AA), alvos de toque de
// 44 px e bordas esquerdas alinhadas no celular. Comportamento: "Notificar lançamento" (vazio, inválido, envio com a
// mesma linha em notificacoes_lancamento, "Obrigado! Até breve!" e volta), carrossel de depoimentos, aviso "Tem um
// projeto?" (abre o WhatsApp e fecha no X), faixa de logos (pausar) e "Saiba mais".
//
// Uso, na raiz do repositório, depois de "npm run build":
//   node apps/site/tests/navegador/servidor.cjs dist 4320 &
//   PORTA=4320 CAMINHO=/site/previa/ AXE=/caminho/axe.min.js node apps/site/tests/navegador/inicio.cjs
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const BASE = process.env.BASE || "http://localhost:" + (process.env.PORTA || 4320);
const CAMINHO = process.env.CAMINHO || "/site/previa/";
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };

async function abrir(b, largura, { movimento = "reduce", resposta = 201, aviso = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: movimento });
  await ctx.addInitScript((a) => { try { localStorage.setItem("dm-cookies", "recusado"); if (!a) sessionStorage.setItem("cta-contato-fechado", "1"); } catch {} }, aviso);
  const gravados = [];
  await ctx.route(/googletagmanager|google-analytics/, (r) => r.fulfill({ status: 200, body: "" }));
  await ctx.route(/supabase\.co\/rest\/v1\//, (r) => { gravados.push({ url: r.request().url(), corpo: JSON.parse(r.request().postData() || "{}") }); return r.fulfill({ status: resposta, body: "" }); });
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push("pageerror: " + e.message.slice(0, 200)));
  p.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(m.text())) erros.push("console: " + m.text().slice(0, 200)); });
  await p.goto(BASE + CAMINHO, { waitUntil: "networkidle" });
  return { ctx, p, erros, gravados };
}

(async () => {
  const b = await chromium.launch();

  // 1) Larguras
  for (const w of [390, 768, 1024, 1280]) {
    const { ctx, p, erros } = await abrir(b, w);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    const rolagem = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(rolagem <= 0, `${w}px: sem rolagem horizontal (${rolagem})`);
    ok(erros.length === 0, `${w}px: sem erros no console${erros.length ? " -> " + erros.join(" / ") : ""}`);
    const cartoes = await p.evaluate(() => {
      // cards lado a lado com a mesma altura (depoimentos visíveis e artigos da grade)
      const alturas = (sel) => [...document.querySelectorAll(sel)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth; }).map((el) => Math.round(el.getBoundingClientRect().height));
      // artigos: só os da mesma linha precisam ter a mesma altura
      const linhas = {};
      for (const el of document.querySelectorAll("#artigos [data-slot=grade-de-cards] [data-slot=card-de-artigo]")) { const r = el.getBoundingClientRect(); (linhas[Math.round(r.top)] ||= []).push(Math.round(r.height)); }
      return { dep: alturas("[data-slot=card-de-depoimento]"), art: Object.values(linhas).filter((l) => new Set(l).size > 1) };
    });
    ok(new Set(cartoes.dep).size <= 1, `${w}px: depoimentos visíveis com a mesma altura ${JSON.stringify(cartoes.dep)}`);
    ok(cartoes.art.length === 0, `${w}px: artigos lado a lado com a mesma altura ${JSON.stringify(cartoes.art)}`);
    if (AXE && (w === 390 || w === 1280)) {
      await p.addScriptTag({ content: AXE });
      const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
      ok(v.length === 0, `${w}px: axe sem violações${v.length ? " -> " + v.join(" ; ") : ""}`);
    }
    if (w === 390) {
      const pequenos = await p.evaluate(() => [...document.querySelectorAll("main a, main button, header a, header button")]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest("p, .sr-only, [aria-hidden=true]"); })
        .map((el) => ({ t: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40), h: Math.round(el.getBoundingClientRect().height) }))
        .filter((x) => x.h < 44));
      ok(pequenos.length === 0, `390px: alvos de toque de 44 px${pequenos.length ? " -> " + JSON.stringify(pequenos) : ""}`);
      const bordas = await p.evaluate(() => ["#ih-titulo", "#notify-form", "#conteudo section:first-child ul", "[data-slot=card-de-depoimento]", "#depoimentos [data-slot=card][data-orientacao], #depoimentos [data-slot=card]", "#artigos [data-slot=card-de-artigo]"].map((s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().left) : null; }));
      ok(new Set(bordas).size === 1, "390px: título, formulário, redes, depoimentos, recomendações e artigos na mesma borda esquerda " + JSON.stringify(bordas));
    }
    await ctx.close();
  }

  // 2) Notificar lançamento
  {
    const { ctx, p, erros, gravados } = await abrir(b, 390);
    const botao = p.locator("#notify-form button[type=submit]");
    await botao.click();
    ok(await p.getByText("Informe um e-mail válido.").isVisible(), "aviso: enviar vazio mostra o erro de sempre");
    ok(await p.evaluate(() => document.activeElement && document.activeElement.id === "notify-email"), "aviso: o foco volta ao campo");
    await p.locator("#notify-email").fill("ana@empresa");
    await botao.click();
    ok(await p.getByText("Informe um e-mail válido.").isVisible() && gravados.length === 0, "aviso: e-mail inválido não grava");
    await p.locator("#notify-email").fill("ana@gm");
    ok(await p.getByRole("button", { name: "ana@gmail.com" }).isVisible(), "aviso: sugestão de domínio do e-mail");
    await p.locator("#notify-email").fill("ana@empresa.com.br");
    ok(!(await p.getByText("Informe um e-mail válido.").isVisible()), "aviso: o erro some ao digitar");
    await botao.click();
    await p.locator("#notify-form [data-estado=feito]").waitFor({ timeout: 3000 });
    ok((await botao.innerText()).includes("Obrigado! Até breve!"), "aviso: o botão mostra Obrigado! Até breve!");
    const linha = gravados.find((g) => g.url.endsWith("/notificacoes_lancamento"));
    ok(!!linha && JSON.stringify(linha.corpo) === '{"email":"ana@empresa.com.br"}', "aviso: grava só o e-mail em notificacoes_lancamento " + JSON.stringify(linha && linha.corpo));
    ok((await p.locator("#notify-email").inputValue()) === "" && await p.locator("#notify-email").isDisabled(), "aviso: campo limpo e travado durante o obrigado");
    await p.waitForTimeout(4600);
    ok((await p.locator("#notify-form [data-estado=parado]").count()) === 1 && !(await p.locator("#notify-email").isDisabled()), "aviso: volta ao estado inicial depois de 4 s");
    ok(erros.length === 0, "aviso: sem erros no console " + erros.join(" / "));
    await ctx.close();
  }
  {
    const { ctx, p } = await abrir(b, 1280, { resposta: 500 });
    await p.locator("#notify-email").fill("ana@empresa.com.br");
    await p.locator("#notify-form button[type=submit]").click();
    ok(await p.getByText("Não foi possível enviar. Tente novamente.").waitFor({ timeout: 3000 }).then(() => true, () => false), "aviso: falha do servidor mostra a mensagem de sempre");
    ok((await p.locator("#notify-email").inputValue()) === "ana@empresa.com.br", "aviso: o e-mail continua no campo depois da falha");
    await ctx.close();
  }

  // 3) Carrossel, aviso "Tem um projeto?", faixa de logos, "Saiba mais"
  {
    const { ctx, p, erros } = await abrir(b, 1280, { movimento: "no-preference", aviso: true });
    await p.getByRole("button", { name: "Próximos depoimentos" }).click();
    await p.waitForTimeout(600);
    ok(await p.getByText("2 de", { exact: false }).isVisible(), "depoimentos: o botão avança o carrossel");
    const aviso = p.getByRole("link", { name: "Tem um projeto? Conversar com a Dani no WhatsApp" });
    await aviso.waitFor({ timeout: 4000 });
    ok((await aviso.getAttribute("href")).startsWith("https://wa.me/5541997485414?text="), "aviso Tem um projeto?: leva ao WhatsApp");
    await p.getByRole("button", { name: "Fechar aviso" }).click();
    ok(await aviso.waitFor({ state: "hidden", timeout: 3000 }).then(() => true, () => false), "aviso Tem um projeto?: fecha no X");
    ok((await p.evaluate(() => sessionStorage.getItem("cta-contato-fechado"))) === "1", "aviso Tem um projeto?: não volta na mesma sessão");
    ok(await p.getByRole("button", { name: "Pausar a faixa de logos" }).isVisible(), "logos: correm e têm o botão Pausar");
    await p.getByRole("link", { name: "Saiba mais" }).click();
    await p.waitForTimeout(800);
    ok(await p.evaluate(() => Math.abs(document.getElementById("depoimentos").getBoundingClientRect().top) < 120), "Saiba mais: leva aos depoimentos");
    ok(erros.length === 0, "interações: sem erros no console " + erros.join(" / "));
    await ctx.close();
  }

  await b.close();
  console.log(falhas ? `\n${falhas} conferência(s) falharam.` : "\nTodas as conferências passaram.");
  process.exit(falhas ? 1 : 0);
})();
