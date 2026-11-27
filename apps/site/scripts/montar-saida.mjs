#!/usr/bin/env node
// Monta as páginas do site público feitas em React (D-053) e faz o corte página a página.
//
// O build do app gera duas coisas: o JavaScript e o CSS de cada página (dist/, com o manifesto do Vite) e uma versão
// para o servidor (dist-servidor/servidor.js), usada só aqui, para gravar o HTML já pronto de cada página (bom para
// buscadores e para quem abre a página antes de o JavaScript carregar). No navegador, o React assume esse HTML.
//
// - Os arquivos do app vão para dist/site/assets/ do site.
// - Página com "previa" em src/rotas.json: grava dist/site/previa/<caminho>index.html, sem indexação.
// - Página com "publicada": grava também dist/<saida> (por exemplo dist/privacidade/index.html ou dist/404.html), no
//   lugar do HTML de hoje (só no dist; a página de HTML continua no repositório até ser apagada num commit próprio).
// - Página fora de "react": nada muda. O resto do dist do site fica byte a byte igual.
// - Sem o dist do site (build só do app, por exemplo no teste da sincronização), grava tudo em apps/site/saida/.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Base dos arquivos do app no site (a mesma do vite.config.ts). */
export const BASE = "/site/";

/** Páginas em React, conferidas: [{ pagina, estado }]. */
export function paginasEmReact(rotas) {
  const porId = new Map(rotas.paginas.map((p) => [p.id, p]));
  return Object.entries(rotas.react ?? {}).map(([id, estado]) => {
    const pagina = porId.get(id);
    if (!pagina) throw new Error(`rotas.json: página desconhecida em "react": ${id}`);
    if (estado !== "previa" && estado !== "publicada") throw new Error(`rotas.json: estado inválido para ${id}: ${estado}`);
    if (!pagina.cabeca?.titulo) throw new Error(`rotas.json: a página ${id} está em "react" sem "cabeca" (título, descrição…)`);
    return { pagina, estado };
  });
}

/** Arquivo da prévia de uma página, relativo ao dist do site: site/previa/<caminho>index.html. */
export function arquivoDaPrevia(pagina) {
  const pasta = pagina.caminho ? pagina.caminho.replace(/^\/|\/$/g, "") : pagina.saida.replace(/\.html$/, "");
  return `site/previa/${pasta ? pasta + "/" : ""}index.html`;
}

/** Para cada página em React, os arquivos que o dist do site recebe. */
export function planoDeSaida(rotas) {
  const plano = [];
  for (const { pagina, estado } of paginasEmReact(rotas)) {
    plano.push({ id: pagina.id, arquivo: arquivoDaPrevia(pagina), previa: true });
    if (estado === "publicada") plano.push({ id: pagina.id, arquivo: pagina.saida, previa: false });
  }
  return plano.sort((a, b) => a.arquivo.localeCompare(b.arquivo));
}

const escapar = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Tags da cabeça vindas de rotas.json. Na prévia, a página nunca é indexada. */
export function montarCabeca(cabeca, { previa = false } = {}) {
  const linhas = [`<title>${escapar(cabeca.titulo)}</title>`];
  let temRobots = false;
  for (const [atributo, nome, conteudo] of cabeca.meta ?? []) {
    if (atributo === "name" && nome === "robots") {
      temRobots = true;
      linhas.push(`<meta name="robots" content="${escapar(previa ? "noindex, nofollow" : conteudo)}">`);
    } else linhas.push(`<meta ${atributo}="${escapar(nome)}" content="${escapar(conteudo)}">`);
  }
  if (previa && !temRobots) linhas.push('<meta name="robots" content="noindex, nofollow">');
  if (cabeca.canonical) linhas.push(`<link rel="canonical" href="${escapar(cabeca.canonical)}">`);
  // Dados estruturados (schema.org) da página, como no HTML de antes; "<" escapado para não fechar o <script>.
  if (cabeca.jsonld) linhas.push(`<script type="application/ld+json">${JSON.stringify(cabeca.jsonld).replace(/</g, "\\u003c")}</script>`);
  return linhas;
}

