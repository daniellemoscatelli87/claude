// Copia a lista de cidades do IBGE usada pelo site (public/data/municipios/<UF>.json) para o app, antes do build.
// Fonte única: o arquivo do site. O app publica a cópia em /data/municipios/.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const origem = resolve(aqui, "../../../public/data/municipios");
const destino = resolve(aqui, "../public/data/municipios");
if (!existsSync(origem)) { console.error("Lista de municípios do site não encontrada em", origem); process.exit(1); }
mkdirSync(destino, { recursive: true });
cpSync(origem, destino, { recursive: true });
console.log("Municípios copiados para", destino);
