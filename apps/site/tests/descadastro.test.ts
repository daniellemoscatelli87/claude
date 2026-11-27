import { describe, expect, it, vi } from "vitest";
import { ENDERECO, ERRO_GENERICO, lerToken, pedirDescadastro, tokenValido } from "../src/paginas/descadastro/descadastro";

const T = "123e4567-e89b-12d3-a456-426614174000";
const resposta = (ok: boolean, corpo: unknown) => Promise.resolve({ ok, json: () => Promise.resolve(corpo) } as Response);

describe("link do e-mail", () => {
  it("lê o ?t= e aceita só um identificador no formato do cadastro", () => {
    expect(lerToken(`?t=${T}`)).toBe(T);
    expect(lerToken("")).toBe("");
    expect(tokenValido(T)).toBe(true);
    expect(tokenValido(T.toUpperCase())).toBe(true);
    expect(tokenValido("abc")).toBe(false);
    expect(tokenValido(`${T}x`)).toBe(false);
  });
});

describe("pedido de descadastro", () => {
  it("manda o token para a função do Supabase, como a página de HTML", async () => {
    const buscar = vi.fn(() => resposta(true, { ok: true }));
    await pedirDescadastro(T, buscar as unknown as typeof fetch);
    expect(buscar).toHaveBeenCalledWith(ENDERECO, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: T }) });
  });
  it("mostra a mensagem do servidor ou a mensagem padrão", async () => {
    await expect(pedirDescadastro(T, (() => resposta(false, { error: "Link expirado." })) as unknown as typeof fetch)).rejects.toThrow("Link expirado.");
    await expect(pedirDescadastro(T, (() => resposta(false, {})) as unknown as typeof fetch)).rejects.toThrow(ERRO_GENERICO);
    await expect(pedirDescadastro(T, (() => Promise.reject(new Error("rede"))) as unknown as typeof fetch)).rejects.toThrow(ERRO_GENERICO);
  });
});
