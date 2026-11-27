// Regras das páginas dos lotes A2 a A4 (Lançamento, Configurações, Comunicados): as mesmas das páginas de HTML.
import { describe, expect, it } from "vitest";
import { linhasDaAba, resumoDoLancamento, TEXTO_PADRAO, type Cadastro } from "../src/telas/Lancamento";
import { AREAS, caminhoFoto, erroAuth, iconeDoLog } from "../src/telas/Configuracoes";
import { filtrar, limpa, opcoes, paraTexto, recebe, type Parceiro } from "../src/telas/Comunicados";

const c = (id: string, email: string, avisado: string | null = null): Cadastro => ({ id, email, created_at: "2026-11-20T10:00:00Z", avisado_em: avisado });

describe("Lançamento", () => {
  const todas = [c("1", "ana@exemplo.com"), c("2", "bruno@exemplo.com", "2026-11-21T10:00:00Z"), c("3", "carla@outro.com")];
  it("abas: Novas = sem aviso, Notificadas = avisadas; busca pelo e-mail", () => {
    expect(linhasDaAba(todas, "novas", "").linhas.map((r) => r.id)).toEqual(["1", "3"]);
    expect(linhasDaAba(todas, "avisadas", "").linhas.map((r) => r.id)).toEqual(["2"]);
    expect(linhasDaAba(todas, "novas", " OUTRO ").linhas.map((r) => r.id)).toEqual(["3"]);
  });
  it("estados vazios com os textos da página de HTML", () => {
    expect(linhasDaAba(todas, "novas", "zzz").vazio).toBe("Nenhum e-mail encontrado.");
    expect(linhasDaAba([], "novas", "").vazio).toBe("Ninguém se cadastrou para o lançamento ainda.");
    expect(linhasDaAba([todas[1]], "novas", "").vazio).toBe("Todas as pessoas já foram notificadas.");
    expect(linhasDaAba([todas[0]], "avisadas", "").vazio).toBe("Ninguém foi notificado ainda.");
  });
  it("resumo e texto padrão do e-mail", () => {
    expect(resumoDoLancamento(todas)).toBe("3 pessoas cadastradas para o aviso de lançamento · 1 já avisada");
    expect(resumoDoLancamento([todas[0]])).toBe("1 pessoa cadastrada para o aviso de lançamento");
    expect(TEXTO_PADRAO.assunto).toBe("Lançamento do site Dani Moscatelli - Experience Design Studio");
    expect(TEXTO_PADRAO.mensagem.split("\n\n")).toHaveLength(5);
  });
});

describe("Configurações", () => {
  it("erros do login traduzidos", () => {
    expect(erroAuth("Email rate limit exceeded")).toMatch(/Muitas tentativas/);
    expect(erroAuth("New password should be different from the old password.")).toBe("A nova senha precisa ser diferente da atual.");
    expect(erroAuth("A user with this email address has already been registered")).toBe("Esse e-mail já está em uso.");
    expect(erroAuth("x")).toBe("Não foi possível concluir: x");
  });
  it("foto: só a enviada ao bucket é apagada", () => {
    expect(caminhoFoto("https://x.supabase.co/storage/v1/object/public/perfil/avatar-1.webp?t=2")).toBe("avatar-1.webp");
    expect(caminhoFoto("/admin/avatar-dani.webp")).toBeNull();
  });
  it("ícone do log: exclusões na base rosa, o resto pelo assunto", () => {
    expect(iconeDoLog("Apagou os dados de Contatos").exclusao).toBe(true);
    expect(iconeDoLog("Disparou o e-mail de lançamento").icone.displayName).toMatch(/Rocket/);
    expect(iconeDoLog("Entrou na área restrita").exclusao).toBe(false);
  });
  it("áreas da gestão de dados: textos e quando ficam sem nada para apagar", () => {
    const n = { contatos: 1, reunioes: 0, parceiros: 0, lancamento: 2 };
    expect(AREAS.map((a) => a.desc(n))).toEqual(["1 mensagem e 0 reuniões", "0 cadastros na Rede de Parceiros", "2 e-mails cadastrados para o aviso de lançamento"]);
    expect(AREAS.map((a) => a.vazia(n))).toEqual([false, true, false]);
  });
});

describe("Comunicados", () => {
  const p = (id: string, nome: string, extra: Partial<Parceiro> = {}): Parceiro => ({ id, nome, email: nome.toLowerCase() + "@exemplo.com", principal_especializacao: null, areas_experiencia: [], segmentos: [], comunicados_descadastro_em: null, ...extra });
  const lista = [
    p("1", "Ana", { areas_experiencia: ["Pesquisa."], segmentos: ["Saúde"] }),
    p("2", "Bruno", { areas_experiencia: ["UX writing"], segmentos: ["Varejo"], principal_especializacao: "Pesquisa com usuários" }),
    p("3", "Carla", { comunicados_descadastro_em: "2026-11-01" }),
    p("4", "Davi", { email: null }),
  ];
  it("filtros por área (sem ponto final), segmento e busca", () => {
    expect(filtrar(lista, { busca: "", area: "Pesquisa", segmento: "" }).map((r) => r.id)).toEqual(["1"]);
    expect(filtrar(lista, { busca: "", area: "", segmento: "Varejo" }).map((r) => r.id)).toEqual(["2"]);
    expect(filtrar(lista, { busca: "pesquisa", area: "", segmento: "" }).map((r) => r.id)).toEqual(["2"]);
  });
  it("quem recebe: com e-mail e sem descadastro", () => {
    expect(lista.map(recebe)).toEqual([true, true, false, false]);
  });
  it("opções sem repetição e em ordem; Para: com 'e mais'", () => {
    expect(opcoes(["Varejo.", "Saúde", "Varejo", null])).toEqual(["Saúde", "Varejo"]);
    expect(limpa("Saúde. ")).toBe("Saúde");
    expect(paraTexto(["1", "2", "3", "x"], lista, 3)).toBe("Ana, Bruno, Carla e mais 1");
    expect(paraTexto(["x"], lista, 3)).toBe("Parceiro excluído");
    expect(paraTexto([], lista, 3)).toBe("Ninguém recebeu");
  });
});
