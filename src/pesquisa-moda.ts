/* Pesquisa pública "Moda em Curitiba" (/pesquisa/moda-curitiba/).
   Uma pergunta por etapa, com progresso, Voltar e Continuar. As perguntas vêm do mesmo arquivo que a função
   do servidor usa para validar (supabase/functions/pesquisa/questionario.json).
   Antes das perguntas, a pessoa se identifica (nome, e-mail e WhatsApp, com aviso da LGPD); o servidor aceita uma
   participação por e-mail e uma por WhatsApp. Q1 = "Não" ou Q2 = "Não comprei" encerram com uma mensagem cordial. A 2.1 só aparece para quem compra mais em
   marketplaces ou lojas online de outras cidades (fora da contagem das 10). Depois das 10 perguntas: pergunta aberta
   (opcional) e convite para receber novidades (avisos só com autorização). O envio usa um identificador gerado
   aqui, então atualizar a página ou tocar de novo no botão não duplica a participação. */
import './pesquisa-moda.css';
import Q from '../supabase/functions/pesquisa/questionario.json';

type Opcao = { id: string; texto: string; encerra?: string; exclusiva?: boolean; outro?: boolean };
type Pergunta = {
  id: string; tipo: 'unica' | 'multipla' | 'ranking' | 'escala' | 'escalas' | 'matriz'; texto: string; apoio?: string; max?: number; min?: number;
  opcoes?: Opcao[]; linhas?: { id: string; texto: string; apoio?: string }[]; colunas?: { id: string; texto: string }[];
  rotulo_min?: string; rotulo_max?: string;
  rotulo?: string; condicao?: { pergunta: string; opcoes: string[] }; // pergunta condicional (ex.: 2.1)
  destaque?: string | string[]; // trecho(s) do título em vermelho
  apoio_negrito?: string; // trecho do texto de apoio em negrito
};
type Multi = { opcoes: string[]; outro?: string };
type Estado = {
  envio: string; etapa: number;
  r: Record<string, unknown>; relato: string;
  nov: '' | 'sim' | 'nao'; nome: string; email: string; whats: string; ciente: boolean;
};

const PERGUNTAS = Q.perguntas as Pergunta[];
const TOTAL = PERGUNTAS.length; // etapas de perguntas, contando a condicional 2.1
const PRINCIPAIS = PERGUNTAS.filter((p) => !p.condicao).length; // as 10 perguntas principais; 2.1, relato e novidades ficam fora
const ETAPA_PERFIL = TOTAL, ETAPA_RELATO = TOTAL + 1, ETAPA_NOV = TOTAL + 2; // perfil, relato e novidades depois das perguntas
const ETAPA_ID = TOTAL + 3; // identificação, antes da primeira pergunta
type OpcaoLista = Opcao & { regional?: string };
// inicio: cidade e bairro são perguntados junto com a pergunta 1 (onde mora), não no "Sobre você"
type CampoPerfil = { id: string; texto: string; opcoes: OpcaoLista[]; tipo?: 'lista'; destaque?: string; condicao?: { campo: string; opcoes: string[] }; inicio?: boolean; texto_inicio?: string; destaque_inicio?: string };
// campo de perfil que vale para esta pessoa (o bairro só aparece para quem mora em Curitiba)
const perfilAplica = (c: CampoPerfil) => !c.condicao || c.condicao.opcoes.includes(perfilAtual()[c.condicao.campo] ?? '');
const PERFIL = ((Q as { perfil?: CampoPerfil[] }).perfil ?? []);
type Perfil = Record<string, string>;
const perfilAtual = (): Perfil => (E.r.perfil as Perfil) ?? {};
// número da pergunta principal (1 a 10) na etapa i; a condicional leva o número da principal anterior
const numero = (i: number) => PERGUNTAS.slice(0, i + 1).filter((p) => !p.condicao).length;
const rotulo = (i: number) => PERGUNTAS[i].rotulo ?? String(numero(i));
// a pergunta aparece? (as condicionais só para quem escolheu uma das opções indicadas)
// valores escolhidos numa resposta (escolha única, classificação ou múltipla escolha)
const valores = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : v && typeof v === 'object' && Array.isArray((v as Multi).opcoes) ? (v as Multi).opcoes : v == null ? [] : [String(v)];
const opcaoQueEncerra = (p: Pergunta | undefined) => (p ? p.opcoes?.find((o) => o.encerra && valores(E.r[p.id]).includes(o.id)) : undefined);
const aplica = (p: Pergunta) => !p.condicao || valores(E.r[p.condicao.pergunta]).some((x) => p.condicao!.opcoes.includes(x));
const proxima = (i: number) => { let j = i + 1; while (j < TOTAL && !aplica(PERGUNTAS[j])) j++; return j; };
const anterior = (i: number) => { let j = i - 1; while (j >= 0 && j < TOTAL && !aplica(PERGUNTAS[j])) j--; return j; };
const API = 'https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/pesquisa';
const CHAVE_RASCUNHO = 'pq-moda-rascunho-v5', CHAVE_FIM = 'pq-moda-concluida';
const RELATO_MAX = 2000;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, txt?: string) => {
  const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e;
};
const guardar = (k: string, v: unknown, local = false) => { try { (local ? localStorage : sessionStorage).setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };
const ler = <T>(k: string, local = false): T | null => { try { const v = (local ? localStorage : sessionStorage).getItem(k); return v ? JSON.parse(v) as T : null; } catch { return null; } };
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));

const novo = (): Estado => ({ envio: uuid(), etapa: -1, r: {}, relato: '', nov: '', nome: '', email: '', whats: '', ciente: false });
/* Rascunho: as respostas ficam guardadas neste aparelho (localStorage) a cada toque, então fechar a aba, sair pelo
   "Voltar para o site" ou perder a conexão não apaga nada; ao voltar pelo link, a pessoa continua de onde parou.
   A identificação (nome, e-mail e WhatsApp) fica só nesta sessão do navegador, por privacidade em aparelhos
   compartilhados; ao voltar outro dia, a pessoa se identifica de novo e continua de onde parou. O rascunho vale por 30 dias e é apagado quando a participação é enviada. */
const RASCUNHO_DIAS = 30;
type Rascunho = Partial<Estado> & { salvoEm?: number };
const lerRascunho = (): Partial<Estado> => {
  const r = ler<Rascunho>(CHAVE_RASCUNHO, true);
  if (!r || !r.salvoEm || Date.now() - r.salvoEm > RASCUNHO_DIAS * 864e5) return {};
  const contato = ler<Partial<Estado>>(CHAVE_RASCUNHO + '-contato') ?? {};
  return { ...r, ...contato };
};
let E: Estado = { ...novo(), ...lerRascunho() };
const salvar = () => {
  const { nome, email, whats, ciente, ...resto } = E;
  guardar(CHAVE_RASCUNHO, { ...resto, salvoEm: Date.now() }, true);
  guardar(CHAVE_RASCUNHO + '-contato', { nome, email, whats, ciente });
};
let enviando = false;
let retomar = -1; // etapa salva para continuar depois da identificação
const identificado = () => !!(E.nome.trim() && emailValido(E.email) && whatsValido(E.whats) && E.ciente);

/* ---------- Telas ---------- */
const telas = ['pq-intro', 'pq-form', 'pq-obrigada', 'pq-encerrada', 'pq-semcompras', 'pq-ja', 'pq-fora-do-ar'];
function mostrarTela(id: string) {
  telas.forEach((t) => { $(t).hidden = t !== id; });
  $('pq-progresso').hidden = id !== 'pq-form';
  const t = $(id);
  if (!reduzir) { t.classList.remove('pq-entra'); void t.offsetWidth; t.classList.add('pq-entra'); }
  const foco = t.querySelector<HTMLElement>('h1[tabindex], legend, h2');
  window.scrollTo({ top: 0 });
  if (id !== 'pq-intro') (foco ?? t).focus?.({ preventScroll: true });
}

/* ---------- Perguntas ---------- */
const etiqueta = (i: number) => (PERGUNTAS[i].condicao ? `Pergunta ${rotulo(i)}` : `Pergunta ${numero(i)} de ${PRINCIPAIS}`);
// destaque: trecho do título em vermelho (a primeira ocorrência), para orientar a leitura
// realcar: divide o texto e põe em <em> (vermelho) a primeira ocorrência de cada trecho, na ordem do texto
function realcar(texto: string, trechos?: string | string[]): (string | HTMLElement)[] {
  const lista = (Array.isArray(trechos) ? trechos : trechos ? [trechos] : [])
    .map((x) => ({ x, k: texto.indexOf(x) })).filter((p) => p.k >= 0).sort((a, b) => a.k - b.k);
  const out: (string | HTMLElement)[] = []; let pos = 0;
  for (const { x, k } of lista) { if (k < pos) continue; out.push(texto.slice(pos, k), el('em', undefined, x)); pos = k + x.length; }
  out.push(texto.slice(pos));
  return out.filter((p) => p !== '');
}
function cabecalho(fs: HTMLFieldSetElement, eyebrow: string, titulo: string, apoio?: string, destaque?: string | string[], negrito?: string) {
  const lg = el('legend', 'pq-pergunta'); lg.tabIndex = -1;
  const t = el('span', 'pq-titulo');
  t.append(...realcar(titulo, destaque));
  // a etapa ("Pergunta 2 de 12", "Antes de começar"…) aparece só na barra de progresso; aqui só para leitores de tela
  lg.append(el('span', 'pq-sr', eyebrow + ': '), t);
  fs.appendChild(lg);
  if (apoio) {
    const a = el('p', 'pq-apoio'); const n = negrito ? apoio.indexOf(negrito) : -1;
    if (n >= 0) a.append(apoio.slice(0, n), el('strong', undefined, negrito!), apoio.slice(n + negrito!.length)); else a.textContent = apoio;
    a.id = fs.id + '-apoio'; fs.setAttribute('aria-describedby', a.id); fs.appendChild(a); }
}
const erroBox = (id: string) => { const e = el('p', 'pq-erro'); e.id = id + '-erro'; e.setAttribute('role', 'alert'); e.hidden = true; return e; };

