import './em-breve.css';
import { insert, sugerirEmail, EMAIL_RE } from './compartilhado/menu';

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
})();
