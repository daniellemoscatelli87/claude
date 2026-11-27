#!/usr/bin/env node
// Compara dois dist do site, byte a byte (D-053): o de antes (por exemplo, o build do main) e o de agora.
// Esperado: tudo igual, menos a pasta site/ (arquivos do site em React) e as páginas marcadas "publicada" em
// src/rotas.json (que trocam de propósito o HTML de hoje). Qualquer outra diferença falha.
//
// Uso: node apps/site/scripts/comparar-dist.mjs <dist-antes> <dist-agora>
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { planoDeSaida } from "./montar-saida.mjs";

function listar(raiz) {
  const lista = [];
  const andar = (pasta) => {
    for (const nome of readdirSync(pasta).sort()) {
      const cheio = join(pasta, nome);
      if (statSync(cheio).isDirectory()) andar(cheio);
      else lista.push(relative(raiz, cheio).split(sep).join("/"));
    }
  };
  if (existsSync(raiz)) andar(raiz);
  return lista;
}

/** Diferenças entre os dois dist: { iguais, diferentes, soAntes, soAgora, esperadas }. */
export function compararDist(antes, agora, publicadas = []) {
  const a = new Set(listar(antes));
  const b = new Set(listar(agora));
  const r = { iguais: 0, diferentes: [], soAntes: [], soAgora: [], esperadas: [] };
  const esperada = (rel) => rel.startsWith("site/") || publicadas.includes(rel);
  for (const rel of [...new Set([...a, ...b])].sort()) {
    if (esperada(rel)) { r.esperadas.push(rel); continue; }
    if (!b.has(rel)) r.soAntes.push(rel);
    else if (!a.has(rel)) r.soAgora.push(rel);
    else if (Buffer.compare(readFileSync(join(antes, rel)), readFileSync(join(agora, rel))) !== 0) r.diferentes.push(rel);
    else r.iguais++;
  }
  return r;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [antes, agora] = process.argv.slice(2);
  if (!antes || !agora) {
    console.error("Uso: node apps/site/scripts/comparar-dist.mjs <dist-antes> <dist-agora>");
    process.exit(2);
  }
  const rotas = JSON.parse(readFileSync(new URL("../src/rotas.json", import.meta.url), "utf8"));
  const publicadas = planoDeSaida(rotas).filter((p) => !p.previa).map((p) => p.arquivo);
  const r = compararDist(antes, agora, publicadas);
  console.log(`${r.iguais} arquivos iguais byte a byte.`);
  console.log(`Esperadas (site em React e páginas publicadas): ${r.esperadas.length}${r.esperadas.length ? "\n  " + r.esperadas.join("\n  ") : ""}`);
  const problemas = [...r.diferentes.map((x) => "diferente: " + x), ...r.soAntes.map((x) => "sumiu: " + x), ...r.soAgora.map((x) => "novo: " + x)];
  if (problemas.length) {
    console.log(`FALHOU: ${problemas.length} diferença(s) fora do esperado:\n  ${problemas.join("\n  ")}`);
    process.exit(1);
  }
  console.log("OK: fora do site em React e das páginas publicadas, o dist está igual.");
}
