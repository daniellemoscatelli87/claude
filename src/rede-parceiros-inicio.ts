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
  // no celular e tablet o "Quero ser parceiro" fica sempre no rodapé, ao lado do WhatsApp (o hero não tem mais o botão)
  const pequeno = window.matchMedia('(max-width: 1023px)');
  const atualizar = () => mostrar(cta, !conviteVisivel && (pequeno.matches || !heroVisivel));
  pequeno.addEventListener('change', atualizar);
  if (hero) new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; atualizar(); }, { threshold: 0 }).observe(hero);
  // o flutuante sai quando o botão do convite aparece na tela (os dois nunca aparecem juntos)
  const conviteBotao = convite?.querySelector<HTMLElement>('a[href*="cadastro"], .rp-botao') ?? convite;
  if (conviteBotao) new IntersectionObserver(([e]) => { conviteVisivel = e.isIntersecting; atualizar(); }, { threshold: 0 }).observe(conviteBotao);
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

/* ---------- Como funciona a colaboração: kanban animado com exemplos ilustrativos de participações ----------
   Cada card é uma participação: avatar do profissional (pessoa fictícia gerada por IA), contribuição e área de especialização.
   A cada poucos segundos um card avança de coluna (Convites → Em colaboração → Concluídas → volta ao início). */
