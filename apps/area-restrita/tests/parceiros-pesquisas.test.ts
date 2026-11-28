import { describe, expect, it } from "vitest";
import { cidade, erroDoAgendamento, filtrar, FILTROS_VAZIOS, kpis, normalizarParaLista, paraQuem, rotuloEsp, uf, valorDaResposta, type Parceiro } from "../src/dados/parceiros";
import { notaGeral, ondeParou, textoResposta, valores, type Resposta } from "../src/dados/pesquisas";

const p = (x: Partial<Parceiro>): Parceiro => ({ id: "x", created_at: "2026-11-27T10:00:00Z", nome: "Ana", email: "ana@exemplo.com", empresa: null, ...x });

describe("parceiros (mesmas regras da página de HTML)", () => {
  it("cidade e estado", () => {
    expect(cidade("curitiba - PR")).toBe("Curitiba");
    expect(cidade("Embu-Guaçu/SP")).toBe("Embu-Guaçu");
    expect(cidade("são josé dos pinhais, PR")).toBe("São José dos Pinhais");
    expect(uf("Curitiba - PR")).toBe("PR");
  });
  it("rótulo curto da especialidade (até 40 caracteres)", () => {
    expect(rotuloEsp("UX writing.")).toBe("UX writing");
    expect(rotuloEsp("Pesquisa com usuários e testes de usabilidade em serviços de saúde").length).toBeLessThanOrEqual(41);
  });
  it("segmentos antigos contam no setor atual e a busca ignora acentos", () => {
    const l = [normalizarParaLista(p({ id: "a", segmentos: ["Clínicas e consultórios."], nome: "Fábio" })), normalizarParaLista(p({ id: "b", segmentos: ["Varejo."] }))];
    expect(l[0].segmentos).toEqual(["Saúde."]);
    expect(filtrar(l, "fabio", FILTROS_VAZIOS).map((r) => r.id)).toEqual(["a"]);
    expect(filtrar(l, "", { ...FILTROS_VAZIOS, segmentos: "Saúde." }).map((r) => r.id)).toEqual(["a"]);
  });
  it("números do topo: galeria visível só com autorização e sem ocultar", () => {
    const k = kpis([p({ galeria_status: "autorizado" }), p({ galeria_status: "autorizado", galeria_oculto: true })], 2);
    expect(k.find((x) => x.chave === "galeria")).toMatchObject({ valor: 1, rotulo: "Perfil visível na galeria", apoio: "A galeria aparece no site a partir de 3" });
  });
  it("agendamento: textos e conferência da data", () => {
    const todos = [p({ id: "a", nome: "Ana" }), p({ id: "b", nome: "Bia", galeria_status: "recusado" })];
    expect(paraQuem({ id: "1", agendado_para: "", modo: "todos", destinatarios: null, situacao: "agendado" }, todos)).toBe("Todos que ainda não decidiram (1): Ana");
    expect(paraQuem({ id: "1", agendado_para: "", modo: "selecionados", destinatarios: ["a", "z"], situacao: "agendado" }, todos)).toBe("2 pessoas: Ana, Parceiro excluído");
    expect(erroDoAgendamento([], new Date())).toBe("Marque pelo menos uma pessoa.");
    expect(erroDoAgendamento(["a"], new Date(Date.now() + 10_000))).toBe("Escolha uma data e hora a partir do próximo minuto.");
    expect(erroDoAgendamento(["a"], new Date(Date.now() + 120_000))).toBeNull();
  });
  it("respostas da candidatura: vazio, sim/não e link", () => {
    expect(valorDaResposta([])).toEqual({ tipo: "vazio", texto: "-" });
    expect(valorDaResposta(true).texto).toBe("Sim");
    expect(valorDaResposta("linkedin.com/in/ana")).toMatchObject({ tipo: "link", href: "https://linkedin.com/in/ana" });
  });
});

describe("pesquisas (mesmas regras da página de HTML)", () => {
  const r = (respostas: Record<string, unknown>, extra: Partial<Resposta> = {}) => ({ id: "1", envio_id: null, nome: null, email: null, whatsapp: null, created_at: "", situacao: "completa", respostas, relato: null, quer_novidades: null, visualizado_em: null, parou_em: null, atualizado_em: null, ...extra }) as Resposta;
  it("nota geral = média dos aspectos; respostas antigas com nota única", () => {
    expect(notaGeral(r({ q4: { qualidade: 8, estetica: 6, correspondencia: 4 } }))).toBe(6);
    expect(notaGeral(r({ q4: 9 }))).toBe(9);
  });
  it("valores, texto da resposta e onde parou", () => {
    expect(valores({ opcoes: ["a", "b"] })).toEqual(["a", "b"]);
    const q = { id: "q2", tipo: "ranking" as const, texto: "", opcoes: [{ id: "a", texto: "Lojas (especifique)" }, { id: "b", texto: "Online" }] };
    expect(textoResposta(q, ["b", "a"])).toBe("1º Online · 2º Lojas");
    const Q = { perguntas: [{ id: "q1", tipo: "unica" as const, texto: "" }, { id: "q1_1", rotulo: "1.1", tipo: "unica" as const, texto: "", condicao: { pergunta: "q1", opcoes: [] } }, { id: "q2", tipo: "unica" as const, texto: "" }] };
    expect(ondeParou(Q, r({}, { parou_em: "q2" }))).toBe("na pergunta 2");
    expect(ondeParou(Q, r({}, { parou_em: "q1_1" }))).toBe("na pergunta 1.1");
    expect(ondeParou(Q, r({}, { parou_em: "perfil" }))).toBe("na etapa Sobre você");
  });
});
