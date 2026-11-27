#!/usr/bin/env node
// Verificação automática de conformidade com o Design System Dani Moscatelli na área restrita em React (D-051).
// Mesma verificação do produto FindLook (scripts/conformidade/verificar.mjs de lá, decisão da dona do produto de
// 27/11/2026), com três ajustes para este DS:
// - a paleta "pink" do Tailwind também é proibida (as escalas deste DS são graphite e crimson);
// - sombra parada em card é proibida (D-041: cards sobre o fundo cinza só com borda); sombra só em hover ou foco;
// - componente do produto com o mesmo nome de um componente do DS (lido da pasta ui sincronizada) conta como duplicado.
//
// Procura, no código do app (fora dos arquivos sincronizados do design system), o que foge do design system:
// cores soltas, valores arbitrários do Tailwind, elementos HTML que o design system já tem como componente e
// componentes feitos à mão que duplicam um do design system.
//
// Catraca: a dívida está registrada em apps/area-restrita/conformidade-base.json (contagem por arquivo e por regra).
// A área restrita em React começou em zero (27/11/2026) e precisa continuar em zero: qualquer desvio falha. A catraca
// fica igual à da FindLook para o caso de a dona do produto aceitar, um dia, uma exceção registrada.
//
// Uso:
//   npm run conformidade               confere com a base
//   npm run conformidade:atualizar     baixa a base depois de uma melhora (nunca sobe)
//   node scripts/conformidade/verificar.mjs --json   lista todas as ocorrências (para o inventário)
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/* ── Regras ────────────────────────────────────────────────────────────────────────────────────────────────────── */

export const REGRAS = {
  "cor-solta": {
    nome: "Cor solta (hexadecimal, rgb, hsl)",
    troca: "um token de cor do theme.css (bg-primary, text-muted-foreground, var(--token))",
  },
  "tw-cor": {
    nome: "Cor arbitrária do Tailwind (bg-[#…], text-[rgb(…)], color-mix)",
    troca: "a classe do token (bg-primary, border-border) ou bg-[var(--token)]",
  },
  "cor-paleta-tailwind": {
    nome: "Cor da paleta padrão do Tailwind (gray-…, red-…, blue-…)",
    troca: "um token de cor do theme.css (as escalas do design system são pink e graphite)",
  },
  "tw-texto": {
    nome: "Tamanho de texto arbitrário (text-[…])",
    troca: "a escala de texto (text-xs, text-sm, text-base…) ou o componente Heading",
  },
  "tw-raio": {
    nome: "Raio arbitrário (rounded-[…])",
    troca: "rounded-sm, rounded-md, rounded-lg, rounded-xl ou rounded-full (tokens --radius)",
  },
  "tw-sombra": {
    nome: "Sombra arbitrária (shadow-[…])",
    troca: "shadow-xs, shadow-sm, shadow-md ou shadow-lg (tokens --shadow)",
  },
  "tw-espaco": {
    nome: "Espaçamento arbitrário (p-[…], m-[…], gap-[…])",
    troca: "a escala de espaçamento (p-4, gap-2, mt-6…)",
  },
  "sombra-parada": {
    nome: "Sombra parada (shadow, shadow-sm…)",
    troca: "card só com borda sobre o fundo cinza (D-041); sombra só em hover: ou focus: (shadow-xs)",
  },
  "html-button": { nome: "<button> solto", troca: "Button (src/components/ui/button.tsx)" },
  "html-input": {
    nome: "<input> solto",
    troca: "Input, Checkbox, RadioGroup, Switch, Slider, Upload ou PasswordField",
  },
  "html-select": { nome: "<select> solto", troca: "Select (src/components/ui/select.tsx)" },
  "html-textarea": { nome: "<textarea> solto", troca: "Textarea (src/components/ui/textarea.tsx)" },
  "componente-duplicado": {
    nome: "Componente feito à mão que o design system já tem",
    troca: "o componente do design system indicado em cada linha",
  },
};