(() => {
  const quadro = document.querySelector<HTMLElement>('.rx-kb-quadro');
  const pausa = document.querySelector<HTMLButtonElement>('.rx-kanban .rp-lista-pausa');
  if (!quadro) return;
  const STATUS = ['Convite', 'Em colaboração', 'Concluída'];
  const projetos = [
    { tipo: 'Pesquisa com usuários', av: 3, cargo: 'UX Researcher', s: 1 },
    { tipo: 'Mapeamento de jornada', av: 2, cargo: 'Service Designer', s: 0 },
    { tipo: 'Protótipo de interface', av: 1, cargo: 'UX/UI Designer', s: 1 },
    { tipo: 'Painel de indicadores', av: 4, cargo: 'Analista de Dados', s: 2 },
    { tipo: 'Fluxo de primeiro acesso', av: 5, cargo: 'Product Designer', s: 0 },
    { tipo: 'Automação com IA', av: 2, cargo: 'Especialista em IA', s: 2 },
    { tipo: 'Capacitação de atendimento', av: 5, cargo: 'Especialista em CX', s: 1 },
  ];
  const cols = Array.from(quadro.querySelectorAll<HTMLElement>('.rx-kb-col'));
  const listas = cols.map((c) => c.querySelector<HTMLUListElement>('.rx-kb-cards')!);
  const cards = projetos.map((p) => {
    const li = document.createElement('li');
    li.className = 'rx-kb-card';
    li.innerHTML = `<img src="/rede-parceiros/avatares/avatar-${p.av}.webp" alt="" width="32" height="32" loading="lazy"><span class="rx-kb-corpo"><strong>${p.tipo}</strong><span class="rx-kb-cargo">${p.cargo}</span><span class="rx-kb-status"></span><span class="rx-kb-barra" aria-hidden="true"><i></i></span></span>`;
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
    unico.innerHTML = `<img src="/rede-parceiros/avatares/avatar-${p.av}.webp" alt="" width="48" height="48" loading="lazy"><span class="rx-kb-corpo"><strong>${p.tipo}</strong><span class="rx-kb-cargo">${p.cargo}</span><span class="rx-kb-status" data-s="${p.s}">${STATUS[p.s]}</span></span>`;
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

/* ---------- Galeria de profissionais ----------
   Mostra só perfis com autorização registrada (função galeria_publica). O card traz foto, LinkedIn, nome, especialidade
   (campo 13 do cadastro ou o texto definido pelo Studio) e tags das áreas e segmentos; nunca e-mail, telefone ou cidade.
   A seção aparece a partir do primeiro perfil autorizado.
   Prévia da estrutura com perfis fictícios: /rede-parceiros/?galeria=exemplo */
(() => {
  const secao = document.getElementById('galeria');
  const grade = secao?.querySelector<HTMLUListElement>('.rx-gal-grade');
  if (!secao || !grade) return;
  type Perfil = { nome: string; cargo: string | null; tempo?: string | null; areas: string[] | null; segmentos: string[] | null; tags?: string[] | null; linkedin: string | null; foto_url: string | null };
  const MINIMO = 1;
  const limpa = (s: string) => s.replace(/\.\s*$/, '').trim();
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  const LI = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>';
  const linkSeguro = (u: string | null) => (u && /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(u) ? u : '');
  // senioridade pelo tempo de carreira (campo 23 do cadastro)
  const NIVEL: Record<string, string> = { "Menos de 1 ano": "Júnior", "Entre 1 e 2 anos": "Júnior", "Entre 3 e 5 anos": "Pleno", "Entre 6 e 10 anos": "Sênior", "Entre 11 e 15 anos": "Especialista", "Entre 16 e 20 anos": "Especialista", "Mais de 20 anos": "Especialista" };
  const tempoCarreira = (t: string) => NIVEL[limpa(t)] || '';
  const iniciais = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  const fotoSegura = (u: string | null) => (u && /^https:\/\//i.test(u) ? u : '');
  function card(p: Perfil) {
    const li = el('li', 'rx-gal-card');
    const topo = el('div', 'rx-gal-topo');
    const foto = el('span', 'rx-gal-foto');
    const src = fotoSegura(p.foto_url);
    if (src) { const img = el('img'); img.src = src; img.alt = ''; img.width = 72; img.height = 72; img.loading = 'lazy'; foto.appendChild(img); }
    else { const ini = el('span', 'rx-gal-ini', iniciais(p.nome)); ini.setAttribute('aria-hidden', 'true'); foto.appendChild(ini); }
    topo.appendChild(foto);
    const href = linkSeguro(p.linkedin);
    // com LinkedIn: o card inteiro abre o perfil em nova aba (o link do ícone se estende sobre o card) e, no hover, a borda
    // ganha uma luz que gira e o ícone fica vermelho
    if (href) {
      const a = el('a', 'rx-gal-in'); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', `LinkedIn de ${p.nome} (abre em nova aba)`); a.innerHTML = LI; topo.appendChild(a);
      li.classList.add('rx-gal-clicavel');
      const borda = el('span', 'rx-gal-borda'); borda.setAttribute('aria-hidden', 'true'); li.appendChild(borda);
    }
    // tags: as aprovadas na prévia (sugeridas pela IA); sem elas, áreas e segmentos do cadastro (no máximo 2 linhas, pelo CSS)
    const tags = el('ul', 'rx-gal-areas'); tags.setAttribute('aria-label', 'Áreas de atuação e segmentos');
    [...new Set((p.tags?.length ? p.tags : [...(p.areas || []), ...(p.segmentos || [])]).map(limpa).filter(Boolean))].forEach((a) => tags.appendChild(el('li', undefined, a)));
    const nivel = p.tempo ? tempoCarreira(p.tempo) : ''; const tempo = el('p', 'rx-gal-tempo', nivel); tempo.hidden = !nivel;
    li.append(topo, el('h3', undefined, p.nome), el('p', 'rx-gal-esp', limpa(p.cargo || '')), tempo, tags);
    return li;
  }
  function mostrar(lista: Perfil[], exemplo: boolean) {
    if (lista.length < MINIMO) return;
    // card convite no fim da galeria: abre o cadastro
    const voce = el('li', 'rx-gal-voce');
    const link = el('a'); link.href = '/rede-parceiros/cadastro/';
    link.innerHTML = '<span class="rx-gal-voce-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg></span><strong>Você aqui</strong><span class="rx-gal-voce-txt">Faça parte da rede e apareça na galeria.</span><span class="rx-gal-voce-cta">Quero ser parceiro<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>';
    voce.appendChild(link);
    grade!.replaceChildren(...lista.map(card), voce);
    secao!.querySelector<HTMLElement>('.rx-gal-aviso')!.hidden = !exemplo;
    secao!.hidden = false;
  }
  if (new URLSearchParams(location.search).get('galeria') === 'exemplo') {
    const f = (nome: string, av: number | null, cargo: string, areas: string[], segmentos: string[], tempo = 'Entre 6 e 10 anos'): Perfil =>
      ({ nome, cargo, tempo, areas, segmentos, linkedin: 'https://www.linkedin.com/', foto_url: av ? `${location.origin}/rede-parceiros/avatares/avatar-${av}.webp` : null });
    mostrar([
      f('Marina Alves', 5, 'UX Researcher', ['Pesquisa com usuários', 'UX Research', 'Facilitação'], ['Saúde', 'Educação']),
      f('Rafael Costa', 2, 'Service Designer', ['Service Design', 'CX', 'Design Estratégico'], ['Hospitalidade', 'Varejo']),
      f('Juliana Prado', 3, 'Product Designer', ['Product Design', 'UX/UI', 'Design Systems'], ['Serviços financeiros', 'Tecnologia']),
      f('Diego Moreira', 4, 'Analista de Dados', ['Análise de dados', 'Business Intelligence'], ['Varejo', 'Indústria']),
      f('Camila Rocha', 1, 'Especialista em IA', ['IA aplicada a negócios', 'Automação de processos'], ['Indústria', 'Saúde']),
      f('Lucas Ferreira', null, 'Desenvolvedor Front-end', ['Desenvolvimento Front-end', 'Acessibilidade'], ['Educação', 'Tecnologia']),
    ], true);
    return;
  }
  fetch('https://lipfvnerohkaajegqvwr.supabase.co/rest/v1/rpc/galeria_publica', {
    method: 'POST',
    headers: { apikey: 'sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej', 'Content-Type': 'application/json' },
    body: '{}',
  }).then((r) => (r.ok ? r.json() : [])).then((d: Perfil[]) => mostrar(Array.isArray(d) ? d : [], false)).catch(() => {});
})();

/* ---------- Hero (desktop): o topo da etiqueta acompanha o topo da cabeça do grupo da foto ---------- */
{
  const texto = document.querySelector('.rp-hero-texto') as HTMLElement | null;
  const etiqueta = texto?.firstElementChild as HTMLElement | null;
  const sobe = document.querySelector('.rp-modelo-sobe') as HTMLElement | null;
  const foto = sobe?.querySelector('img') as HTMLImageElement | null;
  // A imagem tem 1111 px de largura; a cabeça mais alta começa a 141 px do topo do arquivo.
  const LARGURA = 1111, TOPO_CABECA = 141;
  const alinhar = () => {
    if (!texto || !etiqueta || !foto || !sobe) return;
    if (!matchMedia('(min-width: 1024px)').matches) { texto.style.removeProperty('--rp-hero-subida'); return; }
    texto.style.removeProperty('--rp-hero-subida');
    const ty = (el: Element | null) => { const t = el ? getComputedStyle(el).transform : 'none'; return t === 'none' ? 0 : new DOMMatrixReadOnly(t).m42; };
    const desloc = ty(sobe) + ty(sobe.parentElement);
    const cabeca = foto.getBoundingClientRect().top - desloc + TOPO_CABECA * (foto.clientWidth / LARGURA);
    // Só sobe o bloco de texto (deslocamento visual, sem mudar a altura do hero).
    // Em telas mais baixas (cabeça perto do menu) o texto fica 30 px abaixo da cabeça, para respirar.
    const folga = cabeca < 180 ? 30 : 0;
    const subida = etiqueta.getBoundingClientRect().top - cabeca - folga;
    if (subida > 0) texto.style.setProperty('--rp-hero-subida', Math.round(subida) + 'px');
  };
  if (foto) { if (foto.complete) alinhar(); else foto.addEventListener('load', alinhar, { once: true }); }
  let espera = 0;
  addEventListener('resize', () => { cancelAnimationFrame(espera); espera = requestAnimationFrame(alinhar); });
}

/* ---------- Hero (desktop): efeito janela — a foto do grupo fica parada enquanto o painel arredondado sobe na rolagem ---------- */
{
  const hero = document.querySelector('.rp-hero') as HTMLElement | null;
  const modelo = document.querySelector('.rp-hero-modelo') as HTMLElement | null;
  const desktop = matchMedia('(min-width: 1024px)');
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
  let agendado = false;
  const mover = () => {
    agendado = false;
    if (!hero || !modelo) return;
    if (!desktop.matches || reduzir.matches) { modelo.style.removeProperty('--rp-janela'); return; }
    const y = Math.max(0, Math.min(window.scrollY, hero.offsetHeight));
    modelo.style.setProperty('--rp-janela', y + 'px');
  };
  const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(mover); } };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir);
  mover();
}

/* ---------- Rolagem suave com o mouse (desktop), igual à do Projeto Piloto: a roda desliza com leve inércia ----------
   Só com mouse/trackpad em telas grandes; respeita "reduzir movimento"; não interfere em janelas, listas com rolagem
   própria, zoom (Ctrl + roda) nem quando a página está travada (janela de cadastro aberta). */
(() => {
  const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  let alvo = window.scrollY;
  let atual = window.scrollY;
  let animando = false;
  const max = () => document.documentElement.scrollHeight - window.innerHeight;
  const travada = () => {
    const h = getComputedStyle(document.documentElement).overflowY;
    const b = getComputedStyle(document.body).overflowY;
    return h === 'hidden' || b === 'hidden';
  };
  const rolaveis = (el: Element | null, dy: number) => {
    for (let n = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight) {
        if ((dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) || (dy < 0 && n.scrollTop > 0)) return true;
      }
      if (n.tagName === 'IFRAME' || n.tagName === 'TEXTAREA' || n.tagName === 'SELECT' || n.matches('dialog[open]')) return true;
    }
    return false;
  };
  let ultimo = 0;
  const passo = (t: number) => {
    const dt = ultimo ? Math.min(64, t - ultimo) : 16.7;
    ultimo = t;
    atual += (alvo - atual) * (1 - Math.pow(1 - 0.1, dt / 16.7));
    if (Math.abs(alvo - atual) < 0.5) atual = alvo;
    window.scrollTo(0, atual);
    if (atual !== alvo) requestAnimationFrame(passo);
    else { animando = false; ultimo = 0; document.documentElement.style.scrollBehavior = ''; }
  };
  window.addEventListener('wheel', (e) => {
    if (!desktop.matches || reduzir.matches || e.ctrlKey || e.defaultPrevented || travada()) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.target instanceof Element && rolaveis(e.target, e.deltaY)) return;
    e.preventDefault();
    const fator = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
    if (!animando) { atual = window.scrollY; alvo = atual; }
    alvo = Math.max(0, Math.min(max(), alvo + e.deltaY * fator));
    if (!animando) { animando = true; document.documentElement.style.scrollBehavior = 'auto'; requestAnimationFrame(passo); }
  }, { passive: false });
  window.addEventListener('scroll', () => { if (!animando) { atual = alvo = window.scrollY; } }, { passive: true });
})();