function opcaoCartao(tipo: 'radio' | 'checkbox', nome: string, o: Opcao, marcado: boolean) {
  const lab = el('label', 'pq-op' + (o.exclusiva ? ' pq-op-excl' : ''));
  const inp = el('input'); inp.type = tipo; inp.name = nome; inp.value = o.id; inp.checked = marcado;
  const marca = el('span', 'pq-marca-op'); marca.setAttribute('aria-hidden', 'true');
  marca.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  lab.append(inp, marca, el('span', 'pq-op-txt', o.texto));
  return { lab, inp };
}

// "Outro" escolhido: leva a tela até o campo (acima da barra fixa de botões) e já posiciona o cursor nele
function abrirOutro(caixa: HTMLElement, campo: HTMLInputElement | null) {
  setTimeout(() => { caixa.scrollIntoView({ block: 'center', behavior: reduzir ? 'auto' : 'smooth' }); campo?.focus({ preventScroll: true }); }, 80);
}

function montarPergunta(p: Pergunta, i: number) {
  const fs = el('fieldset', 'pq-etapa'); fs.id = 'pq-' + p.id; fs.dataset.etapa = String(i);
  cabecalho(fs, `Pergunta ${rotulo(i)}`, p.texto, p.apoio, p.destaque, p.apoio_negrito);
  const erro = erroBox(fs.id);
  if (p.tipo === 'unica') {
    const lista = el('div', 'pq-ops');
    p.opcoes!.forEach((o) => {
      const { lab, inp } = opcaoCartao('radio', p.id, o, E.r[p.id] === o.id);
      inp.addEventListener('change', () => { E.r[p.id] = o.id; limparErro(fs); salvar(); if (p.id === 'q1') sincronizarLocal(); });
      lista.appendChild(lab);
    });
    fs.append(lista);
    // pergunta 1: o campo subordinado aparece logo abaixo da opção a que pertence
    // (bairro abaixo de "Curitiba"; cidade abaixo de "Região Metropolitana de Curitiba")
    if (p.id === 'q1') {
      const dono: Record<string, string> = { bairro: 'sim', cidade: 'rmc' };
      PERFIL.filter((c) => c.inicio).forEach((c) => {
        const b = montarLista(c); b.classList.add('pq-local'); b.hidden = true;
        const op = lista.querySelector<HTMLInputElement>(`input[value="${dono[c.id]}"]`)?.closest('label');
        if (op) op.after(b); else fs.appendChild(b);
      });
    }
  } else if (p.tipo === 'ranking') {
    // classificação: a ordem dos toques define 1º, 2º e 3º; tocar de novo tira e as demais sobem
    const atual = (): string[] => (Array.isArray(E.r[p.id]) ? E.r[p.id] as string[] : []);
    const lista = el('div', 'pq-ops pq-ranking');
    const contador = el('p', 'pq-contador'); contador.setAttribute('aria-live', 'polite');
    const itens: { o: Opcao; inp: HTMLInputElement; selo: HTMLElement; lab: HTMLLabelElement }[] = [];
    const sincronizar = (anunciar?: string) => {
      const sel = atual();
      itens.forEach(({ o, inp, selo, lab }) => {
        const pos = sel.indexOf(o.id);
        inp.checked = pos >= 0;
        selo.textContent = pos >= 0 && !o.exclusiva ? `${pos + 1}º` : '';
        lab.classList.toggle('pq-rank-on', pos >= 0);
        inp.setAttribute('aria-label', o.texto + (pos >= 0 ? `, ${pos + 1}º lugar` : ''));
        const cheio = !!p.max && sel.length >= p.max && pos < 0 && !o.exclusiva;
        inp.disabled = cheio; lab.classList.toggle('pq-op-off', cheio);
      });
      const ex = sel.length === 1 && p.opcoes!.find((x) => x.id === sel[0])?.exclusiva;
      contador.textContent = anunciar ?? (ex ? '' : sel.length ? `${sel.length} de até ${p.max} escolhidas · toque de novo para tirar` : `Toque em até ${p.max} opções, na ordem.`);
    };
    p.opcoes!.forEach((o) => {
      const lab = el('label', 'pq-op pq-rank' + (o.exclusiva ? ' pq-op-excl' : ''));
      const inp = el('input'); inp.type = 'checkbox'; inp.name = p.id; inp.value = o.id;
      const selo = el('span', 'pq-rank-selo'); selo.setAttribute('aria-hidden', 'true');
      lab.append(inp, selo, el('span', 'pq-op-txt', o.texto));
      inp.addEventListener('change', () => {
        let sel = atual();
        if (inp.checked) sel = o.exclusiva ? [o.id] : [...sel.filter((x) => !p.opcoes!.find((y) => y.id === x)?.exclusiva), o.id];
        else sel = sel.filter((x) => x !== o.id);
        E.r[p.id] = sel; salvar(); limparErro(fs);
        const pos = sel.indexOf(o.id);
        sincronizar(pos >= 0 && !o.exclusiva ? `${o.texto}: ${pos + 1}º lugar.` : undefined);
        if (!reduzir && pos >= 0) { selo.classList.remove('pq-pop'); void selo.offsetWidth; selo.classList.add('pq-pop'); }
      });
      itens.push({ o, inp, selo, lab }); lista.appendChild(lab);
    });
    fs.append(lista, contador);
    sincronizar();
  } else if (p.tipo === 'multipla') {
    const atual = (): Multi => (E.r[p.id] as Multi) ?? { opcoes: [] };
    const lista = el('div', 'pq-ops');
    const contador = el('p', 'pq-contador'); contador.setAttribute('aria-live', 'polite');
    const inputs: HTMLInputElement[] = [];
    let campoOutro: HTMLInputElement | null = null, caixaOutro: HTMLElement | null = null;
    const sincronizar = () => {
      const sel = atual().opcoes;
      inputs.forEach((x) => {
        x.checked = sel.includes(x.value);
        // no limite, as demais ficam travadas; a exclusiva continua livre (ela substitui as escolhas)
        const cheio = !!p.max && sel.length >= p.max && !x.checked && !p.opcoes!.find((o) => o.id === x.value)?.exclusiva;
        x.disabled = cheio; x.closest('label')!.classList.toggle('pq-op-off', cheio);
      });
      if (caixaOutro) {
        const antes = caixaOutro.hidden;
        caixaOutro.hidden = !sel.includes(p.opcoes!.find((o) => o.outro)!.id);
        if (antes && !caixaOutro.hidden && caixaOutro.dataset.pronto) abrirOutro(caixaOutro, campoOutro);
        caixaOutro.dataset.pronto = '1';
      }
      contador.textContent = p.max ? `${sel.length} de ${p.max} escolhidas` + (sel.length >= p.max ? '. Para trocar, desmarque uma opção.' : '') : (sel.length ? `${sel.length} ${sel.length === 1 ? 'escolhida' : 'escolhidas'}` : '');
    };
    p.opcoes!.forEach((o) => {
      const { lab, inp } = opcaoCartao('checkbox', p.id, o, atual().opcoes.includes(o.id));
      inputs.push(inp);
      inp.addEventListener('change', () => {
        let sel = [...atual().opcoes];
        if (inp.checked) {
          // opção exclusiva ("Nenhuma..."): fica sozinha; marcar outra tira a exclusiva
          if (o.exclusiva) sel = [o.id];
          else sel = [...sel.filter((s) => !p.opcoes!.find((x) => x.id === s)?.exclusiva), o.id];
        } else sel = sel.filter((s) => s !== o.id);
        const m: Multi = { opcoes: sel }; if (atual().outro && sel.some((s) => p.opcoes!.find((x) => x.id === s)?.outro)) m.outro = atual().outro;
        E.r[p.id] = m; salvar(); limparErro(fs); sincronizar();
        if (o.outro && inp.checked) requestAnimationFrame(() => campoOutro?.focus());
      });
      lista.appendChild(lab);
      if (o.outro) {
        caixaOutro = el('div', 'pq-outro');
        const id = fs.id + '-outro';
        const l = el('label', 'pq-rotulo', 'Qual?'); l.htmlFor = id;
        campoOutro = el('input'); campoOutro.type = 'text'; campoOutro.id = id; campoOutro.maxLength = 200; campoOutro.placeholder = 'Conte para a gente';
        campoOutro.value = atual().outro ?? '';
        campoOutro.addEventListener('input', () => { E.r[p.id] = { ...atual(), outro: campoOutro!.value }; salvar(); limparErro(fs); });
        caixaOutro.append(l, campoOutro);
        lista.appendChild(caixaOutro);
      }
    });
    fs.append(lista, contador);
    sincronizar();
  } else if (p.tipo === 'escalas') {
    // várias notas de 1 a 10 (um aspecto por bloco, com descrição), num card só
    const atual = () => (E.r[p.id] as Record<string, number>) ?? {};
    const card = el('div', 'pq-escalas');
    p.linhas!.forEach((l) => {
      const sub = el('fieldset', 'pq-aspecto'); sub.dataset.linha = l.id;
      const lg = el('legend'); lg.append(el('span', 'pq-aspecto-t', l.texto), ...(l.apoio ? [el('span', 'pq-aspecto-d', l.apoio)] : []));
      sub.appendChild(lg);
      const grade = el('div', 'pq-escala');
      for (let n = p.min ?? 0; n <= (p.max ?? 10); n++) {
        const lab = el('label', 'pq-nota');
        const inp = el('input'); inp.type = 'radio'; inp.name = `${p.id}-${l.id}`; inp.value = String(n); inp.checked = atual()[l.id] === n;
        inp.setAttribute('aria-label', n === p.min ? `${n}, ${p.rotulo_min}` : n === p.max ? `${n}, ${p.rotulo_max}` : String(n));
        inp.addEventListener('change', () => { E.r[p.id] = { ...atual(), [l.id]: n }; salvar(); sub.classList.remove('pq-faltando'); if (p.linhas!.every((x) => typeof atual()[x.id] === 'number')) limparErro(fs); });
        lab.append(inp, el('span', undefined, String(n)));
        grade.appendChild(lab);
      }
      const extremos = el('div', 'pq-extremos'); extremos.setAttribute('aria-hidden', 'true');
      extremos.append(el('span', undefined, `${p.min ?? 0} = ${p.rotulo_min}`), el('span', undefined, `${p.max ?? 10} = ${p.rotulo_max}`));
      sub.append(grade, extremos);
      card.appendChild(sub);
    });
    fs.append(card);
  } else if (p.tipo === 'escala') {
    const grade = el('div', 'pq-escala');
    for (let n = p.min ?? 0; n <= (p.max ?? 10); n++) {
      const lab = el('label', 'pq-nota');
      const inp = el('input'); inp.type = 'radio'; inp.name = p.id; inp.value = String(n); inp.checked = E.r[p.id] === n;
      inp.setAttribute('aria-label', n === p.min ? `${n}, ${p.rotulo_min}` : n === p.max ? `${n}, ${p.rotulo_max}` : String(n));
      inp.addEventListener('change', () => { E.r[p.id] = n; salvar(); limparErro(fs); });
      lab.append(inp, el('span', undefined, String(n)));
      grade.appendChild(lab);
    }
    const extremos = el('div', 'pq-extremos'); extremos.setAttribute('aria-hidden', 'true');
    extremos.append(el('span', undefined, `0 = ${p.rotulo_min}`), el('span', undefined, `10 = ${p.rotulo_max}`));
    fs.append(grade, extremos);
  } else {
    // Uma característica por cartão, com todas as respostas escritas por extenso em cartões clicáveis (como nas outras perguntas)
    const linhas = el('div', 'pq-matriz');
    const atual = () => (E.r[p.id] as Record<string, string>) ?? {};
    p.linhas!.forEach((l) => {
      const sub = el('fieldset', 'pq-linha'); sub.dataset.linha = l.id;
      sub.appendChild(el('legend', undefined, l.texto));
      const ops = el('div', 'pq-linha-ops');
      p.colunas!.forEach((c) => {
        const { lab, inp } = opcaoCartao('radio', `${p.id}-${l.id}`, { id: c.id, texto: c.texto }, atual()[l.id] === c.id);
        if (c.id === 'na') lab.classList.add('pq-op-na');
        inp.addEventListener('change', () => { E.r[p.id] = { ...atual(), [l.id]: c.id }; salvar(); sub.classList.remove('pq-faltando'); if (p.linhas!.every((x) => atual()[x.id])) limparErro(fs); });
        ops.appendChild(lab);
      });
      sub.appendChild(ops);
      linhas.appendChild(sub);
    });
    fs.append(linhas);
  }
  fs.appendChild(erro);
  return fs;
}

