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
  setTimeout(() => quadro.focus(), 350);
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
  e.preventDefault();
  abrirCadastro(a);
});
document.getElementById('cadastro-parceiro-fechar')?.addEventListener('click', fecharCadastro);
// desktop: clicar no fundo escurecido, fora da modal, fecha o cadastro
tela?.addEventListener('click', (e) => { if (e.target === tela) fecharCadastro(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tela?.classList.contains('aberta')) fecharCadastro(); });
window.addEventListener('message', (e) => { if (e.origin === location.origin && e.data === 'dm-fechar-cadastro') fecharCadastro(); });

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

/* ---------- Formatos de parceria: kanban animado de projetos (exemplos) ----------
   Cada card é um projeto: avatar do profissional (pessoa fictícia gerada por IA), tipo de projeto e status.
   A cada poucos segundos um card avança de coluna (A iniciar → Em andamento → Entregue → volta ao início). */
(() => {
  const quadro = document.querySelector<HTMLElement>('.rx-kb-quadro');
  const pausa = document.querySelector<HTMLButtonElement>('.rx-kanban .rp-lista-pausa');
  if (!quadro) return;
  const STATUS = ['A iniciar', 'Em andamento', 'Entregue'];
  const projetos = [
    { tipo: 'Pesquisa com pacientes', av: 3, s: 1 },
    { tipo: 'Jornada de check-in de hotel', av: 2, s: 0 },
    { tipo: 'App de matrícula escolar', av: 1, s: 1 },
    { tipo: 'Painel de vendas do varejo', av: 4, s: 2 },
    { tipo: 'Onboarding de conta digital', av: 5, s: 0 },
    { tipo: 'Automação com IA na fábrica', av: 2, s: 2 },
    { tipo: 'Treinamento da equipe de atendimento', av: 5, s: 1 },
  ];
  const cols = Array.from(quadro.querySelectorAll<HTMLElement>('.rx-kb-col'));
  const listas = cols.map((c) => c.querySelector<HTMLUListElement>('.rx-kb-cards')!);
  const cards = projetos.map((p) => {
    const li = document.createElement('li');
    li.className = 'rx-kb-card';
    li.innerHTML = `<img src="/rede-parceiros/avatares/avatar-${p.av}.webp" alt="" width="32" height="32" loading="lazy"><span class="rx-kb-corpo"><strong>${p.tipo}</strong><span class="rx-kb-status"></span><span class="rx-kb-barra" aria-hidden="true"><i></i></span></span>`;
    return li;
  });
  // progresso de cada projeto: A iniciar = 0, Em andamento = avança aos poucos, Entregue = 100
  const prog = projetos.map((p) => (p.s === 0 ? 0 : p.s === 2 ? 100 : 25 + Math.round(Math.random() * 35)));
  const pintar = (i: number) => { cards[i].querySelector<HTMLElement>('.rx-kb-barra i')!.style.width = `${prog[i]}%`; };
  const aplicarStatus = (i: number) => {
    const st = cards[i].querySelector<HTMLElement>('.rx-kb-status')!;
    st.textContent = STATUS[projetos[i].s];
    st.dataset.s = String(projetos[i].s);
  };
  const contar = () => cols.forEach((c, k) => { c.querySelector('.rx-kb-qtd')!.textContent = String(listas[k].children.length); });
  cards.forEach((li, i) => { aplicarStatus(i); listas[projetos[i].s].appendChild(li); });
  cards.forEach((_, i) => pintar(i));
  contar();
  // Celular: no lugar do quadro, um card de tarefa único (foto + tarefa + status) que mostra o projeto que acabou de mudar
  const unico = document.createElement('div');
  unico.className = 'rx-kb-unico';
  unico.setAttribute('aria-live', 'off');
  quadro.after(unico);
  const mostrarUnico = (i: number, animar: boolean) => {
    const p = projetos[i];
    unico.innerHTML = `<img src="/rede-parceiros/avatares/avatar-${p.av}.webp" alt="" width="48" height="48" loading="lazy"><span class="rx-kb-corpo"><strong>${p.tipo}</strong><span class="rx-kb-status" data-s="${p.s}">${STATUS[p.s]}</span></span>`;
    if (animar && unico.offsetParent) unico.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  };
  let unicoVez = 0; // no celular o card percorre os projetos em sequência: a cada troca, outro projeto e outro profissional
  mostrarUnico(0, false);
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pausado = reduzido;
  const ICO_PAUSA = '<span class="rp-ico-pausa" aria-hidden="true"><i></i><i></i></span>';
  const ICO_PLAY = '<svg class="rp-ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>';
  if (pausa) {
    pausa.innerHTML = reduzido ? ICO_PLAY + 'Retomar' : ICO_PAUSA + 'Pausar';
    pausa.setAttribute('aria-pressed', String(reduzido));
    pausa.addEventListener('click', () => {
      pausado = !pausado;
      pausa.innerHTML = pausado ? ICO_PLAY + 'Retomar' : ICO_PAUSA + 'Pausar';
      pausa.setAttribute('aria-pressed', String(pausado));
    });
  }
  const MOLA = 'cubic-bezier(0.34, 1.32, 0.64, 1)';
  let vez = 0;
  const avancar = () => {
    // rodízio em 3 passos (Entregue → A iniciar, Em andamento → Entregue, A iniciar → Em andamento):
    // cada coluna fica sempre com 1 a 3 cards, então a altura do quadro não muda
    const origem = [2, 1, 0][vez % 3]; vez++;
    const primeiro = listas[origem].firstElementChild as HTMLLIElement | null;
    if (!primeiro) return;
    const i = cards.indexOf(primeiro);
    const antes = new Map<HTMLElement, DOMRect>();
    cards.forEach((c) => antes.set(c, c.getBoundingClientRect()));
    projetos[i].s = (projetos[i].s + 1) % 3;
    prog[i] = projetos[i].s === 0 ? 0 : projetos[i].s === 2 ? 100 : 6;
    pintar(i);
    aplicarStatus(i);
    const destino = listas[projetos[i].s];
    destino.appendChild(cards[i]);
    contar();
    // animação de layout (FLIP): o card viaja até a nova coluna; os demais se reacomodam
    antes.forEach((r, c) => {
      const n = c.getBoundingClientRect();
      const dx = r.left - n.left, dy = r.top - n.top;
      if (!dx && !dy) return;
      c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: c === cards[i] ? 650 : 450, easing: MOLA });
    });
    unicoVez = (unicoVez + 1) % projetos.length;
    mostrarUnico(unicoVez, true);
    cards[i].animate([{ boxShadow: '0 0 0 2px rgba(212, 77, 77, 0.45)' }, { boxShadow: '0 0 0 2px rgba(212, 77, 77, 0)' }], { duration: 1400, easing: 'ease-out' });
  };
  let visivel = false;
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.3 }).observe(quadro.closest('.rx-kanban') || quadro);
  // ritmo moderado: um card muda de coluna a cada 3,2 s e, entre uma mudança e outra, as barras dos projetos em andamento avançam
  setInterval(() => { if (!pausado && visivel && !document.hidden) avancar(); }, 3200);
  setInterval(() => {
    if (pausado || !visivel || document.hidden) return;
    projetos.forEach((p, i) => { if (p.s === 1 && prog[i] < 94) { prog[i] = Math.min(94, prog[i] + 2 + Math.round(Math.random() * 4)); pintar(i); } });
  }, 800);
})();

