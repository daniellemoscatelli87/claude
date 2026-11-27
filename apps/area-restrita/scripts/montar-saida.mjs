#!/usr/bin/env node
// Leva o build da área restrita em React para o dist do site (D-051) e faz o corte página a página.
//
// - Tudo vai para dist/admin/app/ (prévia): /admin/app/ é a Início em React, /admin/app/<caminho> as outras.
// - Página com "publicada" em src/rotas.json: o index.html do app também vai para dist/admin/<caminho>index.html,
//   no lugar da cópia da página de HTML (só no dist; public/admin/ não muda). As outras páginas continuam as de HTML.
// - Sem o dist do site (build só do app, por exemplo no teste), não copia nada.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Para cada página em React, os index.html que o dist do site recebe (caminhos relativos a dist/admin/). */
export function planoDeSaida(rotas) {
  const todas = new Map();
  for (const p of [...rotas.paginas, ...rotas.paginas.flatMap((x) => x.sub ?? []), ...(rotas.outras ?? [])]) if (!todas.has(p.id)) todas.set(p.id, p);
  const destinos = [];
  for (const [id, estado] of Object.entries(rotas.react ?? {})) {
    const p = todas.get(id);
    if (!p) throw new Error(`rotas.json: página desconhecida em "react": ${id}`);
    if (estado !== "previa" && estado !== "publicada") throw new Error(`rotas.json: estado inválido para ${id}: ${estado}`);
    destinos.push(`app/${p.caminho}index.html`);
    if (estado === "publicada") destinos.push(`${p.caminho}index.html`);
  }
  return [...new Set(destinos)].sort();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const app = fileURLToPath(new URL("..", import.meta.url));
  const site = join(app, "..", "..", "dist");
  const rotas = JSON.parse(readFileSync(join(app, "src", "rotas.json"), "utf8"));
  const plano = planoDeSaida(rotas);
  if (!existsSync(site)) {
    console.log("Dist do site não encontrado: build só do app (nada copiado). Páginas que seriam publicadas: " + plano.join(", "));
    process.exit(0);
  }
  const admin = join(site, "admin");
  cpSync(join(app, "dist"), join(admin, "app"), { recursive: true });
  const indice = readFileSync(join(app, "dist", "index.html"), "utf8");
  for (const rel of plano) {
    mkdirSync(dirname(join(admin, rel)), { recursive: true });
    writeFileSync(join(admin, rel), indice);
  }
  console.log("Área restrita em React copiada para dist/admin/app/. Index gravado em: " + plano.map((r) => "/admin/" + r).join(", "));
}
