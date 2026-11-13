import './projeto-piloto.css';
import './compartilhado/menu';

/* Mesmo projeto Supabase e mesma chave publicável já usados no formulário de contato da página inicial.
   A tabela parceiro_piloto só aceita inserção pelo site (RLS); a leitura é restrita ao admin. */
const SUPABASE_URL = 'https://lipfvnerohkaajegqvwr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej';
const TABELA = 'parceiro_piloto';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEMPO_LIMITE_MS = 15000;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/* ---------- Accordion do Guia (um aberto por vez) ---------- */
const itens = Array.from(document.querySelectorAll<HTMLElement>('.accordion-item'));
function definirAberto(item: HTMLElement, aberto: boolean) {
  const botao = item.querySelector<HTMLButtonElement>('.accordion-trigger')!;
  const painel = item.querySelector<HTMLElement>('.accordion-content')!;
  item.classList.toggle('active', aberto);
  botao.setAttribute('aria-expanded', String(aberto));
  painel.toggleAttribute('inert', !aberto);
}
itens.forEach((item) => {
  item.querySelector('.accordion-trigger')!.addEventListener('click', () => {
    const abrir = !item.classList.contains('active');
    itens.forEach((outro) => definirAberto(outro, outro === item ? abrir : false));
  });
});
if (itens[0]) definirAberto(itens[0], true);

/* ---------- Formulário ---------- */
const form = $<HTMLFormElement>('form-piloto');
const botao = $<HTMLButtonElement>('form-enviar');
const botaoTexto = $('form-enviar-texto');
const erroGeral = $('form-erro-geral');
const sucesso = $('form-sucesso');
const iconeEnviando = botao.querySelector<SVGElement>('[data-estado="enviando"]')!;
const iconeParado = botao.querySelector<SVGElement>('[data-estado="parado"]')!;

/* Identificador do envio: o mesmo valor é reaproveitado se a pessoa reenviar após uma falha de rede,
   e a coluna é única no banco, então o cadastro nunca é gravado duas vezes. */
let envioId = crypto.randomUUID();
let enviando = false;

type Campo = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const campo = (id: string) => $<Campo>(id);

function mostrarErro(id: string, msg: string) {
  const el = campo(id);
  const p = $(`${id}-erro`);
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  p.textContent = msg;
  p.classList.toggle('hidden', !msg);
}

function validar(): string[] {
  const erros: string[] = [];
  const checar = (id: string, msg: string, ok: boolean) => {
    mostrarErro(id, ok ? '' : msg);
    if (!ok) erros.push(id);
  };
  const v = (id: string) => campo(id).value.trim();
  checar('nome', 'Informe o nome do responsável.', v('nome').length >= 2);
  checar('email', 'Informe um e-mail válido.', EMAIL_RE.test(v('email')));
  const digitos = v('telefone').replace(/\D/g, '');
  checar('telefone', 'Informe um telefone com DDD.', digitos.length >= 10 && digitos.length <= 13);
  checar('empresa', 'Informe o nome da empresa.', v('empresa').length >= 1);
  checar('segmento', 'Selecione o segmento de atuação.', v('segmento') !== '');
  checar('cidade', 'Informe a cidade e o estado.', v('cidade').length >= 2);
  checar('desafio', 'Use no máximo 2.000 caracteres.', v('desafio').length <= 2000);
  checar('consentimento', 'Para continuar, aceite a Política de Privacidade.', $<HTMLInputElement>('consentimento').checked);
  return erros;
}

function estadoEnviando(sim: boolean) {
  enviando = sim;
  botao.disabled = sim;
  botao.setAttribute('aria-busy', String(sim));
  botaoTexto.textContent = sim ? 'Enviando cadastro…' : 'Enviar cadastro';
  iconeEnviando.classList.toggle('hidden', !sim);
  iconeParado.classList.toggle('hidden', sim);
}

function mostrarErroGeral(msg: string) {
  erroGeral.textContent = msg;
  erroGeral.classList.toggle('hidden', !msg);
}

