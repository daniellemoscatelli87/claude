// Inteligência de uma pesquisa: o que as respostas revelam (Achados, por assunto) e o que isso sugere para o produto
// Find Look (Oportunidades), com as mesmas contas, frases e regras da página de HTML. Tudo é calculado das respostas
// completas, sem IA (a não ser o agrupamento dos relatos, quando pedido, feito na tela). Interpretação leva o selo
// "Hipótese". Comparações entre grupos só com pelo menos MIN_SEG pessoas em cada um.
import {
  completas, contar, fmt1, juntar, media, notaGeral, notas, pct, semOutro, valores, naCondicao,
  type DadosDoPainel, type Resposta,
} from "./pesquisas";
import { lc1, type Grafico } from "./pesquisas-resultados";

export const MIN_SEG = 5;
export type DadosDoAchado = { colunas: string[]; linhas: (string | number)[][]; nota?: string };
export type Oportunidade = { titulo: string; dor: string; recurso: string; ic: string; evid: string[]; esperado: string; parte: number; cat: "busca" | "outros"; id?: string; achado?: string; grupo?: string };
export type Achado = { id: string; grupo: string; tema: string; titulo: string; contexto: string; vis: Grafico; dados: DadosDoAchado; significa: string; hipotese?: boolean };
export type ModeloDeInteligencia =
  | { pouco: true; n: number }
  | { pouco: false; n: number; secoes: { chave: string; nome: string; sub: string; achados: Achado[]; qt: string }[]; relatos: Resposta[]; pendentes: string[]; oportunidades: Oportunidade[] };

export const SECOES_INT: [string, string, string][] = [
  ["vazamento", "Para onde vai a compra", "Quanto da compra de moda sai do comércio de Curitiba e por quê."],
  ["dor", "A dor de encontrar", "O que é difícil, para quem, e quanto isso custa em compras que não acontecem."],
  ["busca", "Como as pessoas procuram", "Busca por foto, contato com a loja antes de ir e descoberta de lojas."],
  ["quem", "Quem são essas pessoas", "Diferenças entre grupos de idade e entre quem mora em Curitiba e na Região Metropolitana."],
  ["voz", "Voz do cliente", "O que as pessoas contam, com as palavras delas, na pergunta aberta."],
];
const lc = (t: string) => String(t || "").charAt(0).toLowerCase() + String(t || "").slice(1);
const LOCAL = ["fisicas_cwb", "online_cwb"], FORA = ["marketplaces", "online_outras", "fisicas_outras"];
const DIF_NATURAL: Record<string, string> = { estilo: "encontrar roupas que combinam com o próprio estilo", tamanho: "encontrar peças no tamanho certo", modelagem: "encontrar roupas que vestem bem no corpo", tecido: "encontrar peças com o tecido e a qualidade desejados", acessorios: "encontrar acessórios que combinam com o próprio gosto", precos: "encontrar preços dentro do orçamento", onde_encontrar: "saber em quais lojas procurar", muitas_lojas: "achar o que quer sem rodar muitas lojas e sites", esgotada: "encontrar a peça disponível, sem estar esgotada", tempo: "ter tempo para procurar e comparar", distancia: "chegar até as lojas", avaliar_online: "avaliar tecido e caimento pelas fotos" };
const Q6_NATURAL: Record<string, string> = { passando: "passar em frente às lojas, na rua ou no shopping", redes: "ver publicações de lojas nas redes sociais", indicacao: "indicação de amigos, familiares e conhecidos", google: "pesquisar no Google ou no Google Maps", anuncios: "anúncios de lojas na internet e nas redes sociais", influenciadores: "recomendações de influenciadores" };
const Q5_NATURAL: Record<string, string> = { fisicas_cwb: "indo pessoalmente às lojas de Curitiba", online_cwb: "procurando lojas de Curitiba pelo Instagram, site ou WhatsApp", marketplaces: "pesquisando em marketplaces", outras_cidades: "procurando em sites e aplicativos de lojas de outras cidades", google: "pesquisando no Google", redes: "buscando inspiração e indicações nas redes sociais" };
const difNat = (l: { id: string; texto: string }) => DIF_NATURAL[l.id] || lc1(l.texto);
const capt = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const OPS_MOTIVO: Record<string, Pick<Oportunidade, "titulo" | "dor" | "recurso" | "ic">> = {
  sortimento: { titulo: "Reunir num só lugar a variedade das lojas da cidade", dor: "A variedade é o motivo mais citado para comprar fora.", recurso: "Catálogo único das lojas de Curitiba, com filtro por tamanho, modelo e tipo de peça.", ic: "loja" },
  preco: { titulo: "Trazer promoções e faixas de preço das lojas locais", dor: "O preço é o motivo mais citado para comprar fora.", recurso: "Promoções, faixa de preço e a vantagem de ver e provar a peça na loja.", ic: "preco" },
  indisp: { titulo: "Mostrar em qual loja da cidade a peça está", dor: "Não achar o produto na cidade é o motivo mais citado para comprar fora.", recurso: "Busca que mostra quais lojas de Curitiba têm a peça.", ic: "mapa" },
  comodidade: { titulo: "Dizer antes de sair de casa se a peça está na loja", dor: "A comodidade é o motivo mais citado para comprar fora.", recurso: "Disponibilidade da peça por loja, antes de a pessoa sair de casa.", ic: "estoque" },
};
const REC_DIF: Record<string, string> = { tempo: "Comparar peças de várias lojas numa só tela, sem rodar lojas e sites.", muitas_lojas: "Comparar peças de várias lojas numa só tela, sem rodar lojas e sites.", onde_encontrar: "Busca que mostra em quais lojas da cidade procurar cada tipo de peça.", tamanho: "Filtro por tamanho, com a disponibilidade em cada loja.", modelagem: "Medidas e informações de caimento de cada peça.", tecido: "Fotos de detalhe e informações de tecido de cada peça.", avaliar_online: "Fotos de detalhe, medidas e informações de tecido de cada peça.", estilo: "Busca por estilo e por foto de referência.", acessorios: "Busca por estilo e por foto de referência.", precos: "Filtro por faixa de preço.", esgotada: "Disponibilidade por loja, atualizada.", distancia: "Lojas mais próximas de quem procura." };
const recursoDif = (id: string) => REC_DIF[id] || "Busca que resolva esse ponto.";

