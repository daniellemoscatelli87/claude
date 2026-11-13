// Rede de Parceiros (apresentação): cabeçalho, menu e gaveta de contato compartilhados.
// O formulário de cadastro fica em /rede-parceiros/cadastro/.
import './rede-parceiros-inicio.css';
import './compartilhado/menu';

/* ---------- Cadastro em janela de tela cheia (o formulário é a página /rede-parceiros/cadastro/, carregada dentro) ---------- */
const tela = document.getElementById('cadastro-parceiro') as HTMLElement | null;
const quadro = tela?.querySelector('iframe') as HTMLIFrameElement | null;
let origem: HTMLElement | null = null;
const abrirCadastro = (de: HTMLElement | null) => {
  if (!tela || !quadro) return;
  origem = de;
  if (!quadro.src) quadro.src = quadro.dataset.src || '/rede-parceiros/cadastro/';
  tela.classList.add('aberta');
  tela.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('cadastro-aberto');
  (window as any).dmEvento?.('cadastro_parceiro_aberto');
  setTimeout(() => document.getElementById('cadastro-parceiro-fechar')?.focus(), 350);
};
const fecharCadastro = () => {
  if (!tela) return;
  tela.classList.remove('aberta');
  tela.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('cadastro-aberto');
  if (origem && origem.offsetParent) origem.focus();
};
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href="/rede-parceiros/cadastro/"]');
  if (!a || !tela || e.ctrlKey || e.metaKey || e.shiftKey || (e as MouseEvent).button === 1) return;
  if (!window.matchMedia('(max-width: 767px)').matches) return; // no computador, o link abre a página do formulário
  e.preventDefault();
  abrirCadastro(a);
});
document.getElementById('cadastro-parceiro-fechar')?.addEventListener('click', fecharCadastro);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tela?.classList.contains('aberta')) fecharCadastro(); });

/* ---------- Botões flutuantes: "Quero ser parceiro" fora do topo e do convite; "subir" no rodapé ---------- */
(() => {
  const cta = document.getElementById('cta-flutuante');
  const subir = document.getElementById('botao-subir');
  const hero = document.querySelector('.rp-hero .rp-botao'); // aparece assim que o botão do topo sai da tela
  const convite = document.querySelector('.rp-carta');
  const rodape = document.querySelector('footer');
  if (!('IntersectionObserver' in window)) return;
  const mostrar = (el: HTMLElement | null, sim: boolean) => {
    if (!el) return;
    el.classList.toggle('visivel', sim);
    el.setAttribute('aria-hidden', String(!sim));
    el.tabIndex = sim ? 0 : -1;
  };
  let heroVisivel = true, conviteVisivel = false;
  const atualizar = () => mostrar(cta, !heroVisivel && !conviteVisivel);
  if (hero) new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; atualizar(); }, { threshold: 0 }).observe(hero);
  if (convite) new IntersectionObserver(([e]) => { conviteVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.1 }).observe(convite);
  if (rodape) new IntersectionObserver(([e]) => mostrar(subir, e.isIntersecting), { threshold: 0.1 }).observe(rodape);
  subir?.addEventListener('click', () => {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
  });
})();

