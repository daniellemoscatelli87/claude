// Cadastro na Rede de Parceiros em React (lote S5), no navegador, com o Supabase simulado na rede (nenhum cadastro
// real é enviado). 390, 768, 1024 e 1280 px: sem erros no console, sem rolagem horizontal, axe (WCAG A/AA), alvos de
// 44 px e uma borda esquerda a 390 px, cartões lado a lado com a mesma altura. Comportamento: erros por pergunta e
// resumo, foco na primeira com erro, e-mail já cadastrado (email_ja_cadastrado), cidades de /data/municipios, "Outro",
// pergunta que depende de outra, fim "PJ", rascunho (recuperar e começar do zero), envio (sucesso com o primeiro nome
// e o evento, 409, falha) e, dentro da gaveta da Rede de Parceiros, o Esc fechando pelo aviso "dm-fechar-cadastro".
//
// Uso, na raiz, depois de "npm run build":
//   node apps/site/tests/navegador/servidor.cjs dist 4320 &
//   PORTA=4320 CAMINHO=/site/previa/rede-parceiros/cadastro/ AXE=/caminho/axe.min.js node apps/site/tests/navegador/rede-parceiros-cadastro.cjs
// (BASE=https://www.danimoscatelli.com.br CAMINHO=/rede-parceiros/cadastro/ SO_LEITURA=1 confere a página no ar sem enviar nada)
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const BASE = process.env.BASE || "http://localhost:" + (process.env.PORTA || 4320);
const CAMINHO = process.env.CAMINHO || "/site/previa/rede-parceiros/cadastro/";
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };
const AUT_DADOS = "Autorizo o armazenamento e o uso dos meus dados profissionais pela rede de parceiros (obrigatório).";

async function abrir(b, largura, { rascunho, emailExiste = false, envio = 201 } = {}) {
  const ctx = await b.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript(([r]) => {
    try { localStorage.setItem("dm-cookies", "recusado"); if (r && !sessionStorage.getItem("rascunho-posto")) { localStorage.setItem("dm-parceiros-rascunho", r); sessionStorage.setItem("rascunho-posto", "1"); } } catch {}
    window.__eventos = []; Object.defineProperty(window, "dmEvento", { set() {}, get() { return (n) => window.__eventos.push(n); } });
  }, [rascunho ? JSON.stringify(rascunho) : ""]);
  const envios = [];
  await ctx.route(/googletagmanager|google-analytics/, (r) => r.fulfill({ status: 200, body: "" }));
  // Toda chamada ao Supabase é simulada: nada sai do navegador.
  await ctx.route(/supabase\.co/, (r) => {
    const u = r.request().url();
    if (u.includes("email_ja_cadastrado")) return r.fulfill({ status: 200, contentType: "application/json", body: String(emailExiste) });
    envios.push(JSON.parse(r.request().postData() || "{}"));
    return r.fulfill({ status: envio, body: envio === 500 ? "erro" : "" });
  });
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push("pageerror: " + e.message.slice(0, 200)));
  p.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|Failed to load resource|Error: erro|HTTP/.test(m.text())) erros.push("console: " + m.text().slice(0, 200)); });
  await p.goto(BASE + CAMINHO, { waitUntil: "networkidle" });
  return { ctx, p, erros, envios };
}

const COMPLETO = {
  nome: "maria da silva", email: "maria@exemplo.com", telefone: "(41) 99748-5414", cidade_estado: { uf: "PR", cidade: "Curitiba" }, apresentacao: "Designer.",
  atuacao_pj: "Estou em processo de formalização.", modelo_atuacao: ["Consultor(a) independente."], formas_colaboracao: ["Consultoria estratégica."],
  disponibilidade_colaborar: "Disponibilidade imediata.", areas_experiencia: ["Service Design."], principal_especializacao: "Service Design",
  atividades_entregaveis: ["Jornadas"], etapas_projeto: ["Ideação e cocriação de soluções."], segmentos: ["Saúde."], colaboracao_multidisciplinar: "Sim, frequentemente.",
  nivel_formacao: "Mestrado.", formacao: ["Design"], tempo_especialidade: "Mais de 20 anos.", tempo_independente: "Mais de 10 anos.", lideranca: "Sim, lidero projetos completos.",
  possui_portfolio: "Ainda não possuo portfólio estruturado.", projeto_relevante: "Um projeto.", servicos_especialista_externo: "Sim, ocasionalmente.",
  formatos_atuacao: ["100% remoto."], viagens: "Não tenho disponibilidade para viagens.", horas_semanais: "Até 5 horas semanais.", formatos_contratacao: ["Valor por hora."],
  equipe_propria: "Não, atuo individualmente.", interesse_parceria: "Sim, tenho bastante interesse.", autorizacoes: [AUT_DADOS],
};

