// Rede de Parceiros em React: os mesmos textos e links da página de HTML (a cabeça está em tests/cabeca.test.ts).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderizar } from "../src/servidor";
import { PAGINAS_DO_SITE } from "../src/rotas";
import { frasesDe, textoCorrido } from "./frases";

const html = readFileSync(new URL(`../../../${PAGINAS_DO_SITE.find((p) => p.id === "rede-parceiros")!.origem}`, import.meta.url), "utf8");
const principal = html.slice(html.indexOf("<main"), html.indexOf("</main>"));

// Diferenças de forma, de propósito (SITE_REACT.md, seção 6d): na simulação, as telas de exemplo deixam de ter
// campos e botões de mentira (Enviar cadastro, Buscar profissional, Entrar em contato, Enviar convite, Rejeitar,
// Confirmar, Escreva uma mensagem…, ×, Ver simulação) e as etapas intermediárias que só animavam ("Iniciando o match…",
// listas de opções repetidas); as iniciais dos avatares viram texto do Avatar do DS; "Saiba mais" vem do LinkSaibaMais.
const FORA = new Set([
  "Enviar cadastro", "Buscar profissional", "Iniciando o match…", "Entrar em contato", "Enviar convite", "Rejeitar", "Confirmar",
  "Escreva uma mensagem…", "Ver simulação", "Saiba mais", "LF", "1º", "2º", "3º", "4º", "Kickoff", "Product Designer", "Projeto", "1",
  "Entre 3 e 5 anos", "Mais de 10 anos",
]);
// A Simulacao do DS grava no HTML só a cena da etapa aberta; as outras cenas entram ao trocar de etapa. Os textos delas
// são conferidos no código das cenas.
const cenas = ["Cenas.tsx", "conteudo.tsx"].map((f) => readFileSync(new URL(`../src/paginas/rede-parceiros/${f}`, import.meta.url), "utf8")).join(" ").replace(/\s+/g, " ");

describe("Rede de Parceiros: mesmos textos", () => {
  const novo = textoCorrido(renderizar("rede-parceiros"));
  it("todas as frases da página de HTML estão na versão em React", () => {
    const faltando = [...new Set(frasesDe(principal))].filter((f) => !FORA.has(f) && !novo.includes(f) && !cenas.includes(f));
    expect(faltando).toEqual([]);
  });
  it("os mesmos links (cadastro, âncoras, grupo do WhatsApp, política e e-mail)", () => {
    const r = renderizar("rede-parceiros");
    for (const href of ["/rede-parceiros/cadastro/", "#quem", "#rede", "https://chat.whatsapp.com/BEg1Jxdjyg4E6HU5Rd3sNt", "/privacidade/", "mailto:contato@danimoscatelli.com.br"]) {
      expect(r).toContain(`href="${href}"`);
    }
    // o e-mail fica fora da ofuscação do Cloudflare (senão a página não hidrata)
    expect(r).toContain("<!--email_off-->");
  });
});
