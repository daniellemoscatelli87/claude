// Pesquisa "Moda em Curitiba" em React (lote S6) contra a página de HTML de antes, no navegador, com a função
// `pesquisa` simulada na rede (nada é enviado). A mesma participação é respondida nas duas versões e os corpos das
// chamadas status, verificar, parcial e enviar têm de ser iguais (fora o envio_id, gerado em cada aparelho), assim como
// o rascunho e as telas de 409 (já participou), 410 (fora do ar) e de encerramento. Na versão em React, em 390, 768,
// 1024 e 1280 px: sem erros no console, sem rolagem horizontal, axe sem violações WCAG A/AA, alvos de 44 px no
// celular e as bordas esquerdas alinhadas a 390 px; capturas antes e depois.
//
// Uso, na raiz, depois de "npm run build" (e de guardar um dist com a página de HTML, por exemplo o build do main):
//   node apps/site/tests/navegador/servidor.cjs dist 4320 &
//   node apps/site/tests/navegador/servidor.cjs /caminho/dist-antes 4321 &
//   PORTA=4320 PORTA_ANTES=4321 CAPTURAS=/pasta AXE=/caminho/axe.min.js node apps/site/tests/navegador/pesquisa-moda.cjs
// CAMINHO muda o endereço da versão em React (padrão: a prévia; depois de publicada, /pesquisa/moda-curitiba/).
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const path = require("path");
const Q = require("../../../../supabase/functions/pesquisa/questionario.json");
const S = process.env.CAPTURAS || require("os").tmpdir();
const NOVA = "http://localhost:" + (process.env.PORTA || 4320) + (process.env.CAMINHO || "/site/previa/pesquisa/moda-curitiba/");
const ANTIGA = "http://localhost:" + (process.env.PORTA_ANTES || 4321) + "/pesquisa/moda-curitiba/";
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
const API = /functions\/v1\/pesquisa$/;
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function abrir(b, url, largura, resp = {}) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const chamadas = [], erros = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) erros.push(m.text()); });
  await p.route(/fonts\.(googleapis|gstatic)\.com|googletagmanager|google-analytics/, (r) => r.abort());
  await p.route(API, async (r) => {
    const corpo = JSON.parse(r.request().postData() || "{}");
    chamadas.push(corpo);
    const c = resp[corpo.acao] || { status: 200, json: corpo.acao === "status" ? { ativa: true } : corpo.acao === "verificar" ? { ja_respondeu: false } : { ok: true } };
    await r.fulfill({ status: c.status, contentType: "application/json", body: JSON.stringify(c.json) });
  });
  await p.addInitScript(() => { try { localStorage.setItem("dm-cookies", "recusado"); } catch {} });
  await p.goto(url, { waitUntil: "networkidle" });
  return { ctx, p, chamadas, erros };
}

const continuar = async (p) => { await p.locator('button[type="submit"]').last().click(); await p.waitForTimeout(250); };

