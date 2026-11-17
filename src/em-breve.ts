import './em-breve.css';
import { insert, sugerirEmail, EMAIL_RE } from './compartilhado/menu';
import { textosSurgem } from './compartilhado/textos-surgem';

textosSurgem({ titulos: 'main h1, main h2', cards: ['#artigos .grid > *'] });

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/* ---------- Notificar lançamento ---------- */
const notifyForm = $<HTMLFormElement>('notify-form');
const notifyEmail = $<HTMLInputElement>('notify-email');
const notifyBtn = $<HTMLButtonElement>('notify-btn');
const notifyLabel = $('notify-btn-label');
const notifyMsg = $('notify-msg');
const notifyDefaultMsg = notifyMsg.textContent;

notifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = notifyEmail.value.trim();
  if (!EMAIL_RE.test(email)) {
    notifyMsg.textContent = 'Informe um e-mail válido.';
    notifyMsg.classList.add('text-brand-red');
    notifyEmail.focus();
    return;
  }
  setNotifyState('sending');
  try {
    await insert('notificacoes_lancamento', { email });
    notifyForm.reset();
    setNotifyState('success');
    (window as any).dmEvento?.('cadastro_lancamento', { origem: 'pagina_inicial' });
    setTimeout(() => setNotifyState('idle'), NOTIFY_SUCCESS_MS);
  } catch (err) {
    console.error(err);
    setNotifyState('idle');
    notifyMsg.textContent = 'Não foi possível enviar. Tente novamente.';
    notifyMsg.classList.add('text-brand-red');
  }
});

const NOTIFY_SUCCESS_MS = 4000;
const NOTIFY_LABELS = { idle: 'Notificar lançamento', sending: 'Enviando…', success: 'Obrigado! Até breve!' };

function setNotifyState(state: keyof typeof NOTIFY_LABELS) {
  notifyBtn.dataset.state = state;
  notifyBtn.disabled = state !== 'idle';
  notifyEmail.disabled = state !== 'idle';
  notifyLabel.textContent = NOTIFY_LABELS[state];
}
notifyEmail.addEventListener('input', () => {
  if (notifyMsg.classList.contains('text-brand-red')) {
    notifyMsg.textContent = notifyDefaultMsg;
    notifyMsg.classList.remove('text-brand-red');
  }
});

sugerirEmail(notifyEmail, true);

/* ---------- Celular e tablet: mesma navegação do Seja Parceiro — o hero fica fixo atrás do menu; a folha branca sobe por
   cima, prende logo abaixo do menu (tampa arredondada parada) e o conteúdo rola por baixo dela. O campo de e-mail e as
   redes sociais descem do hero para o começo da folha (e voltam ao hero no computador). ---------- */
(() => {
  const h = document.getElementById('site-header');
  const hero = document.querySelector<HTMLElement>('.ih-hero');
  const folha = document.querySelector<HTMLElement>('.ih-folha');
  const movel = document.getElementById('ih-movel');
  // descem para a folha no celular: a tag "Em breve", o 3º parágrafo (que convida a deixar o e-mail), o campo de e-mail e as redes sociais
  const itens = ['.ih-tag', '.ih-p3', '.ih-form', '.ih-redes'].map((s) => document.querySelector<HTMLElement>(s));
  if (!h || !hero || !folha || !movel || itens.some((i) => !i)) return;
  const pequeno = window.matchMedia('(max-width: 1023px)');
  // lugares originais no hero, para devolver no computador
  const marcas = itens.map((i) => { const m = document.createComment('ih'); i!.before(m); return m; });
  const posicionar = () => {
    if (pequeno.matches) movel.append(...(itens as HTMLElement[]));
    else itens.forEach((i, n) => marcas[n].after(i!));
  };
  posicionar();
  pequeno.addEventListener('change', posicionar);

  const espaco = document.createElement('div');
  espaco.className = 'ih-hero-espaco';
  espaco.setAttribute('aria-hidden', 'true');
  hero.after(espaco);
  const tampa = document.createElement('div');
  tampa.className = 'ih-tampa';
  tampa.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tampa);
  const raiz = document.documentElement;
  let agendado = false;
  const f = () => {
    agendado = false;
    if (!pequeno.matches) { raiz.style.removeProperty('--ih-tampa'); espaco.style.height = ''; return; }
    // o hero é fixo a partir do topo da tela; o espaço começa abaixo do cabeçalho, então desconta essa diferença
    espaco.style.height = `${Math.max(0, hero.offsetHeight - (espaco.getBoundingClientRect().top + window.scrollY))}px`;
    const topo = Math.max(folha.getBoundingClientRect().top, h.offsetHeight);
    raiz.style.setProperty('--ih-tampa', `${Math.round(topo)}px`);
  };
  f();
  window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(f); } }, { passive: true });
  window.addEventListener('resize', f);
  if ('ResizeObserver' in window) new ResizeObserver(f).observe(hero);
  // recalcula também quando a página termina de carregar, ao voltar/chegar pelo histórico do Safari e quando o tamanho de
  // algo muda (fontes e imagens que chegam depois mudam a posição da folha)
  window.addEventListener('load', f);
  window.addEventListener('pageshow', f);
  requestAnimationFrame(() => requestAnimationFrame(f));
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(() => f()); ro.observe(document.body); }
})();