(async () => {
  const b = await chromium.launch();
  for (const w of [390, 768, 1024, 1280]) {
    for (const etapa of [1, 3, 5, 8]) {
      const { ctx, p, erros } = await abrir(b, w, { rascunho: { etapa, r: {}, em: 1 } });
      await p.evaluate(async () => { document.querySelectorAll('[data-slot="accordion-trigger"]').forEach((t) => t.click()); await new Promise((r) => setTimeout(r, 200)); });
      ok(erros.length === 0, `${w}px etapa ${etapa}: sem erros no console${erros.length ? " -> " + erros.join(" / ") : ""}`);
      const rolagem = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(rolagem <= 0, `${w}px etapa ${etapa}: sem rolagem horizontal (${rolagem})`);
      const linhas = await p.evaluate(() => {
        const l = {};
        for (const el of document.querySelectorAll('[data-slot="cartao-de-escolha"]')) { const r = el.getBoundingClientRect(); (l[el.parentElement.dataset.slot + Math.round(r.top)] ||= []).push(Math.round(r.height)); }
        return Object.values(l).filter((x) => new Set(x).size > 1);
      });
      ok(linhas.length === 0, `${w}px etapa ${etapa}: cartões lado a lado com a mesma altura ${JSON.stringify(linhas)}`);
      if (AXE && (w === 390 || w === 1280)) {
        await p.addScriptTag({ content: AXE });
        const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
        ok(v.length === 0, `${w}px etapa ${etapa}: axe sem violações${v.length ? " -> " + v.join(" ; ") : ""}`);
      }
      if (w === 390) {
        const pequenos = await p.evaluate(() => [...document.querySelectorAll("main a, main button, main input, main [role=combobox], main label[data-slot=cartao-de-escolha]")]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest(".sr-only, [aria-hidden=true], [hidden], [data-slot=stepper], p") && !(el.type === "checkbox" || el.type === "radio" || el.getAttribute("role") === "checkbox"); })
          .map((el) => ({ t: (el.textContent || el.getAttribute("aria-label") || el.placeholder || "").trim().slice(0, 30), h: Math.round(el.getBoundingClientRect().height) }))
          .filter((x) => x.h < 44));
        ok(pequenos.length === 0, `390px etapa ${etapa}: alvos de toque de 44 px${pequenos.length ? " -> " + JSON.stringify(pequenos) : ""}`);
        const caixas = await p.evaluate(() => [...document.querySelectorAll('button[role="checkbox"]')].filter((el) => el.getBoundingClientRect().width > 0).map((el) => { const r = el.getBoundingClientRect(); return Math.round(Math.max(r.width, r.height)); }).filter((x) => x < 20));
        ok(caixas.length === 0, `390px etapa ${etapa}: caixas de seleção visíveis (área de toque de 44 px pelo DS)`);
        const bordas = await p.evaluate(() => {
          const sel = ["[data-slot=etapa-do-cadastro] h2", "[data-slot=etapa-do-cadastro] h2 + p", "[data-q] legend, [data-q] label", "[data-slot=stepper] ol"];
          return sel.map((s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().left) : null; });
        });
        ok(new Set(bordas.filter((x) => x !== null)).size === 1, `390px etapa ${etapa}: título, aviso, perguntas e etapas na mesma borda esquerda ${JSON.stringify(bordas)}`);
      }
      if (w === 1280 || w === 390) await p.screenshot({ path: `${process.env.CAPTURAS || "/tmp"}/cadastro-etapa${etapa}-${w}.png`, fullPage: true });
      await ctx.close();
    }
  }

  if (!process.env.SO_LEITURA) {
    // Etapa 1: erros, foco, e-mail já cadastrado, cidades.
    {
      const { ctx, p, erros } = await abrir(b, 390, { emailExiste: true });
      await p.getByRole("button", { name: /Próxima/ }).click();
      await p.waitForTimeout(300);
      ok(await p.getByText("Informe o seu nome completo, com nome e sobrenome.").first().isVisible(), "etapa 1 vazia: erro do nome");
      ok(await p.getByText(/Confira \d+ campos antes de continuar/).first().isVisible(), "etapa 1 vazia: resumo dos erros");
      ok(await p.evaluate(() => document.activeElement?.id === "nome"), "foco na primeira pergunta com erro");
      await p.fill("#nome", "Maria");
      await p.fill("#email", "maria@exemplo.com");
      await p.locator("#email").blur();
      await p.waitForTimeout(500);
      ok(await p.getByText(/Este e-mail já está cadastrado na Rede de Parceiros/).first().isVisible(), "e-mail já cadastrado: aviso na hora (email_ja_cadastrado)");
      await p.locator('[data-slot="campo-estado-cidade"] button[role=combobox]').first().click();
      await p.getByRole("option", { name: "Paraná" }).click();
      await p.waitForTimeout(500);
      await p.locator('[data-slot="campo-estado-cidade"] button[role=combobox]').nth(1).click();
      ok(await p.getByRole("option", { name: "Curitiba" }).first().isVisible(), "cidades do Paraná carregadas de /data/municipios");
      await p.keyboard.press("Escape");
      await p.fill("#telefone", "41997485414");
      ok((await p.inputValue("#telefone")) === "(41) 99748-5414", "máscara do telefone");
      await p.fill("#linkedin", "https://www.linkedin.com/in/maria");
      ok((await p.inputValue("#linkedin")) === "www.linkedin.com/in/maria" && (await p.locator('[data-slot="input-com-afixo"]').first().innerText()).includes("https://"), "link: https:// fixo na caixa (Input prefixo) e fora do que se digita");
      ok(erros.length === 0, "etapa 1: sem erros no console " + erros.join(" / "));
      await ctx.close();
    }
    // Etapa 2: "Outro" e fim PJ.
    {
      const { ctx, p } = await abrir(b, 390, { rascunho: { etapa: 2, r: { ...COMPLETO, atuacao_pj: "" }, em: 1 } });
      ok(await p.getByText("Recuperamos o seu preenchimento. Continue de onde parou.").first().isVisible(), "rascunho recuperado com o aviso");
      await p.getByText("Outro.", { exact: true }).first().click();
      ok(await p.getByPlaceholder("Qual? Escreva aqui").first().isVisible(), "Outro: abre o campo para escrever");
      await p.getByText("Não tenho interesse em atuar como PJ.").click();
      await p.getByRole("button", { name: /Próxima/ }).click();
      await p.waitForTimeout(300);
      ok(await p.getByText(/Escreva qual é a opção/).first().isVisible(), "Outro sem texto: erro");
      await p.getByPlaceholder("Qual? Escreva aqui").fill("Mentora");
      await p.getByRole("button", { name: /Próxima/ }).click();
      await p.waitForTimeout(300);
      ok(await p.getByRole("heading", { name: "Agradecemos pelo seu interesse!" }).first().isVisible(), "PJ: tela final");
      ok((await p.evaluate(() => localStorage.getItem("dm-parceiros-rascunho"))) === null, "PJ: rascunho apagado");
      await ctx.close();
    }
    // Pergunta que depende de outra e "Começar do zero".
    {
      const { ctx, p } = await abrir(b, 390, { rascunho: { etapa: 4, r: {}, em: 1 } });
      ok(!(await p.getByText("19. Conte brevemente sobre essa experiência.").first().isVisible()), "pergunta 19 escondida sem o Sim");
      await p.getByText("Sim, em algumas ocasiões.").click();
      ok(await p.getByText("19. Conte brevemente sobre essa experiência.").first().isVisible(), "pergunta 19 aparece com o Sim");
      await p.getByRole("button", { name: "Começar do zero" }).click();
      await p.waitForLoadState("networkidle");
      ok(await p.getByRole("heading", { name: "Informações profissionais e contato" }).first().isVisible(), "Começar do zero volta à etapa 1");
      await ctx.close();
    }
    // Política de privacidade numa janela (Dialog do DS), como na página de HTML; o Esc fecha só a janela.
    {
      const { ctx, p, erros } = await abrir(b, 1280, { rascunho: { etapa: 8, r: COMPLETO, em: 1 } });
      await p.getByRole("link", { name: "Política de privacidade" }).click();
      const janela = p.getByRole("dialog", { name: "Política de Privacidade" });
      await janela.waitFor();
      ok(await janela.getByText("8. Pesquisa sobre compra de moda em Curitiba").isVisible() || (await janela.getByText("1. Quais dados coletamos").count()) > 0, "política: abre numa janela com o texto da página");
      await p.waitForTimeout(400);
      await p.screenshot({ path: `${process.env.CAPTURAS || "/tmp"}/cadastro-1280-politica.png` });
      await p.keyboard.press("Escape");
      await p.waitForTimeout(400);
      ok((await janela.count()) === 0 && (await p.getByRole("button", { name: /Próxima/ }).isVisible()), "política: Esc fecha só a janela");
      ok(erros.length === 0, "política: sem erros no console " + erros.join(" / "));
      await ctx.close();
    }
    // Envio: sucesso, 409 e falha.
    for (const [status, esperado] of [[201, "Boas-vindas, Maria!"], [409, "Este e-mail já está cadastrado na Rede de Parceiros. Para atualizar seus dados, escreva para contato@danimoscatelli.com.br."], [500, "Não foi possível enviar seu cadastro. Verifique sua conexão e tente novamente."]]) {
      const { ctx, p, envios, erros } = await abrir(b, 1280, { rascunho: { etapa: 9, r: COMPLETO, em: 1 }, envio: status });
      // O contexto pede "menos movimento"; o envio que dá certo roda sem ele, para conferir o confete.
      if (status === 201) await p.emulateMedia({ reducedMotion: "no-preference" });
      await p.getByRole("button", { name: /Enviar cadastro/ }).click();
      await p.waitForTimeout(800);
      ok(await p.getByText(esperado).first().isVisible(), `envio ${status}: "${esperado.slice(0, 40)}…"`);
      if (status === 201) {
        const d = envios[0] || {};
        ok(d.nome === "maria da silva" && d.cidade_estado === "Curitiba - PR" && d.autoriza_dados === true && d.galeria_aceite_cadastro === false && typeof d.consentimento_texto === "string" && d.experiencia_colaboracao === null, "envio: linha da tabela cadastros no formato de antes");
        ok((await p.evaluate(() => window.__eventos)).includes("cadastro_parceiro"), "envio: evento cadastro_parceiro");
        ok(await p.evaluate(() => document.activeElement?.textContent === "Boas-vindas, Maria!"), "envio: foco no título da tela final");
        ok(await p.evaluate(() => [...document.querySelectorAll("canvas")].some((c) => getComputedStyle(c).position === "fixed")), "envio: confete na tela final (EstadoFinal comemorar)");
        await p.screenshot({ path: `${process.env.CAPTURAS || "/tmp"}/cadastro-1280-confete.png` });
      }
      ok(erros.length === 0, `envio ${status}: sem erros no console ${erros.join(" / ")}`);
      await ctx.close();
    }
    // Dentro da gaveta da Rede de Parceiros: o Esc no formulário fecha a gaveta.
    {
      const { ctx, p } = await abrir(b, 1280);
      await p.goto(BASE + "/rede-parceiros/", { waitUntil: "networkidle" });
      await p.locator('a[href="/rede-parceiros/cadastro/"]').first().click();
      const ifr = await p.waitForSelector("iframe");
      if (CAMINHO !== "/rede-parceiros/cadastro/") await ifr.evaluate((f, c) => { f.src = c; }, CAMINHO);
      const quadro = await ifr.contentFrame();
      await quadro.waitForSelector("#nome");
      await quadro.focus("#nome");
      await p.keyboard.press("Escape");
      await p.waitForTimeout(600);
      ok((await p.locator("iframe").count()) === 0, "na gaveta: Esc dentro do formulário fecha a gaveta (dm-fechar-cadastro)");
      await ctx.close();
    }
  }
  await b.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO PASSOU");
  process.exit(falhas ? 1 : 0);
})();
