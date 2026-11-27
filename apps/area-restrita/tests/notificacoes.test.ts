import { describe, expect, it } from "vitest";
import { montarNotificacoes, type Brutos } from "../src/dados/notificacoes";
import { criarArmazenamento, CHAVE_LEMBRAR } from "../src/lib/armazenamento";

const vazio: Brutos = {
  contatos: [], contatosCount: 0, parceiros: [], parceirosCount: 0, contatosVistos: [], parceirosVistos: [],
  emails: [], emailsCount: 0, emailsVistos: [], respostas: [], respostasCount: 0, respostasVistas: [], pesquisas: [], ultimaResposta: new Map(),
};

describe("notificações (mesmas regras de admin.js)", () => {
  it("junta tudo, mais nova primeiro, e soma os contadores", () => {
    const n = montarNotificacoes({
      ...vazio,
      contatos: [{ id: "c1", nome: "Ana", assunto: "Projeto", created_at: "2026-11-20T10:00:00Z" }], contatosCount: 1,
      ultimaResposta: new Map([["c1", "2026-11-26T10:00:00Z"]]),
      parceiros: [{ id: "p1", nome: "Bia", principal_especializacao: "UX", created_at: "2026-11-25T10:00:00Z" }], parceirosCount: 3,
      emails: [{ id: "e1", cadastro_id: "p9", assunto: "Boas-vindas", aberto_em: "2026-11-24T10:00:00Z", clicado_em: null, cadastros: { nome: "Caio" } }], emailsCount: 1,
      respostas: [{ pesquisa: "moda", nome: null, created_at: "2026-11-21T10:00:00Z", atualizado_em: "2026-11-27T10:00:00Z" }], respostasCount: 2,
      pesquisas: [{ slug: "moda", titulo: "Moda em Curitiba" }],
    });
    expect(n.total).toBe(7);
    expect(n.contadores).toEqual({ contatos: 1, parceiros: 3, emails: 1, projetos: 2 });
    expect(n.novas.map((a) => a.texto)).toEqual(["Alguém respondeu a pesquisa", "Nova resposta de Ana", "Nova candidatura de Bia", "Caio abriu o e-mail"]);
    expect(n.novas[0]).toMatchObject({ href: "/admin/pesquisas/?p=moda", detalhe: "Moda em Curitiba", tipo: "pesquisa" });
    expect(n.novas[3]).toMatchObject({ href: "/admin/parceiros/?id=p9#emails", tipo: "email-aberto" });
  });
  it("vistas: só e-mails abertos ou clicados, no máximo 30", () => {
    const muitos = Array.from({ length: 40 }, (_, i) => ({ id: "v" + i, nome: "X", created_at: new Date(2026, 10, 1 + (i % 25)).toISOString() }));
    const n = montarNotificacoes({ ...vazio, contatosVistos: muitos, emailsVistos: [{ id: "e", cadastro_id: "p", aberto_em: null, clicado_em: null }] });
    expect(n.vistas).toHaveLength(30);
    expect(n.vistas.every((a) => a.texto === "Mensagem de X")).toBe(true);
  });
});

describe("sessão guardada (mesma regra das páginas de HTML)", () => {
  const memoria = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m }; };
  it("Permanecer conectado: localStorage; desmarcado: sessionStorage", () => {
    const l = memoria(), s = memoria();
    const a = criarArmazenamento(l, s);
    expect(a.lembrar()).toBe(true);
    a.setItem("dm-admin-auth", "1");
    expect(l.m.get("dm-admin-auth")).toBe("1");
    a.definirLembrar(false);
    expect(l.m.get(CHAVE_LEMBRAR)).toBe("0");
    a.setItem("dm-admin-auth", "2");
    expect(s.m.get("dm-admin-auth")).toBe("2");
    expect(l.m.has("dm-admin-auth")).toBe(false);
    expect(a.getItem("dm-admin-auth")).toBe("2");
    a.removeItem("dm-admin-auth");
    expect(a.getItem("dm-admin-auth")).toBe(null);
  });
  it("sem armazenamento (navegação privada bloqueada), não quebra", () => {
    const quebra = { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); }, removeItem: () => { throw new Error("x"); } };
    const a = criarArmazenamento(quebra, quebra);
    expect(a.lembrar()).toBe(true);
    expect(a.getItem("k")).toBe(null);
    expect(() => a.setItem("k", "v")).not.toThrow();
  });
});
