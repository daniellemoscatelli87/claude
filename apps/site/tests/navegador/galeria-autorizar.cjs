// Autorizar a galeria em React (lote S5b) contra a página de HTML de antes, com a função `galeria-autorizacao` simulada
// na rede (nada é enviado). Nas duas versões: "ver" ao abrir com o token do link, "ia" com as sugestões pendentes e o
// mesmo corpo de "decidir" ao enviar (especialidade, senioridade, LinkedIn com https:// e foto). Na versão em React:
// a foto escolhida e recortada sai em JPEG de 600 × 600, a autorização é exigida, a tela final aparece, e em 390, 768,
// 1024 e 1280 px não há rolagem horizontal, erros no console nem violações do axe; no celular, alvos de 44 px e a mesma
// borda esquerda. Capturas antes e depois.
//
// Uso, na raiz, depois de "npm run build" (e de guardar um dist com a página de HTML, como o build do main de antes):
//   node apps/site/tests/navegador/servidor.cjs dist 4320 &
//   node apps/site/tests/navegador/servidor.cjs /caminho/dist-antes 4321 &
//   PORTA=4320 PORTA_ANTES=4321 CAPTURAS=/pasta AXE=/caminho/axe.min.js node apps/site/tests/navegador/galeria-autorizar.cjs
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const path = require("path");
const S = process.env.CAPTURAS || require("os").tmpdir();
const CAMINHO = "/rede-parceiros/galeria/autorizar/?t=abc123";
const NOVA = "http://localhost:" + (process.env.PORTA || 4320) + CAMINHO;
const ANTIGA = "http://localhost:" + (process.env.PORTA_ANTES || 4321) + CAMINHO;
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
const FOTO = path.join(__dirname, "../../../../public/rede-parceiros/galeria/dani-positivo-v3.webp");
const VER = { nome: "Maria da Silva", cargo: "Service Designer", tempo: "Entre 6 e 10 anos.", tempos: ["Entre 3 e 5 anos.", "Entre 6 e 10 anos.", "Mais de 20 anos."], areas: ["UX Research", "Service Design"], segmentos: ["Saúde"], tags: [], ia_pendente: true, linkedin: "https://www.linkedin.com/in/maria", texto: "Termos de teste da galeria.", foto_url: "", status: "pendente" };
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };

async function abrir(b, url, largura, ver = VER) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const chamadas = [], erros = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) erros.push(m.text()); });
  await p.route(/fonts\.(googleapis|gstatic)\.com|googletagmanager|google-analytics/, (r) => r.abort());
  await p.route(/functions\/v1\/galeria-autorizacao$/, async (r) => {
    const c = JSON.parse(r.request().postData() || "{}"); chamadas.push(c);
    const json = c.acao === "ver" ? ver : c.acao === "ia" ? { cargo: "Designer de serviços", tags: ["Jornadas", "Pesquisa"] } : { ok: true };
    await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(json) });
  });
  await p.addInitScript(() => { try { localStorage.setItem("dm-cookies", "recusado"); } catch {} });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  return { ctx, p, chamadas, erros };
}