/* ---------- Carrossel de perfis: setas no computador ---------- */
(() => {
  const lista = document.getElementById('perfis');
  if (!lista) return;
  const setas = Array.from(document.querySelectorAll<HTMLButtonElement>('.rp-seta'));
  const atualizar = () => {
    const fim = lista.scrollWidth - lista.clientWidth - 2;
    setas.forEach((b) => { b.disabled = b.dataset.dir === '-1' ? lista.scrollLeft <= 2 : lista.scrollLeft >= fim; });
  };
  setas.forEach((b) => b.addEventListener('click', () => {
    const item = lista.querySelector<HTMLElement>('li');
    const passo = item ? item.offsetWidth + 20 : lista.clientWidth;
    lista.scrollBy({ left: Number(b.dataset.dir) * passo, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));
  lista.addEventListener('scroll', atualizar, { passive: true });
  window.addEventListener('resize', atualizar);
  atualizar();
  // Avanço automático: um perfil a cada 4,5 s (tempo para ler e ver o próximo); volta ao início no fim.
  // Pausa enquanto a pessoa interage (mouse, toque ou foco) e não roda para quem prefere menos movimento.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let interagindo = false;
  const parar = () => { interagindo = true; };
  const seguir = () => { interagindo = false; };
  const area = lista.closest('.rp-carrossel-area') || lista;
  area.addEventListener('pointerenter', parar); area.addEventListener('pointerleave', seguir);
  area.addEventListener('focusin', parar); area.addEventListener('focusout', seguir);
  lista.addEventListener('touchstart', parar, { passive: true });
  lista.addEventListener('touchend', () => setTimeout(seguir, 4000), { passive: true });
  let visivel = false;
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.3 }).observe(lista);
  setInterval(() => {
    if (interagindo || !visivel || document.hidden) return;
    const item = lista.querySelector<HTMLElement>('li');
    const passo = item ? item.offsetWidth + 20 : lista.clientWidth;
    const fim = lista.scrollLeft >= lista.scrollWidth - lista.clientWidth - 2;
    lista.scrollTo({ left: fim ? 0 : lista.scrollLeft + passo, behavior: 'smooth' });
  }, 4500);
})();

/* ---------- Hero: Lista animada (componente do DS): animação de novos cadastros (sem nomes, data ou hora) ---------- */
(() => {
  const lista = document.querySelector<HTMLUListElement>('.rp-lista-itens');
  const pausa = document.querySelector<HTMLButtonElement>('.rp-lista-pausa');
  if (!lista) return;
  // Avatares gerados por IA (pessoas fictícias), em public/rede-parceiros/avatares/.
  // Papéis variados conforme os perfis e setores que a rede procura.
  const papeis = [
    'UX/UI Designer', 'Service Designer', 'Pesquisa em UX', 'Consultoria de Negócios', 'Desenvolvimento Front-end',
    'Arquitetura de Soluções', 'Ciência de Dados', 'Especialista em IA', 'Gestão de Inovação', 'Especialista em Saúde',
    'Especialista em Hospitalidade', 'Especialista em Educação', 'Especialista em Varejo', 'Especialista em Serviços financeiros',
    'Especialista em Indústria', 'Product Designer', 'Desenvolvimento Back-end', 'Análise de Dados',
  ];
  let n = 0;
  const criar = (animar: boolean) => {
    const li = document.createElement('li');
    if (animar) li.className = 'entrando';
    const papel = papeis[n % papeis.length];
    li.innerHTML = `<span class="rp-lista-avatar"><img src="/rede-parceiros/avatares/avatar-${(n % 5) + 1}.webp" alt="" width="40" height="40" loading="lazy"></span><span class="rp-lista-corpo"><strong>${papel}</strong><span class="txt">Novo cadastro na Rede de Parceiros</span></span>`;
    n++;
    return li;
  };
  for (let i = 4; i >= 0; i--) lista.insertBefore(criar(false), lista.firstChild);
  const ICO_PAUSA = '<span class="rp-ico-pausa" aria-hidden="true"><i></i><i></i></span>';
  const ICO_PLAY = '<svg class="rp-ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>';
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pausado = reduzido;
  if (pausa) {
    pausa.innerHTML = reduzido ? ICO_PLAY + 'Retomar' : ICO_PAUSA + 'Pausar';
    if (reduzido) pausa.setAttribute('aria-pressed', 'true');
    pausa.addEventListener('click', () => {
      pausado = !pausado;
      pausa.innerHTML = pausado ? ICO_PLAY + 'Retomar' : ICO_PAUSA + 'Pausar';
      pausa.setAttribute('aria-pressed', String(pausado));
    });
  }
  // Mesma coreografia da Lista animada do DS: o novo item cai do topo (mola), os demais deslizam para baixo
  // (animação de layout) e o último sai para a direita, esmaecendo.
  const MOLA = 'cubic-bezier(0.34, 1.32, 0.64, 1)';
  const avancar = () => {
    const antes = new Map<Element, number>();
    Array.from(lista.children).forEach((el) => antes.set(el, (el as HTMLElement).getBoundingClientRect().top));
    const saindo = lista.children.length >= 5 ? (lista.lastElementChild as HTMLElement) : null;
    if (saindo) {
      const r = saindo.getBoundingClientRect(), base = lista.getBoundingClientRect();
      saindo.style.position = 'absolute'; saindo.style.left = `${r.left - base.left}px`; saindo.style.top = `${r.top - base.top}px`; saindo.style.width = `${r.width}px`;
      saindo.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(60px) scale(.9)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' })
        .finished.then(() => saindo.remove());
    }
    const novo = criar(false);
    lista.insertBefore(novo, lista.firstChild);
    novo.animate([{ opacity: 0, transform: 'translateY(-32px) scale(.93)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: MOLA });
    antes.forEach((y, el) => {
      if (el === saindo) return;
      const dy = y - (el as HTMLElement).getBoundingClientRect().top;
      if (dy) (el as HTMLElement).animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: MOLA });
    });
  };
  setInterval(() => { if (!pausado && !document.hidden) avancar(); }, 2000);
})();
