// Resultados de uma pesquisa (aba Resultado): os mesmos números, leituras e tabelas da página de HTML, como modelo.
// Um card por pergunta: número, pergunta, quantas responderam, "Resumo" em uma frase, o gráfico, notas e "Ver números".
import {
  BLOCOS, completas, fmt1, itensDe, juntar, maisEscolhida, naCondicao, notaGeral, notas, pct, plural, semOutro, valores,
  type DadosDoPainel, type Item, type PerguntaDaPesquisa, type Questionario, type Resposta,
} from "./pesquisas";

export type Leitura = (string | { b: string })[];
export type Tabela = { colunas: string[]; linhas: (string | number)[][] };
export type Grafico =
  | { tipo: "rosca"; itens: Item[]; total: number; centro: string; rotCentro: string }
  /** Barras; com `camada`, cada item tem também v2 (ex.: 1º lugar e "entre os 3"). */
  | { tipo: "barras"; itens: Item[]; total: number; ordem: "valor" | "natural" | "fixa"; camada?: [string, string] }
  | { tipo: "notas"; media: number; aspectos: { rotulo: string; m: number; destaque: boolean }[] }
  | { tipo: "facilDificil"; linhas: { rotulo: string; fac: number; med: number; dif: number; n: number; na: number }[] }
  | { tipo: "funil"; etapas: { rotulo: string; v: number }[] }
  | { tipo: "halteres"; rotulo: string; a: { rot: string; v: number; k?: number; n: number }; b: { rot: string; v: number; k?: number; n: number }; max: number; decimal?: boolean }
  | { tipo: "barrasPct"; itens: { rotulo: string; k: number; n: number }[]; destaques: number };
export type CardDeResultado = {
  id: string; num: string | number; titulo: string; base: number; meta: string[]; leitura: Leitura | null; grafico: Grafico;
  notas: string[]; outros: string[]; tabela: Tabela | null; largo: boolean;
};
export type ModeloDeResultados = {
  vazio: boolean; funil: { etapas: { rotulo: string; v: number }[]; nota: string };
  temas: { nome: string; sub: string; cards: CardDeResultado[] }[]; notaFinal: string;
};

const tabelaItens = (itens: Item[], total: number, cab = "Resposta"): Tabela => ({ colunas: [cab, "Pessoas", "%"], linhas: itens.map((it) => [semOutro(it.rotulo), it.v, pct(it.v, total) + "%"]) });
const outrosDe = (p: PerguntaDaPesquisa, base: Resposta[]) => base.map((x) => x.respostas[p.id] && x.respostas[p.id].outro).filter(Boolean).slice(0, 50) as string[];
const card = (c: Partial<CardDeResultado> & Pick<CardDeResultado, "id" | "num" | "titulo" | "base" | "grafico">): CardDeResultado => ({ meta: [], leitura: null, notas: [], outros: [], tabela: null, largo: false, ...c });

// fácil x difícil: três grupos (fácil, médio, difícil), da característica mais difícil para a mais fácil
export function facilDificil(p: PerguntaDaPesquisa, base: Resposta[]) {
  return (p.linhas || []).map((l) => {
    const vals = base.map((x) => x.respostas[p.id] && x.respostas[p.id][l.id]).filter(Boolean) as string[];
    const ap = vals.filter((v) => v !== "na");
    const c = (ids: string[]) => ap.filter((v) => ids.includes(v)).length;
    return { l, n: ap.length, na: vals.length - ap.length, fac: c(["1", "2"]), med: c(["3"]), dif: c(["4", "5"]), cont: Object.fromEntries(["1", "2", "3", "4", "5"].map((k) => [k, c([k])])) as Record<string, number> };
  }).sort((a, b) => pct(b.dif, b.n) - pct(a.dif, a.n));
}

