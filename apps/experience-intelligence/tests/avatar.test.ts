import { describe, expect, it } from "vitest";
import { iniciais } from "@/components/avatar";

describe("iniciais do avatar", () => {
  it("usa as duas primeiras partes do e-mail", () => {
    expect(iniciais("dani.moscatelli@exemplo.com")).toBe("DM");
  });
  it("usa as duas primeiras letras quando há uma parte só", () => {
    expect(iniciais("contato@danimoscatelli.com.br")).toBe("CO");
  });
  it("sem e-mail mostra interrogação", () => {
    expect(iniciais(undefined)).toBe("?");
  });
});
