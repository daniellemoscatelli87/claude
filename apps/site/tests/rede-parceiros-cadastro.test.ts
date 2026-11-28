// Cadastro na Rede de Parceiros em React: as mesmas perguntas, regras, mensagens, tabela e textos da página de HTML
// (cópia em tests/referencia/rede-parceiros-cadastro.html). A cabeça está em tests/cabeca.test.ts.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderizar } from "../src/servidor";
import { ESTADOS_DO_BRASIL } from "../src/components/ui/campo-estado-cidade";
import { mascaraTelefone } from "../src/components/ui/campo";
import { AUT_DADOS, AUT_GALERIA, PJ_NO, SECTIONS, WHATSAPP_GROUP } from "../src/paginas/rede-parceiros-cadastro/conteudo";
import {
  EMAIL_DUP_MSG, OUTRO_SEM_TEXTO, PERGUNTAS, errosDaEtapa, lerRascunho, payload, primeiroNome, textoDoConsentimento, textoDoHtml, validar, value, visible,
  type Respostas,
} from "../src/paginas/rede-parceiros-cadastro/cadastro";
import { frasesDe, textoCorrido } from "./frases";

const html = readFileSync(new URL("./referencia/rede-parceiros-cadastro.html", import.meta.url), "utf8");
const fonte = ["CadastroDeParceiro.tsx", "Perguntas.tsx"].map((f) => readFileSync(new URL(`../src/paginas/rede-parceiros-cadastro/${f}`, import.meta.url), "utf8")).join(" ").replace(/\s+/g, " ");

// O script da página de HTML, rodado aqui para comparar: as perguntas (SECTIONS), os estados e a máscara de telefone.
const script = html.slice(html.indexOf("const PJ_NO"), html.indexOf('const form = document.getElementById("form");'));
const mascara = /function maskPhone[\s\S]*?\n}\n/.exec(html)![0];
const original = new Function(`const WHATSAPP_GROUP = ${JSON.stringify(WHATSAPP_GROUP)}; const WA_ICON = ""; ${script} ${mascara} return { SECTIONS, ESTADOS, AUT_DADOS, AUT_GALERIA, PJ_NO, maskPhone };`)();
const semFuncoes = (x: unknown) => JSON.parse(JSON.stringify(x));

describe("Cadastro de parceiro: as mesmas perguntas", () => {
  it("as 40 perguntas, na mesma ordem, com os mesmos textos, tipos, opções, ajudas e regras", () => {
    expect(PERGUNTAS).toHaveLength(40);
    expect(semFuncoes(SECTIONS)).toEqual(semFuncoes(original.SECTIONS));
    expect([AUT_DADOS, AUT_GALERIA, PJ_NO]).toEqual([original.AUT_DADOS, original.AUT_GALERIA, original.PJ_NO]);
  });
  it("as perguntas que dependem de outra seguem a mesma condição", () => {
    const orig = original.SECTIONS.flatMap((s: { questions: unknown[] }) => s.questions) as { id: string; showIf?: { test: (v: string) => boolean }; afterIf?: (v: string) => boolean }[];
    for (const q of PERGUNTAS.filter((x) => x.showIf || x.afterIf)) {
      const o = orig.find((x) => x.id === q.id)!;
      for (const v of ["Sim, frequentemente.", "Sim, possuo site profissional.", "Não tenho experiência ou interesse nesse formato.", "", "Ainda não possuo portfólio estruturado."]) {
        if (q.showIf) expect(q.showIf.test(v)).toBe(o.showIf!.test(v));
        if (q.afterIf) expect(q.afterIf(v)).toBe(o.afterIf!(v));
      }
    }
  });
  it("os estados do DS são os mesmos 27 da página de HTML, e a máscara de telefone dá o mesmo resultado", () => {
    expect(ESTADOS_DO_BRASIL).toEqual(original.ESTADOS);
    for (const t of ["4", "41", "4199", "419974", "4133334444", "41997485414", "41 99748-5414 99"]) expect(mascaraTelefone(t)).toBe(original.maskPhone(t));
  });
});

