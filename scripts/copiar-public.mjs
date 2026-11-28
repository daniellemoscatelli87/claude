// Primeira parte do build do site (npm run build): copia public/ para dist/ como está. Desde 28/11/2026 todas as páginas
// do site são do app em React (apps/site, D-053), então o build de HTML da raiz (Vite) saiu; os arquivos de public/
// (imagens, dados, páginas privadas do EI e scripts das páginas que ainda são HTML) continuam indo para o dist.
import { cpSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
cpSync("public", "dist", { recursive: true });
console.log("public/ copiado para dist/");