/** Responde a pesquisa toda pela tela, igual nas duas versões (as diferenças de tela ficam em `nova`). */
async function responder(p, nova, { fim = "tudo" } = {}) {
  await p.getByRole("button", { name: /Começar pesquisa/ }).click();
  await p.waitForTimeout(200);
  await p.fill("#pq-nome", "Maria Teste");
  await p.fill("#pq-whats", "41997485414");
  await p.fill("#pq-email", "maria@exemplo.com");
  await p.locator("#pq-ciente").click({ force: true });
  await continuar(p);
  for (const q of Q.perguntas) {
    if (q.condicao) continue;
    const etapa = nova ? p.locator(`[data-etapa] legend`).first() : p.locator(`#pq-${q.id} legend`).first();
    await etapa.waitFor();
    if (q.id === "q1") {
      if (fim === "q1") { await p.getByRole("radio", { name: q.opcoes.find((o) => o.encerra).texto, exact: true }).check({ force: true }); await continuar(p); await p.waitForTimeout(500); return; }
      await p.getByRole("radio", { name: q.opcoes[0].texto, exact: true }).check({ force: true });
      await p.locator("#pq-perfil-bairro-bt").click();
      if (nova) await p.getByRole("option", { name: "Batel" }).click();
      else await p.locator(".pq-busca-op", { hasText: /^Batel$/ }).click();
      await p.waitForTimeout(200);
    } else if (q.tipo === "unica") {
      await p.getByRole("radio", { name: q.opcoes[0].texto, exact: true }).check({ force: true });
    } else if (q.tipo === "ranking") {
      for (const o of q.opcoes.filter((x) => !x.exclusiva).slice(0, 2)) await p.getByRole("checkbox", { name: new RegExp("^" + esc(o.texto)) }).first().click({ force: true });
    } else if (q.tipo === "multipla") {
      const o = q.opcoes.find((x) => !x.exclusiva && !x.outro);
      await p.getByRole("checkbox", { name: o.texto, exact: true }).click({ force: true });
    } else if (q.tipo === "escalas") {
      for (const [k, l] of q.linhas.entries()) await p.locator(`[data-linha="${l.id}"]`).getByRole("radio", { name: String(7 + k), exact: true }).click({ force: true });
    } else if (q.tipo === "matriz") {
      for (const l of q.linhas) await p.locator(`[data-linha="${l.id}"]`).getByRole("radio", { name: q.colunas[0].texto, exact: true }).click({ force: true });
    }
    await continuar(p);
  }
  await p.fill("#pq-relato-txt", "Não achei meu tamanho.");
  await continuar(p);
  for (const c of Q.perfil.filter((x) => !x.inicio)) await p.locator(`#pq-perfil-${c.id}`).getByRole("radio", { name: c.opcoes[1].texto, exact: true }).click({ force: true });
  await continuar(p);
  await p.getByRole("radio", { name: /Sim, quero receber os avisos/ }).click({ force: true });
  await continuar(p);
  await p.waitForTimeout(500);
}

const normal = (cs) => cs.map((c) => ({ ...c, envio_id: c.envio_id ? "ID" : undefined }));

