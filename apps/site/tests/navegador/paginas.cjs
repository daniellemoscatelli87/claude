// Páginas pequenas do site em React (lote S7, D-053) contra as páginas de HTML de hoje, no navegador.
// Para cada página e largura (390, 768, 1024 e 1280 px): capturas antes (HTML) e depois (React), sem erros no
// console (inclusive de hidratação), sem rolagem horizontal, alvos de toque de 44 px no celular, bordas esquerdas
// alinhadas no celular e axe (WCAG A/AA, opcional). Comportamento: descadastro (link inválido, válido, sucesso e erro,
// com o Supabase simulado na rede), aviso de cookies e medição (Google simulado), WhatsApp e link da 404.
//
// Uso, na raiz do repositório, depois de "npm run build" (e de guardar um dist de antes, por exemplo o build do main,
// para as capturas "antes" das páginas já publicadas, que no dist novo já são React):
//   node apps/site/tests/navegador/servidor.cjs dist 4320 &
//   node apps/site/tests/navegador/servidor.cjs /caminho/dist-antes 4321 &
//   PORTA=4320 PORTA_ANTES=4321 CAPTURAS=/pasta/das/capturas AXE=/caminho/axe.min.js node apps/site/tests/navegador/paginas.cjs
// Lacunas conhecidas do DS publicado aparecem como AVISO (não falham): ver docs/engineering/SITE_REACT.md.
// Precisa do Playwright (require("playwright")); o axe-core é opcional (variável AXE).
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const path = require("path");
const S = process.env.CAPTURAS || require("os").tmpdir();
const BASE = "http://localhost:" + (process.env.PORTA || 4320);
const BASE_ANTES = "http://localhost:" + (process.env.PORTA_ANTES || process.env.PORTA || 4320);
const ROTAS = JSON.parse(fs.readFileSync(path.join(__dirname, "../../src/rotas.json"), "utf8"));
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
const LARGURAS = [390, 768, 1024, 1280];
const TOKEN = "123e4567-e89b-12d3-a456-426614174000";
const FUNCAO = "https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/descadastro-comunicados";
let falhas = 0;
let avisos = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };
const aviso = (m) => { console.log("AVISO  " + m); avisos++; };

const PAGINAS = [
  { id: "privacidade", antes: "/privacidade/", depois: "/site/previa/privacidade/", publicada: "/privacidade/" },
  { id: "descadastro", antes: `/comunicados/descadastro/?t=${TOKEN}`, depois: `/site/previa/comunicados/descadastro/?t=${TOKEN}`, publicada: `/comunicados/descadastro/?t=${TOKEN}` },
  { id: "404", antes: "/endereco-que-nao-existe/", depois: "/site/previa/404/", publicada: "/endereco-que-nao-existe/" },
];

/** Bloqueia o que não pode sair do teste: Google (medição) e o Supabase de verdade. Fontes do Google passam. */
async function rede(ctx, registro = []) {
  await ctx.route(/googletagmanager\.com|google-analytics\.com/, (r) => { registro.push(r.request().url()); return r.fulfill({ status: 200, contentType: "text/javascript", body: "" }); });
  await ctx.route(FUNCAO, (r) => r.fulfill({ status: 500, contentType: "application/json", body: "{}" }));
}

async function novaPagina(b, largura, { escolha = "recusado" } = {}) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 }, deviceScaleFactor: 1 });
  if (escolha) await ctx.addInitScript((v) => { try { localStorage.setItem("dm-cookies", v); } catch {} }, escolha);
  const registro = [];
  await rede(ctx, registro);
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push("pageerror: " + e.message.slice(0, 160)));
  p.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text())) erros.push("console: " + m.text().slice(0, 160)); });
  return { ctx, p, erros, registro };
}

