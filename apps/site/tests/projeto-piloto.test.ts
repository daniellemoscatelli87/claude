// Programa Projeto Piloto em React: os mesmos textos da página de HTML e as mesmas regras do cadastro.
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderizar } from "../src/servidor";
import { CADASTRO_VAZIO, linhaDoCadastro, mensagemGeral, validarCadastro } from "../src/paginas/projeto-piloto/cadastro";
import { inserir } from "../src/compartilhado/site/supabase";
import { frasesDe, textoCorrido } from "./frases";

const html = readFileSync(new URL("../../../projeto-piloto/index.html", import.meta.url), "utf8");
const principal = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
const gaveta = html.slice(html.indexOf('<aside id="cadastro-gaveta"'), html.indexOf("</aside>", html.indexOf('<aside id="cadastro-gaveta"')));

// Diferenças de forma, de propósito (ver SITE_REACT.md, seção 6): o link escondido do hero sai (era focável sem
// aparecer) e o "Saiba mais" vem do LinkSaibaMais do DS.
const FORA = new Set(["Cadastrar empresa", "Saiba mais"]);

describe("Projeto Piloto: mesmos textos", () => {
  const novo = textoCorrido(renderizar("projeto-piloto"));
  it("todas as frases da página de HTML estão na versão em React", () => {
    const faltando = frasesDe(principal).filter((f) => !FORA.has(f) && !novo.includes(f));
    expect(faltando).toEqual([]);
  });
  it("o cadastro tem os mesmos rótulos e textos", () => {
    // a gaveta só aparece aberta; os textos dela estão no código da gaveta
    const codigo = readFileSync(new URL("../src/paginas/projeto-piloto/GavetaDeCadastro.tsx", import.meta.url), "utf8") + readFileSync(new URL("../src/paginas/projeto-piloto/conteudo.tsx", import.meta.url), "utf8");
    const corrido = codigo.replace(/\s+/g, " ");
    const faltando = frasesDe(gaveta)
      .map((f) => f.replace(/ \*$/, ""))
      .filter((f) => !["*", "asterisco", "(abre em nova aba)", "Política de Privacidade (abre em nova aba)"].includes(f) && !corrido.includes(f));
    expect(faltando).toEqual([]);
  });
});

describe("Projeto Piloto: cadastro", () => {
  it("valida como a página de HTML", () => {
    const e = validarCadastro(CADASTRO_VAZIO);
    expect(Object.keys(e).sort()).toEqual(["cidade", "consentimento", "email", "empresa", "nome", "segmento", "telefone"]);
    expect(mensagemGeral(1)).toBe("Corrija o campo destacado para continuar.");
    expect(mensagemGeral(7)).toBe("Corrija os 7 campos destacados para continuar.");
    const ok = { ...CADASTRO_VAZIO, nome: "Ana", email: "ana@empresa.com", telefone: "(41) 99999-9999", empresa: "X", segmento: "Pet", cidade: "Curitiba / PR", consentimento: true };
    expect(validarCadastro(ok)).toEqual({});
    expect(validarCadastro({ ...ok, desafio: "a".repeat(2001) }).desafio).toBe("Use no máximo 2.000 caracteres.");
  });
  it("grava as mesmas colunas, com o identificador do envio", () => {
    const ok = { ...CADASTRO_VAZIO, nome: " Ana ", email: "ana@empresa.com", telefone: "(41) 99999-9999", empresa: "X", segmento: "Pet", cidade: "Curitiba / PR", consentimento: true };
    expect(linhaDoCadastro(ok, "id-1")).toEqual({ envio_id: "id-1", nome: "Ana", email: "ana@empresa.com", telefone: "(41) 99999-9999", empresa: "X", segmento: "Pet", cidade_estado: "Curitiba / PR", desafio: null, frente: null, consentimento: true });
  });
  it("um reenvio já gravado (409) conta como sucesso", async () => {
    const buscar = vi.fn(() => Promise.resolve({ ok: false, status: 409 } as Response));
    await expect(inserir("parceiro_piloto", {}, { aceitarRepetido: true, buscar: buscar as unknown as typeof fetch })).resolves.toBeUndefined();
    await expect(inserir("parceiro_piloto", {}, { buscar: buscar as unknown as typeof fetch })).rejects.toThrow("HTTP 409");
  });
});
