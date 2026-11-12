import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { cabecalhoHtml, GAVETA_HTML } from './src/compartilhado/partes.ts'

// Insere o cabeçalho e a gaveta de contato compartilhados em cada página (mesmo HTML no site todo).
function partesCompartilhadas(): Plugin {
  return {
    name: 'partes-compartilhadas',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(/<!-- @cabecalho:(inicio|projeto|parceiros) -->/g, (_, p) => cabecalhoHtml(p))
          .replace('<!-- @gaveta -->', GAVETA_HTML)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [partesCompartilhadas(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        projetoPiloto: resolve(import.meta.dirname, 'projeto-piloto/index.html'),
        redeParceiros: resolve(import.meta.dirname, 'rede-parceiros/index.html'),
      },
    },
  },
})