/* ---------- Celular e tablet: mesma navegação do Projeto Piloto — o topo (hero) fica fixo atrás do menu; a folha branca
   do conteúdo sobe por cima, prende logo abaixo do menu (tampa arredondada parada) e o conteúdo rola por baixo dela ---------- */
(() => {
  const h = document.getElementById('site-header');
  const hero = document.querySelector<HTMLElement>('.rp-hero');
  const folha = document.querySelector<HTMLElement>('.rx-folha');
  if (!h || !hero || !folha) return;
  const pequeno = window.matchMedia('(max-width: 1023px)');
  const espaco = document.createElement('div');
  espaco.className = 'rp-hero-espaco';
  espaco.setAttribute('aria-hidden', 'true');
  hero.after(espaco);
  const tampa = document.createElement('div');
  tampa.className = 'rp-tampa';
  tampa.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tampa);
  const raiz = document.documentElement;
  let agendado = false;
  const f = () => {
    agendado = false;
    if (!pequeno.matches) { raiz.style.removeProperty('--rp-tampa'); espaco.style.height = ''; return; }
    // o hero é fixo a partir do topo da tela; o espaço começa abaixo do cabeçalho, então desconta essa diferença
    espaco.style.height = `${Math.max(0, hero.offsetHeight - (espaco.getBoundingClientRect().top + window.scrollY))}px`;
    const topo = Math.max(folha.getBoundingClientRect().top, h.offsetHeight);
    raiz.style.setProperty('--rp-tampa', `${Math.round(topo)}px`);
  };
  f();
  window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(f); } }, { passive: true });
  window.addEventListener('resize', f);
  if ('ResizeObserver' in window) new ResizeObserver(f).observe(hero);
})();

