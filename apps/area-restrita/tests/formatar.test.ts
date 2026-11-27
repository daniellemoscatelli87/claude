import { describe, expect, it } from "vitest";
import { diaCurto, iniciais, saudacao, segmentos, situacaoDaMensagem, textoPendentes } from "../src/lib/formatar";
import { linkDasMensagens, resumoDaLista } from "../src/dados/inicio";
import { mensagemDeErro } from "../src/telas/Acesso";
import { perfilDe, ehAdmin } from "../src/casca/sessao";

describe("textos da Início (iguais aos da página de HTML)", () => {
  it("saudação pelo horário, com o primeiro nome", () => {
    expect(saudacao("Dani Moscatelli", 9)).toBe("Bom dia, Dani!");
    expect(saudacao("Dani Moscatelli", 12)).toBe("Boa tarde, Dani!");
    expect(saudacao("Dani", 18)).toBe("Boa noite, Dani!");
  });
  it("situação da mensagem", () => {
    expect(situacaoDaMensagem({ visualizado_em: null, reuniao_em: "x" })).toBe("nao-lida");
    expect(situacaoDaMensagem({ visualizado_em: "x" })).toBe("lida");
    expect(situacaoDaMensagem({ visualizado_em: "x", respondido_em: "x" })).toBe("respondida");
    expect(situacaoDaMensagem({ visualizado_em: "x", respondido_em: "x", reuniao_em: "x" })).toBe("reuniao");
  });
  it("resumo das listas, pendentes e link das mensagens", () => {
    expect(resumoDaLista(1, "candidatura", "candidaturas")).toBe("1 candidatura");
    expect(resumoDaLista(40, "mensagem recebida", "mensagens recebidas")).toBe("40 mensagens recebidas · últimas 15");
    expect(textoPendentes(0)).toBe("Todas respondidas");
    expect(textoPendentes(1)).toBe("1 não respondida");
    expect(textoPendentes(3)).toBe("3 não respondidas");
    expect(linkDasMensagens(2)).toBe("/admin/contatos/?situacao=pendentes");
    expect(linkDasMensagens(0)).toBe("/admin/contatos/");
    expect(linkDasMensagens(null)).toBe("/admin/contatos/");
  });
  it("segmentos, iniciais e datas", () => {
    expect(segmentos(["Saúde.", "Varejo", "Educação", "Moda"])).toBe("Saúde, Varejo +2");
    expect(segmentos(null)).toBe("");
    expect(iniciais("ana maria souza")).toBe("AM");
    expect(iniciais("")).toBe("?");
    const agora = new Date(2026, 10, 27, 15, 0);
    expect(diaCurto(new Date(2026, 10, 27, 9, 5).toISOString(), agora)).toBe("Hoje, 09:05");
    expect(diaCurto(new Date(2026, 10, 26, 9, 5).toISOString(), agora)).toBe("Ontem");
  });
});

describe("acesso", () => {
  it("mensagens de erro do login", () => {
    expect(mensagemDeErro("Invalid login credentials")).toBe("E-mail ou senha incorretos.");
    expect(mensagemDeErro("Email rate limit exceeded")).toMatch(/Aguarde alguns minutos/);
  });
  it("perfil e papel de administradora", () => {
    expect(perfilDe(null)).toEqual({ nome: "Dani Moscatelli", foto: "/admin/avatar-dani.webp", email: "" });
    expect(perfilDe({ email: "A@B.com", user_metadata: { nome: " Ana ", avatar_url: "/f.webp" } } as never)).toEqual({ nome: "Ana", foto: "/f.webp", email: "a@b.com" });
    expect(ehAdmin({ user: { app_metadata: { role: "admin" } } } as never)).toBe(true);
    expect(ehAdmin({ user: { app_metadata: {} } } as never)).toBe(false);
  });
});