function montarPerfil() {
  const fs = el('fieldset', 'pq-etapa'); fs.id = 'pq-perfil'; fs.dataset.etapa = String(ETAPA_PERFIL);
  cabecalho(fs, 'Sobre você', 'Para terminar, conte um pouco sobre você',    'Usamos estas informações só para analisar os resultados em conjunto, sem identificar ninguém.', 'sobre você');
  PERFIL.forEach((c) => {
    if (c.inicio) return; // cidade e bairro ficam na pergunta 1
    if (c.tipo === 'lista') { fs.appendChild(montarLista(c)); return; }
    const bloco = el('div', 'pq-perfil-campo'); bloco.id = 'pq-perfil-' + c.id;
    const tituloId = bloco.id + '-titulo';
    const t = el('p', 'pq-perfil-titulo'); t.id = tituloId; t.append(c.texto, el('span', 'pq-obrig', ' *'));
    // computador: cartões em 2 colunas iguais (gênero, faixa etária e estado civil, no mesmo padrão); celular: lista suspensa
    const grupo = el('div', 'pq-so-desk pq-ops pq-ops-2');
    grupo.setAttribute('role', 'radiogroup'); grupo.setAttribute('aria-labelledby', tituloId);
    const radios: HTMLInputElement[] = [];
    c.opcoes.forEach((o) => {
      const { lab, inp } = opcaoCartao('radio', 'perfil-' + c.id, o, perfilAtual()[c.id] === o.id);
      grupo.appendChild(lab); radios.push(inp);
    });
    const sel = el('select', 'pq-so-movel pq-select'); sel.id = bloco.id + '-sel'; sel.setAttribute('aria-labelledby', tituloId);
    const vazio = el('option', undefined, 'Selecione'); vazio.value = ''; vazio.disabled = true; sel.appendChild(vazio);
    c.opcoes.forEach((o) => { const op = el('option', undefined, o.texto.replace(/ \(especifique\)$/, '')); op.value = o.id; sel.appendChild(op); });
    sel.value = perfilAtual()[c.id] ?? '';
    const outroOp = c.opcoes.find((o) => o.outro);
    let caixa: HTMLElement | null = null, campoOutro: HTMLInputElement | null = null;
    if (outroOp) {
      caixa = el('div', 'pq-outro pq-perfil-outro'); const id = bloco.id + '-outro';
      const l = el('label', 'pq-rotulo', 'Qual?'); l.htmlFor = id;
      campoOutro = el('input'); campoOutro.type = 'text'; campoOutro.id = id; campoOutro.maxLength = 100; campoOutro.placeholder = 'Como você se identifica';
      campoOutro.value = perfilAtual()[c.id + '_outro'] ?? '';
      campoOutro.addEventListener('input', () => { E.r.perfil = { ...perfilAtual(), [c.id + '_outro']: campoOutro!.value }; salvar(); erroPerfil(c.id, ''); });
      caixa.append(l, campoOutro);
    }
    const definir = (v: string) => {
      const novo: Perfil = { ...perfilAtual(), [c.id]: v };
      if (!outroOp || v !== outroOp.id) delete novo[c.id + '_outro'];
      E.r.perfil = novo; salvar(); erroPerfil(c.id, '');
      radios.forEach((r) => { r.checked = r.value === v; }); sel.value = v;
      if (caixa) { const antes = caixa.hidden; caixa.hidden = v !== outroOp!.id; if (v !== outroOp!.id && campoOutro) campoOutro.value = ''; if (antes && !caixa.hidden) abrirOutro(caixa, campoOutro); }
    };
    radios.forEach((r) => r.addEventListener('change', () => definir(r.value)));
    sel.addEventListener('change', () => definir(sel.value));
    if (caixa) caixa.hidden = perfilAtual()[c.id] !== outroOp!.id;
    const err = el('p', 'pq-erro'); err.id = bloco.id + '-erro'; err.hidden = true; err.setAttribute('role', 'alert');
    bloco.append(t, grupo, sel);
    if (caixa) bloco.appendChild(caixa);
    bloco.appendChild(err);
    fs.appendChild(bloco);
  });
  fs.appendChild(erroBox(fs.id));
  return fs;
}
// Cidade e bairro: listas longas, então sempre em lista suspensa. A cidade segue a pergunta 1
// (Curitiba fica preenchida; Região Metropolitana escolhe entre as 28 cidades); o bairro, agrupado
// pelas regionais da Prefeitura, só aparece para Curitiba.
function montarLista(c: CampoPerfil) {
  const bloco = el('div', 'pq-perfil-campo'); bloco.id = 'pq-perfil-' + c.id;
  // a lista nativa guarda o valor; quem escolhe é o botão, que abre a janela com busca
  const sel = el('select', 'pq-select'); sel.id = bloco.id + '-sel'; sel.hidden = true; sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
  const bt = el('button', 'pq-select pq-escolher'); bt.type = 'button'; bt.id = bloco.id + '-bt'; bt.setAttribute('aria-haspopup', 'dialog');
  bt.appendChild(el('span', 'pq-escolher-txt', 'Selecione'));
  const t = el('label', 'pq-perfil-titulo'); t.htmlFor = bt.id; t.append(...realcar(c.texto_inicio ?? c.texto, c.destaque_inicio ?? c.destaque), el('span', 'pq-obrig', ' *'));
  const nota = el('p', 'pq-perfil-nota'); nota.id = bloco.id + '-nota'; nota.hidden = true;
  const err = el('p', 'pq-erro'); err.id = bloco.id + '-erro'; err.hidden = true; err.setAttribute('role', 'alert');
  bt.setAttribute('aria-describedby', nota.id + ' ' + err.id);
  sel.addEventListener('change', () => {
    E.r.perfil = { ...perfilAtual(), [c.id]: sel.value }; salvar(); erroPerfil(c.id, ''); rotuloEscolha(sel);
    if (c.id === 'cidade') sincronizarLocal();
  });
  bt.addEventListener('click', () => abrirBusca(c, sel, bt));
  bloco.append(t, sel, bt, nota, err);
  return bloco;
}
// texto do botão: a opção escolhida ou "Selecione"
function rotuloEscolha(sel: HTMLSelectElement) {
  const bt = document.getElementById(sel.id.replace(/-sel$/, '-bt')); if (!bt) return;
  const op = sel.value ? sel.selectedOptions[0] : null;
  bt.querySelector('.pq-escolher-txt')!.textContent = op ? op.textContent : 'Selecione';
  bt.classList.toggle('pq-escolher-vazio', !op);
}
const semAcento = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// Janela com busca para bairro (75, agrupados por regional) e cidade da Região Metropolitana (28)
function abrirBusca(c: CampoPerfil, sel: HTMLSelectElement, bt: HTMLButtonElement) {
  const ehBairro = c.id === 'bairro';
  const dlg = el('dialog', 'pq-busca'); dlg.setAttribute('aria-labelledby', 'pq-busca-titulo');
  const topo = el('div', 'pq-busca-topo');
  const h = el('h2', undefined, ehBairro ? 'Em qual bairro você mora?' : 'Em qual cidade você mora?'); h.id = 'pq-busca-titulo';
  const fechar = el('button', 'pq-busca-fechar'); fechar.type = 'button'; fechar.setAttribute('aria-label', 'Fechar');
  fechar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const campo = el('div', 'pq-busca-campo');
  campo.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const busca = el('input'); busca.type = 'search'; busca.placeholder = ehBairro ? 'Digite o nome do bairro' : 'Digite o nome da cidade';
  busca.setAttribute('aria-label', busca.placeholder); busca.autocomplete = 'off'; busca.enterKeyHint = 'search';
  campo.appendChild(busca);
  topo.append(h, fechar, campo);
  const lista = el('div', 'pq-busca-lista');
  const status = el('p', 'pq-sr'); status.setAttribute('aria-live', 'polite');
  const vazio = el('p', 'pq-busca-vazio'); vazio.hidden = true;
  lista.appendChild(vazio);
  // monta a partir das opções da lista nativa (mesma ordem e mesmos grupos)
  const itens: { b: HTMLButtonElement; chave: string; grupo?: HTMLElement }[] = [];
  const grupos: { g: HTMLElement; chave: string }[] = [];
  const item = (op: HTMLOptionElement, chaveGrupo: string, g?: HTMLElement) => {
    const b = el('button', 'pq-busca-op'); b.type = 'button'; b.dataset.v = op.value;
    const marcado = op.value === sel.value;
    b.setAttribute('aria-pressed', String(marcado));
    b.append(el('span', undefined, op.textContent ?? ''));
    if (marcado) b.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>');
    b.addEventListener('click', () => escolher(op.value));
    itens.push({ b, chave: semAcento((op.textContent ?? '') + ' ' + chaveGrupo), grupo: g });
    return b;
  };
  Array.from(sel.children).forEach((n) => {
    if (n instanceof HTMLOptGroupElement) {
      const g = el('div', 'pq-busca-grupo'); g.setAttribute('role', 'group');
      const tit = el('p', 'pq-busca-grupo-tit', n.label); tit.id = 'pq-busca-g' + grupos.length; g.setAttribute('aria-labelledby', tit.id);
      g.appendChild(tit);
      Array.from(n.children).forEach((op) => g.appendChild(item(op as HTMLOptionElement, n.label, g)));
      grupos.push({ g, chave: semAcento(n.label) }); lista.appendChild(g);
    } else if (n instanceof HTMLOptionElement && n.value) lista.appendChild(item(n, ''));
  });
  const filtrar = () => {
    const q = semAcento(busca.value.trim());
    let n = 0;
    itens.forEach((i) => { const ok = !q || i.chave.includes(q); i.b.hidden = !ok; if (ok) n++; });
    grupos.forEach(({ g }) => { g.hidden = !g.querySelector('.pq-busca-op:not([hidden])'); });
    vazio.hidden = n > 0;
    vazio.textContent = `Não encontramos “${busca.value.trim()}”. Confira a escrita ou procure pelo nome da ${ehBairro ? 'regional' : 'cidade'}.`;
    status.textContent = q ? (n ? `${n} ${n === 1 ? 'resultado' : 'resultados'}` : 'Nenhum resultado') : '';
  };
  const sair = () => { dlg.close(); };
  const escolher = (v: string) => {
    sel.value = v; sel.dispatchEvent(new Event('change'));
    sair();
    if (!reduzir) { bt.classList.remove('pq-escolhido'); void bt.offsetWidth; bt.classList.add('pq-escolhido'); }
  };
  busca.addEventListener('input', filtrar);
  busca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); const vis = itens.filter((i) => !i.b.hidden); if (vis.length === 1) vis[0].b.click(); else vis[0]?.b.focus(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); itens.find((i) => !i.b.hidden)?.b.focus(); }
  });
  lista.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const vis = itens.filter((i) => !i.b.hidden).map((i) => i.b);
    const k = vis.indexOf(document.activeElement as HTMLButtonElement); if (k < 0) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && k === 0) busca.focus(); else vis[Math.min(vis.length - 1, k + (e.key === 'ArrowDown' ? 1 : -1))].focus();
  });
  fechar.addEventListener('click', sair);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) sair(); });
  dlg.addEventListener('close', () => { dlg.remove(); document.documentElement.classList.remove('pq-trava'); bt.focus({ preventScroll: true }); });
  dlg.append(topo, lista, status);
  document.body.appendChild(dlg);
  document.documentElement.classList.add('pq-trava');
  dlg.showModal();
  // no computador o cursor já vai para a busca; no celular, mostra a lista sem abrir o teclado
  if (matchMedia('(min-width: 640px)').matches) busca.focus(); else fechar.focus();
  dlg.querySelector<HTMLElement>('.pq-busca-op[aria-pressed="true"]')?.scrollIntoView({ block: 'center' });
}
function opcoesLista(sel: HTMLSelectElement, c: CampoPerfil, ops: OpcaoLista[]) {
  const vazio = el('option', undefined, 'Selecione'); vazio.value = ''; vazio.disabled = true;
  sel.replaceChildren(vazio);
  const grupos = new Map<string, HTMLOptGroupElement>();
  ops.forEach((o) => {
    const op = el('option', undefined, o.texto); op.value = o.id;
    if (!o.regional) { sel.appendChild(op); return; }
    let g = grupos.get(o.regional);
    if (!g) { g = el('optgroup'); g.label = 'Regional ' + o.regional; grupos.set(o.regional, g); sel.appendChild(g); }
    g.appendChild(op);
  });
  // "Prefiro não informar" no fim, depois dos grupos
  const ni = sel.querySelector('option[value="nao_informar"]'); if (ni) sel.appendChild(ni);
  sel.value = perfilAtual()[c.id] ?? '';
  rotuloEscolha(sel);
}
function sincronizarLocal() {
  const cidade = PERFIL.find((c) => c.id === 'cidade'), bairro = PERFIL.find((c) => c.id === 'bairro');
  const bC = document.getElementById('pq-perfil-cidade'), bB = document.getElementById('pq-perfil-bairro');
  if (!cidade || !bC) return;
  const pf = { ...perfilAtual() };
  const q1 = E.r.q1;
  // Curitiba: a cidade fica definida e aparece o bairro; Região Metropolitana: escolhe a cidade; outra cidade: nenhum
  if (q1 === 'sim') pf.cidade = 'curitiba';
  else if (pf.cidade === 'curitiba' || q1 !== 'rmc') delete pf.cidade;
  if (q1 !== 'sim') delete pf.bairro;
  E.r.perfil = pf;
  const antesC = bC.hidden, antesB = bB?.hidden ?? true;
  bC.hidden = q1 !== 'rmc';
  if (q1 === 'rmc') opcoesLista($<HTMLSelectElement>('pq-perfil-cidade-sel'), cidade, cidade.opcoes.filter((o) => o.id !== 'curitiba'));
  if (bairro && bB) { bB.hidden = q1 !== 'sim'; if (q1 === 'sim') opcoesLista($<HTMLSelectElement>('pq-perfil-bairro-sel'), bairro, bairro.opcoes); }
  erroPerfil('cidade', ''); erroPerfil('bairro', '');
  // o campo que acabou de aparecer entra com movimento suave
  [[bC, antesC], [bB, antesB]].forEach(([b, antes]) => {
    const e = b as HTMLElement | null;
    if (e && antes && !e.hidden && !reduzir) { e.classList.remove('pq-entra'); void e.offsetWidth; e.classList.add('pq-entra'); }
  });
  salvar();
}
function erroPerfil(id: string, msg: string) {
  const e = $('pq-perfil-' + id + '-erro'); if (!e) return;
  e.textContent = msg; e.hidden = !msg; $('pq-perfil-' + id).classList.toggle('pq-invalido', !!msg);
}

