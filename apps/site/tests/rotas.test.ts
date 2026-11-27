// Mapa de páginas do site e corte página a página (D-053).
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error módulo JavaScript sem tipos
import { arquivoDaPrevia, entradaDa, planoDeSaida } from "../scripts/montar-saida.mjs";
import rotas from "../src/rotas.json";
import { PAGINAS } from "../src/paginas/registro";
import { PAGINAS_DO_SITE, REACT } from "../src/rotas";

const raiz = (rel: string) => new URL(`../../../${rel}`, import.meta.url);

describe("mapa de páginas", () => {
  it("lista todas as páginas públicas de hoje, cada uma com o HTML que a serve", () => {
    expect(PAGINAS_DO_SITE.map((p) => p.id)).toEqual([
      "inicio", "projeto-piloto", "rede-parceiros", "rede-parceiros-cadastro", "galeria-autorizar", "pesquisa-moda",
      "privacidade", "descadastro", "erro-404", "experience-intelligence", "experience-intelligence-2", "experience-intelligence-3",
    ]);
    for (const p of PAGINAS_DO_SITE) expect(existsSync(raiz(p.origem)), p.origem).toBe(true);
  });
  it("cada página tem um lote do plano (S2 a S8)", () => {
    for (const p of PAGINAS_DO_SITE) expect(p.lote, p.id).toMatch(/^S[2-8]$/);
  });
  it("cada página em React tem componente, entrada e cabeça", () => {
    for (const id of Object.keys(REACT)) {
      expect(PAGINAS[id], id).toBeTypeOf("function");
      expect(existsSync(new URL(`../${entradaDa(id)}`, import.meta.url)), id).toBe(true);
      expect(PAGINAS_DO_SITE.find((p) => p.id === id)?.cabeca?.titulo, id).toBeTruthy();
    }
  });
});

describe("corte página a página", () => {
  it("prévia em /site/previa/<caminho>; a 404 em /site/previa/404/", () => {
    const porId = (id: string) => PAGINAS_DO_SITE.find((p) => p.id === id)!;
    expect(arquivoDaPrevia(porId("privacidade"))).toBe("site/previa/privacidade/index.html");
    expect(arquivoDaPrevia(porId("descadastro"))).toBe("site/previa/comunicados/descadastro/index.html");
    expect(arquivoDaPrevia(porId("erro-404"))).toBe("site/previa/404/index.html");
    expect(arquivoDaPrevia(porId("inicio"))).toBe("site/previa/index.html");
  });
  it("hoje: 404 e descadastro publicadas (no branch); privacidade em prévia (falta a Prosa no DS)", () => {
    expect(REACT).toEqual({ privacidade: "previa", descadastro: "publicada", "erro-404": "publicada" });
    expect(planoDeSaida(rotas).map((p: { arquivo: string }) => p.arquivo)).toEqual([
      "404.html", "comunicados/descadastro/index.html",
      "site/previa/404/index.html", "site/previa/comunicados/descadastro/index.html", "site/previa/privacidade/index.html",
    ]);
  });
  it("publicar grava também no lugar do HTML de hoje (mesmo endereço)", () => {
    const plano = planoDeSaida({ ...rotas, react: { "erro-404": "publicada", privacidade: "publicada" } });
    expect(plano.filter((p: { previa: boolean }) => !p.previa).map((p: { arquivo: string }) => p.arquivo)).toEqual(["404.html", "privacidade/index.html"]);
  });
  it("recusa página desconhecida, estado inválido e página sem cabeça", () => {
    expect(() => planoDeSaida({ ...rotas, react: { nada: "previa" } })).toThrow(/desconhecida/);
    expect(() => planoDeSaida({ ...rotas, react: { privacidade: "sim" } })).toThrow(/inválido/);
    expect(() => planoDeSaida({ ...rotas, react: { inicio: "previa" } })).toThrow(/sem "cabeca"/);
  });
});