(async () => {
  const b = await chromium.launch();
  // 1) Mesmo envio nas duas versões (sem foto nova): mudar a senioridade e o LinkedIn, autorizar e enviar.
  {
    const a = await abrir(b, ANTIGA, 1280), n = await abrir(b, NOVA, 1280);
    await a.p.selectOption("#tempo", "Mais de 20 anos.");
    await n.p.locator("#tempo").click(); await n.p.getByRole("option", { name: /Mais de 20 anos/ }).click();
    for (const p of [a.p, n.p]) {
      await p.fill("#linkedin", "https://www.linkedin.com/in/maria-nova");
      await p.getByRole("button", { name: "Enviar perfil" }).click();
      await p.waitForTimeout(300);
    }
    ok(await n.p.getByText("Marque a autorização para enviar o seu perfil.").isVisible(), "sem a autorização: a mesma mensagem");
    await a.p.locator("#aceite").check({ force: true }); await n.p.locator("#aceite").click({ force: true });
    for (const p of [a.p, n.p]) { await p.getByRole("button", { name: "Enviar perfil" }).click(); await p.waitForTimeout(600); }
    const da = a.chamadas.find((c) => c.acao === "decidir"), dn = n.chamadas.find((c) => c.acao === "decidir");
    ok(JSON.stringify(n.chamadas.map((c) => c.acao)) === JSON.stringify(a.chamadas.map((c) => c.acao)), "as mesmas chamadas: " + n.chamadas.map((c) => c.acao).join(", "));
    ok(!!da && JSON.stringify(dn) === JSON.stringify(da), "o mesmo corpo de decidir " + JSON.stringify(dn));
    ok(await n.p.getByRole("heading", { name: "Perfil enviado com sucesso!" }).isVisible(), "tela final: Perfil enviado com sucesso!");
    await n.p.screenshot({ path: path.join(S, "galeria-depois-1280-enviado.png"), fullPage: true });
    ok(n.erros.length === 0, "sem erros no console " + n.erros.join(" / "));
    await a.ctx.close(); await n.ctx.close();
  }
  // 2) Foto: escolher, recortar e enviar em JPEG de 600 × 600.
  {
    const n = await abrir(b, NOVA, 390, { ...VER, status: "autorizado" });
    await n.p.locator('input[type="file"]').setInputFiles(FOTO);
    await n.p.waitForTimeout(500);
    await n.p.screenshot({ path: path.join(S, "galeria-depois-390-recorte.png"), fullPage: true });
    await n.p.getByRole("button", { name: "Usar esta foto" }).click();
    await n.p.waitForTimeout(300);
    await n.p.getByRole("button", { name: "Enviar perfil" }).click();
    await n.p.waitForTimeout(600);
    const d = n.chamadas.find((c) => c.acao === "decidir") || {};
    const lado = d.foto ? await n.p.evaluate((src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok([i.naturalWidth, i.naturalHeight]); i.src = src; }), d.foto) : [];
    ok(/^data:image\/jpeg;base64,/.test(d.foto || "") && lado[0] === 600 && lado[1] === 600 && d.remover_foto === false, "foto recortada: JPEG 600 × 600 no corpo de decidir " + JSON.stringify(lado));
    ok(n.erros.length === 0, "foto: sem erros no console " + n.erros.join(" / "));
    await n.ctx.close();
  }
  // 3) Cada largura: capturas antes e depois, layout, axe, 44 px e bordas.
  for (const w of [390, 768, 1024, 1280]) {
    const a = await abrir(b, ANTIGA, w), n = await abrir(b, NOVA, w);
    await a.p.screenshot({ path: path.join(S, `galeria-antes-${w}.png`), fullPage: true });
    await n.p.screenshot({ path: path.join(S, `galeria-depois-${w}.png`), fullPage: true });
    const m = await n.p.evaluate((w) => {
      const r = { rolagem: document.documentElement.scrollWidth > innerWidth, pequenos: [], bordas: [] };
      if (w === 390) {
        for (const el of document.querySelectorAll("main button, main input:not([type=hidden]):not([type=file]), main [role=combobox], main [role=checkbox]")) {
          const bx = el.getBoundingClientRect(); if (!bx.width || el.closest(".sr-only")) continue;
          if (bx.height < 43.5 && !el.closest("p, label")) r.pequenos.push((el.textContent || el.id).trim().slice(0, 30) + ":" + Math.round(bx.height));
        }
        r.bordas = [...document.querySelectorAll("main h1, main h2, #especialidade, [data-slot=input-com-afixo], #previa")].map((x) => Math.round(x.getBoundingClientRect().left));
      }
      return r;
    }, w);
    ok(!m.rolagem, `${w}px: sem rolagem horizontal`);
    if (w === 390) {
      ok(m.pequenos.length === 0, `390px: alvos de toque de 44 px ${m.pequenos.join(", ")}`);
      ok(new Set(m.bordas).size === 1, `390px: títulos, campos e prévia na mesma borda esquerda ${JSON.stringify(m.bordas)}`);
    }
    if (AXE) {
      await n.p.addScriptTag({ content: AXE });
      const v = await n.p.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] })).violations.map((x) => x.id + ":" + x.nodes.length));
      ok(v.length === 0, `${w}px: axe sem violações ${v.join(", ")}`);
    }
    ok(n.erros.length === 0, `${w}px: sem erros no console ${n.erros.join(" / ")}`);
    await a.ctx.close(); await n.ctx.close();
  }
  await b.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO PASSOU");
  process.exit(falhas ? 1 : 0);
})();
