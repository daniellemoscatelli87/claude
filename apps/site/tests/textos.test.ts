// Os textos das páginas em React são os mesmos das páginas de HTML (o HTML pronto, gravado pelo build).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderizar } from "../src/servidor";

import { PAGINAS_DO_SITE } from "../src/rotas";

/** O HTML de antes de cada página (em public/ ou, depois de publicada e conferida, em tests/referencia/). */
const antes = (id: string) => readFileSync(new URL(`../../../${PAGINAS_DO_SITE.find((p) => p.id === id)!.origem}`, import.meta.url), "utf8");

/** Texto visível de um pedaço de HTML: sem comentários, scripts, estilos, partes escondidas (aria-hidden, medidas
 * invisíveis do BotaoDeEnvio) e marcas; espaços normalizados. */
function texto(html: string) {
  let h = html;
  // tira elementos aria-hidden sem filhos do mesmo tipo (spans e svgs decorativos)
  for (let i = 0; i < 5; i++) h = h.replace(/<(span|svg|p|div)\b[^>]*aria-hidden="true"[^>]*>(?:(?!<\1\b)[\s\S])*?<\/\1>/g, "");
  return h
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
    const esperado = texto(trecho(antes("privacidade"), /<article/, "</article>"));
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
  it("404: os mesmos textos e o mesmo link, no card da PaginaDeErro abaixo do cabeçalho (D-064)", () => {
    const novo = renderizar("erro-404");
    const card = texto(trecho(novo, /<main[^>]*data-slot="pagina-de-erro"[^>]*>/, "</main>"));
    expect(texto(trecho(antes("erro-404"), /<main>/, "</main>"))).toBe("Erro 404 Página não encontrada O endereço pode ter mudado ou não existe mais. Ir para a página inicial");
    expect(card).toBe("Erro 404 Página não encontrada O endereço pode ter mudado ou não existe mais. Ir para a página inicial");
    expect(novo).toContain('data-moldura="card"');
    expect(novo).toContain('data-slot="cabecalho-do-site"');
    expect(novo).toContain('href="/"');
  });
  it("Descadastro: antes de ler o código do link, nem formulário nem botão desligado (D-064)", () => {
    const novo = renderizar("descadastro");
    expect(texto(trecho(antes("descadastro"), /<section id="pedir">/, "</section>"))).toMatch(/^Deixar de receber comunicados Confirme .+ Confirmar$/);
    expect(novo).toContain('aria-busy="true"');
    expect(novo).not.toMatch(/<button[^>]*disabled/);
    expect(novo).not.toContain("Confirmar");
  });
});
