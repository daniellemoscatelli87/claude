// Próxima pergunta contextual (C2-05) e "não sei" como resposta válida (C2-06, AC-02).
import { describe, expect, it } from "vitest";
import { FRAMING_QUESTIONS, framingProgress, nextFramingQuestion, openItems, type QuestionAnswer } from "@/domain/challenge/framing";
import type { Challenge } from "@/domain/challenge/schemas";

function desafio(over: Partial<Challenge> = {}): Challenge {
  return {
    id: "c1", organization_id: "o1", owner_id: "u1", title: "Espera na recepção",
    original_statement: "Muitas pessoas reclamam da espera na recepção.", current_problem_statement: null,
    desired_outcome: null, affected_people: [], context_json: { channels: [] }, known_information: [], unknown_information: [],
    structure_status: "confirmed", current_phase: "framing", status: "active", risk_level: null,
    created_at: "", updated_at: "", ...over,
  };
}
const resp = (key: string, status: QuestionAnswer["status"] = "answered"): QuestionAnswer =>
  ({ question_key: key, status, answer_summary: status === "answered" ? "x" : null, unknown_route: status === "answered" ? null : "find" });

describe("próxima pergunta", () => {
  it("não pergunta nada antes de a estrutura ser confirmada", () => {
    expect(nextFramingQuestion(desafio({ structure_status: "pending" }), [])).toBeNull();
  });
  it("começa por quem vive a situação", () => {
    expect(nextFramingQuestion(desafio(), [])?.key).toBe("pessoas_afetadas");
  });
  it("pula o que a estrutura confirmada já responde", () => {
    const c = desafio({ affected_people: ["pessoas atendidas"], context_json: { channels: [], site: "Unidade Centro" } });
    expect(nextFramingQuestion(c, [])?.key).toBe("sinal_inicial");
  });
  it("uma pergunta por vez, na ordem, até terminar", () => {
    const vistas: string[] = [];
    const respostas: QuestionAnswer[] = [];
    for (let q = nextFramingQuestion(desafio(), respostas); q; q = nextFramingQuestion(desafio(), respostas)) {
      vistas.push(q.key);
      respostas.push(resp(q.key));
    }
    expect(vistas).toEqual(FRAMING_QUESTIONS.map((q) => q.key));
  });
  it("\"não sei\" conta como resposta válida e avança", () => {
    expect(nextFramingQuestion(desafio(), [resp("pessoas_afetadas", "unknown")])?.key).toBe("local");
  });
});

describe("\"não sei\" oferece alternativas práticas", () => {
  it("toda pergunta tem as quatro rotas: encontrar, descobrir na prática, pedir ajuda e deixar para depois", () => {
    for (const q of FRAMING_QUESTIONS) {
      expect(q.unknown.map((o) => o.route)).toEqual(["find", "produce", "ask", "pending"]);
      for (const o of q.unknown) expect(o.instruction.length).toBeGreaterThan(20);
    }
  });
  it("as instruções não pedem dados pessoais", () => {
    const textos = FRAMING_QUESTIONS.flatMap((q) => q.unknown.map((o) => o.instruction)).join(" ").toLowerCase();
    expect(textos).not.toMatch(/\b(cpf|prontuário|telefone d[ao]s? pacientes?)\b/);
  });
  it("respostas \"não sei\" e adiadas continuam visíveis como pendências", () => {
    const itens = openItems([resp("local", "unknown"), resp("escopo", "pending"), resp("sinal_inicial")]);
    expect(itens.map((i) => i.question.key)).toEqual(["local", "escopo"]);
  });
});

describe("linguagem simples", () => {
  it("as perguntas não usam termos de metodologia", () => {
    const textos = FRAMING_QUESTIONS.map((q) => `${q.wording} ${q.help} ${q.unknown.map((o) => o.instruction).join(" ")}`).join(" ").toLowerCase();
    expect(textos).not.toMatch(/service design|blueprint|persona|stakeholder|jornada|framing|discovery|insight/);
  });
  it("as perguntas não sugerem soluções digitais", () => {
    const textos = FRAMING_QUESTIONS.map((q) => `${q.wording} ${q.help}`).join(" ").toLowerCase();
    expect(textos).not.toMatch(/aplicativo|totem|sistema novo|app\b/);
  });
});

describe("progresso", () => {
  it("conta o que foi respondido e o que a estrutura já cobre", () => {
    const c = desafio({ affected_people: ["equipe"] });
    expect(framingProgress(c, [resp("local")])).toEqual({ done: 2, total: FRAMING_QUESTIONS.length });
  });
});
