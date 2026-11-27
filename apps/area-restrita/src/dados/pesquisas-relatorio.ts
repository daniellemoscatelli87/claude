// Linhas do relatório em Excel (abas Resultados e Inteligência): os títulos, leituras, notas e tabelas que o painel
// mostra, tirados dos mesmos modelos que a tela desenha (antes, a página de HTML lia o texto da tela).
import { type DadosDoPainel, plural } from "./pesquisas";
import { resultados, textoDaLeitura } from "./pesquisas-resultados";
import { inteligencia, MIN_SEG, relatosTxt, sinteseDosRelatos, temasDosRelatos } from "./pesquisas-inteligencia";

type Linha = (string | number)[];
const numero = (c: string | number) => (typeof c === "string" && /^-?\d+([.,]\d+)?$/.test(c) ? Number(c.replace(",", ".")) : c);
const tabela = (colunas: string[], linhas: (string | number)[][]): Linha[] => [colunas, ...linhas.map((l) => l.map(numero)), []];

export function linhasDoRelatorio(d: DadosDoPainel, aba: "resultados" | "inteligencia"): Linha[] {
  const rows: Linha[] = [];
  const titulo = (t: string) => { if (rows.length && rows[rows.length - 1].length) rows.push([]); rows.push([t]); };
  if (aba === "resultados") {
    const m = resultados(d);
    if (m.vazio) return [["Ainda não há respostas"], ["Compartilhe o link. Cada participação aparece aqui na hora, e o sino avisa quando chegar uma nova."]];
    titulo("Quem chegou até onde"); rows.push(["Da entrada na pesquisa até o pedido de avisos sobre o lançamento."]);
    rows.push(...tabela(["Etapa", "Pessoas"], m.funil.etapas.map((e) => [e.rotulo, e.v]))); rows.push([m.funil.nota]);
    for (const t of m.temas) {
      if (t.nome) { titulo(t.nome); rows.push([t.sub]); }
      for (const c of t.cards) {
        titulo(`${c.num}. ${c.titulo}`); rows.push([[plural(c.base, "resposta", "respostas"), ...c.meta].join(" · ")]);
        if (!c.base) { rows.push(["Ainda sem respostas aqui"]); continue; }
        if (c.leitura) rows.push(["Resumo: " + textoDaLeitura(c.leitura)]);
        c.notas.forEach((n) => rows.push([n]));
        if (c.outros.length) { rows.push(["O que escreveram em “outro”"]); c.outros.forEach((o) => rows.push([o])); }
        if (c.tabela) rows.push(...tabela(c.tabela.colunas, c.tabela.linhas));
      }
    }
    rows.push([m.notaFinal]);
    return rows;
  }
  const m = inteligencia(d);
  if (m.pouco) return [["Ainda há poucas respostas completas"], [`As descobertas aparecem a partir de ${MIN_SEG} respostas completas. Agora: ${m.n}.`]];
  titulo("Achados");
  for (const s of m.secoes) {
    titulo(s.nome); rows.push([s.sub]);
    if (s.chave === "voz") {
      const temas = temasDosRelatos(m.relatos, null);
      const r = sinteseDosRelatos(m.relatos, temas, null);
      rows.push([r.titulo], [r.texto]);
      if (temas.length) rows.push(...tabela(["Tema", "Relatos"], temas.map((t) => [t.nome, `${t.itens.length} de ${relatosTxt(m.relatos.length)}`])));
      continue;
    }
    for (const a of s.achados) {
      titulo(a.tema); rows.push([a.titulo], [a.contexto], ["Por que importa" + (a.hipotese ? " (hipótese)" : "") + ": " + a.significa]);
      rows.push(...tabela(a.dados.colunas, a.dados.linhas));
      if (a.dados.nota) rows.push([a.dados.nota]);
    }
  }
  if (m.pendentes.length) rows.push([`Ainda não há pessoas suficientes para comparar com segurança: ${m.pendentes.join(", ")}.`]);
  titulo("Oportunidades");
  m.oportunidades.forEach((o, k) => {
    titulo(`${k + 1}. ${o.titulo}`);
    rows.push(["Dor observada: " + o.dor], ["Sugestão de recurso: " + o.recurso], ...o.evid.map((e) => ["Evidência: " + e]), ["Impacto esperado: " + o.esperado]);
  });
  return rows;
}