function montarRelato() {
  const fs = el('fieldset', 'pq-etapa'); fs.id = 'pq-relato'; fs.dataset.etapa = String(ETAPA_RELATO);
  cabecalho(fs, 'Para finalizar · opcional', 'Você já teve alguma experiência frustrante ao procurar ou comprar roupas e acessórios?', 'Pode ser relacionada à busca, ao atendimento, à disponibilidade das peças, à qualidade ou ao pós-venda.', 'experiência frustrante');
  const lab = el('label', 'pq-rotulo pq-oculto', 'Sua experiência (opcional)'); lab.htmlFor = 'pq-relato-txt';
  const ta = el('textarea'); ta.id = 'pq-relato-txt'; ta.rows = 6; ta.maxLength = RELATO_MAX; ta.placeholder = 'Conte o que aconteceu e, se possível, o que poderia ter sido diferente…'; ta.value = E.relato;
  const cont = el('p', 'pq-contador pq-contador-dir'); cont.id = 'pq-relato-cont';
  ta.setAttribute('aria-describedby', 'pq-relato-apoio pq-relato-cont');
  const atualizar = () => { cont.textContent = `${ta.value.length.toLocaleString('pt-BR')}/${RELATO_MAX.toLocaleString('pt-BR')}`; };
  ta.addEventListener('input', () => { E.relato = ta.value; salvar(); atualizar(); });
  atualizar();
  fs.append(lab, ta, cont);
  return fs;
}