/**
 * Componentes do produto que duplicam um do design system (conferidos um a um em 27/11/2026).
 * Contam a definição e cada uso (<Nome ...>). Para acrescentar um, confira antes que o do design system
 * faz o mesmo papel; os parecidos, mas não iguais, ficam como lacuna em docs/produto/CONFORMIDADE_DS.md.
 */
export const DUPLICADOS = [
  // Peças feitas à mão nas páginas de HTML (public/admin/) que o DS já tem: não podem voltar na versão em React.
  { componente: "Toast", ds: "Toaster e toast() (ui/sonner.tsx)" },
  { componente: "ConfirmDialog", ds: "AlertDialog (ui/alert-dialog.tsx)" },
  { componente: "RowLink", ds: "LinhaDeLista (ui/linha-de-lista.tsx)" },
];

/** Pasta do app, relativa à raiz do repositório. */
export const APP = "apps/area-restrita";

const EXTENSOES = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);
const COM_JSX = new Set([".tsx", ".jsx"]);

const PROP_RAIO = /^rounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?$/;
const PROP_SOMBRA = /^(?:shadow|drop-shadow|inset-shadow|text-shadow)$/;
const PROP_ESPACO = /^(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)$/;
// Paletas padrão do Tailwind que o design system não define (pink e graphite são tokens; orange e violet só sem número).
const PALETA_TAILWIND = /(?<![\w-])(?:bg|text|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow)-(?:(?:slate|gray|zinc|neutral|stone|red|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|purple|fuchsia|pink|rose)-\d{2,3}|(?:orange|violet)-\d{2,3})(?![\w-])/g;
// Sombra parada: shadow ou shadow-xs…2xl sem variante (hover:, focus:…) antes. shadow-none e shadow-[var(--x)] ficam de fora.
const SOMBRA_PARADA = /(?<=^|["'`\s{])shadow(?:-(?:xs|sm|md|lg|xl|2xl))?(?=$|["'`\s}])/gm;
const PROP_COR = /^(?:bg|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent)$/;

/** Valor que é só um token: var(--x), com ou sem dica de tipo (color:var(--x), length:var(--x)). */
export const ehToken = (v) => /^(?:[a-z-]+:)?var\(--[\w-]+(?:,[^\]]*)?\)$/.test(v);
const ehCor = (v) => /^(?:color:)?(?:#|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|hwb\(|color-mix\()/i.test(v);

/** Troca comentários por espaços (mantendo as quebras de linha, para as linhas continuarem certas). */
export function semComentarios(texto, css = false) {
  const branco = (m) => m.replace(/[^\n]/g, " ");
  let s = texto.replace(/\/\*[\s\S]*?\*\//g, branco);
  if (!css) s = s.replace(/(^|[^:"'`\w\\])(\/\/.*)$/gm, (_, antes, com) => antes + branco(com));
  return s;
}

const linhaDe = (texto, indice) => texto.slice(0, indice).split("\n").length;

/** Todas as ocorrências de desvio em um texto. `caminho` define as regras que valem (CSS não tem JSX). */
export function analisarTexto(texto, caminho = "arquivo.tsx", nomesDoDs = []) {
  const ext = caminho.slice(caminho.lastIndexOf("."));
  const css = ext === ".css";
  const s = semComentarios(texto, css);
  const ocorrencias = [];
  const add = (regra, indice, trecho) => ocorrencias.push({ regra, linha: linhaDe(s, indice), trecho });

  // 1) Classes do Tailwind com valor arbitrário: prop-[valor]. Guarda os trechos para a cor solta não contar duas vezes.
  const dentroDeClasse = [];
  const classe = /(?<![\w-])(-?)([a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)*)-\[([^\]\s"'`]+)\]/g;
  for (const m of s.matchAll(classe)) {
    const [inteiro, , prop, valor] = m;
    dentroDeClasse.push([m.index, m.index + inteiro.length]);
    if (ehToken(valor)) continue;
    let regra = null;
    if (prop === "text") regra = ehCor(valor) ? "tw-cor" : "tw-texto";
    else if (PROP_RAIO.test(prop)) regra = "tw-raio";
    else if (PROP_SOMBRA.test(prop)) regra = "tw-sombra";
    else if (PROP_ESPACO.test(prop)) regra = "tw-espaco";
    else if (PROP_COR.test(prop) && ehCor(valor)) regra = "tw-cor";
    if (regra) add(regra, m.index, inteiro);
  }
  const emClasse = (i) => dentroDeClasse.some(([a, b]) => i >= a && i < b);

  for (const m of s.matchAll(PALETA_TAILWIND)) add("cor-paleta-tailwind", m.index, m[0]);
  if (!css) for (const m of s.matchAll(SOMBRA_PARADA)) add("sombra-parada", m.index, m[0]);

  // 2) Cores soltas: #hex e funções de cor sem token.
  for (const m of s.matchAll(/(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g)) {
    if (!emClasse(m.index)) add("cor-solta", m.index, m[0]);
  }
  for (const m of s.matchAll(/\b(?:rgba?|hsla?|oklch|oklab|hwb|lab|lch|color-mix)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) {
    if (!emClasse(m.index) && !m[1].includes("var(--")) add("cor-solta", m.index, m[0]);
  }

  if (COM_JSX.has(ext)) {
    // 3) Elementos HTML que o design system tem como componente.
    for (const m of s.matchAll(/<(button|input|select|textarea)(?=[\s>/])/g)) add(`html-${m[1]}`, m.index, m[0]);
    // 4) Componentes feitos à mão que duplicam um do design system.
    for (const { componente, ds } of DUPLICADOS) {
      const uso = new RegExp(`<${componente}(?=[\\s>/])`, "g");
      const definicao = new RegExp(`\\b(?:function|const|let|class)\\s+${componente}\\b`, "g");
      for (const m of [...s.matchAll(uso), ...s.matchAll(definicao)]) add("componente-duplicado", m.index, `${m[0]} (use ${ds})`);
    }
    // 5) Componente do produto com o nome de um componente do DS (definir de novo um Card, um Badge…).
    for (const nome of nomesDoDs) {
      const definicao = new RegExp(`\\b(?:function|const|let|class)\\s+${nome}\\b`, "g");
      for (const m of s.matchAll(definicao)) add("componente-duplicado", m.index, `${m[0]} (já existe no DS: use o ${nome} da pasta ui)`);
    }
  }
  return ocorrencias.sort((a, b) => a.linha - b.linha);
}

/* ── Arquivos ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Destinos no produto da lista design-system/arquivos.txt: pastas inteiras (terminam com /) e arquivos avulsos. */
export function lerSincronizados(textoDaLista) {
  const pastas = [];
  const arquivos = new Set();
  for (const bruta of textoDaLista.split("\n")) {
    const [origem, destino] = bruta.trim().split(/\s+/);
    if (!origem || origem.startsWith("#") || origem === "excluir" || !destino) continue;
    if (destino.endsWith("/")) pastas.push(destino);
    else arquivos.add(destino);
  }
  return { pastas, arquivos, inclui: (rel) => arquivos.has(rel) || pastas.some((p) => rel.startsWith(p)) };
}

/** Arquivos de código do app em <app>/src/, fora dos sincronizados. Caminhos relativos à raiz do repositório, com "/". */
export function coletarArquivos(raiz, sincronizados, app = APP) {
  const lista = [];
  const andar = (pasta) => {
    for (const nome of readdirSync(pasta).sort()) {
      const cheio = join(pasta, nome);
      if (statSync(cheio).isDirectory()) andar(cheio);
      else {
        const rel = relative(raiz, cheio).split(sep).join("/");
        const ext = nome.slice(nome.lastIndexOf("."));
        if (EXTENSOES.has(ext) && !sincronizados.inclui(rel)) lista.push(rel);
      }
    }
  };
  if (existsSync(join(raiz, app, "src"))) andar(join(raiz, app, "src"));
  return lista;
}

/** Nomes dos componentes exportados pela pasta ui sincronizada (começam com maiúscula). */
export function nomesDoDesignSystem(raiz, app = APP) {
  const pasta = join(raiz, app, "src", "components", "ui");
  if (!existsSync(pasta)) return [];
  const nomes = new Set();
  for (const nome of readdirSync(pasta)) {
    if (!/\.tsx?$/.test(nome)) continue;
    const texto = readFileSync(join(pasta, nome), "utf8");
    for (const m of texto.matchAll(/export\s+(?:function|const)\s+([A-Z]\w*)/g)) nomes.add(m[1]);
    for (const m of texto.matchAll(/export\s*\{([^}]*)\}/g)) for (const n of m[1].split(",")) { const x = n.trim().split(/\s+as\s+/).pop(); if (x && /^[A-Z]\w*$/.test(x)) nomes.add(x); }
  }
  return [...nomes].sort();
}

/** Ocorrências e contagens de todo o produto. */
export function analisarProduto(raiz, app = APP) {
  const lista = join(raiz, "design-system", "arquivos.txt");
  const sincronizados = lerSincronizados(existsSync(lista) ? readFileSync(lista, "utf8") : "");
  const arquivos = coletarArquivos(raiz, sincronizados, app);
  const nomes = nomesDoDesignSystem(raiz, app);
  const ocorrencias = {};
  const contagem = {};
  for (const rel of arquivos) {
    const achadas = analisarTexto(readFileSync(join(raiz, rel), "utf8"), rel, nomes);
    if (!achadas.length) continue;
    ocorrencias[rel] = achadas;
    contagem[rel] = {};
    for (const { regra } of achadas) contagem[rel][regra] = (contagem[rel][regra] ?? 0) + 1;
  }
  return { arquivos, ocorrencias, contagem };
}

/* ── Catraca ───────────────────────────────────────────────────────────────────────────────────────────────────── */

export function totais(contagem) {
  const t = Object.fromEntries(Object.keys(REGRAS).map((r) => [r, 0]));
  for (const porRegra of Object.values(contagem)) for (const [r, n] of Object.entries(porRegra)) t[r] = (t[r] ?? 0) + n;
  return t;
}

/** Compara a contagem atual com a base: o que piorou (subiu ou é novo) e o que melhorou (desceu ou sumiu). */
export function comparar(base, atual) {
  const piorou = [];
  const melhorou = [];
  const nomes = new Set([...Object.keys(base), ...Object.keys(atual)]);
  for (const arquivo of [...nomes].sort()) {
    const b = base[arquivo] ?? {};
    const a = atual[arquivo] ?? {};
    for (const regra of new Set([...Object.keys(b), ...Object.keys(a)])) {
      const antes = b[regra] ?? 0;
      const agora = a[regra] ?? 0;
      if (agora > antes) piorou.push({ arquivo, regra, antes, agora });
      else if (agora < antes) melhorou.push({ arquivo, regra, antes, agora });
    }
  }
  return { piorou, melhorou };
}

/** Base em JSON com chaves em ordem, para o diff ficar limpo. */
export function montarBase(contagem) {
  const arquivos = {};
  for (const arquivo of Object.keys(contagem).sort()) {
    arquivos[arquivo] = Object.fromEntries(Object.entries(contagem[arquivo]).sort(([a], [b]) => a.localeCompare(b)));
  }
  return {
    _leia: "Catraca da conformidade da área restrita em React com o Design System Dani Moscatelli: contagem de desvios por arquivo e regra. Começou em zero (27/11/2026) e só desce. Gerado por npm run conformidade:atualizar; ver docs/engineering/ADMIN_REACT.md.",
    total: totais(contagem),
    arquivos,
  };
}

const nomeDa = (regra) => REGRAS[regra]?.nome ?? regra;

/** Relatório em português. */
export function relatorio({ arquivos, ocorrencias, contagem }, base, { piorou, melhorou }) {
  const tb = totais(base);
  const ta = totais(contagem);
  const linhas = [];
  linhas.push("Conformidade da área restrita em React com o Design System Dani Moscatelli");
  linhas.push(`${arquivos.length} arquivos do app verificados (os sincronizados do design system ficam de fora).`);
  linhas.push("");
  const largura = Math.max(...Object.keys(REGRAS).map((r) => nomeDa(r).length)) + 2;
  linhas.push(`${"Regra".padEnd(largura)}${"Base".padStart(7)}${"Agora".padStart(7)}`);
  let somaB = 0;
  let somaA = 0;
  for (const regra of Object.keys(REGRAS)) {
    somaB += tb[regra] ?? 0;
    somaA += ta[regra] ?? 0;
    linhas.push(`${nomeDa(regra).padEnd(largura)}${String(tb[regra] ?? 0).padStart(7)}${String(ta[regra] ?? 0).padStart(7)}`);
  }
  linhas.push(`${"Total".padEnd(largura)}${String(somaB).padStart(7)}${String(somaA).padStart(7)}`);
  linhas.push("");

  if (piorou.length) {
    const porArquivo = Map.groupBy(piorou, (p) => p.arquivo);
    linhas.push(`FALHOU: ${piorou.length} ${piorou.length === 1 ? "regra piorou" : "regras pioraram"} em ${porArquivo.size} ${porArquivo.size === 1 ? "arquivo" : "arquivos"}.`);
    linhas.push("A área restrita não pode ganhar desvios do design system. Troque pelo que o design system oferece (ou proponha a peça no DS, propostas/README.md):");
    for (const [arquivo, itens] of porArquivo) {
      linhas.push("");
      linhas.push(`  ${arquivo}${itens.every((i) => i.antes === 0) && !base[arquivo] ? " (arquivo novo)" : ""}`);
      for (const { regra, antes, agora } of itens) {
        linhas.push(`    ${nomeDa(regra)}: ${antes} -> ${agora} (+${agora - antes}). Use: ${REGRAS[regra]?.troca ?? "o componente do design system"}.`);
        for (const o of (ocorrencias[arquivo] ?? []).filter((x) => x.regra === regra)) linhas.push(`      linha ${o.linha}: ${o.trecho}`);
      }
    }
    linhas.push("");
  }
  if (melhorou.length) {
    linhas.push(`Melhorou: ${melhorou.length} ${melhorou.length === 1 ? "contagem desceu" : "contagens desceram"}:`);
    for (const { arquivo, regra, antes, agora } of melhorou) linhas.push(`  ${arquivo}: ${nomeDa(regra)} ${antes} -> ${agora}`);
    if (!piorou.length) {
      linhas.push("");
      linhas.push('FALHOU: a base precisa descer junto. Rode "npm run conformidade:atualizar" e inclua apps/area-restrita/conformidade-base.json no commit.');
    }
    linhas.push("");
  }
  if (!piorou.length && !melhorou.length) linhas.push("OK: dentro da base. Nenhum desvio novo do design system.");
  return linhas.join("\n");
}

/* ── Linha de comando ──────────────────────────────────────────────────────────────────────────────────────────── */

export function executar(raiz, argumentos = [], app = APP) {
  const caminhoBase = join(raiz, app, "conformidade-base.json");
  const analise = analisarProduto(raiz, app);
  if (argumentos.includes("--json")) return { codigo: 0, saida: JSON.stringify(analise, null, 2) };

  const base = existsSync(caminhoBase) ? JSON.parse(readFileSync(caminhoBase, "utf8")).arquivos ?? {} : {};
  const diferenca = comparar(base, analise.contagem);

  if (argumentos.includes("--atualizar")) {
    if (diferenca.piorou.length && existsSync(caminhoBase)) {
      return {
        codigo: 1,
        saida: `${relatorio(analise, base, diferenca)}\nA base não foi alterada: ela só desce. Corrija os desvios novos antes.`,
      };
    }
    writeFileSync(caminhoBase, `${JSON.stringify(montarBase(analise.contagem), null, 2)}\n`);
    const soma = Object.values(totais(analise.contagem)).reduce((a, b) => a + b, 0);
    return { codigo: 0, saida: `Base gravada em ${app}/conformidade-base.json (${soma} desvios em ${Object.keys(analise.contagem).length} arquivos).` };
  }
  const codigo = diferenca.piorou.length || diferenca.melhorou.length ? 1 : 0;
  return { codigo, saida: relatorio(analise, base, diferenca) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const raiz = fileURLToPath(new URL("../../../..", import.meta.url));
  const { codigo, saida } = executar(raiz, process.argv.slice(2));
  console.log(saida);
  process.exit(codigo);
}
