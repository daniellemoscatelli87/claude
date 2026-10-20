import { describe, expect, it } from "vitest";
import { DisplayNameSchema, OrganizationSetupSchema, contextoIncompleto } from "@/domain/organization/context";

describe("contexto da organização", () => {
  it("só o nome é obrigatório", () => {
    const r = OrganizationSetupSchema.parse({ name: "Clínica Fictícia", industry: "", offering: "", org_type: "", size_band: "", job_area: "" });
    expect(r).toEqual({ name: "Clínica Fictícia", industry: undefined, offering: undefined, org_type: undefined, size_band: undefined, job_area: undefined });
  });
  it("recusa nome vazio com a mensagem do kit", () => {
    const r = OrganizationSetupSchema.safeParse({ name: " " });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Informe o nome da organização para continuar.");
  });
  it("recusa opção fora da lista e textos longos", () => {
    expect(OrganizationSetupSchema.safeParse({ name: "Org", size_band: "enorme" }).success).toBe(false);
    expect(OrganizationSetupSchema.safeParse({ name: "Org", offering: "x".repeat(201) }).success).toBe(false);
  });
  it("considera incompleto sem segmento e sem o que oferece", () => {
    expect(contextoIncompleto({ industry: null, offering: null })).toBe(true);
    expect(contextoIncompleto({ industry: "Saúde", offering: null })).toBe(false);
  });
});

describe("nome da pessoa", () => {
  it("é obrigatório, com 2 a 80 caracteres", () => {
    expect(DisplayNameSchema.safeParse("D").success).toBe(false);
    expect(DisplayNameSchema.parse("  Dani Moscatelli ")).toBe("Dani Moscatelli");
    expect(DisplayNameSchema.safeParse("x".repeat(81)).success).toBe(false);
  });
});
