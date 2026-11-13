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
  const hero = document.querySelector('.rp-hero');
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
  if (hero) new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.15 }).observe(hero);
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
})();

/* ---------- Hero: Lista animada (componente do DS): animação de novos cadastros (sem nomes, data ou hora) ---------- */
(() => {
  const lista = document.querySelector<HTMLUListElement>('.rp-lista-itens');
  const pausa = document.querySelector<HTMLButtonElement>('.rp-lista-pausa');
  if (!lista) return;
  // Avatares ilustrativos (dois estilos de silhueta) em tons do DS.
  const avatar = (estilo: number, tom: number) => {
    const fundos = ['#FDF2F2', '#EDF0F5', '#F9DADA', '#D6DCE6'];
    const cores = ['#B82828', '#283043', '#8C1B1B', '#495669'];
    const cabelo = estilo === 0
      ? '<path d="M12 4.2c-2.6 0-4.4 1.9-4.4 4.5 0 .5.1 1 .2 1.4.4-2 2-3.3 4.2-3.3s3.8 1.3 4.2 3.3c.1-.4.2-.9.2-1.4 0-2.6-1.8-4.5-4.4-4.5z"/>'
      : '<path d="M12 4c-3 0-5 2.2-5 5.2v5.3c0 .6.5 1 1 1h.6V9.6c0-1.9 1.5-3.4 3.4-3.4s3.4 1.5 3.4 3.4v5.9h.6c.5 0 1-.4 1-1V9.2C17 6.2 15 4 12 4z"/>';
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="12" fill="${fundos[tom]}"/><g fill="${cores[tom]}">${cabelo}<circle cx="12" cy="10" r="3.4"/><path d="M5.5 21c.7-3.4 3.3-5.4 6.5-5.4s5.8 2 6.5 5.4z"/></g></svg>`;
  };
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
    li.innerHTML = `<span class="rp-lista-avatar">${avatar(n % 2, n % 4)}</span><span class="rp-lista-corpo"><strong>${papel}</strong><span class="txt">Novo cadastro na Rede de Parceiros</span></span>`;
    n++;
    return li;
  };
  for (let i = 4; i >= 0; i--) lista.insertBefore(criar(false), lista.firstChild);
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pausado = reduzido;
  if (pausa) {
    if (reduzido) { pausa.textContent = 'Retomar'; pausa.setAttribute('aria-pressed', 'true'); }
    pausa.addEventListener('click', () => {
      pausado = !pausado;
      pausa.textContent = pausado ? 'Retomar' : 'Pausar';
      pausa.setAttribute('aria-pressed', String(pausado));
    });
  }
  setInterval(() => {
    if (pausado || document.hidden) return;
    lista.insertBefore(criar(true), lista.firstChild);
    while (lista.children.length > 5) lista.lastElementChild?.remove();
  }, 2500);
})();
