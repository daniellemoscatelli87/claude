import { describe, expect, it } from "vitest";
import { PersonalDataSchema, PersonalEditSchema, SignupSchema, cpfValido, formatarCpf, formatarTelefone, maiorDeIdade } from "@/domain/profile/personal";

const valido = { full_name: "Pessoa Teste Fictícia", cpf: "529.982.247-25", birth_date: "1990-05-10", state: "PR", city: "Curitiba", phone: "(41) 99999-0000" };

describe("dados pessoais", () => {
  it("valida CPF pelos dígitos verificadores", () => {
    expect(cpfValido("52998224725")).toBe(true);
    expect(cpfValido("52998224724")).toBe(false);
    expect(cpfValido("111.111.111-11")).toBe(false);
  });
  it("exige maioridade", () => {
    const hoje = new Date(2026, 9, 21);
    expect(maiorDeIdade("2008-10-21", hoje)).toBe(true);
    expect(maiorDeIdade("2008-10-22", hoje)).toBe(false);
    expect(maiorDeIdade("1899-01-01", hoje)).toBe(false);
  });
  it("normaliza CPF e telefone para dígitos", () => {
    expect(PersonalDataSchema.parse(valido)).toMatchObject({ cpf: "52998224725", phone: "41999990000" });
  });
  it("pede nome completo", () => {
    expect(PersonalDataSchema.safeParse({ ...valido, full_name: "Dani" }).success).toBe(false);
  });
  it("cadastro exige e-mail, senha com requisitos e confirmação igual", () => {
    const conta = { email: "A@B.com", password: "senha1234", password_confirm: "senha1234" };
    expect(SignupSchema.safeParse({ ...valido, ...conta, email: "x" }).success).toBe(false);
    expect(SignupSchema.safeParse({ ...valido, ...conta, password: "12345678", password_confirm: "12345678" }).success).toBe(false);
    const diferente = SignupSchema.safeParse({ ...valido, ...conta, password_confirm: "outra1234" });
    expect(diferente.error?.issues[0]).toMatchObject({ path: ["password_confirm"], message: "As senhas não são iguais." });
    expect(SignupSchema.safeParse({ ...valido, ...conta }).data?.email).toBe("a@b.com");
  });
  it("na edição o CPF pode ficar em branco", () => {
    expect(PersonalEditSchema.safeParse({ ...valido, cpf: "" }).success).toBe(true);
  });
  it("formata para exibição", () => {
    expect(formatarCpf("52998224725")).toBe("529.982.247-25");
    expect(formatarTelefone("41999990000")).toBe("(41) 99999-0000");
    expect(formatarTelefone("4133330000")).toBe("(41) 3333-0000");
    expect(PersonalDataSchema.safeParse({ ...valido, state: "XX" }).error?.issues[0].message).toBe("Selecione o estado e a cidade.");
  });
});