/* ---------- "Onde buscamos": carrossel de setores (setas, pontos, arrastar e teclado) ---------- */
{
  const trilha = document.querySelector<HTMLElement>('.rx-setores-trilha');
  const pontos = document.querySelector<HTMLElement>('.rx-setores-pontos');
  const pos = document.querySelector<HTMLElement>('.rx-setores-pos');
  if (trilha && pontos && pos) {
    const slides = Array.from(trilha.querySelectorAll<HTMLElement>('.rx-setor-slide'));
    const nome = (s: HTMLElement) => s.querySelector('h3')?.textContent || '';
    // posição de rolagem que deixa o card no centro da trilha
    const alvo = (sl: HTMLElement) => sl.offsetLeft - trilha.offsetLeft - (trilha.clientWidth - sl.offsetWidth) / 2;
    const atual = () => {
      let melhor = 0;
      slides.forEach((sl, i) => { if (Math.abs(alvo(sl) - trilha.scrollLeft) < Math.abs(alvo(slides[melhor]) - trilha.scrollLeft)) melhor = i; });
      return melhor;
    };
    const ir = (i: number) => {
      const n = (i + slides.length) % slides.length;
      trilha.scrollTo({ left: alvo(slides[n]) });
    };
    slides.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', `Ir para ${nome(s)}`); b.tabIndex = -1;
      b.addEventListener('click', () => ir(i));
      pontos.appendChild(b);
    });
    const marcar = () => {
      const a = atual();
      Array.from(pontos.children).forEach((b, i) => b.setAttribute('aria-current', String(i === a)));
      pos.textContent = `${a + 1} de ${slides.length} · ${nome(slides[a])}`;
    };
    document.querySelectorAll<HTMLButtonElement>('.rx-setores-seta').forEach((b) => b.addEventListener('click', () => ir(atual() + Number(b.dataset.dir))));
    trilha.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); ir(atual() + (e.key === 'ArrowRight' ? 1 : -1)); } });
    let pedido = 0;
    trilha.addEventListener('scroll', () => { cancelAnimationFrame(pedido); pedido = requestAnimationFrame(marcar); }, { passive: true });
    addEventListener('resize', marcar);
    marcar();
  }
}