/** Medidas de layout no navegador. */
const medir = (p) => p.evaluate(() => {
  const visivel = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  // alvos de toque: botões e links fora de texto corrido (links no meio de um parágrafo ficam de fora, WCAG 2.5.8)
  const alvos = [...document.querySelectorAll("a, button")].filter(visivel).filter((el) => !el.closest("p, li")).map((el) => {
    const r = el.getBoundingClientRect();
    return { texto: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40), altura: Math.round(r.height), largura: Math.round(r.width) };
  });
  return { rolagem: document.documentElement.scrollWidth - window.innerWidth, alvos };
});

/** Bordas esquerdas dos elementos de uma coluna de texto (devem ser iguais). */
const bordas = (p, seletores) => p.evaluate((sel) => sel.map((s) => {
  const el = document.querySelector(s);
  if (!el) return { s, x: null };
  const r = el.getBoundingClientRect();
  return { s, x: Math.round(r.left) };
}), seletores);

async function axe(p) {
  if (!AXE) return null;
  await p.addScriptTag({ content: AXE });
  return p.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
    return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
  });
}

(async () => {
  const b = await chromium.launch();
  fs.mkdirSync(S, { recursive: true });

  // 1) Capturas e conferências de layout em todas as larguras
  for (const pg of PAGINAS) {
    for (const largura of LARGURAS) {
      for (const lado of ["antes", "depois"]) {
        const { ctx, p, erros } = await novaPagina(b, largura);
        await p.goto((lado === "antes" ? BASE_ANTES : BASE) + pg[lado], { waitUntil: "networkidle" });
        await p.waitForTimeout(300);
        await p.screenshot({ path: path.join(S, `${pg.id}-${lado}-${largura}.png`), fullPage: true });
        if (lado === "depois") {
          const m = await medir(p);
          ok(erros.length === 0, `${pg.id} ${largura}px: sem erros no console${erros.length ? " -> " + erros.join(" / ") : ""}`);
          ok(m.rolagem <= 0, `${pg.id} ${largura}px: sem rolagem horizontal (${m.rolagem})`);
          if (largura === 390) {
            const pequenos = m.alvos.filter((a) => a.altura < 44 || a.largura < 24);
            const doRodape = await p.evaluate(() => [...document.querySelectorAll("[data-slot=rodape-site] a, [data-slot=rodape-site] button")].map((e) => (e.textContent || "").trim().slice(0, 40)));
            const nossos = pequenos.filter((a) => !doRodape.includes(a.texto));
            ok(nossos.length === 0, `${pg.id} 390px: alvos de toque com 44 px de altura${nossos.length ? " -> " + JSON.stringify(nossos) : ""}`);
            const rodape = pequenos.filter((a) => doRodape.includes(a.texto));
            if (rodape.length) aviso(`${pg.id} 390px: links do RodapeSite do DS com ${rodape[0].altura} px (WCAG 2.5.8 pede 24 px: passa; a regra da dona do produto pede 44 px no celular: lacuna do DS) -> ${rodape.map((a) => a.texto).join(", ")}`);
          }
        }
        await ctx.close();
      }
    }
  }

  // 2) Alinhamento no celular (390 px): a coluna de texto começa na mesma borda
  {
    const { ctx, p } = await novaPagina(b, 390);
    await p.goto(BASE + "/site/previa/privacidade/", { waitUntil: "networkidle" });
    const priv = await bordas(p, ["article [data-slot=selo]", "article h1", "article h1 + p", "[data-slot=prosa] > p", "[data-slot=prosa] h2", "[data-slot=prosa] ul"]);
    ok(new Set(priv.map((x) => x.x)).size === 1, "privacidade 390px: selo, título, data, textos e subtítulos na mesma borda " + JSON.stringify(priv));
    const cab = await bordas(p, ["header [data-slot=logo]", "article [data-slot=selo]"]);
    ok(cab[0].x === cab[1].x, "privacidade 390px: logo na mesma borda do texto " + JSON.stringify(cab));
    await p.goto(BASE + "/site/previa/comunicados/descadastro/?t=x", { waitUntil: "networkidle" });
    const desc = await bordas(p, ["main [data-slot=logo]", "main h1", "main h1 + p", "[data-slot=alert]", "[data-slot=botao-de-envio]"]);
    ok(new Set(desc.map((x) => x.x)).size === 1, "descadastro 390px: logo, título, texto, alerta e botão na mesma borda " + JSON.stringify(desc));
    await ctx.close();
  }

  // 3) axe (WCAG A/AA) nas páginas em React, a 1280 e 390 px
  if (AXE) {
    for (const largura of [1280, 390]) {
      for (const pg of PAGINAS) {
        const { ctx, p } = await novaPagina(b, largura);
        await p.goto(BASE + pg.depois, { waitUntil: "networkidle" });
        const v = await axe(p);
        ok(v.length === 0, `${pg.id} ${largura}px: axe sem violações WCAG A/AA${v.length ? " -> " + v.join(" ; ") : ""}`);
        await ctx.close();
      }
    }
  } else console.log("(axe não rodou: defina AXE=/caminho/axe.min.js)");

  // 4) Descadastro: link inválido, link válido, sucesso e erro
  {
    const { ctx, p, erros } = await novaPagina(b, 390);
    await p.goto(BASE + "/site/previa/comunicados/descadastro/?t=nada", { waitUntil: "networkidle" });
    ok(await p.locator("[data-slot=alert]").getByText("Este link não é válido.").isVisible(), "descadastro: link inválido mostra o aviso de erro");
    ok(await p.getByRole("button", { name: "Confirmar" }).isDisabled(), "descadastro: link inválido deixa o botão desligado");
    await p.screenshot({ path: path.join(S, "descadastro-depois-390-link-invalido.png"), fullPage: true });

    let corpo = null;
    await p.route(FUNCAO, async (r) => { corpo = r.request().postData(); await new Promise((x) => setTimeout(x, 400)); return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
    await p.goto(BASE + `/site/previa/comunicados/descadastro/?t=${TOKEN}`, { waitUntil: "networkidle" });
    ok(await p.getByRole("button", { name: "Confirmar" }).isEnabled(), "descadastro: link válido liga o botão");
    await p.getByRole("button", { name: "Confirmar" }).click();
    await p.waitForTimeout(100);
    ok(await p.getByRole("button", { name: "Confirmando…" }).isDisabled(), "descadastro: enquanto envia, o botão diz Confirmando… e fica desligado");
    await p.getByRole("heading", { name: "Pronto!" }).waitFor();
    ok(corpo === JSON.stringify({ t: TOKEN }), "descadastro: manda só o token, como a página de HTML " + corpo);
    ok(await p.evaluate(() => document.activeElement && document.activeElement.textContent === "Pronto!"), "descadastro: o foco vai para o Pronto!");
    ok(await p.getByRole("status").getByText("contato@danimoscatelli.com.br").isVisible(), "descadastro: mostra o e-mail de contato");
    await p.screenshot({ path: path.join(S, "descadastro-depois-390-pronto.png"), fullPage: true });

    await p.unroute(FUNCAO);
    await p.route(FUNCAO, (r) => r.fulfill({ status: 400, contentType: "application/json", body: '{"error":"Este link já foi usado."}' }));
    const errosAntes = erros.length;
    await p.goto(BASE + `/site/previa/comunicados/descadastro/?t=${TOKEN}`, { waitUntil: "networkidle" });
    await p.getByRole("button", { name: "Confirmar" }).click();
    await p.getByText("Este link já foi usado.").waitFor();
    ok(await p.getByRole("button", { name: "Confirmar" }).isEnabled(), "descadastro: erro do servidor aparece e o botão volta");
    await p.screenshot({ path: path.join(S, "descadastro-depois-390-erro.png"), fullPage: true });
    // o 400 simulado aparece no console como recurso que falhou: é o próprio teste
    const inesperados = erros.filter((e, i) => !(i >= errosAntes && /status of 400/.test(e)));
    ok(inesperados.length === 0, "descadastro: sem erros no console " + inesperados.join(" / "));
    await ctx.close();
  }

  // 5) Privacidade: aviso de cookies, medição, preferências e WhatsApp
  {
    const { ctx, p, erros, registro } = await novaPagina(b, 390, { escolha: null });
    await p.goto(BASE + "/site/previa/privacidade/", { waitUntil: "networkidle" });
    const aviso = p.getByRole("region", { name: "Aviso de cookies" });
    ok(await aviso.isVisible(), "privacidade: sem escolha, o aviso de cookies aparece");
    await p.screenshot({ path: path.join(S, "privacidade-depois-390-aviso.png") });
    await aviso.getByRole("button", { name: "Recusar" }).click();
    ok(!(await aviso.isVisible()) && registro.length === 0, "privacidade: recusar fecha o aviso e não carrega o Google");
    ok((await p.evaluate(() => localStorage.getItem("dm-cookies"))) === "recusado", "privacidade: a escolha fica guardada (dm-cookies)");
    await p.locator("article").getByRole("link", { name: "Preferências de cookies" }).click();
    ok(await aviso.isVisible(), "privacidade: o link no texto reabre o aviso");
    await aviso.getByRole("button", { name: "Aceitar" }).click();
    await p.waitForTimeout(200);
    ok(registro.some((u) => u.includes("gtag/js?id=G-FTVGXQRJQ6")), "privacidade: aceitar liga a medição (G-FTVGXQRJQ6)");
    await p.locator("footer").getByRole("button", { name: "Preferências de cookies" }).click();
    ok(await aviso.isVisible(), "privacidade: o botão do rodapé reabre o aviso");
    const zap = await p.locator("[data-slot=botao-whatsapp]").getAttribute("href");
    ok(zap === "https://wa.me/5541997485414?text=" + encodeURIComponent("Olá, Dani! Vim pelo site danimoscatelli.com.br e gostaria de conversar sobre um projeto."), "privacidade: WhatsApp com o mesmo número e mensagem");
    ok(erros.length === 0, "privacidade: sem erros no console " + erros.join(" / "));
    await ctx.close();
  }

  // 6) Páginas publicadas: o endereço de hoje já serve a página em React, igual à prévia
  for (const pg of PAGINAS.filter((x) => x.publicada)) {
    const id = pg.id === "404" ? "erro-404" : pg.id;
    const estado = ROTAS.react[id];
    const { ctx, p, erros } = await novaPagina(b, 390);
    const r = await p.goto(BASE + pg.publicada, { waitUntil: "networkidle" });
    const react = await p.evaluate(() => !!document.querySelector("#raiz [data-slot]"));
    // na 404, o próprio documento responde 404 e o navegador registra isso no console: é o esperado
    if (pg.id === "404") for (let i = erros.length - 1; i >= 0; i--) if (/status of 404/.test(erros[i])) erros.splice(i, 1);
    if (estado === "publicada") {
      ok(react && erros.length === 0, `${pg.id}: ${pg.publicada} serve a página em React${erros.length ? " -> " + erros.join(" / ") : ""}`);
      if (pg.id === "404") ok(r.status() === 404, "404: endereço que não existe continua respondendo 404");
      const robots = await p.evaluate(() => document.querySelector("meta[name=robots]")?.content);
      ok(robots !== "noindex, nofollow" || pg.id === "descadastro", `${pg.id}: a publicada não leva o noindex da prévia (${robots})`);
    } else ok(!react, `${pg.id}: em prévia, ${pg.publicada} continua sendo a página de HTML`);
    await ctx.close();
  }

  // 7) 404: o link leva ao início
  {
    const { ctx, p } = await novaPagina(b, 390);
    await p.goto(BASE + "/site/previa/404/", { waitUntil: "networkidle" });
    ok((await p.getByRole("link", { name: "Ir para a página inicial" }).getAttribute("href")) === "/", "404: Ir para a página inicial leva a /");
    await ctx.close();
  }

  await b.close();
  console.log((falhas ? `\n${falhas} conferência(s) falharam.` : "\nTodas as conferências passaram.") + (avisos ? ` ${avisos} aviso(s) de lacunas do DS.` : ""));
  process.exit(falhas ? 1 : 0);
})();
