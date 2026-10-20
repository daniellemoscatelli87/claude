import { describe, expect, it } from "vitest";
import { EMAIL_RE, forcaSenha, maskPhone, requisitosSenha, sugestoesEmail } from "@/design-system/padroes";

describe("padrões de campos do site", () => {
  it("máscara de telefone igual à do site", () => {
    expect(maskPhone("4")).toBe("(4");
    expect(maskPhone("41")).toBe("(41");
    expect(maskPhone("41999")).toBe("(41) 999");
    expect(maskPhone("4133330000")).toBe("(41) 3333-0000");
    expect(maskPhone("41999990000")).toBe("(41) 99999-0000");
    expect(maskPhone("4199999000099")).toBe("(41) 99999-0000");
  });
  it("sugestões de e-mail iguais às do site", () => {
    expect(sugestoesEmail("dani")).toEqual(["dani@gmail.com", "dani@outlook.com", "dani@hotmail.com", "dani@icloud.com"]);
    expect(sugestoesEmail("dani@g")).toEqual(["dani@gmail.com"]);
    expect(sugestoesEmail("dani@gmail.com")).toEqual([]);
    expect(sugestoesEmail("da ni")).toEqual([]);
  });
  it("mesma validação de e-mail", () => {
    expect(EMAIL_RE.test("a@b.com")).toBe(true);
    expect(EMAIL_RE.test("a@b")).toBe(false);
  });
  it("força da senha", () => {
    expect(forcaSenha("").nivel).toBe(0);
    expect(forcaSenha("abcdefgh").rotulo).toBe("Fraca");
    expect(forcaSenha("abcdefg1").rotulo).toBe("Média");
    expect(forcaSenha("Abcdefg1!xyz").rotulo).toBe("Forte");
    expect(requisitosSenha("abc1").map((r) => r.ok)).toEqual([false, true]);
  });
});