/* ---------- Ecossistema: entrada animada (núcleo → pétalas → luz dá uma volta e revela os setores um a um) ----------
   A luz parte do topo em sentido horário; cada setor (--t = posição no anel, de 0 a 1) aparece no instante em que ela
   passa, aceso por um momento. Depois da volta completa, a luz some e tudo fica parado. */
{
  const eco = document.querySelector<HTMLElement>('[data-eco]');
  const luz = eco?.querySelector<SVGGElement>('.rx-eco-luz');
  if (eco && luz && !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    eco.classList.add('anima');
    const VOLTA = 7000, ACESO = 700, INICIO_LUZ = 2000; // a luz começa depois das pétalas (≈1,9 s)
    const pontos = Array.from(eco.querySelectorAll<SVGCircleElement>('.rx-eco-ponto'));
    const setores = Array.from(eco.querySelectorAll<HTMLElement>('.rx-eco-setor'));
    const linhas = Array.from(eco.querySelectorAll<SVGLineElement>('.rx-eco-con'));
    const pos = pontos.map((p) => parseFloat(p.style.getPropertyValue('--t')) || 0);
    luz.style.animation = 'none';
    const revelar = (i: number) => {
      [pontos[i], setores[i], linhas[i]].forEach((el) => el?.classList.add('mostrado', 'aceso'));
      setTimeout(() => [pontos[i], setores[i], linhas[i]].forEach((el) => el?.classList.remove('aceso')), ACESO);
    };
    const girar = () => {
      luz.classList.add('ativa');
      const feitos = new Set<number>();
      let inicio = 0;
      const quadro = (agora: number) => {
        if (!inicio) inicio = agora;
        const f = Math.min((agora - inicio) / VOLTA, 1);
        luz.style.transform = `rotate(${(f * 360).toFixed(2)}deg)`;
        pos.forEach((t, i) => { if (!feitos.has(i) && f >= t) { feitos.add(i); revelar(i); } });
        if (f < 1) requestAnimationFrame(quadro);
        else luz.classList.remove('ativa');
      };
      requestAnimationFrame(quadro);
    };
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      eco.classList.add('visivel');
      setTimeout(girar, INICIO_LUZ);
    }, { threshold: 0.25 });
    obs.observe(eco);
  }
}