type Grupo = { rot: string; l: Resposta[] };
type Entrada = Omit<Achado, "id" | "grupo"> & { op?: Omit<Oportunidade, "id" | "achado" | "grupo"> | null };

export function inteligencia(d: DadosDoPainel): ModeloDeInteligencia {
  const { Q, R } = d;
  const comp = completas(R);
  const perg = Object.fromEntries(Q.perguntas.map((p) => [p.id, p]));
  const txt = (pid: string, id: string) => semOutro(((perg[pid]?.opcoes || []).find((o) => o.id === id) || { texto: id }).texto || id);
  const n = comp.length;
  if (n < MIN_SEG) return { pouco: true, n };
  const grupos: Record<string, Achado[]> = Object.fromEntries(SECOES_INT.map(([k]) => [k, []]));
  const ops: Oportunidade[] = [];
  let seq = 0;
  const add = (g: string, c: Entrada) => {
    const id = "achado-" + (++seq);
    const { op, ...resto } = c;
    grupos[g].push({ ...resto, id, grupo: g });
    if (op) ops.push({ ...op, id, achado: c.titulo, grupo: g });
  };
  const pendentes: string[] = [];
  const linhaPct = (rot: string, k: number, tot: number) => [rot, k, tot, pct(k, tot) + "%"];
  const COLS = ["", "Pessoas", "Base", "Parte"];
  const prim = (x: Resposta) => valores(x.respostas.q2)[0];
  const pf = (x: Resposta) => x.respostas.perfil || {};
  const ATE34 = ["18_24", "25_34"], MAIS35 = ["35_44", "45_54", "55_64", "65_mais"];
  const temDif = (x: Resposta) => ["as_vezes", "frequentemente", "quase_sempre"].includes(x.respostas.q7);
  const semDif = (x: Resposta) => ["nunca", "raramente"].includes(x.respostas.q7);
  const desistiu = (x: Resposta) => valores(x.respostas.q9).includes("desisti");
  const trocou = (x: Resposta) => valores(x.respostas.q9).some((v) => ["outra_diferente", "parecida"].includes(v));
  const foraPrin = (x: Resposta) => FORA.includes(prim(x));
  const segMao = (x: Resposta) => !!x.respostas.q3 && x.respostas.q3 !== "nao";
  const foto = (x: Resposta) => ["varias", "algumas", "uma"].includes(x.respostas.q_foto);
  const difItem = (id: string) => (x: Resposta) => ["4", "5"].includes((x.respostas.q8 || {})[id]);
  const pc = (l: Resposta[], f: (x: Resposta) => boolean) => pct(l.filter(f).length, l.length);
  const ct = (l: Resposta[], f: (x: Resposta) => boolean) => l.filter(f).length;
  const comparar = (a: Resposta[], b: Resposta[], nome: string) => { if (a.length < MIN_SEG || b.length < MIN_SEG) { pendentes.push(nome); return false; } return true; };
  const cmp = (rotulo: string, ga: Grupo, gb: Grupo, f: (x: Resposta) => boolean): Grafico => ({ tipo: "halteres", rotulo, max: 100, a: { rot: ga.rot, v: pc(ga.l, f), k: ct(ga.l, f), n: ga.l.length }, b: { rot: gb.rot, v: pc(gb.l, f), k: ct(gb.l, f), n: gb.l.length } });
  const dadosCmp = (ga: Grupo, gb: Grupo, f: (x: Resposta) => boolean, nota: string): DadosDoAchado => ({ colunas: ["Grupo", "Pessoas", "Base", "Parte"], linhas: [linhaPct(ga.rot, ct(ga.l, f), ga.l.length), linhaPct(gb.rot, ct(gb.l, f), gb.l.length)], nota });
  const rosca = (itens: { rotulo: string; v: number; fixo?: boolean }[], total: number): Grafico => ({ tipo: "rosca", itens, total, centro: pct(itens[0].v, total) + "%", rotCentro: "" });
  const barras = (itens: { rotulo: string; v: number }[], total: number, ordem: "valor" | "fixa" = "valor"): Grafico => ({ tipo: "barras", itens, total, ordem });

  /* ----- Para onde vai a compra ----- */
  const local1 = comp.filter((x) => LOCAL.includes(prim(x))).length, fora1 = comp.filter(foraPrin).length;
  const roscaCompra = rosca(fora1 > local1
    ? [{ rotulo: "Marketplaces ou lojas de outras cidades", v: fora1 }, { rotulo: "Lojas de Curitiba, físicas ou online", v: local1, fixo: true }]
    : [{ rotulo: "Lojas de Curitiba, físicas ou online", v: local1 }, { rotulo: "Marketplaces ou lojas de outras cidades", v: fora1, fixo: true }], n);
  const dadosCompra = { colunas: ["Onde mais compram", "Pessoas", "Base", "Parte"], linhas: [linhaPct("Marketplaces ou lojas de outras cidades", fora1, n), linhaPct("Lojas de Curitiba, físicas ou online", local1, n)], nota: `Base: ${n} respostas completas. Pergunta 2, opção escolhida em 1º lugar.` };
  add("vazamento", fora1 > local1 ? {
    tema: "Compra fora da cidade", titulo: "A maior parte da compra de moda está saindo de Curitiba",
    contexto: `Onde as ${n} pessoas que responderam tudo mais compraram roupas, calçados e acessórios este ano.`, vis: roscaCompra, dados: dadosCompra,
    significa: "Pode indicar que quem mora aqui não está encontrando nas lojas da cidade o que procura.", hipotese: true,
    op: { titulo: "Mostrar que a peça existe numa loja de Curitiba", dor: "A maior parte das pessoas compra principalmente fora da cidade.", recurso: "Resultados de lojas de Curitiba com foto, preço e bairro, tão fáceis de achar quanto num marketplace.", ic: "loja", evid: [`${fora1} de ${n} pessoas compram mais fora de Curitiba`], esperado: "Trazer parte da compra de volta para as lojas da cidade.", parte: pct(fora1, n), cat: "busca" },
  } : {
    tema: "Comércio local", titulo: "As lojas de Curitiba ainda são a primeira escolha da maioria",
    contexto: `Onde as ${n} pessoas que responderam tudo mais compraram roupas, calçados e acessórios este ano.`, vis: roscaCompra, dados: dadosCompra,
    significa: "Há uma base de clientes que já prefere o comércio da cidade.",
    op: { titulo: "Facilitar a busca nas lojas da cidade", dor: "A compra local já é a preferida, mas pode migrar para o online de fora.", recurso: "Busca que reúne as lojas de Curitiba por tipo de peça e bairro.", ic: "busca", evid: [`${local1} de ${n} pessoas compram mais em Curitiba`], esperado: "Fortalecer um hábito que já existe.", parte: pct(local1, n), cat: "busca" },
  });
  const comecaLocal = comp.filter((x) => LOCAL.includes(valores(x.respostas.q5)[0]));
  if (comecaLocal.length >= MIN_SEG) {
    const fogem = comecaLocal.filter(foraPrin).length, m = comecaLocal.length;
    if (fogem) add("vazamento", {
      tema: "Procura aqui, compra fora", titulo: fogem === m ? "Todos que começam procurando em Curitiba acabam comprando fora" : fogem > m / 2 ? "A maioria de quem começa procurando em Curitiba compra fora" : "Começar a procura em Curitiba nem sempre significa comprar aqui",
      contexto: `Onde mais compram as ${m} pessoas que começam a procura pelas lojas de Curitiba.`,
      vis: rosca([{ rotulo: "Compram mais fora de Curitiba", v: fogem }, { rotulo: "Compram mais em Curitiba", v: m - fogem, fixo: true }], m),
      dados: { colunas: COLS, linhas: [linhaPct("Compram mais fora de Curitiba", fogem, m), linhaPct("Compram mais em Curitiba", m - fogem, m)], nota: `Base: ${m} pessoas que começam a procura em lojas de Curitiba (pergunta 5) e onde mais compraram (pergunta 2).` },
      significa: "Essas pessoas tentaram comprar na cidade primeiro. A pesquisa mostra que a compra sai daqui, não o porquê.",
      op: { titulo: "Agir quando a procura local não encontra a peça", dor: "Parte de quem começa procurando em Curitiba acaba comprando fora.", recurso: "Quando a busca não encontra a peça, sugerir peças parecidas e outras lojas da cidade que têm o item.", ic: "rota", evid: [`${fogem} de ${m} pessoas que começam a procura em Curitiba compram mais fora`], esperado: "Manter na cidade a compra de quem já quer comprar aqui.", parte: pct(fogem, m), cat: "busca" },
    });
  }
  if (perg.q2_1) {
    const b21 = comp.filter((x) => naCondicao(perg.q2_1, x));
    if (b21.length >= MIN_SEG) {
      const cita = (ids: string[]) => b21.filter((x) => valores(x.respostas.q2_1).some((v) => ids.includes(v))).length;
      const gr = [
        { id: "sortimento", rotulo: "Variedade de modelos, tamanhos e peças específicas", ids: ["variedade", "tamanhos", "pecas_especificas"] },
        { id: "preco", rotulo: "Preço e condições de pagamento", ids: ["precos", "promocoes"] },
        { id: "indisp", rotulo: "Não acham o produto no comércio local", ids: ["dificuldade_cwb"] },
        { id: "comodidade", rotulo: "Comodidade de comprar sem sair de casa", ids: ["comodidade"] },
      ].map((x) => ({ ...x, v: cita(x.ids) })).sort((a, b) => b.v - a.v);
      const g0 = gr[0];
      add("vazamento", {
        tema: "Por que compram fora", titulo: ({ sortimento: "A variedade é o motivo mais citado para comprar fora", preco: "O preço é o motivo mais citado para comprar fora", indisp: "Não achar o produto na cidade é o motivo mais citado para comprar fora", comodidade: "A comodidade é o motivo mais citado para comprar fora" } as Record<string, string>)[g0.id],
        contexto: `Motivos citados pelas ${b21.length} pessoas que compram em marketplaces ou lojas online de outras cidades. Cada pessoa podia citar mais de um.`,
        vis: barras(gr, b21.length),
        dados: { colunas: ["Motivo", "Pessoas", "Base", "Parte"], linhas: gr.map((x) => linhaPct(x.rotulo, x.v, b21.length)), nota: `Base: ${b21.length} pessoas. Pergunta 2.1, várias respostas por pessoa.` },
        significa: g0.id === "preco" ? "Competir só em preço com marketplaces é difícil para uma loja local." : g0.id === "comodidade" ? "A conveniência pesa mais do que preço ou variedade." : "A decisão de comprar fora parece estar mais ligada ao que a pessoa consegue encontrar do que ao preço.", hipotese: g0.id !== "preco",
        op: { ...OPS_MOTIVO[g0.id], evid: [`${g0.v} de ${b21.length} pessoas que compram fora citam esse motivo`], esperado: "Responder ao principal motivo para comprar fora.", parte: pct(g0.v, b21.length), cat: g0.id === "preco" ? "outros" : "busca" },
      });
    }
  }

  /* ----- A dor de encontrar ----- */
  const viveu = comp.filter((x) => x.respostas.q9 && !valores(x.respostas.q9).includes("nao_passei"));
  const nDes = comp.filter(desistiu).length, nTro = comp.filter(trocou).length;
  if (viveu.length) {
    const v = viveu.length;
    const itens = [{ rotulo: "Desistiram da compra", v: nDes }, { rotulo: "Levaram algo diferente ou só parecido", v: nTro }];
    add("dor", {
      tema: "Vendas perdidas", titulo: nDes ? "Quando não encontram a peça, muita gente desiste da compra" : "Quando não encontram a peça, as pessoas levam outra coisa",
      contexto: `O que fizeram as ${v} pessoas que ficaram sem encontrar o que queriam este ano. Cada pessoa podia marcar mais de uma opção.`,
      vis: barras(itens, v, "fixa"),
      dados: { colunas: ["O que fizeram", "Pessoas", "Base", "Parte"], linhas: itens.map((x) => linhaPct(x.rotulo, x.v, v)), nota: `Base: ${v} de ${n} pessoas passaram por isso este ano. Pergunta 9.` },
      significa: "Cada desistência é uma venda que existia e não aconteceu. Quem leva algo só parecido compra, mas não o que queria.",
      op: { titulo: "Ajudar a encontrar exatamente a peça procurada", dor: "Quando não encontram a peça, muita gente desiste ou leva algo só parecido.", recurso: "Busca pela peça exata, com filtros de modelo, cor e tamanho, e busca por foto.", ic: "busca", evid: [`${v} de ${n} pessoas ficaram sem encontrar o que queriam`, `${nDes} desistiram da compra`], esperado: "Transformar desistência em compra.", parte: pct(v, n), cat: "busca" },
    });
  }
  const comDif = comp.filter(temDif), semD = comp.filter(semDif);
  if (comparar(comDif, semD, "se quem tem dificuldade para encontrar desiste mais de comprar")) {
    const a = pc(comDif, desistiu), b = pc(semD, desistiu);
    const GA = { rot: "Costumam ter dificuldade", l: comDif }, GB = { rot: "Quase nunca têm", l: semD };
    add("dor", {
      tema: "Quem mais desiste", titulo: a > b ? "Quem costuma ter dificuldade para encontrar desiste mais" : a === b ? "Desistir acontece tanto com quem tem dificuldade quanto com quem não tem" : "Desistir de comprar não parece ligado à dificuldade de encontrar",
      contexto: `Parte de cada grupo que já desistiu de uma compra, entre as ${comDif.length + semD.length} pessoas que responderam tudo.`,
      vis: cmp("Já desistiram de uma compra", GA, GB, desistiu), dados: dadosCmp(GA, GB, desistiu, "Dificuldade: pergunta 7 (às vezes, frequentemente ou quase sempre). Desistência: pergunta 9."),
      significa: a > b ? "A desistência parece se concentrar em quem enfrenta a dificuldade com frequência." : "Outras razões além de encontrar a peça, como preço ou qualidade, podem pesar na desistência.", hipotese: true,
      op: a > b ? { titulo: "Começar por quem tem dificuldade com frequência", dor: "Quem costuma ter dificuldade para encontrar desiste mais de comprar.", recurso: "Primeiros convites e testes do Find Look para quem relata dificuldade frequente.", ic: "pessoas", evid: [`${a}% de quem tem dificuldade já desistiu de uma compra, contra ${b}% de quem quase nunca tem`], esperado: "Testar o produto com quem mais ganha com ele.", parte: pct(comDif.length, n), cat: "outros" } : null,
    });
  }
  const linhasQ8 = perg.q8?.linhas || [];
  const difs = linhasQ8.map((l) => { const v = comp.map((x) => (x.respostas.q8 || {})[l.id]).filter((y) => y && y !== "na"); return { l, k: v.filter((y) => y === "4" || y === "5").length, d: v.length }; }).filter((x) => x.d && x.k).sort((a, b) => b.k / b.d - a.k / a.d);
  if (difs.length) {
    const t5 = difs.slice(0, 5);
    add("dor", {
      tema: "O que mais dificulta", titulo: `O que mais pesa é ${difNat(t5[0].l)}`,
      contexto: "Parte das pessoas que acha cada item difícil ou muito difícil quando procura uma peça.",
      vis: { tipo: "barrasPct", itens: t5.map((x) => ({ rotulo: capt(difNat(x.l)), k: x.k, n: x.d })), destaques: 3 },
      dados: { colunas: ["Item", "Acham difícil", "Avaliaram", "Parte"], linhas: t5.map((x) => linhaPct(capt(difNat(x.l)), x.k, x.d)), nota: "Base: quem avaliou cada item (sem “não se aplica”). Pergunta 8, notas 4 e 5." },
      significa: "São as necessidades mais mal atendidas hoje: é nelas que a procura falha com mais frequência.",
      op: { titulo: `Resolver primeiro: ${difNat(t5[0].l)}`, dor: `${capt(difNat(t5[0].l))} é o que mais pesa na procura.`, recurso: recursoDif(t5[0].l.id), ic: "alvo", evid: t5.slice(0, 2).map((x) => `${x.k} de ${x.d} acham difícil ${difNat(x.l)}`), esperado: "Atacar a necessidade mais mal atendida hoje.", parte: pct(t5[0].k, t5[0].d), cat: "busca" },
    });
  }
  const atributos = linhasQ8.map((l) => {
    const dif = comp.filter(difItem(l.id)), fac = comp.filter((x) => ["1", "2"].includes((x.respostas.q8 || {})[l.id]));
    const q4 = (g: Resposta[]) => media(notas(g, notaGeral));
    return dif.length >= MIN_SEG && fac.length >= MIN_SEG ? { l, dif, fac, nd: q4(dif), nf: q4(fac) } : null;
  }).filter((a): a is NonNullable<typeof a> => !!a && a.nf - a.nd > 0).sort((a, b) => (b.nf - b.nd) - (a.nf - a.nd));
  if (atributos.length) {
    const a = atributos[0];
    add("dor", {
      tema: "O que pesa na satisfação", titulo: `Quem não consegue ${difNat(a.l)} fica menos satisfeito`,
      contexto: `Nota média (de 1 a 10) para o que compraram, de quem acha fácil e de quem acha difícil ${difNat(a.l)}.`,
      vis: { tipo: "halteres", rotulo: "Nota média do que compraram", max: 10, decimal: true, a: { rot: "Acham fácil", v: a.nf, n: a.fac.length }, b: { rot: "Acham difícil", v: a.nd, n: a.dif.length } },
      dados: { colunas: ["Grupo", "Pessoas", "Nota média"], linhas: [["Acham fácil", a.fac.length, fmt1(a.nf)], ["Acham difícil", a.dif.length, fmt1(a.nd)]], nota: "Nota geral: média de qualidade, estética e correspondência (pergunta 4)." },
      significa: "Quando esse ponto falha, a pessoa parece ficar menos satisfeita com o que levou para casa.", hipotese: true,
      op: { titulo: `Facilitar ${difNat(a.l)}`, dor: `Quem não consegue ${difNat(a.l)} fica menos satisfeito com o que compra.`, recurso: recursoDif(a.l.id), ic: "estrela", evid: [`Nota média ${fmt1(a.nd)} de quem acha difícil, contra ${fmt1(a.nf)} de quem acha fácil`], esperado: "Melhorar a experiência depois da compra, não só a procura.", parte: pct(a.dif.length, n), cat: "busca" },
    });
  }

  /* ----- Como as pessoas procuram ----- */
  if (perg.q_foto) {
    const enviou = comp.filter(foto), nunca = comp.filter((x) => x.respostas.q_foto === "nunca");
    if (enviou.length) add("busca", {
      tema: "Busca por imagem", titulo: enviou.length > n / 2 ? "Procurar roupa por foto já é um hábito" : "Parte das pessoas já procura roupa por foto",
      contexto: `Quantas das ${n} pessoas já mandaram uma foto de referência para uma loja perguntando onde comprar algo igual ou parecido.`,
      vis: rosca([{ rotulo: "Já mandaram foto", v: enviou.length }, { rotulo: "Nunca mandaram", v: n - enviou.length, fixo: true }], n),
      dados: { colunas: COLS, linhas: [linhaPct("Já mandaram foto", enviou.length, n), linhaPct("Nunca mandaram", n - enviou.length, n)], nota: `Base: ${n} respostas completas.` },
      significa: "As pessoas sabem o que querem pelo visual, mesmo sem saber o nome da peça ou onde ela está. Hoje fazem isso à mão, loja por loja.",
      op: { titulo: "Busca por foto", dor: "As pessoas mandam foto de referência loja por loja para achar a peça.", recurso: "Enviar uma foto e ver peças iguais ou parecidas nas lojas da cidade.", ic: "camera", evid: [`${enviou.length} de ${n} já mandaram foto de referência para uma loja`], esperado: "Responder a um comportamento que já existe, hoje feito à mão.", parte: pct(enviou.length, n), cat: "busca" },
    });
    if (comparar(enviou, nunca, "se quem procura por foto é quem mais tem dificuldade")) {
      const a = pc(enviou, temDif), b = pc(nunca, temDif);
      const GA = { rot: "Já mandaram foto", l: enviou }, GB = { rot: "Nunca mandaram", l: nunca };
      add("busca", {
        tema: "Foto e dificuldade", titulo: a > b ? "Quem procura por foto é quem mais sofre para encontrar" : "Procurar por foto não é só de quem tem dificuldade",
        contexto: "Parte de cada grupo que costuma ter dificuldade para encontrar o que quer.",
        vis: cmp("Costumam ter dificuldade para encontrar", GA, GB, temDif), dados: dadosCmp(GA, GB, temDif, "Foto: pergunta sobre foto de referência. Dificuldade: pergunta 7."),
        significa: a > b ? "A foto parece ser um recurso de quem não consegue encontrar a peça pelos caminhos comuns." : "Mandar foto parece ser um hábito geral.", hipotese: true,
        op: a > b ? { titulo: "Usar a busca por foto como porta de entrada", dor: "Quem procura por foto é quem mais sofre para encontrar.", recurso: "Busca por foto em destaque logo na primeira tela.", ic: "camera", evid: [`${a}% de quem manda foto tem dificuldade, contra ${b}% de quem nunca manda`], esperado: "Atender primeiro o público com mais dificuldade.", parte: pct(enviou.length, n), cat: "busca" } : null,
      });
    }
  }
  if (perg.q_disponibilidade) {
    const contata = comp.filter((x) => ["sempre", "as_vezes"].includes(x.respostas.q_disponibilidade));
    const naoContata = comp.filter((x) => ["raramente", "nunca"].includes(x.respostas.q_disponibilidade));
    if (contata.length) add("busca", {
      tema: "Disponibilidade", titulo: "Antes de sair de casa, as pessoas querem saber se a peça está na loja",
      contexto: `Quantas das ${n} pessoas costumam perguntar à loja (WhatsApp, Instagram ou telefone) se a peça está disponível antes de ir.`,
      vis: rosca([{ rotulo: "Perguntam antes de ir", v: contata.length }, { rotulo: "Raramente ou nunca", v: n - contata.length, fixo: true }], n),
      dados: { colunas: COLS, linhas: [linhaPct("Sempre ou às vezes perguntam", contata.length, n), linhaPct("Raramente, nunca ou não responderam", n - contata.length, n)], nota: `Base: ${n} respostas completas.` },
      significa: "Ir até a loja e não encontrar a peça é um risco que as pessoas tentam evitar, perguntando uma loja de cada vez.",
      op: { titulo: "Mostrar a disponibilidade antes de sair de casa", dor: "As pessoas perguntam loja por loja se a peça está disponível.", recurso: "Disponibilidade da peça em cada loja, com a opção de falar com a loja.", ic: "estoque", evid: [`${contata.length} de ${n} perguntam à loja antes de ir`], esperado: "Eliminar essa etapa e dar segurança para ir à loja física.", parte: pct(contata.length, n), cat: "busca" },
    });
    if (comparar(contata, naoContata, "se quem pergunta à loja antes de ir sofre mais com peça esgotada")) {
      const a = pc(contata, difItem("esgotada")), b = pc(naoContata, difItem("esgotada"));
      const GA = { rot: "Perguntam antes de ir", l: contata }, GB = { rot: "Raramente ou nunca", l: naoContata };
      add("busca", {
        tema: "Peça esgotada", titulo: a > b ? "Quem pergunta antes de ir já se frustrou com peça esgotada" : "Perguntar antes de ir não vem de frustração com estoque",
        contexto: "Parte de cada grupo que acha difícil encontrar a peça disponível, sem estar esgotada.",
        vis: cmp("Acham difícil encontrar a peça disponível", GA, GB, difItem("esgotada")), dados: dadosCmp(GA, GB, difItem("esgotada"), "Pergunta sobre contato antes de ir e pergunta 8 (peça esgotada, notas 4 e 5)."),
        significa: a > b ? "A pergunta prévia parece uma reação a frustrações com estoque." : "O hábito de perguntar antes parece ter outros motivos.", hipotese: true,
        op: a > b ? { titulo: "Informação de estoque confiável", dor: "Quem pergunta antes de ir já se frustrou com peça esgotada.", recurso: "Estoque atualizado pelas lojas, com a data da última atualização.", ic: "estoque", evid: [`${a}% de quem pergunta antes acha difícil encontrar a peça disponível, contra ${b}% de quem não pergunta`], esperado: "Ganhar a confiança de quem já se frustrou com estoque.", parte: pct(contata.length, n), cat: "busca" } : null,
      });
    }
  }
  const semSaber = comp.filter(difItem("onde_encontrar"));
  const c6 = perg.q6 ? contar(perg.q6, comp) : {};
  const top6 = (perg.q6?.opcoes || []).filter((o) => !o.exclusiva && !o.outro && !o.anula).map((o) => ({ rotulo: capt(Q6_NATURAL[o.id] || lc(semOutro(o.texto))), v: c6[o.id] || 0 })).filter((o) => o.v).sort((a, b) => b.v - a.v);
  if (semSaber.length && top6[0]) add("busca", {
    tema: "Descoberta de lojas", titulo: semSaber.length > n / 2 ? "A maioria não sabe em quais lojas procurar o que quer" : "Parte das pessoas não sabe em quais lojas procurar",
    contexto: `${semSaber.length} das ${n} pessoas acham difícil saber em quais lojas procurar. Abaixo, como as pessoas conhecem lojas novas hoje.`,
    vis: barras(top6.slice(0, 5), n),
    dados: { colunas: ["Como conhecem lojas novas", "Pessoas", "Base", "Parte"], linhas: [linhaPct("Acham difícil saber onde procurar", semSaber.length, n), ...top6.map((o) => linhaPct(o.rotulo, o.v, n))], nota: `Base: ${n} respostas completas. Perguntas 6 e 8.` },
    significa: "Parte da dificuldade pode não ser falta de oferta, e sim de descoberta: a peça pode estar numa loja da cidade que a pessoa não conhece.", hipotese: true,
    op: { titulo: "Ajudar a saber em quais lojas procurar", dor: "Muitas pessoas não sabem em quais lojas procurar o que querem.", recurso: "Busca por tipo de peça que mostra as lojas da cidade que vendem aquilo.", ic: "mapa", evid: [`${semSaber.length} de ${n} acham difícil saber onde procurar`, `Canal com mais alcance hoje: ${lc(top6[0].rotulo)}`], esperado: "Ser o caminho de descoberta das lojas da cidade.", parte: pct(semSaber.length, n), cat: "busca" },
  });
  const fluxos: Record<string, number> = {};
  comp.forEach((x) => { const q5 = valores(x.respostas.q5)[0]; if (!q5 || q5 === "nao_procuro" || !prim(x)) return; const k = q5 + ">" + prim(x); fluxos[k] = (fluxos[k] || 0) + 1; });
  const topF = Object.entries(fluxos).sort((a, b) => b[1] - a[1]);
  if (topF[0] && topF[0][1] >= 2) {
    const [a0, b0] = topF[0][0].split(">");
    const mesmo = (LOCAL.includes(a0) && LOCAL.includes(b0)) || a0 === b0;
    const rotF = (k: string) => { const [x, y] = k.split(">"); return `Começa ${Q5_NATURAL[x] || lc(txt("q5", x))} e compra em ${lc(txt("q2", y)).replace(/ \(.*\)$/, "")}`; };
    add("busca", {
      tema: "Jornada de compra", titulo: mesmo ? "Quem começa a procura num lugar costuma comprar nele" : "As pessoas procuram num lugar e compram em outro",
      contexto: `Os caminhos mais comuns entre onde a procura começa e onde a compra acontece, entre as ${n} pessoas.`,
      vis: barras(topF.slice(0, 4).map(([k, v]) => ({ rotulo: rotF(k), v })), n),
      dados: { colunas: ["Caminho", "Pessoas", "Base", "Parte"], linhas: topF.slice(0, 6).map(([k, v]) => linhaPct(rotF(k), v, n)), nota: "Onde começa a procura (pergunta 5, 1º lugar) e onde mais compra (pergunta 2, 1º lugar)." },
      significa: mesmo ? "Para esse grupo, quem atende bem a procura fica com a venda." : "Quem ajuda na procura nem sempre fica com a venda.",
      op: { titulo: "Aparecer no momento em que a procura começa", dor: mesmo ? "Quem atende bem a procura fica com a venda." : "As pessoas procuram num lugar e compram em outro.", recurso: "Presença do Find Look nos canais onde a procura começa, com link direto para a busca.", ic: "rota", evid: [`Caminho mais comum: ${topF[0][1]} de ${n} pessoas`], esperado: "Influenciar onde a compra termina.", parte: pct(topF[0][1], n), cat: "outros" },
    });
  }

  /* ----- Quem são essas pessoas ----- */
  const INDIC: [string, (x: Resposta) => boolean, string, string][] = [["compram principalmente fora de Curitiba", foraPrin, "compram mais fora de Curitiba", "compra mais fora de Curitiba"], ["têm dificuldade para encontrar o que querem", temDif, "têm mais dificuldade para encontrar o que querem", "tem mais dificuldade para encontrar o que quer"], ["já desistiram de uma compra", desistiu, "desistem mais de comprar", "desiste mais de comprar"], ["compram de segunda mão", segMao, "compram mais de segunda mão", "compra mais de segunda mão"], ["já mandaram foto de referência", foto, "procuram mais roupa por foto", "procura mais roupa por foto"]];
  const maiorDif = (a: Resposta[], b: Resposta[]) => INDIC.map(([t, f, c, c1]) => ({ t, f, c, c1, va: pc(a, f), vb: pc(b, f) })).sort((x, y) => Math.abs(y.va - y.vb) - Math.abs(x.va - x.vb))[0];
  const ate34 = comp.filter((x) => ATE34.includes(pf(x).faixa_etaria)), mais35 = comp.filter((x) => MAIS35.includes(pf(x).faixa_etaria));
  if (comparar(ate34, mais35, "se os hábitos mudam com a idade")) {
    const m = maiorDif(ate34, mais35);
    const GA = { rot: "Até 34 anos", l: ate34 }, GB = { rot: "35 anos ou mais", l: mais35 };
    add("quem", {
      tema: "Idade", titulo: m.va === m.vb ? "Os hábitos são parecidos entre as idades" : `${m.va > m.vb ? "Os mais jovens" : "Os mais velhos"} ${m.c}`,
      contexto: `Onde está a maior diferença entre quem tem até 34 anos e quem tem 35 ou mais: parte de cada grupo que ${m.t}.`,
      vis: cmp(capt(m.t), GA, GB, m.f), dados: dadosCmp(GA, GB, m.f, "Comparação entre 5 hábitos; aparece o de maior diferença."),
      significa: m.va === m.vb ? "A dor parece atravessar as idades." : `O grupo ${m.va > m.vb ? "mais jovem" : "mais velho"} parece viver mais essa situação.`, hipotese: true,
      op: m.va === m.vb ? null : { titulo: `Começar pelo público ${m.va > m.vb ? "mais jovem" : "mais velho"}`, dor: `${m.va > m.vb ? "Os mais jovens" : "Os mais velhos"} ${m.c}.`, recurso: "Comunicação e primeiros testes voltados a esse grupo.", ic: "pessoas", evid: [`${m.va}% de quem tem até 34 anos, contra ${m.vb}% de quem tem 35 ou mais`], esperado: "Tornar a mensagem do Find Look mais certeira.", parte: Math.max(m.va, m.vb), cat: "outros" },
    });
  }
  const cwb = comp.filter((x) => x.respostas.q1 === "sim"), rmc = comp.filter((x) => x.respostas.q1 === "rmc");
  if (comparar(cwb, rmc, "se quem mora em Curitiba e na Região Metropolitana compra diferente")) {
    const m = maiorDif(cwb, rmc);
    const GA = { rot: "Curitiba", l: cwb }, GB = { rot: "Região Metropolitana", l: rmc };
    add("quem", {
      tema: "Onde moram", titulo: m.va === m.vb ? "Curitiba e Região Metropolitana se comportam de forma parecida" : `${m.va > m.vb ? "Quem mora em Curitiba" : "Quem mora na Região Metropolitana"} ${m.c1}`,
      contexto: `Onde está a maior diferença entre quem mora em Curitiba e na Região Metropolitana: parte de cada grupo que ${m.t}.`,
      vis: cmp(capt(m.t), GA, GB, m.f), dados: dadosCmp(GA, GB, m.f, "Comparação entre 5 hábitos; aparece o de maior diferença."),
      significa: "Morar mais longe das lojas pode mudar a forma de procurar e de comprar.", hipotese: true,
      op: m.va === m.vb ? null : { titulo: "Incluir a Região Metropolitana", dor: `${m.va > m.vb ? "Quem mora em Curitiba" : "Quem mora na Região Metropolitana"} ${m.c1}.`, recurso: "Busca que considera a distância e mostra lojas próximas de quem mora fora da capital.", ic: "mapa", evid: [`${m.va}% em Curitiba, contra ${m.vb}% na Região Metropolitana`], esperado: "Atender também quem mora fora da capital.", parte: pct(rmc.length, n), cat: "outros" },
    });
  }
  const sm = comp.filter(segMao).length;
  if (sm) add("quem", {
    tema: "Segunda mão", titulo: sm > n / 2 ? "Comprar de segunda mão já faz parte da rotina" : "Brechós são hábito de uma parte do público",
    contexto: `Quantas das ${n} pessoas compraram peças de segunda mão, em brechós, este ano.`,
    vis: rosca([{ rotulo: "Compraram de segunda mão", v: sm }, { rotulo: "Não compraram", v: n - sm, fixo: true }], n),
    dados: { colunas: COLS, linhas: [linhaPct("Compraram de segunda mão", sm, n), linhaPct("Não compraram", n - sm, n)], nota: `Base: ${n} respostas completas. Pergunta 3.` },
    significa: sm > n / 2 ? "Para esse público, brechó é mais um lugar onde a peça desejada pode estar." : "A segunda mão aparece, mas ainda não é o principal caminho de compra.",
    op: { titulo: "Incluir brechós da cidade", dor: "Comprar de segunda mão faz parte da rotina de muita gente.", recurso: "Brechós de Curitiba entre as lojas da busca.", ic: "brecho", evid: [`${sm} de ${n} compraram de segunda mão este ano`], esperado: "Mais lugares onde a peça desejada pode estar.", parte: pct(sm, n), cat: "busca" },
  });

  /* ----- Voz do cliente e oportunidades que não vêm de um achado só ----- */
  const rel = comp.filter((x) => x.relato && x.relato.trim());
  const dores = linhasQ8.map((l) => { const af = comp.filter(difItem(l.id)); return { l, af: af.length, des: af.filter(desistiu).length }; }).filter((x) => x.af).sort((a, b) => b.af - a.af || b.des - a.des).slice(0, 3);
  const opsGerais: Oportunidade[] = [];
  if (dores.length) opsGerais.push({ titulo: "Começar pelas dores que mais custam vendas", dor: `${capt(juntar(dores.map((x) => difNat(x.l))))}: as dificuldades que atingem mais gente.`, recurso: "Resolver bem essas dores antes de qualquer outra funcionalidade.", ic: "alvo", evid: dores.slice(0, 2).map((x) => `${x.af} acham difícil ${difNat(x.l)}; ${x.des} já desistiram de uma compra`), esperado: "Entregar valor desde o primeiro uso.", parte: pct(dores[0].af, n), cat: "busca" });
  const quer = comp.filter((x) => x.quer_novidades);
  if (quer.length) {
    const dQ = pc(quer, temDif), dT = pc(comp, temDif);
    opsGerais.push({ titulo: "Começar por quem pediu para ser avisado", dor: "Existe um grupo já interessado no lançamento.", recurso: "Alertas de lançamento, novas peças e disponibilidade por interesse.", ic: "sino", evid: [`${quer.length} ${quer.length === 1 ? "pessoa pediu" : "pessoas pediram"} os avisos`, `${dQ}% delas têm dificuldade para encontrar o que querem (${dT}% no total)`], esperado: "Ativar o público mais propenso a testar o Find Look.", parte: dQ, cat: "outros" });
  }
  // ordem de prioridade: impacto (parte das pessoas atingidas), do maior para o menor
  const oportunidades = [...opsGerais, ...ops].sort((a, b) => b.parte - a.parte);
  const secoes = SECOES_INT.map(([chave, nome, sub]) => {
    const achados = grupos[chave];
    const qt = chave === "voz" ? `${rel.length} ${rel.length === 1 ? "relato" : "relatos"}` : `${achados.length} ${achados.length === 1 ? "achado" : "achados"}`;
    return { chave, nome, sub, achados, qt };
  }).filter((s) => (s.chave === "voz" ? rel.length > 0 : s.achados.length > 0));
  return { pouco: false, n, secoes, relatos: rel, pendentes, oportunidades };
}