const completo = (): Respostas => ({
  nome: "  maria   da silva ", email: "Maria@Exemplo.com", telefone: "(41) 99748-5414", cidade_estado: { uf: "PR", cidade: "Curitiba" },
  linkedin: "https://www.linkedin.com/in/maria", apresentacao: "Designer.", atuacao_pj: "Estou em processo de formalização.",
  modelo_atuacao: ["Outro.", "Freelancer especializado(a)."], modelo_atuacao__outro: "Mentora", formas_colaboracao: ["Consultoria estratégica."],
  disponibilidade_colaborar: "Disponibilidade imediata.", areas_experiencia: ["UX Research.", "Service Design."], principal_especializacao: "Service Design",
  atividades_entregaveis: ["Jornadas", " ", "Blueprints "], etapas_projeto: ["Ideação e cocriação de soluções."], segmentos: ["Saúde."],
  colaboracao_multidisciplinar: "Ainda não, mas tenho interesse.", experiencia_colaboracao: "não vale (pergunta escondida)",
  nivel_formacao: "Mestrado.", formacao: ["Design, UFPR"], idiomas: [{ idioma: "Inglês", nivel: "Fluente" }, { idioma: "", nivel: "" }],
  tempo_especialidade: "Mais de 20 anos.", tempo_independente: "Mais de 10 anos.", lideranca: "Sim, lidero projetos completos.",
  possui_portfolio: "Sim, possuo portfólio online.", link_portfolio: "behance.net/maria", projeto_relevante: "Um projeto.",
  servicos_especialista_externo: "Sim, ocasionalmente.", ferramentas: ["Miro.", "Figma."], formatos_atuacao: ["100% remoto."],
  viagens: "Não tenho disponibilidade para viagens.", horas_semanais: "Até 5 horas semanais.", formatos_contratacao: ["Valor por hora."],
  equipe_propria: "Não, atuo individualmente.", interesse_parceria: "Sim, tenho bastante interesse.", autorizacoes: [AUT_GALERIA, AUT_DADOS],
});