/* ---------- "O que é a rede": feixes animados entre Contato → Relacionamento → Indicação (estilo Animated Beam) ----------
   Linha reta entre um ícone e o próximo (horizontal no computador, vertical no celular). O feixe é um gradiente que
   desliza ao longo da linha: some nas pontas e brilha no meio, com um halo suave. O segundo sai quando o primeiro chega. */
{
  const lista = document.querySelector<HTMLElement>('[data-feixe]');
  const svg = lista?.querySelector<SVGSVGElement>('.rx-pilares-svg');
  if (lista && svg) {
    const ics = Array.from(lista.querySelectorAll<HTMLElement>('.rx-pilar-ic'));
    const NS = 'http://www.w3.org/2000/svg';
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CICLO = 3.6, VIAGEM = 1.8; // segundos: cada feixe atravessa em 1,8 s; o próximo sai quando ele chega
    const desenhar = () => {
      const r = lista.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      svg.replaceChildren();
      const defs = document.createElementNS(NS, 'defs');
      defs.innerHTML = '<filter id="rxFeixeHalo" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>';
      svg.appendChild(defs);
      for (let i = 0; i < ics.length - 1; i++) {
        const a = ics[i].getBoundingClientRect(), b = ics[i + 1].getBoundingClientRect();
        const vertical = Math.abs(b.top - a.top) > Math.abs(b.left - a.left);
        const ax = a.left + a.width / 2 - r.left, ay = a.top + a.height / 2 - r.top, bx = b.left + b.width / 2 - r.left, by = b.top + b.height / 2 - r.top;
        const ra = a.width / 2 + 4, rb = b.width / 2 + 4;
        const [x1, y1, x2, y2] = vertical ? [ax, ay + ra, bx, by - rb] : [ax + ra, ay, bx - rb, by];
        const d = `M ${x1} ${y1} L ${x2} ${y2}`;
        const base = document.createElementNS(NS, 'path'); base.setAttribute('d', d); base.setAttribute('class', 'rx-feixe-base');
        svg.appendChild(base);
        if (reduzir) continue;
        // gradiente que desliza: transparente → rosa → vermelho → transparente, com comprimento L
        const comp = vertical ? y2 - y1 : x2 - x1, L = Math.max(60, comp * 0.35);
        const eixo = vertical ? ['y1', 'y2'] : ['x1', 'x2'], ini = vertical ? y1 : x1, fim = vertical ? y2 : x2;
        const g = document.createElementNS(NS, 'linearGradient');
        g.setAttribute('id', `rxFeixe${i}`); g.setAttribute('gradientUnits', 'userSpaceOnUse');
        g.setAttribute('x1', String(vertical ? x1 : ini - L)); g.setAttribute('x2', String(vertical ? x1 : ini));
        g.setAttribute('y1', String(vertical ? ini - L : y1)); g.setAttribute('y2', String(vertical ? ini : y1));
        g.innerHTML = '<stop offset="0" stop-color="#D44D4D" stop-opacity="0"/><stop offset=".55" stop-color="#F0A3A3" stop-opacity=".9"/><stop offset=".9" stop-color="#D44D4D"/><stop offset="1" stop-color="#D44D4D" stop-opacity="0"/>';
        const k = (VIAGEM / CICLO).toFixed(3);
        [[eixo[0], ini - L, fim], [eixo[1], ini, fim + L]].forEach(([attr, de, ate]) => {
          const an = document.createElementNS(NS, 'animate');
          an.setAttribute('attributeName', String(attr)); an.setAttribute('values', `${de};${ate};${ate}`); an.setAttribute('keyTimes', `0;${k};1`);
          an.setAttribute('keySplines', '.45 0 .55 1;0 0 1 1'); an.setAttribute('calcMode', 'spline');
          an.setAttribute('dur', `${CICLO}s`); an.setAttribute('begin', `${i * VIAGEM}s`); an.setAttribute('repeatCount', 'indefinite');
          g.appendChild(an);
        });
        defs.appendChild(g);
        const halo = document.createElementNS(NS, 'path'); halo.setAttribute('d', d); halo.setAttribute('class', 'rx-feixe-halo'); halo.setAttribute('stroke', `url(#rxFeixe${i})`); halo.setAttribute('filter', 'url(#rxFeixeHalo)');
        const feixe = document.createElementNS(NS, 'path'); feixe.setAttribute('d', d); feixe.setAttribute('class', 'rx-feixe'); feixe.setAttribute('stroke', `url(#rxFeixe${i})`);
        svg.append(halo, feixe);
      }
    };
    new ResizeObserver(desenhar).observe(lista);
    desenhar();
  }
}

