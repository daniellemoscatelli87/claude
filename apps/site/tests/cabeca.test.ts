// A cabeça das páginas em React (título, descrição, canonical, compartilhamento, robots) é a mesma da página de HTML.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error módulo JavaScript sem tipos
import { enderecoDasFontes, montarCabeca, montarHtml, recursosDaEntrada } from "../scripts/montar-saida.mjs";
import { PAGINAS_DO_SITE, REACT } from "../src/rotas";

const decodificar = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Título, metas (menos charset e viewport) e canonical de um HTML, como texto comparável. */
function cabecaDe(html: string) {
  const cab = html.slice(0, html.indexOf("</head>"));
  const titulo = decodificar(/<title>([\s\S]*?)<\/title>/.exec(cab)?.[1] ?? "");
  const meta = [...cab.matchAll(/<meta\s+(name|property)="([^"]+)"\s+content="([^"]*)"/g)].filter((m) => m[2] !== "viewport").map((m) => `${m[1]} ${m[2]} = ${decodificar(m[3])}`).sort();
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(cab)?.[1] ?? null;
  const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(cab)?.[1];
  return { titulo, meta, canonical, jsonld: ld ? JSON.parse(ld) : null };
}

describe("cabeça igual à da página de HTML", () => {
  for (const id of Object.keys(REACT)) {
    const pagina = PAGINAS_DO_SITE.find((p) => p.id === id)!;
    it(id, () => {
      const antes = cabecaDe(readFileSync(new URL(`../../../${pagina.origem}`, import.meta.url), "utf8"));
      const agora = cabecaDe(montarCabeca(pagina.cabeca).join("\n") + "</head>");
      expect(agora).toEqual(antes);
    });
  }
});

describe("prévia", () => {
  it("nunca é indexada, mesmo quando a página publicada pode ser", () => {
    const priv = PAGINAS_DO_SITE.find((p) => p.id === "privacidade")!;
    expect(montarCabeca(priv.cabeca).join()).not.toContain("robots");
    expect(montarCabeca(priv.cabeca, { previa: true }).join()).toContain('<meta name="robots" content="noindex, nofollow">');
    const desc = PAGINAS_DO_SITE.find((p) => p.id === "descadastro")!;
    const linhas = montarCabeca(desc.cabeca, { previa: true }).filter((l: string) => l.includes("robots"));
    expect(linhas).toEqual(['<meta name="robots" content="noindex, nofollow">']);
  });
});

describe("HTML montado", () => {
  it("escapa os textos e liga CSS, pré-carregamentos e script da página", () => {
    const manifesto = {
      "src/paginas/x/entrada.tsx": { file: "assets/x-1.js", imports: ["_comum.js"], css: [] },
      "_comum.js": { file: "assets/comum-2.js", css: ["assets/site-3.css"] },
    };
    const recursos = recursosDaEntrada(manifesto, "src/paginas/x/entrada.tsx");
    expect(recursos).toEqual({ script: "assets/x-1.js", css: ["assets/site-3.css"], pre: ["assets/comum-2.js"] });
    const html = montarHtml({ cabeca: { titulo: 'A & "B"' }, previa: false, corpo: "<main>oi</main>", recursos, fontes: "https://f/?a=1&b=2" });
    expect(html).toContain("<title>A &amp; &quot;B&quot;</title>");
    expect(html).toContain('<link rel="stylesheet" crossorigin href="/site/assets/site-3.css">');
    expect(html).toContain('<link rel="modulepreload" crossorigin href="/site/assets/comum-2.js">');
    expect(html).toContain('<script type="module" crossorigin src="/site/assets/x-1.js"></script>');
    expect(html).toContain('<div id="raiz"><main>oi</main></div>');
    expect(html).toContain('href="https://f/?a=1&amp;b=2"');
  });
  it("lê o endereço das fontes do fonts.css sincronizado do DS", () => {
    const fontes = enderecoDasFontes(readFileSync(new URL("../src/styles/fonts.css", import.meta.url), "utf8"));
    expect(fontes).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans/);
  });
});
