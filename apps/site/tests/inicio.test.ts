// Página inicial em React: os mesmos textos da página de HTML, a mesma cabeça (tests/cabeca.test.ts) e as mesmas
// regras do "Notificar lançamento".
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderizar } from "../src/servidor";
import { PAGINAS_DO_SITE } from "../src/rotas";
import { gravarAvisoDeLancamento, validarEmailDoAviso } from "../src/paginas/inicio/notificar";
import { DEPOIMENTOS } from "../src/paginas/inicio/conteudo";
import { frasesDe, textoCorrido } from "./frases";

const html = readFileSync(new URL(`../../../${PAGINAS_DO_SITE.find((p) => p.id === "inicio")!.origem}`, import.meta.url), "utf8");
const principal = html.slice(html.indexOf("<main"), html.indexOf("</main>"));

// Diferenças de forma, de propósito (ver SITE_REACT.md, seção 6c): as setas "‹ ›" viram botões com ícone e nome
// acessível; "Ler artigo" fica dentro do card inteiro clicável (o link é o título); as estrelas e o emoji das
// etiquetas viram ícones; as aspas dos depoimentos viram o ícone do CardDeDepoimento; "Saiba mais" vem do LinkSaibaMais.
const FORA = new Set(["‹", "›", "Ler artigo", "★", "Saiba mais"]);
// As aspas dos depoimentos viram o ícone de aspas do CardDeDepoimento.
const semEmoji = (f: string) => f.replace(/^\p{Extended_Pictographic}\s*/u, "").replace(/^“|”$/g, "");

describe("Início: mesmos textos", () => {
  const novo = textoCorrido(renderizar("inicio"));
  it("todas as frases da página de HTML estão na versão em React", () => {
    const faltando = frasesDe(principal).map(semEmoji).filter((f) => !FORA.has(f) && !novo.includes(f));
    expect(faltando).toEqual([]);
  });
  it("os 21 depoimentos, na mesma ordem", () => {
    expect(DEPOIMENTOS).toHaveLength(21);
    const nomes = [...principal.matchAll(/<h3 class="text-sm font-bold text-graphite-900">([^<]+)<\/h3>/g)].map((m) => m[1]);
    expect(DEPOIMENTOS.map((d) => d.nome)).toEqual(nomes);
  });
  it("os mesmos links das redes e do LinkedIn, com os mesmos eventos", () => {
    const codigo = readFileSync(new URL("../src/paginas/inicio/Inicio.tsx", import.meta.url), "utf8");
    for (const [href, rede] of [...principal.matchAll(/href="([^"]+)"[^>]*onclick="[^"]*rede: '([a-z_]+)'/g)].map((m) => [m[1], m[2]])) {
      expect(codigo).toContain(`href: "${href}"`);
      expect(codigo).toContain(`rede: "${rede}"`);
    }
    expect(renderizar("inicio")).toContain('href="https://www.linkedin.com/in/danimoscatelli/"');
  });
});

describe("Início: Notificar lançamento", () => {
  it("valida o e-mail como a página de HTML", () => {
    expect(validarEmailDoAviso("")).toBe("Informe um e-mail válido.");
    expect(validarEmailDoAviso("ana@empresa")).toBe("Informe um e-mail válido.");
    expect(validarEmailDoAviso(" ana@empresa.com.br ")).toBeNull();
  });
  it("grava só o e-mail em notificacoes_lancamento", async () => {
    const buscar = vi.fn((_url: string, _init: RequestInit) => Promise.resolve({ ok: true, status: 201 } as Response));
    await gravarAvisoDeLancamento(" ana@empresa.com.br ", buscar as unknown as typeof fetch);
    expect(buscar.mock.calls[0][0]).toMatch(/\/rest\/v1\/notificacoes_lancamento$/);
    expect(JSON.parse(buscar.mock.calls[0][1].body as string)).toEqual({ email: "ana@empresa.com.br" });
  });
});