function mascaraWhats(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const dd = d.slice(0, 2), r = d.slice(2);
  if (r.length <= 4) return `(${dd}) ${r}`;
  if (d.length <= 10) return `(${dd}) ${r.slice(0, 4)}-${r.slice(4)}`;
  return `(${dd}) ${r.slice(0, 5)}-${r.slice(5)}`;
}
const whatsValido = (v: string) => /^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(v.replace(/\D/g, ''));
const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function campo(id: string, rotulo: string, tipo: string, valor: string, ph: string, extra: (i: HTMLInputElement) => void) {
  const q = el('div', 'pq-campo'); q.id = id + '-q';
  const l = el('label', 'pq-rotulo'); l.htmlFor = id; l.append(rotulo, el('span', 'pq-obrig', ' *'));
  const i = el('input'); i.id = id; i.type = tipo; i.value = valor; i.placeholder = ph; i.required = true;
  const err = el('p', 'pq-erro'); err.id = id + '-erro'; err.hidden = true;
  i.setAttribute('aria-describedby', err.id);
  extra(i);
  q.append(l, i, err);
  return q;
}

function montarNovidades() {
  const fs = el('fieldset', 'pq-etapa'); fs.id = 'pq-novidades'; fs.dataset.etapa = String(ETAPA_NOV);
  cabecalho(fs, 'Última etapa', 'Sua contribuição vale vantagens exclusivas', undefined, 'vantagens exclusivas');
  // destaque: a contribuição da pessoa e as vantagens no lançamento
  const vant = el('div', 'pq-vantagem');
  const ic = el('span', 'pq-vantagem-ic'); ic.setAttribute('aria-hidden', 'true');
  ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';
  const tx = el('div');
  tx.append(el('p', 'pq-vantagem-t', 'Obrigada por contribuir com a solução que estamos desenvolvendo!'),
    el('p', 'pq-vantagem-d', 'Por isso, você terá vantagens exclusivas quando a plataforma for lançada.'));
  vant.append(ic, tx);
  const perg = el('p', 'pq-nov-perg', 'Quer receber os avisos do lançamento e das suas vantagens pelo e-mail e WhatsApp que você informou?');
  perg.id = 'pq-novidades-perg'; fs.setAttribute('aria-describedby', perg.id);
  const lista = el('div', 'pq-ops pq-nov-ops');
  const opts: [Estado['nov'], string][] = [['sim', 'Sim, quero receber os avisos do lançamento e das minhas vantagens.'], ['nao', 'Não, obrigado(a).']];
  opts.forEach(([v, t]) => {
    const { lab, inp } = opcaoCartao('radio', 'novidades', { id: v, texto: t }, E.nov === v);
    if (v === 'sim') lab.classList.add('pq-op-sim');
    inp.addEventListener('change', () => { E.nov = v; salvar(); limparErro(fs); atualizarBotao(); });
    lista.appendChild(lab);
  });
  const nota = el('p', 'pq-nota-consent');
  nota.append('Ao escolher "Sim", você autoriza o Dani Moscatelli — Experience Design Studio a usar seu e-mail e WhatsApp só para esses avisos, conforme a ');
  const a = el('a', undefined, 'Política de Privacidade'); a.href = '/privacidade/#pesquisa-moda'; a.dataset.politica = '';
  nota.append(a, '. Você pode cancelar quando quiser.');
  fs.append(vant, perg, lista, nota, erroBox(fs.id));
  return fs;
}

/* Identificação: antes da primeira pergunta. Garante uma participação por pessoa e explica o uso dos dados (LGPD). */
function montarIdentificacao() {
  const fs = el('fieldset', 'pq-etapa'); fs.id = 'pq-id'; fs.dataset.etapa = String(ETAPA_ID);
  cabecalho(fs, 'Antes de começar', 'Conte quem é você',
    'Pedimos seus dados para garantir uma participação por pessoa e para entregar as suas vantagens no lançamento.', 'quem é você');
  const campos = el('div', 'pq-contato');
  campos.append(
    campo('pq-nome', 'Seu nome', 'text', E.nome, 'Como podemos chamar você?', (i) => { i.autocomplete = 'name'; i.maxLength = 120; i.addEventListener('input', () => { E.nome = i.value; salvar(); erroCampo(i, ''); limparErro(fs); }); }),
    campo('pq-email', 'E-mail', 'email', E.email, 'seuemail@exemplo.com', (i) => { i.autocomplete = 'email'; i.inputMode = 'email'; i.maxLength = 254; i.spellcheck = false; i.addEventListener('input', () => { E.email = i.value; salvar(); erroCampo(i, ''); limparErro(fs); }); }),
    campo('pq-whats', 'WhatsApp com DDD', 'tel', mascaraWhats(E.whats), '(41) 99999-9999', (i) => { i.autocomplete = 'tel-national'; i.inputMode = 'tel'; i.addEventListener('input', () => { i.value = mascaraWhats(i.value); E.whats = i.value; salvar(); erroCampo(i, ''); limparErro(fs); }); }),
  );
  const lgpd = el('div', 'pq-lgpd');
  const ic = el('span', 'pq-ic'); ic.setAttribute('aria-hidden', 'true');
  ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  const tx = el('p');
  tx.append(el('strong', undefined, 'Seus dados estão protegidos pela LGPD. '), 'Usamos seu nome, e-mail e WhatsApp só para esta pesquisa. As respostas são analisadas em conjunto e nunca divulgadas com seu nome.');
  lgpd.append(ic, tx);
  const aceite = el('div', 'pq-campo pq-aceite-q'); aceite.id = 'pq-ciente-q';
  const lab = el('label', 'pq-aceite');
  const cb = el('input'); cb.type = 'checkbox'; cb.id = 'pq-ciente'; cb.checked = E.ciente;
  const txt = el('span');
  txt.append((Q as { identificacao: { texto: string } }).identificacao.texto.replace(/conforme a Política de Privacidade\.$/, 'conforme a '));
  const a = el('a', undefined, 'Política de Privacidade'); a.href = '/privacidade/#pesquisa-moda'; a.dataset.politica = '';
  txt.append(a, '.');
  lab.append(cb, el('span', 'pq-caixa'), txt);
  const errA = el('p', 'pq-erro'); errA.id = 'pq-ciente-erro'; errA.hidden = true; cb.setAttribute('aria-describedby', errA.id);
  cb.addEventListener('change', () => { E.ciente = cb.checked; salvar(); erroCampo(cb, ''); });
  aceite.append(lab, errA);
  // aviso da LGPD e o aceite no mesmo cartão branco, separados por uma linha
  const cartao = el('div', 'pq-lgpd-cartao'); cartao.append(lgpd, aceite);
  fs.append(campos, cartao, erroBox(fs.id));
  return fs;
}