describe("Cadastro de parceiro: as mesmas regras", () => {
  it("todas as etapas passam com um cadastro completo", () => {
    for (let e = 1; e <= 9; e++) expect(errosDaEtapa(e, completo())).toEqual({});
  });
  it("mensagens de erro iguais às da página de HTML", () => {
    const q = (id: string) => PERGUNTAS.find((x) => x.id === id)!;
    expect(validar(q("nome"), { nome: "Maria" })).toBe("Informe o seu nome completo, com nome e sobrenome.");
    expect(validar(q("email"), { email: "maria@" })).toBe("Informe um endereço de e-mail válido.");
    expect(validar(q("email"), { email: "Maria@Exemplo.com" }, "maria@exemplo.com")).toBe(EMAIL_DUP_MSG);
    expect(validar(q("telefone"), { telefone: "(41) 9974" })).toBe("Informe o telefone com DDD.");
    expect(validar(q("cidade_estado"), { cidade_estado: { uf: "PR", cidade: "" } })).toBe("Selecione o estado e a cidade.");
    expect(validar(q("linkedin"), { linkedin: "instagram.com/maria" })).toBe("Informe o link do seu perfil no LinkedIn (ex.: https://www.linkedin.com/in/seu-perfil).");
    expect(validar(q("linkedin"), { linkedin: "linkedin.com/in/maria" })).toBeNull();
    expect(validar(q("modelo_atuacao"), { modelo_atuacao: ["Outro."] })).toBe(OUTRO_SEM_TEXTO);
    expect(validar(q("modelo_atuacao"), {})).toBe("Selecione ao menos uma opção.");
    expect(validar(q("atuacao_pj"), {})).toBe("Selecione uma opção.");
    expect(validar(q("atividades_entregaveis"), { atividades_entregaveis: [" "] })).toBe("Inclua ao menos um item.");
    expect(validar(q("idiomas"), { idiomas: [{ idioma: "Inglês", nivel: "" }] })).toBe("Informe o idioma e o nível de fluência em cada linha.");
    expect(validar(q("autorizacoes"), { autorizacoes: [AUT_GALERIA] })).toBe("Para fazer parte da rede, marque a autorização de uso dos seus dados.");
    expect(validar(q("apresentacao"), {})).toBe("Esta pergunta é obrigatória.");
    expect(validar(q("link_portfolio"), { possui_portfolio: "Sim, possuo site profissional.", link_portfolio: "nada" })).toBe("Informe um link válido (ex.: https://seusite.com.br).");
  });
  it("a linha gravada em 'cadastros' tem os mesmos campos e formatos", () => {
    const d = payload(completo());
    expect(d.nome).toBe("maria da silva");
    expect(d.cidade_estado).toBe("Curitiba - PR");
    expect(d.linkedin).toBe("https://www.linkedin.com/in/maria");
    expect(d.link_portfolio).toBe("https://behance.net/maria");
    expect(d.modelo_atuacao).toEqual(["Freelancer especializado(a).", "Outro."]); // na ordem das opções
    expect(d.atividades_entregaveis).toBe("Jornadas\nBlueprints");
    expect(d.idiomas).toBe("Inglês: Fluente");
    expect(d.ferramentas).toBe("Figma.\nMiro."); // store "lines"
    expect(d.experiencia_colaboracao).toBeNull(); // pergunta escondida não conta
    expect(d.empresa).toBeNull();
    expect(d.autoriza_dados).toBe(true);
    expect(d.galeria_aceite_cadastro).toBe(true);
    expect(d).not.toHaveProperty("autorizacoes");
    expect(d.outros).toEqual({ modelo_atuacao: "Mentora" });
    expect(Object.keys(d)).toHaveLength(40 - 1 + 4);
  });
  it("o texto do consentimento é o mesmo que a página de HTML grava", () => {
    // o mesmo cálculo do script de antes (textContent do HTML das autorizações)
    const q = original.SECTIONS.flatMap((s: { questions: { id: string }[] }) => s.questions).find((x: { id: string }) => x.id === "autorizacoes");
    const esperado = q.label + "\n\n" + textoDoHtml((Object.entries(q.optionInfo as Record<string, string>).map(([k, v]) => "<p>" + k + "</p>" + v).join("") + q.afterHtml).replace(/<\/(p|li)>/g, "</$1>\n")).trim() + "\n\nMarcado:\n- " + [AUT_DADOS, AUT_GALERIA].join("\n- ");
    expect(textoDoConsentimento([AUT_DADOS, AUT_GALERIA])).toBe(esperado);
    expect(esperado).toContain("contato@danimoscatelli.com.br");
  });
  it("visível, primeiro nome e rascunho no formato da página de HTML", () => {
    const exp = PERGUNTAS.find((x) => x.id === "experiencia_colaboracao")!;
    expect(visible(exp, { colaboracao_multidisciplinar: "Sim, em algumas ocasiões." })).toBe(true);
    expect(visible(exp, {})).toBe(false);
    expect(primeiroNome({ nome: "  joana  souza" })).toBe("Joana");
    expect(value(PERGUNTAS[0], { nome: " a  b " })).toBe("a b");
    expect(lerRascunho(JSON.stringify({ etapa: 12, r: { nome: "x" }, em: 1 }))).toEqual({ etapa: 9, r: { nome: "x" } });
    expect(lerRascunho("{")).toBeNull();
  });
});

describe("Cadastro de parceiro: os mesmos textos", () => {
  const novo = textoCorrido(renderizar("rede-parceiros-cadastro"));
  it("a etapa 1 sai pronta no HTML, com as perguntas e o aviso de obrigatórios", () => {
    for (const q of SECTIONS[0].questions) expect(novo).toContain(`${q.n}. ${q.label}`);
    expect(novo).toContain("Cadastro na Rede de Parceiros");
    expect(novo).toContain("Campos marcados com * são obrigatórios.");
  });
  // A introdução (passo 0) nunca aparecia: a página sempre abria direto na etapa 1 (script `show(EMBUTIDO ? 1 : 0)` com
  // `embutido` sempre ligado). Os textos dela já estão na página da Rede de Parceiros; não foi levada (SITE_REACT.md, 6e).
  // "Seção N" deu lugar ao Stepper ("Etapa N de 9"); a política abre em nova aba, sem a janela.
  const corpo = html.slice(html.indexOf("<!-- Telas finais -->"), html.indexOf("</div>\n<dialog") > 0 ? html.indexOf("</div>\n<dialog") : html.indexOf("<script>\nconst SUPABASE"));
  it("as frases das três telas finais estão na versão em React", () => {
    expect(frasesDe(corpo).length).toBeGreaterThan(15);
    const faltando = [...new Set(frasesDe(corpo))].filter((f) => !fonte.includes(f) && f !== "Boas-vindas!");
    expect(faltando).toEqual([]);
  });
});