/* ---------- "O que é a rede": animação dos cards em sequência ---------- */
/* Sequência por card (2,6 s cada): a luz dá a volta na borda → o ícone do canto pisca → o feixe percorre a linha até o
   próximo card → o próximo card repete. Depois do 3º, o ciclo recomeça no 1º. */
document.querySelectorAll<HTMLElement>('.rx-pilares .rx-pilar').forEach((li, i, todos) => {
  li.style.setProperty('--i', String(i));
  const b = document.createElement('span');
  b.className = 'rx-pilar-borda';
  b.setAttribute('aria-hidden', 'true');
  li.appendChild(b);
  if (i < todos.length - 1) {
    const f = document.createElement('span');
    f.className = 'rx-pilar-feixe';
    f.setAttribute('aria-hidden', 'true');
    li.appendChild(f);
  }
});

/* ---------- Match de profissionais: à esquerda um resumo em texto e tópicos (o tópico da etapa em cena fica em destaque); à direita a cena da etapa ----------
   Troca sozinha (6,5 s por etapa; 10 s na última, a do kanban) com a barrinha de progresso no ponto ativo. A pessoa pode
   ir e voltar pelas setas e pelos pontos e pausar; o mouse sobre o componente também pausa. Só roda quando está na tela. */
(() => {
  const palco = document.querySelector<HTMLElement>('[data-match]');
  if (!palco) return;
  const txts = Array.from(palco.querySelectorAll<HTMLElement>('.rx-mt-txt'));
  const cenas = Array.from(palco.querySelectorAll<HTMLElement>('.rx-mt-cena'));
  const topicos = Array.from(palco.querySelectorAll<HTMLButtonElement>('.rx-mt-topico'));
  const NOMES = ['Cadastro', 'Base de parceiros', 'Novo projeto', 'Cruzamento com IA', 'Qualificação', 'Contato e alinhamento', 'Ranking de compatibilidade', 'O trabalho acontece'];
  const agoraN = palco.querySelector<HTMLElement>('.rx-mt-agora-n');
  const agoraT = palco.querySelector<HTMLElement>('.rx-mt-agora-t');
  const barra = palco.querySelector<HTMLElement>('.rx-mt-agora');
  const pausa = palco.querySelector<HTMLButtonElement>('.rx-mt-pausa')!;
  const total = cenas.length;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = (n: number) => (n === total ? 10000 : 6500);
  let atual = 1, decorrido = 0, pausado = reduzir, sobre = false, visivel = false, ultimo = 0;
  const mostrar = (n: number) => {
    const antes = atual;
    atual = ((n - 1 + total) % total) + 1;
    // da base de parceiros (2) para o novo projeto (3) a tela é a mesma: troca direta, sem o esmaecer
    palco.classList.toggle('direto', antes === 2 && atual === 3);
    decorrido = 0;
    palco.dataset.n = String(atual);
    [txts, cenas].forEach((g) => g.forEach((e) => {
      const on = Number(e.dataset.n) === atual;
      // reinicia as animações da cena: tira e devolve a classe
      if (on) { e.classList.remove('ativa'); void e.offsetWidth; }
      e.classList.toggle('ativa', on);
    }));
    topicos.forEach((t) => { const on = (t.dataset.etapas || '').split(',').map(Number).includes(atual); t.classList.toggle('ativa', on); t.setAttribute('aria-current', on ? 'step' : 'false'); });
    if (agoraN) agoraN.textContent = `Etapa ${String(atual).padStart(2, '0')} de ${String(total).padStart(2, '0')}`;
    if (agoraT) agoraT.textContent = NOMES[atual - 1] || '';
    barra?.style.setProperty('--pn', '0');
  };
  const atualizarPausa = () => { pausa.textContent = pausado ? 'Retomar' : 'Pausar'; pausa.setAttribute('aria-pressed', String(pausado)); };
  palco.querySelectorAll<HTMLButtonElement>('[data-passo]').forEach((b) => b.addEventListener('click', () => mostrar(atual + Number(b.dataset.passo))));
  topicos.forEach((t) => t.addEventListener('click', () => mostrar(Number(t.dataset.ir))));
  pausa.addEventListener('click', () => { pausado = !pausado; atualizarPausa(); });
  palco.addEventListener('mouseenter', () => { sobre = true; });
  palco.addEventListener('mouseleave', () => { sobre = false; });
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.35 }).observe(palco);
  const passo = (t: number) => {
    const dt = ultimo ? Math.min(100, t - ultimo) : 0;
    ultimo = t;
    if (!pausado && !sobre && visivel && !document.hidden) {
      decorrido += dt;
      barra?.style.setProperty('--pn', String(Math.min(1, decorrido / DUR(atual))));
      if (decorrido >= DUR(atual)) mostrar(atual + 1);
    }
    requestAnimationFrame(passo);
  };
  mostrar(1);
  atualizarPausa();
  requestAnimationFrame(passo);
})();