/** Cards de perfil (cidade, bairro por regional, gênero, faixa etária, estado civil). Usados em Resultado e em Interessados. */
export function cardsDePerfil(Q: Questionario, lista: Resposta[]): CardDeResultado[] {
  const out: CardDeResultado[] = [];
  const comPerfil = lista.filter((x) => x.respostas.perfil);
  (Q.perfil || []).forEach((c) => {
    if (c.id === "cidade" || c.id === "bairro") {
      const base = c.condicao ? comPerfil.filter((x) => c.condicao!.opcoes.includes(x.respostas.perfil[c.condicao!.campo])) : comPerfil;
      if (!base.length) return;
      const conta = (id: string) => base.filter((x) => x.respostas.perfil[c.id] === id).length;
      const porOp = c.opcoes.map((o) => ({ rotulo: o.texto, v: conta(o.id), fixo: o.id === "nao_informar", o }));
      let its: Item[] = porOp.filter((it) => it.v);
      const notasC: string[] = [];
      let tabela: Tabela;
      if (c.id === "bairro") {
        const regs = [...new Set(c.opcoes.map((o) => o.regional).filter(Boolean))] as string[];
        its = [...regs.map((r) => ({ rotulo: "Regional " + r, v: porOp.filter((it) => it.o.regional === r).reduce((t, it) => t + it.v, 0) })), ...porOp.filter((it) => it.fixo)];
        notasC.push("Agrupado pelas Administrações Regionais da Prefeitura de Curitiba.");
        tabela = tabelaItens(porOp.filter((it) => it.v), base.length);
      } else tabela = tabelaItens(its, base.length);
      const t = maisEscolhida(its);
      out.push(card({ id: "perfil-" + c.id, num: "Perfil", titulo: c.texto, base: base.length,
        leitura: t && t.v ? [c.id === "bairro" ? "Região com mais respostas: " : "Cidade com mais respostas: ", { b: t.rotulo }, ` (${pct(t.v, base.length)}%).`] : null,
        grafico: { tipo: "barras", itens: its, total: base.length, ordem: "valor" }, notas: notasC, tabela }));
      return;
    }
    const its = c.opcoes.map((o) => ({ rotulo: semOutro(o.texto), v: comPerfil.filter((x) => x.respostas.perfil[c.id] === o.id).length, fixo: o.id === "nao_informar" }));
    const t = maisEscolhida(its);
    out.push(card({ id: "perfil-" + c.id, num: "Perfil", titulo: c.texto, base: comPerfil.length,
      leitura: t && t.v ? ["Maior grupo: ", { b: t.rotulo }, ` (${pct(t.v, comPerfil.length)}%).`] : null,
      grafico: c.id === "genero"
        ? { tipo: "rosca", itens: its, total: comPerfil.length, centro: t && t.v ? pct(t.v, comPerfil.length) + "%" : "0%", rotCentro: t && t.v ? t.rotulo.toLowerCase() : "" }
        : { tipo: "barras", itens: its, total: comPerfil.length, ordem: "natural" },
      outros: comPerfil.map((x) => x.respostas.perfil[c.id + "_outro"]).filter(Boolean).slice(0, 50), tabela: tabelaItens(its, comPerfil.length) }));
  });
  return out;
}

