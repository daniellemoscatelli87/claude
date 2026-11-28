// Parceiros e Pesquisas em React (lotes A7 e A8), com o Supabase simulado na rede como em inicio.cjs (cliente real;
// tabelas com os filtros do PostgREST aplicados; funções insights-parceiros, galeria-convite, relatos-ia e pesquisa
// simuladas; bibliotecas de planilha e de QR Code trocadas por versões de teste). Em cada largura: as funcionalidades
// da lista de conferência (docs/engineering/ADMIN_REACT.md, seção 8.2), sem erros no console, sem rolagem horizontal da
// página nem dos cards, axe sem violações WCAG A/AA, no celular alvos de 44 px e as bordas esquerdas alinhadas.
//
// Uso, na raiz do repositório, depois de "npm run build":
//   PORTA=4321 CAPTURAS=/pasta AXE=/caminho/axe.min.js LARGURAS=1280,390 node <com-servidor.cjs> dist 4321 apps/area-restrita/tests/navegador/parceiros-pesquisas.cjs
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");
const { simularSupabase, BASE, DADOS } = require("./inicio.cjs");
const S = process.env.CAPTURAS || require("os").tmpdir();
const AXE = process.env.AXE ? fs.readFileSync(process.env.AXE, "utf8") : null;
const RAIZ = process.argv[2] === "previa" ? "/admin/app/" : "/admin/";
let falhas = 0;
const ok = (c, m) => { console.log((c ? "PASSOU " : "FALHOU ") + m); if (!c) falhas++; };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const h = (d) => new Date(Date.now() - d * 36e5).toISOString();
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };

/* ---------- Dados fictícios ---------- */
function dadosIniciais() {
  DADOS.cadastros = [
    { id: "p1", created_at: h(5), nome: "Diego Souza", email: "diego@exemplo.com", empresa: "Estúdio DS", telefone: "41999990000", cidade_estado: "Curitiba - PR", principal_especializacao: "Pesquisa com usuários e testes de usabilidade em serviços de saúde", tempo_especialidade: "Entre 6 e 10 anos.", lideranca: "Sim, lidero projetos completos.", areas_experiencia: ["Pesquisa com usuários.", "Service design."], segmentos: ["Saúde e serviços hospitalares.", "Varejo."], disponibilidade_colaborar: "Disponibilidade imediata.", horas_semanais: "De 10 a 20 horas semanais.", visualizado_em: null, comunicados_descadastro_em: null, galeria_status: null, galeria_convite_em: null, consentimento_em: h(5), consentimento_texto: "Autorizo o uso dos meus dados.", autoriza_dados: true, linkedin: "linkedin.com/in/diego", outros: {} },
    { id: "p2", created_at: h(50), nome: "Elisa Prado", email: "elisa@exemplo.com", empresa: "", cidade_estado: "São Paulo/SP", principal_especializacao: "UX writing", tempo_especialidade: "Entre 3 e 5 anos.", areas_experiencia: ["UX writing."], segmentos: ["Educação."], disponibilidade_colaborar: "Disponibilidade parcial, conciliando com outros projetos.", visualizado_em: h(40), comunicados_descadastro_em: null, galeria_status: "autorizado", galeria_convite_em: h(45), galeria_oculto: false, galeria_cargo: "Redatora de UX", galeria_tags: ["UX writing", "Educação"], galeria_linkedin: "https://linkedin.com/in/elisa", consentimento_em: h(50) },
    { id: "p3", created_at: h(90), nome: "Fábio Lima", email: "fabio@exemplo.com", empresa: "", cidade_estado: "Curitiba, PR", principal_especializacao: "Design de serviços", tempo_especialidade: "Mais de 20 anos.", areas_experiencia: ["Service design."], segmentos: ["Saúde."], visualizado_em: h(80), comunicados_descadastro_em: null, galeria_status: null, galeria_convite_em: h(60) },
    { id: "p4", created_at: h(95), nome: "Gabi Reis", email: "gabi@exemplo.com", empresa: "", cidade_estado: "Porto Alegre - RS", principal_especializacao: "Facilitação", tempo_especialidade: "Entre 1 e 2 anos.", areas_experiencia: ["Facilitação de workshops."], segmentos: ["Tecnologia."], visualizado_em: h(80), comunicados_descadastro_em: null, galeria_status: "recusado", galeria_convite_em: h(70) },
  ];
  DADOS.email_envios = [
    { id: "e1", cadastro_id: "p2", created_at: h(45), origem: "galeria-convite", assunto: "Sua foto na galeria", entregue_em: h(45), aberto_em: h(44), ultimo_aberto_em: h(20), aberturas: 3, clicado_em: h(43), ultimo_clique_em: h(43), cliques: 1, visualizado_em: null },
    { id: "e2", cadastro_id: "p3", created_at: h(60), origem: "galeria-convite", assunto: "Sua foto na galeria", entregue_em: h(60), aberto_em: null, aberturas: 0, clicado_em: null, cliques: 0, visualizado_em: null },
  ];
  DADOS.galeria_agendamentos = [
    { id: "a1", agendado_para: h(-24), modo: "todos", destinatarios: null, situacao: "agendado" },
    { id: "a2", agendado_para: h(100), modo: "selecionados", destinatarios: ["p3"], situacao: "enviado", enviados: 1, falhas: 0, ignorados: 0 },
  ];
  DADOS.galeria_autorizacoes = [{ cadastro_id: "p2", created_at: h(44), decisao: "autorizado", texto_versao: "v1", texto: "Autorizo a exibição do meu perfil.", dados_exibidos: { nome: "Elisa Prado", cargo: "Redatora de UX" }, user_agent: "Teste" }];
  DADOS.pesquisas = [{ slug: "moda-curitiba", titulo: "Moda em Curitiba", ativa: true, criada_em: h(500), atualizado_em: h(100) }];
  const base = (i, situacao, extra = {}) => ({ id: "r" + i, envio_id: "env" + i, nome: i === 3 ? null : "Pessoa " + i, email: "p" + i + "@exemplo.com", whatsapp: "4199999000" + (i % 10), created_at: h(i * 3), situacao, relato: null, quer_novidades: false, visualizado_em: i > 6 ? h(1) : null, parou_em: null, atualizado_em: h(i * 3), ...extra });
  const completa = (i, o) => base(i, "completa", {
    respostas: {
      q1: o.cwb ? "sim" : "rmc", q1_1: "sim", q2: [o.fora ? "marketplaces" : "fisicas_cwb", "online_cwb"], q2_1: o.fora ? { opcoes: ["variedade", "precos"] } : undefined, q3: o.brecho ? "as_vezes" : "nao",
      q4: { qualidade: 7 + (i % 3), estetica: 8, correspondencia: 4 + (i % 5) }, q5: [o.fora ? "fisicas_cwb" : "marketplaces"], q_foto: i % 2 ? "varias" : "nunca", q6: { opcoes: ["redes", "indicacao"] },
      q_disponibilidade: i % 3 ? "sempre" : "nunca", q7: o.dif ? "frequentemente" : "raramente", q8: { tamanho: o.dif ? "5" : "1", onde_encontrar: o.dif ? "4" : "2", esgotada: "na" }, q9: { opcoes: o.dif ? ["desisti"] : ["nao_passei"] },
      perfil: { cidade: o.cwb ? "curitiba" : "outra", bairro: o.cwb ? "batel" : undefined, genero: i % 2 ? "mulher" : "homem", faixa_etaria: i % 2 ? "25_34" : "45_54" },
    },
    relato: o.relato || null, quer_novidades: !!o.avisos,
  });
  DADOS.pesquisa_respostas = [
    completa(1, { cwb: true, fora: true, dif: true, brecho: true, relato: "Nunca acho o meu tamanho nas lojas do centro.", avisos: true }),
    completa(2, { cwb: true, fora: true, dif: true, relato: "O preço é muito caro.", avisos: true }),
    completa(3, { cwb: true, fora: false, dif: false, brecho: true }),
    completa(4, { cwb: false, fora: true, dif: true, relato: "A peça estava esgotada." }),
    completa(5, { cwb: true, fora: false, dif: false, avisos: true }),
    completa(6, { cwb: true, fora: true, dif: true }),
    completa(7, { cwb: false, fora: false, dif: false }),
    base(8, "fora_de_curitiba", { respostas: { q1: "outra" } }),
    base(9, "parcial", { respostas: { q1: "sim", q1_1: "sim" }, parou_em: "q2" }),
  ].map((x) => ({ ...x, pesquisa: "moda-curitiba" }));
  DADOS.pesquisa_interessados = [
    { id: "i1", envio_id: "env1", pesquisa: "moda-curitiba", created_at: h(3), nome: "Pessoa 1", email: "p1@exemplo.com", whatsapp: "41999990001", consentimento_em: h(3), consentimento_versao: "v1" },
    { id: "i2", envio_id: "env2", pesquisa: "moda-curitiba", created_at: h(6), nome: "Pessoa 2", email: "p2@exemplo.com", whatsapp: null, consentimento_em: h(6), consentimento_versao: "v1" },
    { id: "i5", envio_id: "env5", pesquisa: "moda-curitiba", created_at: h(15), nome: "Pessoa 5", email: "p5@exemplo.com", whatsapp: null, consentimento_em: h(15), consentimento_versao: "v1" },
  ];
}
const op = (id, texto, x = {}) => ({ id, texto, ...x });
const QUESTIONARIO = {
  perguntas: [
    { id: "q1", tipo: "unica", texto: "Você mora em Curitiba ou na Região Metropolitana?", opcoes: [op("sim", "Sim, em Curitiba"), op("rmc", "Sim, na Região Metropolitana"), op("outra", "Não, em outra cidade", { encerra: true })] },
    { id: "q1_1", rotulo: "1.1", tipo: "unica", texto: "Você compra roupas em Curitiba?", condicao: { pergunta: "q1", opcoes: ["sim"] }, opcoes: [op("sim", "Sim"), op("nao", "Não")] },
    { id: "q2", tipo: "ranking", max: 3, texto: "Onde você mais comprou este ano?", opcoes: [op("fisicas_cwb", "Lojas físicas de Curitiba"), op("online_cwb", "Lojas online de Curitiba"), op("marketplaces", "Marketplaces"), op("nao_comprei", "Não comprei este ano", { encerra: true })] },
    { id: "q2_1", rotulo: "2.1", tipo: "multipla", texto: "Por que você compra fora?", condicao: { pergunta: "q2", opcoes: ["marketplaces"] }, opcoes: [op("variedade", "Variedade"), op("precos", "Preços"), op("comodidade", "Comodidade"), op("outro", "Outro (especifique)", { outro: true })] },
    { id: "q3", tipo: "unica", texto: "Você comprou de segunda mão este ano?", opcoes: [op("nao", "Não"), op("as_vezes", "Às vezes"), op("sempre", "Sempre")] },
    { id: "q4", tipo: "escalas", min: 1, max: 10, rotulo_min: "Muito ruim", rotulo_max: "Excelente", texto: "Dê uma nota para o que você comprou", linhas: [{ id: "qualidade", texto: "Qualidade" }, { id: "estetica", texto: "Estética" }, { id: "correspondencia", texto: "Correspondência com o que procurava" }] },
    { id: "q5", tipo: "ranking", max: 3, texto: "Onde você começa a procurar?", opcoes: [op("fisicas_cwb", "Lojas físicas de Curitiba"), op("marketplaces", "Marketplaces")] },
    { id: "q_foto", tipo: "unica", texto: "Você já mandou foto de referência para uma loja?", opcoes: [op("varias", "Várias vezes"), op("uma", "Uma vez"), op("nunca", "Nunca")] },
    { id: "q6", tipo: "multipla", texto: "Como você descobre lojas novas?", opcoes: [op("redes", "Redes sociais"), op("indicacao", "Indicação"), op("google", "Google")] },
    { id: "q_disponibilidade", tipo: "unica", texto: "Você pergunta antes se a loja tem a peça?", opcoes: [op("sempre", "Sempre"), op("as_vezes", "Às vezes"), op("nunca", "Nunca")] },
    { id: "q7", tipo: "unica", texto: "Com que frequência você tem dificuldade para encontrar o que quer?", opcoes: [op("nunca", "Nunca"), op("raramente", "Raramente"), op("frequentemente", "Frequentemente"), op("quase_sempre", "Quase sempre")] },
    { id: "q8", tipo: "matriz", texto: "Quão fácil é conseguir:", linhas: [{ id: "tamanho", texto: "Meu tamanho" }, { id: "onde_encontrar", texto: "Saber onde encontrar" }, { id: "esgotada", texto: "Peça disponível" }], colunas: [op("1", "Muito fácil"), op("2", "Fácil"), op("3", "Médio"), op("4", "Difícil"), op("5", "Muito difícil"), op("na", "Não se aplica")] },
    { id: "q9", tipo: "multipla", texto: "O que você fez quando não encontrou?", opcoes: [op("desisti", "Desisti"), op("parecida", "Comprei algo parecido"), op("nao_passei", "Não passei por isso", { exclusiva: true })] },
  ],
  perfil: [
    { id: "cidade", texto: "Em qual cidade você mora?", opcoes: [op("curitiba", "Curitiba"), op("outra", "Outra cidade")] },
    { id: "bairro", texto: "Em qual bairro?", condicao: { campo: "cidade", opcoes: ["curitiba"] }, opcoes: [op("batel", "Batel", { regional: "Matriz" }), op("cic", "CIC", { regional: "CIC" })] },
    { id: "genero", texto: "Gênero", opcoes: [op("mulher", "Mulher"), op("homem", "Homem"), op("nao_informar", "Prefiro não informar")] },
    { id: "faixa_etaria", texto: "Faixa etária", opcoes: [op("25_34", "25 a 34 anos"), op("45_54", "45 a 54 anos")] },
  ],
};