function erroCampo(i: HTMLInputElement, msg: string) {
  const e = $(i.id + '-erro'); if (!e) return;
  e.textContent = msg; e.hidden = !msg;
  i.setAttribute('aria-invalid', msg ? 'true' : 'false');
  i.closest('.pq-campo')?.classList.toggle('pq-invalido', !!msg);
}

/* ---------- Validação de cada etapa ---------- */
function mostrarErro(fs: HTMLElement, msg: string) {
  const e = $(fs.id + '-erro'); e.textContent = msg; e.hidden = false;
  fs.classList.add('pq-invalido'); fs.setAttribute('aria-invalid', 'true');
  if (!reduzir) { fs.classList.remove('pq-treme'); void fs.offsetWidth; fs.classList.add('pq-treme'); }
}
function limparErro(fs: HTMLElement) {
  const e = $(fs.id + '-erro'); if (e) { e.hidden = true; e.textContent = ''; }
  fs.classList.remove('pq-invalido'); fs.removeAttribute('aria-invalid');
}
function validarEtapa(i: number): boolean {
  const fs = $('pq-etapas').querySelector<HTMLElement>(`[data-etapa="${i}"]`)!;
  if (i < TOTAL) {
    const p = PERGUNTAS[i], v = E.r[p.id];
    if (p.tipo === 'unica' && typeof v !== 'string') { mostrarErro(fs, 'Escolha uma opção para continuar.'); return false; }
    if (p.id === 'q1') {
      const pf = perfilAtual();
      if (v === 'rmc' && !pf.cidade) { erroPerfil('cidade', 'Escolha a cidade onde você mora.'); $('pq-perfil-cidade').scrollIntoView({ block: 'center', behavior: reduzir ? 'auto' : 'smooth' }); return false; }
      if (v === 'sim' && !pf.bairro) { erroPerfil('bairro', 'Escolha o seu bairro. Se preferir, marque "Prefiro não informar" no fim da lista.'); $('pq-perfil-bairro').scrollIntoView({ block: 'center', behavior: reduzir ? 'auto' : 'smooth' }); return false; }
    }
    if (p.tipo === 'ranking' && !(Array.isArray(v) && v.length)) { mostrarErro(fs, p.id === 'q2' ? `Escolha pelo menos uma opção, na ordem de onde você mais comprou (até ${p.max}).` : `Escolha pelo menos uma opção, na ordem do que vem primeiro para você (até ${p.max}).`); return false; }
    if (p.tipo === 'escala' && typeof v !== 'number') { mostrarErro(fs, 'Escolha uma nota de 0 a 10 para continuar.'); return false; }
    if (p.tipo === 'escalas') {
      const r = (v as Record<string, number>) ?? {};
      const faltam = p.linhas!.filter((l) => typeof r[l.id] !== 'number');
      fs.querySelectorAll<HTMLElement>('.pq-aspecto').forEach((x) => x.classList.toggle('pq-faltando', faltam.some((l) => l.id === x.dataset.linha)));
      if (faltam.length) { mostrarErro(fs, faltam.length === 1 ? `Falta dar nota para: ${faltam[0].texto}.` : `Faltam notas para ${faltam.length} aspectos.`); return false; }
    }
    if (p.tipo === 'matriz') {
      const r = (v as Record<string, string>) ?? {};
      const faltam = p.linhas!.filter((l) => !r[l.id]);
      fs.querySelectorAll<HTMLElement>('.pq-linha').forEach((x) => x.classList.toggle('pq-faltando', faltam.some((l) => l.id === x.dataset.linha)));
      if (faltam.length) { mostrarErro(fs, faltam.length === 1 ? `Falta responder: ${faltam[0].texto}.` : `Faltam ${faltam.length} itens para responder.`); return false; }
    }
    if (p.tipo === 'multipla') {
      const m = (v as Multi) ?? { opcoes: [] };
      if (!m.opcoes.length) { mostrarErro(fs, 'Escolha pelo menos uma opção para continuar.'); return false; }
      const outro = p.opcoes!.find((o) => o.outro);
      if (outro && m.opcoes.includes(outro.id) && !(m.outro ?? '').trim()) { mostrarErro(fs, 'Conte qual é a outra opção ou desmarque "' + outro.texto.replace(/ \(especifique\)/, '') + '".'); $<HTMLInputElement>(fs.id + '-outro')?.focus(); return false; }
    }
    return true;
  }
  if (i === ETAPA_RELATO) return true;
  if (i === ETAPA_PERFIL) {
    const pf = perfilAtual(); let primeiro: HTMLElement | null = null;
    const FALTA: Record<string, string> = {
      cidade: 'Escolha a cidade onde você mora.',
      bairro: 'Escolha o seu bairro. Se preferir, marque "Prefiro não informar" no fim da lista.',
      genero: 'Escolha uma opção. Se preferir, marque "Prefiro não informar".',
      faixa_etaria: 'Escolha sua faixa etária. Se preferir, marque "Prefiro não informar".',
      estado_civil: 'Escolha seu estado civil. Se preferir, marque "Prefiro não informar".',
    };
    PERFIL.forEach((c) => {
      if (c.inicio || !perfilAplica(c)) { if (!c.inicio) erroPerfil(c.id, ''); return; }
      const outro = c.opcoes.find((o) => o.outro);
      const msg = !pf[c.id] ? FALTA[c.id] ?? 'Responda esta pergunta.'
        : outro && pf[c.id] === outro.id && !(pf[c.id + '_outro'] ?? '').trim() ? 'Conte como você se identifica ou escolha outra opção.' : '';
      erroPerfil(c.id, msg);
      if (msg && !primeiro) primeiro = $('pq-perfil-' + c.id);
    });
    if (primeiro) { (primeiro as HTMLElement).scrollIntoView({ block: 'center', behavior: reduzir ? 'auto' : 'smooth' }); return false; }
    return true;
  }
  if (i === ETAPA_ID) {
    const checks: [string, string][] = [
      ['pq-nome', E.nome.trim() ? '' : 'Informe como podemos chamar você.'],
      ['pq-email', !E.email.trim() ? 'Informe o seu e-mail.' : emailValido(E.email) ? '' : 'Confira o e-mail. Exemplo: seuemail@exemplo.com'],
      ['pq-whats', !E.whats.trim() ? 'Informe o seu WhatsApp com DDD.' : whatsValido(E.whats) ? '' : 'Confira o número. Use o DDD e o número, como (41) 99999-9999.'],
      ['pq-ciente', E.ciente ? '' : 'Para participar, marque que você leu e concorda.'],
    ];
    let primeiro: HTMLInputElement | null = null;
    checks.forEach(([id, msg]) => { const inp = $<HTMLInputElement>(id); erroCampo(inp, msg); if (msg && !primeiro) primeiro = inp; });
    if (primeiro) { (primeiro as HTMLInputElement).focus(); return false; }
    return true;
  }
  // novidades
  if (!E.nov) { mostrarErro(fs, 'Escolha uma das opções para concluir.'); return false; }
  return true;
}

/* ---------- Navegação ---------- */
// pergunta em que a pesquisa encerrou (ex.: "Outra cidade" na 1, "Não comprei" na 2); olha todas as que valem
// para a pessoa, não só as primeiras (a 1.1 condicional fica no meio)
const encerraEm = () => {
  for (const p of PERGUNTAS) { if (aplica(p) && opcaoQueEncerra(p)) return p.id; }
  return null;
};
function atualizarBotao() {
  const b = $('pq-continuar'), t = b.querySelector('.pq-btn-txt')!;
  const i = E.etapa, p = PERGUNTAS[i];
  const enc = opcaoQueEncerra(p);
  t.textContent = enviando ? (i === ETAPA_ID ? 'Conferindo…' : 'Enviando…') : enc ? 'Concluir' : i === ETAPA_NOV ? 'Concluir participação' : i === ETAPA_ID ? 'Começar as perguntas' : i === ETAPA_RELATO && !E.relato.trim() ? 'Pular' : 'Continuar';
}
function irPara(i: number, voltando = false) {
  E.etapa = i; salvar();
  $('pq-erro-geral').hidden = true;
  const etapas = [...$('pq-etapas').children] as HTMLElement[];
  etapas.forEach((x) => { x.hidden = Number(x.dataset.etapa) !== i; });
  const atual = etapas.find((x) => Number(x.dataset.etapa) === i)!;
  if (!reduzir) { atual.classList.remove('pq-entra', 'pq-entra-volta'); void atual.offsetWidth; atual.classList.add(voltando ? 'pq-entra-volta' : 'pq-entra'); }
  // progresso: as 10 perguntas enchem a barra; as etapas extras mostram a barra cheia
  const pct = i === ETAPA_ID ? 0 : i < TOTAL ? Math.round(((PERGUNTAS[i].condicao ? numero(i) : numero(i) - 1) / PRINCIPAIS) * 100) : 100;
  $('pq-barra').style.width = pct + '%';
  $('pq-barra').parentElement!.setAttribute('aria-valuenow', String(pct));
  $('pq-etapa').textContent = i < TOTAL ? etiqueta(i) : i === ETAPA_ID ? 'Antes de começar' : i === ETAPA_PERFIL ? 'Quase lá · sobre você' : i === ETAPA_RELATO ? 'Quase lá · etapa opcional' : 'Última etapa';
  if (i < TOTAL && PERGUNTAS[i].id === 'q1') sincronizarLocal();
  atualizarBotao();
  window.scrollTo({ top: 0, behavior: reduzir ? 'auto' : 'smooth' });
  atual.querySelector<HTMLElement>('legend')?.focus({ preventScroll: true });
}