async function enviar(linha: Record<string, unknown>) {
  const controle = new AbortController();
  const timer = window.setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(linha),
      signal: controle.signal,
    });
    // 409: este mesmo envio já tinha sido gravado (reenvio após falha de rede).
    if (res.ok || res.status === 409) return;
    throw new Error(`HTTP ${res.status}`);
  } finally {
    window.clearTimeout(timer);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (enviando) return;
  mostrarErroGeral('');

  const erros = validar();
  if (erros.length) {
    mostrarErroGeral(erros.length === 1 ? 'Corrija o campo destacado para continuar.' : `Corrija os ${erros.length} campos destacados para continuar.`);
    campo(erros[0]).focus();
    return;
  }

  const v = (id: string) => campo(id).value.trim();
  const linha = {
    envio_id: envioId,
    nome: v('nome'),
    email: v('email'),
    telefone: v('telefone'),
    empresa: v('empresa'),
    segmento: v('segmento'),
    cidade_estado: v('cidade'),
    desafio: v('desafio') || null,
    frente: v('frente') || null,
    consentimento: true,
  };

  estadoEnviando(true);
  try {
    await enviar(linha);
    (window as any).dmEvento?.('cadastro_projeto_piloto');
    form.reset();
    envioId = crypto.randomUUID();
    form.classList.add('hidden');
    document.getElementById('cadastro-rodape')?.classList.add('hidden');
    sucesso.classList.remove('hidden');
    sucesso.focus();
  } catch {
    mostrarErroGeral('Não foi possível enviar o cadastro agora. Verifique sua conexão e tente novamente. Seus dados continuam preenchidos.');
    botao.focus();
  } finally {
    estadoEnviando(false);
  }
});

/* Limpa o erro do campo assim que a pessoa corrige */
form.addEventListener('input', (e) => {
  const alvo = e.target as Campo;
  if (alvo.id && alvo.getAttribute('aria-invalid') === 'true') mostrarErro(alvo.id, '');
});
form.addEventListener('change', (e) => {
  const alvo = e.target as Campo;
  if (alvo.id && alvo.getAttribute('aria-invalid') === 'true') mostrarErro(alvo.id, '');
});

/* ---------- Animações ao rolar (Motion do design system) ----------
   Cada bloco entra quando chega na tela. Ao rolar para cima, o que volta a ficar abaixo da tela
   é recolhido e anima de novo na próxima descida (mesmo comportamento da página do Experience Intelligence 3). */
(() => {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir || !('IntersectionObserver' in window)) return;
  document.body.classList.add('anima-pronto');
  const alvos = document.querySelectorAll<HTMLElement>('.rv, .rv-cabecalho, .rv-grupo, .cf-etapa');
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      const el = e.target as HTMLElement;
      if (e.isIntersecting) el.classList.add('visivel');
      else if (e.boundingClientRect.top > window.innerHeight) el.classList.remove('visivel');
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  alvos.forEach((el) => obs.observe(el));
  // Pulos grandes de rolagem (ex.: "Voltar ao início") não disparam o observador para o que estava acima da tela.
  let agendado = false;
  const recolher = () => {
    agendado = false;
    alvos.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (el.classList.contains('visivel') && r.top > window.innerHeight) el.classList.remove('visivel');
      // Rolagem rápida pode pular um bloco sem disparar o observador: o que já ficou acima da tela aparece.
      else if (!el.classList.contains('visivel') && r.bottom < 0) el.classList.add('visivel');
    });
  };
  window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(recolher); } }, { passive: true });
})();

