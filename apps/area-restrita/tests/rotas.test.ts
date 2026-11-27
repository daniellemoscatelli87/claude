import { describe, expect, it } from "vitest";
import { baseDoRoteador, destino, PAGINAS, REACT, resolverHref, todasAsPaginas } from "../src/rotas";
// @ts-expect-error módulo JavaScript sem tipos
import { planoDeSaida } from "../scripts/montar-saida.mjs";
import rotas from "../src/rotas.json";

describe("menu", () => {
  it("tem os itens de hoje, na ordem de hoje", () => {
    expect(PAGINAS.map((p) => p.rotulo)).toEqual(["Início", "Contato", "Reuniões", "Parceiros", "Projetos", "Lançamento"]);
    expect(PAGINAS.find((p) => p.id === "parceiros")?.sub?.map((s) => s.rotulo)).toEqual(["Perfis e candidaturas", "Comunicados"]);
    expect(PAGINAS.find((p) => p.id === "projetos")?.sub?.map((s) => s.rotulo)).toEqual(["Pesquisas"]);
  });
  it("cada página aponta para uma pasta que existe em public/admin", async () => {
    const { existsSync } = await import("node:fs");
    for (const p of todasAsPaginas()) expect(existsSync(new URL(`../../../public/admin/${p.caminho}index.html`, import.meta.url)), p.id).toBe(true);
  });
});

describe("corte página a página", () => {
  it("base: prévia em /admin/app; depois do corte, /admin", () => {
    expect(baseDoRoteador("/admin/app/")).toBe("/admin/app");
    expect(baseDoRoteador("/admin/app")).toBe("/admin/app");
    expect(baseDoRoteador("/admin/")).toBe("/admin");
    expect(baseDoRoteador("/admin/apparel/")).toBe("/admin");
  });
  it("na prévia, página em React navega por dentro; as outras abrem o HTML", () => {
    const r = { inicio: "previa" as const };
    expect(destino("inicio", "/admin/app", r)).toEqual({ interno: true, href: "/" });
    expect(destino("contatos", "/admin/app", r)).toEqual({ interno: false, href: "/admin/contatos/" });
    // em /admin, só a publicada é React
    expect(destino("inicio", "/admin", r)).toEqual({ interno: false, href: "/admin/" });
    expect(destino("inicio", "/admin", { inicio: "publicada" })).toEqual({ interno: true, href: "/" });
  });
  it("links de dados mantêm a busca e o âncora", () => {
    expect(resolverHref("/admin/contatos/?id=7", "/admin/app", { contatos: "previa" })).toEqual({ interno: true, href: "/contatos/?id=7" });
    expect(resolverHref("/admin/parceiros/?id=1#emails", "/admin/app", {})).toEqual({ interno: false, href: "/admin/parceiros/?id=1#emails" });
    expect(resolverHref("https://exemplo.com/", "/admin", {})).toEqual({ interno: false, href: "https://exemplo.com/" });
  });
  it("hoje: Início, Lançamento, Configurações e Comunicados publicadas (substituem as de HTML só no dist); Contato em prévia", () => {
    expect(REACT).toEqual({ inicio: "publicada", lancamento: "publicada", configuracoes: "publicada", comunicados: "publicada", contatos: "previa" });
    expect(planoDeSaida(rotas)).toEqual(["app/comunicados/index.html", "app/configuracoes/index.html", "app/contatos/index.html", "app/index.html", "app/lancamento/index.html", "comunicados/index.html", "configuracoes/index.html", "index.html", "lancamento/index.html"]);
  });
  it("publicar uma página grava o index também no lugar da de HTML", () => {
    expect(planoDeSaida({ ...rotas, react: { inicio: "publicada", contatos: "previa" } })).toEqual(["app/contatos/index.html", "app/index.html", "index.html"]);
    expect(() => planoDeSaida({ ...rotas, react: { nada: "previa" } })).toThrow(/desconhecida/);
    expect(() => planoDeSaida({ ...rotas, react: { inicio: "sim" } })).toThrow(/inválido/);
  });
});