async function enviar(final: boolean) {
  if (enviando) return;
  enviando = true; atualizarBotao();
  const b = $<HTMLButtonElement>('pq-continuar'); b.disabled = true; b.classList.add('pq-carregando'); $<HTMLButtonElement>('pq-voltar').disabled = true;
  const erroGeral = $('pq-erro-geral'); erroGeral.hidden = true;
  const enc = encerraEm();
  const respostas: Record<string, unknown> = {};
  for (const p of PERGUNTAS) { if (aplica(p)) respostas[p.id] = E.r[p.id]; if (p.id === enc) break; }
  const corpo: Record<string, unknown> = {
    acao: 'enviar', pesquisa: Q.slug, envio_id: E.envio, respostas, site: $<HTMLInputElement>('pq-site').value,
    identificacao: { nome: E.nome, email: E.email, whatsapp: E.whats, ciente: E.ciente },
  };
  if (final) {
    corpo.perfil = perfilAtual();
    corpo.relato = E.relato;
    corpo.novidades = { quer: E.nov === 'sim' };
  }
  try {
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
    const out = await res.json().catch(() => ({}));
    if (res.status === 410) { concluir('fora'); return; }
    if (res.status === 409 && out.ja_respondeu) { concluir('ja'); return; }
    if (!res.ok || !out.ok) throw new Error(out.error || 'Não foi possível enviar agora.');
    // não comprou este ano (pergunta 2) tem tela própria; fora de Curitiba e Região Metropolitana, a de encerramento
    concluir(enc === 'q2' ? 'semcompras' : enc ? 'encerrada' : 'obrigada', E.nov === 'sim');
  } catch (e) {
    erroGeral.textContent = (e instanceof Error && e.message && !/fetch|network/i.test(e.message) ? e.message : 'Não foi possível enviar. Confira sua conexão.') + ' Suas respostas continuam aqui; toque no botão para tentar de novo.';
    erroGeral.hidden = false;
  } finally {
    enviando = false; b.disabled = false; b.classList.remove('pq-carregando'); $<HTMLButtonElement>('pq-voltar').disabled = false; atualizarBotao();
  }
}

function concluir(tipo: 'obrigada' | 'encerrada' | 'semcompras' | 'fora' | 'ja', comContato = false, animar = true) {
  // dados salvos no servidor: guarda nesta sessão que a participação terminou e apaga o rascunho.
  // (O limite de uma participação por pessoa é feito no servidor, pelo e-mail e WhatsApp.)
  if (tipo === 'obrigada' || tipo === 'encerrada' || tipo === 'semcompras') guardar(CHAVE_FIM, { tipo, comContato, em: Date.now() });
  if (tipo !== 'fora') { try { localStorage.removeItem(CHAVE_RASCUNHO); sessionStorage.removeItem(CHAVE_RASCUNHO + '-contato'); } catch { /* sem armazenamento */ } }
  if (tipo === 'obrigada') {
    $('pq-obrigada-msg').textContent = comContato
      ? 'Assim que a plataforma for lançada, avisaremos você por e\u2011mail e WhatsApp para que fique por dentro de todas as novidades!'
      : 'Obrigada por compartilhar um pouquinho da sua experiência com a gente!';
    $('pq-obrigada-dados').hidden = !comContato;
    mostrarTela('pq-obrigada');
    if (animar) confete();
  } else mostrarTela(tipo === 'fora' ? 'pq-fora-do-ar' : tipo === 'ja' ? 'pq-ja' : tipo === 'semcompras' ? 'pq-semcompras' : 'pq-encerrada');
}

/* Confete explodindo a partir do selo de sucesso (só para quem concluiu tudo; respeita "menos movimento"). */
function confete() {
  if (reduzir) return;
  const cv = el('canvas'); cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d'); if (!ctx) { cv.remove(); return; }
  const dpr = window.devicePixelRatio || 1, W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
  const alvo = document.querySelector('#pq-obrigada .pq-check')?.getBoundingClientRect();
  const ox = alvo ? alvo.left + alvo.width / 2 : W / 2, oy = alvo ? alvo.top + alvo.height / 2 : H * 0.3;
  const cores = ['#D44D4D', '#D44D4D', '#FFB3AE', '#5C6986', '#A8AFBD', '#FFD166'];
  const ps = Array.from({ length: 170 }, () => {
    const ang = Math.random() * Math.PI * 2, vel = 4 + Math.random() * 9;
    return { x: ox, y: oy, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 4, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35, c: cores[Math.floor(Math.random() * cores.length)] };
  });
  const t0 = performance.now();
  const quadro = (t: number) => {
    const dt = t - t0;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = dt > 2600 ? Math.max(0, 1 - (dt - 2600) / 900) : 1;
    ps.forEach((p) => {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.22; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r))); ctx.restore();
    });
    if (dt < 3500) requestAnimationFrame(quadro); else cv.remove();
  };
  setTimeout(() => requestAnimationFrame(quadro), 350); // depois que o card aparece
}

/* Confere no servidor se este e-mail ou WhatsApp já participou, antes de abrir as perguntas. */
async function conferirId() {
  if (enviando) return;
  enviando = true; atualizarBotao();
  const b = $<HTMLButtonElement>('pq-continuar'); b.disabled = true; b.classList.add('pq-carregando');
  const fs = $('pq-id');
  try {
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'verificar', pesquisa: Q.slug, email: E.email, whatsapp: E.whats }) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || '');
    if (out.ja_respondeu) { mostrarErro(fs, 'Este e-mail ou WhatsApp já participou da pesquisa. Cada pessoa participa uma vez. Obrigada!'); return; }
    enviando = false;
    const destino = retomar >= 0 && retomar !== ETAPA_ID ? retomar : 0; retomar = -1;
    irPara(destino);
  } catch (e) {
    mostrarErro(fs, (e instanceof Error && e.message && !/fetch|network/i.test(e.message) ? e.message : 'Não foi possível conferir agora. Confira sua conexão e tente de novo.'));
  } finally {
    enviando = false; b.disabled = false; b.classList.remove('pq-carregando'); atualizarBotao();
  }
}

/* ---------- Política de privacidade em janela ---------- */
function politica() {
  const dlg = $<HTMLDialogElement>('pq-politica');
  let carregada = false;
  document.addEventListener('click', async (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('[data-politica]');
    if (!a || typeof dlg.showModal !== 'function') return;
    e.preventDefault();
    dlg.showModal();
    if (!carregada) {
      try {
        const html = await fetch('/privacidade/').then((r) => { if (!r.ok) throw new Error(); return r.text(); });
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const art = doc.querySelector('article') ?? doc.querySelector('main');
        art?.querySelectorAll('script').forEach((x) => x.remove());
        art?.querySelectorAll('[data-preferencias-cookies]').forEach((x) => x.removeAttribute('data-preferencias-cookies'));
        $('pq-politica-corpo').replaceChildren(...(art ? [...art.children] : [el('p', undefined, 'Não foi possível carregar.')]));
        carregada = true;
      } catch { $('pq-politica-corpo').replaceChildren(el('p', undefined, 'Não foi possível carregar a política agora. Ela está em danimoscatelli.com.br/privacidade.')); }
    }
    const sec = $('pq-politica-corpo').querySelector('#pesquisa-moda');
    if (sec) sec.scrollIntoView({ block: 'start' }); else $('pq-politica-corpo').scrollTop = 0;
  });
  $('pq-politica-fechar').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

/* ---------- Topo: barra do design system (transparente no topo; escura ao rolar; some ao descer) ---------- */
function topo() {
  const t = $('pq-topo');
  let ultimo = window.scrollY, agendado = false;
  const atualizar = () => {
    agendado = false;
    const y = window.scrollY, barra = t.querySelector<HTMLElement>('.pq-barra-topo')!.offsetHeight;
    t.classList.toggle('is-scrolled', y > 8);
    const d = y - ultimo;
    if (y < barra) t.classList.remove('is-hidden');
    else if (d > 6) t.classList.add('is-hidden');
    else if (d < -6) t.classList.remove('is-hidden');
    if (Math.abs(d) > 6) ultimo = y;
  };
  window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(atualizar); } }, { passive: true });
  t.addEventListener('focusin', () => t.classList.remove('is-hidden'));
  // altura do cabeçalho, para o formulário ocupar o resto da tela e a barra de botões ficar sempre presa embaixo
  const medir = () => document.documentElement.style.setProperty('--pq-topo-h', t.offsetHeight + 'px');
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(t);
  medir();
  atualizar();
}

