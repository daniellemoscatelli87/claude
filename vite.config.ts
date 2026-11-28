import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// Páginas de HTML que ainda não foram para o site em React (apps/site, D-053): só a pesquisa de moda.
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        pesquisaModa: resolve(import.meta.dirname, 'pesquisa/moda-curitiba/index.html'),
      },
    },
  },
})
