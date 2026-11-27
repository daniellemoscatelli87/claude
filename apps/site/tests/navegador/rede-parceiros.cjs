// Rede de Parceiros em React (lote S4), no navegador, com o Google simulado na rede. 390, 768, 1024 e 1280 px: sem
// erros no console (inclusive de hidratação, com e sem "menos movimento"), sem rolagem horizontal, axe (WCAG A/AA),
// alvos de 44 px e uma borda esquerda a 390 px. Comportamento: o cadastro abre numa gaveta pelos links (com o
// formulário /rede-parceiros/cadastro/ dentro) e fecha no X e no Esc; simulação (etapas por clique e pelo teclado);
// dúvidas em acordeão; pílula "Quero ser parceiro" e botão subir.
//
// Uso, na raiz, depois de "npm run build":
//   node apps/site/tests/navegador/servidor.cjs dist 4320 &
//   PORTA=4320 CAMINHO=/site/previa/rede-parceiros/ AXE=/caminho/axe.min.js node apps/site/tests/navegador/rede-parceiros.cjs
// (BASE=https://www.danimoscatelli.com.br CAMINHO=/rede-parceiros/ confere a página no ar)
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const BASE = process.env.BASE || "http://localhost:" + (process.env.PORTA || 4320);
const CAMINHO = process.env.CAMINHO || "/site/previa/rede-parceiros/";
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };

async function abrir(b, largura, movimento = "reduce") {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: movimento });
  await ctx.addInitScript(() => { try { localStorage.setItem("dm-cookies", "recusado"); } catch {} });
  await ctx.route(/googletagmanager|google-analytics/, (r) => r.fulfill({ status: 200, body: "" }));
  await ctx.route(/supabase\.co/, (r) => r.fulfill({ status: 201, body: "" }));
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push("pageerror: " + e.message.slice(0, 200)));
  p.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(m.text())) erros.push("console: " + m.text().slice(0, 200)); });
  await p.goto(BASE + CAMINHO, { waitUntil: "networkidle" });
  return { ctx, p, erros };
}

(async () => {
  const b = await chromium.launch();
  for (const w of [390, 768, 1024, 1280]) {
    for (const mov of w === 1280 ? ["reduce", "no-preference"] : ["reduce"]) {
      const { ctx, p, erros } = await abrir(b, w, mov);
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
      ok(erros.length === 0, `${w}px (${mov}): sem erros no console${erros.length ? " -> " + erros.join(" / ") : ""}`);
      if (mov !== "reduce") { await ctx.close(); continue; }
      const rolagem = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(rolagem <= 0, `${w}px: sem rolagem horizontal (${rolagem})`);
      const linhas = await p.evaluate(() => {
        const l = {};
        for (const el of document.querySelectorAll("#quem ul[aria-label=Setores] > li")) { const r = el.getBoundingClientRect(); (l[Math.round(r.top)] ||= []).push(Math.round(r.height)); }
        return Object.values(l).filter((x) => new Set(x).size > 1);
      });
      ok(linhas.length === 0, `${w}px: setores lado a lado com a mesma altura ${JSON.stringify(linhas)}`);
      if (AXE && (w === 390 || w === 1280)) {
        await p.addScriptTag({ content: AXE });
        const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
        ok(v.length === 0, `${w}px: axe sem violações${v.length ? " -> " + v.join(" ; ") : ""}`);
      }
      if (w === 390) {
        const pequenos = await p.evaluate(() => [...document.querySelectorAll("main a, main button, header a, header button")]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest("p, .sr-only, [aria-hidden=true], [hidden]"); })
          .map((el) => ({ t: (el.textContent || el.getAttribute("aria-label") || el.querySelector("img")?.alt || "").trim().slice(0, 40), h: Math.round(el.getBoundingClientRect().height) }))
          .filter((x) => x.h < 44));
        ok(pequenos.length === 0, `390px: alvos de toque de 44 px${pequenos.length ? " -> " + JSON.stringify(pequenos) : ""}`);
        const bordas = await p.evaluate(() => ["#rp-titulo", "#rede ol", "#quem ul[aria-label=Setores]", "#match [data-slot=simulacao]", "#cadastro [data-orientation]"].map((s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().left) : null; }));
        ok(new Set(bordas).size === 1, "390px: título, pilares, setores, simulação e dúvidas na mesma borda esquerda " + JSON.stringify(bordas));
      }
      await ctx.close();
    }
  }

  // Cadastro em gaveta
  {
    const { ctx, p, erros } = await abrir(b, 1280);
    await p.locator("main").getByRole("link", { name: "Quero ser parceiro" }).first().click();
    const g = p.getByRole("dialog", { name: "Quero ser parceiro" });
    ok(await g.waitFor({ timeout: 3000 }).then(() => true, () => false), "cadastro: o link abre a gaveta");
    ok((await g.locator("iframe").getAttribute("src")) === "/rede-parceiros/cadastro/", "cadastro: a gaveta carrega o formulário /rede-parceiros/cadastro/");
    // com o foco na gaveta (dentro do formulário, o Esc é da página do cadastro, como antes)
    await g.getByRole("button", { name: "Fechar cadastro" }).focus();
    await p.keyboard.press("Escape");
    ok(await g.waitFor({ state: "hidden", timeout: 3000 }).then(() => true, () => false), "cadastro: Esc fecha");
    await p.locator("#match a[href=\"/rede-parceiros/cadastro/\"]").last().click();
    await g.waitFor();
    await g.getByRole("button", { name: "Fechar cadastro" }).click();
    ok(await g.waitFor({ state: "hidden", timeout: 3000 }).then(() => true, () => false), "cadastro: o X fecha");
    // Simulação: troca de etapa por clique e pelo teclado
    const aba = p.getByRole("tab", { name: /Convite e alinhamento/ });
    await aba.click();
    ok(await p.getByText("Ranking de compatibilidade").waitFor({ timeout: 3000 }).then(() => true, () => false), "simulação: a etapa Convite mostra a conversa e o ranking");
    await p.keyboard.press("ArrowDown");
    ok(await p.getByText("Colaborações em projetos").waitFor({ timeout: 3000 }).then(() => true, () => false), "simulação: a seta troca para a próxima etapa");
    // Dúvidas
    const q = p.getByRole("button", { name: /Como meus dados serão utilizados/ });
    await q.click();
    ok(await p.getByRole("link", { name: "Política de Privacidade", exact: true }).isVisible(), "dúvidas: a pergunta abre a resposta");
    await p.evaluate(() => window.scrollTo(0, 1800));
    await p.waitForTimeout(600);
    ok(await p.locator("[data-slot=pilula-de-acao]").first().isVisible(), "pílula Quero ser parceiro aparece depois do hero");
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(600);
    ok(await p.getByRole("button", { name: "Voltar ao topo da página" }).isVisible(), "botão subir no fim da página");
    ok(erros.length === 0, "interações: sem erros no console " + erros.join(" / "));
    await ctx.close();
  }
  await b.close();
  console.log(falhas ? `\n${falhas} conferência(s) falharam.` : "\nTodas as conferências passaram.");
  process.exit(falhas ? 1 : 0);
})();