/* ---------- Telas finais: "Indique a pesquisa" (WhatsApp, Facebook, LinkedIn, copiar link e o compartilhar do aparelho) ---------- */
const LINK_PESQUISA = 'https://www.danimoscatelli.com.br/pesquisa/moda-curitiba/';
const MSG_INDICAR = 'Conhece a pesquisa sobre como é procurar e comprar roupas, calçados e acessórios em Curitiba e Região Metropolitana? Leva de 3 a 5 minutos e ajuda um projeto de inovação. Participe:';
const ICONES_REDES = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.21-3.6.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.04c0-5.24 4.27-9.5 9.52-9.5a9.44 9.44 0 0 1 6.72 2.79 9.43 9.43 0 0 1 2.78 6.72c0 5.24-4.27 9.5-9.5 9.5zm8.09-17.59A11.36 11.36 0 0 0 12.05.56C5.75.56.62 5.68.62 11.98c0 2.01.53 3.98 1.53 5.71L.53 23.6l6.06-1.59a11.4 11.4 0 0 0 5.45 1.39h.01c6.3 0 11.43-5.13 11.43-11.43 0-3.05-1.19-5.92-3.35-8.08z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/></svg>',
};
function indicar() {
  const url = encodeURIComponent(LINK_PESQUISA);
  const temNativo = typeof navigator.share === 'function';
  document.querySelectorAll<HTMLElement>('[data-indicar]').forEach((box, n) => {
    box.replaceChildren();
    const tit = el('p', 'pq-indicar-tit', 'Indique a pesquisa');
    const txt = el('p', 'pq-indicar-txt', 'Conhece alguém que compra roupas, calçados ou acessórios em Curitiba ou na Região Metropolitana? Compartilhe o link.');
    // campo com o link (tocar seleciona tudo) e o botão "Compartilhar"
    const linha = el('div', 'pq-indicar-linha');
    const campo = el('input'); campo.type = 'text'; campo.readOnly = true; campo.value = LINK_PESQUISA; campo.id = 'pq-indicar-link-' + n;
    campo.setAttribute('aria-label', 'Link da pesquisa'); campo.addEventListener('focus', () => campo.select());
    const bt = el('button', 'pq-btn pq-btn-primario pq-indicar-bt-principal'); bt.type = 'button';
    bt.innerHTML = ICONES_REDES.mais + '<span>Compartilhar</span>';
    linha.append(campo, bt);
    // sem o compartilhar do aparelho (alguns computadores): lista com as redes e "Copiar link"
    const menu = el('div', 'pq-indicar-menu'); menu.hidden = true; menu.id = 'pq-indicar-menu-' + n;
    bt.setAttribute('aria-controls', menu.id); bt.setAttribute('aria-expanded', 'false');
    const link = (rede: string, rotulo: string, href: string) => {
      const a = el('a', 'pq-indicar-bt pq-rede-' + rede); a.href = href; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = (ICONES_REDES as Record<string, string>)[rede] + '<span>' + rotulo + '</span>';
      a.setAttribute('aria-label', 'Compartilhar no ' + rotulo + ' (abre em nova aba)');
      return a;
    };
    const copiar = el('button', 'pq-indicar-bt pq-rede-link'); copiar.type = 'button';
    const rotCopiar = () => { copiar.classList.remove('ok'); copiar.removeAttribute('aria-label'); copiar.innerHTML = ICONES_REDES.link + '<span>Copiar link</span>'; };
    rotCopiar();
    copiar.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(LINK_PESQUISA); }
      catch { campo.select(); document.execCommand?.('copy'); }
      copiar.classList.add('ok'); copiar.innerHTML = ICONES_REDES.ok + '<span>Copiado</span>'; copiar.setAttribute('aria-label', 'Link copiado');
      setTimeout(rotCopiar, 2200);
    });
    const grade = el('div', 'pq-indicar-grade');
    grade.append(
      link('whatsapp', 'WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(MSG_INDICAR + ' ' + LINK_PESQUISA)),
      link('facebook', 'Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + url),
      link('linkedin', 'LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + url),
      copiar,
    );
    menu.append(grade, el('p', 'pq-indicar-nota', 'Para o Direct do Instagram, copie o link e cole na conversa.'));
    bt.addEventListener('click', async () => {
      if (temNativo) {
        try { await navigator.share({ title: 'Vamos conversar sobre moda em Curitiba?', text: MSG_INDICAR, url: LINK_PESQUISA }); return; }
        catch (e) { if ((e as DOMException)?.name === 'AbortError') return; /* sem o compartilhar do aparelho: mostra a lista */ }
      }
      const abrir = menu.hidden;
      menu.hidden = !abrir; bt.setAttribute('aria-expanded', String(abrir));
      if (abrir && !reduzir) { menu.classList.remove('pq-entra'); void menu.offsetWidth; menu.classList.add('pq-entra'); }
    });
    box.append(tit, txt, linha, menu);
  });
}

/* ---------- "Voltar para o site": pergunta antes de interromper a pesquisa em andamento ---------- */
function sair() {
  const dlg = $<HTMLDialogElement>('pq-sair-dlg');
  let destino = '/';
  const emAndamento = () => !$('pq-form').hidden && !ler(CHAVE_FIM);
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('[data-sair]');
    if (!a || !emAndamento() || typeof dlg.showModal !== 'function') return; // fora da pesquisa (apresentação ou fim): vai direto
    e.preventDefault();
    destino = a.href; salvar();
    dlg.showModal(); $('pq-sair-ficar').focus();
  });
  $('pq-sair-ficar').addEventListener('click', () => dlg.close());
  $('pq-sair-ir').addEventListener('click', () => { salvar(); location.href = destino; });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

/* ---------- Início ---------- */
function iniciar() {
  politica(); topo(); sair(); indicar();
  const etapas = $('pq-etapas');
  PERGUNTAS.forEach((p, i) => etapas.appendChild(montarPergunta(p, i)));
  etapas.append(montarIdentificacao(), montarPerfil(), montarRelato(), montarNovidades());
  [...etapas.children].forEach((x) => { (x as HTMLElement).hidden = true; });

  // escolhas que encerram mudam o texto do botão
  etapas.addEventListener('change', atualizarBotao);
  etapas.addEventListener('input', () => { if (E.etapa === ETAPA_RELATO) atualizarBotao(); });

  // Começar: primeiro a identificação; quem já se identificou nesta sessão segue de onde parou
  $('pq-comecar').addEventListener('click', () => {
    mostrarTela('pq-form');
    if (identificado() && E.etapa >= 0) irPara(E.etapa);
    else { retomar = E.etapa >= 0 && E.etapa !== ETAPA_ID ? E.etapa : -1; irPara(ETAPA_ID); }
  });
  $('pq-voltar').addEventListener('click', () => {
    if (enviando) return;
    // da identificação, o Voltar leva à apresentação; da primeira pergunta, à identificação
    if (E.etapa === ETAPA_ID) { E.etapa = -1; salvar(); mostrarTela('pq-intro'); $('pq-comecar').focus(); return; }
    if (E.etapa <= 0) { irPara(ETAPA_ID, true); return; }
    irPara(anterior(E.etapa), true);
  });
  $('pq-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (enviando || !validarEtapa(E.etapa)) return;
    const p = PERGUNTAS[E.etapa];
    if (opcaoQueEncerra(p)) return void enviar(false);
    if (E.etapa === ETAPA_NOV) return void enviar(true);
    if (E.etapa === ETAPA_ID) return void conferirId();
    irPara(proxima(E.etapa));
  });

  // participação já concluída neste aparelho: mostra a tela final, sem novo envio
  const fim = ler<{ tipo: 'obrigada' | 'encerrada' | 'semcompras'; comContato: boolean }>(CHAVE_FIM);
  if (fim) { concluir(fim.tipo, fim.comContato, false); return; }
  if (E.etapa >= 0) {
    mostrarTela('pq-form');
    if (identificado() || E.etapa === ETAPA_ID) irPara(E.etapa);
    else { retomar = E.etapa; irPara(ETAPA_ID); } // voltou outro dia: identifica de novo e continua de onde parou
  }

  // pesquisa fora do ar
  fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'status', pesquisa: Q.slug }) })
    .then((r) => r.json()).then((d) => { if (d && d.ativa === false) concluir('fora'); }).catch(() => { /* sem conexão: o envio avisa depois */ });
}
iniciar();
