import { describe, expect, it } from "vitest";
import { CompleteProfileSchema, PersonalDataSchema, SignupSchema, dadosDoCadastro, formatarTelefone } from "@/domain/profile/personal";
import { AVISO_VERSAO } from "@/domain/privacy/aviso";

const valido = { full_name: "Pessoa Teste Fictícia", state: "PR", city: "Curitiba", phone: "(41) 99999-0000" };
const aceites = { adult_declared: true, privacy_accepted: true };
const conta = { email: "A@B.com", password: "senha1234", password_confirm: "senha1234" };

describe("dados pessoais (sem CPF e sem data de nascimento)", () => {
  it("normaliza o telefone para dígitos", () => {
    expect(PersonalDataSchema.parse(valido)).toMatchObject({ phone: "41999990000" });
  });
  it("pede nome completo, estado, cidade e telefone com DDD", () => {
    expect(PersonalDataSchema.safeParse({ ...valido, full_name: "Dani" }).success).toBe(false);
    expect(PersonalDataSchema.safeParse({ ...valido, state: "XX" }).error?.issues[0].message).toBe("Selecione o estado e a cidade.");
    expect(PersonalDataSchema.safeParse({ ...valido, phone: "4199" }).error?.issues[0].message).toBe("Informe o telefone com DDD.");
  });
  it("não tem campo de CPF nem de data de nascimento", () => {
    expect(Object.keys(PersonalDataSchema.shape)).toEqual(["full_name", "state", "city", "phone"]);
  });
  it("cadastro exige maioridade declarada e aceite do aviso", () => {
    const r = SignupSchema.safeParse({ ...valido, ...conta, adult_declared: false, privacy_accepted: false });
    const msgs = r.error?.issues.map((i) => i.message);
    expect(msgs).toContain("Confirme que você tem 18 anos ou mais.");
    expect(msgs).toContain("Aceite o aviso de privacidade para continuar.");
    expect(CompleteProfileSchema.safeParse({ ...valido, ...aceites }).success).toBe(true);
  });
  it("cadastro exige e-mail, senha com requisitos e confirmação igual", () => {
    expect(SignupSchema.safeParse({ ...valido, ...aceites, ...conta, email: "x" }).success).toBe(false);
    expect(SignupSchema.safeParse({ ...valido, ...aceites, ...conta, password: "12345678", password_confirm: "12345678" }).success).toBe(false);
    const diferente = SignupSchema.safeParse({ ...valido, ...aceites, ...conta, password_confirm: "outra1234" });
    expect(diferente.error?.issues[0]).toMatchObject({ path: ["password_confirm"], message: "As senhas não são iguais." });
    expect(SignupSchema.safeParse({ ...valido, ...aceites, ...conta }).data?.email).toBe("a@b.com");
  });
  it("o que vai na criação da conta leva a versão do aviso e nada de senha ou aceite em texto", () => {
    const d = dadosDoCadastro({ ...PersonalDataSchema.parse(valido), adult_declared: true });
    expect(d).toEqual({ full_name: "Pessoa Teste Fictícia", state: "PR", city: "Curitiba", phone: "41999990000", adult_declared: true, privacy_notice_version: AVISO_VERSAO });
  });
  it("formata o telefone para exibição", () => {
    expect(formatarTelefone("41999990000")).toBe("(41) 99999-0000");
  });
});