/** Endereço das fontes do DS, lido do fonts.css sincronizado (carregado por <link>, como nas páginas de HTML). */
export function enderecoDasFontes(textoFontsCss) {
  const m = /@import\s+url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(textoFontsCss);
  if (!m) throw new Error("fonts.css do DS sem @import url(...)");
  return m[1];
}

/** CSS, pré-carregamentos e script de uma entrada do manifesto do Vite. */
export function recursosDaEntrada(manifesto, entrada) {
  const item = manifesto[entrada];
  if (!item) throw new Error(`manifesto do Vite sem a entrada ${entrada}`);
  const css = new Set(item.css ?? []);
  const pre = [];
  const visitar = (chave) => {
    const dep = manifesto[chave];
    if (!dep) return;
    for (const c of dep.css ?? []) css.add(c);
    if (!pre.includes(dep.file)) pre.push(dep.file);
    for (const i of dep.imports ?? []) visitar(i);
  };
  for (const i of item.imports ?? []) visitar(i);
  return { script: item.file, css: [...css], pre };
}

/** O HTML completo de uma página. */
export function montarHtml({ cabeca, previa, corpo, recursos, fontes }) {
  const r = (arq) => BASE + arq;
  return [
    "<!doctype html>",
    '<html lang="pt-BR">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    ...montarCabeca(cabeca, { previa }),
    '<link rel="icon" type="image/png" href="/favicon.png">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link href="${escapar(fontes)}" rel="stylesheet">`,
    ...recursos.css.map((c) => `<link rel="stylesheet" crossorigin href="${r(c)}">`),
    ...recursos.pre.map((p) => `<link rel="modulepreload" crossorigin href="${r(p)}">`),
    `<script type="module" crossorigin src="${r(recursos.script)}"></script>`,
    "</head>",
    "<body>",
    `<div id="raiz">${corpo}</div>`,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

/** Entrada do Vite de cada página (a mesma do vite.config.ts). */
export const entradaDa = (id) => `src/paginas/${id}/entrada.tsx`;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const app = fileURLToPath(new URL("..", import.meta.url));
  const rotas = JSON.parse(readFileSync(join(app, "src", "rotas.json"), "utf8"));
  const plano = planoDeSaida(rotas);
  const manifesto = JSON.parse(readFileSync(join(app, "dist", ".vite", "manifest.json"), "utf8"));
  const { renderizar } = await import(pathToFileURL(join(app, "dist-servidor", "servidor.js")).href);
  const fontes = enderecoDasFontes(readFileSync(join(app, "src", "styles", "fonts.css"), "utf8"));

  const distDoSite = join(app, "..", "..", "dist");
  const destino = existsSync(distDoSite) ? distDoSite : join(app, "saida");
  if (destino !== distDoSite) rmSync(destino, { recursive: true, force: true });
  cpSync(join(app, "dist", "assets"), join(destino, "site", "assets"), { recursive: true });

  const porId = new Map(rotas.paginas.map((p) => [p.id, p]));
  for (const { id, arquivo, previa } of plano) {
    const pagina = porId.get(id);
    const html = montarHtml({
      cabeca: pagina.cabeca,
      previa,
      corpo: renderizar(id),
      recursos: recursosDaEntrada(manifesto, entradaDa(id)),
      fontes,
    });
    mkdirSync(dirname(join(destino, arquivo)), { recursive: true });
    writeFileSync(join(destino, arquivo), html);
  }
  const onde = destino === distDoSite ? "dist" : "apps/site/saida (sem o dist do site)";
  console.log(`Site em React montado em ${onde}: ${plano.map((p) => "/" + p.arquivo + (p.previa ? " (prévia)" : " (publicada)")).join(", ")}`);
}