/* ---------- Clientes atendidos: os logos rolam sozinhos e a pessoa pode navegar (arrastar/deslizar ou setas) ----------
   A lista é duplicada para a rolagem ser contínua; ao tocar, arrastar, passar o mouse ou usar as setas, a rolagem
   automática pausa e volta alguns segundos depois. Sem rolagem automática para quem prefere menos movimento. */
(() => {
  const caixa = document.querySelector<HTMLElement>('.ih-logos');
  const trilha = caixa?.querySelector<HTMLElement>('.client-marquee-track');
  const grupo = trilha?.firstElementChild as HTMLElement | null;
  if (!caixa || !trilha || !grupo) return;
  const copia = grupo.cloneNode(true) as HTMLElement;
  copia.setAttribute('aria-hidden', 'true');
  copia.querySelectorAll('img').forEach((i) => { i.alt = ''; });
  trilha.appendChild(copia);
  const volta = () => copia.offsetLeft - grupo.offsetLeft; // largura de uma lista + espaço entre elas
  let pos = 0;
  let pausadoAte = 0;
  let mouseSobre = false;
  const ajustar = () => {
    const v = volta();
    if (v <= 0) return;
    if (caixa.scrollLeft >= v) caixa.scrollLeft -= v;
    else if (caixa.scrollLeft <= 0) caixa.scrollLeft += v;
    pos = caixa.scrollLeft;
  };
  const pausar = (ms = 4000) => { pausadoAte = performance.now() + ms; };
  caixa.addEventListener('pointerdown', () => pausar(6000));
  caixa.addEventListener('touchstart', () => pausar(6000), { passive: true });
  caixa.addEventListener('wheel', () => pausar(), { passive: true });
  caixa.addEventListener('mouseenter', () => { mouseSobre = true; });
  caixa.addEventListener('mouseleave', () => { mouseSobre = false; });
  let rolando = 0;
  caixa.addEventListener('scroll', () => { clearTimeout(rolando); rolando = window.setTimeout(ajustar, 120); }, { passive: true });
  document.querySelectorAll<HTMLButtonElement>('[data-logos]').forEach((b) => b.addEventListener('click', () => {
    pausar(5000);
    ajustar();
    caixa.scrollBy({ left: Number(b.dataset.logos) * Math.max(200, caixa.clientWidth * 0.6), behavior: 'smooth' });
  }));
  // começa um pouco adiante, para haver logos dos dois lados ao voltar
  requestAnimationFrame(() => { caixa.scrollLeft = 1; pos = 1; });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let visivel = false;
  new IntersectionObserver(([en]) => { visivel = en.isIntersecting; }).observe(caixa);
  let ultimo = performance.now();
  const passo = (t: number) => {
    const dt = Math.min(64, t - ultimo);
    ultimo = t;
    if (visivel && !mouseSobre && t > pausadoAte) {
      pos += dt * 0.04; // 40 px por segundo
      const v = volta();
      if (v > 0 && pos >= v) pos -= v;
      caixa.scrollLeft = pos;
    } else {
      pos = caixa.scrollLeft;
    }
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
})();