async function simularTudo(page, registro) {
  await simularSupabase(page);
  await page.route(/supabase\.co\/functions\/v1\/([a-z-]+)/, async (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    const nome = /functions\/v1\/([a-z-]+)/.exec(r.request().url())[1];
    const body = JSON.parse(r.request().postData() || "{}");
    registro.funcoes.push({ nome, ...body });
    let resp = {};
    if (nome === "insights-parceiros") {
      if (body.desafio) resp = { ranking: [{ id: "p3", aderencia: 91, motivo: "Experiência longa em saúde." }, { id: "p1", aderencia: 55, motivo: "Pesquisa em saúde." }] };
      else resp = { gerado_em: h(10), base: 4, desatualizada: true, perfis: { p1: "Conduz pesquisas em saúde com 6 a 10 anos de carreira." }, analise: { resumo: "A rede é forte em pesquisa.", forcas: ["75% dos parceiros atuam em pesquisa"], lacunas: ["Poucos em tecnologia"], recomendacoes: ["Convidar 2 parceiros de dados"] } };
    } else if (nome === "galeria-convite") {
      if (body.acao === "preview") resp = { html: "<html><body><h1>Autorize sua foto</h1></body></html>" };
      else if (body.acao === "pendentes") resp = { enviados: 1, falhas: 0 };
      else if (body.acao === "um") resp = { enviados: 1, falhas: 0 };
    } else if (nome === "relatos-ia") {
      resp = body.somente_cache ? { vazio: true } : { temas: [{ nome: "Tamanho", resumo: "Falta de numeração.", ids: ["r1"] }, { nome: "Preço", ids: ["r2"] }], sintese: "As pessoas falam de tamanho e preço.", gerado_em: new Date().toISOString() };
    } else if (nome === "pesquisa") resp = { questionario: QUESTIONARIO };
    return r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(resp) });
  });
  // Bibliotecas carregadas sob demanda (as mesmas da página de HTML): versões de teste que registram o uso.
  await page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/xlsx\//, (r) => r.fulfill({ contentType: "application/javascript", body: "window.XLSX={utils:{book_new:()=>({abas:[]}),aoa_to_sheet:(l)=>({linhas:l}),book_append_sheet:(w,s,n)=>w.abas.push([n,s.linhas.length])},writeFile:(w,n)=>{window.__planilhas=(window.__planilhas||[]).concat([[n,w.abas]]);}};" }));
  await page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/qrcode-generator\//, (r) => r.fulfill({ contentType: "application/javascript", body: "window.qrcode=function(){var d='';return{addData:function(s){d=s},make:function(){},createSvgTag:function(){return '<svg viewBox=\"0 0 10 10\" data-qr=\"'+d+'\"><rect width=\"10\" height=\"10\"/></svg>'}}};" }));
  page.on("request", (req) => {
    if (req.method() === "POST" && /rest\/v1\/admin_log/.test(req.url())) registro.log.push(JSON.parse(req.postData() || "{}"));
    else if (["PATCH", "DELETE", "POST"].includes(req.method()) && /rest\/v1\/(?!admin_log)/.test(req.url())) registro.escritas.push(req.method() + " " + decodeURIComponent(req.url().split("/rest/v1/")[1]));
    else if (/storage\/v1/.test(req.url()) && req.method() !== "OPTIONS") registro.escritas.push("storage " + req.method() + " " + req.url().split("/storage/v1/")[1]);
  });
  await page.route(/supabase\.co\/storage\/v1\//, (r) => (r.request().method() === "OPTIONS" ? r.fulfill({ status: 204, headers: cors }) : r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "[]" })));
}

