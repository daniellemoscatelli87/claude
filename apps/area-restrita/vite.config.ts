import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Área restrita em React (D-051). Mesmo conjunto de ferramentas do Design System Dani Moscatelli
// (Vite 6, React 18.3 e Tailwind v4 pelo plugin do Vite), para os componentes do DS rodarem como no site dele.
// Os arquivos ficam em /admin/app/ (scripts/montar-saida.mjs copia para o dist do site e publica as rotas).
export default defineConfig({
  base: "/admin/app/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // O cliente do Supabase em arquivo próprio: muda pouco e fica no cache do navegador entre as publicações.
    // (Dividir também React e Radix cria dependência circular entre os pedaços e quebra a página.)
    rollupOptions: { output: { manualChunks: (id) => (id.includes("node_modules/@supabase") ? "supabase" : undefined) } },
    chunkSizeWarningLimit: 600,
  },
});
