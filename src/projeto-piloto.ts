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
  botaoTexto.textContent = sim ? 'Enviando cadastro…' : 'Cadastrar minha empresa';
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
    const nums = etapas.map((e) => e.querySelector<HTMLElement>('.cf-num')!);
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

/* ---------- Botão flutuante "Cadastrar minha empresa" ---------- */
(() => {
  const btn = document.getElementById('cta-flutuante');
  const hero = document.getElementById('hero');
  const form = document.getElementById('inscricao');
  if (!btn || !hero || !form || !('IntersectionObserver' in window)) return;
  let heroVisivel = true, formVisivel = false;
  const atualizar = () => {
    const mostrar = !heroVisivel && !formVisivel;
    btn.classList.toggle('visivel', mostrar);
    btn.setAttribute('aria-hidden', String(!mostrar));
    btn.tabIndex = mostrar ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.15 }).observe(hero);
  new IntersectionObserver(([e]) => { formVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.1 }).observe(form);
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