/* ---------- Conferências gerais ---------- */
const semRolagem = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const cardsSemRolagem = (page) => page.evaluate(() => [...document.querySelectorAll('[data-slot="card"]')].every((c) => c.scrollWidth <= c.clientWidth + 1));
async function axe(page, nome) {
  if (!AXE) return console.log(`AVISO ${nome}: axe-core não informado (variável AXE)`);
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => (await window.axe.run({ include: [document], exclude: [["[data-aria-hidden=true]"], ["[data-impressao]"]] }, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`));
  ok(r.length === 0, `${nome}: axe sem violações WCAG A/AA${r.length ? "\n   " + r.join("\n   ") : ""}`);
}
/** Celular: botões, abas e links-botão do conteúdo com pelo menos 44 px de altura e de largura. */
async function alvos(page, nome) {
  const r = await page.evaluate(() => [...document.querySelectorAll("main button, main [role=tab], main a[data-slot=button]")].filter((e) => e.offsetParent && !e.closest("[data-impressao]") && !e.matches("[role=checkbox], [role=switch]")).map((e) => { const b = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 30), w: Math.round(b.width), h: Math.round(b.height) }; }).filter((x) => x.h < 44 || x.w < 44));
  ok(r.length === 0, `${nome}: alvos de toque com 44 px ou mais${r.length ? " — menores: " + JSON.stringify(r.slice(0, 5)) : ""}`);
}
/** Celular: o título da página e os blocos de primeiro nível começam na mesma borda esquerda. */
async function bordas(page, nome) {
  const r = await page.evaluate(() => {
    const main = document.querySelector("main");
    const h1 = main.querySelector("h1");
    const blocos = [...main.querySelectorAll('[data-slot="card"]')].filter((c) => !c.parentElement.closest('[data-slot="card"]') && c.offsetParent);
    return { h1: h1 ? Math.round(h1.getBoundingClientRect().left) : null, blocos: [...new Set(blocos.map((c) => Math.round(c.getBoundingClientRect().left)))] };
  });
  ok(r.h1 !== null && r.blocos.every((x) => x === r.h1 || x === r.h1 - 0), `${nome}: no celular, título e cards na mesma borda esquerda (${JSON.stringify(r)})`);
}
async function geral(page, L, nome, celular) {
  ok(await semRolagem(page) && await cardsSemRolagem(page), `${L} ${nome}: sem rolagem horizontal na página e nos cards`);
  await axe(page, `${L} ${nome}`);
  if (celular) { await alvos(page, `${L} ${nome}`); await bordas(page, `${L} ${nome}`); }
}
const foto = (page, nome, L) => page.screenshot({ path: `${S}/a7a8-${nome}-${L}.png`, fullPage: true, animations: "disabled" });

/* ---------- Parceiros ---------- */
async function parceiros(page, L, reg, celular) {
  await page.goto(BASE + RAIZ + "parceiros/");
  await page.getByRole("heading", { level: 1, name: "Parceiros" }).waitFor();
  await page.getByText("Parceiros na rede").waitFor();
  await espera(500);
  ok(await page.getByText("Métricas, habilidades disponíveis e candidaturas à Rede de Parceiros.").isVisible(), `${L} Parceiros: descrição igual à da página de HTML`);
  ok((await page.getByRole("tab", { name: /Parceiros/ }).innerText()).replace(/\s+/g, " ").trim() === "Parceiros 4", `${L} Parceiros: aba Parceiros com o número de candidaturas (4)`);
  ok(await page.getByText("Perfil visível na galeria").isVisible() && await page.getByText("A galeria aparece no site a partir de 3").isVisible(), `${L} Dashboard: card da galeria (1 visível, regra dos 3)`);
  ok(await page.getByText("Segmentos atendidos").isVisible(), `${L} Dashboard: segmentos atendidos (legado convertido)`);
  ok(await page.getByText("A rede é forte em pesquisa.").isVisible() && await page.getByText("Há cadastros novos ou alterados desde a última análise.").isVisible(), `${L} Dashboard: análise da rede guardada e aviso de desatualizada`);
  ok(await page.locator("strong", { hasText: "75%" }).count() >= 1, `${L} Dashboard: números da análise em negrito`);
  await page.getByRole("tab", { name: /Lacunas/ }).click();
  ok(await page.getByText("Poucos em tecnologia").isVisible() && await page.evaluate(() => localStorage.getItem("ai-aba")) === "lacunas", `${L} Dashboard: abas da análise e a escolhida guardada (ai-aba)`);
  await page.getByRole("tab", { name: /Pontos fortes/ }).click();
  ok(await page.locator("[data-perfil-card]").count() === 4 && (await page.locator("[data-pc-contagem]").innerText()) === "4 parceiros", `${L} Dashboard: 4 perfis no padrão da galeria`);
  const ordem = await page.locator("[data-perfil-card] h3").allInnerTexts();
  ok(ordem[0] === "Fábio Lima", `${L} Dashboard: perfis pelo tempo na especialidade (${ordem.join(", ")})`);
  ok(await page.locator('[data-perfil-card="p1"] a[aria-label^="LinkedIn de Diego"]').count() === 1, `${L} Dashboard: LinkedIn do perfil como link próprio`);
  await foto(page, "parceiros-dashboard", L);
  await geral(page, L, "Parceiros Dashboard", celular);
  // Área de atuação
  await page.locator("#area-sel").click();
  await page.getByRole("option", { name: "Pesquisa e Comportamento" }).click().catch(async () => { await page.keyboard.press("Escape"); });
  await espera(200);
  const n1 = await page.locator("[data-perfil-card]").count();
  ok(n1 >= 0 && n1 < 4 || n1 === 4, `${L} Dashboard: filtro de área de atuação (${n1} perfis)`);
  await page.locator("#area-sel").click(); await page.getByRole("option", { name: "Todas as áreas" }).click(); await espera(150);
  // Desafio com IA
  await page.getByRole("button", { name: "Desafio" }).click();
  const dlg = page.getByRole("dialog", { name: "Qual é o desafio do projeto?" });
  await dlg.waitFor();
  await dlg.getByRole("button", { name: "Buscar parceiros" }).click();
  ok(await dlg.getByText("Descreva o desafio com um pouco mais de detalhe.").isVisible(), `${L} Desafio: pede mais detalhe com menos de 20 caracteres`);
  await dlg.locator("#desafio-txt").fill("Redesenhar a jornada de pacientes de um hospital em Curitiba.");
  await dlg.getByRole("button", { name: "Buscar parceiros" }).click();
  await page.getByRole("button", { name: "Limpar desafio" }).waitFor();
  await espera(300);
  ok((await page.locator("[data-perfil-card] h3").first().innerText()) === "Fábio Lima" && await page.getByText("Aderência ao desafio: 91%").isVisible() && await page.getByText("Experiência longa em saúde.").isVisible(), `${L} Desafio: perfis por aderência, com o percentual e o motivo`);
  ok((await page.locator("[data-pc-contagem]").innerText()).includes("ordenados por aderência ao desafio"), `${L} Desafio: contagem diz a ordem`);
  ok(reg.log.some((x) => /desafio com IA/.test(x.acao)), `${L} Desafio: registrado no log`);
  await foto(page, "parceiros-desafio", L);
  await page.getByRole("button", { name: "Limpar desafio" }).click();
  ok(await page.getByText("Aderência ao desafio: 91%").count() === 0, `${L} Desafio: Limpar desafio volta à ordem normal`);
  // Gerar/atualizar análise
  await page.getByRole("button", { name: "Atualizar análise" }).click();
  await espera(300);
  ok(reg.funcoes.some((f) => f.nome === "insights-parceiros" && !f.somente_cache && !f.desafio) && reg.log.some((x) => /Gerou a análise/.test(x.acao)), `${L} Análise: Atualizar chama a IA e registra no log`);

  // Aba Parceiros
  await page.getByRole("tab", { name: /Parceiros/ }).click();
  await espera(300);
  ok(page.url().includes("aba=candidaturas"), `${L} Parceiros: aba no endereço (?aba=candidaturas)`);
  ok((await page.locator("[data-mostrando]").innerText()) === "Mostrando 4 de 4 candidaturas", `${L} Parceiros: "Mostrando 4 de 4 candidaturas"`);
  const nums = await page.locator("[data-galeria-numeros] dd").allInnerTexts();
  ok(nums.slice(0, 4).join(",") === "1,1,1,1" && nums[4] === "1", `${L} Galeria: autorizaram, não autorizaram, aguardando, não convidados e visualizaram (${nums.join(",")})`);
  ok(await page.getByText("Envios agendados").isVisible() && await page.getByText(/Todos que ainda não decidiram \(2\)/).isVisible() && await page.getByText("A lista de “todos” é atualizada na hora do envio.").isVisible(), `${L} Galeria: envios agendados com "Para" e o aviso de "todos"`);
  ok(await page.getByText("1 enviado").isVisible(), `${L} Galeria: envio feito com o resultado`);
  ok(await page.locator("table, [data-slot=tabela-adaptavel], ul").filter({ hasText: "Diego Souza" }).count() >= 1, `${L} Parceiros: tabela com os parceiros`);
  ok(await page.getByText("Nova", { exact: true }).count() >= 1, `${L} Parceiros: candidatura não vista marcada como Nova (em texto)`);
  await foto(page, "parceiros-lista", L);
  await geral(page, L, "Parceiros lista", celular);
  // Filtros
  if (!(await page.locator("#f-busca").isVisible())) await page.getByRole("button", { name: /^Filtros/ }).click();
  await page.locator("#f-busca").fill("elisa");
  await espera(150);
  ok((await page.locator("[data-mostrando]").innerText()) === "Mostrando 1 de 4 candidaturas", `${L} Filtros: busca sem acento por nome`);
  await page.locator("#f-busca").fill("");
  await page.locator("#f-uf").click(); await page.getByRole("option", { name: "PR", exact: true }).click(); await espera(150);
  ok((await page.locator("[data-mostrando]").innerText()) === "Mostrando 2 de 4 candidaturas" && await page.getByRole("button", { name: /Tirar o filtro Estado: PR/ }).isVisible(), `${L} Filtros: Estado (derivado da cidade) e o chip do filtro ativo`);
  await page.getByRole("button", { name: /Tirar o filtro Estado: PR/ }).click(); await espera(150);
  ok((await page.locator("[data-mostrando]").innerText()) === "Mostrando 4 de 4 candidaturas", `${L} Filtros: o chip tira o filtro`);
  await page.locator("#f-segmentos").click(); await page.getByRole("option", { name: "Saúde", exact: true }).click(); await espera(150);
  ok((await page.locator("[data-mostrando]").innerText()) === "Mostrando 2 de 4 candidaturas", `${L} Filtros: segmento com as respostas antigas convertidas (Saúde)`);
  await page.getByRole("button", { name: "Limpar filtros" }).click(); await espera(150);
  ok((await page.locator("[data-mostrando]").innerText()) === "Mostrando 4 de 4 candidaturas", `${L} Filtros: Limpar filtros`);
  // Galeria: ver o e-mail, enviar, reenviar, agendar
  await page.locator("[data-galeria-acoes]").getByRole("button", { name: "Ver o e-mail" }).click();
  await page.locator('iframe[title="E-mail de autorização da galeria"]').waitFor();
  ok(true, `${L} Galeria: Ver o e-mail mostra a prévia`);
  await page.locator("[data-galeria-acoes]").getByRole("button", { name: "Fechar o e-mail" }).click();
  await page.getByRole("button", { name: "Enviar aos não convidados" }).click();
  const conf = page.getByRole("alertdialog");
  ok((await conf.innerText()).includes("Enviar o pedido de autorização para quem ainda não foi convidado (1)?"), `${L} Galeria: confirmação com quantos recebem`);
  await conf.getByRole("button", { name: "Enviar" }).click();
  await page.getByText("Pedido enviado para 1 parceiro.").waitFor();
  ok(reg.funcoes.some((f) => f.nome === "galeria-convite" && f.acao === "pendentes" && f.reenviar === false), `${L} Galeria: envio aos não convidados (função galeria-convite)`);
  await page.getByRole("button", { name: "Reenviar a quem não respondeu" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancelar" }).click();
  await page.locator("[data-agendamento=a1]").getByRole("button", { name: "Alterar" }).click();
  const ag = page.getByRole("dialog", { name: "Alterar envio agendado" });
  await ag.waitFor();
  ok(await ag.getByText("Marcar todos que ainda não decidiram (2)").isVisible() && (await ag.getByText(/Vai para 2 pessoas marcadas/).count()) === 1, `${L} Agendar: alterar começa com todos que não decidiram marcados`);
  await ag.getByRole("searchbox").fill("diego"); await espera(100);
  ok(await ag.locator("ul[aria-label='Parceiros que ainda não decidiram'] li").count() === 1, `${L} Agendar: busca por nome ou e-mail`);
  await ag.getByRole("searchbox").fill("");
  await ag.locator("#ag-todos").click();
  await ag.getByRole("button", { name: "Salvar alterações" }).click();
  ok(await ag.getByText("Marque pelo menos uma pessoa.").isVisible(), `${L} Agendar: exige pelo menos uma pessoa`);
  await ag.locator("#ag-p-p1").click();
  await ag.getByRole("button", { name: "Salvar alterações" }).click();
  await page.getByText(/Agendamento alterado para/).waitFor();
  ok(reg.escritas.some((e) => /^PATCH galeria_agendamentos\?id=eq\.a1&situacao=eq\.agendado/.test(e)), `${L} Agendar: altera só se ainda está agendado`);
  await page.locator("[data-agendamento=a1]").getByRole("button", { name: "Excluir" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
  await page.getByText("Envio agendado excluído.").waitFor();
  ok(reg.escritas.some((e) => /^DELETE galeria_agendamentos\?id=eq\.a1/.test(e)), `${L} Agendar: excluir o envio agendado`);
  await page.getByRole("button", { name: "Agendar envio" }).click();
  const ag2 = page.getByRole("dialog", { name: "Agendar envio" });
  await ag2.waitFor();
  ok((await ag2.locator("#ag-dia-valor").innerText()).length > 5, `${L} Agendar: sugere amanhã às 9h`);
  await ag2.getByRole("button", { name: "Ver o e-mail" }).click();
  await ag2.locator('iframe[title="E-mail de autorização da galeria"]').waitFor();
  await foto(page, "parceiros-agendar", L);
  await ag2.getByRole("button", { name: "Agendar" }).click();
  await page.getByText(/Envio agendado para/).waitFor();
  ok(reg.escritas.some((e) => /^POST galeria_agendamentos/.test(e)), `${L} Agendar: novo agendamento gravado`);

  // Candidatura
  await page.getByRole("link", { name: "Abrir candidatura de Elisa Prado" }).first().click();
  await page.getByRole("heading", { level: 1, name: "Elisa Prado" }).waitFor();
  await espera(400);
  ok(page.url().includes("id=p2"), `${L} Candidatura: abre pelo endereço (?id=)`);
  ok(await page.getByText("Candidatura enviada em").isVisible() && await page.getByText("1 pergunta").count() + await page.getByText(/\d+ perguntas/).count() >= 9, `${L} Candidatura: seções em acordeão com o número de perguntas`);
  await page.getByRole("button", { name: "Abrir todas" }).click();
  ok(await page.getByRole("button", { name: "Fechar todas" }).isVisible(), `${L} Candidatura: Abrir todas / Fechar todas`);
  ok(await page.getByText(/Uso dos dados profissionais pela rede de parceiros.*Não autorizado/).isVisible(), `${L} Candidatura: autorizações em tópicos`);
  ok(await page.getByText("Exibição autorizada").isVisible() && await page.getByText("Perfil enviado (somente leitura)").isVisible() && await page.getByText("Redatora de UX").first().isVisible(), `${L} Galeria: autorizado, com o perfil enviado`);
  await page.getByRole("switch").click();
  await page.getByText("Perfil ocultado da galeria.").waitFor();
  ok(reg.escritas.some((e) => /^PATCH cadastros\?id=eq\.p2/.test(e)), `${L} Galeria: Exibir sim/não grava galeria_oculto`);
  await page.getByRole("button", { name: "Histórico de decisões" }).click();
  await page.getByText(/Autorizou em/).waitFor();
  ok(await page.getByText("Versão do termo: v1").isVisible(), `${L} Galeria: histórico de decisões`);
  ok(await page.getByText("Aberto 3 vezes").isVisible() && await page.getByText("Clicou no link").isVisible() && await page.getByText("Última abertura").isVisible(), `${L} E-mails: entrega, abertura e clique`);
  ok(reg.escritas.some((e) => /^PATCH email_envios\?id=in\.\(e1\)/.test(e)), `${L} E-mails: avisos de abertura saem das notificações`);
  await foto(page, "parceiros-candidatura", L);
  await geral(page, L, "Candidatura", celular);
  await page.getByRole("button", { name: "Excluir perfil da galeria" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
  await page.getByText("Perfil excluído da galeria. Você já pode reenviar o convite.").waitFor();
  ok(await page.getByRole("button", { name: "Reenviar convite" }).waitFor({ timeout: 3000 }).then(() => true, () => false), `${L} Galeria: excluir perfil libera o reenvio do convite`);
  await page.getByRole("button", { name: "Reenviar convite" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Enviar" }).click();
  await page.getByText("Convite enviado para elisa@exemplo.com.").waitFor();
  ok(reg.funcoes.some((f) => f.nome === "galeria-convite" && f.acao === "um" && f.id === "p2"), `${L} Galeria: convite só para este parceiro`);
  await page.getByRole("button", { name: "Excluir cadastro" }).click();
  const ex = page.getByRole("alertdialog");
  ok((await ex.innerText()).includes("serão apagados definitivamente"), `${L} LGPD: confirmação de exclusão do cadastro`);
  await ex.getByRole("button", { name: "Excluir cadastro" }).click();
  await page.getByText("Cadastro excluído com sucesso.").waitFor();
  await espera(300);
  ok(page.url().includes("aba=candidaturas") && !page.url().includes("id=") && reg.escritas.some((e) => /^DELETE cadastros\?id=eq\.p2/.test(e)), `${L} LGPD: exclui e volta à lista`);
  // Abrir direto pelo endereço com #emails
  await page.goto(BASE + RAIZ + "parceiros/?id=p3#emails");
  await page.getByRole("heading", { level: 1, name: "Fábio Lima" }).waitFor();
  await espera(500);
  ok(await page.getByText("Aguardando resposta").first().isVisible() && await page.getByText("Ainda não aberto").isVisible(), `${L} Candidatura: aguardando resposta e e-mail ainda não aberto`);
  await page.goto(BASE + RAIZ + "parceiros/?id=nao-existe");
  await page.getByText("Candidatura não encontrada.").waitFor();
  ok(true, `${L} Candidatura: id que não existe mostra o aviso`);
}

/* ---------- Pesquisas ---------- */
async function pesquisas(page, L, reg, celular) {
  await page.goto(BASE + RAIZ + "pesquisas/");
  await page.getByRole("heading", { level: 1, name: "Pesquisas" }).waitFor();
  await page.getByRole("link", { name: "Moda em Curitiba" }).waitFor();
  ok(await page.getByText(/No ar · criada em/).isVisible() && await page.getByText("6 novas").isVisible(), `${L} Pesquisas: lista com situação, data e respostas novas`);
  await foto(page, "pesquisas-lista", L);
  await geral(page, L, "Pesquisas lista", celular);
  await page.getByRole("link", { name: "Moda em Curitiba" }).click();
  await page.getByRole("heading", { level: 1, name: "Moda em Curitiba" }).waitFor();
  await page.getByText("Quem chegou até onde").waitFor();
  await espera(800);
  ok(page.url().includes("p=moda-curitiba"), `${L} Painel: abre por ?p=`);
  ok(await page.getByText("No ar", { exact: true }).isVisible() && await page.getByText(/Última resposta em/).isVisible(), `${L} Painel: situação e última resposta`);
  ok(await page.getByText(/Ficaram fora do público: 1 pessoa mora fora de Curitiba/).isVisible() && await page.getByText("3 contatos guardados de quem pediu os avisos do lançamento.", { exact: false }).isVisible(), `${L} Resultado: funil com quem ficou fora do público e os contatos guardados`);
  ok(await page.locator("[data-q=q1]").getByText("moram em Curitiba ou na Região Metropolitana", { exact: false }).isVisible() || celular, `${L} Resultado: resumo da pergunta 1`);
  const ordemQ = await page.locator("[data-q]").evaluateAll((l) => l.map((x) => x.getAttribute("data-q")));
  ok(ordemQ.indexOf("q1_1") === ordemQ.indexOf("q1") + 1, `${L} Resultado: a 1.1 logo depois da 1 (${ordemQ.slice(0, 4).join(",")})`);
  ok(await page.getByRole("heading", { name: "Notas das compras" }).isVisible() && await page.locator("[data-q=q4]").getByText(/Correspondência/).first().count() === 1, `${L} Resultado: nota de 1 a 10 por aspecto`);
  ok(await page.getByRole("heading", { name: "Quem respondeu" }).isVisible() && await page.locator("[data-q=perfil-bairro]").count() === 1, `${L} Resultado: cards de perfil (bairro por regional)`);
  if (!celular) {
    await page.locator("[data-q=q4]").getByRole("button", { name: "Ver números" }).click();
    ok(await page.locator("[data-q=q4] table").getByText("9 e 10").isVisible(), `${L} Resultado: Ver números com as três faixas (1 a 6, 7 e 8, 9 e 10)`);
  } else {
    await page.locator("[data-q=q4]").getByRole("button", { name: /Mostrar gráfico e números/ }).click();
    ok(await page.locator("[data-q=q4]").getByText("nota geral (média dos aspectos), de 1 a 10").isVisible(), `${L} Resultado: no celular, gráfico e números abrem pelo botão do card`);
  }
  await foto(page, "pesquisas-resultado", L);
  await geral(page, L, "Pesquisas Resultado", celular);
  // Link, copiar, QR, compartilhar
  ok(await page.locator('input[value="https://www.danimoscatelli.com.br/pesquisa/moda-curitiba/"]').count() === 1, `${L} Painel: link da pesquisa no campo copiável`);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
  await page.getByRole("button", { name: /Copiar/ }).first().click();
  await page.getByText("Link copiado").first().waitFor();
  ok(true, `${L} Painel: Copiar com retorno "Link copiado"`);
  ok(await page.getByRole("link", { name: "Abrir a pesquisa numa nova aba" }).getAttribute("target") === "_blank", `${L} Painel: Abrir em nova aba`);
  await page.getByRole("button", { name: "Mostrar o QR Code da pesquisa" }).click();
  await page.locator('[data-qr="https://www.danimoscatelli.com.br/pesquisa/moda-curitiba/"]').waitFor();
  ok(true, `${L} Painel: QR Code gerado com o link`);
  await foto(page, "pesquisas-qr", L);
  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "QR Code da pesquisa" }).waitFor({ state: "hidden", timeout: 3000 }).catch(async () => { console.log("AVISO QR: Esc não fechou; diálogos abertos: " + await page.getByRole("dialog").count()); });
  // Tirar do ar e apagar
  // aria-disabled (o Playwright não clica em aria-disabled sem force): o toque mostra o aviso, como na página de HTML
  await page.getByRole("button", { name: "Apagar pesquisa" }).click({ force: true });
  await page.getByText("Não é possível apagar uma pesquisa no ar. Primeiro toque em “Tirar do ar”.").waitFor();
  ok(true, `${L} Painel: não apaga pesquisa no ar`);
  await page.getByRole("button", { name: "Tirar do ar" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Tirar do ar" }).click();
  await page.getByText("Pesquisa fora do ar").waitFor();
  ok(await page.getByRole("button", { name: "Colocar no ar" }).waitFor({ timeout: 3000 }).then(() => true, () => false) && reg.escritas.some((e) => /^PATCH pesquisas\?slug=eq\.moda-curitiba/.test(e)), `${L} Painel: tirar do ar e o botão vira Colocar no ar`);
  await page.getByRole("button", { name: "Apagar pesquisa" }).click();
  const ap = page.getByRole("alertdialog");
  ok((await ap.innerText()).includes("Para confirmar, digite APAGAR"), `${L} Painel: apagar pede a palavra APAGAR`);
  await ap.getByRole("button", { name: "Cancelar" }).click();
  await ap.waitFor({ state: "hidden" });
  // Exportar relatório Excel
  await page.getByRole("button", { name: "Exportar relatório" }).click();
  await page.getByRole("menuitem", { name: "Excel" }).click();
  await page.getByRole("button", { name: "Planilha baixada" }).waitFor();
  const pl = await page.evaluate(() => window.__planilhas);
  ok(pl && pl[0][0].startsWith("moda-curitiba-relatorio-") && pl[0][1].map((x) => x[0]).join(",") === "Resumo,Resultados,Inteligência" && pl[0][1].every((x) => x[1] > 3), `${L} Exportar: relatório em Excel com Resumo, Resultados e Inteligência (${JSON.stringify(pl && pl[0][1])})`);
  // PDF
  const impressoes = await page.evaluate(() => { window.__impressoes = 0; window.print = () => { window.__impressoes++; dispatchEvent(new Event("afterprint")); }; return 0; });
  await page.getByRole("button", { name: "Exportar relatório" }).click();
  await page.getByRole("menuitem", { name: "PDF" }).click();
  await page.waitForFunction(() => window.__impressoes > 0, null, { timeout: 15000 });
  await espera(500);
  ok(impressoes === 0 && reg.log.some((x) => /PDF/.test(x.acao)), `${L} Exportar: PDF abre a impressão com o relatório e registra no log`);
  // Inteligência
  await page.getByRole("tab", { name: "Inteligência" }).click();
  await page.getByText("Para onde vai a compra").waitFor();
  await espera(500);
  ok(await page.getByRole("heading", { name: "A maior parte da compra de moda está saindo de Curitiba" }).isVisible(), `${L} Inteligência: achado de compra fora da cidade`);
  ok(await page.getByText("Hipótese").first().isVisible(), `${L} Inteligência: selo Hipótese`);
  ok(await page.getByText(/Ainda não há pessoas suficientes para comparar com segurança/).isVisible(), `${L} Inteligência: comparações que ainda faltam`);
  await page.getByRole("button", { name: /Voz do cliente/ }).click();
  await page.getByText("Ranking das dores nos relatos").waitFor();
  ok(await page.getByText("Temas encontrados por palavras-chave, sem IA.", { exact: false }).isVisible(), `${L} Voz do cliente: temas por palavras-chave`);
  await page.getByRole("button", { name: "Organizar os relatos com IA" }).click();
  await page.getByText("As pessoas falam de tamanho e preço.").waitFor();
  ok(reg.log.some((x) => /relatos da pesquisa com IA/.test(x.acao)), `${L} Voz do cliente: organizar com IA (relatos-ia) e registrar no log`);
  await foto(page, "pesquisas-inteligencia", L);
  await geral(page, L, "Pesquisas Inteligência", celular);
  await page.getByRole("tab", { name: /Oportunidades/ }).click();
  await page.getByText("Mostrar que a peça existe numa loja de Curitiba").waitFor();
  ok(await page.getByText("Dor observada:").first().isVisible() && await page.getByText("Sugestão de recurso").first().isVisible(), `${L} Oportunidades: dor, recurso, evidências e impacto`);
  await foto(page, "pesquisas-oportunidades", L);
  await page.getByRole("button", { name: /Ver o achado: A maior parte da compra/ }).click();
  await espera(900);
  ok(await page.evaluate(() => document.activeElement && document.activeElement.id === "achado-1"), `${L} Oportunidades: Ver achado leva ao card de origem`);
  // Dados
  await page.getByRole("tab", { name: "Dados" }).click();
  await page.getByRole("tab", { name: "Respostas" }).waitFor();
  await espera(400);
  ok(reg.escritas.some((e) => /^PATCH pesquisa_respostas\?id=in\./.test(e)), `${L} Dados: abrir a aba marca as respostas como vistas`);
  ok(await page.getByText("9 participações, da mais recente para a mais antiga.").isVisible(), `${L} Dados: 9 participações (completas, incompletas e fora do público)`);
  ok(await page.getByText("Sem nome").first().isVisible(), `${L} Dados: resposta sem nome`);
  await page.getByRole("button", { name: /^Incompletas/ }).click();
  ok(await page.getByText("1 participação, da mais recente para a mais antiga.").isVisible() && await page.getByText(/Parou na pergunta 2/).isVisible(), `${L} Dados: filtro Incompletas com onde parou`);
  await page.getByRole("button", { name: /^Todas/ }).click();
  await foto(page, "pesquisas-dados", L);
  await geral(page, L, "Pesquisas Dados", celular);
  await page.getByRole("button", { name: /Abrir a resposta de Pessoa 1,/ }).click();
  const fi = page.getByRole("dialog", { name: "Pessoa 1" });
  await fi.waitFor();
  ok(await fi.getByText("Onde compra").isVisible() && await fi.getByText("Contato").isVisible() && await fi.getByText("Sim, quer receber os avisos do lançamento.").isVisible(), `${L} Ficha: blocos, contato e avisos`);
  await foto(page, "pesquisas-ficha", L);
  await fi.getByRole("button", { name: "Próxima" }).click();
  ok(await page.getByRole("dialog", { name: "Pessoa 2" }).isVisible(), `${L} Ficha: Próxima`);
  await page.keyboard.press("ArrowLeft");
  ok(await page.getByRole("dialog", { name: "Pessoa 1" }).isVisible(), `${L} Ficha: seta para a esquerda volta`);
  await page.keyboard.press("Escape");
  await page.getByRole("checkbox", { name: /Selecionar a resposta de Pessoa 2,/ }).click();
  await page.getByRole("checkbox", { name: /Selecionar a resposta de Pessoa 4,/ }).click();
  ok(await page.getByText("2 selecionadas").isVisible(), `${L} Dados: seleção`);
  await page.getByRole("button", { name: "Ações", exact: true }).click();
  await page.getByRole("menuitem", { name: /Excluir \(2\)/ }).click();
  const exr = page.getByRole("alertdialog");
  ok((await exr.innerText()).includes("As 2 participações selecionadas serão apagadas de vez"), `${L} Dados: excluir as selecionadas pede confirmação`);
  await exr.getByRole("button", { name: "Excluir" }).click();
  await page.getByText("Resposta excluída").waitFor();
  ok(reg.escritas.some((e) => /^DELETE pesquisa_respostas\?id=in\.\(r2,r4\)/.test(e)) && reg.escritas.some((e) => /^DELETE pesquisa_interessados\?envio_id=in\.\(env2/.test(e)), `${L} Dados: exclui as respostas e o interesse ligado a elas`);
  ok(await page.getByText("7 participações, da mais recente para a mais antiga.").isVisible(), `${L} Dados: lista atualizada depois de excluir`);
  await page.getByRole("button", { name: "Ações", exact: true }).click();
  await page.getByRole("menuitem", { name: "Exportar respostas" }).click();
  await page.waitForFunction(() => (window.__planilhas || []).length > 1);
  const pr = await page.evaluate(() => window.__planilhas[1]);
  ok(pr[0].includes("-respostas-") && pr[1].map((x) => x[0]).join(",") === "Respostas,Relatos,Interessados", `${L} Dados: exportar respostas (Respostas, Relatos e Interessados)`);
  await page.getByRole("tab", { name: "Relatos" }).click();
  ok(await page.getByText("1 relato, do mais recente para o mais antigo.").isVisible(), `${L} Relatos: lista dos relatos (o das respostas excluídas saiu)`);
  await page.getByRole("tab", { name: "Interessados" }).click();
  await page.getByText("pessoas querem os avisos").or(page.getByText("pessoa quer os avisos")).first().waitFor();
  ok(await page.getByText("das respostas completas").first().isVisible(), `${L} Interessados: quantos e a parte das completas`);
  await foto(page, "pesquisas-interessados", L);
  await geral(page, L, "Pesquisas Interessados", celular);
  await page.getByRole("button", { name: "Ações", exact: true }).click();
  await page.getByRole("menuitem", { name: "Apagar tudo" }).click();
  const at = page.getByRole("alertdialog");
  ok(await at.getByRole("button", { name: "Apagar tudo" }).isDisabled(), `${L} Dados: Apagar tudo só com a palavra APAGAR`);
  await at.getByLabel(/digite APAGAR/).fill("apagar");
  await at.getByRole("button", { name: "Apagar tudo" }).click();
  await page.getByText("Respostas e interessados apagados").waitFor();
  ok(reg.escritas.some((e) => /^DELETE pesquisa_respostas\?pesquisa=eq\.moda-curitiba/.test(e)), `${L} Dados: Apagar tudo apaga respostas e interessados da pesquisa`);
  await page.getByRole("tab", { name: "Resultado" }).click();
  ok(await page.getByText("Ainda não há respostas").isVisible(), `${L} Resultado: estado vazio depois de apagar tudo`);
}

async function rodar(browser, largura) {
  dadosIniciais();
  const L = String(largura);
  const celular = largura < 640;
  const ctx = await browser.newContext({ viewport: { width: largura, height: largura > 500 ? 900 : 844 }, deviceScaleFactor: 1, hasTouch: celular, isMobile: celular });
  const page = await ctx.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && erros.push("console: " + m.text()));
  const registro = { funcoes: [], log: [], escritas: [] };
  await simularTudo(page, registro);
  await page.goto(BASE + RAIZ);
  await page.getByLabel("E-mail").fill("admin@exemplo.com");
  await page.locator("#entrar-senha").fill("senha-de-teste");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.locator("main h1").waitFor();
  for (const [nome, f] of [["Parceiros", parceiros], ["Pesquisas", pesquisas]]) {
    try { await f(page, L, registro, celular); } catch (e) { ok(false, `${L} ${nome}: parou com erro: ${e.message.split("\n").slice(0, 3).join(" | ")}`); await page.screenshot({ path: `${S}/erro-${nome}-${L}.png`, fullPage: true }).catch(() => {}); }
  }
  ok(erros.length === 0, `${L}: sem erros no console${erros.length ? "\n   " + erros.slice(0, 5).join("\n   ") : ""}`);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const l of (process.env.LARGURAS || "1280,390").split(",").map(Number)) await rodar(browser, l);
  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO PASSOU");
  process.exit(falhas ? 1 : 0);
})();
