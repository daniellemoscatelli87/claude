import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Site público em React (D-053). Mesmo conjunto de ferramentas do Design System Dani Moscatelli e da área restrita em
// React (Vite 6, React 18.3 e Tailwind v4 pelo plugin do Vite), para os componentes do DS rodarem como no site dele.
// Uma entrada por página (src/paginas/<id>/entrada.tsx), só as que estão em "react" no src/rotas.json. Os arquivos
// ficam em /site/assets/; scripts/montar-saida.mjs grava o HTML pronto de cada página no dist do site.
const rotas = JSON.parse(readFileSync(new URL("./src/rotas.json", import.meta.url), "utf8")) as { react?: Record<string, string> };
const entradas = Object.fromEntries(Object.keys(rotas.react ?? {}).map((id) => [id, `src/paginas/${id}/entrada.tsx`]));

export default defineConfig(({ isSsrBuild }) => ({
  base: "/site/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Versão para o servidor (só no build, para gravar o HTML pronto): tudo num arquivo, sem depender do node_modules.
  ssr: { noExternal: true },
  build: isSsrBuild
    ? { outDir: "dist-servidor", emptyOutDir: true }
    : {
        outDir: "dist",
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
          input: entradas,
          // Nomes estáveis: o que as páginas dividem (React, peças do DS, estilos) fica em "comum" e "site".
          output: {
            chunkFileNames: "assets/comum-[hash].js",
            assetFileNames: (a) => (a.names?.[0]?.endsWith(".css") ? "assets/site-[hash][extname]" : "assets/[name]-[hash][extname]"),
          },
        },
      },
}));
