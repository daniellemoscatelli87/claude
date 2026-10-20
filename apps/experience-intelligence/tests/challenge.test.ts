// Validação dos campos do Challenge Model (C2-09) e preservação do texto original (C2-02).
import { describe, expect, it } from "vitest";
import {
  ChallengeStructureSchema, OrganizationInputSchema, StatementSchema, buildStructurePayload, structureSource,
} from "@/domain/challenge/schemas";

const valida = {
  title: "Espera na recepção",
  desired_outcome: "Pessoas entendem o fluxo e esperam com menos dificuldade.",
  affected_people: ["pessoas atendidas", "equipe de recepção"],
  context: { industry: "saude", department: "recepcao", channels: ["presencial"], site: "unidade a confirmar" },
  known_information: ["há relatos de demora"],
  unknown_information: ["quanto tempo as pessoas esperam"],
};

describe("descrição original do desafio", () => {
  it("aceita uma descrição com pelo menos 10 caracteres", () => {
    expect(StatementSchema.safeParse("Muitas pessoas reclamam da espera na recepção.").success).toBe(true);
  });
  it("recusa descrição vazia ou curta demais", () => {
    expect(StatementSchema.safeParse("   ").success).toBe(false);
    expect(StatementSchema.safeParse("ruim").success).toBe(false);
  });
  it("recusa descrição acima de 4.000 caracteres", () => {
    expect(StatementSchema.safeParse("a".repeat(4001)).success).toBe(false);
  });
});

describe("estrutura do desafio", () => {
  it("aceita o exemplo da metodologia (seção 4.4)", () => {
    expect(ChallengeStructureSchema.safeParse(valida).success).toBe(true);
  });
  it("exige título entre 3 e 120 caracteres", () => {
    expect(ChallengeStructureSchema.safeParse({ ...valida, title: "ab" }).success).toBe(false);
    expect(ChallengeStructureSchema.safeParse({ ...valida, title: "x".repeat(121) }).success).toBe(false);
  });
  it("aceita campos vazios além do título (a pessoa pode não saber)", () => {
    const r = ChallengeStructureSchema.parse({ title: "Atendimento" });
    expect(r.affected_people).toEqual([]);
    expect(r.context.channels).toEqual([]);
    expect(r.desired_outcome).toBe("");
  });
  it("remove itens repetidos e espaços nas listas", () => {
    const r = ChallengeStructureSchema.parse({ ...valida, affected_people: [" equipe ", "equipe"] });
    expect(r.affected_people).toEqual(["equipe"]);
  });
  it("recusa campos desconhecidos", () => {
    expect(ChallengeStructureSchema.safeParse({ ...valida, causa: "falta de pessoal" }).success).toBe(false);
  });
});

describe("o texto original nunca entra na estrutura editável", () => {
  it("descarta original_statement enviado junto com a estrutura", () => {
    const payload = buildStructurePayload({ ...valida, original_statement: "TEXTO ADULTERADO" });
    expect(payload).not.toHaveProperty("original_statement");
    expect(payload.title).toBe(valida.title);
  });
});

describe("origem da estrutura confirmada", () => {
  const proposta = ChallengeStructureSchema.parse(valida);
  it("sem sugestão da IA é manual", () => {
    expect(structureSource(null, proposta)).toBe("manual");
  });
  it("sugestão aceita sem mudança", () => {
    expect(structureSource(proposta, ChallengeStructureSchema.parse({ ...valida }))).toBe("ai_accepted");
  });
  it("sugestão editada", () => {
    expect(structureSource(proposta, ChallengeStructureSchema.parse({ ...valida, title: "Outro nome" }))).toBe("ai_edited");
  });
});

describe("organização", () => {
  it("exige nome de 2 a 120 caracteres", () => {
    expect(OrganizationInputSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(OrganizationInputSchema.safeParse({ name: "Clínica Exemplo" }).success).toBe(true);
  });
  it("segmento é opcional", () => {
    expect(OrganizationInputSchema.parse({ name: "Clínica Exemplo", industry: "" }).industry).toBeUndefined();
  });
});
