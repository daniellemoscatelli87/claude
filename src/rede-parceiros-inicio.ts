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

/* ---------- Hero: Lista animada (componente do DS) com os perfis que a rede busca ---------- */
(() => {
  const lista = document.querySelector<HTMLUListElement>('.rp-lista-itens');
  const pausa = document.querySelector<HTMLButtonElement>('.rp-lista-pausa');
  if (!lista) return;
  const svg = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ico = {
    pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    setor: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01"/>',
  };
  // Mesmos perfis e setores apresentados na página (nada inventado).
  const itens: [string, string, string][] = [
    ['pessoa', 'Design', 'Traduz estratégia em experiências, serviços e interfaces.'],
    ['pessoa', 'UX/UI', 'Projeta jornadas e interfaces digitais simples e acessíveis.'],
    ['setor', 'Especialista em Saúde', 'Conhecimento do setor para projetos em saúde.'],
    ['pessoa', 'Pesquisa', 'Investiga pessoas e contextos para orientar decisões.'],
    ['pessoa', 'Negócios', 'Conecta as soluções a metas e indicadores.'],
    ['setor', 'Especialista em Hospitalidade', 'Conhecimento do setor para hotéis e serviços.'],
    ['pessoa', 'Tecnologia', 'Avalia caminhos técnicos viáveis para cada solução.'],
    ['pessoa', 'Desenvolvimento', 'Constrói e implementa produtos e serviços digitais.'],
    ['setor', 'Especialista em Educação', 'Conhecimento do setor para projetos em educação.'],
    ['pessoa', 'Dados', 'Organiza e analisa dados para medir resultados.'],
    ['pessoa', 'IA', 'Aplica inteligência artificial com responsabilidade.'],
    ['setor', 'Especialista em Varejo', 'Conhecimento do setor para projetos no varejo.'],
    ['pessoa', 'Inovação', 'Facilita a criação e o teste de novas ideias.'],
    ['setor', 'Especialista em Serviços financeiros', 'Conhecimento do setor financeiro.'],
    ['setor', 'Especialista em Indústria', 'Conhecimento do setor industrial.'],
  ];
  let n = 0;
  const criar = ([tipo, titulo, texto]: [string, string, string], animar: boolean) => {
    const li = document.createElement('li');
    if (animar) li.className = 'entrando';
    li.innerHTML = `<span class="rp-lista-ico">${svg(ico[tipo as 'pessoa' | 'setor'])}</span><span><strong>${titulo}</strong><span class="txt">${texto}</span></span>`;
    return li;
  };
  for (let i = 4; i >= 0; i--) lista.appendChild(criar(itens[i], false));
  n = 5;
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
    lista.insertBefore(criar(itens[n % itens.length], true), lista.firstChild);
    n++;
    while (lista.children.length > 5) lista.lastElementChild?.remove();
  }, 2000);
})();
