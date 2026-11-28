import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cabecalhoHtml, GAVETA_HTML, rodapeHtml, rodapeCompactoHtml } from './src/compartilhado/partes.ts'

// Cores do design system Dani Moscatelli (D-064): as páginas originais em HTML mantêm a estrutura de antes, mas as
// cores vêm do DS. Este módulo lê o theme.css sincronizado (apps/site/src/styles/theme.css, nunca editado aqui) e
// entrega só as variáveis de cor do tema claro (--primary, --muted-foreground, --border, escalas…). Fontes, raios,
// sombras e tamanhos do DS ficam de fora, para não mudar o resto das páginas. Uso: import 'virtual:cores-ds.css'.
const CORES_DS = 'virtual:cores-ds.css'
const NOME_DE_COR = /^--((graphite|crimson)-\d+|background|foreground(-\w+)?|card(-foreground)?|popover(-foreground)?|primary(-[\w-]+)?|surface-tint|secondary(-\w+)?|disabled(-\w+)?|row-hover|muted(-foreground)?|accent(-foreground)?|border(-strong)?|(success|warning|error|info|violet|orange)(-\w+)?|input(-[\w-]+)?|switch-background|ring|destructive(-foreground)?|sobreposicao)$/
export function coresDoTema(css: string): string {
  const inicio = css.indexOf(':root {')
  const fim = css.indexOf('\n}', inicio)
  if (inicio < 0 || fim < 0) throw new Error('theme.css do DS sem o bloco :root')
  const linhas = css.slice(inicio, fim).replace(/\/\*[\s\S]*?\*\//g, '').split(';')
  const cores = linhas
    .map((l) => /(--[\w-]+)\s*:\s*([^;]+)$/.exec(l.trim()))
    .filter((m): m is RegExpExecArray => !!m && NOME_DE_COR.test(m[1]))
    .map((m) => `  ${m[1]}: ${m[2].trim()};`)
  if (!cores.some((l) => l.startsWith('  --primary:'))) throw new Error('theme.css do DS sem --primary')
  return `/* Cores do DS Dani Moscatelli (gerado de apps/site/src/styles/theme.css) */\n:root {\n${cores.join('\n')}\n}\n`
}
function coresDoDS(): Plugin {
  const arquivo = resolve(import.meta.dirname, 'apps/site/src/styles/theme.css')
  return {
    name: 'cores-ds',
    resolveId: (id) => (id === CORES_DS ? '\0' + CORES_DS : undefined),
    load(id) {
      if (id !== '\0' + CORES_DS) return
      this.addWatchFile(arquivo)
      return coresDoTema(readFileSync(arquivo, 'utf8'))
    },
  }
}

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
          .replace('<!-- @rodape:compacto -->', rodapeCompactoHtml())
          .replace(/<!-- @rodape:(claro|escuro) -->/g, (_, v) => rodapeHtml(v))
      },
    },
  }
}

// Páginas originais em HTML (D-064, fora do site em React).
// https://vite.dev/config/
export default defineConfig({
  plugins: [partesCompartilhadas(), coresDoDS(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        projetoPiloto: resolve(import.meta.dirname, 'projeto-piloto/index.html'),
        redeParceiros: resolve(import.meta.dirname, 'rede-parceiros/index.html'),
        redeParceirosCadastro: resolve(import.meta.dirname, 'rede-parceiros/cadastro/index.html'),
        pesquisaModa: resolve(import.meta.dirname, 'pesquisa/moda-curitiba/index.html'),
      },
    },
  },
})
