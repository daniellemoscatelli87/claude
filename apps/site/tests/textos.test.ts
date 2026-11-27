// Os textos das páginas em React são os mesmos das páginas de HTML (o HTML pronto, gravado pelo build).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderizar } from "../src/servidor";

const antes = (rel: string) => readFileSync(new URL(`../../../public/${rel}`, import.meta.url), "utf8");

/** Texto visível de um pedaço de HTML: sem comentários, scripts, estilos e marcas; espaços normalizados. */
function texto(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/ ([.,;:)])/g, "$1")
    .replace(/\( /g, "(")
    .trim();
}
const trecho = (html: string, abre: RegExp, fecha: string) => {
  const i = html.search(abre);
  return html.slice(i, html.indexOf(fecha, i) + fecha.length);
};

describe("mesmos textos", () => {
  it("Política de Privacidade: o artigo inteiro, palavra por palavra", () => {
    const novo = renderizar("privacidade");
    const esperado = texto(trecho(antes("privacidade/index.html"), /<article/, "</article>"));
    expect(esperado.length).toBeGreaterThan(5000);
    expect(texto(trecho(novo, /<article/, "</article>"))).toBe(esperado);
  });
  it("Política de Privacidade: cabeçalho e rodapé com os mesmos links", () => {
    const novo = renderizar("privacidade");
    expect(novo).toContain(">Voltar ao site</a>");
    expect(novo).toContain("© 2026 Dani Moscatelli • Experience Design Studio. Todos os direitos reservados.");
    for (const t of ["Curitiba - PR", "Preferências de cookies", 'href="/admin/"', "Área restrita"]) expect(novo).toContain(t);
    // os e-mails continuam fora da ofuscação do Cloudflare
    expect(novo.match(/<!--email_off-->/g)?.length).toBe(4);
  });
  it("404: os mesmos textos e o mesmo link", () => {
    const novo = renderizar("erro-404");
    expect(texto(novo)).toBe(texto(trecho(antes("404.html"), /<main>/, "</main>")));
    expect(novo).toContain('href="/"');
  });
  it("Descadastro: os mesmos textos ao abrir (o botão só liga depois de conferir o link)", () => {
    const novo = renderizar("descadastro");
    const pedir = texto(trecho(antes("comunicados/descadastro/index.html"), /<section id="pedir">/, "</section>"));
    expect(pedir).toMatch(/^Deixar de receber comunicados Confirme .+ Confirmar$/);
    expect(texto(novo)).toBe(pedir);
    expect(novo).toMatch(/<button[^>]*disabled/);
    expect(novo).toContain('aria-label="Ir para a página inicial"');
  });
});