(async () => {
  const b = await chromium.launch();
  // 1) Participação completa: as mesmas chamadas, na mesma ordem, com os mesmos corpos.
  {
    const a = await abrir(b, ANTIGA, 1280), n = await abrir(b, NOVA, 1280);
    await responder(a.p, false); await responder(n.p, true);
    const ca = normal(a.chamadas), cn = normal(n.chamadas);
    ok(JSON.stringify(cn.map((c) => c.acao)) === JSON.stringify(ca.map((c) => c.acao)), `mesmas chamadas, na mesma ordem: ${cn.map((c) => c.acao).join(", ")}`);
    let iguais = ca.length === cn.length;
    ca.forEach((c, i) => { if (JSON.stringify(c) !== JSON.stringify(cn[i])) { iguais = false; console.log("  diferente:", JSON.stringify(c).slice(0, 400), "\n  React:    ", JSON.stringify(cn[i]).slice(0, 400)); } });
    ok(iguais, "corpos de status, verificar, parcial e enviar iguais aos da página de HTML (campo isca site incluído)");
    ok(new Set(n.chamadas.filter((c) => c.envio_id).map((c) => c.envio_id)).size === 1, "o mesmo envio_id no progresso e no envio");
    ok(await n.p.getByRole("heading", { name: /Pesquisa enviada com sucesso/ }).isVisible(), "tela final: Pesquisa enviada com sucesso");
    ok((await n.p.evaluate(() => localStorage.getItem("pq-moda-rascunho-v5"))) === null && (await a.p.evaluate(() => localStorage.getItem("pq-moda-rascunho-v5"))) === null, "rascunho apagado depois do envio (nas duas)");
    ok(JSON.stringify(await n.p.evaluate(() => Object.keys(JSON.parse(sessionStorage.getItem("pq-moda-concluida"))))) === JSON.stringify(await a.p.evaluate(() => Object.keys(JSON.parse(sessionStorage.getItem("pq-moda-concluida"))))), "fim guardado na mesma chave e no mesmo formato");
    await n.p.screenshot({ path: path.join(S, "pesquisa-depois-1280-enviada.png"), fullPage: true });
    ok(n.erros.length === 0, "sem erros no console " + n.erros.join(" / "));
    await a.ctx.close(); await n.ctx.close();
  }
  // 2) Rascunho igual no meio da pesquisa e recuperado ao voltar.
  {
    const a = await abrir(b, ANTIGA, 1280), n = await abrir(b, NOVA, 1280);
    for (const [p] of [[a.p], [n.p]]) {
      await p.getByRole("button", { name: /Começar pesquisa/ }).click();
      await p.fill("#pq-nome", "Maria Teste"); await p.fill("#pq-whats", "41997485414"); await p.locator("#pq-ciente").click({ force: true });
      await continuar(p);
      await p.getByRole("radio", { name: Q.perguntas[0].opcoes[1].texto, exact: true }).check({ force: true });
      await p.waitForTimeout(200);
    }
    const ra = JSON.parse(await a.p.evaluate(() => localStorage.getItem("pq-moda-rascunho-v5")));
    const rn = JSON.parse(await n.p.evaluate(() => localStorage.getItem("pq-moda-rascunho-v5")));
    const sem = (r) => ({ ...r, envio: "ID", salvoEm: 0 });
    ok(JSON.stringify(sem(rn)) === JSON.stringify(sem(ra)), "rascunho no mesmo formato " + JSON.stringify(sem(rn)));
    ok((await n.p.evaluate(() => sessionStorage.getItem("pq-moda-rascunho-v5-contato"))) === (await a.p.evaluate(() => sessionStorage.getItem("pq-moda-rascunho-v5-contato"))), "contato só na sessão, no mesmo formato");
    await n.p.reload({ waitUntil: "networkidle" });
    ok(await n.p.getByRole("radio", { name: Q.perguntas[0].opcoes[1].texto, exact: true }).isChecked(), "rascunho recuperado ao voltar");
    await a.ctx.close(); await n.ctx.close();
  }
  // 3) Encerra na pergunta 1, 409 no envio e 410 (fora do ar).
  for (const [nome, resp, fim, titulo] of [
    ["encerra na 1", {}, "q1", /Obrigada pelo seu interesse/],
    ["409 já participou", { enviar: { status: 409, json: { ja_respondeu: true } } }, "tudo", /já participou/],
  ]) {
    const a = await abrir(b, ANTIGA, 1280, resp), n = await abrir(b, NOVA, 1280, resp);
    await responder(a.p, false, { fim }); await responder(n.p, true, { fim });
    const ea = normal(a.chamadas).filter((c) => c.acao === "enviar"), en = normal(n.chamadas).filter((c) => c.acao === "enviar");
    ok(ea.length === 1 && JSON.stringify(ea) === JSON.stringify(en), `${nome}: o mesmo corpo de enviar`);
    ok(await n.p.getByRole("heading", { name: titulo }).first().isVisible(), `${nome}: tela final`);
    await n.p.screenshot({ path: path.join(S, `pesquisa-depois-1280-${fim === "q1" ? "encerrada" : "ja"}.png`), fullPage: true });
    await a.ctx.close(); await n.ctx.close();
  }
  {
    const n = await abrir(b, NOVA, 1280, { status: { status: 200, json: { ativa: false } } });
    await n.p.waitForTimeout(300);
    ok(await n.p.getByRole("heading", { name: /não está recebendo respostas/ }).isVisible(), "410/status inativo: tela de fora do ar");
    await n.ctx.close();
  }
  // 4) Mensagens de erro iguais às de antes.
  {
    const n = await abrir(b, NOVA, 390);
    await n.p.getByRole("button", { name: /Começar pesquisa/ }).click();
    await continuar(n.p);
    for (const m of ["Informe como podemos chamar você.", "Informe o seu WhatsApp com DDD.", "Para participar, marque que você leu e concorda.", "Preencha os campos em vermelho para prosseguir."])
      ok(await n.p.getByText(m, { exact: true }).first().isVisible(), `identificação vazia: "${m}"`);
    await n.p.screenshot({ path: path.join(S, "pesquisa-depois-390-erros.png"), fullPage: true });
    await n.ctx.close();
  }
  // 5) Cada largura: layout, axe, 44 px, bordas; capturas antes e depois das perguntas 2 (classificação) e 4 (notas).
  for (const w of [390, 768, 1024, 1280]) {
    const n = await abrir(b, NOVA, w), a = await abrir(b, ANTIGA, w);
    for (const [p, quem] of [[a.p, "antes"], [n.p, "depois"]]) await p.screenshot({ path: path.join(S, `pesquisa-${quem}-${w}-intro.png`), fullPage: true });
    // chega à pergunta 2 e à 4 pelo rascunho (sem enviar nada)
    for (const [etapa, nome] of [[2, "q2-classificacao"], [5, "q4-notas"]]) {
      for (const [p, quem, url] of [[a.p, "antes", ANTIGA], [n.p, "depois", NOVA]]) {
        await p.evaluate((e) => {
          localStorage.setItem("pq-moda-rascunho-v5", JSON.stringify({ envio: "x", etapa: e, r: { q1: "sim", perfil: { cidade: "curitiba", bairro: "batel" }, q2: ["fisicas_cwb", "online_cwb"] }, relato: "", nov: "", salvoEm: Date.now() }));
          sessionStorage.setItem("pq-moda-rascunho-v5-contato", JSON.stringify({ nome: "Maria", email: "", whats: "(41) 99748-5414", ciente: true }));
        }, etapa);
        await p.goto(url, { waitUntil: "networkidle" });
        await p.waitForTimeout(300);
        await p.screenshot({ path: path.join(S, `pesquisa-${quem}-${w}-${nome}.png`), fullPage: true });
      }
      const m = await n.p.evaluate((w) => {
        const r = { rolagem: document.documentElement.scrollWidth > innerWidth, pequenos: [], bordas: [] };
        if (w === 390) {
          for (const el of document.querySelectorAll("main a, main button, main input:not([type=hidden]):not(.sr-only), main [role=radio], main [role=checkbox]")) {
            const b = el.getBoundingClientRect();
            if (!b.width || el.closest(".sr-only, [aria-hidden=true]") || getComputedStyle(el).visibility === "hidden") continue;
            const alvo = el.closest("label") || el;
            const bb = alvo.getBoundingClientRect();
            if (Math.max(b.height, bb.height) < 43.5 && !el.closest("p, li[class*=prose]")) r.pequenos.push((el.textContent || el.getAttribute("aria-label") || el.id).trim().slice(0, 30) + ":" + Math.round(b.height));
          }
          const leg = document.querySelector("[data-etapa] legend")?.getBoundingClientRect().left;
          const barra = document.querySelector('[data-slot="barra-da-etapa"]')?.getBoundingClientRect().left;
          const prog = document.querySelector('[data-slot="progress"]')?.getBoundingClientRect().left;
          r.bordas = [leg, prog].map((x) => Math.round(x ?? -1)); r.barra = Math.round(barra ?? -1);
        }
        return r;
      }, w);
      ok(!m.rolagem, `${w}px ${nome}: sem rolagem horizontal`);
      if (w === 390) {
        ok(m.pequenos.length === 0, `390px ${nome}: alvos de toque de 44 px ${m.pequenos.join(", ")}`);
        ok(new Set(m.bordas).size === 1, `390px ${nome}: progresso e pergunta na mesma borda esquerda ${JSON.stringify(m.bordas)}`);
      }
      if (AXE) {
        await n.p.addScriptTag({ content: AXE });
        const v = await n.p.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] })).violations.map((x) => x.id + ":" + x.nodes.length));
        ok(v.length === 0, `${w}px ${nome}: axe sem violações ${v.join(", ")}`);
      }
    }
    ok(n.erros.length === 0, `${w}px: sem erros no console ${n.erros.join(" / ")}`);
    await n.ctx.close(); await a.ctx.close();
  }
  await b.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO PASSOU");
  process.exit(falhas ? 1 : 0);
})();