/* ---------- Checklist: o check de cada item é desenhado quando ele entra na tela, um após o outro ---------- */
(() => {
  const itens = Array.from(document.querySelectorAll<HTMLElement>('.rp-checklist-caixas li'));
  if (!itens.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { itens.forEach((li) => li.classList.add('marcado')); return; }
  const obs = new IntersectionObserver((es) => {
    es.filter((e) => e.isIntersecting).forEach((e, i) => {
      setTimeout(() => e.target.classList.add('marcado'), i * 250);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.6, rootMargin: '0px 0px -10% 0px' });
  itens.forEach((li) => obs.observe(li));
})();

/* ---------- Hero: componente do DS "Avatares com tooltip" (ecossistema de áreas em órbita) ----------
   Anéis girando devagar; com o ponteiro sobre o ecossistema tudo pausa (sem conflito com o movimento),
   e o avatar sob o ponteiro cresce e mostra a dica com a área e a descrição. Teclado: foco em cada área. */
(() => {
  const orbita = document.querySelector<HTMLElement>('.rx-orbita');
  if (!orbita) return;
  const avs = Array.from(orbita.querySelectorAll<HTMLElement>('.rx-av, .rx-seg'));
  const dica = orbita.querySelector<HTMLElement>('.rx-dica');
  const DUR = [22, 34, 46]; // segundos por volta: movimento lento e legível
  const ang = [0, 0, 0];
  let pausado = false, ultimo = 0, visivel = false, ativo: HTMLButtonElement | null = null;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
  const raio = (k: number) => parseFloat(getComputedStyle(orbita).getPropertyValue(`--r${k}`)) || 0;
  const posicionar = () => {
    avs.forEach((b) => {
      const k = Number(b.closest<HTMLElement>('.rx-giro')!.dataset.anel);
      const a = (Number(b.style.getPropertyValue('--ang')) + ang[k]) * Math.PI / 180;
      b.style.transform = `translate(-50%, -50%) translate(${Math.cos(a) * raio(k)}px, ${Math.sin(a) * raio(k)}px)`;
    });
  };
  const quadro = (t: number) => {
    if (ultimo && !pausado && !reduzir.matches) { const dt = Math.min(64, t - ultimo); DUR.forEach((d, k) => { ang[k] = (ang[k] + 360 * dt / (d * 1000)) % 360; }); posicionar(); }
    ultimo = t;
    if (visivel) requestAnimationFrame(quadro); else ultimo = 0;
  };
  new IntersectionObserver(([e]) => { const antes = visivel; visivel = e.isIntersecting; if (visivel && !antes) requestAnimationFrame(quadro); }).observe(orbita);
  new ResizeObserver(posicionar).observe(orbita);
  const descricao = (i: string) => document.querySelector<HTMLTemplateElement>(`.rx-quem-texto template[data-i="${i}"]`)?.content.querySelector('p')?.textContent || '';
  const mostrar = (b: HTMLButtonElement) => {
    if (ativo === b || !dica) return;
    ativo = b;
    avs.forEach((x) => x.classList.toggle('ativo', x === b));
    const ro = orbita.getBoundingClientRect(), rb = b.getBoundingClientRect();
    dica.querySelector('strong')!.textContent = b.getAttribute('aria-label');
    dica.querySelector('span')!.textContent = descricao(b.dataset.i || '');
    dica.style.left = `${rb.left - ro.left + rb.width / 2}px`;
    dica.style.top = `${rb.top - ro.top}px`;
    dica.classList.toggle('abaixo', rb.top - ro.top < 120);
    dica.hidden = false;
  };
  const limpar = () => { ativo = null; if (dica) dica.hidden = true; avs.forEach((x) => x.classList.remove('ativo')); };
  // nesta página o ecossistema não pausa quando o ponteiro passa por cima: o giro é contínuo
  orbita.addEventListener('pointerleave', () => { limpar(); });
  orbita.addEventListener('pointerover', (e) => { const b = (e.target as Element).closest<HTMLButtonElement>('.rx-av'); if (b) mostrar(b); });
  orbita.addEventListener('pointerout', (e) => { const b = (e.target as Element).closest<HTMLButtonElement>('.rx-av'); const para = (e.relatedTarget as Element | null)?.closest('.rx-av'); if (b && !para) limpar(); });
  avs.filter((b): b is HTMLButtonElement => b instanceof HTMLButtonElement).forEach((b) => {
    b.addEventListener('focus', () => { pausado = true; mostrar(b); });
    b.addEventListener('blur', () => { pausado = false; limpar(); });
    b.addEventListener('click', () => { pausado = true; mostrar(b); });
  });
  posicionar();
})();