/* ---------- Linha do tempo: etapa atual, etapas feitas e linha preenchida conforme a rolagem ---------- */
(() => {
  const lista = document.querySelector<HTMLElement>('.cf-etapas');
  const linha = document.querySelector<HTMLElement>('.cf-linha');
  if (!lista || !linha) return;
  const etapas = Array.from(lista.querySelectorAll<HTMLElement>('.cf-etapa'));
  const trilho = linha.parentElement!;
  let agendado = false;
  // O trilho começa no centro do primeiro ícone e termina no centro do último.
  const ajustarTrilho = () => {
    const pai = trilho.offsetParent as HTMLElement | null;
    const nums = etapas.filter((e) => e.offsetParent).map((e) => e.querySelector<HTMLElement>('.cf-num')!);
    if (!pai || !nums.length) return;
    const base = pai.getBoundingClientRect().top;
    const centro = (n: HTMLElement) => { const r = n.getBoundingClientRect(); return r.top + r.height / 2 - base; };
    const ini = centro(nums[0]), fim = centro(nums[nums.length - 1]);
    trilho.style.top = `${ini}px`;
    trilho.style.bottom = 'auto';
    trilho.style.height = `${Math.max(0, fim - ini)}px`;
  };
  const atualizar = () => {
    agendado = false;
    ajustarTrilho();
    const limite = window.innerHeight * 0.6;
    let atual = -1;
    etapas.forEach((e, i) => {
      if (!e.offsetParent) return;
      const r = e.querySelector('.cf-num')!.getBoundingClientRect();
      if (r.top + r.height / 2 < limite) atual = i;
    });
    etapas.forEach((e, i) => {
      e.classList.toggle('feita', i < atual);
      e.classList.toggle('atual', i === atual);
    });
    const t = trilho.getBoundingClientRect();
    const progresso = Math.min(1, Math.max(0, (limite - t.top) / t.height));
    linha.style.setProperty('--progresso', progresso.toFixed(3));
  };
  const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(atualizar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  atualizar();
})();



/* ---------- Escopo: luz que segue o cursor e ordem da cascata ---------- */
(() => {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.card-frente'));
  cards.forEach((card, i) => {
    card.style.setProperty('--i', String(i));
    card.querySelectorAll<HTMLElement>('.tag-frente').forEach((t, j) => t.style.setProperty('--t', String(j)));
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();

/* ---------- Botão flutuante "Cadastrar empresa" ---------- */
(() => {
  const btn = document.getElementById('cta-flutuante');
  const hero = document.getElementById('hero');
  const form = document.getElementById('inscricao');
  if (!btn || !hero || !form || !('IntersectionObserver' in window)) return;
  let heroVisivel = true, formVisivel = false;
  const celular = window.matchMedia('(max-width: 767px)'); // no celular ele fica sempre no rodapé, ao lado do WhatsApp
  const atualizar = () => {
    const mostrar = (celular.matches || !heroVisivel) && !formVisivel;
    btn.classList.toggle('visivel', mostrar);
    btn.setAttribute('aria-hidden', String(!mostrar));
    btn.tabIndex = mostrar ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.15 }).observe(hero);
  new IntersectionObserver(([e]) => { formVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.1 }).observe(form);
  celular.addEventListener('change', atualizar);
  atualizar();
})();

// Botão "subir": aparece quando o rodapé entra na tela e leva de volta ao topo.
(() => {
  const btn = document.getElementById('botao-subir');
  const rodape = document.querySelector('footer');
  if (!btn || !rodape || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => {
    const mostrar = e.isIntersecting;
    btn.classList.toggle('visivel', mostrar);
    btn.setAttribute('aria-hidden', String(!mostrar));
    btn.tabIndex = mostrar ? 0 : -1;
  }, { threshold: 0.1 }).observe(rodape);
  btn.addEventListener('click', () => {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
  });
})();

// Celular: "Para sua empresa" e "Para o Studio" viram duas abas (padrão Tabs do DS), dentro de um card branco.
(() => {
  const lados = Array.from(document.querySelectorAll<HTMLElement>('#sobre-o-programa .lado-troca'));
  const grade = document.querySelector<HTMLElement>('#sobre-o-programa .troca-grade');
  if (lados.length !== 2 || !grade) return;
  const mq = window.matchMedia('(max-width: 767px)');
  const lista = document.createElement('div');
  lista.className = 'sobre-abas';
  lista.setAttribute('role', 'tablist');
  lista.setAttribute('aria-label', 'Para quem é o programa');
  const abas = lados.map((lado, i) => {
    lado.id ||= `lado-sobre-${i + 1}`;
    const rotulo = (lado.firstElementChild?.querySelector('p')?.textContent || '').trim();
    const aba = document.createElement('button');
    aba.type = 'button';
    aba.id = `aba-sobre-${i + 1}`;
    aba.className = 'sobre-aba';
    aba.textContent = ['Para sua empresa', 'Para o Studio'][i] || rotulo;
    aba.addEventListener('click', () => selecionar(i, false));
    lista.appendChild(aba);
    return aba;
  });
  lista.addEventListener('keydown', (e) => {
    const atual = abas.findIndex((a) => a.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); selecionar((atual + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length, true); }
  });
  grade.parentElement!.insertBefore(lista, grade);
  function selecionar(i: number, focar: boolean) {
    abas.forEach((aba, j) => {
      const ativa = i === j;
      aba.setAttribute('aria-selected', String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
      lados[j].classList.toggle('aba-oculta', !ativa);
    });
    if (focar) abas[i].focus();
  }
  const aplicar = () => {
    if (mq.matches) {
      lista.hidden = false;
      lados.forEach((lado, i) => { lado.setAttribute('role', 'tabpanel'); lado.setAttribute('aria-labelledby', abas[i].id); abas[i].setAttribute('aria-controls', lado.id); });
      selecionar(abas.findIndex((a) => a.getAttribute('aria-selected') === 'true') < 0 ? 0 : abas.findIndex((a) => a.getAttribute('aria-selected') === 'true'), false);
    } else {
      lista.hidden = true;
      lados.forEach((lado) => { lado.classList.remove('aba-oculta'); lado.removeAttribute('role'); lado.removeAttribute('aria-labelledby'); });
    }
  };
  aplicar();
  mq.addEventListener('change', aplicar);
})();

/* ---------- Gaveta do cadastro: abre pelo card de convite e por qualquer link para #inscricao ---------- */
(() => {
  const gaveta = document.getElementById('cadastro-gaveta');
  const fundo = document.getElementById('cadastro-fundo');
  if (!gaveta || !fundo) return;
  let origem: HTMLElement | null = null;
  const aberta = () => !gaveta.classList.contains('translate-x-full');
  const abrir = (de?: HTMLElement | null) => {
    origem = de ?? (document.activeElement as HTMLElement | null);
    (window as any).dmEvento?.('cadastro_piloto_aberto');
    gaveta.classList.remove('invisible');
    requestAnimationFrame(() => { fundo.classList.remove('pointer-events-none', 'opacity-0'); gaveta.classList.remove('translate-x-full'); });
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (!document.getElementById('form-piloto')?.classList.contains('hidden')) gaveta.querySelector<HTMLElement>('input, select, textarea')?.focus(); }, 300);
  };
  const fechar = () => {
    gaveta.classList.add('translate-x-full');
    fundo.classList.add('opacity-0');
    setTimeout(() => {
      fundo.classList.add('pointer-events-none');
      gaveta.classList.add('invisible');
      document.body.style.overflow = '';
      if (origem && origem.offsetParent) origem.focus();
    }, 300);
  };
  document.addEventListener('click', (e) => {
    const alvo = (e.target as HTMLElement).closest<HTMLElement>('[data-abrir-cadastro], a[href="#inscricao"]');
    if (!alvo || gaveta.contains(alvo)) return;
    e.preventDefault();
    abrir(alvo);
  });
  document.getElementById('cadastro-fechar')?.addEventListener('click', fechar);
  fundo.addEventListener('click', fechar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aberta() && !document.querySelector('dialog[open]')) fechar();
    if (e.key === 'Tab' && aberta()) {
      const focaveis = Array.from(gaveta.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea')).filter((el) => el.offsetParent);
      if (!focaveis.length) return;
      const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });
  if (location.hash === '#inscricao' || location.hash === '#cadastro') setTimeout(() => abrir(null), 400);
})();

/* ---------- Rolagem suave com o mouse (desktop): a roda do mouse desliza com leve inércia em vez de dar saltos ----------
   Só com mouse/trackpad em telas grandes; respeita "reduzir movimento"; não interfere em janelas, listas com rolagem própria,
   zoom (Ctrl + roda) nem quando a página está travada (modal aberta). */
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
  // algum elemento entre o alvo e a página consegue rolar nessa direção? então deixa o navegador cuidar
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
    // suavização independente da taxa de quadros (60 ou 120 Hz): ~0.1 por quadro a 60 Hz
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

  // rolagem por outros meios (teclado, barra, links internos): acompanha a posição real
  window.addEventListener('scroll', () => { if (!animando) { atual = alvo = window.scrollY; } }, { passive: true });
})();

/* ---------- Diagrama do programa: feixes animados (padrão "Animated Beam") ligando os dois lados ao núcleo ----------
   Desenha em SVG uma curva suave de cada participante até o "Projeto Piloto" e faz um feixe de luz percorrer a curva
   em direção ao núcleo. Recalcula ao redimensionar (no celular as curvas ficam verticais) e pausa fora da tela. */
(() => {
  const diag = document.querySelector<HTMLElement>('.pp-diagrama');
  const nucleo = diag?.querySelector<HTMLElement>('.pp-nucleo');
  const lados = diag ? Array.from(diag.querySelectorAll<HTMLElement>('.pp-no-lado .pp-anel')) : [];
  if (!diag || !nucleo || lados.length !== 2) return;
  const NS = 'http://www.w3.org/2000/svg';
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'pp-feixes');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  const defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);
  type Feixe = { base: SVGPathElement; luz: SVGPathElement; grad: SVGLinearGradientElement; s: [number, number]; e: [number, number]; atraso: number };
  const feixes: Feixe[] = lados.map((_, i) => {
    const grad = document.createElementNS(NS, 'linearGradient');
    grad.id = `pp-feixe-${i}`;
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    [['0', '#F9DADA', '0'], ['0.35', '#F9DADA', '1'], ['0.8', '#D44D4D', '1'], ['1', '#D44D4D', '0']].forEach(([o, c, op]) => {
      const st = document.createElementNS(NS, 'stop');
      st.setAttribute('offset', o); st.setAttribute('stop-color', c); st.setAttribute('stop-opacity', op);
      grad.appendChild(st);
    });
    defs.appendChild(grad);
    const base = document.createElementNS(NS, 'path');
    base.setAttribute('class', 'pp-feixe-base');
    const luz = document.createElementNS(NS, 'path');
    luz.setAttribute('class', 'pp-feixe-luz');
    luz.setAttribute('stroke', `url(#pp-feixe-${i})`);
    svg.append(base, luz);
    return { base, luz, grad, s: [0, 0], e: [0, 0], atraso: i * 0.5 };
  });
  diag.appendChild(svg);

  const centro = (el: HTMLElement, ref: DOMRect): [number, number, number] => {
    const r = el.getBoundingClientRect();
    return [r.left - ref.left + r.width / 2, r.top - ref.top + r.height / 2, r.width / 2];
  };
  const desenhar = () => {
    const ref = diag.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${ref.width} ${ref.height}`);
    svg.setAttribute('width', String(ref.width)); svg.setAttribute('height', String(ref.height));
    const [nx, ny, nr] = centro(nucleo, ref);
    feixes.forEach((f, i) => {
      const [ax, ay, ar] = centro(lados[i], ref);
      const dx = nx - ax, dy = ny - ay, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const s: [number, number] = [ax + ux * (ar + 10), ay + uy * (ar + 10)];
      const e: [number, number] = [nx - ux * (nr + 16), ny - uy * (nr + 16)];
      const vertical = Math.abs(dy) > Math.abs(dx);
      if (vertical) {
        // celular: o feixe corre no espaço entre os blocos, sem atravessar os textos
        const blocoLado = lados[i].closest<HTMLElement>('.pp-no')!.getBoundingClientRect();
        const blocoCentro = nucleo.closest<HTMLElement>('.pp-no')!.getBoundingClientRect();
        const x = nx;
        if (ay < ny) { s[0] = x; s[1] = blocoLado.bottom - ref.top + 10; e[0] = x; e[1] = ny - nr - 34; }
        else { s[0] = x; s[1] = ay - ar - 14; e[0] = x; e[1] = blocoCentro.bottom - ref.top + 10; }
      }
      const curva = (i === 0 ? -1 : 1) * Math.min(48, d * 0.18);
      const cx = (s[0] + e[0]) / 2 + (vertical ? curva : 0);
      const cy = (s[1] + e[1]) / 2 + (vertical ? 0 : -Math.abs(curva));
      const dPath = `M ${s[0]},${s[1]} Q ${cx},${cy} ${e[0]},${e[1]}`;
      f.base.setAttribute('d', dPath); f.luz.setAttribute('d', dPath);
      f.s = s; f.e = e;
    });
  };
  // posição do feixe: a "cabeça" vai do participante até o núcleo; a cauda vem 30% atrás
  const posicionar = (f: Feixe, t: number) => {
    const p = -0.3 + 1.6 * t;
    const head = [f.s[0] + (f.e[0] - f.s[0]) * p, f.s[1] + (f.e[1] - f.s[1]) * p];
    const tail = [head[0] - (f.e[0] - f.s[0]) * 0.45, head[1] - (f.e[1] - f.s[1]) * 0.45];
    f.grad.setAttribute('x1', String(tail[0])); f.grad.setAttribute('y1', String(tail[1]));
    f.grad.setAttribute('x2', String(head[0])); f.grad.setAttribute('y2', String(head[1]));
  };
  const DUR = 3.2;
  let visivel = false, raf = 0, t0 = 0;
  const quadro = (t: number) => {
    if (!t0) t0 = t;
    const seg = (t - t0) / 1000;
    feixes.forEach((f) => { posicionar(f, (((seg - f.atraso) % DUR) + DUR) % DUR / DUR); });
    raf = visivel ? requestAnimationFrame(quadro) : 0;
  };
  const iniciar = () => {
    desenhar();
    if (reduzir.matches) { feixes.forEach((f) => posicionar(f, 0.6)); return; }
    if (visivel && !raf) raf = requestAnimationFrame(quadro);
  };
  new ResizeObserver(() => desenhar()).observe(diag);
  new IntersectionObserver(([en]) => { visivel = en.isIntersecting; iniciar(); }).observe(diag);
  reduzir.addEventListener('change', iniciar);
  iniciar();
})();
