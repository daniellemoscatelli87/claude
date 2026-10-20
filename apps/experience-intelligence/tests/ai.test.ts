import { describe, expect, it } from "vitest";
import { canRetryInterpretation, interpretationFailure } from "@/application/challenges";

describe("respostas da função da IA", () => {
  it("reconhece os códigos de bloqueio do servidor", () => {
    expect(interpretationFailure("limite")).toBe("limite");
    expect(interpretationFailure("desativado")).toBe("desativado");
    expect(interpretationFailure("sem_acesso")).toBe("sem_acesso");
  });
  it("qualquer outro código vira falha", () => {
    expect(interpretationFailure("confirmado")).toBe("falha");
    expect(interpretationFailure(undefined)).toBe("falha");
  });
  it("só oferece tentar de novo quando isso pode funcionar", () => {
    expect(canRetryInterpretation("ocupado")).toBe(true);
    expect(canRetryInterpretation("falha")).toBe(true);
    expect(canRetryInterpretation("limite")).toBe(false);
    expect(canRetryInterpretation("desativado")).toBe(false);
    expect(canRetryInterpretation("sem_acesso")).toBe(false);
    expect(canRetryInterpretation("sem_chave")).toBe(false);
  });
});
