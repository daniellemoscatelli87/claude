#!/usr/bin/env node
// Lê a cabeça (título, metas de nome e de propriedade, canonical) de uma página de HTML e imprime no formato "cabeca"
// do src/rotas.json. Uso: node apps/site/scripts/cabeca-de-html.mjs <arquivo.html>
import { readFileSync } from "node:fs";
const decodificar = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
export function cabecaDeHtml(html) {
  const cab = html.slice(0, html.indexOf("</head>"));
  const titulo = decodificar(/<title>([\s\S]*?)<\/title>/.exec(cab)?.[1] ?? "");
  const meta = [...cab.matchAll(/<meta\s+(name|property)="([^"]+)"\s+content="([^"]*)"/g)].filter((m) => m[2] !== "viewport").map((m) => [m[1], m[2], decodificar(m[3])]);
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(cab)?.[1];
  return canonical ? { titulo, meta, canonical } : { titulo, meta };
}
if (process.argv[2]) console.log(JSON.stringify(cabecaDeHtml(readFileSync(process.argv[2], "utf8")), null, 2));