/** Relatos por tema, sem IA: palavras-chave (as mesmas da página de HTML). */
export const TEMAS_CHAVE: [string, string[]][] = [
  ["tamanho e modelagem", ["tamanho", "numero", "numeracao", "plus", "grande", "pequen", "modelagem", "caimento", "veste", "vestir", "forma", "apertad", "larg"]],
  ["peças em falta ou esgotadas", ["esgot", "estoque", "disponiv", "nao tinha", "nao tem", "acabou", "falta", "encontr", "achar", "acho"]],
  ["preço", ["preco", "caro", "valor", "custo", "barat", "desconto", "promoc"]],
  ["qualidade", ["qualidade", "tecido", "costura", "material", "rasg", "desbot", "durou", "acabamento"]],
  ["atendimento", ["atendiment", "vendedor", "atendent", "grosse", "educad", "resposta", "respond", "whats", "insta"]],
  ["entrega, troca e pós-venda", ["troca", "trocar", "devolu", "entrega", "prazo", "frete", "chegou", "chegar", "pos-venda", "pos venda", "reembols"]],
];
export type RelatosIA = { temas?: { nome: string; resumo?: string; ids: string[] }[]; sintese?: string; gerado_em?: string; desatualizada?: boolean; error?: string; vazio?: boolean };
export type TemaDosRelatos = { nome: string; resumo?: string; itens: Resposta[] };
export function temasDosRelatos(rel: Resposta[], ia: RelatosIA | null): TemaDosRelatos[] {
  const n = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const porId = new Map(rel.map((x) => [x.id, x]));
  const temas = ia && Array.isArray(ia.temas) && ia.temas.length
    ? ia.temas.map((t) => ({ nome: t.nome, resumo: t.resumo, itens: t.ids.map((id) => porId.get(id)).filter((x): x is Resposta => !!x) })).filter((t) => t.itens.length)
    : TEMAS_CHAVE.map(([nome, chaves]) => ({ nome: nome.charAt(0).toUpperCase() + nome.slice(1), itens: rel.filter((x) => chaves.some((k) => n(x.relato || "").includes(k))) })).filter((t) => t.itens.length);
  return temas.sort((a, b) => b.itens.length - a.itens.length);
}
export const relatosTxt = (k: number) => `${k} ${k === 1 ? "relato" : "relatos"}`;
export function sinteseDosRelatos(rel: Resposta[], temas: TemaDosRelatos[], ia: RelatosIA | null) {
  const n = rel.length;
  const titulo = temas.length ? `A frustração que mais aparece nos relatos: ${lc(temas[0].nome)}` : "Os relatos ainda não repetem um mesmo tema";
  const texto = ia && ia.sintese ? ia.sintese : temas.length
    ? `Dos ${relatosTxt(n)} escritos na pergunta aberta, ${temas[0].itens.length} falam de ${lc(temas[0].nome)}` + (temas.length > 1 ? `, e os outros assuntos mais citados são ${juntar(temas.slice(1, 3).map((t) => `${lc(t.nome)} (${t.itens.length})`))}.` : ".")
    : `Há ${relatosTxt(n)}, mas nenhum tema se repete o suficiente para agrupar.`;
  const semTema = rel.filter((x) => !temas.some((t) => t.itens.includes(x))).length;
  return { titulo, texto, semTema };
}
export const fala = (x: Resposta) => { const r = (x.relato || "").trim(); return "“" + (r.length > 260 ? r.slice(0, 257).trimEnd() + "…" : r) + "”"; };