export function resultados(d: DadosDoPainel): ModeloDeResultados {
  const { Q, R, I } = d;
  const comp = completas(R);
  const perg = Object.fromEntries(Q.perguntas.map((p) => [p.id, p]));
  const respondeu = (pid: string) => R.filter((x) => x.respostas && x.respostas[pid] != null);
  const foraC = R.filter((x) => x.situacao === "fora_de_curitiba").length, semC = R.filter((x) => x.situacao === "sem_compras").length;
  const notaF: string[] = [];
  if (foraC || semC) notaF.push(`Ficaram fora do público: ${juntar([foraC ? plural(foraC, "pessoa mora", "pessoas moram") + " fora de Curitiba e da Região Metropolitana" : "", semC ? plural(semC, "pessoa não comprou", "pessoas não compraram") + " roupas, calçados ou acessórios este ano" : ""].filter(Boolean))}.`);
  notaF.push(`${plural(I.length, "contato guardado", "contatos guardados")} de quem pediu os avisos do lançamento.`);
  const funil = {
    etapas: [
      { rotulo: "Responderam", v: R.length },
      { rotulo: "Moram em Curitiba", v: R.filter((x) => x.situacao !== "fora_de_curitiba").length },
      { rotulo: "Responderam tudo", v: comp.length },
      { rotulo: "Querem os avisos", v: comp.filter((x) => x.quer_novidades).length },
    ],
    nota: notaF.join(" "),
  };
  const cards: CardDeResultado[] = [];
  // P1: Curitiba, Região Metropolitana ou outra cidade (só "Outra cidade" encerra)
  if (perg.q1) {
    const b1 = respondeu("q1"), sim = b1.filter((x) => ["sim", "rmc"].includes(x.respostas.q1)).length;
    const i1 = (perg.q1.opcoes || []).map((o) => ({ rotulo: o.texto, v: b1.filter((x) => x.respostas.q1 === o.id).length }));
    cards.push(card({ id: "q1", num: 1, titulo: perg.q1.texto, base: b1.length, leitura: [{ b: pct(sim, b1.length) + "%" }, " moram em Curitiba ou na Região Metropolitana e seguiram na pesquisa."],
      grafico: { tipo: "rosca", itens: i1, total: b1.length, centro: pct(sim, b1.length) + "%", rotCentro: "Curitiba e RMC" }, tabela: tabelaItens(i1, b1.length) }));
  }
  // P2 (classificação): % em 1º lugar e % entre as 3
  if (perg.q2) {
    const b2 = respondeu("q2");
    if (perg.q2.tipo === "ranking") {
      const enc = (perg.q2.opcoes || []).find((o) => o.encerra);
      const nEnc = enc ? b2.filter((x) => valores(x.respostas.q2).includes(enc.id)).length : 0;
      const it2 = (perg.q2.opcoes || []).filter((o) => !o.encerra).map((o) => ({ rotulo: o.texto, v: b2.filter((x) => valores(x.respostas.q2)[0] === o.id).length, v2: b2.filter((x) => valores(x.respostas.q2).includes(o.id)).length }));
      const t2 = maisEscolhida(it2);
      cards.push(card({ id: "q2", num: 2, titulo: perg.q2.texto, base: b2.length, meta: ["até 3 lugares, em ordem"],
        leitura: t2 && t2.v ? [{ b: t2.rotulo }, ` é onde mais compraram: ${pct(t2.v, b2.length)}% em 1º lugar.`] : ["Ninguém marcou um lugar de compra ainda."],
        grafico: { tipo: "barras", itens: it2, total: b2.length, ordem: "valor", camada: ["Onde mais comprou (1º lugar)", "Entre os 3 lugares"] },
        notas: enc && nEnc ? [`${enc.texto}: ${nEnc} (${pct(nEnc, b2.length)}%), encerraram aqui.`] : [],
        tabela: { colunas: ["Lugar", "1º lugar", "Entre os 3"], linhas: it2.map((it) => [it.rotulo, `${it.v} (${pct(it.v, b2.length)}%)`, `${it.v2} (${pct(it.v2, b2.length)}%)`]) } }));
    } else {
      const it2 = itensDe(perg.q2, b2); const t2 = maisEscolhida(it2);
      cards.push(card({ id: "q2", num: 2, titulo: perg.q2.texto, base: b2.length, leitura: t2 && t2.v ? [{ b: t2.rotulo }, `: ${pct(t2.v, b2.length)}%.`] : null, grafico: { tipo: "barras", itens: it2, total: b2.length, ordem: "valor" }, tabela: tabelaItens(it2, b2.length) }));
    }
  }
  // P2.1 a P10
  let num = 2;
  Q.perguntas.filter((p) => p.id !== "q1" && p.id !== "q2").forEach((p) => {
    const base = p.condicao ? comp.filter((x) => naCondicao(p, x)) : comp;
    if (!p.condicao) num++;
    const n = base.length;
    const meta = p.tipo === "multipla" ? [p.max ? `até ${p.max} escolhas por pessoa` : "várias escolhas por pessoa"] : [];
    const notasC: string[] = [];
    let grafico: Grafico, leitura: Leitura | null, tabela: Tabela, largo = false, outros: string[] = [];
    if (p.tipo === "escalas" || p.tipo === "escala") {
      // nota geral (média dos aspectos) em destaque e a média de cada aspecto; "Correspondência" em destaque
      const ger = notas(base, notaGeral), mg = ger.length ? ger.reduce((a, b) => a + b, 0) / ger.length : 0;
      const asp = (p.linhas || []).map((l) => { const ns = base.map((x) => x.respostas[p.id] && x.respostas[p.id][l.id]).filter((v): v is number => typeof v === "number"); return { l, ns, m: ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0 }; });
      grafico = { tipo: "notas", media: mg, aspectos: asp.map((a) => ({ rotulo: a.l.texto, m: a.m, destaque: a.l.id === "correspondencia" })) };
      const corr = asp.find((a) => a.l.id === "correspondencia");
      leitura = corr ? ["Nota geral ", { b: fmt1(mg) }, "; correspondência com o que procuravam: ", { b: fmt1(corr.m) }, ` (${pct(corr.ns.filter((v) => v <= 6).length, corr.ns.length)}% deram de 1 a 6).`] : ["Nota média ", { b: fmt1(mg) }, "."];
      notasC.push(`${p.min ?? 0} = ${p.rotulo_min} · ${p.max ?? 10} = ${p.rotulo_max}. Nota geral = média dos ${asp.length} aspectos de cada pessoa.`);
      tabela = { colunas: ["Aspecto", "Média", "1 a 6", "7 e 8", "9 e 10"], linhas: asp.map((a) => [a.l.texto, fmt1(a.m), pct(a.ns.filter((v) => v <= 6).length, a.ns.length) + "%", pct(a.ns.filter((v) => v >= 7 && v <= 8).length, a.ns.length) + "%", pct(a.ns.filter((v) => v >= 9).length, a.ns.length) + "%"]) };
      largo = true;
    } else if (p.tipo === "matriz") {
      const linhas = facilDificil(p, base);
      grafico = { tipo: "facilDificil", linhas: linhas.map((x) => ({ rotulo: x.l.texto, fac: x.fac, med: x.med, dif: x.dif, n: x.n, na: x.na })) };
      largo = (p.linhas || []).length > 6;
      const top = linhas.find((x) => x.n);
      leitura = top && top.dif ? ["O que mais dificulta: ", { b: lc1(top.l.texto) }, ` (${pct(top.dif, top.n)}% acham difícil ou muito difícil).`] : ["Ninguém marcou dificuldade ainda."];
      const temNa = linhas.some((x) => x.na) || (p.colunas || []).some((c) => c.id === "na");
      tabela = { colunas: ["Característica", "Muito fácil", "Fácil", "Médio", "Difícil", "Muito difícil", ...(temNa ? ["Não se aplica"] : [])], linhas: linhas.map((x) => [x.l.texto, x.cont["1"], x.cont["2"], x.cont["3"], x.cont["4"], x.cont["5"], ...(temNa ? [x.na] : [])]) };
    } else if (p.tipo === "ranking") {
      const its = (p.opcoes || []).map((o) => ({ rotulo: o.texto, v: base.filter((x) => valores(x.respostas[p.id])[0] === o.id).length, v2: base.filter((x) => valores(x.respostas[p.id]).includes(o.id)).length, fixo: !!o.exclusiva }));
      const t = maisEscolhida(its);
      meta.push(`até ${p.max} escolhas, em ordem`);
      grafico = { tipo: "barras", itens: its, total: n, ordem: "valor", camada: ["1º lugar", "Entre os 3"] };
      leitura = t && t.v ? ["Em 1º lugar: ", { b: semOutro(t.rotulo) }, ` (${pct(t.v, n)}%).`] : null;
      tabela = { colunas: ["Opção", "1º lugar", "Entre os 3"], linhas: its.map((it) => [it.rotulo, `${it.v} (${pct(it.v, n)}%)`, `${it.v2} (${pct(it.v2, n)}%)`]) };
    } else {
      const its = itensDe(p, base);
      const ordinal = ["q1_1", "q3", "q7", "q_foto", "q_disponibilidade"].includes(p.id);
      grafico = { tipo: "barras", itens: its, total: n, ordem: ordinal ? "natural" : "valor" };
      const t = maisEscolhida(its);
      if (p.id === "q3") { const k = base.filter((x) => x.respostas.q3 && x.respostas.q3 !== "nao").length; leitura = [{ b: pct(k, n) + "%" }, " compraram de segunda mão este ano."]; }
      else if (p.id === "q7") { const k = base.filter((x) => ["frequentemente", "quase_sempre"].includes(x.respostas.q7)).length; leitura = [{ b: pct(k, n) + "%" }, " frequentemente ou quase sempre têm dificuldade para encontrar exatamente o que desejam."]; }
      else leitura = t && t.v ? ["A resposta mais escolhida: ", { b: semOutro(t.rotulo) }, ` (${pct(t.v, n)}%).`] : null;
      if (p.tipo === "multipla") notasC.push("Cada pessoa pode marcar mais de uma opção, por isso a soma passa de 100%.");
      outros = outrosDe(p, base);
      tabela = tabelaItens(its, n);
    }
    if (p.condicao) {
      const ops = (Q.perguntas.find((x) => x.id === p.condicao!.pergunta)?.opcoes || []).filter((o) => p.condicao!.opcoes.includes(o.id)).map((o) => "“" + o.texto + "”");
      const mae = Q.perguntas.filter((x) => !x.condicao).findIndex((x) => x.id === p.condicao!.pergunta) + 1;
      notasC.unshift(`Aparece só para quem marcou na pergunta ${mae} ` + ops.join(" ou ") + ".");
    }
    const c = card({ id: p.id, num: p.rotulo || num, titulo: p.texto, base: n, meta, leitura, grafico, notas: notasC, outros, tabela, largo });
    // a 1.1 (condicional da pergunta 1) entra logo depois do card da pergunta 1
    if (p.condicao && p.condicao.pergunta === "q1") cards.splice(cards.findIndex((x) => x.id === "q1") + 1, 0, c); else cards.push(c);
  });
  const perfil = cardsDePerfil(Q, comp);
  const TEMAS_RES: [string, string, string[]][] = [
    ["Onde compram", "Onde moram, onde mais compram roupas, calçados e acessórios, por que compram fora e segunda mão.", BLOCOS[0][1]],
    ["Notas das compras", "Como avaliam a qualidade, a estética e a correspondência das peças que compraram.", BLOCOS[1][1]],
    ["Como procuram", "Por onde começam a procura, foto de referência, como descobrem lojas e contato antes de ir.", BLOCOS[2][1]],
    ["Dificuldades", "Com que frequência têm dificuldade, o que é difícil encontrar e o que fazem quando não encontram.", BLOCOS[3][1]],
  ];
  const temas = TEMAS_RES.map(([nome, sub, ids]) => ({ nome, sub, cards: cards.filter((c) => ids.includes(c.id)) })).filter((t) => t.cards.length);
  if (perfil.length) temas.push({ nome: "Quem respondeu", sub: "Cidade, bairro, gênero, faixa etária e estado civil de quem respondeu tudo.", cards: perfil });
  const soltos = cards.filter((c) => !TEMAS_RES.some(([, , ids]) => ids.includes(c.id)));
  if (soltos.length) temas.push({ nome: "", sub: "", cards: soltos });
  return {
    vazio: !R.length, funil, temas,
    notaFinal: `Da pergunta 2.1 em diante, os números contam só quem respondeu tudo (${comp.length}). Quem não mora em Curitiba ou na Região Metropolitana, ou não comprou este ano, encerra na pergunta 1 ou 2.`,
  };
}
// texto de resposta em primeira pessoa ("meu tamanho") lido pelo painel: "seu tamanho"
export const lc1 = (t: string) => (String(t || "").charAt(0).toLowerCase() + String(t || "").slice(1)).replace(/\bmeu\b/g, "seu").replace(/\bminha\b/g, "sua").replace(/\bmeus\b/g, "seus").replace(/\bminhas\b/g, "suas");
export const textoDaLeitura = (l: Leitura | null) => (l || []).map((x) => (typeof x === "string" ? x : x.b)).join("");
